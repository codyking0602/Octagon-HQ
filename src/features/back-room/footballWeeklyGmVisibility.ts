import type { WeeklyGmAttempt, WeeklyGmScenario } from "./footballWeeklyGmRepository";

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
