import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Shared chrome for every signed-in page (home / course / profile):
// desktop sidebar + mobile bottom tab bar.
export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  const username = profile?.username ?? user.email?.split("@")[0] ?? "learner";

  return (
    <AppShell
      username={username}
      streakDays={profile?.streakDays ?? 0}
      xp={profile?.xp ?? 0}
    >
      {children}
    </AppShell>
  );
}
