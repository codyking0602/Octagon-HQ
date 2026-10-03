import {
  WHEEL_FOOTBALL_ROSTER_SLOTS,
  type WheelFootballRosterSlot,
} from "./wheelFootballModel";

/**
 * Locked Wheel of Football grading contract.
 *
 * Grades represent how good the player/coach is RIGHT NOW, not career value.
 * They are calibrated across positions so every one of the seven Superteam
 * slots has equal weight in the matchup result. Actual candidate grades must
 * remain server-owned/private and must not be bundled into the picker.
 */
export const WHEEL_FOOTBALL_GRADE_BANDS = [
  { min: 98, max: 100, label: "Best in the NFL" },
  { min: 95, max: 97.5, label: "Elite" },
  { min: 92, max: 94.5, label: "High-end" },
  { min: 88, max: 91.5, label: "Very good" },
  { min: 84, max: 87.5, label: "Good starter" },
  { min: 80, max: 83.5, label: "Solid starter" },
  { min: 75, max: 79.5, label: "Below-average starter / useful player" },
  { min: 0, max: 74.5, label: "Weak Wheel selection" },
] as const;

export type WheelFootballGradeBand = (typeof WHEEL_FOOTBALL_GRADE_BANDS)[number]["label"];

export function isValidWheelFootballGrade(value: number) {
  return Number.isFinite(value)
    && value >= 0
    && value <= 100
    && Math.abs(value * 2 - Math.round(value * 2)) < Number.EPSILON * 8;
}

export function wheelFootballGradeBand(value: number): WheelFootballGradeBand | null {
  if (!isValidWheelFootballGrade(value)) return null;
  return WHEEL_FOOTBALL_GRADE_BANDS.find((band) => value >= band.min && value <= band.max)?.label ?? null;
}

export type WheelFootballSlotGrades = Readonly<Record<WheelFootballRosterSlot, number>>;

/**
 * Server scoring source of truth: simple equal-weight average of all 7 slots.
 * No QB premium, no positional multipliers, and Flex carries the player's
 * underlying current-ability grade rather than a separate Flex grade.
 */
export function wheelFootballRawTeamGrade(grades: WheelFootballSlotGrades): number {
  const values = WHEEL_FOOTBALL_ROSTER_SLOTS.map((slot) => grades[slot]);
  if (values.some((value) => !isValidWheelFootballGrade(value))) {
    throw new Error("Wheel of Football requires seven valid hidden grades.");
  }
  const raw = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(raw * 10) / 10;
}

/**
 * Presentation-only score curve calibrated for the wider current-NFL pool.
 * The raw seven-slot average still decides the winner.
 *
 * 75 -> 50, 80 -> 60, 85 -> 70, 90 -> 80, 95 -> 90, 100 -> 100.
 */
export function wheelFootballDisplayScore(rawGrade: number | null | undefined): number | null {
  if (rawGrade == null || !Number.isFinite(Number(rawGrade))) return null;
  return Math.max(0, Math.min(100, Math.round(Number(rawGrade) * 2 - 100)));
}
