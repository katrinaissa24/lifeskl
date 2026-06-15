import type { Metadata } from "next";
import { CourseExperience } from "./CourseExperience";

export const metadata: Metadata = { title: "Course — LIFESKL" };

// Local-first: the journey renders from the bundled catalog and browser-local
// progress, so it always loads instantly and the top switcher works on the
// spot — no Supabase session required.
export default function CoursePage() {
  return <CourseExperience />;
}
