import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { createClient } from "@supabase/supabase-js";
import { fetchAndCleanTranscript, extractYoutubeVideoId } from "@/lib/youtube/transcript";
import { normalizeAiResponse } from "@/lib/ai/utils";
import { fetchVideoDescription } from "@/lib/youtube/description";
import { extractRecipeFromVideoUrl } from "@/lib/youtube/geminiVideo";
import { extractRecipeFromText } from "@/lib/youtube/geminiText";
import { RecipeDataSchema } from "@/schemas/recipe";
import { RecipeData } from "@/types/recipe";

// Configure maximum duration for sequential extraction (5 mins)
export const maxDuration = 300;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handler(req: Request) {
  let jobId: string | undefined;
  
  try {
    const body = await req.json();
    jobId = body.jobId;
    
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    // 1. Get job and check idempotency (atomic claim)
    const { data: job, error: jobError } = await supabaseAdmin
      .from("extraction_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "completed") {
      return NextResponse.json({ success: true, message: "Job already completed" });
    }
    
    if (job.status === "processing") {
      return NextResponse.json({ success: true, message: "Job already processing" });
    }

    // 2. Mark as processing conditionally (atomic)
    const { data: updatedJob, error: startError } = await supabaseAdmin
      .from("extraction_jobs")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", jobId)
      .eq("status", "pending")
      .select();

    if (startError || !updatedJob || updatedJob.length === 0) {
      throw new Error(`Failed to claim job or job already claimed`);
    }

    // 3. Perform Extraction (4-Tier logic)
    const recipeData = await runExtractionPipeline(job.url, job.user_id);

    if (recipeData) {
      // 4. Update Job with result
      const { error: finalError } = await supabaseAdmin
        .from("extraction_jobs")
        .update({ 
          status: "completed", 
          result: recipeData,
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId);

      if (finalError) throw new Error(`Failed to complete job record: ${finalError.message}`);
    } else {
      throw new Error("All extraction tiers failed to yield a recipe.");
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[WORKER ERROR] Job ${jobId}:`, errorMsg);
    
    if (jobId) {
      // Persist generic error to job record
      await supabaseAdmin
        .from("extraction_jobs")
        .update({ 
          status: "failed", 
          error: "Extraction failed. Please try again.",
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId);
    }
    
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}

async function runExtractionPipeline(url: string, userId: string): Promise<RecipeData | null> {
  // ... (previous setup context)
  const videoId = extractYoutubeVideoId(url);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  // ...

    // --- TIER 1: Video Understanding ---
    try {
      const tier1 = await extractRecipeFromVideoUrl(url, userContext);
      if (tier1.status === "SUCCESS") {
        recipeData = await validateAndParse(tier1.rawAiResponse);
      }
    } catch (e) {
      console.warn("Tier 1 failed:", e);
    }

    // --- TIER 2: Transcript ---
    if (!recipeData) {
      try {
        const transcript = await fetchAndCleanTranscript(url);
        if (transcript.status === "SUCCESS") {
          const tier2 = await extractRecipeFromText(transcript.transcript, userContext);
          if (tier2.status === "SUCCESS") recipeData = await validateAndParse(tier2.rawAiResponse);
        }
      } catch (e) {
        console.warn("Tier 2 failed:", e);
      }
    }

    // --- TIER 3: Description ---
    if (!recipeData) {
      try {
        const desc = await fetchVideoDescription(url);
        if (desc.status === "SUCCESS") {
          const tier3 = await extractRecipeFromText(`${desc.videoTitle}\n\n${desc.content}`, userContext);
          if (tier3.status === "SUCCESS") recipeData = await validateAndParse(tier3.rawAiResponse);
        }
      } catch (e) {
        console.warn("Tier 3 failed:", e);
      }
    }

    if (recipeData) {
      // 5. Persist to recipes table
      const { data: recipe, error: recipeError } = await supabaseAdmin
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
        
      if (recipeError || !recipe) throw new Error(`Failed to insert recipe: ${recipeError?.message}`);
        
      // 6. Persist version
      const { data: version, error: versionError } = await supabaseAdmin
        .from("recipe_versions")
        .insert({
          recipe_id: recipe.id,
          version_number: 1,
          recipe_data: recipeData,
        })
        .select()
        .single();
      
      if (versionError || !version) {
        // Cleanup orphaned recipe row to maintain integrity
        await supabaseAdmin.from("recipes").delete().eq("id", recipe.id);
        throw new Error(`Failed to insert recipe version: ${versionError?.message}`);
      }
      
      const { error: updateError } = await supabaseAdmin
          .from("recipes")
          .update({ current_version_id: version.id })
          .eq("id", recipe.id);

      if (updateError) throw new Error(`Failed to update recipe with version ID: ${updateError.message}`);

      return { ...recipeData, id: recipe.id };
    }
  } catch (e) {
    console.error("Pipeline execution error:", e);
    throw e;
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
    console.warn("Validation/Parsing failed", e);
  }
  return null;
}

// Sign with QStash keys if available, otherwise fallback to handler
export const POST = (process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY)
  ? verifySignatureAppRouter(handler)
  : handler;
