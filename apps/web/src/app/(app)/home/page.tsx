import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { levelInfo } from "@lifeskl/core";
import { CourseBadge } from "@/components/CourseBadge";
import { Icon, type IconName } from "@/components/Icon";
import {
  buildJourney,
  getCompletions,
  getCoursesWithLessons,
  getProfile,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Home — LIFESKL" };

function timeAgo(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <div className="card stat-card">
      <span className="big">
        <Icon name={icon} size={26} strokeWidth={2.4} /> {value}
      </span>
      <span className="lbl">{label}</span>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, courses, completions] = await Promise.all([
    getProfile(user.id),
    getCoursesWithLessons(),
    getCompletions(user.id),
  ]);

  const username = profile?.username ?? "learner";
  const xp = profile?.xp ?? 0;
  const streakDays = profile?.streakDays ?? 0;
  const { level, xpIntoLevel, xpForNextLevel, progressPct } = levelInfo(xp);

  const activeCourse =
    courses.find((c) => c.id === profile?.activeCourseId) ?? null;
  const journey = activeCourse
    ? buildJourney(activeCourse.lessons, completions)
    : [];
  const nextLesson = journey.find((l) => l.state === "current") ?? null;
  const doneInCourse = journey.filter((l) => l.state === "done").length;
  const coursePct = journey.length
    ? Math.round((doneInCourse / journey.length) * 100)
    : 0;

  const totalAnswered = completions.reduce((s, c) => s + c.totalCount, 0);
  const totalCorrect = completions.reduce((s, c) => s + c.correctCount, 0);
  const accuracy = totalAnswered
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : null;

  const lessonTitle = new Map(
    courses.flatMap((c) => c.lessons.map((l) => [l.id, l.title] as const)),
  );
  const recent = completions.slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="home-head">
        <div className="eyebrow">{greeting}</div>
        <h1>
          Hey, <span className="accent-word">@{username}</span>.
        </h1>
      </div>

      {activeCourse && nextLesson ? (
        <div className="continue-card">
          <CourseBadge slug={activeCourse.slug} title={activeCourse.title} size={56} />
          <div className="grow">
            <div className="eyebrow" style={{ color: "rgba(255,255,255,.8)" }}>
              Continue · {activeCourse.title}
            </div>
            <h2>{nextLesson.title}</h2>
            <p className="sub">
              {nextLesson.description} · +{nextLesson.xpReward} XP
            </p>
            <div className="track-bar thin">
              <i style={{ width: `${coursePct}%` }} />
            </div>
            <p className="sub" style={{ fontSize: ".82rem" }}>
              {doneInCourse}/{journey.length} lessons · {coursePct}% of the course
            </p>
          </div>
          <Link className="btn btn-lg" href={`/lesson/${nextLesson.id}`}>
            {doneInCourse === 0 ? "Start learning →" : "Keep going →"}
          </Link>
        </div>
      ) : activeCourse ? (
        <div className="continue-card">
          <span className="emoji"><Icon name="trophy" size={44} /></span>
          <div className="grow">
            <h2>{activeCourse.title} — complete!</h2>
            <p className="sub">
              Every lesson finished. Review a lesson or start a new course.
            </p>
          </div>
          <Link className="btn btn-lg" href="/course">
            View course →
          </Link>
        </div>
      ) : (
        <div className="continue-card">
          <span className="emoji"><Icon name="map" size={44} /></span>
          <div className="grow">
            <h2>Pick your first course</h2>
            <p className="sub">
              Enroll in a course and start building real-life skills today.
            </p>
          </div>
          <Link className="btn btn-lg" href="/course">
            Choose a course →
          </Link>
        </div>
      )}

      <div className="stat-grid">
        <Stat icon="flame" value={String(streakDays)} label="day streak" />
        <Stat icon="bolt" value={String(xp)} label="total XP" />
        <Stat icon="book" value={String(completions.length)} label="lessons done" />
        <Stat icon="target" value={accuracy === null ? "—" : `${accuracy}%`} label="accuracy" />
      </div>

      <section className="home-sec">
        <div className="level-strip">
          <div className="meta">
            <span>Level {level}</span>
            <span>
              {xpForNextLevel === null
                ? "Max level — legend status"
                : `${xpForNextLevel - xpIntoLevel} XP to level ${level + 1}`}
            </span>
          </div>
          <div className="track-bar">
            <i style={{ width: `${Math.round(progressPct * 100)}%` }} />
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="home-sec">
          <h3>Recent activity</h3>
          <div className="card card-pad" style={{ paddingTop: 12, paddingBottom: 12 }}>
            {recent.map((c) => (
              <div className="activity-row" key={`${c.lessonId}-${c.completedAt}`}>
                <span style={{ color: "var(--good)" }}>
                  <Icon name="check" size={20} strokeWidth={3} />
                </span>
                <span>
                  {lessonTitle.get(c.lessonId) ?? "A lesson"}
                  <span className="muted" style={{ fontWeight: 500 }}>
                    {" "}
                    · {c.correctCount}/{c.totalCount} correct · +{c.xpEarned} XP
                  </span>
                </span>
                <span className="when">{timeAgo(c.completedAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="home-sec">
        <h3>Your courses</h3>
        <div className="grid-2">
          {courses.slice(0, 6).map((course) => {
            const done = course.lessons.filter((l) =>
              completions.some((c) => c.lessonId === l.id),
            ).length;
            const isActive = course.id === profile?.activeCourseId;
            return (
              <Link
                href="/course"
                className="card card-hover mini-course"
                key={course.id}
              >
                <CourseBadge slug={course.slug} title={course.title} size={40} />
                <span className="t">
                  {course.title}
                  <span className="d">
                    {course.lessons.length === 0
                      ? "Coming soon"
                      : `${done}/${course.lessons.length} lessons`}
                  </span>
                </span>
                {isActive && <span className="chip chip-accent">Active</span>}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
