"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { CourseWithLessons } from "@lifeskl/core";
import { Icon, type IconName } from "./Icon";
import { TopBar } from "./TopBar";

const NAV_ITEMS: { href: string; label: string; ico: IconName }[] = [
  { href: "/home", label: "Home", ico: "home" },
  { href: "/course", label: "Course", ico: "map" },
  { href: "/notifications", label: "Alerts", ico: "bell" },
  { href: "/profile", label: "Profile", ico: "user" },
];

/**
 * Signed-in chrome: a persistent top bar (stats + course switcher) on every
 * viewport, a sidebar on desktop, and a bottom tab bar on mobile. The lesson
 * player and onboarding intentionally live OUTSIDE this shell (focus mode).
 */
export function AppShell({
  username,
  courses,
  enrolledIds,
  activeCourseId,
  streakDays,
  xp,
  xpToday,
  dailyGoal,
  pendingCount,
  children,
}: {
  username: string;
  courses: CourseWithLessons[];
  enrolledIds: string[];
  activeCourseId: string | null;
  streakDays: number;
  xp: number;
  xpToday: number;
  dailyGoal: number;
  pendingCount: number;
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
            <span className="ico">
              <Icon name={item.ico} size={22} />
            </span>
            {item.label}
            {item.href === "/notifications" && pendingCount > 0 && (
              <span className="nav-dot">{pendingCount}</span>
            )}
          </Link>
        ))}

        <div className="side-foot">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <Link href="/profile" className="avatar" title={`@${username}`}>
              {username.charAt(0).toUpperCase()}
            </Link>
            <form action="/auth/signout" method="post">
              <button className="btn btn-ghost btn-sm" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="shell-col">
        <TopBar
          courses={courses}
          enrolledIds={enrolledIds}
          activeCourseId={activeCourseId}
          streakDays={streakDays}
          xp={xp}
          xpToday={xpToday}
          dailyGoal={dailyGoal}
        />
        <main className="shell-main">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "active" : ""}
          >
            <span className="ico" style={{ position: "relative" }}>
              <Icon name={item.ico} size={24} />
              {item.href === "/notifications" && pendingCount > 0 && (
                <span className="nav-dot float">{pendingCount}</span>
              )}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
