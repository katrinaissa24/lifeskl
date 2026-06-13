"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type Theme = "light" | "dark";

// Reads/writes the theme on <html data-theme> and localStorage. The initial
// value is applied pre-paint by an inline script in the root layout, so there's
// no flash; this just keeps the toggle in sync after hydration.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as Theme | undefined) ?? "light";
    setTheme(current);
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("lifeskl-theme", next);
    } catch {
      /* private mode — fine */
    }
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      <button
        type="button"
        className={theme === "light" ? "active" : ""}
        onClick={() => apply("light")}
        aria-pressed={theme === "light"}
      >
        <Icon name="sun" size={18} /> Light
      </button>
      <button
        type="button"
        className={theme === "dark" ? "active" : ""}
        onClick={() => apply("dark")}
        aria-pressed={theme === "dark"}
      >
        <Icon name="moon" size={18} /> Dark
      </button>
    </div>
  );
}
