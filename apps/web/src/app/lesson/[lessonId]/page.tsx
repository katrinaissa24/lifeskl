import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getLessonWithCourse } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LessonPlayer } from "./LessonPlayer";

// Server component: loads the lesson (content blocks and all) from Supabase
// and hands it to the client-side player. In Next 15, `params` is a Promise.
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  if (!isSupabaseConfigured) redirect("/login");

  // Auth check and the (cached, public) lesson fetch run together — no waterfall.
  const { lessonId } = await params;
  const [user, found] = await Promise.all([
    getCurrentUser(),
    getLessonWithCourse(lessonId),
  ]);
  if (!user) redirect("/login");
  if (!found) notFound();

  return <LessonPlayer course={found.course} lesson={found.lesson} />;
}
