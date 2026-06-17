import { getSupabaseServer } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";

  // Ensure next is a relative path (starts with / but not //)
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") 
    ? nextParam 
    : "/";

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
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
