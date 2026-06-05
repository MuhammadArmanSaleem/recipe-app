export type RecipeGoal = "High Protein" | "Low Calorie" | "Bulk" | "Keto" | "Quick" | "Budget";

export interface Ingredient {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  checked: boolean;
}

export interface RecipeStep {
  id: string;
  order: number;
  description: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  prepTime: string;
  goals: RecipeGoal[];
  ingredients: Ingredient[];
  instructions: RecipeStep[];
}

export interface TransformationRequest {
  url: string;
  prompt?: string;
}
