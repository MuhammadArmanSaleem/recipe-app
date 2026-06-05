"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Scale, HeartPulse, Wand2 } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TactileButton } from "@/components/ui/tactile-button";
import Link from "next/link";

const AI_FEATURES = [
  {
    icon: Scale,
    title: "Smart Scaling",
    description: "Instantly adjust any video recipe for 1, 2, or 10 guests with zero math.",
  },
  {
    icon: HeartPulse,
    title: "Dietary Adjustments",
    description: "Make any recipe vegan, keto, or gluten-free while maintaining the original flavor profile.",
  },
  {
    icon: Wand2,
    title: "Ingredient Swaps",
    description: "Missing an ingredient? Your AI Chef finds the perfect substitute from what you already have.",
  },
];

export default function AiPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-brown-warm/5">
        <span className="font-serif text-xl font-bold text-brown-dark">AI Chef</span>
        <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center text-olive border border-olive/20">
          <Sparkles size={20} className="fill-olive text-olive" />
        </div>
      </header>

      <main className="flex-1 px-6 py-8 w-full max-w-2xl mx-auto space-y-10">
        
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-beige/50 border border-brown-warm/10 mb-2">
            <Sparkles size={32} className="text-terracotta" />
          </div>
          <h1 className="text-3xl font-serif text-brown-dark">Your Perfect Meal, Instantly.</h1>
          <p className="text-brown-warm/80 font-medium max-w-md mx-auto leading-relaxed">
            Extract ingredients, calculate macros, and personalize any recipe video with a single prompt.
          </p>
        </motion.div>

        {/* Features List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {AI_FEATURES.map((feature, idx) => (
            <div
              key={feature.title}
              className="p-5 bg-cream rounded-3xl border border-brown-warm/5 shadow-sm flex gap-5 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mt-1">
                <feature.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brown-dark mb-1">{feature.title}</h3>
                <p className="text-sm font-medium text-brown-warm/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center pt-4"
        >
          <Link href="/">
            <TactileButton variant="primary" size="lg" className="rounded-full shadow-xl px-12">
              Start Transforming
              <Sparkles size={18} className="ml-2" />
            </TactileButton>
          </Link>
        </motion.div>

      </main>

      {/* Navigation */}
      <BottomNav />
    </div>
  );
}
