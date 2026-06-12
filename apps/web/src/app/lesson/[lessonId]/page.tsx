import { notFound } from "next/navigation";
import { getLesson } from "@lifeskl/core";
import { LessonPlayer } from "./LessonPlayer";

// Server component: resolves the lesson from the shared curriculum, then hands
// it to the client-side player. In Next 15, `params` is a Promise.
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const found = getLesson(lessonId);
  if (!found) notFound();

  return <LessonPlayer track={found.track} lesson={found.lesson} />;
}
