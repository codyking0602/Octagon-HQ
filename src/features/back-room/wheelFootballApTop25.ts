export const WHEEL_FOOTBALL_AP_TOP_25_SEASON = 2026 as const;
export const WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE = "2026-09-27" as const;
export const WHEEL_FOOTBALL_AP_TOP_25_SOURCE_URL =
  "https://apnews.com/article/fbc-t25-ap-top-25-f5fec49d605440e5a5d8459fed5a1772";

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
  { rank: 6, schoolId: "indiana" },
  { rank: 7, schoolId: "alabama" },
  { rank: 8, schoolId: "florida" },
  { rank: 9, schoolId: "ole-miss" },
  { rank: 10, schoolId: "byu" },
  { rank: 11, schoolId: "lsu" },
  { rank: 12, schoolId: "texas-tech" },
  { rank: 13, schoolId: "utah" },
  { rank: 14, schoolId: "iowa" },
  { rank: 15, schoolId: "oregon" },
  { rank: 16, schoolId: "mississippi-state" },
  { rank: 17, schoolId: "tennessee" },
  { rank: 18, schoolId: "usc" },
  { rank: 19, schoolId: "oklahoma-state" },
  { rank: 20, schoolId: "houston" },
  { rank: 21, schoolId: "smu" },
  { rank: 22, schoolId: "boise-state" },
  { rank: 23, schoolId: "ucla" },
  { rank: 24, schoolId: "kentucky" },
  { rank: 25, schoolId: "missouri" },
] as const;

const rankBySchoolId = new Map(
  WHEEL_FOOTBALL_AP_TOP_25.map((entry) => [entry.schoolId, entry.rank] as const),
);

export function wheelFootballApTop25RankForTeam(teamCode: string | null | undefined) {
  if (!teamCode) return null;
  return rankBySchoolId.get(teamCode.trim().toLowerCase()) ?? null;
}
