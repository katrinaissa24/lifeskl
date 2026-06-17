"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Course, Lesson, LessonBlock, QuestionBlock } from "@lifeskl/core";
import { Confetti } from "@/components/Confetti";
import { isLocalLessonId } from "@/lib/localCatalog";
import { markLessonComplete } from "@/lib/localProgress";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  BudgetBuilderView,
  CategorizeView,
  DecisionPathView,
  FillBlankView,
  IStatementView,
  MatchPairsView,
  MaterialView,
  MoodMeterView,
  MultipleChoiceView,
  OrderStepsView,
  PriorityMatrixView,
  ReflectView,
  SliderEstimateView,
  SpacedPlannerView,
  SpotScamView,
  TapWordView,
  TrueFalseView,
} from "./blocks";

// The player runs in three phases:
//   main   — every block in order; wrong answers are remembered
//   fixup  — "fix your mistakes": missed questions repeat until solved
//   done   — confetti, XP, what-you-learned
// Score reported to the backend = first-try accuracy from the main phase.

type Phase = "main" | "fixup" | "done";

function isQuestion(block: LessonBlock): block is QuestionBlock {
  return block.type !== "material";
}

function QuestionRenderer({
  block,
  meta,
  onDone,
}: {
  block: QuestionBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  switch (block.type) {
    case "multiple_choice":
      return <MultipleChoiceView block={block} meta={meta} onDone={onDone} />;
    case "true_false":
      return <TrueFalseView block={block} meta={meta} onDone={onDone} />;
    case "fill_blank":
      return <FillBlankView block={block} meta={meta} onDone={onDone} />;
    case "tap_word":
      return <TapWordView block={block} meta={meta} onDone={onDone} />;
    case "match_pairs":
      return <MatchPairsView block={block} meta={meta} onDone={onDone} />;
    case "order_steps":
      return <OrderStepsView block={block} meta={meta} onDone={onDone} />;
    case "categorize":
      return <CategorizeView block={block} meta={meta} onDone={onDone} />;
    case "budget_builder":
      return <BudgetBuilderView block={block} meta={meta} onDone={onDone} />;
    case "slider_estimate":
      return <SliderEstimateView block={block} meta={meta} onDone={onDone} />;
    case "decision_path":
      return <DecisionPathView block={block} meta={meta} onDone={onDone} />;
    case "spot_scam":
      return <SpotScamView block={block} meta={meta} onDone={onDone} />;
    case "priority_matrix":
      return <PriorityMatrixView block={block} meta={meta} onDone={onDone} />;
    case "spaced_planner":
      return <SpacedPlannerView block={block} meta={meta} onDone={onDone} />;
    case "reflect":
      return <ReflectView block={block} meta={meta} onDone={onDone} />;
    case "mood_meter":
      return <MoodMeterView block={block} meta={meta} onDone={onDone} />;
    case "i_statement":
      return <IStatementView block={block} meta={meta} onDone={onDone} />;
  }
}

function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

const PERFECT_TITLES = ["Flawless!", "Perfect run!", "Untouchable!"];
const DONE_TITLES = ["Lesson complete!", "Nailed it!", "Knowledge banked!"];

function SummaryScreen({
  lesson,
  course,
  firstTryCorrect,
  questionTotal,
  mistakesFixed,
  xpAwarded,
  streakDays,
  alreadyCompleted,
  saveFailed,
}: {
  lesson: Lesson;
  course: Course;
  firstTryCorrect: number;
  questionTotal: number;
  mistakesFixed: number;
  xpAwarded: number | null;
  streakDays: number | null;
  alreadyCompleted: boolean;
  saveFailed: boolean;
}) {
  const perfect = questionTotal > 0 && firstTryCorrect === questionTotal;
  const accuracy = questionTotal
    ? Math.round((firstTryCorrect / questionTotal) * 100)
    : 100;
  const xpShown = useCountUp(xpAwarded ?? lesson.xpReward);
  const [title] = useState(
    () =>
      (perfect ? PERFECT_TITLES : DONE_TITLES)[
        Math.floor(Math.random() * 3)
      ],
  );

  return (
    <main className="player">
      <Confetti pieces={perfect ? 220 : 150} />
      <div className="sum-wrap">
        <div className="sum-kicker">
          {course.emoji} {course.title} · {lesson.title}
        </div>
        <h1 className="sum-title">{title}</h1>
        <p className="sum-sub">
          {perfect
            ? "Every single question, right on the first try."
            : mistakesFixed > 0
              ? `You stumbled on ${mistakesFixed} ${mistakesFixed === 1 ? "question" : "questions"} — and fixed every one of them.`
              : "Another lesson in the bank."}
        </p>
        {perfect && (
          <div style={{ marginTop: 16 }}>
            <span className="perfect-chip">💯 Perfect lesson</span>
          </div>
        )}

        <div className="sum-cards">
          <div className="sum-card">
            <div className="big xp">+{xpShown}</div>
            <div className="lbl">{alreadyCompleted ? "review XP" : "XP earned"}</div>
          </div>
          <div className="sum-card">
            <div className="big">{accuracy}%</div>
            <div className="lbl">first-try accuracy</div>
          </div>
          <div className="sum-card">
            <div className="big">🔥 {streakDays ?? "—"}</div>
            <div className="lbl">day streak</div>
          </div>
        </div>

        {lesson.summaryPoints.length > 0 && (
          <div className="sum-learned card card-pad">
            <h3>What you just learned</h3>
            <ul>
              {lesson.summaryPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {saveFailed && (
          <p className="muted" style={{ marginTop: 18, fontWeight: 600, fontSize: ".85rem" }}>
            ⚠️ Couldn&apos;t save your progress — check your connection and the
            0002 migration, then finish the lesson again.
          </p>
        )}

        <div className="sum-actions">
          <Link className="btn btn-accent btn-lg" href="/course">
            Back to the journey →
          </Link>
          <Link className="btn btn-out" href="/home">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export function LessonPlayer({
  course,
  lesson,
}: {
  course: Course;
  lesson: Lesson;
}) {
  const router = useRouter();
  const blocks = lesson.content;

  // Pre-render gate: exercise components shuffle options, so skip SSR markup.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [phase, setPhase] = useState<Phase>("main");
  const [index, setIndex] = useState(0); // main-phase pointer
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [mistakes, setMistakes] = useState<number[]>([]); // block indices
  const [fixQueue, setFixQueue] = useState<number[]>([]);
  const [fixedCount, setFixedCount] = useState(0);
  const [attempt, setAttempt] = useState(0); // remount key for repeats

  // RPC result
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const savedRef = useRef(false);

  const questionTotal = blocks.filter(isQuestion).length;
  const meta = `${course.emoji} ${course.title}`;

  useEffect(() => {
    if (phase !== "done" || savedRef.current) return;
    savedRef.current = true;
    // Dev content previews (/dev/preview/*) play without persistence.
    if (lesson.id.startsWith("preview-")) return;
    // Always record locally so the course journey reflects your progress.
    markLessonComplete(lesson.id);
    // Local-catalog lessons (and the keyless dev case) live only in the
    // browser — there's no database row to update, so we're done.
    if (isLocalLessonId(lesson.id) || !isSupabaseConfigured) {
      setXpAwarded(lesson.xpReward);
      return;
    }
    const supabase = createClient();
    supabase
      .rpc("complete_lesson", {
        p_lesson_id: lesson.id,
        p_correct: firstTryCorrect,
        p_total: questionTotal,
      })
      .then(({ data, error }) => {
        if (error || !data) {
          setSaveFailed(true);
          return;
        }
        const result = data as {
          xp_awarded: number;
          streak_days: number;
          already_completed: boolean;
        };
        setXpAwarded(result.xp_awarded);
        setStreakDays(result.streak_days);
        setAlreadyCompleted(result.already_completed);
        router.refresh();
      });
  }, [phase, firstTryCorrect, questionTotal, lesson.id, router]);

  if (!mounted) return <main className="player" />;

  if (blocks.length === 0) {
    return (
      <main className="player center" style={{ paddingTop: 80 }}>
        <h1 style={{ fontSize: "1.8rem" }}>This lesson has no content yet.</h1>
        <Link className="btn btn-primary" href="/course" style={{ marginTop: 24 }}>
          ← Back to the course
        </Link>
      </main>
    );
  }

  function handleMainDone(wasCorrect: boolean | undefined, blockIndex: number) {
    const block = blocks[blockIndex];
    if (isQuestion(block)) {
      if (wasCorrect) setFirstTryCorrect((c) => c + 1);
      else setMistakes((m) => [...m, blockIndex]);
    }
    const next = index + 1;
    if (next < blocks.length) {
      setIndex(next);
      return;
    }
    // Main pass finished — mistakes round, or straight to the podium.
    const pending = isQuestion(block) && !wasCorrect ? [...mistakes, blockIndex] : mistakes;
    if (pending.length > 0) {
      setFixQueue(pending);
      setPhase("fixup");
    } else {
      setPhase("done");
    }
  }

  function handleFixupDone(wasCorrect: boolean) {
    setAttempt((a) => a + 1);
    if (wasCorrect) {
      setFixedCount((c) => c + 1);
      const rest = fixQueue.slice(1);
      if (rest.length === 0) {
        setPhase("done");
      } else {
        setFixQueue(rest);
      }
    } else {
      // Still wrong → move it to the back of the queue and keep going.
      setFixQueue((q) => [...q.slice(1), q[0]]);
    }
  }

  if (phase === "done") {
    return (
      <SummaryScreen
        lesson={lesson}
        course={course}
        firstTryCorrect={firstTryCorrect}
        questionTotal={questionTotal}
        mistakesFixed={mistakes.length}
        xpAwarded={xpAwarded}
        streakDays={streakDays}
        alreadyCompleted={alreadyCompleted}
        saveFailed={saveFailed}
      />
    );
  }

  if (phase === "fixup") {
    const blockIndex = fixQueue[0];
    const block = blocks[blockIndex] as QuestionBlock;
    const totalToFix = mistakes.length;
    return (
      <main className="player">
        <div className="player-top">
          <Link href="/course" className="x" aria-label="Exit lesson">✕</Link>
          <div className="track-bar">
            <i style={{ width: `${(fixedCount / Math.max(totalToFix, 1)) * 100}%` }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: ".85rem" }}>
            {fixedCount}/{totalToFix}
          </span>
        </div>
        <div className="fixup-banner">
          <span className="em">🔁</span>
          <span>
            Mistake round — let&apos;s fix what slipped. Get each one right to
            finish the lesson.
          </span>
        </div>
        <QuestionRenderer
          key={`fix-${blockIndex}-${attempt}`}
          block={block}
          meta={`${meta} · Second chance`}
          onDone={handleFixupDone}
        />
      </main>
    );
  }

  const block = blocks[index];
  return (
    <main className="player">
      <div className="player-top">
        <Link href="/course" className="x" aria-label="Exit lesson">✕</Link>
        <div className="track-bar">
          <i style={{ width: `${(index / blocks.length) * 100}%` }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: ".85rem" }}>
          {index + 1}/{blocks.length}
        </span>
      </div>

      {block.type === "material" ? (
        <MaterialView
          key={index}
          block={block}
          meta={meta}
          onDone={() => handleMainDone(undefined, index)}
        />
      ) : (
        <QuestionRenderer
          key={index}
          block={block}
          meta={meta}
          onDone={(correct) => handleMainDone(correct, index)}
        />
      )}
    </main>
  );
}
