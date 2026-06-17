import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  // If no code, check for a hash (Implicit flow fallback)
  return new NextResponse(
    `<html>
      <body>
        <p>Completing login...</p>
        <script>
          // If there's a hash, we need to let the client SDK handle it
          // But ideally, we want to stay in the PKCE flow.
          if (window.location.hash) {
            window.location.href = '/auth/login' + window.location.hash;
          } else {
            window.location.href = '/auth/login?error=No+authentication+code+found';
          }
        </script>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
