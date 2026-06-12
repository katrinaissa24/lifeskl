// Public surface of @lifeskl/core.
// Both the web app (apps/web) and the future mobile app (apps/mobile) import
// from here. Keep everything in this package platform-agnostic: no React,
// no Next.js, no DOM, no React Native.
//
// Course/lesson content itself lives in Supabase (see /supabase); this package
// holds the shared types for that data plus pure game logic (XP, levels,
// streaks).
export * from "./types";
export * from "./logic/xp";
