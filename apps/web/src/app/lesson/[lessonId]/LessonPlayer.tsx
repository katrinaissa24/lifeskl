"use client";

import { useState } from "react";
import Link from "next/link";
import type { Exercise, Lesson, Track } from "@lifeskl/core";

type Choice = number | boolean;

function isCorrect(exercise: Exercise, choice: Choice): boolean {
  if (exercise.type === "multiple-choice") {
    return choice === exercise.correctIndex;
  }
  return choice === exercise.answer;
}

export function LessonPlayer({
  track,
  lesson,
}: {
  track: Track;
  lesson: Lesson;
}) {
  const total = lesson.exercises.length;
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercise = lesson.exercises[index];

  function handleCheck() {
    if (choice === null) return;
    if (isCorrect(exercise, choice)) setCorrectCount((c) => c + 1);
    setChecked(true);
  }

  function handleNext() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setChoice(null);
      setChecked(false);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-extrabold">Lesson complete!</h1>
        <p className="text-slate-500">
          You got <strong>{correctCount}</strong> of {total} right.
        </p>
        <div className="rounded-2xl bg-emerald-50 px-6 py-4 text-lg font-bold text-emerald-600">
          +{lesson.xp} XP
        </div>
        <Link
          href="/"
          className="rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-white shadow transition hover:bg-emerald-600"
        >
          Back to path
        </Link>
      </main>
    );
  }

  const answeredCorrectly =
    checked && choice !== null && isCorrect(exercise, choice);

  // Normalize either exercise type into a uniform list of options.
  const options =
    exercise.type === "multiple-choice"
      ? exercise.options.map((label, value) => ({ label, value: value as Choice }))
      : [
          { label: "True", value: true as Choice },
          { label: "False", value: false as Choice },
        ];

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-6">
      {/* Progress bar + close */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="text-2xl text-slate-400 hover:text-slate-600">
          ✕
        </Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-500">
        {track.emoji} {track.title}
      </p>
      <h1 className="mb-8 text-xl font-extrabold leading-snug">
        {exercise.prompt}
      </h1>

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const selected = choice === opt.value;
          const showCorrect = checked && isCorrect(exercise, opt.value);
          const showWrong = checked && selected && !showCorrect;
          return (
            <button
              key={String(opt.value)}
              type="button"
              disabled={checked}
              onClick={() => setChoice(opt.value)}
              className={[
                "rounded-2xl border-2 px-4 py-3 text-left font-semibold transition",
                showCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : showWrong
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : selected
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {checked && exercise.explanation && (
        <p
          className={[
            "mt-6 rounded-2xl px-4 py-3 text-sm",
            answeredCorrectly
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-600",
          ].join(" ")}
        >
          {answeredCorrectly ? "Correct! " : "Not quite. "}
          {exercise.explanation}
        </p>
      )}

      <div className="mt-auto pt-8">
        {!checked ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={choice === null}
            className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-white shadow transition enabled:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-white shadow transition hover:bg-emerald-600"
          >
            {index + 1 < total ? "Continue" : "Finish"}
          </button>
        )}
      </div>
    </main>
  );
}
