
"use client";
import React from "react";
import { motion } from "framer-motion";

interface AiCommandBarProps {
  onCommand: (command: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  { label: "Make this high protein" },
  { label: "Reduce calories" },
  { label: "Make it Vegan" },
];

export function AiCommandBar({ onCommand, isLoading }: AiCommandBarProps) {
  return (
    <section className="w-full max-w-2xl mx-auto">
      <div className="flex flex-wrap justify-center gap-3 items-center">
        <span className="font-label-sm text-outline uppercase tracking-widest text-[11px] font-bold">Enhance with AI</span>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full justify-start md:justify-center px-1">
          {SUGGESTIONS.map((suggestion) => (
            <motion.button
              key={suggestion.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCommand(suggestion.label)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-tertiary-container text-on-tertiary-container rounded-full border border-tertiary/20 font-label-sm whitespace-nowrap hover:bg-tertiary hover:text-on-tertiary transition-colors disabled:opacity-50 text-xs font-bold"
            >
              {suggestion.label}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
