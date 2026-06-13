import Link from "next/link";
import type { Friend } from "@lifeskl/core";
import { Icon } from "./Icon";

// Friend pills shown under the name on a profile. Each links to that person's
// public profile.
export function FriendsList({ friends }: { friends: Friend[] }) {
  if (friends.length === 0) {
    return (
      <p className="muted" style={{ fontWeight: 500, fontSize: ".9rem", marginTop: 8 }}>
        No friends yet — add someone by their username to compare streaks.
      </p>
    );
  }
  return (
    <div className="friends-strip">
      {friends.map((f) => (
        <Link href={`/u/${f.username}`} className="friend-pill" key={f.id}>
          <span className="av">{f.username.charAt(0).toUpperCase()}</span>
          @{f.username}
          <span className="fxp">
            <Icon name="bolt" size={13} style={{ verticalAlign: "-2px" }} /> {f.xp}
          </span>
        </Link>
      ))}
    </div>
  );
}
