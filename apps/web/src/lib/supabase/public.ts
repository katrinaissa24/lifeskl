import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cookieless Supabase client for public, non-user-specific reads — the course
 * catalog and published lesson content (both `anon`-readable via RLS).
 *
 * Because it never touches session cookies, callers can wrap these reads in
 * `unstable_cache` for cross-request caching, which the cookie-bound SSR
 * client (lib/supabase/server) cannot do.
 */
export function createPublicClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
