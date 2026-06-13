import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseBadge } from "@/components/CourseBadge";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { unenrollCourse } from "@/lib/actions";
import {
  getCoursesWithLessons,
  getEnrolledCourseIds,
  getProfile,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings — LIFESKL" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, courses, enrolledIds] = await Promise.all([
    getProfile(user.id),
    getCoursesWithLessons(),
    getEnrolledCourseIds(user.id),
  ]);
  const enrolled = courses.filter((c) => enrolledIds.includes(c.id));

  return (
    <>
      <div className="row" style={{ gap: 12, alignItems: "center" }}>
        <Link href="/profile" className="btn btn-ghost btn-sm" aria-label="Back to profile">
          ← Profile
        </Link>
      </div>
      <div className="home-head" style={{ marginTop: 10 }}>
        <div className="eyebrow">Settings</div>
        <h1>Settings</h1>
      </div>

      <div className="settings-list">
        <div className="card set-row">
          <div className="grow">
            <div className="lbl">Appearance</div>
            <div className="sub">Switch between light and dark.</div>
          </div>
          <ThemeToggle />
        </div>

        <div className="card set-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div>
            <div className="lbl">Account</div>
            <div className="sub">
              @{profile?.username} · {user.email}
            </div>
          </div>
        </div>

        <div className="card set-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div className="grow">
            <div className="lbl">Your courses</div>
            <div className="sub">Leaving a course keeps your XP but removes it from your journey.</div>
          </div>
          <div style={{ marginTop: 8 }}>
            {enrolled.length === 0 ? (
              <p className="muted" style={{ fontWeight: 500 }}>
                You&apos;re not enrolled in any course.{" "}
                <Link href="/course" className="accent-word" style={{ fontWeight: 700 }}>
                  Browse courses →
                </Link>
              </p>
            ) : (
              enrolled.map((c) => (
                <div className="set-course" key={c.id}>
                  <CourseBadge slug={c.slug} title={c.title} size={36} />
                  <span className="t">{c.title}</span>
                  <form
                    action={async () => {
                      "use server";
                      await unenrollCourse(c.id);
                    }}
                  >
                    <button type="submit" className="btn btn-danger btn-sm" style={{ gap: 7 }}>
                      <Icon name="trash" size={16} /> Leave
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card set-row">
          <div className="grow">
            <div className="lbl">Notifications</div>
            <div className="sub">Daily reminders and friend activity (coming soon).</div>
          </div>
          <span className="chip chip-soft">Default</span>
        </div>

        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-out btn-block" style={{ gap: 8 }}>
            <Icon name="logout" size={18} /> Sign out
          </button>
        </form>
      </div>
    </>
  );
}
