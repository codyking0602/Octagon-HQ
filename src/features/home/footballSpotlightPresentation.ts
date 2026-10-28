import type { FootballPlayerSpotlight } from "./footballPlayerSpotlightSchedule";

/** Shared view policy for scheduled and published weekly player spotlights. */
export function footballSpotlightForDisplay(spotlight: FootballPlayerSpotlight): FootballPlayerSpotlight {
  const totalMatch = spotlight.result.match(/\b(\d+)\s+TOTAL\s+TDS?\b/i);
  const total = totalMatch ? Number(totalMatch[1]) : null;
  const passing = Number(spotlight.stats.find((stat) => /^PASS(?:ING)?\s+TD/i.test(stat.label))?.value);
  return {
    ...spotlight,
    stats: spotlight.stats.map((stat) => stat.label.toUpperCase() === "INT" && stat.value === "0"
      && total !== null && Number.isFinite(passing) && total > passing
      ? { value: String(total - passing), label: "RUSH TD" } : stat),
    result: spotlight.result.replace(/\s*[·|]\s*\d+\s+TOTAL\s+TDS?\b/gi, "").trim(),
  };
}
