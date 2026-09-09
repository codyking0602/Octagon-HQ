import { footballCareerAffiliationHistoryFor } from "../back-room/footballCareerAffiliationProjection";
import {
  footballFactMetricDefinitions,
  formatFootballFact,
  getFootballFactualRecord,
  type FootballFactMetricId,
} from "../back-room/footballFactualStatsCore";
import {
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";
import {
  ufcFactualLedgerSubjects,
  type UfcFactualSubject,
} from "../back-room/ufcFactualLedger";
import {
  createWhoAmIRound,
  type WhoAmICandidate,
  type WhoAmIClue,
  type WhoAmIClueBand,
  type WhoAmIRound,
  type WhoAmIUniverse,
} from "./whoAmIEngine";

const metricLabelById = new Map(footballFactMetricDefinitions.map((metric) => [metric.id, metric.label]));

const FOOTBALL_WHO_AM_I_METRICS = new Set<FootballFactMetricId>([
  "nfl-career-games",
  "nfl-career-passing-yards",
  "nfl-career-passing-touchdowns",
  "nfl-career-rushing-yards",
  "nfl-career-rushing-touchdowns",
  "nfl-career-receptions",
  "nfl-career-receiving-yards",
  "nfl-career-receiving-touchdowns",
  "nfl-career-sacks",
  "nfl-career-interceptions",
  "nfl-career-field-goals-made",
  "nfl-career-punts",
  "nfl-ap-mvp-awards",
  "nfl-super-bowl-titles",
  "nfl-defensive-player-of-year-awards",
  "nfl-first-team-all-pros",
  "nfl-coach-seasons-since-1999",
  "nfl-coach-win-percentage-since-1999",
  "nfl-coach-postseason-resume-since-1999",
  "cfb-career-games",
  "cfb-career-passing-yards",
  "cfb-career-passing-touchdowns",
  "cfb-career-rushing-yards",
  "cfb-career-rushing-touchdowns",
  "cfb-career-receptions",
  "cfb-career-receiving-yards",
  "cfb-career-receiving-touchdowns",
  "cfb-career-defensive-interceptions",
  "cfb-career-sacks",
  "cfb-heisman-awards",
  "cfb-coach-career-wins",
  "cfb-coach-career-losses",
  "cfb-coach-national-titles",
  "cfb-coach-conference-titles",
]);

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clue(id: string, text: string, band: WhoAmIClueBand): WhoAmIClue {
  return { id, text, band };
}

function distinctClues(clues: readonly WhoAmIClue[]) {
  const seen = new Set<string>();
  return clues.filter((row) => {
    const key = row.text.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ufcDivision(value: string) {
  return value
    .replace(/^women-s-/, "Women's ")
    .replace(/^womens-/, "Women's ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ufcCandidate(subject: UfcFactualSubject): WhoAmICandidate {
  const wins = subject.fights.filter((fight) => fight.result === "win");
  const losses = subject.fights.filter((fight) => fight.result === "loss");
  const koWins = wins.filter((fight) => fight.methodCategory === "ko-tko");
  const submissionWins = wins.filter((fight) => fight.methodCategory === "submission");
  const titleFights = subject.fights.filter((fight) => fight.titleFight);
  const titleWins = wins.filter((fight) => fight.titleFight);
  const divisions = [...new Set([subject.primaryDivision, ...subject.secondaryDivisions, ...subject.fights.map((fight) => fight.division)])];
  const debutYear = Number(subject.activeFrom.slice(0, 4));
  const lastYear = Number(subject.activeTo.slice(0, 4));
  const activeDecades = [...new Set(subject.fights.map((fight) => Math.floor(Number(fight.date.slice(0, 4)) / 10) * 10))].sort();
  const recognizableNames = new Set(ufcFactualLedgerSubjects.map((fighter) => fighter.name.toLowerCase()));
  const recognizableFights = subject.fights.filter((fight) => recognizableNames.has(fight.opponent.toLowerCase()));

  const clues: WhoAmIClue[] = [
    clue("division", `My primary UFC division is ${ufcDivision(subject.primaryDivision)}.`, "broad"),
    clue("debut-decade", `I made my UFC debut in the ${Math.floor(debutYear / 10) * 10}s.`, "broad"),
    clue("active-window", `My recorded UFC run spans ${debutYear} to ${lastYear}.`, "helpful"),
    clue("fight-count", `I have ${subject.fights.length} UFC fights in the HQ factual ledger.`, "helpful"),
    clue("win-count", `I have ${wins.length} UFC wins in the HQ factual ledger.`, "helpful"),
    clue("ko-wins", `I have ${koWins.length} UFC wins by KO or TKO.`, "strong"),
    clue("submission-wins", `I have ${submissionWins.length} UFC submission wins.`, "strong"),
    clue("title-fights", `I competed in ${titleFights.length} UFC title fights.`, "strong"),
  ];

  if (divisions.length > 1) clues.push(clue("division-count", `I competed across ${divisions.length} UFC divisions in the recorded data.`, "helpful"));
  if (activeDecades.length > 1) clues.push(clue("decades", `I fought in the UFC across ${activeDecades.length} different decades.`, "helpful"));
  if (titleWins.length) clues.push(clue("title-wins", `I won ${titleWins.length} UFC title fights.`, "strong"));

  for (const fight of recognizableFights) {
    if (fight.result === "win") clues.push(clue(`beat:${fight.id}`, `I defeated ${fight.opponent} in the UFC.`, "giveaway"));
    else if (fight.result === "loss") clues.push(clue(`lost:${fight.id}`, `I lost to ${fight.opponent} in the UFC.`, "giveaway"));
    else clues.push(clue(`faced:${fight.id}`, `I fought ${fight.opponent} in the UFC.`, "giveaway"));
  }

  for (const fight of recognizableFights) {
    clues.push(clue(`faced-any:${fight.id}`, `I shared the Octagon with ${fight.opponent}.`, "strong"));
  }

  return {
    id: subject.id,
    name: subject.name,
    kind: "fighter",
    clues: distinctClues(clues),
  };
}

function footballMetricClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const record = getFootballFactualRecord(subject.id);
  if (!record) return [];
  return record.facts
    .filter((fact) => FOOTBALL_WHO_AM_I_METRICS.has(fact.metricId))
    .map((fact) => {
      const label = metricLabelById.get(fact.metricId) ?? fact.metricId;
      const band: WhoAmIClueBand = /mvp|heisman|super-bowl|all-pro|player-of-year|national-titles/.test(fact.metricId)
        ? "strong"
        : "helpful";
      return clue(
        `fact:${fact.metricId}`,
        `My ${label.toLowerCase()} total is ${formatFootballFact(fact.metricId, fact.value)}.`,
        band,
      );
    });
}

function footballIdentityClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const isCoach = subject.kind === "coach";
  const role = isCoach ? "head coach" : "player";
  const clues: WhoAmIClue[] = [
    clue("role", `I am a ${role}.`, "broad"),
  ];

  if (!isCoach && subject.position) clues.push(clue("position", `I played ${subject.position}.`, "broad"));
  if (subject.startSeason != null) clues.push(clue("start-season", `My recorded ${subject.league} career began in ${subject.startSeason}.`, "helpful"));
  if (subject.endSeason != null) clues.push(clue("end-season", `My recorded ${subject.league} career ended in ${subject.endSeason}.`, "helpful"));
  if (subject.startSeason != null && subject.endSeason != null) {
    clues.push(clue("career-span", `My recorded ${subject.league} career spans ${subject.endSeason - subject.startSeason + 1} seasons.`, "helpful"));
  }
  for (const decade of subject.activeDecades ?? []) clues.push(clue(`decade:${decade}`, `I was active in the ${decade}s.`, "broad"));

  if (subject.school) clues.push(clue("school", `I played college football at ${subject.school}.`, subject.league === "NFL" ? "strong" : "helpful"));
  if (subject.conference) clues.push(clue("conference", `My recorded college conference is ${subject.conference}.`, "helpful"));
  if (subject.draftYear != null) clues.push(clue("draft-year", `I entered the NFL draft in ${subject.draftYear}.`, "strong"));
  if (subject.firstOverallPick) clues.push(clue("first-overall", "I was the No. 1 overall NFL draft pick.", "strong"));
  else if (subject.firstRoundPick) clues.push(clue("first-round", "I was a first-round NFL draft pick.", "strong"));
  else if (subject.undrafted) clues.push(clue("undrafted", "I entered the NFL undrafted.", "strong"));
  if (subject.heismanWinner) clues.push(clue("heisman", "I won the Heisman Trophy.", "strong"));
  if (subject.nationalChampion) clues.push(clue("national-champion", "I was part of a college national championship team.", "strong"));

  const history = footballCareerAffiliationHistoryFor(subject);
  for (const affiliation of history?.affiliations ?? []) {
    clues.push(clue(`affiliation:${slug(affiliation)}`, `My ${subject.league === "NFL" ? "NFL" : "college"} career included ${affiliation}.`, "giveaway"));
  }
  for (const conference of history?.conferences ?? []) {
    clues.push(clue(`historical-conference:${slug(conference)}`, `I competed in the ${conference}.`, "strong"));
  }
  if ((history?.affiliations.length ?? 0) > 1) {
    clues.push(clue("affiliation-count", `My recorded career includes ${history!.affiliations.length} different ${subject.league === "NFL" ? "NFL franchises" : "college programs"}.`, "helpful"));
  }

  return clues;
}

function footballCandidate(subject: FootballSubjectProfile): WhoAmICandidate {
  return {
    id: subject.id,
    name: subject.name,
    kind: subject.kind === "coach" ? "coach" : "player",
    clues: distinctClues([
      ...footballIdentityClues(subject),
      ...footballMetricClues(subject),
    ]),
  };
}

function footballUniverse(league: "NFL" | "CFB"): WhoAmIUniverse {
  const queried = queryFootballSubjects({
    league,
    recognizabilityTiers: ["A", "B"],
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).filter((subject) => subject.kind === "player-career" || subject.kind === "coach");

  const byPerson = new Map<string, FootballSubjectProfile>();
  for (const subject of queried) {
    const key = `${subject.kind}:${subject.name.toLowerCase()}`;
    const current = byPerson.get(key);
    const currentDepth = current ? (getFootballFactualRecord(current.id)?.facts.length ?? 0) : -1;
    const nextDepth = getFootballFactualRecord(subject.id)?.facts.length ?? 0;
    if (!current || nextDepth > currentDepth) byPerson.set(key, subject);
  }

  return {
    sport: "football",
    league,
    candidates: [...byPerson.values()].map(footballCandidate),
  };
}

const ufcUniverse: WhoAmIUniverse = {
  sport: "ufc",
  league: "UFC",
  candidates: ufcFactualLedgerSubjects.map(ufcCandidate),
};

const nflUniverse = footballUniverse("NFL");
const cfbUniverse = footballUniverse("CFB");

export function getUfcWhoAmIUniverse() {
  return ufcUniverse;
}

export function getFootballWhoAmIUniverse(league: "NFL" | "CFB") {
  return league === "NFL" ? nflUniverse : cfbUniverse;
}

export function createUfcWhoAmIRound(random: () => number = Math.random): WhoAmIRound {
  return createWhoAmIRound(ufcUniverse, random);
}

export function createFootballWhoAmIRound(random: () => number = Math.random): WhoAmIRound {
  const league = random() < 0.5 ? "NFL" : "CFB";
  return createWhoAmIRound(getFootballWhoAmIUniverse(league), random);
}
