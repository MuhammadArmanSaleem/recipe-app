"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Award, 
  Utensils, 
  Settings, 
  User, 
  CreditCard, 
  Bell, 
  ShoppingCart, 
  Plus, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-32 font-sans text-brown-dark">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center w-full">
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-beige transition-colors active:scale-95 duration-200">
          <ArrowLeft className="text-brown-dark" size={24} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-brown-dark">Culinara</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-brown-warm/20">
          <img 
            alt="Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlhCb6KmM3wmXVCndRAug1yK45jqDBa7q-EMYg-IHzz6s7fWnZiAcWu-NNN0TqcDcWHJ7ByrkeA8Vo_klVEqzXg_nZ2s3Ra5e_WoOaauOr69RXIkt4gmakjv_Rib86eI0pV4ylCKkpX_rmhOe-tnQv26O6bLX1yv_LgTXXLpK0Wis_XcHgWiEpQ_irlFfB3WwCB6iErzOUu5JMtceW8NKyLwZL0MO_cln3KP7IhoRCifM0P7aT0HjnikHLqjk-XuHiW0ZMTbfz4Cks"
          />
        </div>
      </header>

      <main className="px-6 max-w-md mx-auto space-y-10 pt-6 w-full">
        
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
              <img 
                alt="Alex Thorne Avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDicF2WEPfO4TqZHFaBJ6L1rBvVTVtvdZDjhmEJNwfPIsLThr5Nu6h_fU_4ea-XNeQuCkcwW4qNSHhjQuhEbWNWcCwlfbmHN6D033sC4N6njMwBNZmyCeRIHW-o4QJJn-mHn1LmHW9ynbUPMsuiihlvUzeGa5HWTTPWJBrkamYjm4KO7zOSUx-sNxSxlPSeiYLwBa9xbMZLBCqNA2Dwhet1uHRdx78vXHDl81grzLsqzpjFZKBh3EFelfmBhdhDcXp0gk7Zk3DhGJGu"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-terracotta text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-md flex items-center gap-1 whitespace-nowrap">
              <Award size={14} className="fill-white" />
              Premium Member
            </div>
          </div>
          <div className="pt-2">
            <h2 className="font-serif text-[28px] font-bold text-brown-dark leading-tight">Alex Thorne</h2>
            <p className="text-brown-warm/80 font-medium">Personalizing flavors since 2021</p>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-3 gap-3 bg-cream rounded-[1.5rem] p-4 shadow-sm border border-brown-warm/5">
          <div className="text-center">
            <div className="text-brown-dark font-serif text-2xl font-bold">128</div>
            <div className="text-brown-warm/60 text-xs uppercase tracking-wider font-bold mt-1">Recipes</div>
          </div>
          <div className="text-center border-x border-brown-warm/10">
            <div className="text-brown-dark font-serif text-2xl font-bold">42h</div>
            <div className="text-brown-warm/60 text-xs uppercase tracking-wider font-bold mt-1">Saved</div>
          </div>
          <div className="text-center">
            <div className="text-brown-dark font-serif text-2xl font-bold">54</div>
            <div className="text-brown-warm/60 text-xs uppercase tracking-wider font-bold mt-1">Dishes</div>
          </div>
        </section>

        {/* Kitchen Preferences */}
        <section className="space-y-4">
          <h3 className="text-brown-dark font-serif text-2xl font-bold flex items-center gap-2">
            <Utensils size={24} className="text-brown-dark" />
            Kitchen Preferences
          </h3>
          <div className="bg-beige/40 p-5 rounded-[1.5rem] space-y-6 border border-brown-warm/5">
            <div>
              <label className="text-brown-warm/80 text-sm font-bold block mb-3">Dietary Goals</label>
              <div className="flex flex-wrap gap-2">
                <span className="bg-brown-dark text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">High Protein</span>
                <span className="bg-white text-brown-dark border border-brown-warm/10 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">Plant-Based</span>
                <span className="bg-white text-brown-dark border border-brown-warm/10 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">Low Carb</span>
              </div>
            </div>
            <div>
              <label className="text-brown-warm/80 text-sm font-bold block mb-3">Serving Defaults</label>
              <div className="bg-brown-warm/10 rounded-full p-1 flex">
                <button className="flex-1 py-2.5 text-sm font-semibold text-brown-warm rounded-full transition-colors">1 Person</button>
                <button className="flex-1 py-2.5 text-sm font-bold bg-white shadow-sm text-brown-dark rounded-full">2 People</button>
                <button className="flex-1 py-2.5 text-sm font-semibold text-brown-warm rounded-full transition-colors">4+ People</button>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="space-y-4">
          <h3 className="text-brown-dark font-serif text-2xl font-bold flex items-center gap-2">
            <Settings size={24} className="text-brown-dark" />
            Account Settings
          </h3>
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-brown-warm/5 overflow-hidden">
            
            <button className="w-full flex items-center justify-between p-4 border-b border-brown-warm/5 hover:bg-beige/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                  <User size={20} />
                </div>
                <span className="text-brown-dark font-semibold">Personal Info</span>
              </div>
              <ChevronRight size={20} className="text-brown-warm/40" />
            </button>

            <button className="w-full flex items-center justify-between p-4 border-b border-brown-warm/5 hover:bg-beige/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <span className="text-brown-dark font-semibold">Payment Methods</span>
              </div>
              <ChevronRight size={20} className="text-brown-warm/40" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-beige/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <span className="text-brown-dark font-semibold">Notification Settings</span>
              </div>
              <ChevronRight size={20} className="text-brown-warm/40" />
            </button>

          </div>
        </section>

        {/* Integrations */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-brown-dark font-serif text-2xl font-bold flex items-center gap-2">
              <ShoppingCart size={24} className="text-brown-dark" />
              Integrations
            </h3>
            <button className="text-terracotta text-sm font-bold hover:underline mb-1">Manage</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-cream rounded-[1.5rem] p-5 flex flex-col items-center justify-center gap-3 border border-brown-warm/5 shadow-sm hover:scale-[0.98] transition-transform">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ShoppingCart size={24} className="text-olive" />
              </div>
              <span className="text-brown-dark font-bold text-sm">Instacart</span>
              <span className="text-[10px] text-olive bg-olive/10 px-2.5 py-1 rounded-full font-black tracking-wider">CONNECTED</span>
            </button>

            <button className="bg-white rounded-[1.5rem] p-5 flex flex-col items-center justify-center gap-3 border border-dashed border-brown-warm/20 hover:scale-[0.98] transition-transform group">
              <div className="w-12 h-12 bg-beige/50 rounded-full flex items-center justify-center group-hover:bg-beige transition-colors">
                <Plus size={24} className="text-brown-warm/50" />
              </div>
              <span className="text-brown-warm font-bold text-sm">Whole Foods</span>
              <span className="text-[10px] text-brown-warm/60 px-2.5 py-1 rounded-full font-bold tracking-wider">LINK APP</span>
            </button>
          </div>
        </section>

        {/* AI Chef Promo */}
        <section className="bg-[#39481e] rounded-[1.5rem] p-6 relative overflow-hidden text-white mt-4 shadow-lg">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-[#d7eab1]">
              <Sparkles size={16} className="fill-[#d7eab1]" />
              <span className="text-xs uppercase tracking-widest font-bold">Culinara Intelligence</span>
            </div>
            <h4 className="font-serif text-2xl font-bold leading-tight">Need a custom meal plan for the week?</h4>
            <p className="text-white/80 text-sm font-medium pb-2">Your AI Chef is ready to transform your pantry.</p>
            <button className="bg-terracotta text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-[0.98] transition-transform shadow-md">
              Ask AI Chef
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="absolute -right-4 -bottom-4 opacity-[0.15] transform rotate-12">
            <Sparkles size={140} className="fill-white" />
          </div>
        </section>

      </main>

      {/* Navigation */}
      <BottomNav />
    </div>
  );
}
