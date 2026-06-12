import Link from "next/link";
import { TRACKS, levelInfo, type UserProgress } from "@lifeskl/core";

// Demo progress, hard-coded until we add auth + persistence.
// Swap this for a fetch to /api/progress once that's wired to a real store.
const demoProgress: UserProgress = {
  xp: 70,
  streakDays: 3,
  completedLessonIds: ["money-1"],
  lastActiveDate: null,
};

export default function HomePage() {
  const { level, xpIntoLevel, xpForNextLevel, progressPct } = levelInfo(
    demoProgress.xp,
  );

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24">
      {/* Top stats bar */}
      <header className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur">
        <div className="text-lg font-extrabold tracking-tight">
          Life<span className="text-emerald-500">Skl</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span title="Day streak">🔥 {demoProgress.streakDays}</span>
          <span title="Total XP">⚡ {demoProgress.xp}</span>
          <span title="Level" className="text-emerald-600">
            Lvl {level}
          </span>
        </div>
      </header>

      {/* Level progress */}
      <div className="mb-8">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Level {level}</span>
          <span>
            {xpForNextLevel === null
              ? "Max level"
              : `${xpIntoLevel}/${xpForNextLevel} XP to level ${level + 1}`}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.round(progressPct * 100)}%` }}
          />
        </div>
      </div>

      <h1 className="mb-1 text-2xl font-extrabold">Pick a track</h1>
      <p className="mb-8 text-slate-500">
        Bite-sized lessons on the stuff school skipped.
      </p>

      <div className="space-y-10">
        {TRACKS.map((track) => (
          <section key={track.id}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">{track.emoji}</span>
              <div>
                <h2 className="text-lg font-bold">{track.title}</h2>
                <p className="text-sm text-slate-500">{track.description}</p>
              </div>
            </div>

            {/* Lesson path */}
            <ol className="relative ml-5 space-y-3 border-l-2 border-dashed border-slate-200 pl-6">
              {track.lessons.map((lesson) => {
                const done = demoProgress.completedLessonIds.includes(lesson.id);
                return (
                  <li key={lesson.id} className="relative">
                    <span
                      className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white ${
                        done ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    <Link
                      href={`/lesson/${lesson.id}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-300 hover:shadow"
                    >
                      <span className="font-semibold">{lesson.title}</span>
                      <span className="text-sm text-slate-400">
                        {done ? "✓ Done" : `+${lesson.xp} XP`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
