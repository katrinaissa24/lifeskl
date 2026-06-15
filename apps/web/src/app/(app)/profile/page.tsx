import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { levelInfo } from "@lifeskl/core";
import { AddFriend } from "@/components/AddFriend";
import { CourseBadge } from "@/components/CourseBadge";
import { FriendsList } from "@/components/FriendsList";
import { Icon, type IconName } from "@/components/Icon";
import { XpChart } from "@/components/XpChart";
import {
  getCompletions,
  getCoursesWithLessons,
  getCurrentUser,
  getEnrolledCourseIds,
  getFriends,
  getProfile,
  getXpPerDay,
} from "@/lib/data";

export const metadata: Metadata = { title: "Profile — LIFESKL" };

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

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, courses, completions, enrolledIds, friends, xpDays] =
    await Promise.all([
      getProfile(user.id),
      getCoursesWithLessons(),
      getCompletions(user.id),
      getEnrolledCourseIds(user.id),
      getFriends(user.id),
      getXpPerDay(user.id, 14),
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
          {profile?.goal && (
            <p className="joined" style={{ color: "var(--accent-d)", fontWeight: 700 }}>
              Goal: {profile.goal}
            </p>
          )}
        </div>
        <div className="prof-actions">
          <span className="chip chip-accent">Level {level}</span>
          <Link href="/settings" className="btn btn-ghost btn-sm" aria-label="Settings" title="Settings">
            <Icon name="gear" size={20} />
          </Link>
        </div>
      </div>

      <section className="home-sec" style={{ marginTop: 22 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="users" size={20} /> Friends
        </h3>
        <FriendsList friends={friends} />
        <AddFriend />
      </section>

      <div className="level-strip" style={{ marginTop: 26 }}>
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

      <section className="home-sec">
        <h3>Activity</h3>
        <div className="card card-pad">
          <XpChart days={xpDays} />
        </div>
      </section>

      <div className="stat-grid">
        <Stat icon="flame" value={String(profile?.streakDays ?? 0)} label="day streak" />
        <Stat icon="bolt" value={String(xp)} label="total XP" />
        <Stat icon="book" value={String(completions.length)} label="lessons done" />
        <Stat icon="target" value={accuracy === null ? "—" : `${accuracy}%`} label="accuracy" />
        <Stat icon="medal" value={String(perfects)} label="perfect lessons" />
        <Stat icon="map" value={String(enrolledCourses.length)} label="courses" />
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
                  <CourseBadge slug={course.slug} title={course.title} size={40} />
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
