import { footballCareerAffiliationHistoryFor } from "../back-room/footballCareerAffiliationProjection";
import { getFootballPersonIdentityKnowledge } from "../back-room/footballPersonIdentityKnowledge";
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
import { getUfcPersonIdentityKnowledge } from "../back-room/ufcPersonIdentityKnowledge";
import { whoAmIIdentityKnowledgeClue } from "./whoAmIClueAssembler";
import {
  createWhoAmIRound,
  type WhoAmICandidate,
  type WhoAmIClue,
  type WhoAmIClueBand,
  type WhoAmIEraBand,
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
  "nfl-career-solo-tackles",
  "nfl-career-tackles-for-loss",
  "nfl-career-forced-fumbles",
  "nfl-career-sacks",
  "nfl-career-interceptions",
  "nfl-career-passes-defended",
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
  "cfb-career-pass-breakups",
  "cfb-career-forced-fumbles",
  "cfb-career-fumble-recoveries",
  "cfb-best-season-passing-yards",
  "cfb-best-season-passing-touchdowns",
  "cfb-best-season-interceptions",
  "cfb-best-season-passer-rating",
  "cfb-best-season-rushing-yards",
  "cfb-best-season-rushing-touchdowns",
  "cfb-best-season-receptions",
  "cfb-best-season-receiving-yards",
  "cfb-best-season-receiving-touchdowns",
  "cfb-best-season-sacks",
  "cfb-best-season-tackles-for-loss",
  "cfb-best-season-defensive-interceptions",
  "cfb-heisman-awards",
  "cfb-coach-career-wins",
  "cfb-coach-career-losses",
  "cfb-coach-national-titles",
  "cfb-coach-conference-titles",
]);

const NFL_TEAM_NAMES: Readonly<Record<string, string>> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills",
  CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers",
  HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs",
  LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", LV: "Las Vegas Raiders", MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants",
  NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SEA: "Seattle Seahawks",
  SF: "San Francisco 49ers", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

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

function ufcPersonIdentityClues(subject: UfcFactualSubject): WhoAmIClue[] {
  const knowledge = getUfcPersonIdentityKnowledge(subject.id);
  if (!knowledge) return [];
  return knowledge.facts.map((fact) => whoAmIIdentityKnowledgeClue({
    subjectId: subject.id,
    subjectName: subject.name,
    subjectKind: "fighter",
    factId: fact.factId,
    conceptId: fact.conceptId,
    value: fact.value,
  }));
}

function footballPersonIdentityClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const knowledge = getFootballPersonIdentityKnowledge(subject.id);
  if (!knowledge) return [];
  const subjectKind = subject.kind === "coach" ? "coach" : "player";
  return knowledge.facts.map((fact) => whoAmIIdentityKnowledgeClue({
    subjectId: subject.id,
    subjectName: subject.name,
    subjectKind,
    factId: fact.factId,
    conceptId: fact.conceptId,
    value: fact.value,
    tags: fact.tags,
  }));
}

function ufcDivision(value: string) {
  return value
    .replace(/^women-s-/, "Women's ")
    .replace(/^womens-/, "Women's ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function eraBand(startYear: number, endYear: number): WhoAmIEraBand {
  return ((startYear + endYear) / 2) >= 2000 ? "modern" : "legacy";
}

function footballEraBand(subject: FootballSubjectProfile): WhoAmIEraBand | undefined {
  if (subject.startSeason == null && subject.endSeason == null) return undefined;
  const start = subject.startSeason ?? subject.endSeason!;
  const end = subject.endSeason ?? subject.startSeason!;
  return eraBand(start, end);
}

function displayAffiliation(league: "NFL" | "CFB", value: string) {
  return league === "NFL" ? NFL_TEAM_NAMES[value] ?? value : value;
}

function normalizedPersonName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

const nflProfilesByName = new Map<string, FootballSubjectProfile[]>();
for (const subject of queryFootballSubjects({
  league: "NFL",
  includeProjectedSourceSubjects: true,
  includeProjectedCanonicalRecognition: true,
})) {
  if (subject.kind !== "player-career") continue;
  const key = normalizedPersonName(subject.name);
  nflProfilesByName.set(key, [...(nflProfilesByName.get(key) ?? []), subject]);
}

function nflProfileDepth(subject: FootballSubjectProfile) {
  const recordDepth = getFootballFactualRecord(subject.id)?.facts.length ?? 0;
  const identityDepth = [
    subject.startSeason,
    subject.endSeason,
    subject.draftYear,
    subject.draftRound,
    subject.draftPick,
    subject.franchises?.length,
  ].filter((value) => value != null).length;
  return recordDepth * 10 + identityDepth;
}

function footballNflProfile(subject: FootballSubjectProfile) {
  if (subject.kind !== "player-career") return null;
  if (subject.league === "NFL") return subject;
  return [...(nflProfilesByName.get(normalizedPersonName(subject.name)) ?? [])]
    .sort((left, right) => nflProfileDepth(right) - nflProfileDepth(left) || left.id.localeCompare(right.id))[0] ?? null;
}

function hasFootballDraftIdentity(subject: FootballSubjectProfile) {
  return (
    subject.draftYear != null
    || subject.draftRound != null
    || subject.draftPick != null
    || subject.firstRoundPick
    || subject.firstOverallPick
    || subject.undrafted
  );
}

function footballDraftProfile(subject: FootballSubjectProfile) {
  if (hasFootballDraftIdentity(subject)) return subject;
  if (subject.kind !== "player-career") return subject;
  return [...(nflProfilesByName.get(normalizedPersonName(subject.name)) ?? [])]
    .filter(hasFootballDraftIdentity)
    .sort((left, right) => (
      Number(right.draftPick != null) - Number(left.draftPick != null)
      || Number(right.draftRound != null) - Number(left.draftRound != null)
      || Number(right.draftYear != null) - Number(left.draftYear != null)
      || nflProfileDepth(right) - nflProfileDepth(left)
      || left.id.localeCompare(right.id)
    ))[0] ?? subject;
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
    clue("active-window", `My UFC career stretched from ${debutYear} to ${lastYear}.`, "helpful"),
    clue("fight-count", `I had ${subject.fights.length} UFC fights.`, "helpful"),
    clue("win-count", `I earned ${wins.length} UFC wins.`, "helpful"),
    clue("ko-wins", `I earned ${koWins.length} UFC wins by KO or TKO.`, "strong"),
    clue("submission-wins", `I earned ${submissionWins.length} UFC submission wins.`, "strong"),
    clue("title-fights", `I competed in ${titleFights.length} UFC title fights.`, "strong"),
  ];

  if (divisions.length > 1) clues.push(clue("division-count", `I competed in ${divisions.length} UFC divisions.`, "helpful"));
  if (activeDecades.length > 1) clues.push(clue("decades", `My UFC career crossed ${activeDecades.length} decades.`, "helpful"));
  if (titleWins.length) clues.push(clue("title-wins", `I won ${titleWins.length} UFC title fights.`, "strong"));
  if (koWins.length > submissionWins.length && koWins.length >= 3) clues.push(clue("finish-style", "My UFC wins leaned much more toward knockouts than submissions.", "helpful"));
  if (submissionWins.length > koWins.length && submissionWins.length >= 3) clues.push(clue("finish-style", "My UFC wins leaned more toward submissions than knockouts.", "helpful"));

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
    eraBand: eraBand(debutYear, lastYear),
    rescueGroup: subject.primaryDivision,
    clues: distinctClues([...clues, ...ufcPersonIdentityClues(subject)]),
  };
}

function footballMetricText(metricId: FootballFactMetricId, value: unknown, label: string) {
  const numericValue = Number(value);
  const formatted = formatFootballFact(metricId, numericValue);
  switch (metricId) {
    case "cfb-best-season-passing-yards": return `My best college season produced ${formatted} passing yards.`;
    case "cfb-best-season-passing-touchdowns": return `My best college season produced ${formatted} passing touchdowns.`;
    case "cfb-best-season-interceptions": return `My best college season included ${formatted} interceptions thrown.`;
    case "cfb-best-season-passer-rating": return `My best college season included a ${formatted} passer rating.`;
    case "cfb-best-season-rushing-yards": return `My best college season produced ${formatted} rushing yards.`;
    case "cfb-best-season-rushing-touchdowns": return `My best college season produced ${formatted} rushing touchdowns.`;
    case "cfb-best-season-receptions": return `My best college season included ${formatted} receptions.`;
    case "cfb-best-season-receiving-yards": return `My best college season produced ${formatted} receiving yards.`;
    case "cfb-best-season-receiving-touchdowns": return `My best college season produced ${formatted} receiving touchdowns.`;
    case "cfb-best-season-sacks": return `My best college season included ${formatted} sacks.`;
    case "cfb-best-season-tackles-for-loss": return `My best college season included ${formatted} tackles for loss.`;
    case "cfb-best-season-defensive-interceptions": return `My best college season included ${formatted} defensive interceptions.`;
    case "cfb-heisman-awards": return numericValue === 1 ? "I won the Heisman Trophy." : `I won the Heisman Trophy ${formatted} times.`;
    case "nfl-ap-mvp-awards": return numericValue === 1 ? "I won the AP NFL MVP award." : `I won ${formatted} AP NFL MVP awards.`;
    case "nfl-super-bowl-titles": return numericValue === 1 ? "I won a Super Bowl title." : `I won ${formatted} Super Bowl titles.`;
    case "nfl-defensive-player-of-year-awards": return numericValue === 1 ? "I won NFL Defensive Player of the Year." : `I won NFL Defensive Player of the Year ${formatted} times.`;
    case "nfl-first-team-all-pros": return numericValue === 1 ? "I was a first-team All-Pro." : `I was a first-team All-Pro ${formatted} times.`;
    case "cfb-coach-national-titles": return numericValue === 1 ? "I won a national championship as a head coach." : `I won ${formatted} national championships as a head coach.`;
    case "cfb-coach-conference-titles": return numericValue === 1 ? "I won a conference title as a head coach." : `I won ${formatted} conference titles as a head coach.`;
    default: return `I recorded ${formatted} ${label.toLowerCase()}.`;
  }
}

function footballMetricClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const record = getFootballFactualRecord(subject.id);
  if (!record) return [];
  return record.facts
    .filter((fact) => FOOTBALL_WHO_AM_I_METRICS.has(fact.metricId))
    .filter((fact) => Number(fact.value) !== 0)
    .map((fact) => {
      const label = metricLabelById.get(fact.metricId) ?? fact.metricId;
      const band: WhoAmIClueBand = /mvp|heisman|super-bowl|all-pro|player-of-year|national-titles/.test(fact.metricId)
        ? "strong"
        : "helpful";
      return clue(`fact:${fact.metricId}`, footballMetricText(fact.metricId, fact.value, label), band);
    });
}

function footballProResumeClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  if (subject.league !== "CFB" || subject.kind !== "player-career") return [];
  const nflProfile = footballNflProfile(subject);
  if (!nflProfile) return [];

  const clues: WhoAmIClue[] = [
    clue("pro:nfl-path", "I later played in the NFL.", "helpful"),
  ];

  if (nflProfile.startSeason != null && nflProfile.endSeason != null) {
    clues.push(clue(
      "pro:nfl-window",
      `My NFL career ran from ${nflProfile.startSeason} through ${nflProfile.endSeason}.`,
      "strong",
    ));
  }

  const record = getFootballFactualRecord(nflProfile.id);
  for (const fact of record?.facts ?? []) {
    if (!FOOTBALL_WHO_AM_I_METRICS.has(fact.metricId) || Number(fact.value) === 0) continue;
    const label = metricLabelById.get(fact.metricId) ?? fact.metricId;
    const formatted = formatFootballFact(fact.metricId, Number(fact.value));
    let text = `I recorded ${formatted} NFL career ${label.toLowerCase().replace(/^nfl career /, "")}.`;
    if (fact.metricId === "nfl-super-bowl-titles") {
      text = Number(fact.value) === 1 ? "I won a Super Bowl title." : `I won ${formatted} Super Bowl titles.`;
    } else if (fact.metricId === "nfl-defensive-player-of-year-awards") {
      text = Number(fact.value) === 1
        ? "I won NFL Defensive Player of the Year."
        : `I won NFL Defensive Player of the Year ${formatted} times.`;
    } else if (fact.metricId === "nfl-first-team-all-pros") {
      text = Number(fact.value) === 1 ? "I was a first-team NFL All-Pro." : `I was a first-team NFL All-Pro ${formatted} times.`;
    } else if (fact.metricId === "nfl-ap-mvp-awards") {
      text = Number(fact.value) === 1 ? "I won the AP NFL MVP award." : `I won ${formatted} AP NFL MVP awards.`;
    }
    const band: WhoAmIClueBand = /mvp|super-bowl|all-pro|player-of-year/.test(fact.metricId) ? "giveaway" : "strong";
    clues.push(clue(`pro:fact:${fact.metricId}`, text, band));
  }

  const history = footballCareerAffiliationHistoryFor(nflProfile);
  const affiliations = [...new Set(
    (history?.affiliations ?? nflProfile.franchises ?? []).map((value) => displayAffiliation("NFL", value)),
  )];
  if (affiliations.length) {
    clues.push(clue(
      "pro:teams",
      affiliations.length === 1
        ? `I played in the NFL for the ${affiliations[0]}.`
        : `My NFL career included the ${affiliations.join(" and ")}.`,
      "giveaway",
    ));
  }

  return clues;
}

function footballIdentityClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const isCoach = subject.kind === "coach";
  const clues: WhoAmIClue[] = [];

  if (isCoach) clues.push(clue("role", "I am a head coach.", "broad"));
  else if (subject.position) clues.push(clue("position", `I played ${subject.position}.`, "broad"));

  const decades = subject.activeDecades ?? [];
  if (decades.length === 1) clues.push(clue("era", `I was active in the ${decades[0]}s.`, "broad"));
  else if (decades.length > 1) {
    clues.push(clue("era", `I was active in the ${decades[0]}s and ${decades[decades.length - 1]}s.`, "broad"));
  }
  if (subject.startSeason != null && subject.endSeason != null) {
    clues.push(clue(
      "career-span",
      isCoach
        ? `I spent ${subject.endSeason - subject.startSeason + 1} seasons as a ${subject.league} head coach.`
        : `My ${subject.league} career lasted ${subject.endSeason - subject.startSeason + 1} seasons.`,
      "helpful",
    ));
  }
  if (isCoach && subject.startSeason != null) {
    clues.push(clue("coach-start", `I first became a ${subject.league} head coach in ${subject.startSeason}.`, "helpful"));
  }
  if (isCoach && subject.endSeason != null) {
    clues.push(clue("coach-end", `My ${subject.league} head-coaching career most recently reached ${subject.endSeason}.`, "strong"));
  }

  if (subject.school) clues.push(clue("school", `I played college football at ${subject.school}.`, subject.league === "NFL" ? "helpful" : "broad"));
  if (subject.conference) clues.push(clue("conference", `I competed in the ${subject.conference}.`, "helpful"));
  const draftProfile = footballDraftProfile(subject);
  if (draftProfile.draftYear != null && draftProfile.draftPick != null) {
    clues.push(clue(
      "draft-pick",
      `I was selected No. ${draftProfile.draftPick} overall in the ${draftProfile.draftYear} NFL Draft.`,
      "strong",
    ));
  } else if (draftProfile.draftYear != null && draftProfile.draftRound != null) {
    clues.push(clue(
      "draft-round",
      `I was selected in round ${draftProfile.draftRound} of the ${draftProfile.draftYear} NFL Draft.`,
      "strong",
    ));
  } else if (draftProfile.draftYear != null) {
    clues.push(clue("draft-year", `I entered the NFL draft in ${draftProfile.draftYear}.`, "helpful"));
  } else if (draftProfile.firstOverallPick) {
    clues.push(clue("first-overall", "I was the No. 1 overall NFL draft pick.", "strong"));
  } else if (draftProfile.firstRoundPick) {
    clues.push(clue("first-round", "I was a first-round NFL draft pick.", "strong"));
  } else if (draftProfile.undrafted) {
    clues.push(clue("undrafted", "I entered the NFL undrafted.", "strong"));
  }
  if (subject.heismanWinner) clues.push(clue("heisman", "I won the Heisman Trophy.", "strong"));
  if (subject.nationalChampion) clues.push(clue("national-champion", "I was part of a college national championship team.", "strong"));

  const history = footballCareerAffiliationHistoryFor(subject);
  const affiliations = (history?.affiliations ?? []).map((affiliation) => displayAffiliation(subject.league, affiliation));
  const uniqueAffiliations = [...new Set(affiliations)];
  if (isCoach && uniqueAffiliations.length) {
    clues.push(clue(
      "coach-affiliation-count",
      `I was a ${subject.league} head coach for ${uniqueAffiliations.length} ${uniqueAffiliations.length === 1 ? "team" : "teams"}.`,
      "helpful",
    ));
  }
  if (uniqueAffiliations.length > 1) {
    clues.push(clue(
      "career-path",
      subject.league === "NFL"
        ? isCoach
          ? `I was an NFL head coach for the ${uniqueAffiliations.join(" and ")}.`
          : `I played for ${uniqueAffiliations.join(" and ")} in the NFL.`
        : isCoach
          ? `I was a college head coach at ${uniqueAffiliations.join(" and ")}.`
          : `My college career included ${uniqueAffiliations.join(" and ")}.`,
      "strong",
    ));
  }
  for (const affiliation of uniqueAffiliations) {
    if (subject.league === "CFB" && subject.school && slug(affiliation) === slug(subject.school)) continue;
    clues.push(clue(
      `affiliation:${slug(affiliation)}`,
      subject.league === "NFL"
        ? isCoach
          ? `I was an NFL head coach for the ${affiliation}.`
          : `I played for the ${affiliation}.`
        : isCoach
          ? `I was a college head coach at ${affiliation}.`
          : `My college career included ${affiliation}.`,
      "giveaway",
    ));
  }
  for (const conference of history?.conferences ?? []) {
    if (subject.conference && slug(conference) === slug(subject.conference)) continue;
    clues.push(clue(`historical-conference:${slug(conference)}`, `I competed in the ${conference}.`, "strong"));
  }

  return clues;
}

function footballCandidate(subject: FootballSubjectProfile): WhoAmICandidate {
  const kind = subject.kind === "coach" ? "coach" : "player";
  return {
    id: subject.id,
    name: subject.name,
    kind,
    eraBand: footballEraBand(subject),
    rescueGroup: kind === "coach" ? `${subject.league}:coach` : `${subject.league}:${subject.position ?? "player"}`,
    clues: distinctClues([
      ...footballIdentityClues(subject),
      ...footballMetricClues(subject),
      ...footballPersonIdentityClues(subject),
      ...footballProResumeClues(subject),
    ]),
  };
}

export type FootballWhoAmIPositionGroup = "QB" | "RB" | "WR" | "TE" | "OL" | "DL/EDGE" | "LB" | "DB";

export interface FootballWhoAmILaunchPool {
  league: "NFL" | "CFB";
  players: readonly FootballSubjectProfile[];
  coaches: readonly FootballSubjectProfile[];
  subjects: readonly FootballSubjectProfile[];
}

const FOOTBALL_WHO_AM_I_POSITION_GROUPS: readonly FootballWhoAmIPositionGroup[] = [
  "QB", "RB", "WR", "TE", "OL", "DL/EDGE", "LB", "DB",
];

export const FOOTBALL_WHO_AM_I_PLAYER_TARGETS: Readonly<Record<"NFL" | "CFB", Readonly<Record<FootballWhoAmIPositionGroup, number>>>> = {
  NFL: { QB: 29, RB: 26, WR: 32, TE: 13, OL: 12, "DL/EDGE": 26, LB: 18, DB: 24 },
  CFB: { QB: 31, RB: 30, WR: 23, TE: 12, OL: 12, "DL/EDGE": 24, LB: 20, DB: 28 },
};

const FOOTBALL_WHO_AM_I_COACH_TARGET = 20;
const RECOGNITION_TIER_RANK = { A: 0, B: 1 } as const;

export function footballWhoAmIPositionGroup(position: FootballSubjectProfile["position"]): FootballWhoAmIPositionGroup | null {
  switch (position) {
    case "QB": return "QB";
    case "RB": return "RB";
    case "WR": return "WR";
    case "TE": return "TE";
    case "OL": return "OL";
    case "DL": return "DL/EDGE";
    case "LB": return "LB";
    case "DB": return "DB";
    case "K":
    case "P":
    case undefined:
      return null;
  }
}

function stableTextCompare(left: string, right: string) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function footballLaunchSubjectCompare(left: FootballSubjectProfile, right: FootballSubjectProfile) {
  const tierDifference = RECOGNITION_TIER_RANK[left.recognizabilityTier as "A" | "B"]
    - RECOGNITION_TIER_RANK[right.recognizabilityTier as "A" | "B"];
  if (tierDifference !== 0) return tierDifference;
  const nameDifference = stableTextCompare(left.name.toLowerCase(), right.name.toLowerCase());
  return nameDifference || stableTextCompare(left.id, right.id);
}

function preserveEraDiversityWithinTier(
  selectedSubjects: readonly FootballSubjectProfile[],
  availableSubjects: readonly FootballSubjectProfile[],
) {
  const selected = [...selectedSubjects];
  for (const era of ["modern", "legacy"] as const) {
    if (selected.some((subject) => footballEraBand(subject) === era)) continue;
    const replacement = [...availableSubjects]
      .filter((subject) => footballEraBand(subject) === era)
      .sort(footballLaunchSubjectCompare)
      .find((candidate) => selected.some((subject) => subject.recognizabilityTier === candidate.recognizabilityTier));
    if (!replacement) continue;
    const replaceIndex = [...selected.keys()]
      .reverse()
      .find((index) => selected[index]!.recognizabilityTier === replacement.recognizabilityTier);
    if (replaceIndex != null) selected[replaceIndex] = replacement;
  }
  return selected.sort(footballLaunchSubjectCompare);
}

function selectedFootballSubjects(league: "NFL" | "CFB") {
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
    if (
      !current
      || nextDepth > currentDepth
      || (nextDepth === currentDepth && stableTextCompare(subject.id, current.id) < 0)
    ) {
      byPerson.set(key, subject);
    }
  }
  return [...byPerson.values()];
}

function requireLaunchCount(
  league: "NFL" | "CFB",
  label: string,
  available: readonly FootballSubjectProfile[],
  count: number,
) {
  if (available.length < count) {
    throw new Error(`Who Am I ${league} launch pool needs ${count} ${label}; canonical A/B registry has ${available.length}.`);
  }
}

function footballLaunchPool(league: "NFL" | "CFB"): FootballWhoAmILaunchPool {
  const recognized = selectedFootballSubjects(league);
  const playerCandidates = recognized.filter((subject) => subject.kind === "player-career");
  const coachCandidates = recognized.filter((subject) => subject.kind === "coach");
  const targets = FOOTBALL_WHO_AM_I_PLAYER_TARGETS[league];

  const players = FOOTBALL_WHO_AM_I_POSITION_GROUPS.flatMap((group) => {
    const available = playerCandidates
      .filter((subject) => footballWhoAmIPositionGroup(subject.position) === group)
      .sort(footballLaunchSubjectCompare);
    const target = targets[group];
    requireLaunchCount(league, `${group} players`, available, target);
    return preserveEraDiversityWithinTier(available.slice(0, target), available);
  });

  const sortedCoaches = [...coachCandidates].sort(footballLaunchSubjectCompare);
  requireLaunchCount(league, "head coaches", sortedCoaches, FOOTBALL_WHO_AM_I_COACH_TARGET);
  const coaches = sortedCoaches.slice(0, FOOTBALL_WHO_AM_I_COACH_TARGET);

  return { league, players, coaches, subjects: [...players, ...coaches] };
}

const nflLaunchPool = footballLaunchPool("NFL");
const cfbLaunchPool = footballLaunchPool("CFB");

function footballUniverse(launchPool: FootballWhoAmILaunchPool): WhoAmIUniverse {
  return {
    sport: "football",
    league: launchPool.league,
    candidates: launchPool.subjects.map(footballCandidate),
  };
}

const ufcUniverse: WhoAmIUniverse = {
  sport: "ufc",
  league: "UFC",
  candidates: ufcFactualLedgerSubjects.map(ufcCandidate),
};

const nflUniverse = footballUniverse(nflLaunchPool);
const cfbUniverse = footballUniverse(cfbLaunchPool);

export function getUfcWhoAmIUniverse() {
  return ufcUniverse;
}

export function getFootballWhoAmILaunchPool(league: "NFL" | "CFB") {
  return league === "NFL" ? nflLaunchPool : cfbLaunchPool;
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
