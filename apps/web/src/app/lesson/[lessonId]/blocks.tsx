"use client";

import { useMemo, useState } from "react";
import type {
  BudgetBuilderBlock,
  CategorizeBlock,
  DecisionPathBlock,
  FillBlankBlock,
  MatchPairsBlock,
  MaterialBlock,
  MultipleChoiceBlock,
  OrderStepsBlock,
  SliderEstimateBlock,
  SpotScamBlock,
  TapWordBlock,
  TrueFalseBlock,
} from "@lifeskl/core";

// One renderer per block type. Every question component reports through
// onDone(correct) exactly once, when the learner taps Continue.

function shuffled<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function Feedback({
  state,
  good,
  bad,
  detail,
}: {
  state: "idle" | "good" | "bad";
  good?: string;
  bad?: string;
  detail?: string;
}) {
  if (state === "idle") return null;
  return (
    <div className={`fb show ${state}`}>
      <b>{state === "good" ? (good ?? "Exactly right.") : (bad ?? "Not quite —")}</b>
      {detail && <span>{detail}</span>}
    </div>
  );
}

function ContinueFoot({ onClick, label = "Continue →" }: { onClick: () => void; label?: string }) {
  return (
    <div className="player-foot">
      <button type="button" className="btn btn-primary btn-block" onClick={onClick}>
        {label}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ material

export function MaterialView({
  block,
  meta,
  onDone,
}: {
  block: MaterialBlock;
  meta: string;
  onDone: () => void;
}) {
  // body: blank lines = paragraphs, "- " lines = bullets, **bold** = bold.
  const parts = block.body.split(/\n\s*\n/);
  const renderInline = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
      seg.startsWith("**") && seg.endsWith("**") ? (
        <strong key={i} style={{ color: "var(--text)" }}>
          {seg.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{seg}</span>
      ),
    );

  return (
    <div>
      <div className="q-meta">{meta} · Read</div>
      {block.title && <h1 className="material-title">{block.title}</h1>}
      {parts.map((part, i) => {
        const lines = part.split("\n");
        const isList = lines.every((l) => l.trim().startsWith("- ") || !l.trim());
        if (isList && lines.some((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} style={{ margin: "14px 0 0", paddingLeft: 4, listStyle: "none" }}>
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li
                    key={j}
                    className="material-body"
                    style={{ display: "flex", gap: 10, padding: "5px 0" }}
                  >
                    <span style={{ color: "var(--accent)", fontWeight: 800 }}>•</span>
                    <span>{renderInline(l.trim().slice(2))}</span>
                  </li>
                ))}
            </ul>
          );
        }
        return (
          <p key={i} className="material-body" style={{ marginTop: i === 0 ? 0 : 14 }}>
            {renderInline(part)}
          </p>
        );
      })}
      {block.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="material-img" src={block.image} alt={block.imageAlt ?? ""} />
      )}
      <ContinueFoot onClick={onDone} label="Got it →" />
    </div>
  );
}

// ----------------------------------------------------------- multiple choice

export function MultipleChoiceView({
  block,
  meta,
  onDone,
}: {
  block: MultipleChoiceBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  const correct = answered && chosen === block.correctIndex;

  return (
    <div>
      <div className="q-meta">{meta}</div>
      {block.context && (
        <p className="material-body" style={{ marginTop: 10 }}>
          {block.context}
        </p>
      )}
      <div className="q-text">{block.prompt}</div>
      <div className="opts">
        {block.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => setChosen(i)}
            className={[
              "opt",
              answered && i === block.correctIndex ? "correct" : "",
              answered && i === chosen && i !== block.correctIndex ? "wrong" : "",
            ].join(" ")}
          >
            <span className="k">{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
      </div>
      <Feedback state={answered ? (correct ? "good" : "bad") : "idle"} detail={block.explanation} />
      {answered && <ContinueFoot onClick={() => onDone(correct)} />}
    </div>
  );
}

// ---------------------------------------------------------------- true/false

export function TrueFalseView({
  block,
  meta,
  onDone,
}: {
  block: TrueFalseBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const [chosen, setChosen] = useState<boolean | null>(null);
  const answered = chosen !== null;
  const correct = answered && chosen === block.answer;

  return (
    <div>
      <div className="q-meta">{meta} · True or false?</div>
      <div className="q-text">{block.prompt}</div>
      <div className="opts" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {([true, false] as const).map((val) => (
          <button
            key={String(val)}
            type="button"
            disabled={answered}
            onClick={() => setChosen(val)}
            className={[
              "opt",
              answered && val === block.answer ? "correct" : "",
              answered && val === chosen && val !== block.answer ? "wrong" : "",
            ].join(" ")}
            style={{ justifyContent: "center", fontWeight: 800 }}
          >
            {val ? "✓ True" : "✗ False"}
          </button>
        ))}
      </div>
      <Feedback state={answered ? (correct ? "good" : "bad") : "idle"} detail={block.explanation} />
      {answered && <ContinueFoot onClick={() => onDone(correct)} />}
    </div>
  );
}

// ---------------------------------------------------------------- fill blank

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[$,]/g, "").replace(/\s+/g, " ");
}

export function FillBlankView({
  block,
  meta,
  onDone,
}: {
  block: FillBlankBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"idle" | "good" | "bad">("idle");
  const [before, after] = block.prompt.split("___");

  function check() {
    if (!value.trim()) return;
    const ok =
      normalize(value) === normalize(block.answer) ||
      (block.accept ?? []).some((a) => normalize(a) === normalize(value));
    setResult(ok ? "good" : "bad");
  }

  const answered = result !== "idle";

  return (
    <div>
      <div className="q-meta">{meta} · Type the answer</div>
      <div className="q-text" style={{ lineHeight: 1.5 }}>
        {before}
        <span className="blank-line">{answered ? block.answer : value || "______"}</span>
        {after}
      </div>
      {!answered && (
        <>
          <input
            className="input blank-input"
            value={value}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Your answer"
            aria-label="Your answer"
          />
          {block.hint && (
            <p className="muted" style={{ marginTop: 10, fontWeight: 600, fontSize: ".88rem" }}>
              Hint: {block.hint}
            </p>
          )}
          <div className="check-foot">
            <button
              type="button"
              className="btn btn-accent btn-block"
              disabled={!value.trim()}
              onClick={check}
            >
              Check
            </button>
          </div>
        </>
      )}
      <Feedback
        state={result}
        bad={`Not quite — it's "${block.answer}".`}
        detail={block.explanation}
      />
      {answered && <ContinueFoot onClick={() => onDone(result === "good")} />}
    </div>
  );
}

// ------------------------------------------------------------------ tap word

export function TapWordView({
  block,
  meta,
  onDone,
}: {
  block: TapWordBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const words = useMemo(() => block.sentence.split(/\s+/), [block.sentence]);
  const strip = (w: string) => w.replace(/[.,!?;:'"()]/g, "");
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const wrongIndex = words.findIndex((w) => strip(w) === block.wrongWord);
  const correct = answered && picked === wrongIndex;

  return (
    <div>
      <div className="q-meta">{meta} · Spot the error</div>
      <div className="q-text">{block.instructions ?? "One word is wrong. Tap it."}</div>
      <div className="word-grid">
        {words.map((word, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => setPicked(i)}
            className={[
              "word-chip",
              answered && i === wrongIndex ? (correct ? "hit" : "reveal") : "",
              answered && i === picked && !correct ? "miss" : "",
            ].join(" ")}
          >
            {word}
          </button>
        ))}
      </div>
      <Feedback
        state={answered ? (correct ? "good" : "bad") : "idle"}
        good={`Yes — it should be "${block.correctWord}".`}
        bad={`The culprit was "${block.wrongWord}" → "${block.correctWord}".`}
        detail={block.explanation}
      />
      {answered && <ContinueFoot onClick={() => onDone(correct)} />}
    </div>
  );
}

// --------------------------------------------------------------- match pairs

export function MatchPairsView({
  block,
  meta,
  onDone,
}: {
  block: MatchPairsBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const rights = useMemo(() => shuffled(block.pairs.map((p) => p.right)), [block.pairs]);
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [shaking, setShaking] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);

  const done = matched.size === block.pairs.length;

  function pickRight(right: string) {
    if (!selLeft || matched.has(right)) return;
    const pair = block.pairs.find((p) => p.left === selLeft);
    if (pair?.right === right) {
      setMatched((m) => new Set(m).add(right));
      setSelLeft(null);
    } else {
      setMisses((n) => n + 1);
      setShaking(right);
      setTimeout(() => setShaking(null), 350);
      setSelLeft(null);
    }
  }

  const leftMatched = (left: string) =>
    matched.has(block.pairs.find((p) => p.left === left)?.right ?? "");

  return (
    <div>
      <div className="q-meta">{meta} · Match the pairs</div>
      <div className="q-text">{block.prompt ?? "Match each term to its meaning."}</div>
      <div className="pairs-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {block.pairs.map((p) => (
            <button
              key={p.left}
              type="button"
              disabled={leftMatched(p.left)}
              onClick={() => setSelLeft(selLeft === p.left ? null : p.left)}
              className={[
                "pair-btn",
                selLeft === p.left ? "sel" : "",
                leftMatched(p.left) ? "matched" : "",
              ].join(" ")}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rights.map((right) => (
            <button
              key={right}
              type="button"
              disabled={matched.has(right) || !selLeft}
              onClick={() => pickRight(right)}
              className={[
                "pair-btn",
                matched.has(right) ? "matched" : "",
                shaking === right ? "shake" : "",
              ].join(" ")}
            >
              {right}
            </button>
          ))}
        </div>
      </div>
      {!done && (
        <p className="muted" style={{ marginTop: 14, fontWeight: 600, fontSize: ".85rem" }}>
          {selLeft ? "Now tap its match →" : "Tap a term on the left first."}
        </p>
      )}
      <Feedback
        state={done ? (misses === 0 ? "good" : "bad") : "idle"}
        good="Flawless matching."
        bad={`All matched — with ${misses} ${misses === 1 ? "slip" : "slips"} along the way.`}
      />
      {done && <ContinueFoot onClick={() => onDone(misses === 0)} />}
    </div>
  );
}

// --------------------------------------------------------------- order steps

export function OrderStepsView({
  block,
  meta,
  onDone,
}: {
  block: OrderStepsBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const pool = useMemo(() => {
    // Reshuffle until the displayed order differs from the answer.
    let s = shuffled(block.steps);
    if (block.steps.length > 2) {
      let guard = 0;
      while (s.every((v, i) => v === block.steps[i]) && guard++ < 10) s = shuffled(block.steps);
    }
    return s;
  }, [block.steps]);
  const [seq, setSeq] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const correct = checked && seq.every((s, i) => s === block.steps[i]);

  return (
    <div>
      <div className="q-meta">{meta} · Put it in order</div>
      <div className="q-text">{block.prompt}</div>

      <div className="order-divider">Your order</div>
      <div className="order-built">
        {seq.length === 0 && (
          <p className="muted" style={{ fontWeight: 600, fontSize: ".88rem" }}>
            Tap the steps below in the right order.
          </p>
        )}
        {seq.map((step, i) => (
          <button
            key={step}
            type="button"
            disabled={checked}
            onClick={() => setSeq((s) => s.filter((x) => x !== step))}
            className={[
              "order-item",
              !checked ? "in-seq" : "",
              checked && block.steps[i] === step ? "right" : "",
              checked && block.steps[i] !== step ? "wrong-pos" : "",
            ].join(" ")}
          >
            <span className="badge-num">{i + 1}</span>
            {step}
          </button>
        ))}
      </div>

      {seq.length < block.steps.length && (
        <>
          <div className="order-divider">Steps</div>
          <div className="order-pool">
            {pool
              .filter((s) => !seq.includes(s))
              .map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setSeq((s) => [...s, step])}
                  className="order-item"
                >
                  <span className="badge-num">+</span>
                  {step}
                </button>
              ))}
          </div>
        </>
      )}

      {!checked && seq.length === block.steps.length && (
        <div className="check-foot">
          <button type="button" className="btn btn-accent btn-block" onClick={() => setChecked(true)}>
            Check order
          </button>
        </div>
      )}
      <Feedback
        state={checked ? (correct ? "good" : "bad") : "idle"}
        bad={`The right order: ${block.steps.map((s, i) => `${i + 1}. ${s}`).join("  ")}`}
        detail={block.explanation}
      />
      {checked && <ContinueFoot onClick={() => onDone(correct)} />}
    </div>
  );
}

// ---------------------------------------------------------------- categorize

export function CategorizeView({
  block,
  meta,
  onDone,
}: {
  block: CategorizeBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const items = useMemo(() => shuffled(block.items), [block.items]);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [misses, setMisses] = useState(0);
  const [locked, setLocked] = useState(false);

  const finished = index >= items.length;
  const current = finished ? null : items[index];

  function pick(catIndex: number) {
    if (!current || locked) return;
    const ok = catIndex === current.category;
    if (!ok) setMisses((n) => n + 1);
    setFlash(ok ? "good" : "bad");
    setLocked(true);
    setTimeout(() => {
      setFlash(null);
      setLocked(false);
      setIndex((i) => i + 1);
    }, ok ? 450 : 1100);
  }

  return (
    <div>
      <div className="q-meta">{meta} · Sort it</div>
      <div className="q-text">{block.prompt}</div>
      {!finished && current ? (
        <div className="cat-stage">
          <div key={index} className={`cat-current ${flash ?? ""}`}>
            {current.text}
            {flash === "bad" && (
              <div style={{ fontSize: ".85rem", fontFamily: "var(--font-text)", fontWeight: 600, marginTop: 8, color: "#c2185b" }}>
                Actually: {block.categories[current.category]}
              </div>
            )}
          </div>
          <div className="cat-buckets">
            {block.categories.map((cat, i) => (
              <button key={cat} type="button" className="cat-bucket" disabled={locked} onClick={() => pick(i)}>
                {cat}
              </button>
            ))}
          </div>
          <div className="cat-progress">
            {index + 1} of {items.length}
            {misses > 0 && ` · ${misses} ${misses === 1 ? "miss" : "misses"}`}
          </div>
        </div>
      ) : (
        <>
          <Feedback
            state={misses === 0 ? "good" : "bad"}
            good={`All ${items.length} sorted perfectly.`}
            bad={`Sorted, with ${misses} ${misses === 1 ? "miss" : "misses"}.`}
          />
          <ContinueFoot onClick={() => onDone(misses === 0)} />
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------ budget builder

export function BudgetBuilderView({
  block,
  meta,
  onDone,
}: {
  block: BudgetBuilderBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const STEP = 10;
  const [alloc, setAlloc] = useState<number[]>(block.categories.map(() => 0));
  const [checks, setChecks] = useState(0);
  const [result, setResult] = useState<"idle" | "good" | "bad">("idle");
  const [problems, setProblems] = useState<string[]>([]);

  const total = alloc.reduce((s, v) => s + v, 0);
  const left = block.income - total;
  const savings = block.categories.reduce(
    (s, c, i) => (c.kind === "savings" ? s + alloc[i] : s),
    0,
  );

  function bump(i: number, dir: 1 | -1) {
    setAlloc((a) => {
      const next = [...a];
      const v = next[i] + dir * STEP;
      if (v < 0) return next;
      if (dir === 1 && left < STEP) return next;
      next[i] = v;
      return next;
    });
    if (result === "bad") setResult("idle");
  }

  function rowSatisfied(i: number): boolean {
    const c = block.categories[i];
    if (c.kind === "need") return alloc[i] === (c.required ?? 0);
    if (c.kind === "savings") return savings >= block.savingsTarget;
    return true;
  }

  function check() {
    const probs: string[] = [];
    block.categories.forEach((c, i) => {
      if (c.kind === "need" && alloc[i] < (c.required ?? 0))
        probs.push(`${c.name} isn't fully covered — it needs $${c.required}.`);
      if (c.kind === "need" && alloc[i] > (c.required ?? 0))
        probs.push(`${c.name} only costs $${c.required} — don't overpay it.`);
    });
    if (savings < block.savingsTarget)
      probs.push(`Savings is short: at least $${block.savingsTarget} needs to go there.`);
    if (left < 0) probs.push("You've allocated more than you earn.");
    setProblems(probs);
    setChecks((n) => n + 1);
    setResult(probs.length === 0 ? "good" : "bad");
  }

  const passed = result === "good";

  return (
    <div>
      <div className="q-meta">{meta} · Build the budget</div>
      <div className="q-text">{block.prompt}</div>

      <div className="bb-top">
        <span className={`bb-left ${left < 0 ? "over" : ""}`}>
          Left to budget: <em>${left}</em>
        </span>
        <span className="chip chip-soft">Income ${block.income}</span>
      </div>

      <div className="bb-rows">
        {block.categories.map((c, i) => (
          <div key={c.name} className={`bb-row ${passed || rowSatisfied(i) ? "satisfied" : ""}`}>
            <span style={{ fontSize: "1.3rem" }}>{c.emoji ?? "•"}</span>
            <span className="nm">
              {c.name}
              {c.kind === "need" && <span className="req">bill: ${c.required}</span>}
              {c.kind === "savings" && <span className="req">goal: ${block.savingsTarget}+</span>}
            </span>
            <span className={`kind ${c.kind}`}>{c.kind}</span>
            <div className="bb-stepper">
              <button type="button" aria-label={`Less for ${c.name}`} disabled={passed || alloc[i] === 0} onClick={() => bump(i, -1)}>
                −
              </button>
              <span className="amt">${alloc[i]}</span>
              <button type="button" aria-label={`More for ${c.name}`} disabled={passed || left < STEP} onClick={() => bump(i, 1)}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {!passed && (
        <div className="check-foot">
          <button type="button" className="btn btn-accent btn-block" onClick={check}>
            Check my budget
          </button>
        </div>
      )}
      <Feedback
        state={result}
        good={checks === 1 ? "First try — your budget balances!" : "There it is — balanced."}
        bad="Almost —"
        detail={passed ? block.explanation : problems.join(" ")}
      />
      {passed && <ContinueFoot onClick={() => onDone(checks === 1)} />}
    </div>
  );
}

// ------------------------------------------------------------ slider estimate

export function SliderEstimateView({
  block,
  meta,
  onDone,
}: {
  block: SliderEstimateBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const mid = block.min + Math.round((block.max - block.min) / 2 / block.step) * block.step;
  const [value, setValue] = useState(mid);
  const [checked, setChecked] = useState(false);
  const correct = Math.abs(value - block.answer) <= block.tolerance;

  const fmt = (v: number) => `${block.unitPrefix ?? ""}${v.toLocaleString()}${block.unitSuffix ?? ""}`;

  return (
    <div>
      <div className="q-meta">{meta} · Estimate it</div>
      <div className="q-text">{block.prompt}</div>
      <div className="slider-wrap">
        <div className="slider-value">{fmt(value)}</div>
        <input
          type="range"
          className="slider"
          min={block.min}
          max={block.max}
          step={block.step}
          value={value}
          disabled={checked}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Your estimate"
        />
        <div className="slider-minmax">
          <span>{fmt(block.min)}</span>
          <span>{fmt(block.max)}</span>
        </div>
      </div>
      {!checked && (
        <div className="check-foot">
          <button type="button" className="btn btn-accent btn-block" onClick={() => setChecked(true)}>
            Lock it in
          </button>
        </div>
      )}
      <Feedback
        state={checked ? (correct ? "good" : "bad") : "idle"}
        good={`Close enough — the answer is ${fmt(block.answer)}.`}
        bad={`It's ${fmt(block.answer)} — you said ${fmt(value)}.`}
        detail={block.explanation}
      />
      {checked && <ContinueFoot onClick={() => onDone(correct)} />}
    </div>
  );
}

// -------------------------------------------------------------- decision path

export function DecisionPathView({
  block,
  meta,
  onDone,
}: {
  block: DecisionPathBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [stat, setStat] = useState(block.stat.start);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [bestCount, setBestCount] = useState(0);

  const finished = step >= block.steps.length;
  const needed = Math.ceil(block.steps.length * (2 / 3));
  const passed = bestCount >= needed;

  function choose(i: number) {
    if (chosen !== null) return;
    const opt = block.steps[step].options[i];
    setChosen(i);
    setStat((s) => s + opt.delta);
    setLastDelta(opt.delta);
    if (opt.best) setBestCount((n) => n + 1);
  }

  function next() {
    setChosen(null);
    setLastDelta(null);
    setStep((s) => s + 1);
  }

  if (!started) {
    return (
      <div>
        <div className="q-meta">{meta} · Boss challenge</div>
        <div className="q-text">
          {block.stat.emoji} {block.title}
        </div>
        {block.intro && <p className="material-body">{block.intro}</p>}
        <div className="dp-stat">
          {block.stat.emoji} {block.stat.name}: {block.stat.start}
        </div>
        <ContinueFoot onClick={() => setStarted(true)} label="Start the challenge →" />
      </div>
    );
  }

  if (finished) {
    return (
      <div>
        <div className="q-meta">{meta} · Boss challenge</div>
        <div className="q-text">Final result</div>
        <div className="dp-stat" style={{ fontSize: "1.4rem" }}>
          {block.stat.emoji} {block.stat.name}: {stat}
        </div>
        <Feedback
          state={passed ? "good" : "bad"}
          good={`You made the best call in ${bestCount}/${block.steps.length} situations.`}
          bad={`Best call in only ${bestCount}/${block.steps.length} situations — worth a rematch.`}
          detail={block.outro}
        />
        <ContinueFoot onClick={() => onDone(passed)} />
      </div>
    );
  }

  const current = block.steps[step];
  return (
    <div>
      <div className="q-meta">{meta} · {block.title}</div>
      <div className="dp-progress">
        {block.steps.map((_, i) => (
          <i key={i} className={i < step || (i === step && chosen !== null) ? "done" : ""} />
        ))}
      </div>
      <div className="dp-stat">
        {block.stat.emoji} {block.stat.name}: {stat}
        {lastDelta !== null && (
          <span className={`delta ${lastDelta >= 0 ? "up" : "down"}`}>
            {lastDelta >= 0 ? `+${lastDelta}` : lastDelta}
          </span>
        )}
      </div>
      <div className="dp-situation">{current.situation}</div>
      <div className="opts" style={{ marginTop: 18 }}>
        {current.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={chosen !== null}
            onClick={() => choose(i)}
            className={[
              "opt",
              chosen !== null && opt.best ? "correct" : "",
              chosen === i && !opt.best ? "wrong" : "",
            ].join(" ")}
          >
            <span className="k">{String.fromCharCode(65 + i)}</span>
            {opt.text}
          </button>
        ))}
      </div>
      {chosen !== null && (
        <>
          <Feedback
            state={current.options[chosen].best ? "good" : "bad"}
            good="Best move."
            bad="There was a better play —"
            detail={current.options[chosen].feedback}
          />
          <ContinueFoot onClick={next} label={step === block.steps.length - 1 ? "See the result →" : "Next →"} />
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- spot scam

export function SpotScamView({
  block,
  meta,
  onDone,
}: {
  block: SpotScamBlock;
  meta: string;
  onDone: (correct: boolean) => void;
}) {
  const totalFlags = block.segments.filter((s) => s.flag).length;
  const [found, setFound] = useState<Set<number>>(new Set());
  const [misses, setMisses] = useState(0);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  const allFound = found.size === totalFlags;

  function tap(i: number) {
    if (allFound || found.has(i)) return;
    if (block.segments[i].flag) {
      setFound((f) => new Set(f).add(i));
    } else {
      setMisses((n) => n + 1);
      setFlashIdx(i);
      setTimeout(() => setFlashIdx(null), 400);
    }
  }

  return (
    <div>
      <div className="q-meta">{meta} · Spot the scam</div>
      <div className="q-text">{block.prompt}</div>

      <div className="scam-msg">
        <div className="scam-head">
          <b>From: {block.messageFrom}</b>
          {block.messageSubject && <>Subject: {block.messageSubject}</>}
        </div>
        <div className="scam-body">
          {block.segments.map((seg, i) => (
            <span key={i}>
              <span
                role="button"
                tabIndex={0}
                className={[
                  "scam-seg",
                  found.has(i) ? "found" : "",
                  flashIdx === i ? "safe-flash" : "",
                ].join(" ")}
                onClick={() => tap(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && tap(i)}
              >
                {seg.text}
              </span>{" "}
            </span>
          ))}
        </div>
      </div>

      <div className="scam-count">
        🚩 {found.size}/{totalFlags} red flags found
        {misses > 0 && ` · ${misses} wrong ${misses === 1 ? "tap" : "taps"}`}
      </div>

      {found.size > 0 && (
        <div className="scam-flags">
          {[...found].sort((a, b) => a - b).map((i) => (
            <div key={i} className="scam-flag-note">
              🚩 {block.segments[i].flag}
            </div>
          ))}
        </div>
      )}

      {allFound && (
        <>
          <Feedback
            state={misses === 0 ? "good" : "bad"}
            good="Every red flag spotted, zero false alarms."
            bad={`All flags found, but ${misses} innocent ${misses === 1 ? "line" : "lines"} got accused.`}
            detail={block.explanation}
          />
          <ContinueFoot onClick={() => onDone(misses === 0)} />
        </>
      )}
    </div>
  );
}
