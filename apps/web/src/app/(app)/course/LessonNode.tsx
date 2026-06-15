"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { JourneyLesson } from "@/lib/journey";
import { Icon } from "@/components/Icon";

// A journey node built like a 3D button. Done / current / locked all share the
// same construction — only the color changes. Clicking a playable node fires a
// visible press animation, then navigates; a locked node just bumps.

const WAVE = [0, 56, 84, 56, 0, -56, -84, -56];

export function LessonNode({
  lesson,
  index,
  showStartChip,
}: {
  lesson: JourneyLesson;
  index: number;
  showStartChip: boolean;
}) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const [bump, setBump] = useState(false);
  const offset = WAVE[index % WAVE.length];

  const icon =
    lesson.state === "done" ? "check" : lesson.state === "current" ? "play" : "lock";

  function handleClick() {
    if (lesson.state === "locked") {
      setBump(true);
      setTimeout(() => setBump(false), 320);
      return;
    }
    // play the press, then navigate so the click is actually felt
    setPressed(true);
    setTimeout(() => router.push(`/lesson/${lesson.id}`), 150);
  }

  return (
    <div className="j-row">
      <div className="j-node" style={{ transform: `translateX(${offset}px)` }}>
        <button
          type="button"
          onClick={handleClick}
          aria-label={
            lesson.state === "locked"
              ? `${lesson.title} (locked)`
              : `${lesson.state === "done" ? "Review" : "Start"} ${lesson.title}`
          }
          className={[
            "j-btn",
            lesson.state,
            pressed ? "pressed" : "",
            bump ? "bump" : "",
          ].join(" ")}
        >
          {showStartChip && <span className="j-start-chip">Start here</span>}
          <Icon name={icon} size={30} />
        </button>
        <span className="j-title">{lesson.title}</span>
        <span className="j-xp">
          {lesson.state === "done"
            ? "Completed · tap to review"
            : lesson.state === "locked"
              ? "Locked"
              : `+${lesson.xpReward} XP`}
        </span>
      </div>
    </div>
  );
}
