import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  DAILY_XP_GOAL,
  getCompletions,
  getCoursesWithLessons,
  getEnrolledCourseIds,
  getFriendRequests,
  getProfile,
  xpEarnedToday,
} from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Shared chrome for every signed-in page (home / course / profile /
// notifications): top bar + desktop sidebar + mobile bottom tab bar.
export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);

  // First-run: send brand-new accounts through onboarding before the app.
  if (profile && !profile.onboarded) redirect("/onboarding");

  const [courses, enrolledIds, completions, requests] = await Promise.all([
    getCoursesWithLessons(),
    getEnrolledCourseIds(user.id),
    getCompletions(user.id),
    getFriendRequests(user.id),
  ]);

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
