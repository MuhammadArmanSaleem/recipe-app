import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next();
  }
  console.log("Proxy processing path:", request.nextUrl.pathname);
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  let user = null;
  let authCheckFailed = false;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    authCheckFailed = true;
    console.error("Proxy: Auth check failed (likely network/DNS issue):", err);
  }

  if (authCheckFailed) {
    return new NextResponse("Authentication service temporarily unavailable.", { status: 503 });
  }

  // If user is not signed in and trying to access a protected route, redirect to login
  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - auth (authentication routes)
     * - favicon.ico (favicon file)
     * - public (public assets)
     * - sw.js (service worker)
     * - manifest.webmanifest (PWA manifest)
     */
    "/((?!_next/static|_next/image|auth|favicon.ico|public|sw\\.js|manifest\\.webmanifest).*)",
  ],
};
