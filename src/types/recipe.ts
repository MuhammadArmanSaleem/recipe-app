import { z } from "zod";
import { RecipeDataSchema, IngredientSchema, InstructionSchema, NutritionSchema } from "@/schemas/recipe";

export type Nutrition = z.infer<typeof NutritionSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type Instruction = z.infer<typeof InstructionSchema>;

export type RecipeData = z.infer<typeof RecipeDataSchema> & {
  originalUrl?: string | null;
  version?: number;
  id?: string;
};

// Represents the full database object including metadata
export interface Recipe {
  id: string;
  created_at: string;
  user_id: string;
  original_url?: string | null;
  thumbnail_url?: string | null;
  source: 'youtube' | 'pantry';
  status: "processing" | "completed" | "failed";
  current_version_id?: string | null;
  extractedVia?: "transcript" | "description" | "video";
  
  // These map to the parsed RecipeData from the active recipe_version
  title: string;
  prepTime: string;
  tailoredFor: string[];
  missingIngredients: string[];
  nutrition: Nutrition;
  ingredients: Ingredient[];
  instructions: Instruction[];
}

export interface RecipeVersion {
  id: string;
  recipe_id: string;
  version_number: number;
  prompt_used?: string | null;
  created_at: string;
  recipe_data: RecipeData;
}
