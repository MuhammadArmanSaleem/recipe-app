"use server";

import { getSupabaseServer, ensureUserProfile } from "@/lib/supabase/server";
import { fetchAndCleanTranscript, extractYoutubeVideoId } from "@/lib/youtube/transcript";
import { extractRecipeFromTranscript } from "@/lib/ai/gemini";
import { fetchVideoDescription } from "@/lib/youtube/description";
import { extractRecipeFromVideo, VideoUnderstandingResult } from "@/lib/youtube/videoUnderstanding";
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

  // --- TIER 1: Transcript ---
  try {
    const transcriptResult = await fetchAndCleanTranscript(url);
    if (transcriptResult.status === "SUCCESS") {
      const data = await extractRecipeFromTranscript(transcriptResult.transcript, profile || undefined);
      recipeData = data as RecipeData;
      extractedVia = "transcript";
      if (transcriptResult.thumbnailUrl) thumbnailUrl = transcriptResult.thumbnailUrl;
    }
  } catch (_tier1Error) {
    console.warn("Tier 1 (Transcript) Gemini call failed, will try Tier 2.");
  }
  
  // --- TIER 2: Description ---
  if (!recipeData) {
    try {
      console.log("Trying Tier 2 (Description)...");
      const descResult = await fetchVideoDescription(url);
      if (descResult.status === "SUCCESS") {
        const data = await extractRecipeFromTranscript(descResult.content, profile || undefined);
        recipeData = data as RecipeData;
        extractedVia = "description";
      }
    } catch (_tier2Error) {
      console.warn("Tier 2 (Description) Gemini call failed, will try Tier 3.");
    }
  }

  // --- TIER 3: Native Video Understanding ---
  if (!recipeData) {
    try {
      console.log("Trying Tier 3 (Video Understanding)...");
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("AI_TIMEOUT")), 45000);
      });

      try {
        const videoResult = await Promise.race([
          extractRecipeFromVideo(url, userContext),
          timeoutPromise
        ]).finally(() => {
          if (timeoutId) clearTimeout(timeoutId);
        }) as VideoUnderstandingResult;
        
        if (videoResult.status === "SUCCESS") {
          const { RecipeDataSchema } = await import("@/schemas/recipe");
          const cleanJson = videoResult.rawAiResponse.replace(/```[a-z]*/gi, "").trim();
          const data = RecipeDataSchema.parse(JSON.parse(cleanJson));
          recipeData = data as RecipeData;
          extractedVia = "video";
        }
      } catch (_tier3Error) {
        console.warn("Tier 3 (Video) Gemini call failed.");
      }
    } catch (_outerError) {
      console.warn("Tier 3 logic failed.");
    }
  }

  // --- TIER 4: Final Pivot ---
  if (!recipeData) {
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
