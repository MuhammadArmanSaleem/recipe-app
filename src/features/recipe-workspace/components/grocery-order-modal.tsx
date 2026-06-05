"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Truck, Clock, CheckCircle2 } from "lucide-react";
import type { Ingredient } from "@/types/recipe";

interface GroceryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
}

export function GroceryOrderModal({ isOpen, onClose, ingredients }: GroceryOrderModalProps) {
  const missingIngredients = ingredients.filter((i) => !i.checked);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="relative bg-background w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-1">Your Grocery List</h2>
                <p className="text-brown-warm/70 text-sm">Selected items for delivery.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-primary hover:bg-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="px-8 max-h-[50vh] overflow-y-auto space-y-6 py-4 no-scrollbar">
              {missingIngredients.map((ing) => (
                <div key={ing.id} className="flex justify-between items-center group">
                  <div className="space-y-1">
                    <h4 className="font-bold text-brown-dark group-hover:text-terracotta transition-colors">{ing.name}</h4>
                    <p className="text-xs text-brown-warm/60 font-bold uppercase tracking-widest">
                      {ing.amount} {ing.unit} • Locally Sourced
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-terracotta/20 flex items-center justify-center text-terracotta">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="p-8 bg-surface-container mt-4 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-brown-warm/5">
                <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center text-terracotta">
                  <Truck size={24} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-brown-dark">Delivery Estimate</h5>
                  <div className="flex items-center gap-2 text-xs text-brown-warm/70 font-bold">
                    <Clock size={12} />
                    <span>45-60 mins arrival</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-brown-warm/80 font-medium">Order Summary</span>
                  <span className="font-bold text-primary">{missingIngredients.length} items</span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg"
                >
                  <ShoppingBag size={20} />
                  <span>Place Delivery Order</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
