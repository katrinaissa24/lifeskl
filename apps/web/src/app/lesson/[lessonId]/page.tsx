import { notFound, redirect } from "next/navigation";
import { getLessonWithCourse } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { LessonPlayer } from "./LessonPlayer";

// Server component: loads the lesson (content blocks and all) from Supabase
// and hands it to the client-side player. In Next 15, `params` is a Promise.
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  if (!isSupabaseConfigured) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { lessonId } = await params;
  const found = await getLessonWithCourse(lessonId);
  if (!found) notFound();

  return <LessonPlayer course={found.course} lesson={found.lesson} />;
}
