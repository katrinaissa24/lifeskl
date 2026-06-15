# LIFESKL lesson content spec

Each course lives in `content/<course-slug>/`. That folder holds one
`course.json` (course metadata + the allowed illustration list) plus one
`<NN>-<slug>.json` per lesson (NN = two-digit sort order). A build script turns
these into seed SQL, and a validator enforces this spec — your files must pass
`node scripts/validate-content.mjs <course-slug>`.

Courses that exist today: `personal-finance` (the gold-standard reference) and
`how-to-learn`.

## course.json

```json
{
  "slug": "how-to-learn",
  "title": "How to Learn",
  "description": "One punchy sentence for the catalog.",
  "emoji": "🧠",
  "sortOrder": 1,
  "illustrations": ["/illustrations/brain-spark.svg", "..."]
}
```

`illustrations` is the allow-list for every lesson's `image` field in that
course. Build the course's seed with `node scripts/build-seed.mjs <course-slug>`
→ writes `supabase/seed_<slug-with-underscores>.sql`.

## Lesson file shape

```json
{
  "slug": "what-is-a-budget",
  "title": "What is a budget?",
  "description": "One sentence, punchy, lowercase-after-first-word style.",
  "unit": 1,
  "sortOrder": 1,
  "xpReward": 20,
  "summaryPoints": [
    "3–5 bullets of what the learner can now DO",
    "Each starts with a verb or a concrete fact"
  ],
  "content": [ /* ordered blocks, see below */ ]
}
```

## Hard rules (validator-enforced)

1. **Never more than 3 `material` blocks in a row.** Aim for 2, then questions.
2. 5–8 material blocks total; 9–13 question blocks total.
3. Each lesson uses **at least 6 distinct question types**.
4. Every `material.body` ≤ 600 characters. People bark if they read more.
5. First block must be `material` (the hook); last question should feel like a
   finale (decision_path, budget_builder, or spot_scam where it fits).
6. `image` may ONLY reference files listed in "Illustrations" below.
7. Valid JSON. No trailing commas. No comments.

## Voice & accuracy

- Second person, warm, a little playful, zero corporate filler. Like a sharp
  friend explaining money at a kitchen table.
- This is for teens/young adults. Examples use part-time jobs, phones,
  sneakers, concerts, first apartments.
- DO NOT copy the Notion source word-for-word — rewrite, tighten, improve.
- Remove all references to "the book", "Questk", "(chat-gpt)", teacher-voice
  ("students will…").
- Money facts must be correct. Known source errors and the fixes:
  - "Average credit card interest: specific%" → use "around 20–25% APR".
  - Avalanche = highest APR first, snowball = smallest balance first. If an
    exercise compares them, pick numbers where they choose DIFFERENT debts.
  - $50/month at 7% from age 20 → ≈ $190,000 by 65 (not $120k).
  - $100/month at 7% from age 20 → ≈ $380,000 by 65 (not $240k); from 30 → ≈ $180,000.
  - Keep simple-interest examples labeled as yearly interest; compound
    examples must compound correctly ($100 at 5% → $105 → $110.25).
  - Budget examples must add up. Check every sum.
- Explanations: 1–2 sentences, always teach the WHY.

## Block types

### material
```json
{ "type": "material", "title": "Short punchy title", "body": "Plain text.\n\nBlank line = new paragraph.\n- lines starting with dash render as bullets\n**bold** allowed", "image": "/illustrations/budget-split.svg", "imageAlt": "..." }
```
`image`/`imageAlt` optional — use on 1–2 slides per lesson where it genuinely helps.

### multiple_choice
```json
{ "type": "multiple_choice", "prompt": "Question?", "context": "Optional 1–2 sentence scenario.", "options": ["A", "B", "C", "D"], "correctIndex": 1, "explanation": "Why." }
```
3–4 options, plausible distractors, randomize which index is correct across the lesson.

### true_false
```json
{ "type": "true_false", "prompt": "Statement to judge.", "answer": false, "explanation": "Why." }
```

### fill_blank
```json
{ "type": "fill_blank", "prompt": "Sentence with ___ in it.", "answer": "520", "accept": ["$520", "520$"], "hint": "Optional nudge", "explanation": "Why." }
```
Use for recall of numbers/terms. Keep answers ONE word or ONE number.

### tap_word
```json
{ "type": "tap_word", "instructions": "Tap the word that's wrong.", "sentence": "Pay yourself last every time money comes in.", "wrongWord": "last", "correctWord": "first", "explanation": "Why." }
```
`wrongWord` must appear EXACTLY once in `sentence` and contain no punctuation.

### match_pairs
```json
{ "type": "match_pairs", "prompt": "Match each term to what it means.", "pairs": [ { "left": "Term", "right": "Short definition" } ] }
```
3–5 pairs. Right sides must be short (≤ 8 words) and unambiguous.

### order_steps
```json
{ "type": "order_steps", "prompt": "Put the steps in order.", "steps": ["First", "Second", "Third", "Fourth"], "explanation": "Why this order." }
```
3–5 steps with ONE defensible order.

### categorize
```json
{ "type": "categorize", "prompt": "Need, want, or savings?", "categories": ["Need", "Want"], "items": [ { "text": "Rent", "category": 0 }, { "text": "Concert tickets", "category": 1 } ] }
```
2–3 categories, 4–8 items, shown one at a time.

### budget_builder  (finance signature exercise)
```json
{
  "type": "budget_builder",
  "prompt": "You earn $500 this month. Cover your needs, hit your savings goal, then have fun with the rest.",
  "income": 500,
  "categories": [
    { "name": "Rent", "emoji": "🏠", "kind": "need", "required": 200 },
    { "name": "Food", "emoji": "🍜", "kind": "need", "required": 100 },
    { "name": "Snacks", "emoji": "🍿", "kind": "want" },
    { "name": "Savings", "emoji": "🏦", "kind": "savings" }
  ],
  "savingsTarget": 50,
  "explanation": "Needs first, savings next, wants with what's left."
}
```
Needs' `required` amounts + savingsTarget must be ≤ income (leave room for wants).
Use at most ONE per lesson.

### slider_estimate
```json
{ "type": "slider_estimate", "prompt": "Save $10 a week for a year. Where do you land?", "min": 100, "max": 1000, "step": 20, "answer": 520, "tolerance": 40, "unitPrefix": "$", "explanation": "$10 × 52 weeks = $520." }
```
(answer − min), tolerance and the range must be multiples of step.

### decision_path  (branching scenario with running stat)
```json
{
  "type": "decision_path",
  "title": "Credit Score Adventure",
  "intro": "You start at 650. Make it to 750.",
  "stat": { "name": "Credit score", "emoji": "📈", "start": 650 },
  "steps": [
    {
      "situation": "Your $50 phone bill is due on the 10th.",
      "options": [
        { "text": "Pay on the 8th", "delta": 20, "feedback": "On-time payment — the #1 score factor.", "best": true },
        { "text": "Pay on the 15th", "delta": -40, "feedback": "Late. Payment history takes the biggest hit." },
        { "text": "Skip it this month", "delta": -100, "feedback": "A missed payment can haunt your report for years." }
      ]
    }
  ],
  "outro": "Small consistent choices move the number."
}
```
3–5 steps, 2–3 options each, exactly one `best: true` per step.
Use at most ONE per lesson — it's the boss fight.

### spot_scam
```json
{
  "type": "spot_scam",
  "prompt": "This text claims to be your bank. Tap all 3 red flags.",
  "messageFrom": "BANK-ALERT <secure@bank-verify-now.xyz>",
  "messageSubject": "URGENT: account locked",
  "segments": [
    { "text": "Dear valued customer," },
    { "text": "your account will be PERMANENTLY CLOSED in 24 hours", "flag": "Fake urgency is the #1 scam pressure tactic." },
    { "text": "unless you verify your identity." },
    { "text": "Click here: bank-verify-now.xyz/login", "flag": "Real banks never ask you to log in via a link they send." },
    { "text": "Enter your card number and PIN to confirm.", "flag": "No legitimate company ever asks for your PIN." }
  ],
  "explanation": "When in doubt: don't click — open your bank's app directly."
}
```
2–4 flagged segments. Non-flag segments keep the message realistic.

## Course-specific block types — How to Learn

These three are domain-authentic to studying. They render and grade exactly
like the built-ins (report through `onDone(correct)` once on Continue).

### priority_matrix  (How to Learn signature exercise)
```json
{
  "type": "priority_matrix",
  "prompt": "Drop each task into the Eisenhower square it belongs in.",
  "tasks": [
    { "text": "Exam tomorrow you haven't studied for", "urgent": true,  "important": true },
    { "text": "Start the essay due in two weeks",        "urgent": false, "important": true },
    { "text": "Reply to a group-chat ping",              "urgent": true,  "important": false },
    { "text": "Scroll short videos",                     "urgent": false, "important": false }
  ],
  "explanation": "Urgent ≠ important. Quadrant II — important, not urgent — is where real progress lives."
}
```
4–8 tasks shown one at a time; the learner taps a 2×2 grid. All four
urgent/important combinations must appear. Correct = every task placed right,
zero misses. At most ONE per lesson.

### spaced_planner  (beat the forgetting curve)
```json
{
  "type": "spaced_planner",
  "prompt": "You learned this today. Tap the review days that beat forgetting.",
  "topic": "Today's biology lecture",
  "points": [
    { "label": "Same day",  "day": 0,  "recommended": true },
    { "label": "Next day",  "day": 1,  "recommended": true },
    { "label": "Day 3",     "day": 3,  "recommended": true },
    { "label": "Day 7",     "day": 7,  "recommended": true },
    { "label": "Cram night before", "day": 13, "recommended": false }
  ],
  "explanation": "Expanding intervals (1, 3, 7 days…) reset the forgetting curve. Cramming once doesn't."
}
```
4–8 points; 2–5 marked `recommended` (the right spaced set) and at least one
distractor. A live retention meter rewards the spaced pattern. Correct = the
selected set exactly matches the recommended set. At most ONE per lesson.

### reflect  (open / reflective — ALWAYS reports success)
```json
{
  "type": "reflect",
  "prompt": "Name one subject you've called yourself 'bad at'. What would 'not yet' sound like instead?",
  "context": "Optional scenario shown above the prompt.",
  "chips": ["Math", "Writing", "A language", "Science"],
  "placeholder": "Type a sentence…",
  "explanation": "Shown as the takeaway after they commit."
}
```
No wrong answer — it never enters the mistake round. `chips` and `placeholder`
optional. Use as a gentle finale in mindset/wellbeing lessons.

## Illustrations (the ONLY valid `image` values — per course, from course.json)

- /illustrations/budget-split.svg — income splitting into needs/wants/savings jars
- /illustrations/smart-goals.svg — SMART acronym ladder
- /illustrations/emergency-fund.svg — umbrella over a piggy bank in rain
- /illustrations/compound-growth.svg — snowball rolling downhill growing
- /illustrations/credit-score.svg — gauge from 300 to 850
- /illustrations/debt-trap.svg — minimum-payment spiral
- /illustrations/investing-tree.svg — money tree growing from a seed
- /illustrations/needs-wants.svg — two-pan balance scale
- /illustrations/insurance-umbrella.svg — umbrella shielding house/car/heart
- /illustrations/scam-alert.svg — phishing hook grabbing at a phone
- /illustrations/roadmap.svg — winding road with milestone flags
- /illustrations/paycheck.svg — payslip with gross→net arrows

### How to Learn (`content/how-to-learn/course.json`)

- /illustrations/brain-spark.svg — a brain with a lightning spark (neuroplasticity)
- /illustrations/growth-mindset.svg — a sprout growing up a staircase of arrows
- /illustrations/priority-matrix.svg — the Eisenhower 2×2 urgency/importance grid
- /illustrations/procrastination.svg — a clock with a task pushed to "later"
- /illustrations/critical-thinking.svg — a magnifying glass over a lightbulb
- /illustrations/metacognition.svg — a brain reflected in a mirror (thinking about thinking)
- /illustrations/bloom-pyramid.svg — Bloom's six-level thinking pyramid
- /illustrations/active-listening.svg — an ear catching sound waves
- /illustrations/note-taking.svg — a Cornell-style notebook with a pen
- /illustrations/active-reading.svg — an open book with a highlighter and question marks
- /illustrations/test-calm.svg — a calm deep breath before an exam
- /illustrations/memory-stages.svg — encode → store → retrieve arrows into a box
- /illustrations/forgetting-curve.svg — a decay curve lifted by review spikes
- /illustrations/focus-target.svg — a bullseye with a single arrow (concentration)
- /illustrations/healthy-brain.svg — a brain ringed by sleep, water and exercise icons
