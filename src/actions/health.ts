// src/actions/health.ts
import { getSupabaseServer } from "@/lib/supabase/server";

export async function healthCheck() {
  try {
    const supabase = await getSupabaseServer();
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return { success: true, profileCount: count };
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Health check error", e);
    return { success: false, error: e.message };
  }
}
