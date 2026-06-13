import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { CourseBadge } from "@/components/CourseBadge";
import { Icon } from "@/components/Icon";
import { enrollInCourse } from "@/lib/actions";
import {
  buildJourney,
  getCompletions,
  getCoursesWithLessons,
  getEnrolledCourseIds,
  getProfile,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { CourseSwitcher } from "./CourseSwitcher";
import { LessonNode } from "./LessonNode";

export const metadata: Metadata = { title: "Course — LIFESKL" };

export default async function CoursePage() {
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

  const activeCourse =
    courses.find((c) => c.id === profile?.activeCourseId) ?? null;

  // Not enrolled anywhere yet → a simple enroll list.
  if (!activeCourse) {
    return (
      <>
        <div className="course-top">
          <div>
            <div className="eyebrow">Courses</div>
            <h1>Pick a path.</h1>
            <p className="muted" style={{ fontWeight: 500, marginTop: 8 }}>
              Enroll in a course to unlock its lesson journey.
            </p>
          </div>
        </div>
        <div style={{ maxWidth: 560, marginTop: 18 }}>
          {courses.map((course) => (
            <EnrollRow key={course.id} courseId={course.id}>
              <CourseBadge slug={course.slug} title={course.title} size={44} />
              <span className="t" style={{ flex: 1 }}>
                {course.title}
                <span className="d">
                  {course.lessons.length === 0
                    ? "Coming soon"
                    : `${course.lessons.length} lessons · ${course.description}`}
                </span>
              </span>
              {course.lessons.length > 0 && (
                <span className="chip chip-accent">Enroll →</span>
              )}
            </EnrollRow>
          ))}
        </div>
      </>
    );
  }

  const journey = buildJourney(activeCourse.lessons, completions);
  const doneCount = journey.filter((l) => l.state === "done").length;
  const units = [...new Set(journey.map((l) => l.unit))].sort((a, b) => a - b);
  const currentId = journey.find((l) => l.state === "current")?.id;

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
        <CourseSwitcher
          courses={courses}
          activeCourseId={activeCourse.id}
          enrolledIds={enrolledIds}
          label="Switch course"
        />
      </div>

      <div className="level-strip" style={{ maxWidth: 520, margin: "22px auto 0" }}>
        <div className="meta">
          <span>
            {doneCount}/{journey.length} lessons
          </span>
          <span>{Math.round((doneCount / Math.max(journey.length, 1)) * 100)}%</span>
        </div>
        <div className="track-bar">
          <i
            style={{
              width: `${(doneCount / Math.max(journey.length, 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="journey">
        {journey.length === 0 ? (
          <div className="card card-pad center" style={{ marginTop: 30 }}>
            <h2 style={{ fontSize: "1.4rem" }}>No lessons yet</h2>
            <p className="muted" style={{ fontWeight: 500, marginTop: 6 }}>
              This course is still being written — check back soon, or switch
              to another course.
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
    </>
  );
}

// Server-action enroll row for the not-yet-enrolled state.
function EnrollRow({
  courseId,
  children,
}: {
  courseId: string;
  children: ReactNode;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await enrollInCourse(courseId);
      }}
    >
      <button type="submit" className="course-pick">
        {children}
      </button>
    </form>
  );
}
