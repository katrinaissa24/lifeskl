import Link from "next/link";

/** Signed-in top bar: logo, streak, XP, avatar, sign out. */
export function AppNav({
  username,
  streakDays,
  xp,
}: {
  username: string;
  streakDays: number;
  xp: number;
}) {
  return (
    <nav className="nav nav-app">
      <div className="wrap nav-inner">
        <Link className="logo" href="/dashboard">
          <span className="dot" />
          LIFE<em>SKL</em>
        </Link>
        <div className="nav-links">
          <span className="streak" title="Day streak">🔥 {streakDays}</span>
          <span className="chip chip-accent hide-sm" title="Total XP">⚡ {xp} XP</span>
          <span className="avatar" title={`@${username}`}>
            {username.charAt(0).toUpperCase()}
          </span>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost btn-sm" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
