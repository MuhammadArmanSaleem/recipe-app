// src/lib/youtube/videoUnderstanding.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL } from "../ai/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type UserContext = {
  dietaryGoals: string[];
  servingDefault: number;
};

export type VideoUnderstandingResult =
  | { status: "SUCCESS"; rawAiResponse: string }
  | { status: "VIDEO_UNREADABLE"; reason: string }
  | { status: "AI_ERROR"; reason: string };

export async function extractRecipeFromVideo(
  youtubeUrl: string,
  userContext: UserContext
): Promise<VideoUnderstandingResult> {
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

  // 45-second timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "video/youtube",
          fileUri: youtubeUrl,
        },
      },
      { text: prompt },
    ]);
    
    clearTimeout(timeoutId);
    
    const responseText = result.response.text();
    
    try {
        const parsed = JSON.parse(responseText.replace(/```json|```/g, ""));
        if (parsed.error === "VIDEO_UNREADABLE") {
            return { status: "VIDEO_UNREADABLE", reason: "AI could not parse recipe" };
        }
        return { status: "SUCCESS", rawAiResponse: responseText };
    } catch {
        return { status: "AI_ERROR", reason: "Malformed JSON" };
    }
  } catch (err: unknown) {
    const error = err as Error;
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
        return { status: "AI_ERROR", reason: "Video processing timed out" };
    }
    return { status: "AI_ERROR", reason: error.message };
  }
}
