"use client";

import React from "react";
import { Clock, Flame, Sparkles, ChevronRight } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { motion } from "framer-motion";

interface RecipeViewProps {
  recipe: Recipe;
}

export function RecipeView({ recipe }: RecipeViewProps) {
  return (
    <div className="space-y-10 text-left">
      {/* Hero Content */}
      <section className="mt-section-gap">
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-xl mb-6">
          <img 
            className="w-full h-full object-cover" 
            src={recipe.imageUrl} 
            alt={recipe.title}
          />
          <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={16} className="fill-current" />
            <span className="font-label-sm text-xs font-bold">AI Enhanced</span>
          </div>
        </div>
        
        <h2 className="font-serif text-[28px] font-bold text-primary mb-3 leading-tight">
          {recipe.title}
        </h2>

        {/* Tags & Macros */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="bg-surface-container flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant">
            <Clock size={18} className="text-secondary" />
            <span className="font-label-sm text-on-surface text-xs font-bold">{recipe.prepTime}</span>
          </div>
          <div className="bg-surface-container flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Calories</span>
            <span className="font-label-sm font-bold text-on-surface text-xs">{recipe.calories}</span>
          </div>
          <div className="bg-surface-container flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Protein</span>
            <span className="font-label-sm font-bold text-on-surface text-xs">{recipe.protein}g</span>
          </div>
        </div>
      </section>

      {/* Cooking Instructions */}
      <section className="space-y-6">
        <h3 className="font-serif text-2xl font-bold text-primary">Instructions</h3>
        <div className="space-y-4">
          {recipe.instructions.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-surface-container-low rounded-lg shadow-[0px_12px_32px_rgba(58,38,29,0.08)] border border-white/40"
            >
              <div className="flex gap-4">
                <span className="font-serif text-secondary-container/80 text-4xl shrink-0 opacity-40 font-bold">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <div className="space-y-3 flex-1">
                  <p className="font-body-lg text-on-surface leading-relaxed text-brown-dark font-medium">
                    {step.description}
                  </p>
                  {index === 2 && ( // Mocking the AI Tip for the 3rd step
                    <div className="inline-flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full">
                      <Sparkles size={16} />
                      <span className="font-label-sm text-xs font-bold">AI Tip: Add chili flakes for heat</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
