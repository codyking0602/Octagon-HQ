/** NFL home conferences/divisions for Long GM; Short's abstract league is untouched. */
export const NFL_GM_LONG_DIVISIONS = [
  ["BUF","MIA","NE","NYJ"],["BAL","CIN","CLE","PIT"],
  ["HOU","IND","JAX","TEN"],["DEN","KC","LAC","LV"],
  ["DAL","NYG","PHI","WSH"],["CHI","DET","GB","MIN"],
  ["ATL","CAR","NO","TB"],["ARI","LAR","SEA","SF"],
] as const;
export function nflGmLongTeamGeography(code: string): { conference: 0 | 1; division: number } | null {
  const index = NFL_GM_LONG_DIVISIONS.findIndex(teams => (teams as readonly string[]).includes(code));
  return index < 0 ? null : { conference: (index < 4 ? 0 : 1) as 0 | 1, division: index % 4 };
}
export const NFL_GM_LONG_ALL_TEAMS = NFL_GM_LONG_DIVISIONS.flat();
