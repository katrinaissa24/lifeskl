"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * "Continue without signing in" — creates a throwaway anonymous Supabase
 * session so a visitor can try the full app (streaks, XP, progress) before
 * committing to an account. Requires "Allow anonymous sign-ins" to be enabled
 * in the Supabase dashboard (Authentication → Sign In / Providers → Anonymous).
 *
 * The on_auth_user_created trigger still fires for anonymous users, so they get
 * a real profile (username "learner…") and flow through onboarding like anyone
 * else. Migration 0004 makes that trigger tolerate the missing username/email.
 */
export function GuestContinue() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function continueAsGuest() {
    if (!isSupabaseConfigured || pending) return;
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      // Most likely cause: anonymous sign-ins aren't enabled on the project yet.
      setError(error.message);
      setPending(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <>
      <div className="or-divider" aria-hidden="true">
        <span>or</span>
      </div>

      <button
        className="btn btn-out btn-block"
        type="button"
        onClick={continueAsGuest}
        disabled={pending || !isSupabaseConfigured}
      >
        {pending ? "Setting up…" : "Continue without signing in"}
      </button>

      <p className="muted center" style={{ marginTop: 10, fontSize: "0.82rem" }}>
        Try everything as a guest. Create an account later to keep your streak.
      </p>

      {error && (
        <div className="fb show bad">
          <b>Couldn&apos;t start a guest session.</b>
          {error}
        </div>
      )}
    </>
  );
}
