import { z } from "zod";

const numericField = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") return 0;
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : parsed;
}, z.number().default(0));

export const NutritionSchema = z.object({
  calories: z.coerce.string().optional().default("0"),
  protein: z.coerce.string().optional().default("0"),
  carbs: z.coerce.string().optional().default("0"),
  fat: z.coerce.string().optional().default("0"),
});

export const IngredientSchema = z.object({
  id: z.string().default("no-id"),
  name: z.string().default("Unknown ingredient"),
  amount: z.coerce.string().default(""),
  unit: z.string().optional().default(""),
  checked: z.boolean().default(false),
});

export const InstructionSchema = z.object({
  id: z.string().default("no-id"),
  order: numericField,
  description: z.string().default("No description"),
});

export const RecipeDataSchema = z.object({
  title: z.string(),
  prepTime: z.string().optional().default("15 mins"),
  nutrition: NutritionSchema.default({
    calories: "0",
    protein: "0",
    carbs: "0",
    fat: "0"
  }),
  ingredients: z.array(IngredientSchema),
  instructions: z.array(InstructionSchema),
  tailoredFor: z.array(z.string()).optional().default([]),
  missingIngredients: z.array(z.string()).optional().default([]),
});

// Used to structure the output specifically for Gemini extraction
export const GeminiRecipeOutputSchema = z.object({
  title: z.string().describe("The name of the recipe"),
  prepTime: z.string().optional().describe("Estimated preparation and cooking time, e.g. '15 mins'"),
  nutrition: NutritionSchema.describe("Nutritional information per serving"),
  ingredients: z.array(z.object({
    id: z.string().describe("A unique string ID for this ingredient, e.g. 'ing-1'"),
    name: z.string().describe("The name of the ingredient, e.g. 'Chicken Breast'"),
    amount: z.union([z.number(), z.string()]).describe("The quantity, e.g. 200 or '1/2'"),
    unit: z.string().optional().describe("The measurement unit, e.g. 'g', 'cup', 'tbsp'")
  })),
  instructions: z.array(z.object({
    id: z.string().describe("A unique string ID for this step, e.g. 'step-1'"),
    order: z.number().describe("The sequence number of the step starting from 1"),
    description: z.string().describe("Detailed cooking instruction")
  })),
});
