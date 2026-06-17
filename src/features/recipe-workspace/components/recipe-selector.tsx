"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RecipeSelectorProps {
  activeView: "recipe" | "ingredients";
  onChange: (view: "recipe" | "ingredients") => void;
}

export function RecipeSelector({ activeView, onChange }: RecipeSelectorProps) {
  return (
    <section className="flex justify-center w-full max-w-sm mx-auto">
      <div className="bg-brown-warm/10 p-1.5 rounded-full flex w-full relative border border-brown-warm/5 backdrop-blur-sm">
        <button
          onClick={() => onChange("recipe")}
          className={cn(
            "flex-1 py-2.5 px-6 rounded-full font-black text-[10px] tracking-widest transition-all duration-300 relative z-10",
            activeView === "recipe" 
              ? "bg-brown-warm text-white shadow-lg" 
              : "text-brown-warm/60 hover:text-brown-warm"
          )}
        >
          {activeView === "recipe" && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-brown-warm rounded-full -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span>RECIPE</span>
        </button>
        <button
          onClick={() => onChange("ingredients")}
          className={cn(
            "flex-1 py-2.5 px-6 rounded-full font-black text-[10px] tracking-widest transition-all duration-300 relative z-10",
            activeView === "ingredients" 
              ? "bg-brown-warm text-white shadow-lg" 
              : "text-brown-warm/60 hover:text-brown-warm"
          )}
        >
          {activeView === "ingredients" && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-brown-warm rounded-full -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span>INGREDIENTS</span>
        </button>
      </div>
    </section>
  );
}
