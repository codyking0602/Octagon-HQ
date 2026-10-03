import currentCfbPriorityJson from "../../../data/generated/football/cfb/wheel-football-current-priorities-2026.json";

export const WHEEL_FOOTBALL_CFB_BASELINE_SLOTS = [
  "QB",
  "RB",
  "WR",
  "TE",
  "Flex",
  "Front Seven",
  "Secondary",
  "Head Coach",
] as const;

export type WheelFootballCfbBaselineSlot =
  (typeof WHEEL_FOOTBALL_CFB_BASELINE_SLOTS)[number];

export const WHEEL_FOOTBALL_CFB_BASELINE_CAPS: Readonly<
  Record<WheelFootballCfbBaselineSlot, number>
> = {
  QB: 2,
  RB: 3,
  WR: 4,
  TE: 2,
  Flex: 4,
  "Front Seven": 6,
  Secondary: 6,
  "Head Coach": 1,
};

export interface WheelFootballCfbReconciliationWarning {
  sourceName: string;
  reason: string;
}

export type WheelFootballCfbBaselineTeam = {
  school: string;
  conference: "SEC" | "Big Ten" | "Big 12" | "ACC" | "Independent";
  espnId: string;
  depthChartUrl: string;
  rosterUrl: string;
  QB: readonly string[];
  RB: readonly string[];
  WR: readonly string[];
  TE: readonly string[];
  Flex: readonly string[];
  "Front Seven": readonly string[];
  Secondary: readonly string[];
  "Head Coach": readonly string[];
  reconciliationWarnings: readonly WheelFootballCfbReconciliationWarning[];
};

type WheelFootballCfbBaselineJson = {
  source: string;
  sourceUrl: string;
  espnSourceTemplate: string;
  generatedAt: string;
  season: number;
  status: "generated-baseline-pending-manual-conference-audit";
  notes: string;
  caps: Readonly<Record<string, number>>;
  teamCount: number;
  teams: Record<string, WheelFootballCfbBaselineTeam>;
};

const baseline = currentCfbPriorityJson as unknown as WheelFootballCfbBaselineJson;

/**
 * Step 2 is intentionally a curation baseline, not runtime launch authority.
 * Step 3 must manually audit each conference for football importance before
 * any CFB Wheel mode consumes these priorities in gameplay.
 */
export const WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY = false as const;

export const wheelFootballCfbBaselineAudit = {
  source: baseline.source,
  sourceUrl: baseline.sourceUrl,
  espnSourceTemplate: baseline.espnSourceTemplate,
  generatedAt: baseline.generatedAt,
  season: baseline.season,
  status: baseline.status,
  notes: baseline.notes,
  teamCount: baseline.teamCount,
  launchReady: WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY,
} as const;

export const wheelFootballCfbBaseline: Readonly<
  Record<string, WheelFootballCfbBaselineTeam>
> = baseline.teams;

export function wheelFootballCfbBaselineForSchoolId(
  schoolId: string | null | undefined,
) {
  if (!schoolId) return null;
  return wheelFootballCfbBaseline[schoolId.trim().toLowerCase()] ?? null;
}

export function normalizedWheelFootballCfbName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function wheelFootballCfbNamesMatch(left: string, right: string) {
  return normalizedWheelFootballCfbName(left) === normalizedWheelFootballCfbName(right);
}
