import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { levelInfo } from "@lifeskl/core";
import {
  getCompletions,
  getCoursesWithLessons,
  getEnrolledCourseIds,
  getProfile,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profile — LIFESKL" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, courses, completions, enrolledIds] = await Promise.all([
    getProfile(user.id),
    getCoursesWithLessons(),
    getCompletions(user.id),
    getEnrolledCourseIds(user.id),
  ]);

  const username = profile?.username ?? "learner";
  const xp = profile?.xp ?? 0;
  const { level, xpIntoLevel, xpForNextLevel, progressPct } = levelInfo(xp);

  const totalAnswered = completions.reduce((s, c) => s + c.totalCount, 0);
  const totalCorrect = completions.reduce((s, c) => s + c.correctCount, 0);
  const accuracy = totalAnswered
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : null;
  const perfects = completions.filter(
    (c) => c.totalCount > 0 && c.correctCount === c.totalCount,
  ).length;

  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const enrolledCourses = courses.filter((c) => enrolledIds.includes(c.id));

  return (
    <>
      <div className="prof-head">
        <span className="avatar xl">{username.charAt(0).toUpperCase()}</span>
        <div>
          <h1>@{username}</h1>
          {joined && <p className="joined">Learning since {joined}</p>}
        </div>
        <span className="spacer" />
        <span className="chip chip-accent">Level {level}</span>
      </div>

      <div className="level-strip">
        <div className="meta">
          <span>Level {level}</span>
          <span>
            {xpForNextLevel === null
              ? "Max level"
              : `${xpIntoLevel}/${xpForNextLevel} XP to level ${level + 1}`}
          </span>
        </div>
        <div className="track-bar">
          <i style={{ width: `${Math.round(progressPct * 100)}%` }} />
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="big">🔥 {profile?.streakDays ?? 0}</span>
          <span className="lbl">day streak</span>
        </div>
        <div className="card stat-card">
          <span className="big">⚡ {xp}</span>
          <span className="lbl">total XP</span>
        </div>
        <div className="card stat-card">
          <span className="big">📚 {completions.length}</span>
          <span className="lbl">lessons done</span>
        </div>
        <div className="card stat-card">
          <span className="big">🎯 {accuracy === null ? "—" : `${accuracy}%`}</span>
          <span className="lbl">accuracy</span>
        </div>
        <div className="card stat-card">
          <span className="big">💯 {perfects}</span>
          <span className="lbl">perfect lessons</span>
        </div>
        <div className="card stat-card">
          <span className="big">🗺️ {enrolledCourses.length}</span>
          <span className="lbl">courses enrolled</span>
        </div>
      </div>

      <section className="home-sec">
        <h3>Your courses</h3>
        {enrolledCourses.length === 0 ? (
          <div className="card card-pad">
            <p className="muted" style={{ fontWeight: 500 }}>
              You haven&apos;t enrolled in a course yet.{" "}
              <Link href="/course" className="accent-word" style={{ fontWeight: 700 }}>
                Pick one →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid-2">
            {enrolledCourses.map((course) => {
              const done = course.lessons.filter((l) =>
                completions.some((c) => c.lessonId === l.id),
              ).length;
              const pct = course.lessons.length
                ? Math.round((done / course.lessons.length) * 100)
                : 0;
              return (
                <Link
                  href="/course"
                  className="card card-hover mini-course"
                  key={course.id}
                >
                  <span style={{ fontSize: "1.7rem" }}>{course.emoji}</span>
                  <span className="t">
                    {course.title}
                    <span className="d">
                      {done}/{course.lessons.length} lessons · {pct}%
                    </span>
                  </span>
                  {course.id === profile?.activeCourseId && (
                    <span className="chip chip-accent">Active</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
