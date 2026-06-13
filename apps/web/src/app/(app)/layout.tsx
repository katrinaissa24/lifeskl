import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  DAILY_XP_GOAL,
  getCompletions,
  getCoursesWithLessons,
  getCurrentUser,
  getEnrolledCourseIds,
  getFriendRequests,
  getProfile,
  xpEarnedToday,
} from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Shared chrome for every signed-in page (home / course / profile /
// notifications): top bar + desktop sidebar + mobile bottom tab bar.
export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Everything the shell needs, fetched in one parallel batch (no waterfall).
  // These reads are memoized, so the page rendered inside this layout reuses
  // the same results instead of hitting Supabase again.
  const [profile, courses, enrolledIds, completions, requests] =
    await Promise.all([
      getProfile(user.id),
      getCoursesWithLessons(),
      getEnrolledCourseIds(user.id),
      getCompletions(user.id),
      getFriendRequests(user.id),
    ]);

  // First-run: send brand-new accounts through onboarding before the app.
  if (profile && !profile.onboarded) redirect("/onboarding");

  const username = profile?.username ?? user.email?.split("@")[0] ?? "learner";
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <AppShell
      username={username}
      courses={courses}
      enrolledIds={enrolledIds}
      activeCourseId={profile?.activeCourseId ?? null}
      streakDays={profile?.streakDays ?? 0}
      xp={profile?.xp ?? 0}
      xpToday={xpEarnedToday(completions, todayISO)}
      dailyGoal={DAILY_XP_GOAL}
      pendingCount={requests.length}
    >
      {children}
    </AppShell>
  );
}
