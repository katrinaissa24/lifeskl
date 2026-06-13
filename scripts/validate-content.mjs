#!/usr/bin/env node
// Validates content/personal-finance/*.json against content/CONTENT_SPEC.md.
// Usage: node scripts/validate-content.mjs [file...]   (no args = all files)

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content", "personal-finance");

const ILLUSTRATIONS = new Set([
  "/illustrations/budget-split.svg",
  "/illustrations/smart-goals.svg",
  "/illustrations/emergency-fund.svg",
  "/illustrations/compound-growth.svg",
  "/illustrations/credit-score.svg",
  "/illustrations/debt-trap.svg",
  "/illustrations/investing-tree.svg",
  "/illustrations/needs-wants.svg",
  "/illustrations/insurance-umbrella.svg",
  "/illustrations/scam-alert.svg",
  "/illustrations/roadmap.svg",
  "/illustrations/paycheck.svg",
]);

const QUESTION_TYPES = new Set([
  "multiple_choice", "true_false", "fill_blank", "tap_word", "match_pairs",
  "order_steps", "categorize", "budget_builder", "slider_estimate",
  "decision_path", "spot_scam",
]);

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(contentDir).filter((f) => f.endsWith(".json")).map((f) => join(contentDir, f));

let failed = false;
const seenSortOrders = new Map();

for (const file of files) {
  const errors = [];
  const err = (msg) => errors.push(msg);
  let lesson;
  try {
    lesson = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`✗ ${file}: invalid JSON — ${e.message}`);
    failed = true;
    continue;
  }

  for (const key of ["slug", "title", "description", "unit", "sortOrder", "xpReward", "summaryPoints", "content"]) {
    if (lesson[key] === undefined) err(`missing field "${key}"`);
  }
  if (!Array.isArray(lesson.summaryPoints) || lesson.summaryPoints.length < 3 || lesson.summaryPoints.length > 5) {
    err(`summaryPoints must have 3–5 bullets (has ${lesson.summaryPoints?.length})`);
  }
  if (typeof lesson.sortOrder === "number") {
    if (seenSortOrders.has(lesson.sortOrder)) err(`duplicate sortOrder ${lesson.sortOrder} (also in ${seenSortOrders.get(lesson.sortOrder)})`);
    seenSortOrders.set(lesson.sortOrder, file);
  }

  const blocks = Array.isArray(lesson.content) ? lesson.content : [];
  let materialRun = 0, materialTotal = 0;
  const typeCounts = {};

  blocks.forEach((b, i) => {
    const at = `block ${i} (${b.type})`;
    typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;

    if (b.type === "material") {
      materialRun++; materialTotal++;
      if (materialRun > 3) err(`${at}: more than 3 material blocks in a row`);
      if (typeof b.body !== "string" || !b.body.trim()) err(`${at}: missing body`);
      else if (b.body.length > 600) err(`${at}: body is ${b.body.length} chars (max 600)`);
      if (b.image && !ILLUSTRATIONS.has(b.image)) err(`${at}: image "${b.image}" not in the allowed illustration list`);
      if (b.image && !b.imageAlt) err(`${at}: image without imageAlt`);
      return;
    }
    materialRun = 0;
    if (!QUESTION_TYPES.has(b.type)) { err(`${at}: unknown block type`); return; }

    switch (b.type) {
      case "multiple_choice": {
        if (!Array.isArray(b.options) || b.options.length < 3 || b.options.length > 4) err(`${at}: needs 3–4 options`);
        if (!Number.isInteger(b.correctIndex) || b.correctIndex < 0 || b.correctIndex >= (b.options?.length ?? 0)) err(`${at}: bad correctIndex`);
        if (!b.prompt) err(`${at}: missing prompt`);
        break;
      }
      case "true_false": {
        if (typeof b.answer !== "boolean") err(`${at}: answer must be boolean`);
        if (!b.prompt) err(`${at}: missing prompt`);
        break;
      }
      case "fill_blank": {
        if (!b.prompt?.includes("___")) err(`${at}: prompt must contain ___`);
        if (typeof b.answer !== "string" || !b.answer.trim()) err(`${at}: missing answer`);
        if (b.answer && /\s/.test(b.answer.trim())) err(`${at}: answer must be a single word/number`);
        break;
      }
      case "tap_word": {
        if (!b.sentence || !b.wrongWord || !b.correctWord) { err(`${at}: needs sentence, wrongWord, correctWord`); break; }
        const words = b.sentence.split(/\s+/).map((w) => w.replace(/[.,!?;:'"()]/g, ""));
        const hits = words.filter((w) => w === b.wrongWord).length;
        if (hits !== 1) err(`${at}: wrongWord "${b.wrongWord}" appears ${hits} times in sentence (must be exactly 1)`);
        if (/[.,!?;:'"()]/.test(b.wrongWord)) err(`${at}: wrongWord must not contain punctuation`);
        break;
      }
      case "match_pairs": {
        if (!Array.isArray(b.pairs) || b.pairs.length < 3 || b.pairs.length > 5) err(`${at}: needs 3–5 pairs`);
        const rights = new Set((b.pairs ?? []).map((p) => p.right));
        if (rights.size !== (b.pairs?.length ?? 0)) err(`${at}: duplicate right-side values`);
        break;
      }
      case "order_steps": {
        if (!Array.isArray(b.steps) || b.steps.length < 3 || b.steps.length > 5) err(`${at}: needs 3–5 steps`);
        if (!b.prompt) err(`${at}: missing prompt`);
        break;
      }
      case "categorize": {
        if (!Array.isArray(b.categories) || b.categories.length < 2 || b.categories.length > 3) err(`${at}: needs 2–3 categories`);
        if (!Array.isArray(b.items) || b.items.length < 4 || b.items.length > 8) err(`${at}: needs 4–8 items`);
        (b.items ?? []).forEach((it, j) => {
          if (!Number.isInteger(it.category) || it.category < 0 || it.category >= (b.categories?.length ?? 0)) err(`${at}: item ${j} bad category index`);
        });
        const cats = new Set((b.items ?? []).map((it) => it.category));
        if (cats.size < (b.categories?.length ?? 0)) err(`${at}: some category has no items`);
        break;
      }
      case "budget_builder": {
        if (typeof b.income !== "number" || b.income <= 0) err(`${at}: bad income`);
        if (!Array.isArray(b.categories) || b.categories.length < 3) err(`${at}: needs ≥3 categories`);
        const needs = (b.categories ?? []).filter((c) => c.kind === "need");
        const hasSavings = (b.categories ?? []).some((c) => c.kind === "savings");
        if (!needs.length) err(`${at}: needs at least one "need" category`);
        if (!hasSavings) err(`${at}: needs a "savings" category`);
        needs.forEach((c) => { if (typeof c.required !== "number" || c.required <= 0) err(`${at}: need "${c.name}" missing required amount`); });
        const needTotal = needs.reduce((s, c) => s + (c.required ?? 0), 0);
        if (typeof b.savingsTarget !== "number" || b.savingsTarget <= 0) err(`${at}: bad savingsTarget`);
        if (needTotal + b.savingsTarget > b.income) err(`${at}: needs (${needTotal}) + savingsTarget (${b.savingsTarget}) exceed income (${b.income})`);
        if (needTotal + b.savingsTarget === b.income) err(`${at}: leave room for wants (needs + savings == income)`);
        break;
      }
      case "slider_estimate": {
        for (const k of ["min", "max", "step", "answer", "tolerance"]) {
          if (typeof b[k] !== "number") err(`${at}: ${k} must be a number`);
        }
        if (b.min >= b.max) err(`${at}: min must be < max`);
        if (b.answer < b.min || b.answer > b.max) err(`${at}: answer outside range`);
        if ((b.answer - b.min) % b.step !== 0) err(`${at}: answer not reachable with step`);
        if (b.tolerance < 0 || b.tolerance % b.step !== 0) err(`${at}: tolerance must be a multiple of step`);
        break;
      }
      case "decision_path": {
        if (!b.title || !b.stat?.name || typeof b.stat?.start !== "number") err(`${at}: needs title and stat {name, emoji, start}`);
        if (!Array.isArray(b.steps) || b.steps.length < 3 || b.steps.length > 5) err(`${at}: needs 3–5 steps`);
        (b.steps ?? []).forEach((s, j) => {
          if (!Array.isArray(s.options) || s.options.length < 2 || s.options.length > 3) err(`${at}: step ${j} needs 2–3 options`);
          const best = (s.options ?? []).filter((o) => o.best).length;
          if (best !== 1) err(`${at}: step ${j} must have exactly one best option (has ${best})`);
          (s.options ?? []).forEach((o, k) => {
            if (typeof o.delta !== "number") err(`${at}: step ${j} option ${k} missing delta`);
            if (!o.feedback) err(`${at}: step ${j} option ${k} missing feedback`);
          });
        });
        break;
      }
      case "spot_scam": {
        if (!b.messageFrom || !b.prompt) err(`${at}: needs prompt and messageFrom`);
        const flags = (b.segments ?? []).filter((s) => s.flag).length;
        if (!Array.isArray(b.segments) || b.segments.length < 3) err(`${at}: needs ≥3 segments`);
        if (flags < 2 || flags > 4) err(`${at}: needs 2–4 flagged segments (has ${flags})`);
        break;
      }
    }
  });

  const questionTotal = blocks.length - materialTotal;
  const distinctQ = Object.keys(typeCounts).filter((t) => QUESTION_TYPES.has(t)).length;
  if (blocks.length && blocks[0].type !== "material") err("first block must be material (the hook)");
  if (materialTotal < 5 || materialTotal > 8) err(`needs 5–8 material blocks (has ${materialTotal})`);
  if (questionTotal < 9 || questionTotal > 13) err(`needs 9–13 question blocks (has ${questionTotal})`);
  if (distinctQ < 6) err(`needs ≥6 distinct question types (has ${distinctQ})`);
  if ((typeCounts.budget_builder ?? 0) > 1) err("at most one budget_builder per lesson");
  if ((typeCounts.decision_path ?? 0) > 1) err("at most one decision_path per lesson");

  if (errors.length) {
    failed = true;
    console.error(`✗ ${file}`);
    errors.forEach((e) => console.error(`    - ${e}`));
  } else {
    console.log(`✓ ${file} (${materialTotal} material, ${questionTotal} questions, ${distinctQ} types)`);
  }
}

process.exit(failed ? 1 : 0);
