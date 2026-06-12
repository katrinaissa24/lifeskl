// Static process.env access so Next.js can inline these in client bundles.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True once the user has pasted their Supabase keys into .env.local.
 * Every Supabase touchpoint checks this first so the app degrades gracefully
 * (landing renders, auth pages show a setup notice) instead of crashing.
 */
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
