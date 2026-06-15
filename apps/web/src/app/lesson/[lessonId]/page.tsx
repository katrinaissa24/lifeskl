import { notFound } from "next/navigation";
import { getLessonWithCourse } from "@/lib/data";
import { getLocalLesson, isLocalLessonId } from "@/lib/localCatalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { LessonPlayer } from "./LessonPlayer";

// Loads a lesson for the player. Lessons reached from the (local-first) course
// journey carry ids like "course__lesson" and always play offline from the
// bundled catalog. Real database lessons are used when a session is healthy,
// but any miss falls back to the local copy instead of bouncing to /login.
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  if (isLocalLessonId(lessonId)) {
    const local = await getLocalLesson(lessonId);
    if (!local) notFound();
    return <LessonPlayer course={local.course} lesson={local.lesson} />;
  }

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const found = await getLessonWithCourse(lessonId);
      if (found) {
        return <LessonPlayer course={found.course} lesson={found.lesson} />;
      }
    }
  }

  const local = await getLocalLesson(lessonId);
  if (local) return <LessonPlayer course={local.course} lesson={local.lesson} />;
  notFound();
}
