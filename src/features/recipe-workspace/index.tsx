"use client";

import React, { useState, useEffect } from "react";
import { UrlInput } from "./components/url-input";
import { AiCommandBar } from "./components/ai-command-bar";
import { RecipeSelector } from "./components/recipe-selector";
import { RecipeView } from "./components/recipe-view";
import { IngredientView } from "./components/ingredient-view";
import { GroceryOrderModal } from "./components/grocery-order-modal";
import type { RecipeData, Recipe } from "@/types/recipe";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, Link as LinkIcon, Utensils, User, Bookmark } from "lucide-react";
import { extractRecipe, ExtractRecipeResult } from "@/actions/extract-recipe";
import { modifyRecipe } from "@/actions/modify-recipe";
import { createPantryRecipe } from "@/actions/create-pantry-recipe";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { youtubeUrlSchema } from "@/lib/validation/youtube";

import { useSearchParams } from "next/navigation";

export function RecipeWorkspace() {
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<"recipe" | "ingredients">("recipe");
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState("");
  const [aiCommand, setAiCommand] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [recentRecipe, setRecentRecipe] = useState<{ id: string; title: string; imageUrl: string } | null>(null);
  const [mode, setSourceMode] = useState<"url" | "pantry">("url");
  const [pantryInput, setPantryInput] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const LOADING_MESSAGES = React.useMemo(() => [
    { text: "Reading the recipe transcript...", emoji: "📖" },
    { text: "Checking the video description...", emoji: "📋" },
    { text: "Our AI Chef is watching the video...", emoji: "🎬" },
    { text: "Almost there, extracting ingredients...", emoji: "🥄" },
    { text: "This one's complex, still cooking...", emoji: "⏳" },
  ], []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && mode === "url") {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
      }, 5000);
    }
    return () => {
      clearInterval(interval);
      if (!isLoading) setLoadingMessageIndex(0);
    };
  }, [isLoading, mode, LOADING_MESSAGES.length]);

  useEffect(() => {
    async function getInitialData() {
      // Check for mode in URL
      const modeParam = searchParams.get("mode");
      if (modeParam === "pantry") {
        setSourceMode("pantry");
      } else if (modeParam === "url") {
        setSourceMode("url");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }

      if (user) {
        // Fetch recent recipe for hero
        const { data: recentData } = await supabase
          .from("recipes")
          .select(`
            id,
            thumbnail_url,
            recipe_versions!fk_current_version ( recipe_data )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (recentData) {
          const versionData = (recentData.recipe_versions as unknown) as { recipe_data: RecipeData };
          setRecentRecipe({
            id: recentData.id,
            title: versionData?.recipe_data?.title || "Latest Creation",
            imageUrl: recentData.thumbnail_url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80"
          });
        }

        // Check for ID in URL
        const recipeId = searchParams.get("id");
        if (recipeId) {
          setIsLoading(true);
          const { data, error } = await supabase
            .from("recipes")
            .select(`
              id,
              original_url,
              thumbnail_url,
              current_version_id,
              recipe_versions!fk_current_version (
                id,
                recipe_data,
                version_number
              )
            `)
            .eq("id", recipeId)
            .single();

          if (data && !error) {
            const versionData = (data.recipe_versions as unknown) as { recipe_data: RecipeData; version_number: number };
            setRecipe({
              id: data.id,
              ...versionData.recipe_data,
              originalUrl: data.original_url,
              version: versionData.version_number
            });
            setExtractedUrl(data.original_url || "");
          }
          setIsLoading(false);
        }
      }
    }
    getInitialData();
  }, [searchParams]);

  const handleExtract = async (url: string) => {
    const parsedUrl = youtubeUrlSchema.safeParse(url.trim());
    if (!parsedUrl.success) {
      const msg = parsedUrl.error.issues[0]?.message ?? "Please enter a valid YouTube URL";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    setExtractedUrl(parsedUrl.data);
    setErrorMessage(null);
    const toastId = toast.loading("Analyzing video content...");

    try {
      const result = await extractRecipe(parsedUrl.data);

      if (result.success) {
        setRecipe(result.data as RecipeData);
        setErrorMessage(null);
        toast.success("Recipe extracted successfully!", { id: toastId });
      } else {
        if (result.status === "TRANSCRIPT_MISSING") {
          setErrorMessage("NO_RECIPE_FOUND");
          toast.error("No recipe found in this video.", { id: toastId });
        } else {
          const msg = result.error || "Failed to extract recipe";
          setErrorMessage(msg);
          toast.error(msg, { id: toastId });
        }
      }
    } catch (error: unknown) {

      const err = error as Error;
      const msg = err.message || "An unexpected error occurred";
      setErrorMessage(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePantrySubmit = async (ingredients: string) => {
    if (!ingredients.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    const toastId = toast.loading("Chef Gemini is inventing a recipe...");

    try {
      const result = await createPantryRecipe(ingredients);
      if (result.success && result.data) {
        setRecipe(result.data);
        toast.success("AI Chef created a new recipe!", { id: toastId });
      } else {
        const msg = result.error || "Failed to generate recipe";
        setErrorMessage(msg);
        toast.error(msg, { id: toastId });
      }
    } catch (_err) {
      toast.error("Something went wrong in the kitchen.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };


  const handleAiCommandSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiCommand.trim() || !recipe) return;
    
    setIsLoading(true);
    const toastId = toast.loading(`Applying: "${aiCommand}"...`);
    
    try {
      const result = await modifyRecipe(recipe, aiCommand);
      if (result.success && result.data) {
        setRecipe(result.data);
        setAiCommand("");
        toast.success("Recipe updated live!", { id: toastId });
      } else {
        toast.error(result.error || "Failed to modify recipe", { id: toastId });
      }
    } catch (_error) {
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredient = (id: string) => {
    if (!recipe) return;
    const newIngredients = recipe.ingredients.map(ing => 
      ing.id === id ? { ...ing, checked: !ing.checked } : ing
    );
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      {/* Top AppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl flex justify-between items-center w-full px-6 py-4 border-b border-brown-warm/5">
        <div className="flex items-center gap-2">
          <Utensils className="text-primary" size={24} />
          <span className="font-serif text-2xl font-bold text-primary tracking-tight">Culinara</span>
        </div>
        <Link 
          href="/profile"
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm hover:opacity-80 transition-opacity"
        >
          {avatarUrl ? (
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src={avatarUrl}
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={20} />
            </div>
          )}
        </Link>
      </header>

      <main className="pt-28 pb-40 w-full max-w-4xl mx-auto flex flex-col items-center">
        {!recipe ? (
          <div className="flex flex-col items-center text-center px-6 w-full space-y-12">
            {/* Hero Section */}
            <section className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-4xl md:text-5xl text-primary leading-[1.1] max-w-2xl mx-auto font-bold"
              >
                Transform Any Recipe Video Into Your Perfect Meal
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-body-lg text-brown-warm/80 max-w-xl mx-auto text-lg leading-relaxed"
              >
                Simply paste a link or list your ingredients to get the perfect tailored meal for your lifestyle.
              </motion.p>
            </section>

              <div className="flex bg-brown-warm/10 p-1.5 rounded-full w-fit mx-auto mb-2 border border-brown-warm/5 backdrop-blur-sm">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSourceMode("url")}
                  className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 ${mode === 'url' ? 'bg-brown-warm text-white shadow-lg' : 'text-brown-warm/60 hover:text-brown-warm'}`}
                >
                  VIDEO LINK
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSourceMode("pantry")}
                  className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 ${mode === 'pantry' ? 'bg-brown-warm text-white shadow-lg' : 'text-brown-warm/60 hover:text-brown-warm'}`}
                >
                  AI CHEF (PANTRY)
                </motion.button>
              </div>

              {mode === "url" ? (
                <div className="w-full space-y-4">
                  <UrlInput onExtract={handleExtract} isLoading={isLoading} />
                  <AnimatePresence mode="wait">
                    {isLoading && (
                      <motion.div 
                        key={loadingMessageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2 text-brown-warm/60 font-medium text-sm"
                      >
                        <span>{LOADING_MESSAGES[loadingMessageIndex].emoji}</span>
                        <span>{LOADING_MESSAGES[loadingMessageIndex].text}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="relative group animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-6 bg-cream rounded-[2rem] shadow-sm border border-brown-warm/10 flex flex-col gap-4">
                    <textarea 
                      className="w-full bg-transparent border-none text-brown-dark placeholder:text-brown-warm/30 focus:ring-0 font-medium outline-none text-base min-h-[120px] resize-none" 
                      placeholder="What&apos;s in your fridge? e.g. &apos;Chicken, heavy cream, spinach and some mushrooms&apos;..." 
                      disabled={isLoading}
                      value={pantryInput}
                      onChange={(e) => setPantryInput(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handlePantrySubmit(pantryInput)}
                        disabled={isLoading || !pantryInput.trim()}
                        className="bg-brown-warm text-white px-8 py-3 rounded-full font-bold text-xs hover:bg-brown-dark transition-all shadow-md disabled:opacity-50"
                      >
                        Cook something up
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {errorMessage && errorMessage !== "NO_RECIPE_FOUND" && (
              <p className="text-red-500 text-sm font-medium -mt-6 text-center">
                {errorMessage}
              </p>
            )}

            {errorMessage === "NO_RECIPE_FOUND" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brown-warm/5 border border-brown-warm/10 p-8 rounded-[2rem] max-w-xl mx-auto text-center space-y-4"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-brown-warm/40 shadow-sm">
                  <Utensils size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-brown-dark font-bold font-serif text-xl">No recipe found in this video</h3>
                  <p className="text-brown-warm/60 text-sm">Our AI couldn&apos;t find a clear recipe in this video&apos;s text or visuals.</p>
                </div>
                <button 
                  onClick={() => {
                    setSourceMode("pantry");
                    setErrorMessage(null);
                  }}
                  className="bg-brown-dark text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-[0.98] transition-all shadow-md"
                >
                  Try AI Chef (Pantry Mode) instead
                </button>
              </motion.div>
            )}


            <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-8">
              {recentRecipe ? (
                <Link 
                  href={`/?id=${recentRecipe.id}`}
                  className="md:col-span-2 bg-surface-container rounded-3xl overflow-hidden relative group h-[260px] md:h-[300px] shadow-sm block"
                >
                  <img 
                    alt={recentRecipe.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={recentRecipe.imageUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                    <span className="text-cream/70 font-bold uppercase tracking-widest text-[10px] mb-2">Recently Saved</span>
                    <h3 className="text-white font-serif text-2xl font-bold line-clamp-2">{recentRecipe.title}</h3>
                  </div>
                </Link>
              ) : (
                <div className="md:col-span-2 bg-beige rounded-3xl overflow-hidden relative group h-[260px] md:h-[300px] shadow-sm flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-brown-warm/20">
                  <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center text-brown-warm/40 mb-4">
                    <Bookmark size={32} />
                  </div>
                  <h3 className="text-brown-dark font-serif text-xl font-bold">Your cookbook is empty</h3>
                  <p className="text-brown-warm/60 text-sm mt-2">Extract your first recipe to see it here!</p>
                </div>
              )}

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-cream rounded-3xl p-6 md:p-8 flex flex-col justify-between h-[260px] md:h-[300px] border border-brown-warm/10 shadow-sm"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
                    <Sparkles size={28} />
                  </div>
                  <h3 className="font-serif text-2xl text-primary mb-2 font-bold">Smart Scaling</h3>
                  <p className="text-brown-warm/80 text-sm md:text-base leading-relaxed">
                    Instantly adjust any video recipe for 1, 2, or 10 guests with zero math.
                  </p>
                </div>
                <div 
                  onClick={() => {
                    setSourceMode("url");
                    setTimeout(() => {
                        const el = document.getElementById('url-input');
                        if (el) el.focus();
                    }, 100);
                  }}
                  className="flex items-center gap-2 text-terracotta font-bold group cursor-pointer text-sm"
                >
                  <span>Try it now</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </div>
              </motion.div>
            </section>
          </div>
        ) : (
          <div className="px-6 w-full space-y-6">
            {/* AI Command Bar & URL Input (Extracted State) */}
            <section className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <LinkIcon className="text-outline" size={20} />
                </div>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl font-medium text-brown-dark/70 focus:ring-2 focus:ring-primary-container outline-none text-sm" 
                  readOnly 
                  type="text" 
                  value={extractedUrl}
                />
              </div>
              <form 
                onSubmit={handleAiCommandSubmit}
                className="p-4 bg-primary-container rounded-2xl shadow-lg flex items-center gap-4 border border-white/10"
              >
                <Sparkles className="text-on-primary-container fill-current" size={24} />
                <input 
                  className="flex-1 bg-transparent border-none text-on-primary placeholder:text-on-primary-container/60 focus:ring-0 font-body-md outline-none text-sm font-medium" 
                  placeholder="Ask AI to adjust recipe..." 
                  type="text"
                  value={aiCommand}
                  onChange={(e) => setAiCommand(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={isLoading || !aiCommand.trim()}
                  className="bg-tertiary-container text-on-tertiary-container px-5 py-2 rounded-full font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
              
              <div className="w-full pt-2">
                <AiCommandBar onCommand={(cmd) => setAiCommand(cmd)} isLoading={isLoading} />
              </div>
            </section>

            <RecipeSelector activeView={activeView} onChange={setActiveView} />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                {activeView === "recipe" ? (
                  <RecipeView recipe={recipe as unknown as Recipe} />
                ) : recipe ? (
                  <IngredientView 
                    ingredients={recipe.ingredients ?? []} 
                    onToggle={toggleIngredient}
                    onOrder={() => setIsGroceryModalOpen(true)}
                    missingIngredients={recipe.missingIngredients}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      <GroceryOrderModal 
        isOpen={isGroceryModalOpen} 
        onClose={() => setIsGroceryModalOpen(false)} 
        ingredients={recipe?.ingredients || []} 
      />
    </div>
  );
}
