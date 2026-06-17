import React from "react";
import ProfileClient from "./ProfileClient";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCachedProfile } from "@/services/recipe";
import type { Profile } from "@/types/profile";

/**
 * Profile Page (Server Component)
 */
export default async function ProfilePage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch data on server with caching (OBJ-1)
  const profileData = await getCachedProfile(user.id);
  
  // Also get recipe count on server for initial stats
  const { count } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <ProfileClient 
      initialProfile={profileData as Profile | null} 
      initialRecipeCount={count || 0}
      user={user}
    />
  );
}
