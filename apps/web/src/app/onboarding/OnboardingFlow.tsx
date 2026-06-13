"use client";

import { useState, useTransition } from "react";
import { CourseBadge } from "@/components/CourseBadge";
import { Confetti } from "@/components/Confetti";
import { Icon, type IconName } from "@/components/Icon";
import { completeOnboarding } from "@/lib/actions";

interface CourseOpt {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessonCount: number;
}

const GOALS: { key: string; label: string; desc: string; icon: IconName }[] = [
  { key: "money", label: "Take control of my money", desc: "Budgets, saving, credit, the works.", icon: "bolt" },
  { key: "habits", label: "Build better daily habits", desc: "Small reps, every day, that stick.", icon: "flame" },
  { key: "milestone", label: "Prep for a big life step", desc: "Moving out, first job, a big purchase.", icon: "map" },
  { key: "curious", label: "Just learn a bit of everything", desc: "Round out the skills school skipped.", icon: "book" },
];

const STEPS = ["Welcome", "Your goal", "Your course", "Ready"];

export function OnboardingFlow({
  username,
  courses,
}: {
  username: string;
  courses: CourseOpt[];
}) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const enrollable = courses.filter((c) => c.lessonCount > 0);
  const canNext =
    step === 0 ? true : step === 1 ? goal !== null : step === 2 ? picked.size > 0 : true;

  function toggleCourse(id: string) {
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function finish() {
    startTransition(async () => {
      const goalLabel = GOALS.find((g) => g.key === goal)?.label ?? goal ?? "";
      await completeOnboarding(goalLabel, [...picked]);
    });
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="onb-wrap">
      <div className="onb-bar">
        <i style={{ width: `${progress}%` }} />
      </div>

      <div className="onb-body">
        {step === 0 && (
          <div className="onb-card">
            <div className="onb-emoji-free">
              <Icon name="bolt" size={64} strokeWidth={1.6} />
            </div>
            <h1>
              Welcome, <span className="accent-word">@{username}</span>!
            </h1>
            <p className="lead">
              LIFESKL teaches the real-life stuff school skipped — in five-minute,
              hands-on lessons. Let&apos;s set you up in three quick taps.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="onb-card">
            <h1>What brings you here?</h1>
            <p className="lead">No wrong answer — it just helps us cheer you on.</p>
            <div className="onb-grid">
              {GOALS.map((g, i) => (
                <button
                  key={g.key}
                  type="button"
                  className={`onb-pick${goal === g.key ? " sel" : ""}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => setGoal(g.key)}
                >
                  <span className="pk-ico">
                    <Icon name={g.icon} size={26} />
                  </span>
                  <span>
                    <span className="pk-t" style={{ display: "block" }}>
                      {g.label}
                    </span>
                    <span className="pk-d">{g.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onb-card">
            <h1>Pick a course to start</h1>
            <p className="lead">
              Choose at least one — you can add or switch courses anytime.
            </p>
            <div className="onb-grid">
              {enrollable.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className={`onb-pick${picked.has(c.id) ? " sel" : ""}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => toggleCourse(c.id)}
                >
                  <CourseBadge slug={c.slug} title={c.title} size={48} />
                  <span>
                    <span className="pk-t" style={{ display: "block" }}>
                      {c.title}
                    </span>
                    <span className="pk-d">{c.lessonCount} lessons</span>
                  </span>
                  {picked.has(c.id) && (
                    <span style={{ marginLeft: "auto", color: "var(--accent-d)" }}>
                      <Icon name="check" size={22} strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onb-card">
            <Confetti pieces={180} />
            <div className="onb-emoji-free">
              <Icon name="trophy" size={64} strokeWidth={1.6} />
            </div>
            <h1>You&apos;re all set!</h1>
            <p className="lead">
              {picked.size === 1
                ? "Your course is ready."
                : `${picked.size} courses lined up.`}{" "}
              Time for lesson one — small steps, big payoff.
            </p>
          </div>
        )}
      </div>

      <div className="onb-foot">
        <div className="inner">
          {step > 0 && step < 3 ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep((s) => s - 1)}
            >
              ← Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              type="button"
              className="btn btn-accent btn-lg"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-accent btn-lg"
              disabled={pending}
              onClick={finish}
            >
              {pending ? "Setting up…" : "Start learning →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
