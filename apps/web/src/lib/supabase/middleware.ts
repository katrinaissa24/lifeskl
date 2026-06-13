import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/home",
  "/course",
  "/lesson",
  "/profile",
  "/settings",
  "/notifications",
  "/onboarding",
  "/u/",
];
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Refreshes the Supabase session cookie on every request (required for SSR
 * auth) and enforces the route rules: app pages need a user, and signed-in
 * users get bounced off the login/signup pages.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    // Keys not pasted yet — let everything through; pages show setup notices.
    return supabaseResponse;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: do not run code between createServerClient and getUser() —
  // a subtle gap here can cause random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAuthPage = AUTH_PAGES.includes(path);

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((c) => redirect.cookies.set(c.name, c.value));
    return redirect;
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((c) => redirect.cookies.set(c.name, c.value));
    return redirect;
  }

  return supabaseResponse;
}
