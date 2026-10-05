import {
  footballFactualRecords,
  formatFootballFact,
  getFootballSubject,
  queryFootballSubjects,
  type FootballFactMetricId,
  type FootballSubjectPosition,
  type FootballSubjectProfile,
} from "./footballFactualStats";
import { footballHitTheNumberPeakSeasons } from "./footballHitTheNumberPeakSeasonContext";
import { seededLineupRandom, shuffleLineup } from "../play/lineupModel";

export const FOOTBALL_HIGHER_LOWER_GAME_ID = "football-higher-lower";
export const FOOTBALL_HIGHER_LOWER_VERSION = "football-higher-lower-v1" as const;
export const FOOTBALL_HIGHER_LOWER_QUESTION_COUNT = 10;
export const FOOTBALL_HIGHER_LOWER_MODERN_QUESTION_MIN = 7;
export const FOOTBALL_HIGHER_LOWER_MODERN_YEAR = 2010;

export type FootballHigherLowerScope = "NFL" | "CFB" | "MIXED";
export type FootballHigherLowerLeague = "NFL" | "CFB";
export type FootballHigherLowerChoice = "higher" | "lower";
export type FootballHigherLowerDifficulty = "approachable" | "competitive" | "tough";
export type FootballHigherLowerCategory =
  | "single-season"
  | "career"
  | "awards"
  | "championships"
  | "team"
  | "draft";

export interface FootballHigherLowerSubject {
  subjectId: string;
  name: string;
  context: string;
  value: number;
  formattedValue: string;
  referenceYear?: number;
}

export interface FootballHigherLowerQuestion {
  id: string;
  league: FootballHigherLowerLeague;
  category: FootballHigherLowerCategory;
  difficulty: FootballHigherLowerDifficulty;
  metricKey: string;
  metricLabel: string;
  note?: string;
  known: FootballHigherLowerSubject;
  hidden: FootballHigherLowerSubject;
  answer: FootballHigherLowerChoice;
}

export interface FootballHigherLowerBoard {
  version: typeof FOOTBALL_HIGHER_LOWER_VERSION;
  seed: string;
  scope: FootballHigherLowerScope;
  questions: FootballHigherLowerQuestion[];
}

interface MetricSpec {
  key: string;
  league: FootballHigherLowerLeague;
  category: FootballHigherLowerCategory;
  label: string;
  metricId?: FootballFactMetricId;
  kinds: readonly FootballSubjectProfile["kind"][];
  positions?: readonly FootballSubjectPosition[];
  minValue?: number | Partial<Record<FootballSubjectPosition, number>>;
  recognition: "iconic" | "recognizable";
  note?: string;
  valueFromSubject?: (subject: FootballSubjectProfile) => number | null;
}

interface MetricRow {
  subject: FootballSubjectProfile;
  value: number;
  formattedValue: string;
  referenceYear: number | null;
}

interface PairCandidate {
  id: string;
  league: FootballHigherLowerLeague;
  category: FootballHigherLowerCategory;
  difficulty: FootballHigherLowerDifficulty;
  metricKey: string;
  metricLabel: string;
  note?: string;
  modern: boolean;
  recognitionScore: number;
  left: MetricRow;
  right: MetricRow;
}

const HIGHER_LOWER_HISTORICAL_ICON_NAMES = new Set([
  "Joe Montana",
  "Jerry Rice",
  "Dan Marino",
  "John Elway",
  "Walter Payton",
  "Barry Sanders",
  "Emmitt Smith",
  "Deion Sanders",
  "Lawrence Taylor",
  "Reggie White",
  "Bruce Smith",
  "Steve Young",
  "Brett Favre",
  "Bo Jackson",
  "Herschel Walker",
  "Charles Woodson",
  "Peyton Manning",
  "Ricky Williams",
]);

const ICONIC_CFB_TEAM_SEASONS = new Set([
  "1995-nebraska",
  "2001-miami",
  "2004-usc",
  "2005-texas",
  "2008-florida",
  "2009-alabama",
  "2010-auburn",
  "2011-alabama",
  "2013-florida-state",
  "2014-ohio-state",
  "2018-clemson",
  "2019-lsu",
  "2020-alabama",
  "2021-georgia",
  "2022-georgia",
]);

const NFL_TEAM_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  ari: "Arizona Cardinals",
  atl: "Atlanta Falcons",
  bal: "Baltimore Ravens",
  buf: "Buffalo Bills",
  car: "Carolina Panthers",
  chi: "Chicago Bears",
  cin: "Cincinnati Bengals",
  cle: "Cleveland Browns",
  dal: "Dallas Cowboys",
  den: "Denver Broncos",
  det: "Detroit Lions",
  gb: "Green Bay Packers",
  hou: "Houston Texans",
  ind: "Indianapolis Colts",
  jax: "Jacksonville Jaguars",
  kc: "Kansas City Chiefs",
  lv: "Las Vegas Raiders",
  oak: "Oakland Raiders",
  lar: "Los Angeles Rams",
  stl: "St. Louis Rams",
  lac: "Los Angeles Chargers",
  sd: "San Diego Chargers",
  mia: "Miami Dolphins",
  min: "Minnesota Vikings",
  ne: "New England Patriots",
  no: "New Orleans Saints",
  nyg: "New York Giants",
  nyj: "New York Jets",
  phi: "Philadelphia Eagles",
  pit: "Pittsburgh Steelers",
  sea: "Seattle Seahawks",
  sf: "San Francisco 49ers",
  tb: "Tampa Bay Buccaneers",
  ten: "Tennessee Titans",
  wsh: "Washington Commanders",
  was: "Washington",
};

const metricSpecs: readonly MetricSpec[] = [
  {
    key: "nfl-season-pass-yards",
    league: "NFL",
    category: "single-season",
    label: "Season passing yards",
    metricId: "nfl-season-passing-yards",
    kinds: ["player-season"],
    positions: ["QB"],
    minValue: 2_500,
    recognition: "recognizable",
  },
  {
    key: "nfl-season-pass-td",
    league: "NFL",
    category: "single-season",
    label: "Season passing TDs",
    metricId: "nfl-season-passing-touchdowns",
    kinds: ["player-season"],
    positions: ["QB"],
    minValue: 20,
    recognition: "recognizable",
  },
  {
    key: "nfl-team-wins",
    league: "NFL",
    category: "team",
    label: "Team wins",
    metricId: "nfl-team-overall-wins",
    kinds: ["team-season"],
    minValue: 9,
    recognition: "recognizable",
  },
  {
    key: "nfl-team-points",
    league: "NFL",
    category: "team",
    label: "Team points scored",
    metricId: "nfl-team-points-for",
    kinds: ["team-season"],
    minValue: 320,
    recognition: "recognizable",
  },
  {
    key: "nfl-team-sacks",
    league: "NFL",
    category: "team",
    label: "Team defensive sacks",
    metricId: "nfl-team-defensive-sacks",
    kinds: ["team-season"],
    minValue: 35,
    recognition: "recognizable",
  },
  {
    key: "nfl-mvps",
    league: "NFL",
    category: "awards",
    label: "AP MVP awards",
    metricId: "nfl-ap-mvp-awards",
    kinds: ["player-career"],
    minValue: 1,
    recognition: "iconic",
  },
  {
    key: "nfl-all-pros",
    league: "NFL",
    category: "awards",
    label: "First-team All-Pro selections",
    metricId: "nfl-first-team-all-pros",
    kinds: ["player-career"],
    minValue: 2,
    recognition: "iconic",
  },
  {
    key: "nfl-dpoys",
    league: "NFL",
    category: "awards",
    label: "Defensive Player of the Year awards",
    metricId: "nfl-defensive-player-of-year-awards",
    kinds: ["player-career"],
    minValue: 1,
    recognition: "iconic",
  },
  {
    key: "nfl-super-bowls",
    league: "NFL",
    category: "championships",
    label: "Super Bowl titles",
    metricId: "nfl-super-bowl-titles",
    kinds: ["player-career"],
    minValue: 1,
    recognition: "iconic",
  },
  {
    key: "nfl-career-pass-yards",
    league: "NFL",
    category: "career",
    label: "Career passing yards",
    metricId: "nfl-career-passing-yards",
    kinds: ["player-career"],
    positions: ["QB"],
    minValue: 20_000,
    recognition: "iconic",
  },
  {
    key: "nfl-career-pass-td",
    league: "NFL",
    category: "career",
    label: "Career passing TDs",
    metricId: "nfl-career-passing-touchdowns",
    kinds: ["player-career"],
    positions: ["QB"],
    minValue: 150,
    recognition: "iconic",
  },
  {
    key: "nfl-career-rush-yards",
    league: "NFL",
    category: "career",
    label: "Career rushing yards",
    metricId: "nfl-career-rushing-yards",
    kinds: ["player-career"],
    positions: ["QB", "RB"],
    minValue: { QB: 2_500, RB: 5_000 },
    recognition: "iconic",
  },
  {
    key: "nfl-career-rush-td",
    league: "NFL",
    category: "career",
    label: "Career rushing TDs",
    metricId: "nfl-career-rushing-touchdowns",
    kinds: ["player-career"],
    positions: ["QB", "RB"],
    minValue: { QB: 25, RB: 45 },
    recognition: "iconic",
  },
  {
    key: "nfl-career-rec-yards",
    league: "NFL",
    category: "career",
    label: "Career receiving yards",
    metricId: "nfl-career-receiving-yards",
    kinds: ["player-career"],
    positions: ["WR", "TE"],
    minValue: 6_000,
    recognition: "iconic",
  },
  {
    key: "nfl-career-rec-td",
    league: "NFL",
    category: "career",
    label: "Career receiving TDs",
    metricId: "nfl-career-receiving-touchdowns",
    kinds: ["player-career"],
    positions: ["WR", "TE"],
    minValue: 45,
    recognition: "iconic",
  },
  {
    key: "nfl-career-sacks",
    league: "NFL",
    category: "career",
    label: "Career sacks",
    metricId: "nfl-career-sacks",
    kinds: ["player-career"],
    positions: ["DL", "LB"],
    minValue: 50,
    recognition: "iconic",
  },
  {
    key: "nfl-draft-pick",
    league: "NFL",
    category: "draft",
    label: "NFL Draft overall pick number",
    kinds: ["player-career"],
    recognition: "recognizable",
    note: "Higher number = later selection.",
    valueFromSubject: (subject) => subject.draftPick ?? null,
  },
  {
    key: "cfb-peak-pass-yards",
    league: "CFB",
    category: "single-season",
    label: "Best-season passing yards",
    metricId: "cfb-best-season-passing-yards",
    kinds: ["player-career"],
    positions: ["QB"],
    minValue: 2_500,
    recognition: "recognizable",
  },
  {
    key: "cfb-peak-pass-td",
    league: "CFB",
    category: "single-season",
    label: "Best-season passing TDs",
    metricId: "cfb-best-season-passing-touchdowns",
    kinds: ["player-career"],
    positions: ["QB"],
    minValue: 20,
    recognition: "recognizable",
  },
  {
    key: "cfb-peak-rush-yards",
    league: "CFB",
    category: "single-season",
    label: "Best-season rushing yards",
    metricId: "cfb-best-season-rushing-yards",
    kinds: ["player-career"],
    positions: ["QB", "RB"],
    minValue: { QB: 500, RB: 800 },
    recognition: "recognizable",
  },
  {
    key: "cfb-peak-rush-td",
    league: "CFB",
    category: "single-season",
    label: "Best-season rushing TDs",
    metricId: "cfb-best-season-rushing-touchdowns",
    kinds: ["player-career"],
    positions: ["QB", "RB"],
    minValue: { QB: 6, RB: 8 },
    recognition: "recognizable",
  },
  {
    key: "cfb-peak-rec-yards",
    league: "CFB",
    category: "single-season",
    label: "Best-season receiving yards",
    metricId: "cfb-best-season-receiving-yards",
    kinds: ["player-career"],
    positions: ["WR", "TE"],
    minValue: { WR: 700, TE: 500 },
    recognition: "recognizable",
  },
  {
    key: "cfb-peak-rec-td",
    league: "CFB",
    category: "single-season",
    label: "Best-season receiving TDs",
    metricId: "cfb-best-season-receiving-touchdowns",
    kinds: ["player-career"],
    positions: ["WR", "TE"],
    minValue: { WR: 7, TE: 5 },
    recognition: "recognizable",
  },
  {
    key: "cfb-peak-sacks",
    league: "CFB",
    category: "single-season",
    label: "Best-season sacks",
    metricId: "cfb-best-season-sacks",
    kinds: ["player-career"],
    positions: ["DL", "LB"],
    minValue: 6,
    recognition: "recognizable",
  },
  {
    key: "cfb-team-wins",
    league: "CFB",
    category: "team",
    label: "Team wins",
    metricId: "cfb-team-wins",
    kinds: ["team-season"],
    minValue: 10,
    recognition: "recognizable",
  },
  {
    key: "cfb-team-points",
    league: "CFB",
    category: "team",
    label: "Team points scored",
    metricId: "cfb-team-points-for",
    kinds: ["team-season"],
    minValue: 350,
    recognition: "recognizable",
  },
  {
    key: "cfb-team-ppg",
    league: "CFB",
    category: "team",
    label: "Team points per game",
    metricId: "cfb-team-points-per-game",
    kinds: ["team-season"],
    minValue: 30,
    recognition: "recognizable",
  },
  {
    key: "cfb-all-america",
    league: "CFB",
    category: "awards",
    label: "All-America selections",
    metricId: "cfb-all-america-selections",
    kinds: ["player-career"],
    minValue: 1,
    recognition: "recognizable",
  },
  {
    key: "cfb-national-titles",
    league: "CFB",
    category: "championships",
    label: "College national championships won",
    metricId: "cfb-national-championships-won",
    kinds: ["player-career"],
    minValue: 1,
    recognition: "recognizable",
  },
  {
    key: "cfb-career-pass-yards",
    league: "CFB",
    category: "career",
    label: "College career passing yards",
    metricId: "cfb-career-passing-yards",
    kinds: ["player-career"],
    positions: ["QB"],
    minValue: 7_500,
    recognition: "iconic",
  },
  {
    key: "cfb-career-pass-td",
    league: "CFB",
    category: "career",
    label: "College career passing TDs",
    metricId: "cfb-career-passing-touchdowns",
    kinds: ["player-career"],
    positions: ["QB"],
    minValue: 60,
    recognition: "iconic",
  },
  {
    key: "cfb-career-rush-yards",
    league: "CFB",
    category: "career",
    label: "College career rushing yards",
    metricId: "cfb-career-rushing-yards",
    kinds: ["player-career"],
    positions: ["QB", "RB"],
    minValue: { QB: 1_500, RB: 2_500 },
    recognition: "iconic",
  },
  {
    key: "cfb-career-rush-td",
    league: "CFB",
    category: "career",
    label: "College career rushing TDs",
    metricId: "cfb-career-rushing-touchdowns",
    kinds: ["player-career"],
    positions: ["QB", "RB"],
    minValue: { QB: 20, RB: 25 },
    recognition: "iconic",
  },
  {
    key: "cfb-career-rec-yards",
    league: "CFB",
    category: "career",
    label: "College career receiving yards",
    metricId: "cfb-career-receiving-yards",
    kinds: ["player-career"],
    positions: ["WR", "TE"],
    minValue: { WR: 2_000, TE: 1_500 },
    recognition: "iconic",
  },
  {
    key: "cfb-career-rec-td",
    league: "CFB",
    category: "career",
    label: "College career receiving TDs",
    metricId: "cfb-career-receiving-touchdowns",
    kinds: ["player-career"],
    positions: ["WR", "TE"],
    minValue: { WR: 20, TE: 15 },
    recognition: "iconic",
  },
  {
    key: "cfb-career-sacks",
    league: "CFB",
    category: "career",
    label: "College career sacks",
    metricId: "cfb-career-sacks",
    kinds: ["player-career"],
    positions: ["DL", "LB"],
    minValue: 18,
    recognition: "iconic",
  },
  {
    key: "cfb-draft-pick",
    league: "CFB",
    category: "draft",
    label: "NFL Draft overall pick number",
    metricId: "cfb-nfl-draft-overall-pick",
    kinds: ["player-career"],
    recognition: "recognizable",
    note: "Higher number = later selection.",
  },
] as const;

function minimumForSubject(spec: MetricSpec, subject: FootballSubjectProfile) {
  if (spec.minValue == null) return null;
  if (typeof spec.minValue === "number") return spec.minValue;
  if (!subject.position) return null;
  return spec.minValue[subject.position] ?? null;
}

function iconicTeamSeason(subject: FootballSubjectProfile) {
  return subject.league === "CFB"
    && subject.kind === "team-season"
    && ICONIC_CFB_TEAM_SEASONS.has(subject.id);
}

function historicalIcon(subject: FootballSubjectProfile) {
  return iconicTeamSeason(subject) || HIGHER_LOWER_HISTORICAL_ICON_NAMES.has(subject.name);
}

function subjectEligible(subject: FootballSubjectProfile, spec: MetricSpec) {
  if (
    subject.league !== spec.league
    || !spec.kinds.includes(subject.kind)
    || subject.casualEligible === false
    || (subject.recognizabilityTier !== "A" && subject.recognizabilityTier !== "B" && !iconicTeamSeason(subject))
  ) return false;

  if (spec.positions && (!subject.position || !spec.positions.includes(subject.position))) return false;
  if (spec.recognition === "iconic" && subject.recognizabilityTier !== "A" && !iconicTeamSeason(subject)) return false;
  return true;
}

function metricReferenceYear(subject: FootballSubjectProfile, spec: MetricSpec) {
  if (subject.season != null) return subject.season;
  if (spec.category === "draft" && subject.draftYear != null) return subject.draftYear;
  if (subject.league === "CFB" && spec.metricId?.startsWith("cfb-best-season-")) {
    const seasons = footballHitTheNumberPeakSeasons(subject.id, spec.metricId);
    if (seasons.length) return Math.max(...seasons);
  }
  if (subject.endSeason != null) return subject.endSeason;
  if (subject.startSeason != null) return subject.startSeason;
  if (subject.draftYear != null) return subject.draftYear;
  if (subject.activeDecades?.length) return Math.max(...subject.activeDecades) + 9;
  return null;
}

function displaySubjectName(subject: FootballSubjectProfile) {
  if (subject.kind === "player-season" && subject.season != null) {
    return subject.name.replace(new RegExp(`\\s+${subject.season}$`), "");
  }

  if (subject.kind === "team-season" && subject.season != null) {
    const withoutYear = subject.name.replace(new RegExp(`^${subject.season}\\s+`), "").trim();
    if (subject.league === "NFL") {
      const teamCode = (subject.teamId?.replace("nfl:", "") ?? withoutYear).toLowerCase();
      return NFL_TEAM_DISPLAY_NAMES[teamCode] ?? withoutYear;
    }
    return withoutYear;
  }

  return subject.name;
}

function subjectContext(subject: FootballSubjectProfile, spec: MetricSpec, referenceYear: number | null) {
  const position = subject.position ?? "PLAYER";
  if (spec.category === "draft") {
    return `${subject.draftYear ?? referenceYear ?? "NFL"} DRAFT · ${position}`;
  }
  if (subject.kind === "player-season") {
    return `${subject.season ?? referenceYear ?? "SEASON"} · ${position}`;
  }
  if (subject.kind === "team-season") {
    return `${subject.season ?? referenceYear ?? "SEASON"} SEASON · TEAM`;
  }
  if (subject.league === "CFB" && spec.metricId?.startsWith("cfb-best-season-")) {
    const seasons = footballHitTheNumberPeakSeasons(subject.id, spec.metricId);
    const seasonLabel = seasons.length ? seasons.join("/") : (referenceYear ?? "PEAK");
    return `${seasonLabel} PEAK · ${position}`;
  }
  if (subject.kind === "player-career") {
    return subject.league === "CFB"
      ? `COLLEGE CAREER · ${position}`
      : `NFL CAREER · ${position}`;
  }
  return subject.league;
}

function formatMetricValue(spec: MetricSpec, value: number) {
  return spec.metricId ? formatFootballFact(spec.metricId, value) : value.toLocaleString("en-US");
}

function metricRows(spec: MetricSpec): MetricRow[] {
  const candidateRows = spec.valueFromSubject
    ? queryFootballSubjects({ league: spec.league }).flatMap((subject) => {
        if (!subjectEligible(subject, spec)) return [];
        const value = spec.valueFromSubject?.(subject) ?? null;
        if (value == null || !Number.isFinite(value)) return [];
        return [{ subject, value }];
      })
    : spec.metricId
      ? footballFactualRecords.flatMap((record) => {
          const subject = getFootballSubject(record.subjectId);
          if (!subject || !subjectEligible(subject, spec)) return [];
          const fact = record.facts.find((candidate) => candidate.metricId === spec.metricId);
          if (!fact || !Number.isFinite(fact.value)) return [];
          return [{ subject, value: fact.value }];
        })
      : [];

  return candidateRows.flatMap(({ subject, value }) => {
    const minimum = minimumForSubject(spec, subject);
    if (minimum != null && value < minimum) return [];
    return [{
      subject,
      value,
      formattedValue: formatMetricValue(spec, value),
      referenceYear: metricReferenceYear(subject, spec),
    }];
  });
}

function relativeGap(left: number, right: number) {
  return Math.abs(left - right) / Math.max(Math.abs(left), Math.abs(right), 1);
}

function pairDifficulty(left: number, right: number): FootballHigherLowerDifficulty {
  const gap = relativeGap(left, right);
  if (gap <= 0.08) return "tough";
  if (gap <= 0.22) return "competitive";
  return "approachable";
}

function recognizabilityScore(subject: FootballSubjectProfile) {
  if (iconicTeamSeason(subject)) return 3;
  if (subject.recognizabilityTier === "A") return 3;
  if (subject.recognizabilityTier === "B") return 2;
  return 0;
}

function pairCandidates(spec: MetricSpec): PairCandidate[] {
  const rows = metricRows(spec).sort((left, right) => left.value - right.value);
  const offsets = [1, 2, 4, 8, 12, 16] as const;
  const pairs: PairCandidate[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    for (const offset of offsets) {
      const rightIndex = index + offset;
      if (rightIndex >= rows.length) continue;
      const left = rows[index]!;
      const right = rows[rightIndex]!;
      if (left.value === right.value) continue;

      const gap = relativeGap(left.value, right.value);
      if (gap > 0.58) continue;

      const modern = (left.referenceYear ?? 0) >= FOOTBALL_HIGHER_LOWER_MODERN_YEAR
        && (right.referenceYear ?? 0) >= FOOTBALL_HIGHER_LOWER_MODERN_YEAR;
      const leftRecognition = recognizabilityScore(left.subject);
      const rightRecognition = recognizabilityScore(right.subject);

      // Older questions have to be household-name history, not merely valid database rows.
      // Modern Tier B subjects can appear, but only beside a Tier A anchor.
      if (!modern && (!historicalIcon(left.subject) || !historicalIcon(right.subject))) continue;
      if (leftRecognition < 3 && rightRecognition < 3) continue;

      pairs.push({
        id: `${spec.key}:${left.subject.id}:${right.subject.id}`,
        league: spec.league,
        category: spec.category,
        difficulty: pairDifficulty(left.value, right.value),
        metricKey: spec.key,
        metricLabel: spec.label,
        ...(spec.note ? { note: spec.note } : {}),
        modern,
        recognitionScore: leftRecognition + rightRecognition,
        left,
        right,
      });
    }
  }

  return pairs;
}

const allPairCandidates = metricSpecs.flatMap(pairCandidates);

export function footballHigherLowerCandidateSummary() {
  const summary: Record<string, number> = {};
  for (const pair of allPairCandidates) {
    const key = `${pair.league}|${pair.category}|${pair.difficulty}|${pair.modern ? "modern" : "historic"}|${pair.metricKey}`;
    summary[key] = (summary[key] ?? 0) + 1;
  }
  return summary;
}

function entityKey(subject: FootballSubjectProfile) {
  if (subject.playerId) {
    return `player:${subject.playerId.replace(/^(?:nfl|cfb)-/, "").replace(/-\\d{4}$/, "")}`;
  }
  if (subject.coachId) return `coach:${subject.coachId.replace(/^(?:nfl|cfb)-/, "")}`;
  if (subject.teamId) return `team:${subject.teamId}`;
  return `subject:${subject.id}`;
}

function leaguePattern(scope: FootballHigherLowerScope, random: () => number) {
  if (scope === "NFL" || scope === "CFB") {
    return Array.from({ length: FOOTBALL_HIGHER_LOWER_QUESTION_COUNT }, () => scope);
  }
  const base: FootballHigherLowerLeague[] = [
    "NFL", "NFL", "NFL", "NFL", "NFL",
    "CFB", "CFB", "CFB", "CFB", "CFB",
  ];
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const candidate = shuffleLineup(base, random);
    const hasThreeStraight = candidate.some((league, index) => (
      index >= 2 && candidate[index - 1] === league && candidate[index - 2] === league
    ));
    if (!hasThreeStraight) return candidate;
  }
  return ["NFL", "CFB", "NFL", "CFB", "NFL", "CFB", "NFL", "CFB", "NFL", "CFB"];
}

function difficultyPattern(random: () => number) {
  return shuffleLineup<FootballHigherLowerDifficulty>([
    "approachable", "approachable", "approachable",
    "competitive", "competitive", "competitive", "competitive", "competitive",
    "tough", "tough",
  ], random);
}

function answerPattern(random: () => number) {
  return shuffleLineup<FootballHigherLowerChoice>([
    "higher", "higher", "higher", "higher", "higher",
    "lower", "lower", "lower", "lower", "lower",
  ], random);
}

function modernityPattern(random: () => number) {
  return shuffleLineup([
    true, true, true, true, true, true, true,
    false, false, false,
  ], random);
}

function toQuestion(pair: PairCandidate, answer: FootballHigherLowerChoice): FootballHigherLowerQuestion {
  const lower = pair.left.value < pair.right.value ? pair.left : pair.right;
  const higher = pair.left.value < pair.right.value ? pair.right : pair.left;
  const known = answer === "higher" ? lower : higher;
  const hidden = answer === "higher" ? higher : lower;
  const subject = (row: MetricRow): FootballHigherLowerSubject => ({
    subjectId: row.subject.id,
    name: displaySubjectName(row.subject),
    context: subjectContext(
      row.subject,
      metricSpecs.find((spec) => spec.key === pair.metricKey)!,
      row.referenceYear,
    ),
    value: row.value,
    formattedValue: row.formattedValue,
    ...(row.referenceYear != null ? { referenceYear: row.referenceYear } : {}),
  });

  return {
    id: `${pair.id}:${answer}`,
    league: pair.league,
    category: pair.category,
    difficulty: pair.difficulty,
    metricKey: pair.metricKey,
    metricLabel: pair.metricLabel,
    ...(pair.note ? { note: pair.note } : {}),
    known: subject(known),
    hidden: subject(hidden),
    answer,
  };
}

function tryBuildBoard(seed: string, scope: FootballHigherLowerScope, attempt: number) {
  const random = seededLineupRandom(FOOTBALL_HIGHER_LOWER_VERSION, seed, scope, attempt);
  const leagues = leaguePattern(scope, random);
  const difficulties = difficultyPattern(random);
  const answers = answerPattern(random);
  const modernity = modernityPattern(random);
  const usedEntities = new Set<string>();
  const metricCounts = new Map<string, number>();
  const categoryCounts = new Map<FootballHigherLowerCategory, number>();
  let careerCount = 0;
  const questions: FootballHigherLowerQuestion[] = [];

  for (let index = 0; index < FOOTBALL_HIGHER_LOWER_QUESTION_COUNT; index += 1) {
    const league = leagues[index]!;
    const difficulty = difficulties[index]!;
    const answer = answers[index]!;
    const requireModern = modernity[index]!;
    const lastCategory = questions.at(-1)?.category;
    const matching = allPairCandidates.filter((pair) => {
      if (pair.league !== league || pair.difficulty !== difficulty) return false;
      if (requireModern && !pair.modern) return false;
      if ((metricCounts.get(pair.metricKey) ?? 0) >= 2) return false;
      if ((categoryCounts.get(pair.category) ?? 0) >= 3) return false;
      if (pair.category === "career" && careerCount >= 2) return false;
      if (lastCategory === pair.category) return false;
      const leftKey = entityKey(pair.left.subject);
      const rightKey = entityKey(pair.right.subject);
      return !usedEntities.has(leftKey) && !usedEntities.has(rightKey) && leftKey !== rightKey;
    });
    if (!matching.length) return null;

    const unseen = matching.filter((pair) => !categoryCounts.has(pair.category));
    let pool = unseen.length && categoryCounts.size < 5 ? unseen : matching;

    if (!requireModern) {
      const iconicHistory = pool.filter((pair) => !pair.modern);
      if (iconicHistory.length) pool = iconicHistory;
    }

    const bestRecognition = Math.max(...pool.map((pair) => pair.recognitionScore));
    const recognitionPool = pool.filter((pair) => pair.recognitionScore >= bestRecognition - 1);
    const pair = shuffleLineup(recognitionPool, random)[0]!;
    const question = toQuestion(pair, answer);
    questions.push(question);
    usedEntities.add(entityKey(pair.left.subject));
    usedEntities.add(entityKey(pair.right.subject));
    metricCounts.set(pair.metricKey, (metricCounts.get(pair.metricKey) ?? 0) + 1);
    categoryCounts.set(pair.category, (categoryCounts.get(pair.category) ?? 0) + 1);
    if (pair.category === "career") careerCount += 1;
  }

  if (categoryCounts.size < 5) return null;
  const modernCount = questions.filter((question) => (
    (question.known.referenceYear ?? 0) >= FOOTBALL_HIGHER_LOWER_MODERN_YEAR
    && (question.hidden.referenceYear ?? 0) >= FOOTBALL_HIGHER_LOWER_MODERN_YEAR
  )).length;
  if (modernCount < FOOTBALL_HIGHER_LOWER_MODERN_QUESTION_MIN) return null;
  return questions;
}

export function createFootballHigherLowerBoard(
  seed: string,
  scope: FootballHigherLowerScope,
): FootballHigherLowerBoard {
  for (let attempt = 0; attempt < 1_000; attempt += 1) {
    const questions = tryBuildBoard(seed, scope, attempt);
    if (questions) {
      return {
        version: FOOTBALL_HIGHER_LOWER_VERSION,
        seed,
        scope,
        questions,
      };
    }
  }
  throw new Error(`Unable to build a valid Higher or Lower ${scope} board.`);
}

function isScope(value: unknown): value is FootballHigherLowerScope {
  return value === "NFL" || value === "CFB" || value === "MIXED";
}

function isChoice(value: unknown): value is FootballHigherLowerChoice {
  return value === "higher" || value === "lower";
}

export function parseFootballHigherLowerBoard(value: unknown): FootballHigherLowerBoard | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const board = value as Partial<FootballHigherLowerBoard>;
  if (
    board.version !== FOOTBALL_HIGHER_LOWER_VERSION
    || typeof board.seed !== "string"
    || !isScope(board.scope)
    || !Array.isArray(board.questions)
    || board.questions.length !== FOOTBALL_HIGHER_LOWER_QUESTION_COUNT
  ) return null;

  for (const question of board.questions) {
    if (!question || typeof question !== "object" || Array.isArray(question)) return null;
    const row = question as Partial<FootballHigherLowerQuestion>;
    if (
      typeof row.id !== "string"
      || (row.league !== "NFL" && row.league !== "CFB")
      || !isChoice(row.answer)
      || !row.known
      || !row.hidden
      || typeof row.known.value !== "number"
      || typeof row.hidden.value !== "number"
      || row.known.value === row.hidden.value
    ) return null;
  }
  return board as FootballHigherLowerBoard;
}

export function footballHigherLowerAnswerIsCorrect(
  question: FootballHigherLowerQuestion,
  choice: FootballHigherLowerChoice,
) {
  return choice === question.answer;
}
