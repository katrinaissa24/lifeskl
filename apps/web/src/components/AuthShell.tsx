import Link from "next/link";
import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Shared frame for /login and /signup: slim nav + centered card. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <nav className="nav">
        <div className="wrap nav-inner">
          <Link className="logo" href="/">
            <span className="dot" />
            LIFE<em>SKL</em>
          </Link>
        </div>
      </nav>
      <main className="auth-wrap">
        <div className="auth-card card card-pad">
          {!isSupabaseConfigured && (
            <div className="fb show bad" style={{ marginTop: 0, marginBottom: 18 }}>
              <b>Supabase isn&apos;t connected yet.</b>
              Paste your project URL and anon key into{" "}
              <code>apps/web/.env.local</code>, then restart the dev server.
            </div>
          )}
          {children}
        </div>
      </main>
    </>
  );
}
