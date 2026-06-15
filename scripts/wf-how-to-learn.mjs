export const meta = {
  name: 'how-to-learn-course',
  description: 'Author the How to Learn course: 15 themed SVGs + 17 gold-standard lessons (author→review→validate).',
  phases: [
    { title: 'Illustrations', detail: '15 themed SVGs in the finance illustration style' },
    { title: 'Author', detail: 'one agent per lesson, self-validating against the content spec' },
    { title: 'Review', detail: 'critical pass on each lesson: voice, accuracy, variety, finale' },
  ],
}

const ROOT = '/Users/katrinaissa/Desktop/lifeskl/.claude/worktrees/nervous-shannon-a9b888'

// ----------------------------------------------------------------- shared text

const STYLE = `LIFESKL "Grape" illustration style (match the finance set exactly):
- Root: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" fill="none" role="img" aria-label="<short description>">
- Strokes: 3px solid INK #181016 (2.5px fine details). flat fills, friendly rounded shapes, stroke-linejoin="round".
- Palette (use LITERAL hex): ink #181016, accent #6b46ff, dark accent #4a2ed1, tint #efe9ff, pink #ff6f9c, pink tint #ffe6ee, green #1f8a5b, green tint #e3f5ec, surface #fffdf8, soft text #4a3f47.
- Small labels: font-family="Arial, sans-serif" font-weight="700/800", font-size 10–14, fill #4a3f47 or #181016, text-anchor="middle".
- Keep it clean and legible at ~460px wide. No external assets, no gradients, no <style> blocks.`

// First read two reference SVGs so the style matches.
const READ_FIRST = `Before drawing, read these two files to copy the exact style/structure:
- ${ROOT}/apps/web/public/illustrations/budget-split.svg
- ${ROOT}/apps/web/public/illustrations/smart-goals.svg`

// ------------------------------------------------------------------ svg specs

const SVGS = [
  { name: 'brain-spark', alt: 'A brain with a lightning spark', draw: 'A friendly rounded brain (accent #6b46ff fill, ink outline, a couple of fold lines) with a bright lightning bolt (#ff6f9c) sparking off it, plus 2–3 small spark dots. Conveys neuroplasticity / learning lighting up.' },
  { name: 'growth-mindset', alt: 'A sprout climbing a staircase of upward arrows', draw: 'A rising staircase of 4–5 blocks (tint #efe9ff, last block accent #6b46ff) with an upward arrow, and a small green (#1f8a5b) sprout/plant growing on the top step. Conveys growth over time.' },
  { name: 'priority-matrix', alt: 'The Eisenhower urgency-importance 2x2 grid', draw: 'A clean 2x2 grid (four rounded cells). Top-left accent #6b46ff "Do", top-right tint #efe9ff "Plan", bottom-left pink tint #ffe6ee "Trim", bottom-right surface "Drop". Axis labels: "Urgent / Not urgent" along the top, "Important / Not important" up the left side (small #4a3f47 text). ' },
  { name: 'procrastination', alt: 'A clock with a task pushed to later', draw: 'A round wall clock (surface fill, ink outline, hands near a deadline) and a small paper/task card sliding off to the right with a "later" dashed arrow (#ff6f9c). Maybe a tiny snooze "Zzz". Conveys delay.' },
  { name: 'critical-thinking', alt: 'A magnifying glass over a lightbulb', draw: 'A magnifying glass (ink frame, tint lens) held over a lightbulb (#6b46ff bulb, ink base) with a small question mark and a check inside/near it. Conveys examining ideas.' },
  { name: 'metacognition', alt: 'A brain reflected in a mirror', draw: 'A brain (accent #6b46ff) facing a small oval mirror (surface, ink frame) that reflects a faint brain outline, with a circular loop arrow (#ff6f9c) between them. Conveys thinking about thinking.' },
  { name: 'bloom-pyramid', alt: "Bloom's six-level thinking pyramid", draw: 'A pyramid split into 6 horizontal bands from wide bottom to narrow top, bottom bands tint #efe9ff and top band accent #6b46ff. Tiny labels bottom→top: Remember, Understand, Apply, Analyze, Evaluate, Create (small #4a3f47, may abbreviate if tight). ' },
  { name: 'active-listening', alt: 'An ear catching sound waves', draw: 'A friendly ear shape (surface fill, ink outline) with 3 concentric sound-wave arcs (#6b46ff) arriving from the left, and a small speech bubble. Conveys focused listening.' },
  { name: 'note-taking', alt: 'A Cornell-style notebook with a pen', draw: 'An open notebook/page (surface, ink outline) divided Cornell-style: a narrow left cue column (tint #efe9ff) and wider right notes area with 3–4 ink note lines, plus a summary strip at the bottom. A pen (#6b46ff) resting on it.' },
  { name: 'active-reading', alt: 'An open book with a highlighter and question marks', draw: 'An open book (surface pages, ink outline, accent spine) with a couple of highlighted lines (#ffe6ee highlight bars), a highlighter pen (#ff6f9c), and 1–2 small question marks (#6b46ff) above. Conveys engaging with the text.' },
  { name: 'test-calm', alt: 'A calm deep breath before an exam', draw: 'A calm face/head in profile or a simple figure with concentric breathing rings (#6b46ff arcs) around it, and a small exam paper card with an "A". Soft and reassuring. Conveys staying calm under pressure.' },
  { name: 'memory-stages', alt: 'Encode, store and retrieve arrows into a box', draw: 'Three labeled stages left→right with arrows: a small brain/funnel (Encode), a box/drawer (Store, surface+ink), and an arrow pulling a card back out (Retrieve, #6b46ff). Tiny labels Encode / Store / Retrieve (#4a3f47).' },
  { name: 'forgetting-curve', alt: 'A decay curve lifted by review spikes', draw: 'A small axes chart: a downward-curving line (#ff6f9c) decaying left→right, with 2–3 vertical "review" spikes (#6b46ff) that bump the curve back up and make it decay more slowly each time. Tiny axis hints "memory" (y) and "time" (x).' },
  { name: 'focus-target', alt: 'A bullseye with a single arrow', draw: 'A concentric bullseye target (rings: ink outline, alternating surface and tint #efe9ff, center accent #6b46ff) with one arrow (#ff6f9c flight) hitting the center. Conveys single-pointed focus.' },
  { name: 'healthy-brain', alt: 'A brain ringed by sleep, water and exercise icons', draw: 'A central brain (accent #6b46ff) surrounded by 3 small circular icon badges (surface, ink outline): a moon+Zzz (sleep), a water drop (#6b46ff), and a dumbbell or running figure (#1f8a5b). Conveys body care = brain care.' },
]

// --------------------------------------------------------------- lesson briefs

const LESSONS = [
  {
    nn: '01', slug: 'how-learning-works', unit: 1, sort: 1,
    title: 'How learning actually works',
    desc: "Your brain isn't fixed — learning is a skill you can build.",
    illos: ['/illustrations/brain-spark.svg'],
    finale: 'reflect — invite the learner to name one subject they call themselves "bad at" and rewrite it with "yet". Provide chips like ["Math","Writing","A language","Science","Public speaking"]. This is the closing block.',
    requiredTypes: ['reflect'],
    points: `Learning is a SKILL, not a fixed talent you're born with. Neuroplasticity: the brain physically rewires when you practice — you grow and strengthen neural connections, so you can get better at almost anything. The honest reframe: "You're not bad at it — you just haven't built that connection YET." Struggle and effort are what grow the brain (desirable difficulty); easy practice barely changes it. Mistakes you think about grow the brain MORE than answers you get right on the first try. Bust myths: "learning styles" (visual/auditory/etc.) and "left-brained/right-brained" are not supported by evidence — match the method to the MATERIAL, not to a supposed style. Active beats passive: recalling/testing yourself beats rereading. Healthy basics (sleep, movement, a focused space) make the brain learn better.`,
    ideas: `Mix: true_false (the brain is fixed → false), multiple_choice (what grows the brain most → wrestling with a hard problem & learning from a mistake), tap_word ("You're not bad at it — you're just bad at it" fix to "not yet" or talent→skill), match_pairs (neuroplasticity / retrieval / desirable difficulty → meanings), categorize (helps your brain learn vs doesn't), fill_blank (neuroplasticity). End with the reflect finale.`,
  },
  {
    nn: '02', slug: 'growth-mindset', unit: 1, sort: 2,
    title: 'Growth vs. fixed mindset',
    desc: 'The story you tell yourself after a setback changes the outcome.',
    illos: ['/illustrations/growth-mindset.svg'],
    finale: 'decision_path — "The Setback": the learner just bombed a quiz. 3–4 steps of choices (e.g. blame "I\'m just bad at this" / avoid the next hard topic VS analyze which mistakes & why, ask for help, redo problems). Stat like "Confidence" or "Comeback meter" starting ~50. Exactly one best option per step.',
    requiredTypes: ['decision_path'],
    points: `Carol Dweck's research. FIXED mindset: believes ability is set; avoids challenges, gives up when it's hard, sees effort as a sign you're not smart, feels threatened by others' success, ignores feedback. GROWTH mindset: believes ability grows with effort & good strategy; embraces challenges, persists, treats effort as the path to mastery, learns from criticism, finds others' success inspiring. The power of "yet" ("I can't do this YET"). Mistakes = information, not verdicts. It's NOT toxic positivity — growth mindset means changing strategy + effort + seeking help, not just "believe in yourself". Praise the process (what you did), not the trait ("you're so smart").`,
    ideas: `Mix: categorize (growth vs fixed statements), match_pairs (fixed thought → growth reframe), true_false ("I'm just not a math person" is a growth statement → false), multiple_choice (best response to failing a test), tap_word, order_steps (turn a setback into growth: name the feeling → find the specific mistake → change one strategy → try again). End with the decision_path finale.`,
  },
  {
    nn: '03', slug: 'the-priority-matrix', unit: 2, sort: 3,
    title: 'Urgent vs. important',
    desc: 'The Eisenhower matrix: stop letting urgent crowd out important.',
    illos: ['/illustrations/priority-matrix.svg'],
    finale: 'priority_matrix — 5–6 student tasks covering all four urgent/important squares (e.g. "Exam tomorrow you haven\'t studied"=urgent+important; "Start the project due in 2 weeks"=important not urgent; "Reply to a group-chat ping"=urgent not important; "Scroll short videos"=neither; add 1–2 more). This is the finale.',
    requiredTypes: ['priority_matrix'],
    points: `Urgent ≠ important. Urgent = demands attention NOW (deadlines, ringing phone). Important = matters to your goals/wellbeing. The Eisenhower/Covey 2x2: Q1 Urgent+Important → DO IT NOW (today's deadline, a real crisis). Q2 Important+Not urgent → SCHEDULE IT (studying ahead, sleep, exercise, planning, relationships) — this is the "quadrant of quality" where real progress lives. Q3 Urgent+Not important → TRIM/limit/say no/hand off (many interruptions, others' small requests — the "quadrant of deception" because urgent feels important). Q4 Not urgent+Not important → DROP (mindless scrolling, time-wasters). Most stress comes from living in Q1 — and we end up there because we neglect Q2 (good Q2 planning stops things becoming Q1 emergencies). The goal: spend MORE time in Q2. Saying "no" to Q3/Q4 protects Q2.`,
    ideas: `Mix: match_pairs (quadrant → action: Do/Schedule/Trim/Drop), true_false (urgent always means important → false), categorize (urgent vs not / or important vs not), multiple_choice (which quadrant should you protect → Q2), tap_word, fill_blank. End with the priority_matrix finale.`,
  },
  {
    nn: '04', slug: 'beat-procrastination', unit: 2, sort: 4,
    title: 'Beating procrastination',
    desc: "Procrastination is about feelings, not laziness — here's the way out.",
    illos: ['/illustrations/procrastination.svg'],
    finale: 'decision_path — "The 8 p.m. essay": an essay is due tomorrow and you keep avoiding it. 3–4 steps (open the doc & write a bad first line for 2 min / put the phone in another room / do one 25-min Pomodoro VS check socials "for a sec" / clean your room instead / wait until you "feel ready"). Stat "Pages done" or "Momentum".',
    requiredTypes: ['decision_path'],
    points: `Procrastination is an EMOTION-regulation problem, not laziness or bad time-management: you avoid a task to escape the bad feelings it brings (boredom, anxiety, self-doubt, overwhelm, perfectionism). The cycle: task → discomfort → avoid → instant relief (which REWARDS the avoidance) → guilt & bigger stress later. Breaking it: (1) shrink the first step absurdly small — the 2-minute rule / "just open it" (starting is the hard part; motivation follows action, not the other way around). (2) Lower the bar — a messy first draft beats a perfect none; perfectionism fuels procrastination. (3) Remove the cue/friction — phone in another room, distracting tabs closed ("out of sight"). (4) Implementation intentions — "After dinner, at my desk, I'll do 25 minutes of X." (5) Pomodoro (25 min work / 5 min break) makes a scary task finite. (6) Self-compassion — beating yourself up makes you procrastinate MORE; forgive the last slip and start. We also discount future rewards (present bias) — make rewards/deadlines feel nearer.`,
    ideas: `Mix: true_false (procrastination = laziness → false), multiple_choice (best first move on a dreaded task → make the first step tiny), match_pairs (trick → why it works), order_steps (break the avoidance cycle), categorize (helps vs fuels procrastination), tap_word, slider_estimate (a Pomodoro focus block ≈ 25 minutes). End with the decision_path finale.`,
  },
  {
    nn: '05', slug: 'plan-your-time', unit: 2, sort: 5,
    title: 'Plan a week that holds',
    desc: 'Build a realistic schedule and work with your own rhythm.',
    illos: ['/illustrations/priority-matrix.svg'],
    finale: 'priority_matrix — a SECOND, different set of 5–6 weekly tasks (not the same as lesson 03). Cover all four squares with realistic week-planning items. This is the finale.',
    requiredTypes: ['priority_matrix'],
    points: `Build a schedule in this order: (1) fixed anchors first — due dates & exam dates, then classes/work, then sleep & meals; (2) study blocks in the gaps; (3) leave BUFFER for surprises; (4) schedule downtime/rewards ON PURPOSE so they're guilt-free. Short, regular study sessions beat long marathons (distributed practice — you learn more efficiently in spaced shorter blocks than in one long cram). Two high-leverage habits: preview ~30 min before class and review right after — it dramatically boosts retention. Backward-plan big assignments into milestones with their own mini-deadlines. Know your rhythm: schedule your hardest work in your peak-focus hours (morning lark vs night owl). Work styles: the "early bird/planner" finishes ahead (risk: rushing); the "pressure cooker" thrives last-minute (strength: intense focus; risk: no buffer — fix with small self-imposed earlier deadlines); the "balancer" keeps things steady. Parkinson's Law: work expands to fill the time you give it — set tighter limits. To-do lists: write tomorrow's list tonight, break big tasks into ~1-hour chunks, flag the top priorities, reward yourself for crossing items off.`,
    ideas: `Mix: order_steps (the order to build a schedule), true_false (one long cram beats short regular sessions → false), multiple_choice (most useful 30 minutes → review right after class), match_pairs (work style → tip, or term → meaning), categorize (anchor-first vs flexible / or fixed vs flexible items), tap_word, fill_blank. End with the priority_matrix finale.`,
  },
  {
    nn: '06', slug: 'critical-thinking', unit: 3, sort: 6,
    title: 'Think it through',
    desc: "Question claims, weigh evidence, and don't get fooled.",
    illos: ['/illustrations/critical-thinking.svg'],
    finale: 'decision_path — "Is it true?": a dramatic claim/post is going viral. 3–4 steps of choices (check who said it & their evidence, read laterally/look for the original source, look for the other side VS share because it\'s shocking, trust it because a friend posted it, accept it because it confirms what you already believe). Stat "Truth-o-meter".',
    requiredTypes: ['decision_path'],
    points: `Critical thinking = actively analyzing and evaluating information instead of accepting it at face value — asking good questions, not just memorizing. Core moves: separate FACT (verifiable) from OPINION from unsupported CLAIM. Evaluate the source: who's saying it, what's their evidence, do they benefit, are they biased, is it current? Watch for common fallacies: bandwagon ("everyone thinks so"), ad hominem (attack the person not the argument), false cause (correlation isn't causation), false dilemma (only two options), appeal to emotion, cherry-picking. Beware confirmation bias — we favor info that agrees with us. Useful questions: What's the evidence? Who benefits? What's the other side? Could there be another explanation? "Lateral reading" — to judge a source, leave the page and check what others say about it.`,
    ideas: `Mix: categorize (fact vs opinion), match_pairs (fallacy → example/name), true_false (correlation proves causation → false), multiple_choice (which source is most credible / which question to ask first), tap_word, order_steps (how to evaluate a claim), fill_blank. End with the decision_path finale.`,
  },
  {
    nn: '07', slug: 'metacognition', unit: 3, sort: 7,
    title: 'Thinking about your thinking',
    desc: 'Plan, monitor, and check your own learning — the skill behind every skill.',
    illos: ['/illustrations/metacognition.svg'],
    finale: 'reflect — ask the learner to pick a real upcoming task and write their PLAN (what they know, the goal, the strategy) and how they\'ll CHECK it\'s working. Chips like ["A test","An essay","A presentation","A problem set"]. This is the closing block.',
    requiredTypes: ['reflect'],
    points: `Metacognition = awareness and control of your own thinking/learning ("thinking about thinking"). Three phases: PLAN (What do I already know? What's the goal? Which strategy fits?), MONITOR (Is this working? Do I actually understand or just recognize it?), EVALUATE (What worked? What would I change next time?). The biggest trap is the ILLUSION OF COMPETENCE / fluency: rereading and highlighting FEEL productive but create a false sense of knowing — recognizing something is not the same as being able to recall it. Self-testing exposes the gaps (it feels harder, which is exactly why it works). The Feynman technique: explain the idea in plain words as if to a 12-year-old; wherever you get stuck or vague is exactly what you don't truly understand. Ask yourself "How do I know I actually know this?" Weaker students often OVER-estimate what they know — calibrate with practice tests.`,
    ideas: `Mix: order_steps (plan → monitor → evaluate), match_pairs (phase → its question), true_false (rereading until it feels familiar means you've learned it → false), multiple_choice (best way to check real understanding → explain it / self-test), tap_word (recognize vs recall), categorize (feels like learning vs actually learning). End with the reflect finale.`,
  },
  {
    nn: '08', slug: 'blooms-taxonomy', unit: 3, sort: 8,
    title: 'Levels of understanding',
    desc: "From memorizing facts to creating something new — Bloom's ladder.",
    illos: ['/illustrations/bloom-pyramid.svg'],
    finale: "order_steps — put Bloom's six levels in order from lowest to highest: Remember, Understand, Apply, Analyze, Evaluate, Create. (order_steps allows max 5 steps, so use 5: combine or pick Remember, Understand, Apply, Analyze, then Evaluate/Create as one top step — OR use 5 of the 6. Keep exactly 3–5 steps.) This is the finale.",
    requiredTypes: ['order_steps'],
    points: `Bloom's taxonomy = six levels of thinking from lower-order to higher-order: REMEMBER (recall facts/terms), UNDERSTAND (explain ideas in your own words), APPLY (use it in a new situation / solve a problem), ANALYZE (break it apart, compare, find patterns & relationships), EVALUATE (judge, justify, critique with criteria), CREATE (produce something new — design, plan, compose). Why it matters: exams usually test the HIGHER levels, so just memorizing (Remember) isn't enough — you have to apply and analyze. The verbs reveal the level: "list/define" (Remember) vs "compare/justify/design" (higher). Study at or ABOVE the level the test demands. If you can teach it, apply it, and critique it, you've truly got it.`,
    ideas: `Mix: match_pairs (level → a verb or task example), multiple_choice (which level is "design an experiment" → Create; or which is hardest), categorize (lower-order vs higher-order thinking), true_false (memorizing facts is the highest level → false), tap_word, fill_blank. order_steps is the finale (the six levels — keep to 3–5 steps as the type requires).`,
  },
  {
    nn: '09', slug: 'active-listening', unit: 4, sort: 9,
    title: 'Listen like it counts',
    desc: 'Real listening is active — in lectures and in life.',
    illos: ['/illustrations/active-listening.svg'],
    finale: 'decision_path — "The lecture": you\'re in a class you find boring. 3–4 steps (phone in bag / sit near the front / write the main point in your own words / jot a question you have VS text under the desk / try to write every word / zone out and "catch up later"). Stat "Understanding" or "Focus".',
    requiredTypes: ['decision_path'],
    points: `Hearing ≠ listening. Active listening = full attention + processing the meaning + engaging. In a lecture: come prepared (a quick preview gives you hooks), sit where you'll actually focus, put the phone away (its presence alone splits attention), listen for STRUCTURE and signposts ("there are three reasons…", "the key point is…", "in contrast…"), and capture MAIN IDEAS in your own words — don't try to transcribe word-for-word (you can't think and stenograph at the same time). Catch the teacher's cues: repetition, emphasis, things written on the board, "this will be on the test." In conversation: don't rehearse your reply while they talk, paraphrase back ("so you're saying…"), ask clarifying questions, read tone/body language, and don't interrupt. Attention is limited — multitasking destroys comprehension.`,
    ideas: `Mix: true_false (multitasking helps you listen → false; or writing every word is best → false), multiple_choice (best move when you don't understand → ask a clarifying question / note the question), categorize (active vs passive listening), match_pairs (teacher cue → what it signals), tap_word, order_steps (prepare → focus → capture main ideas → review). End with the decision_path finale.`,
  },
  {
    nn: '10', slug: 'note-taking', unit: 4, sort: 10,
    title: 'Notes that actually work',
    desc: 'Cornell, mind maps, and why your laptop might be hurting you.',
    illos: ['/illustrations/note-taking.svg'],
    finale: 'order_steps — the Cornell workflow: take notes in the main column during class → within 24 hours add cue words/questions in the left margin → write a short summary at the bottom → quiz yourself by covering the notes and answering the cues. Keep 3–5 steps. This is the finale.',
    requiredTypes: ['order_steps'],
    points: `Notes do two jobs: keep your attention ACTIVE during class, and give you something to study from later. We forget roughly half of new information within an hour without review (the forgetting curve) — notes plus a quick review fight that. Methods: CORNELL — split the page: narrow left "cue" column, wide right "notes" column, a summary strip at the bottom; after class add cues/questions and a summary, then self-quiz by covering the notes. OUTLINE — indented hierarchy of main points/sub-points. MIND MAP — a visual web, great for connected ideas. Handwriting tends to beat typing for memory because you can't write fast enough to transcribe — so you paraphrase and process (typists often transcribe verbatim and learn less). Don't write everything; capture main ideas in YOUR OWN words, use abbreviations/symbols, leave white space, and edit/review within 24 hours.`,
    ideas: `Mix: true_false (typing every word verbatim is the best way to learn → false), multiple_choice (what the Cornell cue column is for), match_pairs (note method → when it shines), categorize (smart vs weak note habits), tap_word, fill_blank, slider_estimate (≈ what % is forgotten within an hour without review → about 50%). End with the order_steps finale.`,
  },
  {
    nn: '11', slug: 'active-reading', unit: 4, sort: 11,
    title: 'Read so it sticks',
    desc: 'SQ3R: turn a textbook chapter into knowledge, not eye exercise.',
    illos: ['/illustrations/active-reading.svg'],
    finale: 'order_steps — the SQ3R steps in order: Survey → Question → Read → Recite (recall) → Review. Keep exactly 5 steps. This is the finale.',
    requiredTypes: ['order_steps'],
    points: `Passive reading (eyes sliding over words) isn't learning — you finish a page and remember nothing. Active reading = interrogating the text. SQ3R: SURVEY (skim first — headings, intro, summary, bold terms, figures — to build a map), QUESTION (turn each heading into a question), READ (read a section to answer your question), RECITE/RECALL (look away and say or write the answer in your own words — this is retrieval, the part that builds memory), REVIEW (go back, fill gaps, summarize the whole). Annotate well: highlight SPARINGLY — only key terms/claims (highlighting everything means nothing stands out); write margin notes in your own words; mark confusions with "?"; connect ideas to what you already know. Self-quiz at the end of each section, slow down on hard parts — it's not a race.`,
    ideas: `Mix: true_false (highlighting almost everything helps you remember → false), multiple_choice (what to do FIRST with a new chapter → survey it), match_pairs (SQ3R letter → what you do), categorize (active vs passive reading habits), tap_word, fill_blank. End with the order_steps (SQ3R) finale.`,
  },
  {
    nn: '12', slug: 'test-anxiety', unit: 5, sort: 12,
    title: 'Calm under exam pressure',
    desc: "Nerves are normal — here's how to keep them from tanking your score.",
    illos: ['/illustrations/test-calm.svg'],
    finale: 'decision_path — "Exam morning": choices the night before & morning of (sleep 8 hrs / eat breakfast / do a few practice questions / slow breaths VS pull an all-nighter / skip breakfast / read everyone\'s panic in the group chat / cram in the hallway). Stat "Calm" or "Readiness".',
    requiredTypes: ['decision_path'],
    points: `A LITTLE stress helps — moderate arousal sharpens focus (Yerkes-Dodson). Too much hijacks WORKING MEMORY, the exact resource you need on a test, which is why you "blank". Test anxiety is physical (racing heart, sweaty hands) + mental (negative thoughts, going blank). Best long-term fix: be genuinely prepared — spaced practice + practice tests under realistic conditions build confidence and make the real test feel familiar. In the moment: slow box breathing (in 4, hold 4, out 4, hold 4) calms the nervous system; reframe nerves as excitement/energy, not danger; start with a "brain dump" of formulas/facts; do the easy questions first to build momentum; if you blank, skip and come back. Before: SLEEP beats cramming the night before — sleep consolidates memory and lowers anxiety, while all-nighters wreck recall; eat something; arrive early. Challenge catastrophic thoughts ("I'll fail everything") — one test does not define you.`,
    ideas: `Mix: true_false (all stress is bad for performance → false), multiple_choice (best night-before move → sleep), match_pairs (technique → what it does, or symptom → calm response), order_steps (your in-exam game plan), categorize (calms you vs winds you up on exam day), tap_word, slider_estimate (box-breathing count ≈ 4 seconds per phase). End with the decision_path finale.`,
  },
  {
    nn: '13', slug: 'study-and-test-taking', unit: 5, sort: 13,
    title: 'Study to learn, then ace the test',
    desc: 'Practice like the test, then read questions like a detective.',
    illos: ['/illustrations/test-calm.svg'],
    finale: 'spaced_planner — the exam is in ~2 weeks; pick the review days that beat forgetting. points like Today(0), +2 days(2), +5 days(5), +9 days(9), Night before(13). Mark an expanding spaced set as recommended (e.g. 0,2,5,9 — true) and "Night before only / all in one night"-style options as not recommended. This is the finale.',
    requiredTypes: ['spaced_planner'],
    points: `Study to LEARN, not just to recognize. The single most powerful study tool is PRACTICE TESTING (retrieval practice): do practice problems and past papers under test-like conditions — it builds memory AND makes the real exam familiar (the "solve so many you've seen the question before" effect). INTERLEAVE — mix problem types instead of drilling one kind in a block; it improves your ability to tell problems apart and transfer skills. SPACE practice across days; cramming feels productive but fades fast. Plan backward from the exam date. During the test: read instructions and each question carefully (watch words like "all", "always", "not", "except"), budget your time and don't sink it all into one hard question (flag it, move on), do easy ones first, show your work, eliminate wrong options on multiple-choice, and answer everything unless wrong answers are penalized; leave time to check. AFTER: USE the results — review every miss and find WHY (careless? didn't know it? misread?), spot patterns, and redo the missed problems. A returned test is a free study guide for the next one.`,
    ideas: `Mix: true_false (rereading notes is the best prep → false), multiple_choice (most effective study tool → practice testing; or best move on a hard question → flag & move on), categorize (study-to-learn vs study-to-recognize, or smart vs weak test habits), match_pairs (strategy → why it works), order_steps (smart test-day order, or how to use a returned test), tap_word, fill_blank. End with the spaced_planner finale.`,
  },
  {
    nn: '14', slug: 'how-memory-works', unit: 6, sort: 14,
    title: 'How memory actually works',
    desc: 'Encode, store, retrieve — and how to make each one stick.',
    illos: ['/illustrations/memory-stages.svg', '/illustrations/brain-spark.svg'],
    finale: 'spaced_planner — "You learned today\'s lecture. When should you review?" points Same day(0), Next day(1), Day 3(3), Day 7(7), plus a distractor like "Cram the night before"(20) not recommended; recommend the expanding set 0,1,3,7. This is the finale.',
    requiredTypes: ['spaced_planner'],
    points: `Memory has three stages. ENCODING (getting info in): attention + MEANING matter — deep/elaborative encoding (connect new info to what you already know, give it meaning, use examples, picture it) beats shallow rote repetition. STORAGE (holding it): working/short-term memory is tiny (only about 4–7 items for a few seconds) — info must be moved into long-term memory through meaning and rehearsal. RETRIEVAL (getting it back): the ACT of recalling something strengthens that memory — this is why testing yourself (retrieval practice) is so powerful; good cues help you find it. The forgetting curve (Ebbinghaus): without review we forget roughly half within an hour and most within a day — but each review flattens the curve so you forget more slowly. Spaced repetition: review at EXPANDING intervals (e.g. day 0, 1, 3, 7, 30) to refresh memory right before you'd forget — far better than one big cram. Other boosters: CHUNKING (group items, like a phone number), MNEMONICS (acronyms, stories, the memory palace) for arbitrary lists, SLEEP (it consolidates the day's learning), and DUAL CODING (words + visuals).`,
    ideas: `Mix: match_pairs (stage → what it does), order_steps (encode → store → retrieve), true_false (working memory can hold almost unlimited items → false), multiple_choice (deep vs shallow encoding; or what strengthens a memory → recalling it), categorize (strengthens vs weakens memory), slider_estimate (≈ what % is forgotten within a day without review → about 70%), tap_word, fill_blank (chunking). End with the spaced_planner finale.`,
  },
  {
    nn: '15', slug: 'make-it-stick', unit: 6, sort: 15,
    title: 'Make it stick',
    desc: 'The study habits science backs — and the popular ones that fail.',
    illos: ['/illustrations/forgetting-curve.svg'],
    finale: 'decision_path — "The week before the exam": choices (space practice over the week / self-test with past papers / mix topics / explain it to a friend VS reread the textbook / highlight everything / cram the night before / study one topic in a long block). Stat "Mastery".',
    requiredTypes: ['decision_path'],
    points: `The science-backed winners: (1) RETRIEVAL PRACTICE / self-testing beats rereading (the testing effect). (2) SPACED practice beats cramming (spread it across days). (3) INTERLEAVING (mixing topics/problem types) beats blocking one type. (4) ELABORATION — ask "why" and "how", connect ideas to each other and to your life. (5) CONCRETE EXAMPLES + DUAL CODING (pair words with visuals). (6) DESIRABLE DIFFICULTIES — if studying feels a little effortful, you're probably learning (too easy = quickly forgotten). The popular-but-weak methods that create an ILLUSION of competence: rereading, highlighting, massed cramming, and trying to match a "learning style". Flashcards done right: actually recall the answer before flipping, and keep the cards you miss in the deck longer. Teach it to someone (the Feynman technique) to expose gaps. In one line: test yourself, space it out, mix it up.`,
    ideas: `Mix: true_false (cramming the night before beats spacing it out → false), multiple_choice (which technique works best → retrieval practice/spacing; or which is a weak method → rereading), categorize (proven vs popular-myth, or works vs only-feels-like-working), match_pairs (technique → what it does), order_steps (build a smart study session), tap_word, fill_blank, slider_estimate. End with the decision_path finale.`,
  },
  {
    nn: '16', slug: 'focus-and-mindfulness', unit: 7, sort: 16,
    title: 'Train your focus',
    desc: 'Attention is trainable — beat distraction and find your flow.',
    illos: ['/illustrations/focus-target.svg'],
    finale: 'reflect — ask the learner to design their own focus ritual: where they\'ll study, what they\'ll do with their phone, and one mindfulness reset they\'ll try. Chips like ["Phone in another room","Notifications off","25-min Pomodoro","10 slow breaths","One clear desk"]. This is the closing block.',
    requiredTypes: ['reflect'],
    points: `Attention is a LIMITED but TRAINABLE resource. "Multitasking" is a myth — it's really fast task-switching, and every switch costs time and adds errors (switch cost); constant doom-scrolling trains your brain to crave distraction. So SINGLE-TASK: one thing at a time. Kill the cues: keep your phone in ANOTHER ROOM (its mere presence drains focus, even face-down), close extra tabs, turn off notifications, and use one designated study spot so your brain learns "here = focus." The POMODORO technique (25 min focus / 5 min break, a longer break every 4) protects attention and makes starting easier. FLOW happens when a clear goal meets a matched challenge with no interruptions. MINDFULNESS = paying attention to the present on purpose, without judging it; it trains the "notice you've drifted and gently come back" muscle — the exact muscle that returns you to studying when your mind wanders. A simple practice: take 10 slow breaths and just notice the breath; when your mind wanders, gently bring it back (the returning IS the rep). Brief mindfulness lowers stress and sharpens concentration.`,
    ideas: `Mix: true_false (multitasking is an efficient way to study → false), multiple_choice (best place for your phone while studying → another room; or what mindfulness trains), match_pairs (technique → why it works), categorize (focus-friendly vs focus-killing), order_steps (set up a focus session), tap_word, fill_blank (a Pomodoro ≈ 25). End with the reflect finale.`,
  },
  {
    nn: '17', slug: 'a-healthy-brain', unit: 7, sort: 17,
    title: 'Fuel your brain',
    desc: 'Sleep, move, eat, repeat — the body work that powers the mind.',
    illos: ['/illustrations/healthy-brain.svg'],
    finale: 'decision_path — "Exam-week wellbeing" (course capstone): daily choices across the exam week (sleep ~9 hrs / take a short walk / eat real food + water / take real breaks VS all-nighters / skip meals / energy drinks at midnight / no breaks for 6 hours). Stat "Brainpower" or "Energy". Make it feel like the boss finale of the course.',
    requiredTypes: ['decision_path', 'reflect'],
    points: `The brain is about 2% of body weight but uses ~20% of your energy — so body care IS brain care. SLEEP is the heavyweight: teens need roughly 8–10 hours; sleep CONSOLIDATES memory (you literally lock in the day's learning while asleep) and clears waste, so an all-nighter wrecks recall, focus and mood. A consistent sleep/wake time beats trying to "catch up" on weekends (sleep debt doesn't fully repay). Screens late at night (light + stimulation) delay sleep — wind down first. EXERCISE: even a short walk boosts memory, focus and mood and lowers stress (more blood flow + BDNF); regular movement is linked to better grades. NUTRITION: the brain runs on steady glucose — whole foods, protein, fruit/veg, healthy fats, and WATER (even mild dehydration hurts focus); avoid big sugar/heavy-carb crashes right before studying. Manage STRESS and take real breaks — chronic stress shrinks focus and memory; downtime, friends, nature and hobbies recharge you. Caffeine in small amounts can help alertness but too much or too late wrecks the sleep you actually need. It all COMPOUNDS — small daily habits beat heroic cramming.`,
    ideas: `Mix: a mid-lesson reflect (pick ONE brain-healthy habit to start this week and why — chips like ["Earlier bedtime","Daily walk","More water","Phone out of the bedroom","Real breaks"]), true_false (an all-nighter before an exam helps → false; or weekend sleep fully repays the week → false), multiple_choice (best pre-exam choice → a full night's sleep), categorize (helps vs hurts your brain), match_pairs (habit → brain benefit), slider_estimate (hours of sleep teens need ≈ 9), tap_word, fill_blank. End with the decision_path capstone finale. (Note: this lesson uses BOTH a reflect block and the decision_path finale.)`,
  },
]

// ------------------------------------------------------------------- schemas

const SVG_RESULT = {
  type: 'object', additionalProperties: false,
  properties: { name: { type: 'string' }, ok: { type: 'boolean' }, note: { type: 'string' } },
  required: ['name', 'ok'],
}
const LESSON_RESULT = {
  type: 'object', additionalProperties: false,
  properties: {
    slug: { type: 'string' },
    validatorPassed: { type: 'boolean' },
    materialCount: { type: 'number' },
    questionCount: { type: 'number' },
    distinctTypes: { type: 'number' },
    finale: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['slug', 'validatorPassed'],
}
const REVIEW_RESULT = {
  type: 'object', additionalProperties: false,
  properties: {
    slug: { type: 'string' },
    validatorPassed: { type: 'boolean' },
    issuesFound: { type: 'array', items: { type: 'string' } },
    fixesApplied: { type: 'array', items: { type: 'string' } },
    factCheckOk: { type: 'boolean' },
  },
  required: ['slug', 'validatorPassed', 'factCheckOk'],
}

const NEW_TYPE_SHAPES = `New course-specific block types you can use (full shapes are in CONTENT_SPEC.md):
priority_matrix: { "type":"priority_matrix", "prompt", "tasks":[{ "text", "urgent":bool, "important":bool }] (4–8 tasks, ALL four urgent/important combos present), "explanation" }  — max 1 per lesson.
spaced_planner:  { "type":"spaced_planner", "prompt", "topic"?, "points":[{ "label", "day":number, "recommended":bool }] (4–8 points; 2–5 recommended; ≥1 not recommended), "explanation" }  — max 1 per lesson.
reflect (no wrong answer, always passes): { "type":"reflect", "prompt", "context"?, "chips"?:[string], "placeholder"?, "explanation"? }.`

const RULES = `HARD RULES (the validator enforces these — your file MUST pass):
- Valid JSON, no trailing commas, no comments.
- Top-level keys: slug, title, description, unit, sortOrder, xpReward, summaryPoints (3–5 bullets), content (array of blocks).
- First block is "material" (the hook). Never more than 3 material blocks in a row.
- 5–8 material blocks total; 9–13 question blocks total; at least 6 DISTINCT question types.
- ≤1 each of: budget_builder, decision_path, priority_matrix, spaced_planner per lesson.
- material.body ≤ 600 chars. Use \\n\\n for paragraph breaks, "- " lines for bullets, **bold** for emphasis.
- Any material "image" MUST be one of this course's allowed illustrations (listed below) and needs an "imageAlt".
- multiple_choice: 3–4 options. categorize: 2–3 categories, 4–8 items, every category used. match_pairs: 3–5 pairs, unique right sides. order_steps: 3–5 steps in correct order. tap_word: wrongWord appears exactly once, no punctuation. slider_estimate: (answer−min), tolerance, and range all multiples of step. fill_blank: prompt contains ___ and answer is ONE word/number.`

const VOICE = `VOICE & ACCURACY:
- Second person, warm, a little playful, zero corporate filler — a sharp friend explaining this at a kitchen table. Audience: teens & young adults; use real student examples (exams, essays, group chats, phones, late nights).
- REWRITE everything in your own words — do NOT copy source phrasing, and strip any teacher-voice ("students will…") or citations.
- Every fact must be correct and every number checked. Use the teaching points provided as your source of truth.
- Every question explanation is 1–2 sentences that teach the WHY.
- Vary correctIndex across multiple_choice questions; make distractors plausible.`

const ALLOWED_ILLOS = [
  '/illustrations/brain-spark.svg', '/illustrations/growth-mindset.svg', '/illustrations/priority-matrix.svg',
  '/illustrations/procrastination.svg', '/illustrations/critical-thinking.svg', '/illustrations/metacognition.svg',
  '/illustrations/bloom-pyramid.svg', '/illustrations/active-listening.svg', '/illustrations/note-taking.svg',
  '/illustrations/active-reading.svg', '/illustrations/test-calm.svg', '/illustrations/memory-stages.svg',
  '/illustrations/forgetting-curve.svg', '/illustrations/focus-target.svg', '/illustrations/healthy-brain.svg',
]

function authorPrompt(b) {
  const file = `content/how-to-learn/${b.nn}-${b.slug}.json`
  return `You are authoring ONE lesson for the LIFESKL "How to Learn" course (a Duolingo-style life-skills app). Match the gold standard exactly.

FIRST, read these for format & voice (do not copy their content):
- ${ROOT}/content/CONTENT_SPEC.md  (the full block-type spec + the three new types)
- ${ROOT}/content/personal-finance/01-what-is-a-budget.json  (a gold-standard lesson)

${NEW_TYPE_SHAPES}

${RULES}

${VOICE}

This course's ONLY allowed illustration images (use 1–2 where they genuinely help, each with imageAlt):
${ALLOWED_ILLOS.join('  ')}
Recommended for THIS lesson: ${b.illos.join(', ')}

=== LESSON TO WRITE ===
slug: ${b.slug}
title: ${b.title}
description: ${b.desc}
unit: ${b.unit}   (this is "Level ${b.unit}" on the course map)
sortOrder: ${b.sort}   (MUST be exactly this number — it's unique across the course)
xpReward: ${b.sort >= 13 ? 25 : 20}

TEACHING POINTS (your source of truth — rewrite into warm second-person material blocks and questions; every fact here is correct, do not contradict it):
${b.points}

REQUIRED interactive finale (make it the LAST block): ${b.finale}
Required block type(s) to include: ${b.requiredTypes.join(', ')}.

QUESTION MIX guidance (use a varied set, ≥6 distinct types including the required one(s)):
${b.ideas}

STRUCTURE TARGET: 6–7 material blocks and 9–11 question blocks, interleaved (hook → ~2 material → question(s) → ~2 material → questions → … → finale). Never 3 material in a row beyond the limit. summaryPoints: 4–5 punchy bullets of what the learner can now DO.

STEPS:
1. Write the complete lesson JSON to: ${ROOT}/${file}
2. Validate it:  cd ${ROOT} && node scripts/validate-content.mjs how-to-learn ${file}
3. If it prints anything other than a "✓" line, FIX the file and re-run until it passes cleanly. Do not stop until you see "✓ ${file} (...)".
4. Return the structured result.`
}

function reviewPrompt(b) {
  const file = `content/how-to-learn/${b.nn}-${b.slug}.json`
  return `You are a strict content editor for the LIFESKL "How to Learn" course. Critically review and IMPROVE one finished lesson, then re-validate it.

Read the file: ${ROOT}/${file}
Also skim ${ROOT}/content/personal-finance/01-what-is-a-budget.json for the quality bar.

Check against this rubric and FIX problems in place (edit the file):
1. ACCURACY — every fact and number is correct. The teaching points below are the source of truth; fix anything that contradicts them or is vague/misleading:
${b.points}
2. VOICE — warm, second person, playful, concrete student examples; NO teacher-voice, NO corporate filler, NO copied/citation text. Tighten clunky lines.
3. VARIETY — at least 6 distinct question types; questions aren't repetitive; correctIndex varies across multiple_choice; distractors are plausible.
4. FINALE — the lesson ends with this interactive finale and it's well-formed: ${b.finale}
5. TEACHING — every explanation teaches the WHY in 1–2 sentences. summaryPoints are action-oriented.
6. Do NOT change slug, sortOrder (${b.sort}), or unit (${b.unit}).
7. Keep material.body ≤ 600 chars and never >3 material blocks in a row.

After editing, re-validate:  cd ${ROOT} && node scripts/validate-content.mjs how-to-learn ${file}
Iterate until it prints "✓ ${file} (...)". Return the structured result (list the concrete issues you found and the fixes you applied; factCheckOk = true only if every fact now matches the teaching points).`
}

// ---------------------------------------------------------------- run

phase('Illustrations')
log(`Drawing ${SVGS.length} themed SVGs…`)
const svgResults = await parallel(
  SVGS.map((s) => () =>
    agent(
      `Create one SVG illustration for the LIFESKL "How to Learn" course.

${READ_FIRST}

${STYLE}

Draw: ${s.draw}
aria-label: "${s.alt}"

Write the finished SVG to exactly: ${ROOT}/apps/web/public/illustrations/${s.name}.svg
It must be a single valid <svg>…</svg> file with viewBox="0 0 320 200" and the role/aria-label as specified. Return the structured result (ok=true only if the file is written and valid).`,
      { label: `svg:${s.name}`, phase: 'Illustrations', model: 'sonnet', schema: SVG_RESULT },
    ),
  ),
)
log(`Illustrations done: ${svgResults.filter((r) => r && r.ok).length}/${SVGS.length} ok`)

// Author each lesson, then run it straight through a critical review — pipelined
// so a finished lesson starts review while others are still being written.
const results = await pipeline(
  LESSONS,
  (b) => agent(authorPrompt(b), { label: `author:${b.slug}`, phase: 'Author', schema: LESSON_RESULT }).then((r) => ({ b, author: r })),
  ({ b, author }) =>
    agent(reviewPrompt(b), { label: `review:${b.slug}`, phase: 'Review', schema: REVIEW_RESULT }).then((review) => ({
      slug: b.slug,
      sort: b.sort,
      author,
      review,
    })),
)

const ok = results.filter((r) => r && r.review && r.review.validatorPassed).length
log(`Lessons complete: ${ok}/${LESSONS.length} passed validation after review`)

return {
  illustrations: svgResults.filter(Boolean),
  lessons: results.filter(Boolean).map((r) => ({
    slug: r.slug,
    sort: r.sort,
    validatorPassed: r.review?.validatorPassed ?? false,
    factCheckOk: r.review?.factCheckOk ?? false,
    issues: r.review?.issuesFound ?? [],
  })),
}
