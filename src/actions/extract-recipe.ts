"use server";

import { getSupabaseServer, ensureUserProfile } from "@/lib/supabase/server";
import { fetchAndCleanTranscript, extractYoutubeVideoId } from "@/lib/youtube/transcript";
import { normalizeAiResponse } from "@/lib/ai/gemini";
import { fetchVideoDescription } from "@/lib/youtube/description";
import { extractRecipeFromVideoUrl } from "@/lib/youtube/geminiVideo";
import { extractRecipeFromText } from "@/lib/youtube/geminiText";
import { RecipeData } from "@/types/recipe";
import { youtubeUrlSchema } from "@/lib/validation/youtube";
import { checkRateLimit } from "@/lib/ratelimit";
import { revalidateTag } from "next/cache";

export type ExtractRecipeResult =
  | { success: true; data: RecipeData; extractedVia: "transcript" | "description" | "video" }
  | { success: false; error: string; status?: "TRANSCRIPT_MISSING" | "RATE_LIMITED" };

export async function extractRecipe(url: string): Promise<ExtractRecipeResult> {
  console.log(`START: extractRecipe for ${url}`);
  
  const parsedUrl = youtubeUrlSchema.safeParse(url);
  if (!parsedUrl.success) return { success: false, error: "Please enter a valid YouTube URL." };

  const supabase = await getSupabaseServer();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return { success: false, error: "Unauthenticated. Please sign in." };

  // Rate Limit Check
  const ratelimit = await checkRateLimit(user.id, 'extract');
  if (!ratelimit.allowed) {
    return { success: false, error: `Slow down, chef! Try again in ${ratelimit.retryAfter} seconds.`, status: "RATE_LIMITED" };
  }

  await ensureUserProfile(user);

  const videoId = extractYoutubeVideoId(url);
  let thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
    : "https://img.youtube.com/vi/default.jpg";

  // Get Profile Context
  const { data: profile } = await supabase
    .from("profiles")
    .select("dietary_goals, serving_default")
    .eq("id", user.id)
    .single();
    
  const userContext = {
    dietaryGoals: profile?.dietary_goals || [],
    servingDefault: profile?.serving_default || 2
  };

  let recipeData: RecipeData | null = null;
  let extractedVia: "transcript" | "description" | "video" | null = null;

  // ─── TIER 1: Gemini native video understanding (PRIMARY) ───────────
  const tier1Controller = new AbortController();
  const tier1TimeoutId = setTimeout(() => tier1Controller.abort(), 8000); // 8-second threshold for Vercel Hobby plan

  try {
    console.log("[TIER 1 START] Gemini Video Understanding...");
    const geminiResult = await extractRecipeFromVideoUrl(url, userContext, tier1Controller.signal);
    clearTimeout(tier1TimeoutId);

    if (geminiResult.status === "SUCCESS") {
      try {
        const cleanJson = geminiResult.rawAiResponse.replace(/```[a-z]*/gi, "").trim();
        const parsed = JSON.parse(cleanJson);
        const normalized = normalizeAiResponse(parsed);

        if (normalized && !("error" in normalized)) {
          const { RecipeDataSchema } = await import("@/schemas/recipe");
          recipeData = RecipeDataSchema.parse(normalized) as RecipeData;
          extractedVia = "video";
          console.log("[TIER 1 SUCCESS]");
        } else {
          console.warn("[TIER 1 FAIL] Normalization returned error:", normalized);
        }
      } catch (parseErr) {
        console.warn("[TIER 1 FAIL] JSON parsing or validation failed:", parseErr);
      }
    } else {
      console.warn(`[TIER 1 FAIL] Status: ${geminiResult.status}`);
    }
  } catch (err: unknown) {
    clearTimeout(tier1TimeoutId);
    console.warn("[TIER 1 TIMEOUT/FAIL -> TIER 2]", err);
  }

  // ─── TIER 2: youtubei.js transcript (FALLBACK 1) ───────────────────
  if (!recipeData) {
    try {
      console.log("[TIER 2 START] youtubei.js Transcript...");
      const transcriptResult = await fetchAndCleanTranscript(url);

      if (transcriptResult.status === "SUCCESS") {
        if (transcriptResult.thumbnailUrl) thumbnailUrl = transcriptResult.thumbnailUrl;

        const geminiTextResult = await extractRecipeFromText(transcriptResult.transcript, userContext);
        if (geminiTextResult.status === "SUCCESS") {
          try {
            const cleanJson = geminiTextResult.rawAiResponse.replace(/```[a-z]*/gi, "").trim();
            const parsed = JSON.parse(cleanJson);
            const normalized = normalizeAiResponse(parsed);

            if (normalized && !("error" in normalized)) {
              const { RecipeDataSchema } = await import("@/schemas/recipe");
              recipeData = RecipeDataSchema.parse(normalized) as RecipeData;
              extractedVia = "transcript";
              console.log("[TIER 2 SUCCESS]");
            } else {
              console.warn("[TIER 2 FAIL] Normalization returned error:", normalized);
            }
          } catch (parseErr) {
            console.warn("[TIER 2 FAIL] JSON parsing or validation failed:", parseErr);
          }
        } else {
          console.warn(`[TIER 2 FAIL] extractRecipeFromText status: ${geminiTextResult.status}`);
        }
      } else {
        console.warn(`[TIER 2 FAIL] Transcript fetch status: ${transcriptResult.status}`);
      }
    } catch (err) {
      console.warn("[TIER 2 TIMEOUT/FAIL -> TIER 3]", err);
    }
  }

  // ─── TIER 3: YouTube Data API description fetch (FALLBACK 2) ────────
  if (!recipeData) {
    try {
      console.log("[TIER 3 START] YouTube Data API description...");
      const descResult = await fetchVideoDescription(url);

      if (descResult.status === "SUCCESS") {
        const geminiDescResult = await extractRecipeFromText(
          `${descResult.videoTitle}\n\n${descResult.content}`,
          userContext
        );

        if (geminiDescResult.status === "SUCCESS") {
          try {
            const cleanJson = geminiDescResult.rawAiResponse.replace(/```[a-z]*/gi, "").trim();
            const parsed = JSON.parse(cleanJson);
            const normalized = normalizeAiResponse(parsed);

            if (normalized && !("error" in normalized)) {
              const { RecipeDataSchema } = await import("@/schemas/recipe");
              recipeData = RecipeDataSchema.parse(normalized) as RecipeData;
              extractedVia = "description";
              console.log("[TIER 3 SUCCESS]");
            } else {
              console.warn("[TIER 3 FAIL] Normalization returned error:", normalized);
            }
          } catch (parseErr) {
            console.warn("[TIER 3 FAIL] JSON parsing or validation failed:", parseErr);
          }
        } else {
          console.warn(`[TIER 3 FAIL] extractRecipeFromText status: ${geminiDescResult.status}`);
        }
      } else {
        console.warn(`[TIER 3 FAIL] Description fetch status: ${descResult.status}`);
      }
    } catch (err) {
      console.warn("[TIER 3 TIMEOUT/FAIL -> TIER 4]", err);
    }
  }

  // ─── TIER 4: All tiers exhausted → Pantry pivot (LAST RESORT) ──────
  if (!recipeData) {
    console.warn("[ALL TIERS EXHAUSTED] Returning TRANSCRIPT_MISSING (Pantry Pivot)");
    return { success: false, error: "TRANSCRIPT_MISSING", status: "TRANSCRIPT_MISSING" };
  }

  let recipeId: string | null = null;
  try {
    // Persist Recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        original_url: url,
        source: 'youtube',
        status: "completed",
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single();

    if (recipeError) throw new Error(`DB Save Failed: ${recipeError.message}`);
    recipeId = recipe.id;

    // Persist Version
    const { data: version, error: versionError } = await supabase
      .from("recipe_versions")
      .insert({
        recipe_id: recipe.id,
        version_number: 1,
        recipe_data: recipeData,
      })
      .select()
      .single();

    if (versionError) throw new Error(`DB Version Failed: ${versionError.message}`);

    // Update Current Version Pointer
    const { error: updateError } = await supabase
      .from("recipes")
      .update({ current_version_id: version.id })
      .eq("id", recipe.id);

    if (updateError) throw new Error(`DB Update Failed: ${updateError.message}`);
        
    revalidateTag(`recipes-${user.id}`, "max");

    return {
      success: true,
      data: { ...recipeData, id: recipe.id },
      extractedVia: extractedVia || "transcript"
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Extraction Persistence Failed:", error);
    // Cleanup orphaned recipe if it exists
    if (recipeId) {
      await supabase.from("recipes").delete().eq("id", recipeId);
    }
    return { success: false, error: "Failed to save recipe. Please try again." };
  }
}
