"use client";

import React from "react";
import { Check, ShoppingCart, Plus, Minus } from "lucide-react";
import type { Ingredient } from "@/types/recipe";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface IngredientViewProps {
  ingredients: Ingredient[];
  onToggle: (id: string) => void;
  onOrder: () => void;
}

export function IngredientView({ ingredients, onToggle, onOrder }: IngredientViewProps) {
  const missingCount = ingredients.filter(i => !i.checked).length;

  return (
    <div className="space-y-10 text-left">
      {/* Section: Pantry Essentials */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold text-primary">Ingredients</h3>
          <span className="bg-terracotta/10 text-terracotta px-3 py-1 rounded-full text-xs font-bold">
            {ingredients.length} Total
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
                "group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                ingredient.checked 
                  ? "bg-surface-dim/30 border-brown-warm/5 opacity-60" 
                  : "bg-white border-brown-warm/10 shadow-sm hover:shadow-md hover:border-terracotta/20"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  ingredient.checked 
                    ? "bg-terracotta border-terracotta text-white" 
                    : "border-brown-warm/20 group-hover:border-terracotta/40"
                )}>
                  {ingredient.checked && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "font-medium text-brown-dark transition-all",
                    ingredient.checked && "line-through"
                  )}>
                    {ingredient.name}
                  </span>
                  <span className="text-xs text-brown-warm/70 font-bold uppercase tracking-wider">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </div>
              </div>
              
              {!ingredient.checked && (
                <Plus size={18} className="text-terracotta/40 group-hover:text-terracotta transition-colors" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Grocery Ordering CTA */}
      <AnimatePresence>
        {missingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-8 bg-primary text-white rounded-3xl shadow-xl space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <ShoppingCart size={120} />
            </div>
            
            <div className="space-y-2 relative z-10">
              <h4 className="font-serif text-2xl font-bold">Missing {missingCount} items?</h4>
              <p className="text-cream/70 text-sm leading-relaxed max-w-[240px]">
                We can order the remaining ingredients from your preferred grocer instantly.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOrder}
              className="w-full bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg relative z-10"
            >
              <ShoppingCart size={20} />
              <span>Get Missing Ingredients</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
