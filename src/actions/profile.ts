"use server";

import { getSupabaseServer, ensureUserProfile } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function syncProfile() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  await ensureUserProfile(user);
  revalidateTag(`profile-${user.id}`, "max");
  revalidatePath("/profile");
}

export async function updateProfile(updates: {
  full_name?: string;
  dietary_goals?: string[];
  serving_default?: number;
}) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag(`profile-${user.id}`, "max");
  revalidatePath("/profile");
}
