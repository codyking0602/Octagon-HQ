import type { WeeklyGmAttempt, WeeklyGmScenario, WeeklyGmStanding } from "./footballWeeklyGmRepository";

/** All opponents share the same per-franchise score reveal policy. */
export function canViewWeeklyGmScenario(
  attempts: Partial<Record<WeeklyGmScenario, WeeklyGmAttempt>>,
  scenario: WeeklyGmScenario,
  preview = false,
) {
  return preview || attempts[scenario]?.completed === true;
}

export function canViewWeeklyGmTotal(
  attempts: Partial<Record<WeeklyGmScenario, WeeklyGmAttempt>>,
  preview = false,
) {
  return canViewWeeklyGmScenario(attempts, "elite", preview)
    && canViewWeeklyGmScenario(attempts, "young", preview);
}

/** A row offers a drill-down only for a scored run the viewer may reveal. */
export function canViewWeeklyGmStandingResult(
  standing: WeeklyGmStanding,
  attempts: Partial<Record<WeeklyGmScenario, WeeklyGmAttempt>>,
  scenario: WeeklyGmScenario,
  archived = false,
  preview = false,
) {
  const score = scenario === "elite" ? standing.elite_score : standing.young_score;
  return score != null && (archived || canViewWeeklyGmScenario(attempts, scenario, preview));
}
