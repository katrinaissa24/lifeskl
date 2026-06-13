"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Enroll in (or switch to) a course: records the enrollment and makes it the
 * active course, then sends the learner to its journey page.
 */
export async function enrollInCourse(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: enrollError } = await supabase
    .from("course_enrollments")
    .upsert(
      { user_id: user.id, course_id: courseId },
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );
  if (enrollError) throw new Error(`Could not enroll: ${enrollError.message}`);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ active_course_id: courseId })
    .eq("id", user.id);
  if (profileError)
    throw new Error(`Could not switch course: ${profileError.message}`);

  revalidatePath("/home");
  revalidatePath("/course");
  redirect("/course");
}
