"use client";

import React from "react";
import { Link as LinkIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface UrlInputProps {
  onExtract: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onExtract, isLoading }: UrlInputProps) {
  const [url, setUrl] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onExtract(url);
    }
  };

  return (
    <section className="w-full mb-element-gap relative max-w-4xl mx-auto">
      <div className="bg-surface-container rounded-2xl p-4 shadow-[0px_12px_32px_rgba(58,38,29,0.08)] border border-white/40">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow group">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste TikTok, Reel, or YouTube recipe URL"
              className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-on-surface placeholder:text-outline-variant font-body-md transition-all outline-none"
              disabled={isLoading}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !url.trim()}
            className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            <span>{isLoading ? "Extracting..." : "Extract Recipe"}</span>
            <Sparkles size={20} />
          </motion.button>
        </form>
      </div>
    </section>
  );
}
