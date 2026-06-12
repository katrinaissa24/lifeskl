-- ============================================================================
-- LIFESKL — seed data
-- Run AFTER /supabase/migrations/0001_init.sql, in the Supabase SQL Editor.
-- Idempotent: safe to re-run (existing rows are left alone).
--
-- 7 courses (matching the landing page catalog) + starter lessons. Each
-- lesson's content is a JSONB array of blocks — enriched material mixed with
-- interactive questions, the "multiple delivery ways" model.
-- ============================================================================

insert into public.courses (slug, title, description, emoji, sort_order) values
  ('money',         'Money & Finance', 'Taxes, budgeting, credit, saving & paychecks.',        '💰', 1),
  ('health',        'Health & Mind',   'Burnout, sleep, stress, habits & therapy basics.',     '🧠', 2),
  ('relationships', 'Relationships',   'Boundaries, conflict, communication & dating.',        '💬', 3),
  ('digital',       'Digital Life',    'Privacy, scams, passwords & staying safe online.',     '🔐', 4),
  ('career',        'Career & Work',   'Resumes, interviews, negotiation & email.',            '💼', 5),
  ('home',          'Home & Repair',   'Leases, moving out, fixes & everyday maintenance.',    '🔧', 6),
  ('cooking',       'Cooking & Food',  'Real meals, groceries, nutrition & not wasting it.',   '🍳', 7)
on conflict (slug) do nothing;

-- ------------------------------------------------------------------- money

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'reading-a-payslip', 'Reading a payslip', 'Gross, net, and where the rest went.', 10, 1, $json$[
  {"type":"material","title":"Gross vs. net","body":"Gross pay is what your contract says you earn. Net pay is what actually lands in your account after deductions — income tax, social security, insurance, maybe a retirement contribution.\n\nThe gap between the two surprises almost everyone on their first payslip. The deductions section tells you exactly where the difference went, and it's worth checking every month: payroll mistakes are more common than you'd think."},
  {"type":"multiple_choice","prompt":"Your contract says $3,000/month, but the bank shows $2,410 arrived. What is the $2,410?","options":["Your gross pay","Your net pay","A banking error","Your tax refund"],"correctIndex":1,"explanation":"Net pay is what remains after tax and other deductions come out of your $3,000 gross."},
  {"type":"true_false","prompt":"Gross pay is the amount that lands in your bank account.","answer":false,"explanation":"That's net pay. Gross is the before-deductions number on your contract."}
]$json$::jsonb
from public.courses where slug = 'money'
on conflict (course_id, slug) do nothing;

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'minimum-payment-trap', 'The minimum payment trap', 'Why "just pay the minimum" quietly grows your debt.', 10, 2, $json$[
  {"type":"material","title":"How minimums really work","body":"The minimum payment on a credit card is designed to keep the account in good standing — not to pay off your debt. It mostly covers interest, so the balance itself barely moves.\n\nMeanwhile, interest compounds on everything you still owe. Pay only the minimum on a typical balance and you can spend years — and hundreds or thousands in interest — paying off a single purchase."},
  {"type":"multiple_choice","prompt":"A friend says \"just pay the minimum on your credit card.\" Why is that risky?","options":["It hurts your credit score instantly","Interest piles up on the rest — debt grows","The card gets cancelled","Nothing — it's totally fine"],"correctIndex":1,"explanation":"Paying only the minimum means interest keeps compounding on the balance, so the debt grows even while you 'pay.'"},
  {"type":"true_false","prompt":"Paying your card in full each month means you pay no interest on purchases.","answer":true,"explanation":"Full payment inside the grace period = interest-free. That's the way to use a credit card."}
]$json$::jsonb
from public.courses where slug = 'money'
on conflict (course_id, slug) do nothing;

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'budget-that-sticks', 'A budget that sticks', 'The 50/30/20 rule, minus the spreadsheet dread.', 15, 3, $json$[
  {"type":"material","title":"50 / 30 / 20","body":"A budget isn't punishment — it's a plan where every dollar has a job. The simplest one that works: 50% of take-home pay to needs (rent, groceries, transport), 30% to wants (eating out, subscriptions, fun), 20% to savings and debt repayment.\n\nThe percentages flex with your situation. What matters is deciding the split before the month starts, not discovering it after."},
  {"type":"multiple_choice","prompt":"Which of these is usually a 'need'?","options":["A streaming subscription","Rent","A new phone every year","Concert tickets"],"correctIndex":1,"explanation":"Needs are what you can't skip without real consequences: housing, food, utilities, transport to work."},
  {"type":"multiple_choice","prompt":"You take home $2,000 a month. Following 50/30/20, how much goes to savings & debt?","options":["$200","$400","$600","$1,000"],"correctIndex":1,"explanation":"20% of $2,000 = $400 — paid to your future self first, not whatever's left over."}
]$json$::jsonb
from public.courses where slug = 'money'
on conflict (course_id, slug) do nothing;

-- ------------------------------------------------------------------ health

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'sleep-debt', 'Sleep is a budget too', 'Why the weekend lie-in never quite fixes the week.', 10, 1, $json$[
  {"type":"material","title":"Sleep debt compounds","body":"Run on six hours all week and you accumulate sleep debt — and the research is clear that one long Sunday lie-in doesn't fully repay it. Reaction time, mood, and focus stay degraded even when you feel 'fine.'\n\nThe most effective fix is boring: a consistent wake time, even on weekends. Your body runs on rhythm, not averages."},
  {"type":"true_false","prompt":"You can fully repay a week of bad sleep by sleeping in on Sunday.","answer":false,"explanation":"Recovery sleep helps, but performance stays below baseline. Consistency beats catch-up."},
  {"type":"multiple_choice","prompt":"Which single habit improves sleep the most?","options":["Same wake time every day","Expensive pillows","Tracking sleep with an app","Going to bed hungry"],"correctIndex":0,"explanation":"A fixed wake time anchors your circadian rhythm; everything else follows from it."}
]$json$::jsonb
from public.courses where slug = 'health'
on conflict (course_id, slug) do nothing;

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'burnout-signals', 'Spotting burnout early', 'The warning lights before the engine seizes.', 10, 2, $json$[
  {"type":"material","title":"What burnout actually is","body":"Burnout isn't 'being tired' — it's chronic stress that's outrun recovery, and it shows up as three things: exhaustion that rest doesn't fix, growing cynicism or detachment from your work, and the feeling that nothing you do matters.\n\nIt builds slowly, which is why catching the early signals — dreading every Monday, snapping at small things, going numb about wins — matters more than heroically pushing through."},
  {"type":"multiple_choice","prompt":"Which of these is an early signal of burnout?","options":["Feeling cynical or detached about work you used to care about","Being tired after one long day","Disliking one specific meeting","Wanting a vacation"],"correctIndex":0,"explanation":"Everyone gets tired. Persistent cynicism and detachment are the distinctive early burnout markers."},
  {"type":"true_false","prompt":"Pushing through burnout without changing anything usually makes recovery take longer.","answer":true,"explanation":"Untreated burnout deepens. The earlier the intervention — workload, boundaries, support — the faster the recovery."}
]$json$::jsonb
from public.courses where slug = 'health'
on conflict (course_id, slug) do nothing;

-- ----------------------------------------------------------- relationships

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'boundaries-101', 'Saying no without the guilt', 'A boundary is about your behavior, not theirs.', 10, 1, $json$[
  {"type":"material","title":"What a boundary is (and isn't)","body":"A boundary is a statement about what YOU will do — not a demand that someone else change. 'If the yelling starts, I'm leaving the room' is a boundary. 'You're not allowed to yell' is an ultimatum you can't enforce.\n\nThat's why boundaries work: they only require your own follow-through. Say it calmly, once, and then actually do it."},
  {"type":"multiple_choice","prompt":"Which of these is a boundary, not an ultimatum?","options":["\"You can't talk to me like that\"","\"If the yelling starts, I'll leave the room\"","\"Stop being so sensitive\"","\"You need to change\""],"correctIndex":1,"explanation":"It states what the speaker will do. Enforceable by them alone — that's the test."},
  {"type":"true_false","prompt":"A boundary's job is to control the other person's behavior.","answer":false,"explanation":"It defines your own response. Control of others isn't possible; control of yourself is."}
]$json$::jsonb
from public.courses where slug = 'relationships'
on conflict (course_id, slug) do nothing;

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'fair-fighting', 'Disagree without the damage', 'Complaints, criticism, and the kitchen sink.', 10, 2, $json$[
  {"type":"material","title":"Complaint vs. criticism","body":"A complaint targets a behavior: 'I felt ignored when our plans changed without a heads-up.' Criticism targets the person: 'You're so selfish.' The first invites a fix; the second invites a counterattack.\n\nTwo more rules of a fair fight: stay on the one issue at hand (no kitchen-sinking every past mistake into it), and if either of you is flooded, take a real break and come back."},
  {"type":"multiple_choice","prompt":"Which opener gives the conversation the best chance?","options":["\"You always do this\"","\"I felt ignored when the plans changed without a heads-up\"","\"Everyone agrees you're difficult\"","\"Forget it, you wouldn't get it\""],"correctIndex":1,"explanation":"An 'I felt… when…' complaint names the behavior without attacking the person."},
  {"type":"true_false","prompt":"Bringing up every past mistake helps resolve the current disagreement.","answer":false,"explanation":"Kitchen-sinking guarantees nothing gets resolved. One issue at a time."}
]$json$::jsonb
from public.courses where slug = 'relationships'
on conflict (course_id, slug) do nothing;

-- ----------------------------------------------------------------- digital

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'password-hygiene', 'Passwords that actually protect', 'Length beats cleverness, and reuse is the killer.', 10, 1, $json$[
  {"type":"material","title":"What actually gets people hacked","body":"Most account takeovers aren't genius hacking — they're a password stolen from one leaked site being tried on every other site you use. That's why reuse is the cardinal sin, no matter how 'strong' the password.\n\nThe modern playbook: a long passphrase (length beats symbol soup), unique per site, stored in a password manager, with two-factor authentication on anything that matters."},
  {"type":"multiple_choice","prompt":"Which password is strongest?","options":["P@ssw0rd!","Your pet's name + birth year","A long random passphrase like \"copper-mango-violin-tuesday\"","Qwerty123!"],"correctIndex":2,"explanation":"Length is what makes passwords hard to crack — a four-word passphrase beats short symbol substitutions by orders of magnitude."},
  {"type":"true_false","prompt":"Reusing one strong password everywhere is safe.","answer":false,"explanation":"One site leaks, and attackers try that password everywhere. Unique per site is the rule."}
]$json$::jsonb
from public.courses where slug = 'digital'
on conflict (course_id, slug) do nothing;

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'spot-the-scam', 'Spot the scam', 'Urgency, weird payment, secrecy — the scam triangle.', 10, 2, $json$[
  {"type":"material","title":"The scam triangle","body":"Nearly every scam runs on the same three ingredients: manufactured urgency ('act in 10 minutes'), an unusual payment or action (gift cards, crypto, 'click this link'), and secrecy ('don't tell your bank').\n\nThe counter-move is always the same: slow down, and contact the organization through its official number or app — never through the link or number in the message itself."},
  {"type":"multiple_choice","prompt":"Your 'bank' texts: account locked, click this link within 10 minutes. Best move?","options":["Click fast — it expires!","Reply asking if it's real","Call the bank's official number from their website or card","Forward it to friends to check"],"correctIndex":2,"explanation":"Urgency + a link = the classic pattern. Verify through the official channel, never the message itself."},
  {"type":"true_false","prompt":"Legitimate companies never demand payment in gift cards.","answer":true,"explanation":"Gift cards are untraceable cash. Any 'official' demand for them is a scam, every time."}
]$json$::jsonb
from public.courses where slug = 'digital'
on conflict (course_id, slug) do nothing;

-- ------------------------------------------------------------------ career

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'six-second-resume', 'The six-second resume', 'What recruiters actually see before deciding.', 10, 1, $json$[
  {"type":"material","title":"Six seconds","body":"Eye-tracking studies put a recruiter's first scan of your resume at roughly six to seven seconds. They're not reading — they're pattern-matching: current title, company, dates, and whatever the top third of the page shouts.\n\nSo make the top third count: measurable impact ('cut onboarding time 40%'), not duties ('responsible for onboarding'). And tailor the keywords to each posting — the first reader is often software."},
  {"type":"multiple_choice","prompt":"Which resume bullet is strongest?","options":["\"Responsible for the onboarding process\"","\"Cut onboarding time 40% by automating the checklist\"","\"Hard-working team player\"","\"Did various tasks as assigned\""],"correctIndex":1,"explanation":"Action + measurable result. Numbers stop the six-second scan."},
  {"type":"true_false","prompt":"One generic resume sent to every job gets the best results.","answer":false,"explanation":"Keyword screening filters generic resumes out before a human ever looks. Tailor per role."}
]$json$::jsonb
from public.courses where slug = 'career'
on conflict (course_id, slug) do nothing;

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'salary-talk', 'Talking salary without sweating', 'Anchors, ranges, and the power of a pause.', 10, 2, $json$[
  {"type":"material","title":"The anchor","body":"In any negotiation, the first number named tends to anchor everything after it. That's why recruiters ask your expectations early — and why your best early move is to flip it: 'What's the budgeted range for this role?'\n\nIf you must name a number, research the market first and give the top of your researched range. Then stop talking. Silence after a number is negotiating, too."},
  {"type":"multiple_choice","prompt":"A recruiter asks your salary expectations in the first call. Strong move?","options":["Name the lowest number you'd accept","Ask what range is budgeted for the role","Apologize and avoid the topic","Say 'whatever is fair'"],"correctIndex":1,"explanation":"Flipping the question gets them to anchor first — and their floor is often above your guess."},
  {"type":"true_false","prompt":"The first number named usually anchors the rest of the negotiation.","answer":true,"explanation":"Anchoring is one of the most replicated effects in negotiation research. Use it deliberately."}
]$json$::jsonb
from public.courses where slug = 'career'
on conflict (course_id, slug) do nothing;

-- -------------------------------------------------------------------- home

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'read-the-lease', 'Read the lease like a lawyer', 'The four clauses that decide your year.', 10, 1, $json$[
  {"type":"material","title":"Four clauses that matter","body":"Before signing a lease, find these four things: the term and what breaking it costs, exactly what conditions get your deposit back, who pays for which repairs, and how much notice either side must give.\n\nThen photo-document every scratch on move-in day and email the photos to the landlord — that timestamped trail is what gets deposits returned."},
  {"type":"multiple_choice","prompt":"Which is MOST important to check before signing?","options":["The paint colors","The break clause — what leaving early costs you","Whether neighbors seem nice","If there's a gym nearby"],"correctIndex":1,"explanation":"Life changes — jobs, breakups, family. The break clause decides whether change costs you one month or the whole lease."},
  {"type":"true_false","prompt":"A landlord's verbal promise is as enforceable as the written lease.","answer":false,"explanation":"If it isn't in writing, it effectively doesn't exist. Get every promise into the lease or an email."}
]$json$::jsonb
from public.courses where slug = 'home'
on conflict (course_id, slug) do nothing;

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'fix-or-call', 'Fix it or call it in?', 'What''s yours, what''s the landlord''s, and the paper trail.', 10, 2, $json$[
  {"type":"material","title":"The renter's dividing line","body":"As a renter, small consumables are usually on you: light bulbs, smoke-detector batteries, air filters, a clogged drain you caused. Structural and systems problems — heating, plumbing, electrics, leaks, appliances that came with the place — are the landlord's.\n\nThe golden rule either way: report problems in writing (text or email), even after a phone call. A paper trail protects your deposit and creates legal obligations a phone call doesn't."},
  {"type":"multiple_choice","prompt":"The water heater dies. What do you do?","options":["Buy a new one yourself","Ignore it and shower cold","Report it to the landlord in writing — it's their repair","Deduct rent immediately without notice"],"correctIndex":2,"explanation":"Systems that came with the property are the landlord's responsibility. Written notice starts the clock."},
  {"type":"true_false","prompt":"Reporting maintenance issues by email or text creates a paper trail worth having.","answer":true,"explanation":"Disputes over repairs and deposits are won with timestamps, not memories."}
]$json$::jsonb
from public.courses where slug = 'home'
on conflict (course_id, slug) do nothing;

-- ----------------------------------------------------------------- cooking

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'pantry-foundations', 'Stock a pantry like a pro', 'Ten staples, dozens of dinners.', 10, 1, $json$[
  {"type":"material","title":"The ten staples","body":"With rice, pasta, beans, canned tomatoes, onions, garlic, a high-heat oil, salt, stock cubes, and a bag of frozen vegetables, you can improvise dozens of real meals without a recipe.\n\nFrozen vegetables deserve special defense: they're frozen at peak ripeness, often keeping more nutrients than 'fresh' produce that spent a week in transit — and they never rot in your drawer."},
  {"type":"multiple_choice","prompt":"Which combo is a complete, cheap dinner from staples?","options":["Rice + beans + onion + spices","Just plain pasta","Ketchup on bread","A stock cube dissolved in water"],"correctIndex":0,"explanation":"Rice and beans together form a complete protein — the backbone of half the world's home cooking."},
  {"type":"true_false","prompt":"Frozen vegetables are usually far less nutritious than fresh ones shipped for a week.","answer":false,"explanation":"Freezing at peak ripeness locks nutrients in; long-transit 'fresh' often loses more."}
]$json$::jsonb
from public.courses where slug = 'cooking'
on conflict (course_id, slug) do nothing;

insert into public.lessons (course_id, slug, title, description, xp_reward, sort_order, content)
select id, 'grocery-math', 'Grocery math', 'Unit prices, store brands, and the hungry-shopper tax.', 10, 2, $json$[
  {"type":"material","title":"Price per unit, not per package","body":"The sticker price lies; the unit price (per 100g or per liter, printed small on the shelf label) tells the truth. Bigger packs usually win — but not always, which is why the habit of checking matters.\n\nTwo more multipliers: store brands are often the same product as the name brand in different packaging, and shopping hungry reliably inflates your basket. Eat first, bring a list."},
  {"type":"multiple_choice","prompt":"500g of pasta costs $1.50; 1kg of the same pasta costs $2.40. Which is the better unit price?","options":["The 500g bag","The 1kg bag","They're identical","Impossible to tell"],"correctIndex":1,"explanation":"$1.50/500g = $3.00 per kg. The big bag at $2.40 per kg is 20% cheaper per unit."},
  {"type":"true_false","prompt":"Shopping while hungry tends to increase impulse purchases.","answer":true,"explanation":"It's one of the most consistent findings in consumer research. A snack before the store pays for itself."}
]$json$::jsonb
from public.courses where slug = 'cooking'
on conflict (course_id, slug) do nothing;
