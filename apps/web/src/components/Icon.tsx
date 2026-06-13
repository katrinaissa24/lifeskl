import type { CSSProperties } from "react";

// Stroke-based icon set — currentColor, so they inherit text color and the
// Grape weight. Replaces every emoji used as UI chrome. (Course logos are a
// separate thing the user uploads; see CourseBadge.)

export type IconName =
  | "home"
  | "map"
  | "user"
  | "bell"
  | "flame"
  | "bolt"
  | "gear"
  | "play"
  | "check"
  | "lock"
  | "plus"
  | "chevron-down"
  | "chevron-right"
  | "target"
  | "book"
  | "sun"
  | "moon"
  | "logout"
  | "trophy"
  | "x"
  | "trash"
  | "medal"
  | "users";

const PATHS: Record<IconName, React.ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" />,
  map: (
    <>
      <path d="M9 4 3.5 6.2v13.3L9 17.3l6 2.2 5.5-2.2V3.7L15 5.9 9 3.7Z" />
      <path d="M9 3.7v13.6M15 5.9v13.6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c0-3.2 2.7-5 6-5s6 1.8 6 5" />
      <path d="M16 5.2A3.2 3.2 0 0 1 16 11M18 19c0-2.6-1.3-4.2-3-4.8" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  flame: (
    <path d="M12 3c1 3-2 4-2 7a2.2 2.2 0 0 0 4.2.9C16 13 14 9 12 3Zm0 18a6 6 0 0 1-6-6c0-3 2-5 3-7 .3 3 2 4 3.5 5.2C18 14 18 21 12 21Z" />
  ),
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />,
  check: <path d="M5 12.5 10 17l9-10" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5h9a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H5Z" />
      <path d="M5 4.5V20" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />,
  logout: (
    <>
      <path d="M14 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H14" />
      <path d="M16 8.5 19.5 12 16 15.5M9 12h10.5" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4.5h10V9a5 5 0 0 1-10 0Z" />
      <path d="M7 5.5H4.5V7A2.5 2.5 0 0 0 7 9.5M17 5.5h2.5V7A2.5 2.5 0 0 1 17 9.5M10 14.5h4M9 20h6M12 14.5V18" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="14" r="5" />
      <path d="M9 9 7 3h4l1.5 3M15 9l2-6h-4l-1.5 3" />
      <path d="M12 12.2 13 14h1.8l-1.4 1.2.5 1.8-1.9-1.1-1.9 1.1.5-1.8L9.2 14H11Z" fill="currentColor" stroke="none" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  trash: (
    <>
      <path d="M4.5 7h15M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  className,
  style,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
