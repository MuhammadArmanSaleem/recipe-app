import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Supabase Server Client factory (Singleton Pattern)
 */
export const getSupabaseServer = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (_error) {
            // Handle cookie set error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (_error) {
            // Handle cookie remove error
          }
        },
      },
    }
  );
});

/**
 * Ensures a user profile exists in the 'profiles' table.
 */
export const ensureUserProfile = async (user: { id: string; user_metadata?: { full_name?: string; avatar_url?: string }; email?: string }) => {
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    : await getSupabaseServer();
    
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) return;

  const { error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      dietary_goals: [],
      serving_default: 2,
    });

  if (error) {
    console.error("Failed to create user profile:", error);
    throw new Error(`Profile creation failed: ${error.message}`);
  }
};
