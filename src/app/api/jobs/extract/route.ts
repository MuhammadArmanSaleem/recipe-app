import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchAndCleanTranscript, extractYoutubeVideoId } from "@/lib/youtube/transcript";
import { normalizeAiResponse } from "@/lib/ai/gemini";
import { fetchVideoDescription } from "@/lib/youtube/description";
import { extractRecipeFromVideoUrl } from "@/lib/youtube/geminiVideo";
import { extractRecipeFromText } from "@/lib/youtube/geminiText";
import { RecipeDataSchema } from "@/schemas/recipe";
import { RecipeData } from "@/types/recipe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handler(req: Request) {
  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

  // 1. Get job
  const { data: job, error: jobError } = await supabaseAdmin
    .from("extraction_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  await supabaseAdmin
    .from("extraction_jobs")
    .update({ status: "processing" })
    .eq("id", jobId);

  // 2. Perform Extraction (4-Tier logic)
  const recipeData = await runExtractionPipeline(job.url, job.user_id);

  // 3. Update Job & Persist Recipe
  if (recipeData) {
    // Save to recipes table...
    // (Logic moved from server action)
    await supabaseAdmin
      .from("extraction_jobs")
      .update({ status: "completed", result: recipeData })
      .eq("id", jobId);
  } else {
    await supabaseAdmin
      .from("extraction_jobs")
      .update({ status: "failed", error: "Extraction failed" })
      .eq("id", jobId);
  }

  return NextResponse.json({ success: true });
}

async function runExtractionPipeline(url: string, userId: string): Promise<RecipeData | null> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("dietary_goals, serving_default")
    .eq("id", userId)
    .single();
    
  const userContext = {
    dietaryGoals: profile?.dietary_goals || [],
    servingDefault: profile?.serving_default || 2
  };

  let recipeData: RecipeData | null = null;
  const videoId = extractYoutubeVideoId(url);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
    : "https://img.youtube.com/vi/default.jpg";

  // --- TIER 1: Video Understanding ---
  const tier1 = await extractRecipeFromVideoUrl(url, userContext, new AbortController().signal);
  if (tier1.status === "SUCCESS") {
    recipeData = await validateAndParse(tier1.rawAiResponse);
  }

  // --- TIER 2: Transcript ---
  if (!recipeData) {
    const transcript = await fetchAndCleanTranscript(url);
    if (transcript.status === "SUCCESS") {
      const tier2 = await extractRecipeFromText(transcript.transcript, userContext);
      if (tier2.status === "SUCCESS") recipeData = await validateAndParse(tier2.rawAiResponse);
    }
  }

  // --- TIER 3: Description ---
  if (!recipeData) {
    const desc = await fetchVideoDescription(url);
    if (desc.status === "SUCCESS") {
      const tier3 = await extractRecipeFromText(`${desc.videoTitle}\n\n${desc.content}`, userContext);
      if (tier3.status === "SUCCESS") recipeData = await validateAndParse(tier3.rawAiResponse);
    }
  }

  if (recipeData) {
    // Persist to recipes table
    const { data: recipe } = await supabaseAdmin
      .from("recipes")
      .insert({
        user_id: userId,
        original_url: url,
        source: 'youtube',
        status: "completed",
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single();
      
    // Persist version
    const { data: version } = await supabaseAdmin
      .from("recipe_versions")
      .insert({
        recipe_id: recipe.id,
        version_number: 1,
        recipe_data: recipeData,
      })
      .select()
      .single();
    
    await supabaseAdmin
        .from("recipes")
        .update({ current_version_id: version.id })
        .eq("id", recipe.id);

    return { ...recipeData, id: recipe.id };
  }
  
  return null;
}

async function validateAndParse(rawAiResponse: string): Promise<RecipeData | null> {
  try {
    const cleanJson = rawAiResponse.replace(/```[a-z]*/gi, "").trim();
    const parsed = JSON.parse(cleanJson);
    const normalized = normalizeAiResponse(parsed);
    if (normalized && !("error" in normalized)) {
        return RecipeDataSchema.parse(normalized) as RecipeData;
    }
  } catch (e) {
    console.error("Parsing failed", e);
  }
  return null;
}

// FIXME: Proper App Router signature verification needed
export const POST = handler;
