# LifeSkl — Duolingo for life skills

A bite-sized lessons app for the practical stuff school skipped: money, cooking,
adulting, and more. Web today, mobile (iOS + Android) later — from one codebase.

## Why a monorepo?

The whole point of this layout is **"build web now, add mobile later without a
rewrite."** A monorepo lets the web app and the future mobile app import the
same shared package.

```
lifeskl/
├── apps/
│   ├── web/            # Next.js web app (landing, auth, dashboard, lessons)
│   └── mobile/         # (later) Expo React Native app — iOS + Android
├── packages/
│   └── core/           # shared TypeScript: domain types + XP/streak logic
├── supabase/
│   ├── migrations/     # SQL schema (run in the Supabase SQL Editor)
│   └── seed.sql        # starter courses + lessons
├── package.json        # workspace root + scripts
├── pnpm-workspace.yaml # tells pnpm where the workspaces are
└── tsconfig.base.json  # TS settings every package extends
```

### What is and isn't shared between web and mobile

This is the important mental model:

| Layer                              | Shared?  | Where it lives                         |
| ---------------------------------- | -------- | -------------------------------------- |
| Types, XP/streak logic             | ✅ Yes   | `packages/core`                        |
| Backend (DB, auth, RLS)            | ✅ Yes   | Supabase (both clients call it)        |
| UI components                      | ❌ No    | web uses HTML; mobile uses RN `<View>` |

Web React and React Native **do not share UI components** — `<div>` doesn't
exist in React Native. What you reuse is everything *underneath* the UI, which is
exactly what `packages/core` holds. That's where the real time savings are.

## Getting started

Prereqs: Node 20+, pnpm (`npm install -g pnpm`), and a free Supabase project.

1. **Connect Supabase** — copy `apps/web/.env.example` to `apps/web/.env.local`
   and fill in your Project URL and anon/publishable key (Supabase Dashboard →
   Project Settings → API).
2. **Create the schema** — in the Supabase SQL Editor, run
   `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. **Run it:**

```bash
pnpm install            # install everything for all workspaces
pnpm dev                # start the web app at http://localhost:3000
```

Other scripts (from the repo root):

```bash
pnpm build              # production build of the web app
pnpm typecheck          # type-check every package
```

## How it's wired

- **Design system** — the "Grape" theme lives in
  `apps/web/src/app/globals.css`: design tokens + component primitives
  (buttons, cards, chips, lesson UI), also mapped into Tailwind utilities.
  Every new screen should build from these.
- **Frontend** — `/` is the marketing landing page; `/dashboard` is the
  signed-in classroom (courses + lessons from the DB);
  `/lesson/[lessonId]` plays a lesson's content blocks.
- **Backend** — Supabase: Postgres (courses, lessons, profiles, friendships,
  all behind row-level security) + Auth (email/password; a DB trigger
  auto-creates a profile on signup). The schema lives in
  `supabase/migrations/`.
- **Lesson content** — each lesson's `content` column is a JSONB array of
  blocks (`material`, `multiple_choice`, `true_false`, …) so one lesson can
  mix enriched reading with interactive questions. New delivery formats are
  new block types — no schema change.
- **Shared core** — `packages/core` exports the domain types and pure
  XP/level/streak math. The future mobile app imports the same package and
  talks to the same Supabase project.

## Adding the mobile app (when you're ready)

You do **not** touch `apps/web` to go mobile. You add a sibling:

```bash
cd apps
pnpm create expo-app mobile      # Expo = the standard way to build RN apps
```

Then in `apps/mobile/package.json`, add the shared package:

```json
"dependencies": { "@lifeskl/core": "workspace:*" }
```

Now the mobile app can `import { TRACKS, completeLesson } from "@lifeskl/core"`
— the same data and logic the website uses. You rebuild only the **screens** in
React Native components, and point the app at your deployed API URL.

### How iOS / Android actually happen

You write **one** React Native codebase in `apps/mobile`. Expo turns it into
both native apps:

- **`npx expo start`** → live preview on your phone via the Expo Go app, or in
  the iOS Simulator / Android Emulator. Great for day-to-day development.
- **`eas build --platform ios`** and **`--platform android`** → Expo's cloud
  build service (EAS) produces a real `.ipa` (iOS) and `.aab` (Android). You
  don't need a Mac for the Android build; iOS App Store submission does require
  an Apple Developer account ($99/yr). Android needs a Google Play account
  (one-time $25).

So: one RN codebase → Expo builds both platforms → you submit to the App Store
and Play Store. No separate "iOS folder" and "Android folder" to maintain by
hand.

## Next steps (roughly in order)

1. **Progress tracking** — a `lesson_completions` table + a security-definer
   RPC that awards XP and feeds the streak when a lesson is finished (the
   player UI is already in place; it just doesn't persist yet).
2. **Friends UI** — search profiles, send/accept requests (the `friendships`
   table and its RLS policies are ready).
3. **More content & block types** — grow the catalog in the DB; add new
   lesson block types (ordering, matching, fill-in-the-blank) to
   `packages/core` and the player.
4. **Mobile** — scaffold `apps/mobile` with Expo as described above.
