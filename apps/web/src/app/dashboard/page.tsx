import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { levelInfo } from "@lifeskl/core";
import { AppNav } from "@/components/AppNav";
import { getCoursesWithLessons, getProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard — LIFESKL" };

export default async function DashboardPage() {
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

  // Profile should exist via the signup trigger; fall back gracefully if the
  // user predates the migration.
  const username = profile?.username ?? user.email?.split("@")[0] ?? "learner";
  const xp = profile?.xp ?? 0;
  const streakDays = profile?.streakDays ?? 0;
  const { level, xpIntoLevel, xpForNextLevel, progressPct } = levelInfo(xp);

  return (
    <>
      <AppNav username={username} streakDays={streakDays} xp={xp} />

      <main className="wrap dash">
        <div className="dash-head">
          <div>
            <div className="eyebrow">Your classroom</div>
            <h1>
              Hey, <span className="accent-word">@{username}</span>.
            </h1>
          </div>
          <div className="chip">
            Level {level}
            {xpForNextLevel !== null && (
              <span className="muted">
                · {xpIntoLevel}/{xpForNextLevel} XP
              </span>
            )}
          </div>
        </div>

        <div className="level-strip">
          <div className="meta">
            <span>Level {level}</span>
            <span>
              {xpForNextLevel === null
                ? "Max level"
                : `${xpForNextLevel - xpIntoLevel} XP to level ${level + 1}`}
            </span>
          </div>
          <div className="track-bar">
            <i style={{ width: `${Math.round(progressPct * 100)}%` }} />
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="card card-pad" style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: "1.5rem" }}>No courses yet</h2>
            <p className="muted" style={{ fontWeight: 500, marginTop: 8 }}>
              The catalog is empty — run <code>supabase/seed.sql</code> in the
              Supabase SQL Editor to load the starter curriculum.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <section className="card course-card" key={course.id}>
              <div className="course-head">
                <span className="emoji">{course.emoji}</span>
                <h2>{course.title}</h2>
                <span className="spacer" />
                <span className="chip chip-soft">
                  {course.lessons.length}{" "}
                  {course.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
                <p className="desc">{course.description}</p>
              </div>
              <div>
                {course.lessons.map((lesson, i) => (
                  <Link
                    className="lesson-row"
                    href={`/lesson/${lesson.id}`}
                    key={lesson.id}
                  >
                    <span className="badge-num">{i + 1}</span>
                    <span className="t">
                      {lesson.title}
                      <span className="d">{lesson.description}</span>
                    </span>
                    <span className="xp">+{lesson.xpReward} XP</span>
                    <span className="arrow">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}
