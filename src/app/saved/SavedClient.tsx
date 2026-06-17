"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Clock, Flame, Utensils, ChevronRight, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import Link from "next/link";
import { deleteRecipe } from "@/actions/delete-recipe";
import { toast } from "sonner";

export interface SavedRecipe {
  id: string;
  title: string;
  imageUrl: string;
  time: string;
  calories: string;
}

export default function SavedClient({ initialRecipes }: { initialRecipes: SavedRecipe[] }) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>(initialRecipes);
  const [loading] = useState(false);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this recipe?")) return;

    const toastId = toast.loading("Deleting recipe...");
    try {
      await deleteRecipe(id);
      setRecipes(prev => prev.filter(r => r.id !== id));
      toast.success("Recipe removed from your cookbook", { id: toastId });
    } catch (_err) {
      toast.error("Failed to delete recipe", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-brown-warm/5 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <span className="font-serif text-xl font-bold text-brown-dark">Saved Recipes</span>
        <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta">
          <Bookmark size={20} className="fill-terracotta" />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 w-full max-w-2xl mx-auto space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta"></div>
            <p className="text-brown-warm font-medium">Loading your kitchen...</p>
          </div>
        ) : recipes.length > 0 ? (
          recipes.map((recipe, index) => (
            <Link key={recipe.id} href={`/?id=${recipe.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-48 w-full overflow-hidden rounded-[2rem] shadow-md hover:shadow-xl transition-all border border-brown-warm/5 mb-6"
              >
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/80 via-brown-dark/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif text-cream mb-2 line-clamp-1">{recipe.title}</h3>
                    <div className="flex items-center gap-4 text-cream/80 text-sm font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        {recipe.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flame size={16} />
                        {recipe.calories}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, recipe.id)}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all ml-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-beige flex items-center justify-center text-brown-warm/40">
              <Utensils size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-brown-dark">No recipes yet</h3>
              <p className="text-brown-warm/70 max-w-xs mx-auto">
                Paste a recipe link on the home screen to start building your digital cookbook.
              </p>
            </div>
            <Link 
              href="/"
              className="bg-terracotta text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              Start Cooking
              <ChevronRight size={18} />
            </Link>
          </div>
        )}
      </main>

      {/* Navigation */}
      <BottomNav />
    </div>
  );
}
