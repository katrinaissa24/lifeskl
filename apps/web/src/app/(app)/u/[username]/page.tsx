import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { levelInfo } from "@lifeskl/core";
import { FriendsList } from "@/components/FriendsList";
import { Icon, type IconName } from "@/components/Icon";
import { XpChart } from "@/components/XpChart";
import {
  getFriends,
  getProfile,
  getProfileByUsername,
  getXpPerDay,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} — LIFESKL` };
}

function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <div className="card stat-card">
      <span className="big">
        <Icon name={icon} size={26} strokeWidth={2.4} /> {value}
      </span>
      <span className="lbl">{label}</span>
    </div>
  );
}

// A public profile — what friends (or anyone signed in) see. Stats that live on
// the profile row (level/streak/XP) plus the activity chart and friends, all of
// which are world-readable to signed-in users.
export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { username } = await params;
  const me = await getProfile(user.id);
  if (me?.username === username.toLowerCase()) redirect("/profile");

  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [friends, xpDays] = await Promise.all([
    getFriends(profile.id),
    getXpPerDay(profile.id, 14),
  ]);

  const { level, xpIntoLevel, xpForNextLevel, progressPct } = levelInfo(profile.xp);
  const joined = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <div className="prof-head">
        <span className="avatar xl">{profile.username.charAt(0).toUpperCase()}</span>
        <div>
          <h1>@{profile.username}</h1>
          {joined && <p className="joined">Learning since {joined}</p>}
          {profile.goal && (
            <p className="joined" style={{ color: "var(--accent-d)", fontWeight: 700 }}>
              Goal: {profile.goal}
            </p>
          )}
        </div>
        <div className="prof-actions">
          <span className="chip chip-accent">Level {level}</span>
        </div>
      </div>

      <section className="home-sec" style={{ marginTop: 22 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="users" size={20} /> Friends
        </h3>
        <FriendsList friends={friends} />
      </section>

      <div className="level-strip" style={{ marginTop: 26 }}>
        <div className="meta">
          <span>Level {level}</span>
          <span>
            {xpForNextLevel === null
              ? "Max level"
              : `${xpIntoLevel}/${xpForNextLevel} XP to level ${level + 1}`}
          </span>
        </div>
        <div className="track-bar">
          <i style={{ width: `${Math.round(progressPct * 100)}%` }} />
        </div>
      </div>

      <section className="home-sec">
        <h3>Activity</h3>
        <div className="card card-pad">
          <XpChart days={xpDays} />
        </div>
      </section>

      <div className="stat-grid">
        <Stat icon="flame" value={String(profile.streakDays)} label="day streak" />
        <Stat icon="bolt" value={String(profile.xp)} label="total XP" />
        <Stat icon="medal" value={`Lv ${level}`} label="level" />
      </div>
    </>
  );
}
