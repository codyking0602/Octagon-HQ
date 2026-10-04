import currentCfbPriorityJson from "../../../data/generated/football/cfb/wheel-football-current-priorities-2026.json";
import auditedCfbPriorityJson from "../../../data/curated/football/cfb/wheel-football-priority-audit-2026-10-03.json";

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

type WheelFootballCfbPriorityOverride = Partial<
  Pick<
    WheelFootballCfbBaselineTeam,
    "QB" | "RB" | "WR" | "TE" | "Flex" | "Front Seven" | "Secondary" | "Head Coach"
  >
>;

type WheelFootballCfbPriorityAuditJson = {
  season: number;
  auditedAt: string;
  status: "manually-audited-current-priorities";
  notes: string;
  teamCount: number;
  teamsChanged: number;
  groupsChanged: number;
  overrides: Record<string, WheelFootballCfbPriorityOverride>;
};

const baseline = currentCfbPriorityJson as unknown as WheelFootballCfbBaselineJson;
const priorityAudit = auditedCfbPriorityJson as unknown as WheelFootballCfbPriorityAuditJson;

function mergeAuditedPriority(
  team: WheelFootballCfbBaselineTeam,
  override: WheelFootballCfbPriorityOverride | undefined,
): WheelFootballCfbBaselineTeam {
  if (!override) return team;
  return {
    ...team,
    ...override,
  };
}

/**
 * Step 3 is complete: the 68-school candidate population and football-importance
 * ordering have been manually audited conference by conference.
 *
 * The audited population and all seven grade families are now complete and wired
 * into the shared Wheel runtime. These flags represent the current launch-ready
 * 2026 CFB authority rather than the earlier population-only checkpoint.
 */
export const WHEEL_FOOTBALL_CFB_PRIORITY_AUDIT_COMPLETE = true as const;
export const WHEEL_FOOTBALL_CFB_GRADING_COMPLETE = true as const;
export const WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY = true as const;

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

export const wheelFootballCfbPriorityAudit = {
  auditedAt: priorityAudit.auditedAt,
  season: priorityAudit.season,
  status: priorityAudit.status,
  notes: priorityAudit.notes,
  teamCount: priorityAudit.teamCount,
  teamsChanged: priorityAudit.teamsChanged,
  groupsChanged: priorityAudit.groupsChanged,
  auditComplete: WHEEL_FOOTBALL_CFB_PRIORITY_AUDIT_COMPLETE,
  gradingComplete: WHEEL_FOOTBALL_CFB_GRADING_COMPLETE,
  launchReady: WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY,
} as const;

/**
 * Step 2 provenance. Keep this raw generated baseline available for future audits
 * so reviewed changes can always be diffed against the source-derived starting point.
 */
export const wheelFootballCfbBaseline: Readonly<
  Record<string, WheelFootballCfbBaselineTeam>
> = baseline.teams;

/**
 * Step 3 authority. Any later CFB Wheel grading/runtime work should use this
 * manually audited candidate order, not the generated baseline.
 */
export const wheelFootballCfbPriority: Readonly<
  Record<string, WheelFootballCfbBaselineTeam>
> = Object.freeze(Object.fromEntries(
  Object.entries(baseline.teams).map(([schoolId, team]) => [
    schoolId,
    mergeAuditedPriority(team, priorityAudit.overrides[schoolId]),
  ]),
));

export function wheelFootballCfbBaselineForSchoolId(
  schoolId: string | null | undefined,
) {
  if (!schoolId) return null;
  return wheelFootballCfbBaseline[schoolId.trim().toLowerCase()] ?? null;
}

export function wheelFootballCfbPriorityForSchoolId(
  schoolId: string | null | undefined,
) {
  if (!schoolId) return null;
  return wheelFootballCfbPriority[schoolId.trim().toLowerCase()] ?? null;
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
