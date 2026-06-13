import { redirect } from "next/navigation";
import { getCoursesWithLessons, getProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata = { title: "Welcome — LIFESKL" };

// First-run flow. Lives outside the app shell (no nav) for focus. The (app)
// layout redirects un-onboarded users here; here we bounce finished users back.
export default async function OnboardingPage() {
  if (!isSupabaseConfigured) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, courses] = await Promise.all([
    getProfile(user.id),
    getCoursesWithLessons(),
  ]);
  if (profile?.onboarded) redirect("/home");

  const username = profile?.username ?? user.email?.split("@")[0] ?? "there";
  const available = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    lessonCount: c.lessons.length,
  }));

  return <OnboardingFlow username={username} courses={available} />;
}
