// Public surface of @lifeskl/core.
// Both the web app (apps/web) and the future mobile app (apps/mobile) import
// from here. Keep everything in this package platform-agnostic: no React,
// no Next.js, no DOM, no React Native.
export * from "./types";
export * from "./data/curriculum";
export * from "./logic/xp";
