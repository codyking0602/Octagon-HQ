import {
  collegeHeadCoaches,
  collegeProgramEras,
  collegeQuarterbackDepth,
  collegeTeamSeasonDepth,
  nflDefensiveCareers,
  nflQuarterbackSeasons,
  nflTeamSeasons,
  nflTightEnds,
} from "./footballComparisonDepthCatalog";
import { footballRankFivePacks } from "./footballRankFiveModel";

export type FootballExpandedSubjectKind = "player-career" | "player-season" | "team-season" | "program" | "program-era" | "coach";
type FootballExpandedLeague = "NFL" | "CFB";
type FootballExpandedPosition = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "DB" | "K" | "P";

export interface FootballExpandedCanonicalSubject {
  id: string;
  name: string;
  kind: FootballExpandedSubjectKind;
  league: FootballExpandedLeague;
  leagues?: readonly FootballExpandedLeague[];
  aliases?: readonly string[];
  position?: FootballExpandedPosition;
  season?: number;
  activeDecades?: readonly number[];
  school?: string;
  startSeason?: number;
  endSeason?: number;
}

function decadeRange(startSeason: number, endSeason: number) {
  const values: number[] = [];
  for (let decade = Math.floor(startSeason / 10) * 10; decade <= Math.floor(endSeason / 10) * 10; decade += 10) {
    values.push(decade);
  }
  return values;
}

function leadingSeason(id: string) {
  const match = /^(\d{4})-/.exec(id);
  return match ? Number(match[1]) : undefined;
}

function trailingSeason(id: string) {
  const match = /-(\d{4})$/.exec(id);
  return match ? Number(match[1]) : undefined;
}

const defenderPositions: Readonly<Record<string, FootballExpandedPosition>> = {
  "lawrence-taylor": "LB",
  "reggie-white": "DL",
  "aaron-donald": "DL",
  "ray-lewis": "LB",
  "jj-watt": "DL",
  "deion-sanders": "DB",
  "ed-reed": "DB",
  "bruce-smith": "DL",
  "myles-garrett": "DL",
  "ronnie-lott": "DB",
  "joe-greene": "DL",
  "dick-butkus": "LB",
  "tj-watt": "LB",
  "rod-woodson": "DB",
  "derrick-brooks": "LB",
  "junior-seau": "LB",
  "champ-bailey": "DB",
  "brian-dawkins": "DB",
  "troy-polamalu": "DB",
  "darrelle-revis": "DB",
  "michael-strahan": "DL",
  "terrell-suggs": "LB",
  "von-miller": "LB",
  "patrick-willis": "LB",
  "luke-kuechly": "LB",
  "richard-sherman": "DB",
  "ndamukong-suh": "DL",
  "clay-matthews": "LB",
  "jadeveon-clowney": "DL",
  "morris-claiborne": "DB",
  "dion-jordan": "DL",
  "vernon-gholston": "DL",
};

const tightEnds: FootballExpandedCanonicalSubject[] = nflTightEnds.map((item) => ({
  id: item.id,
  name: item.name,
  kind: "player-career",
  league: "NFL",
  position: "TE",
}));

const defenders: FootballExpandedCanonicalSubject[] = nflDefensiveCareers.map((item) => ({
  id: item.id,
  name: item.name,
  kind: "player-career",
  league: "NFL",
  position: defenderPositions[item.id] ?? "DL",
}));

const nflCoaches: FootballExpandedCanonicalSubject[] = (
  footballRankFivePacks.find((pack) => pack.id === "nfl-head-coaches")?.items ?? []
).map((item) => ({
  id: item.id,
  name: item.name,
  kind: "coach",
  league: "NFL",
}));

const quarterbackSeasons: FootballExpandedCanonicalSubject[] = nflQuarterbackSeasons.map((item) => {
  const season = trailingSeason(item.id);
  return {
    id: item.id,
    name: `${item.name}${season == null ? "" : ` ${season}`}`,
    kind: "player-season",
    league: "NFL",
    position: "QB",
    season,
    activeDecades: season == null ? undefined : [Math.floor(season / 10) * 10],
  };
});

const cfbRecognizablePlayerSeasons: readonly FootballExpandedCanonicalSubject[] = [
  ["cfb-marcus-mariota-2014", "Marcus Mariota", "QB", "Oregon", 2014],
  ["cfb-derrick-henry-2015", "Derrick Henry", "RB", "Alabama", 2015],
  ["cfb-lamar-jackson-2016", "Lamar Jackson", "QB", "Louisville", 2016],
  ["cfb-baker-mayfield-2017", "Baker Mayfield", "QB", "Oklahoma", 2017],
  ["cfb-kyler-murray-2018", "Kyler Murray", "QB", "Oklahoma", 2018],
  ["cfb-joe-burrow-2019", "Joe Burrow", "QB", "LSU", 2019],
  ["cfb-devonta-smith-2020", "DeVonta Smith", "WR", "Alabama", 2020],
  ["cfb-bryce-young-2021", "Bryce Young", "QB", "Alabama", 2021],
  ["cfb-caleb-williams-2022", "Caleb Williams", "QB", "USC", 2022],
  ["cfb-jayden-daniels-2023", "Jayden Daniels", "QB", "LSU", 2023],
  ["cfb-travis-hunter-2024", "Travis Hunter", "DB", "Colorado", 2024],
].map(([id, name, position, school, season]) => ({
  id: id as string,
  name: `${name} ${season}`,
  kind: "player-season" as const,
  league: "CFB" as const,
  position: position as FootballExpandedPosition,
  school: school as string,
  season: season as number,
  startSeason: season as number,
  endSeason: season as number,
  activeDecades: [Math.floor((season as number) / 10) * 10],
}));

const nflSeasons: FootballExpandedCanonicalSubject[] = nflTeamSeasons.map((item) => {
  const season = leadingSeason(item.id);
  return {
    id: item.id,
    name: item.name,
    kind: "team-season",
    league: "NFL",
    season,
    activeDecades: season == null ? undefined : [Math.floor(season / 10) * 10],
  };
});

const collegeCoaches: FootballExpandedCanonicalSubject[] = collegeHeadCoaches.map((item) => ({
  id: item.id,
  name: item.name,
  kind: "coach",
  league: "CFB",
  school: item.asset.label,
}));

const programEras: FootballExpandedCanonicalSubject[] = collegeProgramEras.map((item) => {
  const match = /-(\d{4})-(\d{4})$/.exec(item.id);
  const startSeason = match ? Number(match[1]) : undefined;
  const endSeason = match ? Number(match[2]) : undefined;
  return {
    id: item.id,
    name: item.name,
    kind: "program-era",
    league: "CFB",
    school: item.asset.label,
    startSeason,
    endSeason,
    activeDecades: startSeason == null || endSeason == null ? undefined : decadeRange(startSeason, endSeason),
  };
});

const collegeQuarterbacks: FootballExpandedCanonicalSubject[] = collegeQuarterbackDepth.map((item) => ({
  id: item.id,
  name: item.name,
  kind: "player-career",
  league: "CFB",
  position: "QB",
  school: item.asset.label,
}));

const collegeSeasons: FootballExpandedCanonicalSubject[] = collegeTeamSeasonDepth.map((item) => {
  const season = leadingSeason(item.id);
  return {
    id: item.id,
    name: item.name,
    kind: "team-season",
    league: "CFB",
    season,
    activeDecades: season == null ? undefined : [Math.floor(season / 10) * 10],
  };
});

/**
 * Canonicalized subject families that already existed in Football comparison games plus reviewed bounded CFB seasons.
 * This is an identity adapter only: comparison ratings remain game-specific and are deliberately not imported into the factual ledger.
 */
export const footballComparisonCanonicalSubjects: readonly FootballExpandedCanonicalSubject[] = [
  ...tightEnds,
  ...defenders,
  ...nflCoaches,
  ...quarterbackSeasons,
  ...cfbRecognizablePlayerSeasons,
  ...nflSeasons,
  ...collegeCoaches,
  ...programEras,
  ...collegeQuarterbacks,
  ...collegeSeasons,
];
