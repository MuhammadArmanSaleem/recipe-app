import { GoogleGenerativeAI, Content, GenerationConfig } from "@google/generative-ai";
import { RecipeDataSchema } from "@/schemas/recipe";
import type { RecipeData } from "@/types/recipe";
import { GEMINI_MODEL } from "./config";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = GEMINI_MODEL;          // gemini-2.5-flash
const FALLBACK_MODEL = "gemini-2.0-flash";   // High availability fallback

const SYSTEM_INSTRUCTION = `
You are a master culinary AI assistant.
You MUST return valid JSON matching the requested schema.
You may ONLY extract or modify recipes.
If a piece of information is missing, DO NOT OMIT THE FIELD. Instead, provide a sensible default placeholder (e.g., "Unknown", "No description", 0).
Do not return markdown formatting blocks (e.g. \`\`\`json).
Do not return explanations, conversational filler, or introductory text.
Return ONLY the raw JSON object.

CRITICAL: Use ONLY lowercase field names: 
"title", "prepTime", "nutrition", "ingredients", "instructions", "id", "name", "amount", "unit", "order", "description", "calories", "protein", "carbs", "fat", "tailoredFor", "missingIngredients".

ERROR HANDLING: If the user input is gibberish or impossible to cook with, return:
{ "error": "User friendly explanation of why recipe couldn't be generated" }
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

interface UserPreferences {
  dietary_goals: string[];
  serving_default: number;
}

interface NormalizedNutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

interface NormalizedIngredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
}

interface NormalizedInstruction {
  id: string;
  order: number;
  description: string;
}

export interface NormalizedRecipe {
  title: string;
  prepTime: string;
  tailoredFor: string[];
  missingIngredients: string[];
  nutrition: NormalizedNutrition;
  ingredients: NormalizedIngredient[];
  instructions: NormalizedInstruction[];
  error?: string;
}

/**
 * Normalizes AI response to handle common casing variations (PascalCase, CamelCase, snake_case) 
 * and ensures basic structure exists before Zod validation.
 */
export function normalizeAiResponse(data: unknown): NormalizedRecipe | { error: string } {
  if (!data) return { error: "Empty AI response" };
  
  const obj = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
  if (!obj || typeof obj !== "object") return { error: "Invalid AI response format" };

  const err = (obj.error || obj.Error) as string | undefined;
  if (err) return { error: err };

  const normalized: Partial<NormalizedRecipe> = {};

  normalized.title = (obj.title || obj.Title || "Untitled Recipe") as string;
  normalized.prepTime = (obj.prepTime || obj.prep_time || obj.PrepTime || "15 mins") as string;
  normalized.tailoredFor = Array.isArray(obj.tailoredFor) ? (obj.tailoredFor as string[]) : (Array.isArray(obj.TailoredFor) ? (obj.TailoredFor as string[]) : []);
  normalized.missingIngredients = Array.isArray(obj.missingIngredients) ? (obj.missingIngredients as string[]) : (Array.isArray(obj.MissingIngredients) ? (obj.MissingIngredients as string[]) : []);
  
  const nut = (obj.nutrition || obj.Nutrition || {}) as Record<string, unknown>;
  normalized.nutrition = {
    calories: String(nut.calories || nut.Calories || "0"),
    protein: String(nut.protein || nut.Protein || "0"),
    carbs: String(nut.carbs || nut.Carbs || "0"),
    fat: String(nut.fat || nut.Fat || "0"),
  };

  const ings = (Array.isArray(obj.ingredients) ? obj.ingredients : (Array.isArray(obj.Ingredients) ? obj.Ingredients : [])) as Record<string, unknown>[];
  normalized.ingredients = ings.map((ing, idx) => ({
    id: (ing.id || ing.Id || `ing-${idx + 1}`) as string,
    name: (ing.name || ing.Name || "Unknown ingredient") as string,
    amount: String(ing.amount || ing.Amount || ""),
    unit: (ing.unit || ing.Unit || "") as string,
    checked: false
  }));

  const insts = (Array.isArray(obj.instructions) ? obj.instructions : (Array.isArray(obj.Instructions) ? obj.Instructions : [])) as Record<string, unknown>[];
  normalized.instructions = insts.map((inst, idx) => ({
    id: (inst.id || inst.Id || `step-${idx + 1}`) as string,
    order: Number(inst.order || inst.Order || idx + 1),
    description: (inst.description || inst.Description || inst.text || inst.Text || "No description") as string
  }));

  return normalized as NormalizedRecipe;
}

function is503(error: unknown): boolean {
  const err = error as { status?: number; message?: string };
  return (
    err?.status === 503 ||
    String(err?.message ?? "").includes("503") ||
    String(err?.message ?? "").includes("Service Unavailable") ||
    String(err?.message ?? "").includes("high demand")
  );
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  label = "Gemini call"
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      if (!is503(err)) throw err;
      const waitMs = attempt * 2000;
      console.warn(`${label}: 503 received (attempt ${attempt}/${retries}). Retrying in ${waitMs / 1000}s…`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastError;
}

async function generateWithFallback(
  contents: Content[],
  generationConfig: GenerationConfig
): Promise<string> {
  const request = { contents, systemInstruction: SYSTEM_INSTRUCTION, generationConfig };

  try {
    const primaryModel = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await withRetry(() => primaryModel.generateContent(request), 3, `Model ${PRIMARY_MODEL}`);
    return result.response.text();
  } catch (primaryErr: unknown) {
    if (!is503(primaryErr)) throw primaryErr;
    console.warn(`${PRIMARY_MODEL} persistently unavailable. Falling back to ${FALLBACK_MODEL}…`);
    const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    const result = await withRetry(() => fallbackModel.generateContent(request), 2, `Model ${FALLBACK_MODEL}`);
    return result.response.text();
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function extractRecipeFromTranscript(
  transcriptText: string,
  preferences?: UserPreferences
): Promise<RecipeData> {
  const prefContext = preferences ? `
    USER KITCHEN PREFERENCES (MANDATORY):
    - Target Servings: ${preferences.serving_default} people
    - Dietary Goals: ${preferences.dietary_goals.join(", ")}
    SCALING RULES:
    1. You MUST first identify the original yield. 
    2. Multiply amounts to match ${preferences.serving_default} people.
    3. In "tailoredFor", add "Scaled for ${preferences.serving_default} people".
  ` : "";

  const prompt = `Extract a structured recipe from the following transcript. ${prefContext} Transcript: ${transcriptText}`;

  try {
    const responseText = await generateWithFallback(
      [{ role: "user", parts: [{ text: prompt }] }],
      { responseMimeType: "application/json" }
    );
    const parsedJson = JSON.parse(responseText.replace(/```json|```/g, "")) as unknown;
    const normalizedData = normalizeAiResponse(parsedJson);
    if ("error" in normalizedData) throw new Error(normalizedData.error);
    const validatedData = RecipeDataSchema.parse(normalizedData);
    if (validatedData.ingredients.length === 0) throw new Error("AI failed to extract any ingredients.");
    return validatedData;
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string; errors?: unknown[] };
    console.error("--- Gemini Extraction Error ---");
    if (error.name === "ZodError") console.error("Zod Failed:", JSON.stringify(error.errors, null, 2));
    else console.error(error.message || error);
    if (is503(error)) throw new Error("Service busy. Try again soon.");
    throw new Error(`AI Extraction failed: ${error.message || "Unknown error"}`);
  }
}

export async function modifyRecipeWithAi(
  currentRecipe: RecipeData,
  userPrompt: string,
  preferences?: UserPreferences
): Promise<RecipeData> {
  const prefContext = preferences ? `Preferences: Servings=${preferences.serving_default}, Goals=${preferences.dietary_goals.join(", ")}` : "";
  const prompt = `Modify this recipe based on: "${userPrompt}". ${prefContext} Recipe: ${JSON.stringify(currentRecipe)}`;

  try {
    const responseText = await generateWithFallback(
      [{ role: "user", parts: [{ text: prompt }] }],
      { responseMimeType: "application/json" }
    );
    const parsedJson = JSON.parse(responseText.replace(/```json|```/g, "")) as unknown;
    const normalizedData = normalizeAiResponse(parsedJson);
    if ("error" in normalizedData) throw new Error(normalizedData.error);
    return RecipeDataSchema.parse(normalizedData);
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("--- Gemini Modify Error ---", error.message || error);
    throw new Error("Failed to modify recipe using AI.");
  }
}

export async function createRecipeFromPantry(
  ingredients: string,
  preferences?: UserPreferences
): Promise<RecipeData | { error: string }> {
  const prefContext = preferences ? `Servings=${preferences.serving_default}, Goals=${preferences.dietary_goals.join(", ")}` : "";
  const prompt = `Create a recipe from: "${ingredients}". ${prefContext}`;

  try {
    const responseText = await generateWithFallback(
      [{ role: "user", parts: [{ text: prompt }] }],
      { responseMimeType: "application/json" }
    );
    const parsedJson = JSON.parse(responseText.replace(/```json|```/g, "")) as unknown;
    const normalizedData = normalizeAiResponse(parsedJson);
    if ("error" in normalizedData) return { error: normalizedData.error || "AI error" };
    return RecipeDataSchema.parse(normalizedData);
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("--- Gemini Pantry Error ---", error.message || error);
    throw new Error("Chef Gemini is overwhelmed.");
  }
}
