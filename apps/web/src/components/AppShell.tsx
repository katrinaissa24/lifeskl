"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/home", label: "Home", ico: "🏠" },
  { href: "/course", label: "Course", ico: "🗺️" },
  { href: "/profile", label: "Profile", ico: "👤" },
] as const;

/**
 * Signed-in chrome: sidebar on desktop, bottom tab bar on mobile.
 * The lesson player intentionally lives OUTSIDE this shell — full focus mode.
 */
export function AppShell({
  username,
  streakDays,
  xp,
  children,
}: {
  username: string;
  streakDays: number;
  xp: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="shell">
      <aside className="side">
        <Link className="logo" href="/home">
          <span className="dot" />
          LIFE<em>SKL</em>
        </Link>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`side-link${isActive(item.href) ? " active" : ""}`}
          >
            <span className="ico">{item.ico}</span>
            {item.label}
          </Link>
        ))}

        <div className="side-foot">
          <div className="side-stats">
            <span className="streak" title="Day streak">
              🔥 {streakDays}
            </span>
            <span className="chip chip-accent" title="Total XP">
              ⚡ {xp}
            </span>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="avatar" title={`@${username}`}>
              {username.charAt(0).toUpperCase()}
            </span>
            <form action="/auth/signout" method="post">
              <button className="btn btn-ghost btn-sm" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div>
        <main className="shell-main">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "active" : ""}
          >
            <span className="ico">{item.ico}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
