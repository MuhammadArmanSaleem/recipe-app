"use server";

import { getSupabaseServer, ensureUserProfile } from "@/lib/supabase/server";
import { youtubeUrlSchema } from "@/lib/validation/youtube";
import { checkRateLimit } from "@/lib/ratelimit";
import { Client } from "@upstash/qstash";
import { normalizeYoutubeUrl } from "@/lib/utils/url";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export type ExtractRecipeResult =
  | { success: true; jobId: string }
  | { success: false; error: string };

export async function extractRecipe(rawUrl: string): Promise<ExtractRecipeResult> {
  const url = normalizeYoutubeUrl(rawUrl);
  
  const parsedUrl = youtubeUrlSchema.safeParse(url);
  if (!parsedUrl.success) return { success: false, error: "Please enter a valid YouTube URL." };

  const supabase = await getSupabaseServer();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return { success: false, error: "Unauthenticated. Please sign in." };

  // Rate Limit Check
  const ratelimit = await checkRateLimit(user.id, 'extract');
  if (!ratelimit.allowed) {
    return { success: false, error: `Slow down, chef! Try again in ${ratelimit.retryAfter} seconds.` };
  }

  await ensureUserProfile(user);

  // 1. Create Job record
  const { data: job, error: jobError } = await supabase
    .from("extraction_jobs")
    .insert({
      user_id: user.id,
      url: url,
      status: "pending",
    })
    .select()
    .single();

  if (jobError || !job) {
    console.error("Job creation failed:", jobError);
    return { success: false, error: "Failed to initialize extraction job." };
  }

  // 2. Enqueue via QStash
  const callbackUrl = process.env.QSTASH_CALLBACK_URL;
  if (!callbackUrl) {
    console.error("CRITICAL: QSTASH_CALLBACK_URL is not configured.");
    return { success: false, error: "Server configuration error. Please try again later." };
  }

  try {
    await qstash.publishJSON({
      url: callbackUrl,
      body: { jobId: job.id },
      retries: 3,
    });
  } catch (err) {
    console.error("QStash enqueue failed:", err);
    // Cleanup job if enqueueing failed
    await supabase.from("extraction_jobs").delete().eq("id", job.id);
    return { success: false, error: "Failed to queue extraction. Please try again." };
  }

  return { success: true, jobId: job.id };
}
