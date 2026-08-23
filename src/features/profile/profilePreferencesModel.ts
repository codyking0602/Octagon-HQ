export const FOOTBALL_TEAMS = ["cowboys", "longhorns"] as const;

export type FootballTeam = (typeof FOOTBALL_TEAMS)[number];

export function parseFootballTeam(value: unknown): FootballTeam | null {
  return FOOTBALL_TEAMS.includes(value as FootballTeam) ? value as FootballTeam : null;
}
