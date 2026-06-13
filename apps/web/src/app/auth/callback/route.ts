import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lands here after a user clicks the confirmation link in their signup email
// (PKCE flow: Supabase redirects back with a one-time ?code=).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirm`);
}
