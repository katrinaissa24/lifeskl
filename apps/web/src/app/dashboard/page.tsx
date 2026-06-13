import { redirect } from "next/navigation";

// The old single-page dashboard grew into a real app: /home (progress),
// /course (journey), /profile (stats). Keep the URL alive for old links.
export default function DashboardPage() {
  redirect("/home");
}
