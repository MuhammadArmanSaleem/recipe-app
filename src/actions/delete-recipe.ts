"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteRecipe(id: string) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidateTag(`recipes-${user.id}`, "max");
  revalidatePath("/saved");
  revalidatePath("/");
}
