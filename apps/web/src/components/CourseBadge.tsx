// Placeholder course "logo": a colored rounded tile with the course's initial.
// Stands in until real per-course icons are uploaded. No emojis.
// Color is derived from the slug so each course is visually stable.

const PALETTE = [
  ["#efe9ff", "#4a2ed1"],
  ["#ffe6ee", "#c2185b"],
  ["#e3f5ec", "#1f8a5b"],
  ["#fff1d6", "#a86700"],
  ["#e6f0ff", "#2456c9"],
  ["#f1e6ff", "#7a2ed1"],
] as const;

function colorFor(slug: string): readonly [string, string] {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function CourseBadge({
  slug,
  title,
  size = 40,
}: {
  slug: string;
  title: string;
  size?: number;
}) {
  const [bg, fg] = colorFor(slug);
  const letter = title.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className="course-badge"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.46,
        borderRadius: Math.max(8, size * 0.24),
      }}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
