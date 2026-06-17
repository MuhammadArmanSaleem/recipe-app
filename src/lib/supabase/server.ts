import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Supabase Server Client factory (Singleton Pattern)
 */
export const getSupabaseServer = cache(async () => {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables (URL or ANON_KEY)");
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn(`Failed to set cookie "${name}":`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            console.warn(`Failed to remove cookie "${name}":`, error);
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
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  const supabase = serviceRoleKey && supabaseUrl
    ? createClient(supabaseUrl, serviceRoleKey)
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
    console.error(`[CRITICAL] Profile creation failed for user ${user.id}:`, {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw new Error(`Profile creation failed: ${error.message}`);
  }
};
