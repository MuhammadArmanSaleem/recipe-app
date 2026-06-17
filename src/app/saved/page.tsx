import React from "react";
import SavedClient from "./SavedClient";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCachedRecipes } from "@/services/recipe";

/**
 * Saved Recipes Page (Server Component)
 */
export default async function SavedPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch initial data on server (OBJ-3: Server-side fetching)
  const initialRecipes = await getCachedRecipes(user.id);

  return <SavedClient initialRecipes={initialRecipes as unknown as import("./SavedClient").SavedRecipe[]} />;
}
