"use client";

import Link from "next/link";
import { useState } from "react";

// The landing page's embedded one-question demo lesson, ported faithfully
// from the design mock. Content is intentionally hard-coded: this is
// marketing, not curriculum (the real lessons live in Supabase).
const QUESTION = {
  meta: "Money & Finance · Credit",
  text: 'A friend says "just pay the minimum on your credit card." Why is that risky?',
  options: [
    "It hurts your credit score instantly",
    "Interest piles up on the rest — debt grows",
    "The card gets cancelled",
    "Nothing — it's totally fine",
  ],
  correctIndex: 1,
  goodFb:
    " Paying only the minimum means interest keeps compounding on the balance, so the debt grows even while you 'pay.'",
  badFb:
    " Paying only the minimum lets interest compound on the rest — your balance grows even as you pay. That's the trap.",
};

export function LandingDemo() {
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(33);

  const answered = chosen !== null;
  const correct = chosen === QUESTION.correctIndex;

  function choose(i: number) {
    if (answered) return;
    setChosen(i);
    setProgress(66);
  }

  function finish() {
    setProgress(100);
    setTimeout(() => setDone(true), 280);
  }

  return (
    <div className="demo-card">
      <div className="lesson-bar" style={{ marginBottom: 22 }}>
        <span>Q1 / 3</span>
        <div className="track-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
        <span>🔥 4</span>
      </div>

      {!done ? (
        <div>
          <div className="q-meta">{QUESTION.meta}</div>
          <div className="q-text">{QUESTION.text}</div>
          <div className="opts">
            {QUESTION.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => choose(i)}
                className={[
                  "opt",
                  answered && i === QUESTION.correctIndex ? "correct" : "",
                  answered && i === chosen && !correct ? "wrong" : "",
                ].join(" ")}
              >
                <span className="k">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
          <div className={`fb ${answered ? "show" : ""} ${correct ? "good" : "bad"}`}>
            <b>{correct ? "Exactly right." : "Not quite —"}</b>
            <span>{correct ? QUESTION.goodFb : QUESTION.badFb}</span>
          </div>
          <div className={`foot-cont ${answered ? "show" : ""}`}>
            <button type="button" className="btn btn-primary btn-block" onClick={finish}>
              Continue →
            </button>
          </div>
        </div>
      ) : (
        <div className="done show">
          <div className="em">✦</div>
          <h3>That&apos;s a lesson.</h3>
          <p>Five minutes of these and the gaps start closing.</p>
          <Link className="btn btn-primary" href="/signup" style={{ marginTop: 16 }}>
            Start for free →
          </Link>
        </div>
      )}
    </div>
  );
}
