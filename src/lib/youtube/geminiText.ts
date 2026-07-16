import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL } from "../ai/config";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export type GeminiTextResult =
  | { status: "SUCCESS"; rawAiResponse: string }
  | { status: "AI_ERROR"; reason: string };

export async function extractRecipeFromText(
  text: string,
  userContext: { dietaryGoals: string[]; servingDefault: number }
): Promise<GeminiTextResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `
    You are an expert culinary AI assistant. Extract a complete recipe from the following text (which is a YouTube transcript or video description).
    The user has these kitchen preferences:
    - Target Servings: ${userContext.servingDefault} people
    - Dietary Goals: ${userContext.dietaryGoals.join(", ") || "none specified"}

    Rules:
    1. Identify the original yield if possible, then scale all ingredient amounts to exactly ${userContext.servingDefault} servings.
    2. Apply dietary substitutions for: ${userContext.dietaryGoals.join(", ")}.
    3. Return a JSON object with this exact structure:
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
    4. Return ONLY the raw JSON object. No markdown.
    
    Text:
    ${text}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```[a-z]*/gi, "").trim();
    return { status: "SUCCESS", rawAiResponse: cleanJson };
  } catch (err: unknown) {
    const error = err as Error;
    return { status: "AI_ERROR", reason: error.message || "Unknown error" };
  }
}
