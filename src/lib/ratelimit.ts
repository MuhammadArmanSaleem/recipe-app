import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only initialize if environment variables are present
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export const aiRatelimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 AI calls per user per minute
      analytics: true,
      prefix: "culinara:ai",
    })
  : null;

export const extractionLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 extractions per user per hour
      prefix: "culinara:extract",
    })
  : null;

/**
 * Helper to check rate limit in Server Actions.
 * Returns true if allowed, false if limited.
 */
export async function checkRateLimit(userId: string, type: 'ai' | 'extract'): Promise<{ allowed: boolean, retryAfter?: number }> {
  const limiter = type === 'ai' ? aiRatelimit : extractionLimit;
  
  if (!limiter) return { allowed: true }; // Bypass if no Redis configured

  try {
    const { success, reset } = await limiter.limit(userId);
    const now = Date.now();
    const retryAfter = Math.max(0, Math.ceil((reset - now) / 1000));

    return { 
      allowed: success, 
      retryAfter 
    };
  } catch (error) {
    console.error("Rate limit check failed (Upstash/Redis error):", error);
    return { allowed: true }; // Fail-open
  }
}
