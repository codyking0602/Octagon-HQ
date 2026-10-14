export const WHEEL_FOOTBALL_AP_TOP_25_SEASON = 2026 as const;
export const WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE = "2026-10-11" as const;
export const WHEEL_FOOTBALL_AP_TOP_25_SOURCE_URL =
  "https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21";

export interface WheelFootballApTop25Entry {
  rank: number;
  schoolId: string;
}

export const WHEEL_FOOTBALL_AP_TOP_25: readonly WheelFootballApTop25Entry[] = [
  { rank: 1, schoolId: "georgia" },
  { rank: 2, schoolId: "notre-dame" },
  { rank: 3, schoolId: "miami" },
  { rank: 4, schoolId: "ohio-state" },
  { rank: 5, schoolId: "indiana" },
  { rank: 6, schoolId: "alabama" },
  { rank: 7, schoolId: "texas" },
  { rank: 8, schoolId: "byu" },
  { rank: 9, schoolId: "ole-miss" },
  { rank: 10, schoolId: "texas-tech" },
  { rank: 11, schoolId: "utah" },
  { rank: 12, schoolId: "ucla" },
  { rank: 13, schoolId: "missouri" },
  { rank: 14, schoolId: "tennessee" },
  { rank: 15, schoolId: "kentucky" },
  { rank: 16, schoolId: "mississippi-state" },
  { rank: 17, schoolId: "iowa" },
  { rank: 18, schoolId: "oklahoma-state" },
  { rank: 19, schoolId: "usc" },
  { rank: 20, schoolId: "houston" },
  { rank: 21, schoolId: "wake-forest" },
  { rank: 22, schoolId: "lsu" },
  { rank: 23, schoolId: "boise-state" },
  { rank: 24, schoolId: "smu" },
  { rank: 25, schoolId: "northwestern" },
] as const;

const rankBySchoolId = new Map(
  WHEEL_FOOTBALL_AP_TOP_25.map((entry) => [entry.schoolId, entry.rank] as const),
);

export function wheelFootballApTop25RankForTeam(teamCode: string | null | undefined) {
  if (!teamCode) return null;
  return rankBySchoolId.get(teamCode.trim().toLowerCase()) ?? null;
}
