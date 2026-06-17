"use client";

import React from "react";
import { Link as LinkIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { youtubeUrlSchema } from "@/lib/validation/youtube";

interface UrlInputProps {
  onExtract: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onExtract, isLoading }: UrlInputProps) {
  const [url, setUrl] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (validationError) setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError("Please paste a YouTube URL");
      return;
    }

    const result = youtubeUrlSchema.safeParse(trimmed);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? "Invalid URL");
      return;
    }

    setValidationError(null);
    onExtract(trimmed);
  };

  return (
    <section className="w-full mb-element-gap relative max-w-4xl mx-auto">
      <div className="bg-cream rounded-[2rem] p-4 shadow-sm border border-brown-warm/10">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow group">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-warm/40" size={20} />
            <input
              type="text"
              id="url-input"
              value={url}
              onChange={handleChange}
              placeholder="Paste a YouTube recipe URL"
              className={`w-full pl-12 pr-4 py-4 bg-brown-warm/5 border-none rounded-2xl focus:ring-2 text-brown-dark placeholder:text-brown-warm/30 font-medium transition-all outline-none ${
                validationError
                  ? "ring-2 ring-red-400/60 focus:ring-red-400/60"
                  : "focus:ring-brown-warm/20"
              }`}
              disabled={isLoading}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !url.trim()}
            className="bg-brown-warm text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brown-dark transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            <span>{isLoading ? "Extracting..." : "Extract Recipe"}</span>
            <Sparkles size={16} />
          </motion.button>

        </form>

        <AnimatePresence>
          {validationError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 px-1 text-sm text-red-500 font-medium"
            >
              {validationError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
