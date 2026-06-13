"use client";

import { useState, useTransition } from "react";
import { sendFriendRequest } from "@/lib/actions";

const MESSAGES: Record<string, string> = {
  sent: "Request sent!",
  exists: "You're already connected (or have a pending request).",
  self: "That's you. 🙂",
  not_found: "No user with that username.",
  error: "Something went wrong — try again.",
};

export function AddFriend() {
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const handle = username.trim().toLowerCase();
    if (!handle || pending) return;
    startTransition(async () => {
      const result = await sendFriendRequest(handle);
      setOk(result === "sent");
      setMsg(MESSAGES[result] ?? MESSAGES.error);
      if (result === "sent") setUsername("");
    });
  }

  return (
    <div>
      <form className="add-friend" onSubmit={submit}>
        <input
          className="input"
          placeholder="friend's username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"));
            setMsg(null);
          }}
          aria-label="Friend's username"
        />
        <button type="submit" className="btn btn-accent" disabled={pending || !username.trim()}>
          {pending ? "Sending…" : "Add"}
        </button>
      </form>
      {msg && (
        <p style={{ marginTop: 8, fontWeight: 700, fontSize: ".88rem", color: ok ? "var(--good)" : "var(--text-soft)" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
