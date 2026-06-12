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
│   ├── web/            # Next.js web app — frontend + backend (API routes)
│   └── mobile/         # (later) Expo React Native app — iOS + Android
├── packages/
│   └── core/           # shared TypeScript: types, curriculum data, XP/streak logic
├── package.json        # workspace root + scripts
├── pnpm-workspace.yaml # tells pnpm where the workspaces are
└── tsconfig.base.json  # TS settings every package extends
```

### What is and isn't shared between web and mobile

This is the important mental model:

| Layer                              | Shared?  | Where it lives                         |
| ---------------------------------- | -------- | -------------------------------------- |
| Types, curriculum, business logic  | ✅ Yes   | `packages/core`                        |
| API / backend                      | ✅ Yes   | `apps/web/src/app/api` (both call it)  |
| UI components                      | ❌ No    | web uses HTML; mobile uses RN `<View>` |

Web React and React Native **do not share UI components** — `<div>` doesn't
exist in React Native. What you reuse is everything *underneath* the UI, which is
exactly what `packages/core` holds. That's where the real time savings are.

## Getting started

Prereqs: Node 20+ and pnpm (`npm install -g pnpm`).

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

- **Frontend** — `apps/web/src/app/page.tsx` renders the skill path;
  `apps/web/src/app/lesson/[lessonId]/` is the interactive lesson player.
- **Backend** — `apps/web/src/app/api/tracks` and `.../api/progress` are Next.js
  Route Handlers. This is your API. The mobile app will call these same URLs.
- **Shared core** — `packages/core` exports the `Track`/`Lesson`/`Exercise`
  types, the seed `TRACKS` curriculum, and pure functions like `completeLesson`
  and `levelInfo`. Both the frontend and the backend import from here, so they
  can never disagree about XP or streak math.

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

1. **Persistence** — swap the in-memory store in `api/progress` for a real
   database (Postgres + Prisma, or Supabase) and wire the lesson player to POST
   to it.
2. **Auth** — add accounts (e.g. NextAuth / Clerk / Supabase Auth) so progress
   is per-user.
3. **More content** — grow `packages/core/src/data/curriculum.ts`; consider
   moving it into the database.
4. **Mobile** — scaffold `apps/mobile` with Expo as described above.
