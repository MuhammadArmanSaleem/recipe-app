"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bookmark, Clock, Flame } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";

const SAVED_RECIPES = [
  {
    id: "1",
    title: "15-Minute Creamy Tuscan Pasta",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80",
    time: "15 min",
    calories: "520 kcal"
  },
  {
    id: "2",
    title: "Honey Garlic Glazed Chicken",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80",
    time: "25 min",
    calories: "450 kcal"
  },
  {
    id: "3",
    title: "Roasted Herb Potatoes",
    imageUrl: "https://images.unsplash.com/photo-1592394533824-9440e5d68530?auto=format&fit=crop&q=80",
    time: "40 min",
    calories: "210 kcal"
  }
];

export default function SavedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-brown-warm/5">
        <span className="font-serif text-xl font-bold text-brown-dark">Saved Recipes</span>
        <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta">
          <Bookmark size={20} className="fill-terracotta" />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 w-full max-w-2xl mx-auto space-y-6">
        {SAVED_RECIPES.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative h-48 w-full overflow-hidden rounded-[2rem] shadow-md hover:shadow-xl transition-all border border-brown-warm/5"
          >
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/80 via-brown-dark/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-xl font-serif text-cream mb-2">{recipe.title}</h3>
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
          </motion.div>
        ))}
      </main>

      {/* Navigation */}
      <BottomNav />
    </div>
  );
}
