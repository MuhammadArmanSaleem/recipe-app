# Performance Audit & Hardening Report

This document outlines the performance optimizations and security hardening implemented for Culinara.

## 1. Perceived Performance (UX)
*   **Loading Skeletons:** Added `loading.tsx` to all dashboard routes (`/`, `/saved`, `/profile`). This eliminates "blank flashes" and provides immediate visual feedback.
*   **Tactile Feedback:** Integrated `sonner` toasts for all long-running server actions (AI extraction, modification).

## 2. Data Fetching & Caching
*   **Singleton Supabase Client:** Refactored `getSupabaseServer` in `lib/supabase/server.ts` using React `cache()`. The client is now initialized only once per request.
*   **Parallel Fetching:** Replaced sequential `await` calls in `extractRecipe` and `modifyRecipe` with `Promise.all()`. This reduces server action latency by fetching profile context and transcripts concurrently.
*   **Caching Layer:** Implemented `unstable_cache` in `services/recipe.ts` for profile and recipe list reads.
    *   **Tags:** `profile-{userId}`, `recipes-{userId}`.
    *   **Revalidation:** Profile (60s), Recipes (30s).
*   **Cache Invalidation:** Added `revalidateTag` to all mutating server actions (Save, Delete, Update Profile) to ensure data consistency.

## 3. Security & Rate Limiting
*   **AI Throttling:** Integrated Upstash Redis rate limiting in `lib/ratelimit.ts`.
    *   **AI Enhance/Pantry:** 5 calls per minute per user.
    *   **Extraction:** 10 calls per hour per user.
*   **Early Ownership Checks:** `modifyRecipe` now validates recipe ownership *before* calling the Gemini API, preventing unauthorized token usage.
*   **Timeout Protection:** Wrapped all Gemini calls in a 30-second `Promise.race` timeout to prevent runaway requests and serverless function hangs.

## 4. Scalability Architecture
*   **Database Schema:** Corrected the `recipes` table to support Pantry mode with nullable `original_url` and a source-specific `CHECK CONSTRAINT`.
*   **Indexes:** Added PostgreSQL indexes on `recipes(user_id, created_at)` and `recipe_versions(recipe_id, version_number)` for fast list views and version retrieval.

## Next Steps
*   [ ] Enable Supabase connection pooling (port 6543) in production environment.
*   [ ] Implement token-streaming for AI responses to further reduce TTFB (Time to First Byte).
*   [ ] Add Vercel Speed Insights for real-world RUM (Real User Monitoring).
