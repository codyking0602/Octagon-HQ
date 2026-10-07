export const WHEEL_FOOTBALL_AP_TOP_25_SEASON = 2026 as const;
export const WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE = "2026-10-04" as const;
export const WHEEL_FOOTBALL_AP_TOP_25_SOURCE_URL =
  "https://apnews.com/article/7db03c4123afa589863a8b53f4db520c";

export interface WheelFootballApTop25Entry {
  rank: number;
  schoolId: string;
}

export const WHEEL_FOOTBALL_AP_TOP_25: readonly WheelFootballApTop25Entry[] = [
  { rank: 1, schoolId: "texas" },
  { rank: 2, schoolId: "georgia" },
  { rank: 3, schoolId: "notre-dame" },
  { rank: 4, schoolId: "miami" },
  { rank: 5, schoolId: "ohio-state" },
  { rank: 6, schoolId: "alabama" },
  { rank: 7, schoolId: "indiana" },
  { rank: 8, schoolId: "byu" },
  { rank: 9, schoolId: "ole-miss" },
  { rank: 10, schoolId: "lsu" },
  { rank: 11, schoolId: "texas-tech" },
  { rank: 12, schoolId: "utah" },
  { rank: 13, schoolId: "oregon" },
  { rank: 14, schoolId: "missouri" },
  { rank: 15, schoolId: "tennessee" },
  { rank: 16, schoolId: "florida" },
  { rank: 17, schoolId: "mississippi-state" },
  { rank: 18, schoolId: "oklahoma-state" },
  { rank: 19, schoolId: "usc" },
  { rank: 20, schoolId: "iowa" },
  { rank: 21, schoolId: "ucla" },
  { rank: 22, schoolId: "houston" },
  { rank: 23, schoolId: "boise-state" },
  { rank: 24, schoolId: "smu" },
  { rank: 25, schoolId: "pittsburgh" },
] as const;

const rankBySchoolId = new Map(
  WHEEL_FOOTBALL_AP_TOP_25.map((entry) => [entry.schoolId, entry.rank] as const),
);

export function wheelFootballApTop25RankForTeam(teamCode: string | null | undefined) {
  if (!teamCode) return null;
  return rankBySchoolId.get(teamCode.trim().toLowerCase()) ?? null;
}
