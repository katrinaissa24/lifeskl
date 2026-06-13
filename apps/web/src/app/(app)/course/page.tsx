import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { JourneyLesson } from "@/lib/data";
import {
  buildJourney,
  getCompletions,
  getCoursesWithLessons,
  getEnrolledCourseIds,
  getProfile,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { CourseSwitcher } from "./CourseSwitcher";

export const metadata: Metadata = { title: "Course — LIFESKL" };

/** Winding-path horizontal offsets, repeating like a gentle S-curve. */
const WAVE = [0, 56, 84, 56, 0, -56, -84, -56];

function JourneyNode({
  lesson,
  index,
  showStartChip,
}: {
  lesson: JourneyLesson;
  index: number;
  showStartChip: boolean;
}) {
  const offset = WAVE[index % WAVE.length];
  const icon =
    lesson.state === "done" ? "⭐" : lesson.state === "current" ? "▶" : "🔒";

  const node = (
    <div
      className={`j-node ${lesson.state}`}
      style={{ transform: `translateX(${offset}px)` }}
    >
      <span className={`j-btn ${lesson.state}`}>
        {showStartChip && <span className="j-start-chip">Start here</span>}
        <span style={lesson.state === "current" ? { color: "#fff" } : undefined}>
          {icon}
        </span>
      </span>
      <span className="j-title">{lesson.title}</span>
      <span className="j-xp">
        {lesson.state === "done" ? "Completed · tap to review" : `+${lesson.xpReward} XP`}
      </span>
    </div>
  );

  if (lesson.state === "locked") {
    return <div className="j-row">{node}</div>;
  }
  return (
    <Link className="j-row" href={`/lesson/${lesson.id}`}>
      {node}
    </Link>
  );
}

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

  // Not enrolled anywhere yet → the switcher modal IS the page.
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
              <span className="emoji">{course.emoji}</span>
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
        <div>
          <div className="eyebrow">Your course</div>
          <h1>
            {activeCourse.emoji} {activeCourse.title}
          </h1>
          <p className="muted" style={{ fontWeight: 500, marginTop: 6 }}>
            {activeCourse.description}
          </p>
        </div>
        <CourseSwitcher
          courses={courses}
          activeCourseId={activeCourse.id}
          enrolledIds={enrolledIds}
          label="⇄ Switch course"
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
            return (
              <section key={unit}>
                <div className="unit-band">
                  <span className="n">Level {unit}</span>
                  <span className="t">
                    {unitLessons.length}{" "}
                    {unitLessons.length === 1 ? "lesson" : "lessons"}
                    {unitLessons.every((l) => l.state === "done") && " · ⭐ complete"}
                  </span>
                </div>
                {unitLessons.map((lesson) => (
                  <JourneyNode
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
import { enrollInCourse } from "@/lib/actions";
import type { ReactNode } from "react";

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
