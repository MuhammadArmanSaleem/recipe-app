"use server";

import { getSupabaseServer, ensureUserProfile } from "@/lib/supabase/server";
import { modifyRecipeWithAi } from "@/lib/ai/gemini";
import { RecipeData } from "@/types/recipe";

import { z } from "zod";
import { checkRateLimit } from "@/lib/ratelimit";
import { revalidatePath, revalidateTag } from "next/cache";

const ModifyRecipeSchema = z.object({
  userPrompt: z.string().min(1).max(500),
});

export async function modifyRecipe(
  currentRecipe: RecipeData,
  userPrompt: string
): Promise<{ success: boolean; data?: RecipeData; error?: string }> {
  // 1. Validate Input
  const validatedInput = ModifyRecipeSchema.safeParse({ userPrompt });
  if (!validatedInput.success) {
    return { success: false, error: "Invalid prompt. Please keep it between 1-500 characters." };
  }

  // 2. Authenticate user
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthenticated. Please sign in." };
  }

  // Rate Limit Check
  const ratelimit = await checkRateLimit(user.id, 'ai');
  if (!ratelimit.allowed) {
    return { 
      success: false, 
      error: `Slow down, chef! Try again in ${ratelimit.retryAfter} seconds.` 
    };
  }

  const recipeId = currentRecipe.id;
  const isTemp = !recipeId || recipeId.startsWith("temp-");

  // 3. Security: Early ownership check for DB recipes
  if (!isTemp) {
    const { data: existing, error: checkError } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", recipeId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existing) {
      console.warn(`Unauthorized modification attempt by user ${user.id} on recipe ${recipeId}`);
      return { success: false, error: "Recipe not found or you don't have permission to modify it." };
    }
  }

  // Ensure profile row exists
  await ensureUserProfile(user);

  // Fetch profile for AI context
  const { data: profile } = await supabase
    .from("profiles")
    .select("dietary_goals, serving_default")
    .eq("id", user.id)
    .single();

  try {
    // 4. Pass current version and prompt to Gemini (with 30s timeout)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI_TIMEOUT")), 30000)
    );

    const newRecipeData = await Promise.race([
      modifyRecipeWithAi(currentRecipe, userPrompt, profile || undefined),
      timeoutPromise
    ]) as RecipeData;

    // 5. Persist modified recipe (Best-effort for saved recipes)
    if (!isTemp) {
      try {
        const { data: latestVersion } = await supabase
          .from("recipe_versions")
          .select("version_number")
          .eq("recipe_id", recipeId)
          .order("version_number", { ascending: false })
          .limit(1)
          .single();

        const nextVersionNumber = (latestVersion?.version_number || 1) + 1;

        const { data: version, error: versionError } = await supabase
          .from("recipe_versions")
          .insert({
            recipe_id: recipeId,
            version_number: nextVersionNumber,
            prompt_used: userPrompt,
            recipe_data: newRecipeData,
          })
          .select()
          .single();

        if (versionError) {
          console.warn("Database error during version save:", versionError.message);
        } else {
          await supabase
            .from("recipes")
            .update({ current_version_id: version.id })
            .eq("id", recipeId);
            
          revalidateTag(`recipes-${user.id}`, "page");
          revalidatePath("/saved");
        }
      } catch (dbError) {
        console.warn("Persistence failed during modification:", dbError);
      }
    }

    return {
      success: true,
      data: {
        ...newRecipeData,
        id: recipeId || `temp-${crypto.randomUUID()}`,
      },
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Modify Action Error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during modification.",
    };
  }
}
