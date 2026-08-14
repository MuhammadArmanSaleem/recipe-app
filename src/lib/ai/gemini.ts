import { GoogleGenAI } from "@google/genai";
import { RecipeDataSchema } from "@/schemas/recipe";
import type { RecipeData } from "@/types/recipe";
import { normalizeAiResponse } from "./utils";
import { Profile } from "@/types/profile";

type UserPreferences = Pick<Profile, 'dietary_goals' | 'serving_default'>;

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const PRIMARY_MODEL = "gemini-2.0-flash";

const SYSTEM_INSTRUCTION = `
You are a master culinary AI assistant.
Return valid JSON matching the requested schema.
Return ONLY the raw JSON object. No markdown.
`;

async function generateRecipeContent(prompt: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: PRIMARY_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return result.text ?? "";
}

export async function modifyRecipeWithAi(
  currentRecipe: RecipeData,
  userPrompt: string,
  preferences?: UserPreferences
): Promise<RecipeData> {
  const prompt = `
    CURRENT RECIPE: ${JSON.stringify(currentRecipe)}
    USER MODIFICATION: "${userPrompt}"
    USER PREFERENCES: ${JSON.stringify(preferences || {})}
    
    Apply the modification precisely. Return ONLY the modified JSON.
  `;
  
  const text = await generateRecipeContent(prompt);
  const normalized = normalizeAiResponse(JSON.parse(text.replace(/```[a-z]*/gi, "").trim()));
  
  if ("error" in normalized) throw new Error(normalized.error);
  return RecipeDataSchema.parse(normalized) as RecipeData;
}

export async function createRecipeFromPantry(
  ingredients: string,
  preferences?: UserPreferences
): Promise<RecipeData | { error: string }> {
  const prompt = `
    INGREDIENTS AVAILABLE: ${ingredients}
    USER PREFERENCES: ${JSON.stringify(preferences || {})}
    
    Create a detailed recipe. Return ONLY the JSON.
  `;
  
  try {
    const text = await generateRecipeContent(prompt);
    const normalized = normalizeAiResponse(JSON.parse(text.replace(/```[a-z]*/gi, "").trim()));
    return normalized;
  } catch (err) {
    return { error: "Failed to generate recipe from pantry items." };
  }
}
