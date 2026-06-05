"use client";

import React, { useState } from "react";
import { UrlInput } from "./components/url-input";
import { AiCommandBar } from "./components/ai-command-bar";
import { RecipeSelector } from "./components/recipe-selector";
import { RecipeView } from "./components/recipe-view";
import { IngredientView } from "./components/ingredient-view";
import { GroceryOrderModal } from "./components/grocery-order-modal";
import type { Recipe } from "@/types/recipe";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, Link as LinkIcon, Play, Utensils } from "lucide-react";

// MOCK DATA
const MOCK_RECIPE: Recipe = {
  id: "1",
  title: "Artesian Sourdough Avocado Toast",
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBUO5jS5vCFl9B12pHi38KY97ajuaWQxBbDCLNAXfbgFsAE5y3SjIvJExKpDap8UDQV1yshzhx1-9wgTj9VNN-R-tuGnCkGE3r2-SBy_t3NCOoPW-6ubO3uy-rZw2SIPzbFVICBevBHpyAnBbQMP6UyKNtc0M5bfKfgBQAq4M2_3icnEn1RDIxP-8ofHqprNPlnBHZGGI-xUszbUIAB_RB_EmGrQMCmK7FAdT4zpezpvrgn-5M5ciqtjdMJ9ja4MsHbIaqAYJI9Y-d",
  calories: 340,
  protein: 12,
  prepTime: "15 mins",
  goals: ["AI Enhanced", "Quick"],
  ingredients: [
    { id: "i1", name: "Sourdough Bread", amount: "2", unit: "slices", checked: false },
    { id: "i2", name: "Ripe Avocados", amount: "2", unit: "pcs", checked: false },
    { id: "i3", name: "Lemon Juice", amount: "1", unit: "squeeze", checked: false },
    { id: "i4", name: "Sea Salt & Pepper", amount: "1", unit: "pinch", checked: false },
    { id: "i5", name: "Poached Eggs", amount: "2", unit: "pcs", checked: false },
  ],
  instructions: [
    { id: "s1", order: 1, description: "Toast the sourdough slices until golden brown and crispy on the outside while remaining slightly chewy in the center." },
    { id: "s2", order: 2, description: "In a small bowl, mash the ripe avocados with a squeeze of fresh lemon juice, sea salt, and a pinch of black pepper." },
    { id: "s3", order: 3, description: "Spread the avocado mixture generously over the toasted bread. Top with poached eggs if desired." },
  ],
};

export function RecipeWorkspace() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<"recipe" | "ingredients">("recipe");
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState("");
  const [aiCommand, setAiCommand] = useState("");

  const handleExtract = async (url: string) => {
    setIsLoading(true);
    setExtractedUrl(url);
    toast.loading("Analyzing video content...");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setRecipe(MOCK_RECIPE);
    setIsLoading(false);
    toast.dismiss();
    toast.success("Recipe extracted successfully!");
  };

  const handleAiCommandSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiCommand.trim() || !recipe) return;
    
    setIsLoading(true);
    toast.loading(`Applying: "${aiCommand}"...`);
    
    // Simulate transformation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock logic
    setRecipe({
      ...recipe,
      title: `${aiCommand} Avocado Toast`,
    });

    setIsLoading(false);
    setAiCommand("");
    toast.dismiss();
    toast.success("Recipe updated live!");
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
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm">
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhHfpTXHHtDwyh6_PwprXWiMDq0FoEjGPcsTQtJ7PQTmWRLJem0qsuLFh1WaOmtTlhQDdat4nqn2hCLzk79Qg9LSnM3xsoVCDMKJigFoD7Dvp7aNDOOhSXYjdC5jXXDE1a6EY2_K-WP8EU4PmFfIrbjJNSkZJtuKrzuWQvpQLXlb6RLQy4MXr7lbrfLKvWvnL-19UGAtlqkVzYlLbOhvz8U0NAtUwwW4DEySDl7YY6bE81ExgyJ5HaMn7Kif_ZC4tVJVGUHZJ-jMJ7"
          />
        </div>
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
                Simply paste a link to extract ingredients, steps, and instantly adjust recipes for your lifestyle.
              </motion.p>
            </section>

            <UrlInput onExtract={handleExtract} isLoading={isLoading} />
            
            <div className="w-full">
              <AiCommandBar onCommand={(cmd) => handleExtract("https://example.com/mock")} isLoading={isLoading} />
            </div>

            {/* Visual Inspiration Bento */}
            <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2 bg-surface-container rounded-3xl overflow-hidden relative group h-[260px] md:h-[300px] shadow-sm"
              >
                <img 
                  alt="Recent Recipes" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvdkFoy6r7i-ZyPNjyUoHwA77AKA_pxtYeU6jZlv0ECNKu7hDSsl8g-24hXgVvk_JiMfu_j0bvutYsuqqIHkWwKceAbKa2BLmXnXraZGb3wAnO6WXb9rfaofkBuvolOFkMu7IB_zfg6nRCN6rjleGBrwGJMmwkTyGnzx22MWJ7sZmzuuc07q621jwjbHMoHUk5ytjZkoO0SjLwLmndpCco7-Moq1FBMRVMfqsFLO_xpVPrgDbeexaNHVVJBGF0MGHNj3PbXIU-c6zE"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <span className="text-cream/70 font-bold uppercase tracking-widest text-[10px] mb-2">Recently Saved</span>
                  <h3 className="text-white font-serif text-2xl font-bold">15-Minute Creamy Tuscan Pasta</h3>
                </div>
              </motion.div>

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
                <div className="flex items-center gap-2 text-terracotta font-bold group cursor-pointer text-sm">
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
                  <RecipeView recipe={recipe} />
                ) : (
                  <IngredientView 
                    ingredients={recipe.ingredients} 
                    onToggle={toggleIngredient}
                    onOrder={() => setIsGroceryModalOpen(true)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Floating Action Button (Extracted State) */}
      {recipe && (
        <button className="fixed bottom-28 right-6 bg-secondary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40">
          <Play size={32} className="fill-current" />
        </button>
      )}

      <GroceryOrderModal 
        isOpen={isGroceryModalOpen} 
        onClose={() => setIsGroceryModalOpen(false)} 
        ingredients={recipe?.ingredients || []} 
      />
    </div>
  );
}
