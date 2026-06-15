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
import { LOCAL_COURSES } from "@/lib/localCatalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Shared chrome for every signed-in page (home / course / profile /
// notifications): top bar + desktop sidebar + mobile bottom tab bar.
//
// The shell renders even without a session so public pages like /course stay
// reachable; it just falls back to the bundled catalog and guest stats. Pages
// that need a real account (home, profile, notifications) guard themselves and
// redirect to /login on their own.
export default async function AppLayout({ children }: { children: ReactNode }) {
  let username = "learner";
  let courses = LOCAL_COURSES;
  let enrolledIds: string[] = [];
  let activeCourseId: string | null = null;
  let streakDays = 0;
  let xp = 0;
  let xpToday = 0;
  let pendingCount = 0;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await getProfile(user.id);

      // First-run: send brand-new accounts through onboarding before the app.
      if (profile && !profile.onboarded) redirect("/onboarding");

      const [dbCourses, ids, completions, requests] = await Promise.all([
        getCoursesWithLessons(),
        getEnrolledCourseIds(user.id),
        getCompletions(user.id),
        getFriendRequests(user.id),
      ]);
      const todayISO = new Date().toISOString().slice(0, 10);

      username = profile?.username ?? user.email?.split("@")[0] ?? "learner";
      courses = dbCourses.length > 0 ? dbCourses : LOCAL_COURSES;
      enrolledIds = ids;
      activeCourseId = profile?.activeCourseId ?? null;
      streakDays = profile?.streakDays ?? 0;
      xp = profile?.xp ?? 0;
      xpToday = xpEarnedToday(completions, todayISO);
      pendingCount = requests.length;
    }
  }

  return (
    <AppShell
      username={username}
      courses={courses}
      enrolledIds={enrolledIds}
      activeCourseId={activeCourseId}
      streakDays={streakDays}
      xp={xp}
      xpToday={xpToday}
      dailyGoal={DAILY_XP_GOAL}
      pendingCount={pendingCount}
    >
      {children}
    </AppShell>
  );
}
