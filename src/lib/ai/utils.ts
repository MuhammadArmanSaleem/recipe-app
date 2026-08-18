export function normalizeAiResponse(data: any): any {
  if (!data || typeof data !== 'object') {
    return { error: "Invalid response format" };
  }
  // Ensure required fields exist, add defaults if missing
  return {
    ...data,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    instructions: Array.isArray(data.instructions) ? data.instructions : [],
    tailoredFor: Array.isArray(data.tailoredFor) ? data.tailoredFor : [],
  };
}
