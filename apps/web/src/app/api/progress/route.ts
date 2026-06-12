import { NextResponse } from "next/server";
import {
  EMPTY_PROGRESS,
  completeLesson,
  getLesson,
  type UserProgress,
} from "@lifeskl/core";

// ⚠️ In-memory demo store. It resets on every server restart and is shared by
// all callers (no per-user accounts yet). This is a placeholder to show WHERE
// server-side persistence lives — replace with a real database + auth before
// shipping (see README "Next steps").
let progress: UserProgress = { ...EMPTY_PROGRESS };

// GET /api/progress -> current progress
export async function GET() {
  return NextResponse.json(progress);
}

// POST /api/progress  body: { lessonId: string, date?: "YYYY-MM-DD" }
//   -> marks the lesson complete and returns the updated progress.
// Note it reuses completeLesson() from @lifeskl/core — the exact same logic the
// client uses, so frontend and backend can never disagree about XP or streaks.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    lessonId?: string;
    date?: string;
  } | null;

  if (!body?.lessonId) {
    return NextResponse.json(
      { error: "lessonId is required" },
      { status: 400 },
    );
  }

  const found = getLesson(body.lessonId);
  if (!found) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const today = body.date ?? new Date().toISOString().slice(0, 10);
  progress = completeLesson(progress, found.lesson, today);
  return NextResponse.json(progress);
}
