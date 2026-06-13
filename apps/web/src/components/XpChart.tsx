import type { XpDay } from "@lifeskl/core";

// Simple bar chart of XP per day (last N days). Pure markup — heights are
// percentages of the busiest day; the final bar is "today".
export function XpChart({ days }: { days: XpDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.xp));
  const total = days.reduce((s, d) => s + d.xp, 0);
  const dayLabel = (iso: string) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
      weekday: "narrow",
      timeZone: "UTC",
    });

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 4 }}>
        <span className="muted" style={{ fontWeight: 700, fontSize: ".85rem" }}>
          Last {days.length} days
        </span>
        <span style={{ fontWeight: 800, fontSize: ".85rem", color: "var(--accent-d)" }}>
          {total} XP
        </span>
      </div>
      <div className="xp-chart" role="img" aria-label={`XP earned per day; ${total} XP total over ${days.length} days`}>
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          const pct = Math.round((d.xp / max) * 100);
          return (
            <div className="xp-col" key={d.date}>
              {d.xp > 0 && <span className="val">{d.xp}</span>}
              <div
                className={`xp-bar${d.xp === 0 ? " empty" : ""}${isToday ? " today" : ""}`}
                style={{ height: `${d.xp === 0 ? 4 : Math.max(8, pct)}%` }}
                title={`${d.date}: ${d.xp} XP`}
              />
              <span className="day">{dayLabel(d.date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
