import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL } from "../ai/config";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export type GeminiVideoResult =
  | { status: "SUCCESS"; rawAiResponse: string }
  | { status: "VIDEO_UNREADABLE" }
  | { status: "AI_ERROR"; reason: string };

export async function extractRecipeFromVideoUrl(
  youtubeUrl: string,
  userContext: { dietaryGoals: string[]; servingDefault: number },
  signal?: AbortSignal
): Promise<GeminiVideoResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

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

  // Internal 45-second timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  // Link signal if provided
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
    const result = await model.generateContent(
      [
        {
          fileData: {
            mimeType: "video/youtube",
            fileUri: youtubeUrl,
          },
        },
        { text: prompt },
      ],
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const responseText = result.response.text();
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
    const error = err as Error;
    if (error.name === "AbortError" || signal?.aborted) {
      return { status: "AI_ERROR", reason: "Video processing timed out or aborted" };
    }
    return { status: "AI_ERROR", reason: error.message || "Unknown error" };
  }
}
