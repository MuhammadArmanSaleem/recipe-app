import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_VIDEO_MODEL = "gemini-2.5-flash";

export type GeminiVideoResult =
  | { status: "SUCCESS"; rawAiResponse: string }
  | { status: "VIDEO_UNREADABLE" }
  | { status: "AI_ERROR"; reason: string };

const normalizeYoutubeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1).split('?')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    if (parsed.pathname.includes('/shorts/')) {
      const videoId = parsed.pathname.split('/shorts/')[1].split('?')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    const vParam = parsed.searchParams.get('v');
    if (vParam) {
      return `https://www.youtube.com/watch?v=${vParam}`;
    }
    return url;
  } catch {
    return url;
  }
};

export async function extractRecipeFromVideoUrl(
  youtubeUrl: string,
  userContext: { dietaryGoals: string[]; servingDefault: number },
  signal?: AbortSignal
): Promise<GeminiVideoResult> {
  const fullUrl = normalizeYoutubeUrl(youtubeUrl);

  const prompt = `
    You are an expert culinary AI. Watch this YouTube cooking video carefully.
    Extract a complete recipe from this video. The user has these preferences:

    Dietary goals: ${userContext.dietaryGoals.join(", ") || "none specified"}
    Serving size: ${userContext.servingDefault} people

    Return a JSON object with this exact structure:
    {
      "title": "Recipe name",
      "prepTime": "time string",
      "ingredients": [
        { "name": "ingredient name", "amount": "quantity with unit" }
      ],
      "instructions": ["Step 1...", "Step 2..."],
      "tailoredFor": ["dietary goal if substitution was made", "serving scaling"],
      "missingIngredients": []
    }

    Rules:
    1. Watch the ENTIRE video.
    2. Scale all ingredient amounts to exactly ${userContext.servingDefault} servings.
    3. Apply dietary substitutions for: ${userContext.dietaryGoals.join(", ")}.
    4. If you cannot identify a complete recipe, return exactly: { "error": "VIDEO_UNREADABLE" }
    5. Return ONLY the raw JSON object. No markdown.
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return { status: "AI_ERROR", reason: "Aborted by caller" };
    }
    signal.addEventListener("abort", () => {
      controller.abort();
    });
  }

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_VIDEO_MODEL,
      contents: [
        {
          parts: [
            {
              fileData: {
                mimeType: "video/youtube",
                fileUri: fullUrl,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    clearTimeout(timeoutId);

    const responseText = result.text ?? "";
    const cleanJson = responseText.replace(/```[a-z]*/gi, "").trim();

    try {
      const parsed = JSON.parse(cleanJson);
      if (parsed.error === "VIDEO_UNREADABLE") {
        return { status: "VIDEO_UNREADABLE" };
      }
      return { status: "SUCCESS", rawAiResponse: cleanJson };
    } catch {
      return { status: "SUCCESS", rawAiResponse: cleanJson };
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('[TIER 1 TIMEOUT] Falling through to Tier 2');
      return { status: "AI_ERROR", reason: "Timeout after 45s" };
    }
    console.error('[TIER 1 DETAILED ERROR]',
      err instanceof Error
        ? { message: err.message, stack: err.stack, name: err.name }
        : String(err)
    );
    return {
      status: "AI_ERROR",
      reason: err instanceof Error ? err.message : "Unknown error"
    };
  }
}
