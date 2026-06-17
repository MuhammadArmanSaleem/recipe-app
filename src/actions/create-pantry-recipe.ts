"use server";

import { getSupabaseServer, ensureUserProfile } from "@/lib/supabase/server";
import { createRecipeFromPantry } from "@/lib/ai/gemini";
import { RecipeData } from "@/types/recipe";
import { revalidatePath, revalidateTag } from "next/cache";
import { checkRateLimit } from "@/lib/ratelimit";

export async function createPantryRecipe(
  ingredients: string
): Promise<{ success: boolean; data?: RecipeData; error?: string }> {
  try {
    // 1. Auth & Profile
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Please sign in to use AI Chef." };

    // Rate Limit Check
    const ratelimit = await checkRateLimit(user.id, 'ai');
    if (!ratelimit.allowed) {
      return { 
        success: false, 
        error: `Slow down, chef! Try again in ${ratelimit.retryAfter} seconds.` 
      };
    }

    await ensureUserProfile(user);
    const { data: profile } = await supabase
      .from("profiles")
      .select("dietary_goals, serving_default")
      .eq("id", user.id)
      .single();

    // 2. Call Gemini (with 30s timeout)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI_TIMEOUT")), 30000)
    );

    const result = await Promise.race([
      createRecipeFromPantry(ingredients, profile || undefined),
      timeoutPromise
    ]) as RecipeData | { error: string };

    if ("error" in result) {
      return { success: false, error: result.error };
    }

    // 3. Persist
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        source: 'pantry',
        original_pantry_input: ingredients,
        status: 'completed',
        // No thumbnail for pantry recipes, maybe a placeholder later
      })
      .select()
      .single();

    if (recipeError) throw new Error(`DB Error: ${recipeError.message}`);

    const { data: version, error: versionError } = await supabase
      .from("recipe_versions")
      .insert({
        recipe_id: recipe.id,
        version_number: 1,
        recipe_data: result,
      })
      .select()
      .single();

    if (versionError) throw new Error(`DB Version Error: ${versionError.message}`);

    await supabase
      .from("recipes")
      .update({ current_version_id: version.id })
      .eq("id", recipe.id);

    revalidateTag(`recipes-${user.id}`, "page");
    revalidatePath("/saved");

    return {
      success: true,
      data: {
        ...result,
        id: recipe.id,
      },
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Pantry Action Error:", error);
    return {
      success: false,
      error: error.message || "Failed to cook up your recipe. Try again!",
    };
  }
}
