"use client";

// Browser-local course progress. Keeps the course journey and switcher working
// without a Supabase session: which course you're on and which lessons you've
// finished live in localStorage, keyed per-device. When a real session exists
// the lesson player still records completions to the database too.

const ACTIVE_KEY = "lifeskl.activeCourse";
const DONE_KEY = "lifeskl.completedLessons";
const EVENT = "lifeskl:progress";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
    // Let other components on the page react immediately (same-tab updates
    // don't fire the native `storage` event).
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Private mode / storage disabled — degrade to in-memory for this view.
  }
}

export function getActiveCourseSlug(): string | null {
  return read(ACTIVE_KEY);
}

export function setActiveCourseSlug(slug: string): void {
  write(ACTIVE_KEY, slug);
}

export function getCompletedLessonIds(): string[] {
  const raw = read(DONE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function markLessonComplete(lessonId: string): void {
  const done = new Set(getCompletedLessonIds());
  if (done.has(lessonId)) return;
  done.add(lessonId);
  write(DONE_KEY, JSON.stringify([...done]));
}

/** Subscribe to local progress changes (same-tab + cross-tab). Returns an unsubscribe. */
export function subscribeProgress(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", fn);
  };
}
