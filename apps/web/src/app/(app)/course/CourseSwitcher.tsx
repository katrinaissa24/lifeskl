"use client";

import { useState, useTransition } from "react";
import type { CourseWithLessons } from "@lifeskl/core";
import { CourseBadge } from "@/components/CourseBadge";
import { Icon } from "@/components/Icon";
import { enrollInCourse } from "@/lib/actions";

/**
 * Corner button → modal with every published course. Picking one enrolls
 * (first time) or switches (already enrolled) and makes it active.
 */
export function CourseSwitcher({
  courses,
  activeCourseId,
  enrolledIds,
  label,
}: {
  courses: CourseWithLessons[];
  activeCourseId: string | null;
  enrolledIds: string[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<string | null>(null);

  function pick(courseId: string) {
    if (pending || courseId === activeCourseId) return;
    setPicked(courseId);
    startTransition(async () => {
      await enrollInCourse(courseId);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-out btn-sm switch-fab"
        onClick={() => setOpen(true)}
        style={{ gap: 8 }}
      >
        <Icon name="map" size={16} /> {label}
      </button>

      {open && (
        <div
          className="modal-veil"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
        >
          <div className="modal" role="dialog" aria-label="Choose a course">
            <div className="row-between">
              <h2>Choose a course</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                ✕
              </button>
            </div>
            <p className="muted" style={{ fontWeight: 500 }}>
              Your progress is saved per course — switch back anytime.
            </p>

            {courses.map((course) => {
              const isActive = course.id === activeCourseId;
              const isEnrolled = enrolledIds.includes(course.id);
              const empty = course.lessons.length === 0;
              return (
                <button
                  type="button"
                  className="course-pick"
                  key={course.id}
                  disabled={pending || isActive || empty}
                  onClick={() => pick(course.id)}
                  style={empty ? { opacity: 0.55 } : undefined}
                >
                  <CourseBadge slug={course.slug} title={course.title} size={40} />
                  <span className="t" style={{ flex: 1 }}>
                    {course.title}
                    <span className="d">
                      {empty
                        ? "Coming soon"
                        : `${course.lessons.length} lessons`}
                      {isEnrolled && !isActive && " · enrolled"}
                    </span>
                  </span>
                  {isActive ? (
                    <span className="chip chip-accent">Active</span>
                  ) : pending && picked === course.id ? (
                    <span className="chip">…</span>
                  ) : (
                    !empty && (
                      <span className="chip chip-soft">
                        {isEnrolled ? "Switch" : "Enroll"}
                      </span>
                    )
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
