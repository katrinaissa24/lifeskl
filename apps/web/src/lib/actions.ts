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

/** Switch the active course without leaving for the journey (used by the top bar). */
export async function setActiveCourse(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("course_enrollments")
    .upsert(
      { user_id: user.id, course_id: courseId },
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );
  await supabase
    .from("profiles")
    .update({ active_course_id: courseId })
    .eq("id", user.id);

  revalidatePath("/home");
  revalidatePath("/course");
}

/** Leave a course (settings only). Clears it as active if it was. */
export async function unenrollCourse(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("course_enrollments")
    .delete()
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  // If it was the active course, fall back to any other enrollment.
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_course_id")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { active_course_id: string | null } | null)?.active_course_id === courseId) {
    const { data: remaining } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("user_id", user.id)
      .limit(1);
    const fallback =
      (remaining as { course_id: string }[] | null)?.[0]?.course_id ?? null;
    await supabase
      .from("profiles")
      .update({ active_course_id: fallback })
      .eq("id", user.id);
  }

  revalidatePath("/settings");
  revalidatePath("/home");
  revalidatePath("/course");
}

/**
 * Finish onboarding: store the goal, enroll in the chosen courses, set the
 * first as active, flip the onboarded flag. Then off to the journey.
 */
export async function completeOnboarding(goal: string, courseIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (courseIds.length === 0) throw new Error("Pick at least one course.");

  await supabase.from("course_enrollments").upsert(
    courseIds.map((course_id) => ({ user_id: user.id, course_id })),
    { onConflict: "user_id,course_id", ignoreDuplicates: true },
  );

  await supabase
    .from("profiles")
    .update({
      goal: goal || null,
      onboarded: true,
      active_course_id: courseIds[0],
    })
    .eq("id", user.id);

  revalidatePath("/home");
  redirect("/home");
}

/** Send a friend request by username (via the 0003 RPC). Returns a status string. */
export async function sendFriendRequest(username: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("send_friend_request", {
    p_username: username.trim().toLowerCase(),
  });
  if (error) return "error";
  revalidatePath("/profile");
  return (data as string) ?? "error";
}

/** Accept or decline an incoming friend request. */
export async function respondToFriendRequest(
  requesterId: string,
  accept: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (accept) {
    await supabase
      .from("friendships")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("requester_id", requesterId)
      .eq("addressee_id", user.id);
  } else {
    await supabase
      .from("friendships")
      .delete()
      .eq("requester_id", requesterId)
      .eq("addressee_id", user.id);
  }
  revalidatePath("/notifications");
  revalidatePath("/profile");
}
