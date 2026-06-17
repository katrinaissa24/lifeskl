export const meta = {
  name: 'emotional-intelligence-course',
  description: 'Author the Emotional Intelligence course: 14 themed SVGs + 21 lessons (author + self-validate).',
  phases: [
    { title: 'Illustrations', detail: '14 EI-themed SVGs in the finance illustration style' },
    { title: 'Author', detail: 'one agent per lesson, self-validating against the content spec' },
  ],
}

const ROOT = '/Users/katrinaissa/Desktop/lifeskl/.claude/worktrees/nervous-shannon-a9b888'

const STYLE = `LIFESKL "Grape" illustration style (match the finance set exactly):
- Root: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" fill="none" role="img" aria-label="<short description>">
- Strokes: 3px solid INK #181016 (2.5px fine details). flat fills, friendly rounded shapes, stroke-linejoin="round".
- Palette (use LITERAL hex): ink #181016, accent #6b46ff, dark accent #4a2ed1, tint #efe9ff, pink #ff6f9c, pink tint #ffe6ee, green #1f8a5b, green tint #e3f5ec, surface #fffdf8, soft text #4a3f47. (Mood-meter only may also use red #ffd9d9, yellow #fff0bf, blue #d8e3ff, green #d2f1de.)
- Small labels: font-family="Arial, sans-serif" font-weight="700/800", font-size 10–14, fill #4a3f47 or #181016, text-anchor="middle".
- Clean, legible at ~460px wide. No external assets, no gradients, no <style> blocks.`

const READ_FIRST = `Before drawing, read these two files to copy the exact style/structure:
- ${ROOT}/apps/web/public/illustrations/budget-split.svg
- ${ROOT}/apps/web/public/illustrations/smart-goals.svg`

const SVGS = [
  { name: 'mood-meter', alt: 'A 2x2 mood meter grid with four colored quadrants', draw: 'A 2x2 grid of four rounded cells: top-left red #ffd9d9 "Red", top-right yellow #fff0bf "Yellow", bottom-left blue #d8e3ff "Blue", bottom-right green #d2f1de "Green", all with ink #181016 3px borders. Axis labels in #4a3f47: "Unpleasant" / "Pleasant" along the top, "High energy" / "Low energy" up the left side.' },
  { name: 'emotion-wheel', alt: 'A wheel of emotion words radiating from a center', draw: 'A circle divided into 6 pie wedges, alternating fills tint #efe9ff, pink tint #ffe6ee, green tint #e3f5ec, with ink spokes and a small accent #6b46ff center hub. A few tiny emotion labels (Happy, Sad, Angry, Calm) in #4a3f47 near the rim.' },
  { name: 'body-cues', alt: 'A body outline with emotion cue markers', draw: 'A simple rounded head-and-torso silhouette (surface #fffdf8 fill, ink outline). Three small cue markers with thin leader lines: a pink #ff6f9c heart on the chest, a small #6b46ff knot/spiral on the stomach, and a short tension mark at the jaw/shoulders. Tiny labels optional.' },
  { name: 'trigger-spark', alt: 'A lit match igniting a spark', draw: 'A match held diagonally (ink stick, #ff6f9c flame) touching the end of a short curved fuse that ends in a bright #6b46ff spark burst (star shape) with a few small spark dots. Conveys a trigger igniting.' },
  { name: 'values-compass', alt: 'A compass needle pointing to a heart', draw: 'A compass: an ink circle with N/E/S/W tick marks and a tint #efe9ff face, a bold #6b46ff needle pointing up-right to a small pink #ff6f9c heart sitting just outside the rim at the top. Conveys an inner compass of values.' },
  { name: 'pause-breath', alt: 'A pause button inside calm breathing rings', draw: 'A central circle (surface #fffdf8, ink outline) holding two rounded accent #6b46ff pause bars. Around it, 2 concentric thin tint #efe9ff breathing rings. Calm and steady.' },
  { name: 'anger-thermometer', alt: 'A thermometer cooling from hot to calm', draw: 'An upright thermometer (ink outline, rounded bulb at the bottom filled pink #ff6f9c, column tint #ffe6ee). A small downward arrow #6b46ff beside it and a tiny snowflake or breath swirl at the top. Conveys cooling down.' },
  { name: 'empathy-bridge', alt: 'Two heads connected by a bridge', draw: 'Two simple head profiles facing each other (surface #fffdf8 fill, ink outline). A gentle accent #6b46ff arc/bridge connects them, with a small shared tint #efe9ff thought bubble above the middle. Conveys seeing another viewpoint.' },
  { name: 'feedback-balance', alt: 'A balance scale weighing care and honesty', draw: 'A balance scale (ink stand and beam, level). Left pan holds a small pink #ff6f9c heart (care), right pan holds a tint #fff0bf speech mark or check (honesty). Balanced. Tiny labels "care" / "honest" in #4a3f47.' },
  { name: 'repair-bridge', alt: 'A cracked bridge being mended', draw: 'A simple arched bridge (ink outline, surface #fffdf8 fill) with a visible jagged crack in the middle being mended by a pink #ff6f9c patch/band and a #6b46ff seam pulling the two sides together. Conveys apology and repair.' },
  { name: 'boundary-line', alt: 'A friendly fence marking a limit', draw: 'A short, friendly fence or a bold #6b46ff dashed line across the middle with a small calm figure (surface, ink) standing on one side and a gentle "stop" marker (a small ink circle with a dash) on the line. Conveys a healthy boundary.' },
  { name: 'inner-flame', alt: 'A steady flame inside a shield', draw: 'A rounded shield or heart outline (surface #fffdf8, ink) containing a single steady flame (lower pink #ff6f9c, inner #6b46ff). Maybe 2 tiny spark dots rising. Conveys inner drive/motivation.' },
  { name: 'tone-bubble', alt: 'A chat bubble showing tone', draw: 'A rounded speech/chat bubble (surface #fffdf8, ink outline) containing a small smiling face and a short accent #6b46ff sound waveform; a second smaller tint #efe9ff bubble behind it. Conveys tone in a text/message.' },
  { name: 'difficult-people', alt: 'A calm figure unbothered by a storm cloud', draw: 'A calm standing figure (surface #fffdf8, ink, a small even smile) holding a #6b46ff umbrella. Above, a small blue #d8e3ff storm cloud with a couple of ink rain lines. The figure stays dry and unbothered.' },
]

const LESSONS = [
  // ---------------- Chapter 1 — Self-Awareness ----------------
  {
    nn: '01', slug: 'name-your-feelings', unit: 1, sort: 1,
    title: 'Name what you feel',
    desc: "Put the right word on a feeling and it loosens its grip.",
    illos: ['/illustrations/mood-meter.svg', '/illustrations/body-cues.svg'],
    finale: 'mood_meter — 5–6 feelings/scenarios covering all four quadrants (Red high-energy unpleasant, Yellow high-energy pleasant, Blue low-energy unpleasant, Green low-energy pleasant). This is the finale.',
    requiredTypes: ['mood_meter'],
    points: `Emotional intelligence (EI) = noticing, understanding and managing emotions — yours and other people's. It's a learnable skill, not a fixed trait. It starts with self-awareness: NAMING what you feel. "Name it to tame it" (Dan Siegel) — putting a feeling into words actually calms the brain's alarm (the amygdala) and brings the thinking brain back online. Be PRECISE: "stressed" or "bad" is vague; "overwhelmed", "disappointed", "lonely", "anxious" give you a real handle and better choices (emotional granularity — Lisa Feldman Barrett). Your BODY signals emotions before your mind labels them: tight chest, clenched jaw, butterflies, hot face — an early-warning system. The RULER Mood Meter (Yale) maps any feeling on two axes — pleasantness (unpleasant↔pleasant) and energy (low↔high) — giving four quadrants: Red (high energy, unpleasant: angry, anxious), Yellow (high energy, pleasant: excited, joyful), Blue (low energy, unpleasant: sad, drained), Green (low energy, pleasant: calm, content). No feeling is "bad" — they're all information.`,
    ideas: `Mix: true_false (naming a feeling makes it more intense → false; it calms it), multiple_choice (most precise label for a scenario), match_pairs (vague word → precise word, or body cue → feeling), categorize (pleasant vs unpleasant, or high vs low energy), fill_blank (granularity or amygdala), tap_word. End with the mood_meter finale.`,
  },
  {
    nn: '02', slug: 'your-triggers', unit: 1, sort: 2,
    title: 'Spot your triggers',
    desc: 'The button that gets pushed — and how to see it coming.',
    illos: ['/illustrations/trigger-spark.svg'],
    finale: 'reflect — ask the learner to name one real trigger of theirs, the early body sign, and one thing they\'ll do when they spot it. Chips like ["Being criticized","Being ignored","Feeling rushed","Unfairness","Being told what to do"]. This is the closing block.',
    requiredTypes: ['reflect'],
    points: `A TRIGGER is a situation, word, person or memory that sets off a strong reaction — often bigger than the moment deserves, because it taps an old sensitivity (feeling disrespected, excluded, controlled, judged, or not good enough). Common triggers: criticism, being interrupted or ignored, unfairness, feeling rushed, a certain tone of voice. Triggers aren't a flaw — everyone has them. The skill is spotting YOURS so they don't run you. Notice the pattern: what happened right before you flared, and what did it make you feel about yourself? Catch the body's spike (heat, racing heart) as the early warning. Once you can name a trigger ("I get defensive when I feel blamed"), you can plan for it instead of being hijacked. The reaction is automatic; the response can be chosen — but only if you see the trigger coming.`,
    ideas: `Mix: multiple_choice (what a trigger is / how to spot one), true_false (only weak people have triggers → false), categorize (common trigger themes vs not, or trigger vs neutral event), match_pairs (trigger → the deeper need it taps), order_steps (notice the spike → name the trigger → plan a response), tap_word, fill_blank. End with the reflect finale.`,
  },
  {
    nn: '03', slug: 'values-and-blind-spots', unit: 1, sort: 3,
    title: 'Your values & blind spots',
    desc: "What actually drives you — and what you can't see about yourself.",
    illos: ['/illustrations/values-compass.svg'],
    finale: 'reflect — ask the learner to name their top 2–3 values and one blind spot they\'ll keep an eye on. Chips like ["Honesty","Loyalty","Freedom","Growth","Fairness","Family","Creativity"]. This is the closing block.',
    requiredTypes: ['reflect'],
    points: `VALUES are what genuinely matters to you — honesty, loyalty, freedom, growth, family, fairness, creativity. They're your inner compass: when a choice or feeling lines up with a value it feels right; when it clashes you feel "off" or guilty. Knowing your top values explains a lot of your reactions and helps you make decisions you won't regret. STRENGTHS are what you do well naturally; BLIND SPOTS are patterns other people see in you that you don't — interrupting, avoiding conflict, taking over, needing to be right. Self-awareness includes the humility to learn your blind spots, usually through honest feedback and noticing recurring complaints about you. You are not your worst habit — naming a blind spot is the first step to working on it. And watch this: a strength OVERUSED becomes a weakness (confident → arrogant, caring → no boundaries, driven → can't rest).`,
    ideas: `Mix: match_pairs (value → what it looks like in action, or strength → its overused version), categorize (value vs not, or strength vs blind spot), multiple_choice (what a value is / an overused strength), true_false (a blind spot is something you can clearly see in yourself → false), tap_word, fill_blank (values/compass). End with the reflect finale.`,
  },
  // ---------------- Chapter 2 — Self-Regulation ----------------
  {
    nn: '04', slug: 'the-pause', unit: 2, sort: 4,
    title: 'The pause',
    desc: 'The tiny gap between trigger and reaction is where your power lives.',
    illos: ['/illustrations/pause-breath.svg'],
    finale: 'decision_path — "The pause": a provoking moment (e.g. a friend posts something that makes you look bad). 3–4 steps escalating; best options = pause/breathe/step away/ask before reacting; worst = fire off the angry reply, subtweet back. Stat like "Composure" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Self-regulation = managing your reactions so emotions don't drive the car. The core skill is the PAUSE — the gap between trigger and response. ("Between stimulus and response there is a space; in that space is our power to choose.") The emotional brain fires FIRST and fast; even a few seconds — one slow breath, counting to ten, stepping away — lets the thinking brain catch up. Tactics: name the feeling, breathe with a longer exhale than inhale, ask "what do I actually want here?", and delay anything you might regret (the angry text, the snap reply). The "90-second rule" (Jill Bolte Taylor): the physical surge of an emotion runs its course in about 90 seconds if you don't feed it with more angry thoughts — the story you keep telling is what keeps it going. RECOVERING after an emotional hit: don't fake being fine — let the wave pass, move your body, talk it out or write it down, and be kind to yourself. A pause isn't bottling it up; it's choosing your response on purpose.`,
    ideas: `Mix: true_false (the emotional brain reacts before the thinking brain → true), multiple_choice (best move the instant you feel the surge), order_steps (pause → breathe → name it → choose), match_pairs (tactic → why it works), categorize (helps you regulate vs makes it worse), slider_estimate (the body's surge of an emotion passes in about 90 seconds), tap_word. End with the decision_path finale.`,
  },
  {
    nn: '05', slug: 'cool-the-heat', unit: 2, sort: 5,
    title: 'Cool the heat',
    desc: 'Anger and anxiety are loud — here\'s how to turn the volume down.',
    illos: ['/illustrations/anger-thermometer.svg'],
    finale: 'decision_path — "In the heat": an unfair, anger-and-anxiety-spiking moment. 3–4 steps; best = breathe/step away/reappraise/don\'t send it while hot; worst = yell, send the text, spiral. Stat "Cool head" starting ~50. (This lesson ALSO uses a mood_meter block earlier — placing a few high-energy unpleasant feelings.)',
    requiredTypes: ['decision_path', 'mood_meter'],
    points: `Anger and anxiety are both HIGH-ENERGY, unpleasant states (Red on the mood meter) — your body floods with adrenaline. They aren't "bad": anger flags a boundary crossed or unfairness, anxiety flags a perceived threat. The problem is acting from the flood. To cool ANGER: catch the early signs (heat, clenched jaw, louder voice), slow your breathing, step away if you can, and never decide or send messages while hot. Reappraise — is this worth it, and is my story about it even accurate? To calm ANXIETY: it's your alarm misfiring; slow, long exhales tell your nervous system you're safe (box breathing: in 4, hold 4, out 4, hold 4). Ground in the present using your senses. Name the worry and check it against facts — anxiety inflates threats. Physical resets help: cold water, a walk, unclench your jaw and shoulders. The goal isn't to never feel anger or anxiety — it's to feel them without letting them run the show.`,
    ideas: `Include a mood_meter (place a few high-energy unpleasant feelings like furious/panicked plus one or two others). Plus: true_false (anger is always bad → false; it's information), multiple_choice (best way to cool anger or calm anxiety → slow exhale / step away), match_pairs (technique → what it calms), categorize (cools you down vs fuels the fire), order_steps (notice → breathe → step back → reappraise), tap_word. End with the decision_path finale.`,
  },
  {
    nn: '06', slug: 'venting-without-dumping', unit: 2, sort: 6,
    title: 'Vent without dumping',
    desc: 'Let off steam in a way that helps — and doesn\'t torch the people around you.',
    illos: ['/illustrations/pause-breath.svg'],
    finale: 'i_statement — build a healthy ask for support, e.g. slots: the feeling ("I\'m really overwhelmed" ok vs "everything is the worst" not-ok), what you need ("I just need to vent for a few minutes" ok vs "you have to fix this" not-ok), the consent/care ("is that okay right now?" ok vs "and you have to listen" not-ok). This is the finale.',
    requiredTypes: ['i_statement'],
    points: `Venting can genuinely help — saying a feeling out loud releases pressure and helps you feel heard. But there's a line between healthy VENTING and DUMPING. Healthy venting: you ask first ("can I vent for a sec?"), it's time-limited, you're moving toward feeling better, and you own your part. DUMPING: unloading on someone without consent, over and over, blaming and rehashing, leaving them drained ("trauma dumping" / making your stress their problem). Key fact most people get wrong: RUMINATION — venting the same grievance again and again — actually keeps you stuck and can make anger STRONGER, not smaller (research on rehearsing grievances). Better outlets: name the feeling, move your body, write it down, talk to ONE trusted person with their consent, then turn toward "what can I do?". Ask for what you need: "I don't need you to fix it, I just need to be heard for a minute." A calm friend helps you co-regulate; two people winding each other up just co-escalate.`,
    ideas: `Mix: true_false (venting the same thing over and over cools you down → false; it fuels it), categorize (healthy venting vs dumping), multiple_choice (the kind thing to do before you vent → ask consent), match_pairs (outlet → effect), order_steps (name it → move → tell one person → turn to action), tap_word. End with the i_statement finale.`,
  },
  // ---------------- Chapter 3 — Empathy & Social Awareness ----------------
  {
    nn: '07', slug: 'reading-people', unit: 3, sort: 7,
    title: 'Read the room... and the person',
    desc: 'Most of what people mean isn\'t in their words.',
    illos: ['/illustrations/active-listening.svg', '/illustrations/empathy-bridge.svg'],
    finale: 'mood_meter — read what the OTHER person is probably feeling in 5–6 short scenarios, covering all four quadrants (e.g. a friend who just aced a tryout = Yellow; a classmate quietly staring out the window = Blue; someone slamming a locker = Red; someone leaning back relaxed and chatty = Green). This is the finale.',
    requiredTypes: ['mood_meter'],
    points: `Empathy and social awareness = reading what others feel and need. Most communication is NONVERBAL — tone of voice, facial expression, posture, eye contact, pace. The words can say "I'm fine" while crossed arms, a flat tone and avoided eyes say the opposite. Read CLUSTERS of cues (one sign means little; several pointing the same way mean a lot) and watch for CHANGES from someone's baseline (a normally chatty friend goes quiet). ACTIVE LISTENING is the other half: fully attend, don't plan your reply while they talk, reflect back ("sounds like you're slammed"), and ask instead of assuming. Don't mind-read — check it ("you seem a bit off, everything okay?"). Tone often carries the real message more than the words do. Reading people is a skill you sharpen with attention, not a psychic gift — and when you're unsure, the move is to ask.`,
    ideas: `Mix: true_false (the words carry most of the emotional message → false; tone and body carry a lot), multiple_choice (best read of a cue cluster, or best listening move), categorize (open vs closed body language, or listening vs waiting-to-talk), match_pairs (cue → likely feeling), order_steps (notice → read the cluster → check by asking), tap_word. End with the mood_meter finale (reading THEM).`,
  },
  {
    nn: '08', slug: 'see-their-side', unit: 3, sort: 8,
    title: 'See it their way',
    desc: 'Understanding someone isn\'t the same as agreeing — and it\'s a superpower.',
    illos: ['/illustrations/empathy-bridge.svg'],
    finale: 'decision_path — "Their side": a friction moment (a friend snaps at you out of nowhere). 3–4 steps; best = get curious about what might be going on for them, ask, assume a reason; worst = assume they\'re just rude, snap back, write them off. Stat "Understanding" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Perspective-taking = stepping into someone else's shoes to understand why they might feel or act as they do. It's NOT agreeing or excusing — it's understanding. Watch the "fundamental attribution error": we judge others by their behavior ("he's so rude") but ourselves by our intentions ("I was just stressed"). Flip it — assume the other person, like you, is probably reacting to something you can't see: a bad day, fear, pressure, a need. Ask "what might be going on for them?" and "what would I feel in their spot?" Curiosity beats judgment. Cognitive empathy (getting their view) plus a little emotional empathy (feeling with them) defuses conflict and builds trust. You can hold your own view AND theirs at the same time. When you're stuck in "I'm just right," perspective-taking is the way out.`,
    ideas: `Mix: true_false (perspective-taking means you have to agree with them → false), multiple_choice (most empathic read of a situation), match_pairs (a behavior → a hidden reason behind it), categorize (judgment vs curiosity), order_steps (notice the judgment → get curious → imagine their side → check), tap_word. End with the decision_path finale.`,
  },
  {
    nn: '09', slug: 'respecting-differences', unit: 3, sort: 9,
    title: 'Read the room & respect differences',
    desc: 'The same move that kills in one room bombs in another.',
    illos: ['/illustrations/empathy-bridge.svg'],
    finale: 'decision_path — "Reading the room": you step into different situations (a hyped party, a tense group project, a friend who just got bad news). 3–4 steps; best = sense the tone and adjust; worst = barrel in with the same energy regardless. Stat "Social radar" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Reading the room = sensing a group's emotional tone and adjusting to it. The same joke that kills with friends bombs at a funeral. Cues: the energy level, who's talking vs quiet, body language, and what is NOT being said. Match and respect the moment — celebratory, tense, focused, grieving — before you act. Social awareness also means respecting INDIVIDUAL and CULTURAL differences: eye contact, personal space, directness, humor, formality and how openly people show emotion all vary by person and culture — what's polite in one place is rude in another. Don't assume your normal is everyone's. When you're unsure, observe first, mirror the group's register, and ask rather than assume. This isn't about being fake — it's about being considerate and effective by reading context instead of steamrolling it.`,
    ideas: `Mix: true_false (one set of social rules fits every culture → false), multiple_choice (best move when you realize you've misread the room), categorize (reading the room vs ignoring it, or respectful vs assuming), match_pairs (setting → the tone that fits it), order_steps (observe → sense the mood → adjust), tap_word. End with the decision_path finale.`,
  },
  // ---------------- Chapter 4 — Managing Relationships ----------------
  {
    nn: '10', slug: 'feedback-both-ways', unit: 4, sort: 10,
    title: 'Feedback, both ways',
    desc: 'How to give it without bruising — and take it without crumbling.',
    illos: ['/illustrations/feedback-balance.svg'],
    finale: 'i_statement — build a kind, specific piece of feedback, e.g. slots: the situation/behavior ("when the project was turned in late twice" ok vs "you\'re so unreliable" not-ok), the impact ("I ended up stressed and scrambling" ok vs "you clearly don\'t care" not-ok), the ask ("could we set a check-in next time?" ok vs "just fix your attitude" not-ok). This is the finale.',
    requiredTypes: ['i_statement'],
    points: `Managing relationships means handling FEEDBACK in both directions. GIVING it without bruising: be specific and about BEHAVIOR, not character ("the report was late twice", not "you're unreliable"); lead with care; pick a private moment and good timing; make it a two-way conversation, not a verdict. A clean frame: situation → behavior → impact ("In the meeting, when you cut me off, I felt dismissed") — an I-statement, not a "you" attack. TAKING feedback without getting defensive: the instinct is to defend, but defensiveness blocks growth. Breathe, assume good intent, listen fully, ask clarifying questions, and say "thank you, let me think about that." You don't have to accept all of it — separate the signal from the delivery. Feedback is information, not a verdict on your worth. The people who grow fastest actively ask for it.`,
    ideas: `Mix: true_false (good feedback targets the person's character → false; target the behavior), multiple_choice (most useful response to feedback → ask a clarifying question / thank them), categorize (helpful feedback vs harsh, or defensive vs open reactions), match_pairs (defensive move → open alternative), order_steps (breathe → listen → clarify → decide), tap_word. End with the i_statement finale.`,
  },
  {
    nn: '11', slug: 'conflict-and-repair', unit: 4, sort: 11,
    title: 'From conflict to repair',
    desc: 'Fighting fair, and fixing it after you mess up.',
    illos: ['/illustrations/repair-bridge.svg'],
    finale: 'decision_path — "The repair": after you snap at someone you care about, 3–4 steps; best = cool down, own it specifically, name the impact, make a real apology; worst = defend, "I\'m sorry you feel that way", bring up their past mistakes. Stat "Trust" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Conflict is normal — handled well it strengthens relationships; avoided or fought dirty it corrodes them. Aim for the FIX, not the win: it's the two of you vs the problem, not you vs them. Use I-statements, stay on ONE issue (no dragging in every past grievance), and never go for the jugular — contempt and name-calling are the most damaging move (Gottman). If you're FLOODED (heart pounding, can't think straight), take a real timeout and come back. Apologizing and repairing after you mess up: a real apology NAMES what you did ("I snapped at you"), owns it with no "but", acknowledges the impact, and says what you'll do differently. "I'm sorry you feel that way" is NOT an apology — it blames their feelings. Small repair attempts (a joke, a hand, "can we start over?") are what keep relationships healthy — it's not about never rupturing, it's about repairing. And sometimes the move is to let a small thing go.`,
    ideas: `Mix: true_false ("I'm sorry you feel that way" is a real apology → false), multiple_choice (strongest apology, or best conflict move), categorize (fair fighting vs dirty, or real apology vs fake one), match_pairs (defensive habit → repair move), order_steps (cool down → own it → name the impact → repair), tap_word. End with the decision_path finale.`,
  },
  {
    nn: '12', slug: 'boundaries', unit: 4, sort: 12,
    title: 'Set a boundary that holds',
    desc: 'A boundary is about what you\'ll do — not controlling them.',
    illos: ['/illustrations/boundary-line.svg'],
    finale: 'i_statement — build a kind, firm boundary, e.g. slots: the limit/feeling ("I can\'t take this on right now" ok vs "you always dump on me" not-ok), the specifics ("when plans get changed last minute" ok vs "because you\'re inconsiderate" not-ok), what you\'ll do ("so I\'m going to head home" ok vs "so you need to change" not-ok). This is the finale.',
    requiredTypes: ['i_statement'],
    points: `A BOUNDARY is a limit you set to protect your time, energy or wellbeing — and it's about YOUR behavior, not controlling theirs. "If the yelling starts, I'll leave the room" is a boundary (you can enforce it). "You're not allowed to yell" is an ultimatum you can't enforce. Boundaries aren't mean or selfish — they're how relationships stay healthy; quiet resentment is often a boundary you never set. State them clearly, calmly and early — you don't owe a long justification ("No" is a complete sentence; "I can't take that on right now" is enough). The hard part is HOLDING them: people may push back, especially anyone who benefited from you having none. Expect the pushback, stay kind but firm, and follow through — a boundary you don't enforce is just a suggestion. You can love someone and still tell them no.`,
    ideas: `Mix: true_false (a boundary is meant to control the other person's behavior → false), multiple_choice (which is a real boundary vs an ultimatum), categorize (boundary vs ultimatum, or healthy vs guilt-tripping), match_pairs (situation → a clean boundary line), order_steps (notice the drain → name the limit → state it → hold it), tap_word. End with the i_statement finale.`,
  },
  // ---------------- Chapter 5 — Motivation & Inner Drive ----------------
  {
    nn: '13', slug: 'what-moves-you', unit: 5, sort: 13,
    title: 'What actually moves you',
    desc: 'The difference between drive that lasts and drive that fizzles.',
    illos: ['/illustrations/inner-flame.svg', '/illustrations/growth-mindset.svg'],
    finale: 'reflect — ask the learner to pick a goal and write their real WHY (tie it to a value, not just a reward). Chips like ["It matters to me","I want to get better at it","To make someone proud","It moves me toward who I want to be"]. This is the closing block.',
    requiredTypes: ['reflect'],
    points: `Motivation comes in two kinds: INTRINSIC (doing it because it's meaningful, interesting or satisfying to you) and EXTRINSIC (doing it for an outside reward — money, grades, praise, likes). Both work, but intrinsic motivation lasts longer and feels better; leaning only on external rewards fades fast and can even crowd out the inner drive. Self-Determination Theory: we're most motivated when we feel AUTONOMY (it's my choice), COMPETENCE (I'm getting better at it) and RELATEDNESS (it connects me to others). So connect a dull task to something you actually care about — a value or a goal — to make it feel intrinsic. OPTIMISM and a GROWTH MINDSET fuel drive: believing effort improves things, and treating setbacks as TEMPORARY and SPECIFIC ("that attempt flopped") instead of PERMANENT and GLOBAL ("I'm just a failure") — your "explanatory style" (Seligman). Optimists persist, and that persistence is often what creates the success.`,
    ideas: `Mix: categorize (intrinsic vs extrinsic motivators), true_false (external rewards always boost long-term motivation → false), multiple_choice (what makes motivation last, or the more optimistic way to read a setback), match_pairs (need → autonomy/competence/relatedness), order_steps, tap_word, fill_blank. End with the reflect finale.`,
  },
  {
    nn: '14', slug: 'the-long-game', unit: 5, sort: 14,
    title: 'The long game',
    desc: 'Staying in it when the results just... aren\'t showing up yet.',
    illos: ['/illustrations/inner-flame.svg'],
    finale: 'decision_path — "The plateau": you\'ve put in weeks of effort and seen almost nothing. 3–4 steps; best = trust the process, track small wins, tweak the strategy, rest then continue; worst = quit, spiral, declare yourself a failure. Stat "Momentum" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Motivation is easy at the start and when results come fast. The real test is the MESSY MIDDLE — when effort goes in and nothing visible comes out yet (the "valley of disappointment"). Results usually LAG effort: you're building under the surface before it shows (like compound interest, or bamboo that grows roots for years before it shoots up). Keep going by focusing on the SYSTEM and the small daily actions you control, not just the outcome; tracking tiny wins and progress, not perfection; and remembering that action comes before motivation — you start, and the feeling follows. Turn FRUSTRATION INTO FUEL: frustration means you care and you've hit an edge — use it as a signal to change strategy or push, not a reason to quit. Self-compassion (not beating yourself up) keeps you in the game longer. And discipline and habits carry you when motivation dips — motivation gets you started, habits keep you going.`,
    ideas: `Mix: true_false (if results haven't shown yet, your effort was wasted → false), multiple_choice (best move on a plateau), match_pairs (mindset → its effect), categorize (keeps you going vs makes you quit), order_steps, slider_estimate, tap_word. End with the decision_path finale.`,
  },
  {
    nn: '15', slug: 'emotional-discipline', unit: 5, sort: 15,
    title: 'Emotional discipline',
    desc: 'Doing the thing even when you don\'t feel like it.',
    illos: ['/illustrations/inner-flame.svg'],
    finale: 'decision_path — "The marshmallow moment": a tempting now-reward vs a future goal you care about (e.g. a night out vs a big test tomorrow, or impulse-buying vs saving). 3–4 steps; best = design around the temptation, remove the cue, ride the urge; worst = white-knuckle it then cave, or not even try. Stat "Future you" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Emotional discipline = doing what matters even when you don't feel like it, and DELAYING GRATIFICATION — trading a smaller reward now for a bigger one later. The famous "marshmallow test" (kids who waited for two marshmallows tended to do better later) — but the real lesson isn't willpower as a fixed trait, it's STRATEGY. You don't white-knuckle temptation; you design around it: remove the cue (phone in another room), make the better choice the easier choice, and distract or reframe ("I'm the kind of person who…"). Willpower is limited and drains (decision fatigue), so lean on habits and environment, not heroic restraint. Connect the now-action to the future payoff you actually want. And ride out the urge — cravings peak and pass like a wave ("urge surfing") — acting from your goals instead of your mood. Discipline is a muscle and a system, not a personality you're born with or without.`,
    ideas: `Mix: true_false (willpower is a fixed trait you either have or don't → false), multiple_choice (smartest way to resist temptation → remove the cue / design around it), match_pairs (strategy → why it works), categorize (helps discipline vs drains it), order_steps, tap_word. End with the decision_path finale.`,
  },
  // ---------------- Chapter 6 — Communicating with EI ----------------
  {
    nn: '16', slug: 'say-it-without-exploding', unit: 6, sort: 16,
    title: 'Say it without exploding',
    desc: 'Honest AND kind — the assertive sweet spot.',
    illos: ['/illustrations/tone-bubble.svg'],
    finale: 'i_statement — turn a bottled-up blow-up into a clean assertive ask, e.g. slots: the feeling ("I feel stretched too thin" ok vs "you\'re using me" not-ok), the trigger ("when I get asked to cover shifts last minute" ok vs "because you never think of anyone else" not-ok), the ask ("could we sort the schedule a week ahead?" ok vs "so deal with it yourself" not-ok). This is the finale.',
    requiredTypes: ['i_statement'],
    points: `Communicating with EI = saying what you mean honestly AND kindly — assertive, not aggressive or passive. Aggressive runs people over; passive swallows it (then explodes later or leaks out as passive-aggression); ASSERTIVE states your need and respects theirs. The tool is the I-statement: "I feel ___ when ___, and I'd like ___" — it owns your feeling, names the specific behavior (not their character), and asks clearly. MATCHING TONE TO MESSAGE: the same words land completely differently depending on tone, volume and timing — a calm tone keeps the other person's defenses down, a sharp one raises them. Don't raise big things while flooded, or over text. "Soft start-up" (Gottman): how a conversation BEGINS predicts how it ends — open gently, not with an attack. Say the real thing — but say it in a way the other person can actually hear.`,
    ideas: `Mix: categorize (passive vs assertive vs aggressive), true_false (being assertive means being harsh → false), multiple_choice (best opener / soft start-up), match_pairs (aggressive line → assertive rewrite), order_steps, tap_word. End with the i_statement finale.`,
  },
  {
    nn: '17', slug: 'hard-conversations', unit: 6, sort: 17,
    title: 'Hard conversations',
    desc: 'How to have the talk you keep avoiding — without the drama.',
    illos: ['/illustrations/empathy-bridge.svg'],
    finale: 'decision_path — "The hard talk": someone you care about is upset and you need to talk something through. 3–4 steps; best = soft start, listen, validate the feeling, then problem-solve; worst = "calm down", defend, rush to fix, talk over them. Stat "Connection" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Some talks are just hard — a disagreement, bad news, telling someone something they won't love. Avoiding them lets problems fester; EI is having them without drama. Prep: know your goal and your ONE main point, pick a private calm time, and assume the other person isn't the enemy. Open with a soft start-up and the shared goal ("I want us to be good, and I need to talk about something"). Stay curious — ask and listen, don't lecture. RESPONDING TO SOMEONE ELSE'S EMOTIONS in the moment: when someone's upset, don't rush to fix it, argue, or say "calm down" (it never works — it makes people more upset). First VALIDATE — "that sounds really frustrating", "I get why you'd feel that way." Validation isn't agreement; it's acknowledging the feeling, which actually lowers the heat so you can talk. Then listen, and only THEN problem-solve — and only if they want solutions; sometimes people just need to be heard. If it gets too hot, pause and come back later.`,
    ideas: `Mix: true_false ("calm down" helps an upset person → false), multiple_choice (best first response to someone upset → validate), categorize (validating vs dismissing), match_pairs (dismissive line → validating one), order_steps (soft start → listen → validate → problem-solve), tap_word. End with the decision_path finale.`,
  },
  {
    nn: '18', slug: 'digital-ei', unit: 6, sort: 18,
    title: 'Tone in texts & DMs',
    desc: 'Why "ok." reads as cold — and how not to start fights online.',
    illos: ['/illustrations/tone-bubble.svg'],
    finale: 'decision_path — "The group chat": a text exchange starts going sideways (a short reply gets read as cold, a joke lands wrong). 3–4 steps; best = clarify, soften, add context, move it to a call; worst = fire back, double down, subtweet, screenshot-and-share. Stat "Vibe" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Digital EI matters because most of our communication is now text, DM and email — where tone is invisible. Without a face or voice, the reader's brain fills in the tone, and it skews NEGATIVE (a real negativity bias in text): "ok." and "Fine." read as cold or angry even when they're not. So be WARMER than feels necessary — use the person's name, add context, and skip sarcasm (it doesn't travel). Punctuation and caps carry tone: a period can read as curt, ALL CAPS as yelling, "…" as passive-aggressive, an emoji or a quick "no rush!" softens. Never fight about serious things over text — it escalates fast; move it to a call or in person. Wait before sending while angry (a saved draft saves relationships). Remember it's permanent and forwardable — write like it could be screenshotted. And a slow reply isn't always a snub — don't assume the worst.`,
    ideas: `Mix: true_false (tone comes through clearly in text → false; it skews negative), multiple_choice (best fix for a message that might read as cold), categorize (reads warm vs reads cold), match_pairs (text habit → how it lands), order_steps, tap_word. End with the decision_path finale.`,
  },
  // ---------------- Chapter 7 — EI in the Real World ----------------
  {
    nn: '19', slug: 'ei-at-work-and-school', unit: 7, sort: 19,
    title: 'EI at work & school',
    desc: 'Often the thing that separates good from great — and you don\'t need a title.',
    illos: ['/illustrations/growth-mindset.svg'],
    finale: 'decision_path — "First week": new job or class, several situations (getting tough feedback, a stressed teammate, a mistake you made). 3–4 steps; best = stay calm, ask, take feedback well, own the mistake; worst = get defensive, blame, melt down, go quiet and hide it. Stat "Respect" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `In the real world — at work and school — EI is often what separates good from great, and employers rate it highly. It shows up as: staying composed under pressure, taking feedback well, reading your teacher/boss and teammates, handling stress without melting down, and collaborating. Manage UP and across: figure out what others need and communicate proactively. LEADING & INFLUENCING WITH EMPATHY: you don't need a title to lead — influence comes from trust, listening and making people feel understood, not from bossing people around. People follow those who "get" them. Praise specifically and in public; correct privately. Stay calm when others aren't — emotional states are contagious (emotional contagion), and one steady person steadies the room. Own your mistakes openly; it builds credibility, not weakness. EI also protects you from burnout — notice your limits and recover on purpose.`,
    ideas: `Mix: true_false (you need a title or authority to lead → false), multiple_choice (most emotionally-intelligent move at work/school), categorize (builds trust vs erodes it), match_pairs (situation → the EI response), order_steps, tap_word. End with the decision_path finale.`,
  },
  {
    nn: '20', slug: 'difficult-people', unit: 7, sort: 20,
    title: 'Difficult & draining people',
    desc: 'You can\'t change them — but you can manage your side.',
    illos: ['/illustrations/difficult-people.svg'],
    finale: 'decision_path — "The difficult one": a chronically critical/negative/baiting person (a coworker, classmate or relative). 3–4 steps; best = don\'t take the bait, stay calm, set a boundary, limit exposure; worst = argue, absorb it, try to win, let them get under your skin. Stat "Peace" starting ~50.',
    requiredTypes: ['decision_path'],
    points: `Some people are genuinely hard — chronically negative, critical, manipulative or draining. You can't change them, but you can manage your side. Don't take the bait: their behavior is usually about THEM, not you (depersonalize it). Stay calm — reacting gives them fuel; a flat, unreactive "grey rock" response starves drama. Set and hold BOUNDARIES — limit your exposure, end conversations, "I'm not going to talk about this if you're shouting." Pick your battles; not everything needs a response. With genuinely TOXIC people (consistent disrespect, manipulation, leaving you worse every time), it's okay to limit or end the relationship — protecting your peace isn't cruel. Empathy doesn't mean being a doormat: you can understand someone and still refuse to let them treat you badly. Look after yourself after a draining interaction. And stay honest — sometimes the question is "am I being the difficult one here?" Self-awareness cuts both ways.`,
    ideas: `Mix: true_false (if you try hard enough you can change a difficult person → false), multiple_choice (best response to a baiting comment), categorize (protects your peace vs feeds the drama), match_pairs (difficult behavior → the EI counter-move), order_steps, tap_word. End with the decision_path finale.`,
  },
  {
    nn: '21', slug: 'make-it-stick', unit: 7, sort: 21,
    title: 'Make EI stick',
    desc: 'Turning all of this into who you actually are.',
    illos: ['/illustrations/growth-mindset.svg', '/illustrations/inner-flame.svg'],
    finale: 'reflect — ask the learner to name their one growth edge (the situation/person that still hijacks them) and one tiny EI habit they\'ll start this week. Chips like ["A daily feelings check-in","One pause before reacting","One I-statement this week","Name the trigger when it hits"]. This is the closing block.',
    requiredTypes: ['reflect'],
    points: `EI isn't a one-time lesson — it's a practice you build like a muscle. Emotions happen fast and habits run automatically, so real change comes from small, repeated reps, not willpower in the heated moment. Build emotional HABITS that stick: pick ONE tiny practice (a daily feelings check-in, one pause before reacting, one I-statement this week), attach it to an existing routine ("habit stacking"), and track it. Expect to mess up — a slip isn't failure, it's data; the rep is noticing and getting back to it. Find your GROWTH EDGES: the specific situations or people that still hijack you are exactly where your next growth is, so be honest about your triggers and blind spots. Reflect regularly — what set me off this week, and what would I do differently? Self-compassion keeps you practicing; harsh self-judgment makes you quit. Over time the pause, the empathy, the clean apology stop being things you force and become who you are.`,
    ideas: `Mix: true_false (EI is a fixed trait you can't really change → false), multiple_choice (how a skill like EI actually sticks → small repeated practice), categorize (builds the habit vs breaks it), match_pairs (habit-building move → why it works), order_steps (pick one → stack it on a routine → track it → forgive the slips), tap_word. End with the reflect finale.`,
  },
]

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

const NEW_TYPE_SHAPES = `Course-specific block types you can use (full shapes in CONTENT_SPEC.md):
mood_meter: { "type":"mood_meter", "prompt", "items":[{ "text", "energy":"high"|"low", "pleasant":bool }] (4–8 items, ALL four energy×pleasant combos present), "explanation" } — max 1 per lesson.
i_statement: { "type":"i_statement", "prompt", "context"?, "slots":[{ "label", "options":[{ "text", "ok":bool, "why"? }] }] (2–4 slots, each 2–4 options with ≥1 ok:true and ≥1 distractor; write the ok options so they read as a natural sentence when joined in order) } — max 1 per lesson.
reflect (no wrong answer, always passes): { "type":"reflect", "prompt", "context"?, "chips"?:[string], "placeholder"?, "explanation"? }.`

const RULES = `HARD RULES (the validator enforces these — your file MUST pass):
- Valid JSON, no trailing commas, no comments.
- Top-level keys: slug, title, description, unit, sortOrder, xpReward, summaryPoints (3–5 bullets), content (array of blocks).
- First block is "material" (the hook). Never more than 3 material blocks in a row.
- 5–8 material blocks total; 9–13 question blocks total; at least 6 DISTINCT question types.
- ≤1 each of: budget_builder, decision_path, priority_matrix, spaced_planner, mood_meter, i_statement per lesson.
- material.body ≤ 600 chars. Use \\n\\n for paragraph breaks, "- " lines for bullets, **bold** for emphasis. Do NOT use single-asterisk *italics* — only **bold** renders.
- Any material "image" MUST be one of this course's allowed illustrations (listed below) and needs an "imageAlt".
- multiple_choice: 3–4 options, and VARY which index is correct across the lesson. categorize: 2–3 categories, 4–8 items, every category used. match_pairs: 3–5 pairs, unique right sides. order_steps: 3–5 steps in correct order. tap_word: wrongWord appears exactly once, no punctuation, and the corrected sentence must be grammatical and true. slider_estimate: (answer−min), tolerance, and range all multiples of step. fill_blank: prompt contains ___ and answer is ONE word/number. decision_path: 3–5 steps, 2–3 options each, exactly one best per step, and vary which position the best option is in.`

const VOICE = `VOICE & ACCURACY:
- Second person, warm, a little playful, zero corporate filler — a sharp friend at a kitchen table. Audience: teens & young adults. Use REAL, common situations (group chats, friends, family, first jobs, school, dating, roommates) — not niche or far-fetched scenarios.
- REWRITE everything in your own words — do NOT copy phrasing, and strip any teacher-voice or citations.
- Every fact must be correct; use the teaching points provided as your source of truth. Don't overclaim or invent studies.
- Every question explanation is 1–2 sentences that teach the WHY.`

const ALLOWED_ILLOS = [
  '/illustrations/mood-meter.svg', '/illustrations/emotion-wheel.svg', '/illustrations/body-cues.svg',
  '/illustrations/trigger-spark.svg', '/illustrations/values-compass.svg', '/illustrations/pause-breath.svg',
  '/illustrations/anger-thermometer.svg', '/illustrations/empathy-bridge.svg', '/illustrations/feedback-balance.svg',
  '/illustrations/repair-bridge.svg', '/illustrations/boundary-line.svg', '/illustrations/inner-flame.svg',
  '/illustrations/tone-bubble.svg', '/illustrations/difficult-people.svg', '/illustrations/active-listening.svg',
  '/illustrations/growth-mindset.svg',
]

function authorPrompt(b) {
  const file = `content/emotional-intelligence/${b.nn}-${b.slug}.json`
  return `You are authoring ONE lesson for the LIFESKL "Emotional Intelligence" course (a Duolingo-style life-skills app). Match the gold standard exactly.

FIRST, read these for format & voice (do not copy their content):
- ${ROOT}/content/CONTENT_SPEC.md  (the full block-type spec + the course-specific types)
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
unit: ${b.unit}   (this is "Level ${b.unit}" / chapter ${b.unit} on the course map)
sortOrder: ${b.sort}   (MUST be exactly this number — unique across the course)
xpReward: ${b.unit >= 5 ? 25 : 20}

TEACHING POINTS (your source of truth — rewrite into warm second-person material blocks and questions; every fact here is correct, do not contradict it):
${b.points}

REQUIRED interactive finale (make it the LAST block): ${b.finale}
Required block type(s) to include: ${b.requiredTypes.join(', ')}.

QUESTION MIX guidance (use a varied set, ≥6 distinct types including the required one(s)):
${b.ideas}

STRUCTURE TARGET: 6–7 material blocks and 9–11 question blocks, interleaved (hook → ~2 material → question(s) → ~2 material → questions → … → finale). summaryPoints: 4–5 punchy bullets of what the learner can now DO.

STEPS:
1. Write the complete lesson JSON to: ${ROOT}/${file}
2. Validate it:  cd ${ROOT} && node scripts/validate-content.mjs emotional-intelligence ${file}
3. If it prints anything other than a "✓" line, FIX the file and re-run until it passes cleanly. Do not stop until you see "✓ ${file} (...)".
4. Return the structured result.`
}

// ---------------------------------------------------------------- run

phase('Illustrations')
log(`Drawing ${SVGS.length} EI-themed SVGs…`)
const svgResults = await parallel(
  SVGS.map((s) => () =>
    agent(
      `Create one SVG illustration for the LIFESKL "Emotional Intelligence" course.

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

phase('Author')
log(`Authoring ${LESSONS.length} lessons (each self-validates)…`)
const results = await parallel(
  LESSONS.map((b) => () =>
    agent(authorPrompt(b), { label: `author:${b.slug}`, phase: 'Author', schema: LESSON_RESULT }),
  ),
)

const ok = results.filter((r) => r && r.validatorPassed).length
log(`Lessons complete: ${ok}/${LESSONS.length} self-report validator pass`)

return {
  illustrations: svgResults.filter(Boolean),
  lessons: results.filter(Boolean).map((r) => ({
    slug: r.slug,
    validatorPassed: r.validatorPassed ?? false,
    distinctTypes: r.distinctTypes,
    finale: r.finale,
  })),
}
