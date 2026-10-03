import wheelPriorityJson from "../../../data/generated/football/wheel-football-priorities.json";

export const WHEEL_FOOTBALL_NFL_PRIORITY_SLOTS = [
  "QB",
  "RB",
  "WR",
  "Flex",
  "Front Seven",
  "Secondary",
  "Head Coach",
] as const;

export type WheelFootballNflPrioritySlot = (typeof WHEEL_FOOTBALL_NFL_PRIORITY_SLOTS)[number];

export const WHEEL_FOOTBALL_NFL_PRIORITY_CAPS: Readonly<Record<WheelFootballNflPrioritySlot, number>> = {
  QB: 2,
  RB: 3,
  WR: 4,
  Flex: 4,
  "Front Seven": 6,
  Secondary: 6,
  "Head Coach": 1,
};

export type WheelFootballNflPriorityTeam = Readonly<Record<WheelFootballNflPrioritySlot, readonly string[]>>;

type WheelFootballNflPriorityJson = {
  source: string;
  sourceUrl: string;
  coachSourceUrl?: string;
  auditedAt: string;
  notes: string;
  teams: Record<string, WheelFootballNflPriorityTeam>;
};

const audit = wheelPriorityJson as unknown as WheelFootballNflPriorityJson;

export const wheelFootballNflPriorityAudit = {
  source: audit.source,
  sourceUrl: audit.sourceUrl,
  coachSourceUrl: audit.coachSourceUrl ?? null,
  auditedAt: audit.auditedAt,
  notes: audit.notes,
} as const;

export const wheelFootballNflPriority: Readonly<Record<string, WheelFootballNflPriorityTeam>> = audit.teams;

export function wheelFootballNflPriorityForTeam(teamCode: string | null | undefined) {
  if (!teamCode) return null;
  return wheelFootballNflPriority[teamCode.trim().toUpperCase()] ?? null;
}

export function normalizedWheelFootballNflName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function wheelFootballNflNamesMatch(left: string, right: string) {
  return normalizedWheelFootballNflName(left) === normalizedWheelFootballNflName(right);
}
