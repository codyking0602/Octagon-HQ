import authorityJson from "../../../data/curated/football/cfb/ap-top-25-2026-current.json";

type CfbApTop25AuthorityJson = {
  season: number;
  poll: "AP Top 25";
  pollDate: string;
  sourceUrl: string;
  monitoringSourceUrl: string;
  teams: readonly {
    rank: number;
    teamCode: string;
    teamName: string;
  }[];
};

const authority = authorityJson as CfbApTop25AuthorityJson;

export const WHEEL_FOOTBALL_CFB_AP_TOP25_SEASON = authority.season;
export const WHEEL_FOOTBALL_CFB_AP_TOP25_POLL_DATE = authority.pollDate;
export const WHEEL_FOOTBALL_CFB_AP_TOP25_SOURCE_URL = authority.sourceUrl;
export const WHEEL_FOOTBALL_CFB_AP_TOP25_MONITORING_SOURCE_URL = authority.monitoringSourceUrl;

export const WHEEL_FOOTBALL_CFB_AP_TOP25 = Object.freeze(
  authority.teams.map((entry) => Object.freeze({ ...entry })),
);

const rankByTeamCode = new Map(
  WHEEL_FOOTBALL_CFB_AP_TOP25.map((entry) => [entry.teamCode, entry.rank] as const),
);

export function wheelFootballCfbApRankForTeam(teamCode: string | null | undefined) {
  if (!teamCode) return null;
  return rankByTeamCode.get(teamCode.trim().toLowerCase()) ?? null;
}
