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
import { footballTeamSchoolMetadataFor } from "../back-room/footballTeamSchoolMetadata";
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

function clue(id: string, text: string, band: WhoAmIClueBand, family = id): WhoAmIClue {
  return { id, text, band, family };
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
    clue("division", `My primary UFC division is ${ufcDivision(subject.primaryDivision)}.`, "broad", "division"),
    clue("debut-decade", `I made my UFC debut in the ${Math.floor(debutYear / 10) * 10}s.`, "broad", "era"),
    clue("active-window", `My UFC career ran from ${debutYear} to ${lastYear}.`, "helpful", "era"),
    clue("fight-count", `I fought in ${subject.fights.length} UFC fights.`, "helpful", "ufc-record"),
    clue("win-count", `I won ${wins.length} UFC fights.`, "helpful", "ufc-record"),
    clue("ko-wins", `I earned ${koWins.length} UFC wins by KO or TKO.`, "strong", "finish-profile"),
    clue("submission-wins", `I earned ${submissionWins.length} UFC wins by submission.`, "strong", "finish-profile"),
    clue("title-fights", `I competed in ${titleFights.length} UFC title fights.`, "strong", "title-resume"),
  ];

  if (divisions.length > 1) clues.push(clue("division-count", `I competed in ${divisions.length} UFC divisions.`, "helpful", "division"));
  if (activeDecades.length > 1) clues.push(clue("decades", `My UFC career crossed ${activeDecades.length} different decades.`, "helpful", "era"));
  if (titleWins.length) clues.push(clue("title-wins", `I won ${titleWins.length} UFC title fights.`, "strong", "title-resume"));

  for (const fight of recognizableFights) {
    const family = `opponent:${slug(fight.opponent)}`;
    clues.push(clue(`faced-any:${fight.id}`, `I shared the Octagon with ${fight.opponent}.`, "near-giveaway", family));
    if (fight.result === "win") clues.push(clue(`beat:${fight.id}`, `I defeated ${fight.opponent} in the UFC.`, "giveaway", family));
    else if (fight.result === "loss") clues.push(clue(`lost:${fight.id}`, `I lost to ${fight.opponent} in the UFC.`, "giveaway", family));
    else clues.push(clue(`faced:${fight.id}`, `I fought ${fight.opponent} in the UFC.`, "giveaway", family));
  }

  return {
    id: subject.id,
    name: subject.name,
    kind: "fighter",
    clues: distinctClues(clues),
  };
}

function footballMetricFamily(metricId: FootballFactMetricId) {
  if (/passing/.test(metricId)) return "production:passing";
  if (/rushing/.test(metricId)) return "production:rushing";
  if (/receiv/.test(metricId)) return "production:receiving";
  if (/sacks|interceptions/.test(metricId)) return "production:defense";
  if (/field-goals/.test(metricId)) return "production:kicking";
  if (/punts/.test(metricId)) return "production:punting";
  if (/mvp|heisman|player-of-year|all-pro/.test(metricId)) return `award:${metricId}`;
  if (/super-bowl|national-titles|conference-titles/.test(metricId)) return `championship:${metricId}`;
  if (/coach/.test(metricId)) return "coach-resume";
  return `metric:${metricId}`;
}

function countPhrase(value: unknown, singular: string, plural: string) {
  const count = Number(value);
  return count === 1 ? singular : `${count} ${plural}`;
}

function footballMetricText(metricId: FootballFactMetricId, value: unknown) {
  const formatted = formatFootballFact(metricId, value as never);
  switch (metricId) {
    case "nfl-career-games": return `I played in ${formatted} NFL games.`;
    case "nfl-career-passing-yards": return `I threw for ${formatted} yards in my NFL career.`;
    case "nfl-career-passing-touchdowns": return `I threw ${formatted} touchdown passes in my NFL career.`;
    case "nfl-career-rushing-yards": return `I rushed for ${formatted} yards in my NFL career.`;
    case "nfl-career-rushing-touchdowns": return `I scored ${formatted} rushing touchdowns in my NFL career.`;
    case "nfl-career-receptions": return `I made ${formatted} receptions in my NFL career.`;
    case "nfl-career-receiving-yards": return `I recorded ${formatted} receiving yards in my NFL career.`;
    case "nfl-career-receiving-touchdowns": return `I caught ${formatted} touchdown passes in my NFL career.`;
    case "nfl-career-sacks": return `I recorded ${formatted} sacks in my NFL career.`;
    case "nfl-career-interceptions": return `I recorded ${formatted} interceptions in my NFL career.`;
    case "nfl-career-field-goals-made": return `I made ${formatted} field goals in my NFL career.`;
    case "nfl-career-punts": return `I punted ${formatted} times in my NFL career.`;
    case "nfl-ap-mvp-awards": return Number(value) === 1 ? "I won AP NFL MVP." : `I won AP NFL MVP ${formatted} times.`;
    case "nfl-super-bowl-titles": return Number(value) === 1 ? "I won a Super Bowl." : `I won ${formatted} Super Bowl titles.`;
    case "nfl-defensive-player-of-year-awards": return Number(value) === 1 ? "I won NFL Defensive Player of the Year." : `I won NFL Defensive Player of the Year ${formatted} times.`;
    case "nfl-first-team-all-pros": return Number(value) === 1 ? "I was a first-team All-Pro." : `I was a first-team All-Pro ${formatted} times.`;
    case "nfl-coach-seasons-since-1999": return `I coached ${formatted} NFL seasons since 1999.`;
    case "nfl-coach-win-percentage-since-1999": return `My NFL head-coaching win percentage since 1999 is ${formatted}.`;
    case "nfl-coach-postseason-resume-since-1999": return `I built a notable NFL postseason résumé as a head coach.`;
    case "cfb-career-games": return `I played in ${formatted} college games.`;
    case "cfb-career-passing-yards": return `I threw for ${formatted} yards in college.`;
    case "cfb-career-passing-touchdowns": return `I threw ${formatted} touchdown passes in college.`;
    case "cfb-career-rushing-yards": return `I rushed for ${formatted} yards in college.`;
    case "cfb-career-rushing-touchdowns": return `I scored ${formatted} rushing touchdowns in college.`;
    case "cfb-career-receptions": return `I made ${formatted} receptions in college.`;
    case "cfb-career-receiving-yards": return `I recorded ${formatted} receiving yards in college.`;
    case "cfb-career-receiving-touchdowns": return `I caught ${formatted} touchdown passes in college.`;
    case "cfb-career-defensive-interceptions": return `I recorded ${formatted} interceptions in college.`;
    case "cfb-career-sacks": return `I recorded ${formatted} sacks in college.`;
    case "cfb-heisman-awards": return Number(value) === 1 ? "I won the Heisman Trophy." : `I won ${formatted} Heisman Trophies.`;
    case "cfb-coach-career-wins": return `I won ${formatted} games as a college head coach.`;
    case "cfb-coach-career-losses": return `I lost ${formatted} games as a college head coach.`;
    case "cfb-coach-national-titles": return Number(value) === 1 ? "I won a national championship as a head coach." : `I won ${formatted} national championships as a head coach.`;
    case "cfb-coach-conference-titles": return Number(value) === 1 ? "I won a conference championship as a head coach." : `I won ${formatted} conference championships as a head coach.`;
    default: {
      const label = metricLabelById.get(metricId) ?? metricId;
      return `One of my career marks is ${formatted} ${label.toLowerCase()}.`;
    }
  }
}

function footballMetricClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const record = getFootballFactualRecord(subject.id);
  if (!record) return [];
  return record.facts
    .filter((fact) => FOOTBALL_WHO_AM_I_METRICS.has(fact.metricId))
    .map((fact) => {
      const band: WhoAmIClueBand = /mvp|heisman|super-bowl|all-pro|player-of-year|national-titles/.test(fact.metricId)
        ? "strong"
        : "helpful";
      return clue(
        `fact:${fact.metricId}`,
        footballMetricText(fact.metricId, fact.value),
        band,
        footballMetricFamily(fact.metricId),
      );
    });
}

function footballIdentityClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const isCoach = subject.kind === "coach";
  const clues: WhoAmIClue[] = [];
  const primaryDecade = subject.activeDecades?.[0]
    ?? (subject.startSeason == null ? null : Math.floor(subject.startSeason / 10) * 10);

  if (isCoach) clues.push(clue("role", "I am a head coach.", "broad", "role"));
  if (!isCoach && subject.position) clues.push(clue("position", `I played ${subject.position}.`, "broad", "position"));
  if (primaryDecade != null) clues.push(clue("era", `I was active in the ${primaryDecade}s.`, "broad", "era"));
  if (subject.startSeason != null && subject.endSeason != null) {
    clues.push(clue("career-span", `My ${subject.league} career lasted ${subject.endSeason - subject.startSeason + 1} seasons.`, "helpful", "era"));
  }

  if (subject.school) clues.push(clue("school", `I played college football at ${subject.school}.`, subject.league === "NFL" ? "strong" : "helpful", `program:${slug(subject.school)}`));
  if (subject.conference) clues.push(clue("conference", `I competed in the ${subject.conference}.`, "helpful", `conference:${slug(subject.conference)}`));
  if (subject.draftYear != null) clues.push(clue("draft-year", `I entered the NFL draft in ${subject.draftYear}.`, "strong", "draft"));
  if (subject.firstOverallPick) clues.push(clue("first-overall", "I was the No. 1 overall NFL draft pick.", "strong", "draft"));
  else if (subject.firstRoundPick) clues.push(clue("first-round", "I was a first-round NFL draft pick.", "strong", "draft"));
  else if (subject.undrafted) clues.push(clue("undrafted", "I entered the NFL undrafted.", "strong", "draft"));
  if (subject.heismanWinner) clues.push(clue("heisman", "I won the Heisman Trophy.", "strong", "award:cfb-heisman-awards"));
  if (subject.nationalChampion) clues.push(clue("national-champion", "I was part of a college national championship team.", "strong", "championship:college"));

  const history = footballCareerAffiliationHistoryFor(subject);
  for (const affiliation of history?.affiliations ?? []) {
    const display = footballTeamSchoolMetadataFor(affiliation)?.name ?? affiliation;
    const family = subject.league === "NFL" ? `team:${slug(display)}` : `program:${slug(display)}`;
    const text = subject.league === "NFL"
      ? `I played or coached for the ${display}.`
      : `My college career included ${display}.`;
    clues.push(clue(`affiliation:${slug(affiliation)}`, text, "near-giveaway", family));
  }
  for (const conference of history?.conferences ?? []) {
    clues.push(clue(`historical-conference:${slug(conference)}`, `I competed in the ${conference}.`, "strong", `conference:${slug(conference)}`));
  }
  if ((history?.affiliations.length ?? 0) > 1) {
    clues.push(clue("affiliation-count", `My career included ${history!.affiliations.length} different ${subject.league === "NFL" ? "NFL franchises" : "college programs"}.`, "helpful", "career-path"));
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
