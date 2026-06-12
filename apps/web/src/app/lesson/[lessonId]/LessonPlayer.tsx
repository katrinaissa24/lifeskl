"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  Course,
  Lesson,
  LessonBlock,
  MultipleChoiceBlock,
  TrueFalseBlock,
} from "@lifeskl/core";

// Walks a lesson's content blocks one at a time: enriched material reads like
// a card with a Continue button; questions are interactive with instant
// feedback. New block types added to @lifeskl/core get a renderer here.

type QuestionBlock = MultipleChoiceBlock | TrueFalseBlock;

function optionsFor(block: QuestionBlock): { label: string; correct: boolean }[] {
  if (block.type === "multiple_choice") {
    return block.options.map((label, i) => ({
      label,
      correct: i === block.correctIndex,
    }));
  }
  return [
    { label: "True", correct: block.answer === true },
    { label: "False", correct: block.answer === false },
  ];
}

function QuestionView({
  block,
  meta,
  onDone,
}: {
  block: QuestionBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const options = optionsFor(block);
  const answered = chosen !== null;
  const correct = answered && options[chosen].correct;

  return (
    <div>
      <div className="q-meta">{meta}</div>
      <div className="q-text">{block.prompt}</div>
      <div className="opts">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => setChosen(i)}
            className={[
              "opt",
              answered && opt.correct ? "correct" : "",
              answered && i === chosen && !opt.correct ? "wrong" : "",
            ].join(" ")}
          >
            <span className="k">{String.fromCharCode(65 + i)}</span>
            {opt.label}
          </button>
        ))}
      </div>
      <div className={`fb ${answered ? "show" : ""} ${correct ? "good" : "bad"}`}>
        <b>{correct ? "Exactly right." : "Not quite —"}</b>
        {block.explanation && <span> {block.explanation}</span>}
      </div>
      {answered && (
        <div className="player-foot">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => onDone(correct)}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

export function LessonPlayer({
  course,
  lesson,
}: {
  course: Course;
  lesson: Lesson;
}) {
  const blocks: LessonBlock[] = lesson.content;
  const total = blocks.length;
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const questionCount = blocks.filter((b) => b.type !== "material").length;
  const finished = index >= total;
  const block = finished ? null : blocks[index];

  function advance(wasCorrect?: boolean) {
    if (wasCorrect) setCorrectCount((c) => c + 1);
    setIndex((i) => i + 1);
  }

  if (total === 0) {
    return (
      <main className="player center" style={{ paddingTop: 80 }}>
        <h1 style={{ fontSize: "1.8rem" }}>This lesson has no content yet.</h1>
        <Link className="btn btn-primary" href="/dashboard" style={{ marginTop: 24 }}>
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="player">
        <div className="done-screen">
          <div className="em">✦</div>
          <h1>Lesson complete!</h1>
          <p>
            {questionCount > 0
              ? `You got ${correctCount} of ${questionCount} questions right.`
              : "Nice read — knowledge banked."}
          </p>
          <div className="done-stats">
            <span className="chip chip-accent">⚡ +{lesson.xpReward} XP</span>
            <span className="streak">🔥 Streak fed</span>
          </div>
          <p className="muted" style={{ fontSize: ".85rem" }}>
            (Progress saving is the next thing we wire up.)
          </p>
          <Link className="btn btn-accent" href="/dashboard" style={{ marginTop: 18 }}>
            Back to your classroom →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="player">
      <div className="player-top">
        <Link href="/dashboard" className="x" aria-label="Exit lesson">✕</Link>
        <div className="track-bar">
          <i style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: ".85rem" }}>
          {index + 1}/{total}
        </span>
      </div>

      {block!.type === "material" ? (
        <div>
          <div className="q-meta">
            {course.emoji} {course.title} · Read
          </div>
          {block!.title && <h1 className="material-title">{block!.title}</h1>}
          <p className="material-body">{block!.body}</p>
          <div className="player-foot">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => advance()}
            >
              Got it →
            </button>
          </div>
        </div>
      ) : (
        <QuestionView
          key={index}
          block={block as QuestionBlock}
          meta={`${course.emoji} ${course.title} · ${lesson.title}`}
          onDone={advance}
        />
      )}
    </main>
  );
}
