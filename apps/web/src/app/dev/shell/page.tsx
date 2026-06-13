import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";

// DEV ONLY: renders the signed-in shell with mock data so the sidebar /
// bottom nav can be checked without auth or a database.
export default function DevShellPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <AppShell username="preview" streakDays={4} xp={120}>
      <div className="home-head">
        <div className="eyebrow">Dev preview</div>
        <h1>
          Hey, <span className="accent-word">@preview</span>.
        </h1>
      </div>
      <div className="continue-card">
        <span className="emoji">💵</span>
        <div className="grow">
          <div className="eyebrow" style={{ color: "rgba(255,255,255,.8)" }}>
            Continue · Personal Finance
          </div>
          <h2>What is a budget (and why you need one)</h2>
          <p className="sub">Give every dollar a job before the month starts. · +20 XP</p>
          <div className="track-bar thin">
            <i style={{ width: "23%" }} />
          </div>
        </div>
        <Link className="btn btn-lg" href="/dev/preview/what-is-a-budget">
          Keep going →
        </Link>
      </div>
      <div className="stat-grid">
        <div className="card stat-card">
          <span className="big">🔥 4</span>
          <span className="lbl">day streak</span>
        </div>
        <div className="card stat-card">
          <span className="big">⚡ 120</span>
          <span className="lbl">total XP</span>
        </div>
        <div className="card stat-card">
          <span className="big">📚 3</span>
          <span className="lbl">lessons done</span>
        </div>
        <div className="card stat-card">
          <span className="big">🎯 92%</span>
          <span className="lbl">accuracy</span>
        </div>
      </div>
    </AppShell>
  );
}
