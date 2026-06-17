"use client";

import React from "react";
import { Clock, Flame, Sparkles, ChevronRight, Utensils, FileText, Video } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { motion } from "framer-motion";

interface RecipeViewProps {
  recipe: Recipe;
}

export function RecipeView({ recipe }: RecipeViewProps) {
  return (
    <div className="space-y-10 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles size={14} className="fill-current" />
            <span className="font-label-sm text-xs font-bold">AI Enhanced</span>
          </div>
        </div>
        
        <h2 className="font-serif text-[28px] font-bold text-primary mb-3 leading-tight">
          {recipe.title}
        </h2>

        {/* Smart Badges (Tailored for you + Source) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.extractedVia === "description" && (
            <div className="bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1.5 px-2.5 py-1 rounded-full">
              <FileText size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">From video description</span>
            </div>
          )}
          {recipe.extractedVia === "video" && (
            <div className="bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center gap-1.5 px-2.5 py-1 rounded-full">
              <Video size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">Extracted by watching video</span>
            </div>
          )}
          {recipe.tailoredFor && recipe.tailoredFor.length > 0 && recipe.tailoredFor.map((badge, i) => (
            <div key={i} className="bg-terracotta/10 text-terracotta border border-terracotta/20 flex items-center gap-1.5 px-2.5 py-1 rounded-full">
              <Sparkles size={12} className="fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">{badge}</span>
            </div>
          ))}
        </div>

        {/* Tags & Macros */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="bg-surface-container flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant">
            <Clock size={18} className="text-secondary" />
            <span className="font-label-sm text-on-surface text-xs font-bold">{recipe.prepTime}</span>
          </div>
          <div className="bg-surface-container flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant">
            <Flame size={18} className="text-terracotta" />
            <span className="font-label-sm text-on-surface text-xs font-bold">{recipe.nutrition.calories} kcal</span>
          </div>
        </div>
      </section>

      {/* Cooking Steps (Quick Preview) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold text-primary">Instructions</h3>
          <div className="text-brown-warm/60 text-sm font-bold flex items-center gap-1">
            {recipe.instructions.length} Steps
            <ChevronRight size={16} />
          </div>
        </div>

        <div className="space-y-4">
          {recipe.instructions.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-cream border border-brown-warm/10 flex items-center justify-center text-brown-dark font-black text-sm shadow-sm z-10">
                  {step.order}
                </div>
                {index !== recipe.instructions.length - 1 && (
                  <div className="w-0.5 h-full bg-brown-warm/5 -mt-1 mb-1" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="bg-beige/20 p-4 rounded-2xl border border-brown-warm/5 group-hover:bg-beige/40 transition-colors">
                  <p className="font-body-md leading-relaxed text-brown-dark font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
