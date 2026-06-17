"use client";

import React from "react";
import { Check, ShoppingCart } from "lucide-react";
import type { Ingredient } from "@/types/recipe";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface IngredientViewProps {
  ingredients: Ingredient[];
  onToggle: (id: string) => void;
  onOrder: () => void;
  missingIngredients?: string[];
}

export function IngredientView({ ingredients, onToggle, onOrder, missingIngredients = [] }: IngredientViewProps) {
  const missingCount = ingredients.filter(i => !i.checked).length;

  const isMissing = (name: string) => {
    return missingIngredients.some(m => 
      name.toLowerCase().includes(m.toLowerCase()) || 
      m.toLowerCase().includes(name.toLowerCase())
    );
  };

  return (
    <div className="space-y-8 text-left relative pb-24">
      {/* Section: Pantry Essentials */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold text-primary">Pantry Essentials</h3>
          <span className="bg-surface-dim/80 text-brown-dark/70 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            {missingCount} Items Left
          </span>
        </div>

        <div className="grid gap-3">
          {ingredients.map((ingredient, index) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onToggle(ingredient.id)}
              className={cn(
                "group flex items-center justify-between p-5 rounded-2xl transition-all cursor-pointer",
                ingredient.checked 
                  ? "bg-transparent opacity-50" 
                  : isMissing(ingredient.name)
                    ? "bg-white border-2 border-red-100 shadow-sm"
                    : "bg-cream border border-brown-warm/5 shadow-sm"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  ingredient.checked 
                    ? "bg-brown-warm/30 border-brown-warm/30 text-white" 
                    : isMissing(ingredient.name)
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-brown-warm/20 group-hover:border-brown-warm/40"
                )}>
                  {ingredient.checked && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "font-medium text-brown-dark transition-all",
                    ingredient.checked && "line-through"
                  )}>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </span>
                  {isMissing(ingredient.name) && !ingredient.checked && (
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Need to buy</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Floating Action CTA - Hidden for now */}
      {/* 
      <AnimatePresence>
        {missingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-0 right-0 z-40 flex justify-center px-6 pointer-events-none"
          >
            <button
              onClick={onOrder}
              className="bg-primary text-cream py-4 px-8 rounded-full font-bold flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all pointer-events-auto"
            >
              <ShoppingCart size={20} />
              <span>Get Missing Ingredients</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence> 
      */}
    </div>
  );
}
