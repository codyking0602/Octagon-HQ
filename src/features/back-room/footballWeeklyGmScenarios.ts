import type { WeeklyGmScenario } from "./footballWeeklyGmRepository";

/** Explicit, immutable QB assignments for each official Featured event. */
export function footballWeeklyGmScenarioForWeek(weekStart: string, scenario: WeeklyGmScenario) {
  if (weekStart === "2026-10-20") {
    return scenario === "elite"
      ? { title: "VETERAN FRANCHISE", quarterback: "Dak Prescott", playerId: "DAL|QB|dakprescott", development: "Guaranteed regression · 92 → 89" }
      : { title: "RISING FRANCHISE", quarterback: "Michael Penix Jr.", playerId: "ATL|QB|michaelpenix", development: "Guaranteed improvement · 78 → 83" };
  }
  // Historical October 13 run and isolated owner preview keep their original assignments.
  return scenario === "elite"
    ? { title: "ELITE FRANCHISE", quarterback: "Josh Allen", playerId: "BUF|QB|joshallen", development: "Steady development" }
    : { title: "YOUNG FRANCHISE", quarterback: "Jaxson Dart", playerId: "NYG|QB|jaxsondart", development: "Guaranteed breakout" };
}

export function footballWeeklyGmWeekLabel(weekStart: string) {
  const date = new Date(`${weekStart}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "This week";
  const ending = new Date(date);
  ending.setUTCDate(ending.getUTCDate() + 6);
  const startMonth = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const endMonth = ending.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return startMonth === endMonth
    ? `${startMonth} ${date.getUTCDate()}–${ending.getUTCDate()}`
    : `${startMonth} ${date.getUTCDate()}–${endMonth} ${ending.getUTCDate()}`;
}
