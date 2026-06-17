import { getSupabaseServer } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { RecipeVersion } from "@/types/recipe";

/**
 * Fetches the user's profile with caching.
 */
export async function getCachedProfile(userId: string) {
  const fetcher = unstable_cache(
    async () => {
      const supabase = await getSupabaseServer();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) return null;
      return data;
    },
    ["profile", userId],
    { revalidate: 60, tags: [`profile-${userId}`] }
  );

  return fetcher();
}

/**
 * Fetches the user's saved recipes with caching.
 */
export async function getCachedRecipes(userId: string) {
  const fetcher = unstable_cache(
    async () => {
      const supabase = await getSupabaseServer();
      const { data, error } = await supabase
        .from("recipes")
        .select(`
          id,
          thumbnail_url,
          source,
          current_version_id,
          recipe_versions!fk_current_version (
            recipe_data
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) return [];
      
      const recipes = (data as unknown) as { 
        id: string; 
        thumbnail_url: string | null; 
        recipe_versions: { recipe_data: { title?: string; prepTime?: string; nutrition?: { calories?: string } } } | null 
      }[];

      return (recipes || []).map((r) => {
        const recipeData = r.recipe_versions?.recipe_data || {};
        return {
          id: r.id,
          title: recipeData.title || "Untitled Recipe",
          imageUrl: r.thumbnail_url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80",
          time: recipeData.prepTime || "20 min",
          calories: recipeData.nutrition?.calories || "---",
        };
      });
    },
    ["recipes", userId],
    { revalidate: 30, tags: [`recipes-${userId}`] }
  );

  return fetcher();
}

/**
 * Fetches a single recipe version with caching.
 */
export async function getCachedRecipeVersion(recipeId: string, versionId: string) {
  const fetcher = unstable_cache(
    async () => {
      const supabase = await getSupabaseServer();
      const { data, error } = await supabase
        .from("recipe_versions")
        .select("*")
        .eq("id", versionId)
        .eq("recipe_id", recipeId)
        .single();

      if (error) return null;
      return data as unknown as RecipeVersion;
    },
    ["version", versionId],
    { revalidate: false, tags: [`version-${versionId}`] }
  );

  return fetcher();
}
