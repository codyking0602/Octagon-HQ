export type MlbTeamAsset = {
  abbreviation: string;
  name: string;
  logoUrl: string;
  color: string;
};

const MLB_TEAM_ROWS = [
  ["ARI", "Arizona Diamondbacks", "ari", "#A71930"],
  ["ATL", "Atlanta Braves", "atl", "#CE1141"],
  ["BAL", "Baltimore Orioles", "bal", "#DF4601"],
  ["BOS", "Boston Red Sox", "bos", "#BD3039"],
  ["CHC", "Chicago Cubs", "chc", "#0E3386"],
  ["CWS", "Chicago White Sox", "cws", "#27251F"],
  ["CIN", "Cincinnati Reds", "cin", "#C6011F"],
  ["CLE", "Cleveland Guardians", "cle", "#E50022"],
  ["COL", "Colorado Rockies", "col", "#33006F"],
  ["DET", "Detroit Tigers", "det", "#0C2340"],
  ["HOU", "Houston Astros", "hou", "#EB6E1F"],
  ["KC", "Kansas City Royals", "kc", "#004687"],
  ["LAA", "Los Angeles Angels", "laa", "#BA0021"],
  ["LAD", "Los Angeles Dodgers", "lad", "#005A9C"],
  ["MIA", "Miami Marlins", "mia", "#00A3E0"],
  ["MIL", "Milwaukee Brewers", "mil", "#FFC52F"],
  ["MIN", "Minnesota Twins", "min", "#002B5C"],
  ["NYM", "New York Mets", "nym", "#FF5910"],
  ["NYY", "New York Yankees", "nyy", "#0C2340"],
  ["ATH", "Athletics", "ath", "#003831"],
  ["PHI", "Philadelphia Phillies", "phi", "#E81828"],
  ["PIT", "Pittsburgh Pirates", "pit", "#FDB827"],
  ["SD", "San Diego Padres", "sd", "#2F241D"],
  ["SF", "San Francisco Giants", "sf", "#FD5A1E"],
  ["SEA", "Seattle Mariners", "sea", "#005C5C"],
  ["STL", "St. Louis Cardinals", "stl", "#C41E3A"],
  ["TB", "Tampa Bay Rays", "tb", "#092C5C"],
  ["TEX", "Texas Rangers", "tex", "#003278"],
  ["TOR", "Toronto Blue Jays", "tor", "#134A8E"],
  ["WSH", "Washington Nationals", "wsh", "#AB0003"],
] as const;

export const MLB_TEAM_ASSETS: readonly MlbTeamAsset[] = MLB_TEAM_ROWS.map(
  ([abbreviation, name, espnCode, color]) => ({
    abbreviation,
    name,
    logoUrl: `https://a.espncdn.com/i/teamlogos/mlb/500/${espnCode}.png`,
    color,
  }),
);

const BY_ABBREVIATION = new Map(MLB_TEAM_ASSETS.map((team) => [team.abbreviation, team]));
const BY_NAME = new Map(MLB_TEAM_ASSETS.map((team) => [team.name.toLowerCase(), team]));

export function mlbTeamAssetByAbbreviation(value: string | null | undefined) {
  if (!value) return null;
  return BY_ABBREVIATION.get(value.trim().toUpperCase()) ?? null;
}

export function mlbTeamAssetByName(value: string | null | undefined) {
  if (!value) return null;
  return BY_NAME.get(value.trim().toLowerCase()) ?? null;
}

export function mlbTeamLogoUrl(
  abbreviation: string | null | undefined,
  name?: string | null,
) {
  return mlbTeamAssetByAbbreviation(abbreviation)?.logoUrl
    ?? mlbTeamAssetByName(name)?.logoUrl
    ?? null;
}

export function mlbTeamColor(
  abbreviation: string | null | undefined,
  name?: string | null,
) {
  return mlbTeamAssetByAbbreviation(abbreviation)?.color
    ?? mlbTeamAssetByName(name)?.color
    ?? "#345B49";
}

export const MLB_OWNER_PLAYER_SPOTLIGHT = {
  name: "Aaron Judge",
  team: "New York Yankees",
  position: "RF",
  photoUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/w_426,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/592450/headshot/67/current",
  teamColor: "#0C2340",
  stats: [
    { label: "AVG", value: ".241" },
    { label: "HR", value: "18" },
    { label: "RBI", value: "41" },
    { label: "OPS", value: ".871" },
  ],
  meta: "2026 REGULAR SEASON",
  highlightUrl: "https://www.mlb.com/video/aaron-judge-homers-7-on-a-fly-ball-to-right-field",
} as const;
