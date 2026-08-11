# Culinara: TODO & Needs Attention

## Critical Fixes (Build Blockers)
- [ ] **Fix ESLint errors in `src/app/offline/page.tsx`**: Replace raw apostrophes with `&apos;` to fix `react/no-unescaped-entities`.
- [ ] **Fix Type errors in `src/lib/youtube/transcript.ts`**: Replace `any` type with proper TypeScript definitions.

## Performance & Quality Improvements
- [ ] **Optimize Image Loading**: Replace all raw `<img>` elements (flagged by `@next/next/no-img-element` in `SavedClient.tsx`, `ProfileClient.tsx`, and `recipe-workspace/index.tsx`) with `<Image />` from `next/image` to improve LCP and CLS.
- [ ] **Clean Up Unused Code**: Remove unused imports and variables across the project (e.g., unused `_err` parameters, unused icons like `ShoppingBag`, `ShoppingCart`, `Utensils`).

## Architectural Concerns
- [ ] **YouTube Scraping Robustness**: Monitor Tier 2 and Tier 3 failures. If YouTube scraping defenses trigger too frequently on Vercel's IP ranges, consider a dedicated proxy service for YouTube requests.
- [ ] **Serverless Execution Budget**: Optimize the 4-tier pipeline to fit within Vercel's 10-second limit. Consider splitting the extraction into a background job or moving to an edge-friendly implementation.
- [ ] **Offline Capability**: Enhance Service Worker (`sw.js`) to support caching for saved recipes so they are accessible offline, rather than just redirecting to an `/offline` page.
