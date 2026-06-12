"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmFailed = searchParams.get("error") === "confirm";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured || pending) return;
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <div className="eyebrow">Welcome back</div>
      <h1>Log in</h1>
      <p className="muted" style={{ fontWeight: 500 }}>
        Pick up right where your streak left off.
      </p>

      <form onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {(error || confirmFailed) && (
          <div className="fb show bad">
            <b>Couldn&apos;t log you in.</b>
            {error ?? "That confirmation link didn't work — try logging in, or sign up again."}
          </div>
        )}

        <button
          className="btn btn-accent btn-block"
          style={{ marginTop: 22 }}
          type="submit"
          disabled={pending || !isSupabaseConfigured}
        >
          {pending ? "Logging in…" : "Log in →"}
        </button>
      </form>

      <p className="muted center" style={{ marginTop: 18, fontWeight: 600 }}>
        New here?{" "}
        <Link href="/signup" style={{ color: "var(--accent-d)", fontWeight: 700 }}>
          Create an account
        </Link>
      </p>
    </>
  );
}

export function LoginForm() {
  // useSearchParams needs a Suspense boundary during prerender.
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
