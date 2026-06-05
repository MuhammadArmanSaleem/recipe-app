"use client";

import React from "react";
import { LayoutGrid, Bookmark, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Workspace", href: "/" },
  { icon: Bookmark, label: "Saved", href: "/saved" },
  { icon: Sparkles, label: "AI Chef", href: "/ai", fill: true },
  { icon: User, label: "Profile", href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-between items-center bg-surface-container/80 backdrop-blur-2xl w-[92%] max-w-md rounded-full px-6 py-3 shadow-[0px_12px_32px_rgba(58,38,29,0.12)] border border-white/20">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link key={item.href} href={item.href} className="relative group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-300 ease-out",
                isActive 
                  ? "bg-secondary text-on-secondary rounded-full p-3 scale-110 shadow-md" 
                  : "text-on-surface-variant p-2 hover:bg-surface-bright rounded-full"
              )}
            >
              <item.icon 
                size={isActive ? 24 : 22} 
                className={cn(isActive && "fill-current", !isActive && item.fill && "fill-current")}
              />
              {!isActive && (
                <span className="font-label-sm text-[10px] uppercase tracking-tighter mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
