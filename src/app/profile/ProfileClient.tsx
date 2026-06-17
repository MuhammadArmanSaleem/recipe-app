"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Award, 
  Utensils, 
  Settings, 
  User, 
  LogOut,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/actions/profile";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  dietary_goals: string[];
  serving_default: number;
}

export default function ProfileClient({ 
  initialProfile, 
  initialRecipeCount,
  user 
}: { 
  initialProfile: Profile | null, 
  initialRecipeCount: number,
  user: { id: string; user_metadata?: { full_name?: string; avatar_url?: string }; email?: string }
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(initialProfile || {
    id: user.id,
    full_name: user.user_metadata?.full_name || "New Chef",
    avatar_url: user.user_metadata?.avatar_url || null,
    email: user.email || null,
    dietary_goals: [],
    serving_default: 2,
  });
  const [stats] = useState({ recipes: initialRecipeCount });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleUpdateServing = async (val: number) => {
    if (!profile) return;
    try {
      setProfile({ ...profile, serving_default: val });
      await updateProfile({ serving_default: val });
      toast.success(`Default servings updated to ${val}`);
    } catch (_err) {
      toast.error("Failed to update preferences");
    }
  };

  const dietaryGoals = profile?.dietary_goals?.length ? profile.dietary_goals : ["High Protein", "Plant-Based", "Low Carb"];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32 font-sans text-brown-dark">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center w-full">
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-beige transition-colors active:scale-95 duration-200">
          <ArrowLeft className="text-brown-dark" size={24} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-brown-dark">Culinara</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-brown-warm/20">
          {profile?.avatar_url ? (
            <img 
              alt="Profile" 
              className="w-full h-full object-cover" 
              src={profile.avatar_url}
            />
          ) : (
            <div className="w-full h-full bg-beige flex items-center justify-center text-brown-warm">
              <User size={20} />
            </div>
          )}
        </div>
      </header>

      <main className="px-6 max-w-md mx-auto space-y-10 pt-6 w-full">
        
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-white">
              {profile?.avatar_url ? (
                <img 
                  alt={profile.full_name || "Chef"} 
                  className="w-full h-full object-cover" 
                  src={profile.avatar_url}
                />
              ) : (
                <div className="w-full h-full bg-beige flex items-center justify-center text-brown-warm">
                  <User size={64} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-terracotta text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-md flex items-center gap-1 whitespace-nowrap">
              <Award size={14} className="fill-white" />
              Premium Member
            </div>
          </div>
          <div className="pt-2">
            <h2 className="font-serif text-[28px] font-bold text-brown-dark leading-tight">
              {profile?.full_name || "New Chef"}
            </h2>
            <p className="text-brown-warm/80 font-medium">Personalizing flavors since 2026</p>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-3 gap-3 bg-cream rounded-[1.5rem] p-4 shadow-sm border border-brown-warm/5">
          <div className="text-center">
            <div className="text-brown-dark font-serif text-2xl font-bold">{stats.recipes}</div>
            <div className="text-brown-warm/60 text-xs uppercase tracking-wider font-bold mt-1">Recipes</div>
          </div>
          <div className="text-center border-x border-brown-warm/10">
            <div className="text-brown-dark font-serif text-2xl font-bold">{stats.recipes}</div>
            <div className="text-brown-warm/60 text-xs uppercase tracking-wider font-bold mt-1">Saved</div>
          </div>
          <div className="text-center">
            <div className="text-brown-dark font-serif text-2xl font-bold">0</div>
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
                {dietaryGoals.map((goal) => (
                  <span key={goal} className="bg-brown-dark text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-brown-warm/80 text-sm font-bold block mb-3">Serving Defaults</label>
              <div className="bg-brown-warm/10 rounded-full p-1 flex">
                <button 
                  onClick={() => handleUpdateServing(1)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${profile?.serving_default === 1 ? 'bg-white shadow-sm text-brown-dark font-bold' : 'text-brown-warm'}`}
                >
                  1 Person
                </button>
                <button 
                  onClick={() => handleUpdateServing(2)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${profile?.serving_default === 2 ? 'bg-white shadow-sm text-brown-dark font-bold' : 'text-brown-warm'}`}
                >
                  2 People
                </button>
                <button 
                  onClick={() => handleUpdateServing(4)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${profile?.serving_default === 4 ? 'bg-white shadow-sm text-brown-dark font-bold' : 'text-brown-warm'}`}
                >
                  4+ People
                </button>
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
            
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100/50 text-red-600 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <LogOut size={20} />
                </div>
                <span className="text-brown-dark font-semibold">Sign Out</span>
              </div>
              <ChevronRight size={20} className="text-brown-warm/40" />
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
            <Link 
              href="/?mode=pantry"
              className="bg-terracotta text-white px-6 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 hover:scale-[0.98] transition-transform shadow-md w-fit"
            >
              Ask AI Chef
              <ChevronRight size={18} />
            </Link>
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
