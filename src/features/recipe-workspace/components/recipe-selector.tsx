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
    <section className="mt-section-gap flex justify-center w-full max-w-sm mx-auto">
      <div className="bg-surface-dim p-1 rounded-full flex w-full border border-brown-warm/5">
        <button
          onClick={() => onChange("recipe")}
          className={cn(
            "flex-1 py-3 px-6 rounded-full font-label-md transition-all font-bold text-sm",
            activeView === "recipe" 
              ? "text-on-secondary bg-secondary shadow-sm" 
              : "text-on-surface-variant hover:bg-surface-bright/50"
          )}
        >
          Recipe
        </button>
        <button
          onClick={() => onChange("ingredients")}
          className={cn(
            "flex-1 py-3 px-6 rounded-full font-label-md transition-all font-bold text-sm",
            activeView === "ingredients" 
              ? "text-on-secondary bg-secondary shadow-sm" 
              : "text-on-surface-variant hover:bg-surface-bright/50"
          )}
        >
          Ingredients
        </button>
      </div>
    </section>
  );
}
