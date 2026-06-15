import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { respondToFriendRequest } from "@/lib/actions";
import {
  DAILY_XP_GOAL,
  getCompletions,
  getCurrentUser,
  getFriendRequests,
  getProfile,
  xpEarnedToday,
} from "@/lib/data";

export const metadata: Metadata = { title: "Notifications — LIFESKL" };

function timeAgo(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, requests, completions] = await Promise.all([
    getProfile(user.id),
    getFriendRequests(user.id),
    getCompletions(user.id),
  ]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const xpToday = xpEarnedToday(completions, todayISO);
  const goalMet = xpToday >= DAILY_XP_GOAL;

  // Light, derived "system" nudges alongside real friend requests. (A full
  // notifications table can come later; this keeps the page useful now.)
  const systemNudges: { id: string; icon: "target" | "flame"; title: string; body: string }[] = [];
  if (!goalMet) {
    systemNudges.push({
      id: "daily-goal",
      icon: "target",
      title: "Daily goal not done yet",
      body: `${xpToday}/${DAILY_XP_GOAL} XP today — one quick lesson keeps the habit alive.`,
    });
  }
  if ((profile?.streakDays ?? 0) > 0 && !goalMet) {
    systemNudges.push({
      id: "streak",
      icon: "flame",
      title: `Protect your ${profile?.streakDays}-day streak`,
      body: "Finish a lesson today so your streak doesn't reset.",
    });
  }

  const empty = requests.length === 0 && systemNudges.length === 0;

  return (
    <>
      <div className="home-head">
        <div className="eyebrow">Notifications</div>
        <h1>Notifications</h1>
      </div>

      {empty ? (
        <div className="notif-empty">
          <div className="em">
            <Icon name="bell" size={56} strokeWidth={1.6} />
          </div>
          <h2 style={{ fontSize: "1.4rem", marginTop: 10 }}>You&apos;re all caught up</h2>
          <p className="muted" style={{ fontWeight: 500, marginTop: 6 }}>
            Friend requests and daily nudges will show up here.
          </p>
        </div>
      ) : (
        <div className="notif-list">
          {requests.map((req) => (
            <div className="card notif req" key={req.fromId}>
              <span className="n-ico">
                <Icon name="users" size={22} />
              </span>
              <div className="n-body">
                <b>@{req.fromUsername}</b> wants to be friends
                <span className="when">{timeAgo(req.createdAt)}</span>
              </div>
              <div className="n-acts">
                <form
                  action={async () => {
                    "use server";
                    await respondToFriendRequest(req.fromId, true);
                  }}
                >
                  <button type="submit" className="btn btn-accent btn-sm">
                    Accept
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await respondToFriendRequest(req.fromId, false);
                  }}
                >
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Decline
                  </button>
                </form>
              </div>
            </div>
          ))}

          {systemNudges.map((n) => (
            <Link href="/course" className="card notif" key={n.id}>
              <span className="n-ico">
                <Icon name={n.icon} size={22} />
              </span>
              <div className="n-body">
                <b>{n.title}</b>
                <span className="when" style={{ color: "var(--text-soft)" }}>
                  {n.body}
                </span>
              </div>
              <Icon name="chevron-right" size={18} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
