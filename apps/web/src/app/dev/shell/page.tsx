import Link from "next/link";
import { notFound } from "next/navigation";
import type { CourseWithLessons } from "@lifeskl/core";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LessonNode } from "@/app/(app)/course/LessonNode";
import type { JourneyLesson } from "@/lib/data";

const DEMO_JOURNEY: JourneyLesson[] = [
  { id: "d1", slug: "a", title: "What is a budget", description: "", xpReward: 20, sortOrder: 1, unit: 1, state: "done" },
  { id: "d2", slug: "b", title: "Financial goals", description: "", xpReward: 20, sortOrder: 2, unit: 1, state: "current" },
  { id: "d3", slug: "c", title: "Saving regularly", description: "", xpReward: 20, sortOrder: 3, unit: 2, state: "locked" },
];

// DEV ONLY: renders the signed-in shell with mock data so the top bar / sidebar
// / bottom nav can be checked without auth or a database.
export default function DevShellPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const courses: CourseWithLessons[] = [
    {
      id: "pf",
      slug: "personal-finance",
      title: "Personal Finance",
      description: "Money skills",
      emoji: "",
      sortOrder: 0,
      lessons: [{ id: "l1", slug: "a", title: "A", description: "", xpReward: 20, sortOrder: 1, unit: 1 }],
    },
  ];

  return (
    <AppShell
      username="preview"
      courses={courses}
      enrolledIds={["pf"]}
      activeCourseId="pf"
      streakDays={4}
      xp={120}
      xpToday={20}
      dailyGoal={30}
      pendingCount={2}
    >
      <div className="home-head">
        <div className="eyebrow">Dev preview</div>
        <h1>
          Hey, <span className="accent-word">@preview</span>.
        </h1>
      </div>
      <div className="continue-card">
        <span className="emoji"><Icon name="bolt" size={44} /></span>
        <div className="grow">
          <div className="eyebrow" style={{ color: "rgba(255,255,255,.8)" }}>
            Continue · Personal Finance
          </div>
          <h2>What is a budget (and why you need one)</h2>
          <p className="sub">Give every dollar a job before the month starts. · +20 XP</p>
          <div className="track-bar thin">
            <i style={{ width: "23%" }} />
          </div>
        </div>
        <Link className="btn btn-lg" href="/dev/preview/what-is-a-budget">
          Keep going →
        </Link>
      </div>

      <section className="home-sec">
        <h3>Theme</h3>
        <ThemeToggle />
      </section>

      <section className="home-sec">
        <h3>Journey nodes (press me)</h3>
        <div className="journey" style={{ maxWidth: 360 }}>
          {DEMO_JOURNEY.map((l, i) => (
            <LessonNode key={l.id} lesson={l} index={i} showStartChip={l.state === "current"} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
