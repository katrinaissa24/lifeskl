"use client";

import { useEffect, useState, useTransition } from "react";
import { setActiveCourseBySlug } from "@/lib/actions";
import { CourseBadge } from "@/components/CourseBadge";
import { Icon } from "@/components/Icon";
import { buildJourney } from "@/lib/journey";
import { defaultLocalCourse, getLocalCourse, LOCAL_COURSES } from "@/lib/localCatalog";
import {
  getActiveCourseSlug,
  getCompletedLessonIds,
  setActiveCourseSlug,
  subscribeProgress,
} from "@/lib/localProgress";
import { LessonNode } from "./LessonNode";

/**
 * The course journey, rendered entirely from the bundled local catalog and
 * browser-local progress. It loads instantly and never depends on a Supabase
 * session, and the top "Switch course" button flips between courses on the
 * spot. Completions accrue in localStorage as you finish lessons.
 */
export function CourseExperience() {
  const fallback = defaultLocalCourse();
  const [mounted, setMounted] = useState(false);
  const [activeSlug, setActiveSlug] = useState(fallback.slug);
  const [completed, setCompleted] = useState<string[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    const stored = getActiveCourseSlug();
    if (stored && getLocalCourse(stored)) setActiveSlug(stored);
    setCompleted(getCompletedLessonIds());
    // Arriving from the top bar's "Enroll in a new course" opens the picker.
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("switch") === "1"
    ) {
      setSwitcherOpen(true);
    }
    return subscribeProgress(() => setCompleted(getCompletedLessonIds()));
  }, []);

  const activeCourse = getLocalCourse(activeSlug) ?? fallback;

  // Progress reflects localStorage, which is only known after mount; keep SSR
  // markup clean by treating everything as fresh until then.
  const completions = (mounted ? completed : []).map((lessonId) => ({
    lessonId,
    completedAt: "",
    correctCount: 0,
    totalCount: 0,
    xpEarned: 0,
  }));

  const journey = buildJourney(activeCourse.lessons, completions);
  const doneCount = journey.filter((l) => l.state === "done").length;
  const units = [...new Set(journey.map((l) => l.unit))].sort((a, b) => a - b);
  const currentId = journey.find((l) => l.state === "current")?.id;

  function pick(slug: string) {
    setActiveSlug(slug);
    setActiveCourseSlug(slug);
    setSwitcherOpen(false);
    // Mirror the choice into the account (enroll + make active) so the top bar,
    // home and settings reflect it. No-op for guests / unconfigured Supabase.
    startTransition(async () => {
      await setActiveCourseBySlug(slug);
    });
  }

  return (
    <>
      <div className="course-top">
        <div className="row" style={{ gap: 16, alignItems: "center" }}>
          <CourseBadge slug={activeCourse.slug} title={activeCourse.title} size={52} />
          <div>
            <div className="eyebrow">Your course</div>
            <h1>{activeCourse.title}</h1>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-out btn-sm switch-fab"
          onClick={() => setSwitcherOpen(true)}
          style={{ gap: 8 }}
        >
          <Icon name="map" size={16} /> Switch course
        </button>
      </div>

      <div className="level-strip" style={{ maxWidth: 520, margin: "22px auto 0" }}>
        <div className="meta">
          <span>
            {doneCount}/{journey.length} lessons
          </span>
          <span>{Math.round((doneCount / Math.max(journey.length, 1)) * 100)}%</span>
        </div>
        <div className="track-bar">
          <i style={{ width: `${(doneCount / Math.max(journey.length, 1)) * 100}%` }} />
        </div>
      </div>

      <div className="journey">
        {journey.length === 0 ? (
          <div className="card card-pad center" style={{ marginTop: 30 }}>
            <h2 style={{ fontSize: "1.4rem" }}>No lessons yet</h2>
            <p className="muted" style={{ fontWeight: 500, marginTop: 6 }}>
              This course is still being written — check back soon, or switch to
              another course.
            </p>
          </div>
        ) : (
          units.map((unit) => {
            const unitLessons = journey.filter((l) => l.unit === unit);
            const unitDone = unitLessons.every((l) => l.state === "done");
            return (
              <section key={unit}>
                <div className="unit-band">
                  <span className="n">Level {unit}</span>
                  <span className="t">
                    {unitLessons.length}{" "}
                    {unitLessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                  {unitDone && (
                    <span style={{ marginLeft: "auto", color: "var(--good)" }}>
                      <Icon name="check" size={20} strokeWidth={3} />
                    </span>
                  )}
                </div>
                {unitLessons.map((lesson) => (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson}
                    index={journey.findIndex((j) => j.id === lesson.id)}
                    showStartChip={lesson.id === currentId}
                  />
                ))}
              </section>
            );
          })
        )}
      </div>

      {switcherOpen && (
        <div
          className="modal-veil"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSwitcherOpen(false);
          }}
        >
          <div className="modal" role="dialog" aria-label="Choose a course">
            <div className="row-between">
              <h2>Choose a course</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSwitcherOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="muted" style={{ fontWeight: 500 }}>
              Your progress is saved per course — switch back anytime.
            </p>

            {LOCAL_COURSES.map((course) => {
              const isActive = course.slug === activeSlug;
              const empty = course.lessons.length === 0;
              return (
                <button
                  type="button"
                  className="course-pick"
                  key={course.id}
                  disabled={isActive || empty}
                  onClick={() => pick(course.slug)}
                  style={empty ? { opacity: 0.55 } : undefined}
                >
                  <CourseBadge slug={course.slug} title={course.title} size={40} />
                  <span className="t" style={{ flex: 1 }}>
                    {course.title}
                    <span className="d">
                      {empty ? "Coming soon" : `${course.lessons.length} lessons`}
                    </span>
                  </span>
                  {isActive ? (
                    <span className="chip chip-accent">Active</span>
                  ) : (
                    !empty && <span className="chip chip-soft">Switch</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
