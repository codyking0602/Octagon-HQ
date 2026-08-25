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
import type {
  FootballCanonicalPosition,
  FootballCanonicalSubject,
} from "./footballFactualStatsCatalog";

export type FootballExpandedSubjectKind = FootballCanonicalSubject["kind"] | "player-season" | "program-era" | "coach";
export type FootballExpandedCanonicalSubject = Omit<FootballCanonicalSubject, "kind"> & {
  kind: FootballExpandedSubjectKind;
  startSeason?: number;
  endSeason?: number;
};

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

const defenderPositions: Readonly<Record<string, FootballCanonicalPosition>> = {
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
 * Canonicalized subject families that already existed in Football comparison games.
 * This is an identity adapter only: comparison ratings remain game-specific and are
 * deliberately not imported into the factual ledger.
 */
export const footballComparisonCanonicalSubjects: readonly FootballExpandedCanonicalSubject[] = [
  ...tightEnds,
  ...defenders,
  ...quarterbackSeasons,
  ...nflSeasons,
  ...collegeCoaches,
  ...programEras,
  ...collegeQuarterbacks,
  ...collegeSeasons,
];
