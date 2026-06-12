"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export function SignupForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured || pending) return;

    if (!USERNAME_RE.test(username)) {
      setError(
        "Username must be 3–24 characters: lowercase letters, numbers, and underscores only.",
      );
      return;
    }

    setPending(true);
    setError(null);

    const supabase = createClient();
    // The username travels in user metadata; the on_auth_user_created trigger
    // in Postgres turns it into a row in public.profiles.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    if (data.session) {
      // Email confirmation is disabled — user is signed in immediately.
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Email confirmation is on: tell them to check their inbox.
    setAwaitingConfirm(true);
    setPending(false);
  }

  if (awaitingConfirm) {
    return (
      <div className="center" style={{ padding: "14px 0" }}>
        <div style={{ fontSize: "2.6rem", color: "var(--accent)" }}>✉️</div>
        <h1>Check your inbox</h1>
        <p className="muted" style={{ fontWeight: 500, marginTop: 8 }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it and
          you&apos;ll land in your dashboard, ready for lesson one.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="eyebrow">Free forever to start</div>
      <h1>Create your account</h1>
      <p className="muted" style={{ fontWeight: 500 }}>
        Five minutes a day. The curriculum school skipped.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            type="text"
            autoComplete="username"
            placeholder="e.g. katrina_i"
            required
            minLength={3}
            maxLength={24}
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))
            }
          />
          <span className="hint">
            Your public handle — how friends will find you.
          </span>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="hint">At least 8 characters.</span>
        </div>

        {error && (
          <div className="fb show bad">
            <b>Hmm, that didn&apos;t work.</b>
            {error}
          </div>
        )}

        <button
          className="btn btn-accent btn-block"
          style={{ marginTop: 22 }}
          type="submit"
          disabled={pending || !isSupabaseConfigured}
        >
          {pending ? "Creating account…" : "Start learning — free →"}
        </button>
      </form>

      <p className="muted center" style={{ marginTop: 18, fontWeight: 600 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent-d)", fontWeight: 700 }}>
          Log in
        </Link>
      </p>
    </>
  );
}
