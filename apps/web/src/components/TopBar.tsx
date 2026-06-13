"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import type { CourseWithLessons } from "@lifeskl/core";
import { setActiveCourse } from "@/lib/actions";
import { CourseBadge } from "./CourseBadge";
import { Icon } from "./Icon";

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(1, goal > 0 ? value / goal : 0);
  const met = value >= goal;
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={`goal-ring${met ? " met" : ""}`}
      title={`${value} / ${goal} XP today`}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle className="ring-bg" cx="20" cy="20" r={r} fill="none" strokeWidth="4" />
        <circle
          className="ring-fg"
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <span className="ring-ico">
        <Icon name={met ? "check" : "target"} size={16} />
      </span>
    </div>
  );
}

function CourseSwitcher({
  courses,
  enrolledIds,
  activeCourseId,
}: {
  courses: CourseWithLessons[];
  enrolledIds: string[];
  activeCourseId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const enrolled = courses.filter((c) => enrolledIds.includes(c.id));
  const active = courses.find((c) => c.id === activeCourseId) ?? enrolled[0] ?? null;

  function pick(id: string) {
    if (id === activeCourseId) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await setActiveCourse(id);
      setOpen(false);
    });
  }

  if (!active) {
    return (
      <Link href="/course" className="course-switch">
        <button type="button">
          <span className="course-badge" style={{ width: 34, height: 34, background: "var(--accent-sft)", color: "var(--accent-d)", borderRadius: 9, fontSize: 16 }}>
            <Icon name="plus" size={18} />
          </span>
          <span className="cs-name">Pick a course</span>
          <Icon name="chevron-down" size={16} />
        </button>
      </Link>
    );
  }

  return (
    <div className="course-switch" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <CourseBadge slug={active.slug} title={active.title} size={34} />
        <span className="cs-name">{active.title}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div className="cs-menu">
          <div className="cs-head">Your courses</div>
          {enrolled.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cs-item${c.id === activeCourseId ? " active" : ""}`}
              disabled={pending}
              onClick={() => pick(c.id)}
            >
              <CourseBadge slug={c.slug} title={c.title} size={30} />
              <span className="t">{c.title}</span>
              {c.id === activeCourseId && <span className="badge-dot">Active</span>}
            </button>
          ))}
          {enrolled.length === 0 && (
            <div className="cs-item" style={{ color: "var(--text-soft)" }}>
              No courses yet.
            </div>
          )}
          <div className="cs-divider" />
          <Link href="/course" className="cs-item cs-enroll" onClick={() => setOpen(false)}>
            <span className="course-badge" style={{ width: 30, height: 30, background: "var(--accent-sft)", color: "var(--accent-d)", borderRadius: 8, fontSize: 14 }}>
              <Icon name="plus" size={16} />
            </span>
            <span className="t">Enroll in a new course</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function TopBar({
  courses,
  enrolledIds,
  activeCourseId,
  streakDays,
  xp,
  xpToday,
  dailyGoal,
}: {
  courses: CourseWithLessons[];
  enrolledIds: string[];
  activeCourseId: string | null;
  streakDays: number;
  xp: number;
  xpToday: number;
  dailyGoal: number;
}) {
  return (
    <header className="topbar">
      <CourseSwitcher
        courses={courses}
        enrolledIds={enrolledIds}
        activeCourseId={activeCourseId}
      />
      <div className="tb-stats">
        <span className="tb-chip flame" title="Day streak">
          <Icon name="flame" size={18} /> {streakDays}
        </span>
        <span className="tb-chip bolt" title="Total XP">
          <Icon name="bolt" size={18} /> {xp}
        </span>
        <GoalRing value={xpToday} goal={dailyGoal} />
      </div>
    </header>
  );
}
