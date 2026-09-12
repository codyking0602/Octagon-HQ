import { footballCareerAffiliationHistoryFor } from "../back-room/footballCareerAffiliationProjection";
import { getFootballFactualRecord } from "../back-room/footballFactualStatsCore";
import {
  getFootballSubject,
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";
import {
  twentyQuestionsCostForSplit,
  type TwentyQuestionsQuestion,
  type TwentyQuestionsSubject,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";

export type FootballTwentyQuestionsLeague = "NFL" | "CFB";
type Role = "player" | "coach";
type Answer = boolean | null;
type Person = { key: string; nameKey: string; role: Role; records: FootballSubjectProfile[] };
type PersonCandidate = Omit<Person, "role">;
type Predicate = { family: string; id: string; answer: (person: Person) => Answer };
type NumericSpec =
  | readonly [string, string, readonly number[]]
  | readonly [string, string, readonly number[], readonly string[]];

export const FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT = 100;
export const FOOTBALL_TWENTY_QUESTIONS_COACH_COUNT = 20;

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const stableHash = (value: string) => {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const tierRank = (tier: FootballSubjectProfile["recognizabilityTier"]) => tier === "A" ? 2 : tier === "B" ? 1 : 0;

function roleRecords(person: Pick<Person, "role" | "records">) {
  return person.records.filter((record) => person.role === "player" ? record.kind === "player-career" : record.kind === "coach");
}

function strongestRoleTier(records: readonly FootballSubjectProfile[], role: Role) {
  return Math.max(0, ...records
    .filter((record) => role === "player" ? record.kind === "player-career" : record.kind === "coach")
    .map((record) => tierRank(record.recognizabilityTier)));
}

function rawPeople(league: FootballTwentyQuestionsLeague) {
  const byIdentity = new Map<string, PersonCandidate>();
  for (const record of queryFootballSubjects({
    league,
    recognizabilityTiers: ["A", "B"],
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).filter((subject) => subject.kind === "player-career" || subject.kind === "coach")) {
    const role: Role = record.kind === "coach" ? "coach" : "player";
    const canonicalId = getFootballSubject(record.id)?.id ?? record.id;
    const identityKey = `${role}:${canonicalId}`;
    const existing = byIdentity.get(identityKey) ?? { key: identityKey, nameKey: normalize(record.name), records: [] };
    if (!existing.records.some((candidate) => candidate.id === record.id && candidate.kind === record.kind)) existing.records.push(record);
    byIdentity.set(identityKey, existing);
  }
  return [...byIdentity.values()];
}

function roleWindow(person: Person) {
  const records = roleRecords(person);
  const starts = records.flatMap((record) => record.startSeason == null ? [] : [record.startSeason]);
  const ends = records.flatMap((record) => record.endSeason == null ? [] : [record.endSeason]);
  if (!starts.length || !ends.length) return null;
  return { start: Math.min(...starts), end: Math.max(...ends) };
}

function roleActiveDecades(person: Person) {
  const decades = roleRecords(person).flatMap((record) => record.activeDecades ?? []);
  if (decades.length) return [...new Set(decades)];
  const window = roleWindow(person);
  if (!window) return null;
  const result: number[] = [];
  for (let decade = Math.floor(window.start / 10) * 10; decade <= Math.floor(window.end / 10) * 10; decade += 10) result.push(decade);
  return result;
}

function rolePosition(person: Person) {
  if (person.role === "coach") return "Coach";
  const positions = [...new Set(roleRecords(person).flatMap((record) => {
    const canonical = getFootballSubject(record.id);
    const position = canonical?.position ?? record.position;
    return position ? [position] : [];
  }))];
  return positions.length === 1 ? positions[0]! : null;
}

function roleSchool(person: Person) {
  const schools = [...new Set(roleRecords(person).flatMap((record) => {
    const canonical = getFootballSubject(record.id);
    const school = canonical?.school ?? record.school;
    return school ? [school] : [];
  }))];
  return schools.length === 1 ? schools[0]! : null;
}

function numericFact(person: Person, metricId: string) {
  const values = roleRecords(person).flatMap((record) => {
    const fact = getFootballFactualRecord(record.id)?.facts.find((row) => row.metricId === metricId);
    return fact ? [fact.value] : [];
  });
  const unique = [...new Set(values)];
  return unique.length === 1 ? unique[0]! : null;
}

function careerAffiliations(person: Person) {
  const records = roleRecords(person);
  const histories = records.map((record) => footballCareerAffiliationHistoryFor(record)).filter((history) => history != null);
  if (!histories.length) return null;
  return {
    affiliations: [...new Set(histories.flatMap((history) => history.affiliations))],
    conferences: [...new Set(histories.flatMap((history) => history.conferences))],
    complete: histories.length === records.length && histories.every((history) => history.complete),
  };
}

function affiliationAnswer(person: Person, value: string, field: "affiliations" | "conferences"): Answer {
  const history = careerAffiliations(person);
  if (!history) return null;
  if (history[field].includes(value)) return true;
  return history.complete ? false : null;
}

function factualDepthForCandidate(candidate: PersonCandidate, role: Role) {
  const person: Person = { ...candidate, role };
  const metrics = new Set(roleRecords(person).flatMap((record) => getFootballFactualRecord(record.id)?.facts.map((fact) => fact.metricId) ?? []));
  let score = metrics.size * 100 + strongestRoleTier(candidate.records, role) * 250;
  if (roleWindow(person)) score += 30;
  if (role === "player" && rolePosition(person)) score += 20;
  if (role === "player" && roleSchool(person)) score += 20;
  const affiliations = careerAffiliations(person);
  if (affiliations?.affiliations.length) score += 10;
  if (affiliations?.complete) score += 20;
  return score;
}

function sortRoleCandidates(candidates: readonly PersonCandidate[], role: Role) {
  return [...candidates]
    .filter((person) => strongestRoleTier(person.records, role) > 0)
    .sort((a, b) => factualDepthForCandidate(b, role) - factualDepthForCandidate(a, role) || stableHash(a.key) - stableHash(b.key));
}

function selectLaunchPool(league: FootballTwentyQuestionsLeague) {
  const people = rawPeople(league);
  const coaches = sortRoleCandidates(people, "coach").slice(0, FOOTBALL_TWENTY_QUESTIONS_COACH_COUNT);
  const coachNames = new Set(coaches.map((person) => person.nameKey));
  const playerCandidates = sortRoleCandidates(people.filter((person) => !coachNames.has(person.nameKey)), "player");
  const offensiveLine = playerCandidates.filter((candidate) => {
    const person: Person = { ...candidate, role: "player" };
    if (rolePosition(person) !== "OL") return false;
    const window = roleWindow(person);
    if (window?.end != null) return window.end >= 2000;
    const metrics = roleRecords(person).flatMap((record) => getFootballFactualRecord(record.id)?.facts.map((fact) => fact.metricId) ?? []);
    return league === "CFB" && metrics.includes("cfb-career-games");
  }).slice(0, 2);
  const caps: Record<string, number> = { QB: 30, RB: 25, WR: 15, TE: 10, DL: 12, LB: 10, DB: 15, K: 3, P: 3 };
  const counts = new Map<string, number>();
  const nonOl: PersonCandidate[] = [];
  for (const candidate of playerCandidates) {
    if (nonOl.length >= FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT - offensiveLine.length) break;
    const person: Person = { ...candidate, role: "player" };
    const position = rolePosition(person);
    if (!position || position === "OL") continue;
    const count = counts.get(position) ?? 0;
    if (count >= (caps[position] ?? 10)) continue;
    counts.set(position, count + 1);
    nonOl.push(candidate);
  }
  if (nonOl.length < FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT - offensiveLine.length) {
    const selected = new Set(nonOl.map((candidate) => candidate.key));
    for (const candidate of playerCandidates) {
      if (nonOl.length >= FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT - offensiveLine.length) break;
      const person: Person = { ...candidate, role: "player" };
      if (rolePosition(person) === "OL" || selected.has(candidate.key)) continue;
      selected.add(candidate.key);
      nonOl.push(candidate);
    }
  }
  return [
    ...[...nonOl, ...offensiveLine].map((person): Person => ({ ...person, role: "player" })),
    ...coaches.map((person): Person => ({ ...person, role: "coach" })),
  ];
}

function metricThreshold(person: Person, role: Role, metricId: string, threshold: number, positions?: readonly string[]): Answer {
  if (person.role !== role) return false;
  if (role === "player" && positions?.length) {
    const position = rolePosition(person);
    if (position == null) return null;
    if (!positions.includes(position)) return false;
  }
  const value = numericFact(person, metricId);
  return value == null ? null : value >= threshold;
}

function winPercentageThreshold(person: Person, role: Role, winsMetricId: string, lossesMetricId: string, threshold: number): Answer {
  if (person.role !== role) return false;
  const wins = numericFact(person, winsMetricId);
  const losses = numericFact(person, lossesMetricId);
  if (wins == null || losses == null || wins + losses <= 0) return null;
  return wins / (wins + losses) * 100 >= threshold;
}

function buildPredicates(league: FootballTwentyQuestionsLeague, pool: readonly Person[]) {
  const rows: Predicate[] = [];
  const add = (family: string, id: string, answer: Predicate["answer"]) => rows.push({ family, id, answer });
  add("role", "head-coach", (person) => person.role === "coach");
  add("role", "player", (person) => person.role === "player");

  const playerPositions = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"] as const;
  for (const position of playerPositions) add("position", position, (person) => person.role === "coach" ? false : rolePosition(person) == null ? null : rolePosition(person) === position);
  add("position-family", "offense", (person) => person.role === "coach" ? false : rolePosition(person) == null ? null : ["QB", "RB", "WR", "TE", "OL"].includes(rolePosition(person)!));
  add("position-family", "defense", (person) => person.role === "coach" ? false : rolePosition(person) == null ? null : ["DL", "LB", "DB"].includes(rolePosition(person)!));
  add("position-family", "special-teams", (person) => person.role === "coach" ? false : rolePosition(person) == null ? null : ["K", "P"].includes(rolePosition(person)!));

  const eraCutoffs = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;
  for (const role of ["player", "coach"] as const) {
    for (const cutoff of eraCutoffs) {
      add(`${role}:era`, `started-before-${cutoff}`, (person) => person.role !== role ? false : roleWindow(person) == null ? null : roleWindow(person)!.start < cutoff);
      add(`${role}:era`, `ended-before-${cutoff}`, (person) => person.role !== role ? false : roleWindow(person) == null ? null : roleWindow(person)!.end < cutoff);
    }
    for (const decade of eraCutoffs) add(`${role}:era`, `active-${decade}s`, (person) => person.role !== role ? false : roleActiveDecades(person) == null ? null : roleActiveDecades(person)!.includes(decade));
    for (const years of [4, 8, 12, 16, 20]) add(`${role}:longevity`, `${years}-plus-seasons`, (person) => person.role !== role ? false : roleWindow(person) == null ? null : roleWindow(person)!.end - roleWindow(person)!.start + 1 >= years);
  }

  const playerSchools = new Set(pool.flatMap((person) => person.role === "player" && roleSchool(person) ? [roleSchool(person)!] : []));
  for (const school of playerSchools) {
    // This predicate is deliberately about the registry-owned primary college identity,
    // not an exhaustive transfer history. A player with no single primary school answers
    // No rather than turning every other player's school question into an unknown.
    add(
      league === "CFB" ? "player-primary-program" : "player-primary-college",
      school,
      (person) => person.role === "player" && roleSchool(person) === school,
    );
  }

  const affiliationValues = new Set(pool.flatMap((person) => careerAffiliations(person)?.affiliations ?? []));
  for (const affiliation of affiliationValues) add(league === "NFL" ? "franchise" : "program", affiliation, (person) => affiliationAnswer(person, affiliation, "affiliations"));
  if (league === "CFB") {
    const conferenceValues = new Set(pool.flatMap((person) => careerAffiliations(person)?.conferences ?? []));
    for (const conference of conferenceValues) add("historical-conference", conference, (person) => affiliationAnswer(person, conference, "conferences"));
  }

  for (const position of playerPositions) {
    const thresholds = league === "NFL" ? Array.from({ length: 25 }, (_value, index) => 10 + index * 10) : Array.from({ length: 12 }, (_value, index) => 5 + index * 5);
    for (const threshold of thresholds) add(`production:${position}:games`, String(threshold), (person) => metricThreshold(person, "player", league === "NFL" ? "nfl-career-games" : "cfb-career-games", threshold, [position]));
  }

  const playerSpecs: readonly NumericSpec[] = league === "NFL" ? [
    ["production:pass-yards", "nfl-career-passing-yards", Array.from({ length: 31 }, (_value, index) => 2_500 + index * 2_500), ["QB"]],
    ["production:pass-td", "nfl-career-passing-touchdowns", Array.from({ length: 20 }, (_value, index) => 25 + index * 25), ["QB"]],
    ["production:rush-yards", "nfl-career-rushing-yards", Array.from({ length: 32 }, (_value, index) => 500 + index * 500), ["RB"]],
    ["production:rush-td", "nfl-career-rushing-touchdowns", Array.from({ length: 25 }, (_value, index) => 5 + index * 5), ["RB"]],
    ["production:rec-yards", "nfl-career-receiving-yards", Array.from({ length: 32 }, (_value, index) => 500 + index * 500), ["WR", "TE"]],
    ["production:receptions", "nfl-career-receptions", Array.from({ length: 24 }, (_value, index) => 50 + index * 50), ["WR", "TE"]],
    ["production:rec-td", "nfl-career-receiving-touchdowns", Array.from({ length: 25 }, (_value, index) => 5 + index * 5), ["WR", "TE"]],
    ["production:sacks", "nfl-career-sacks", Array.from({ length: 32 }, (_value, index) => 5 + index * 5), ["DL", "LB"]],
    ["production:interceptions", "nfl-career-interceptions", [5, 10, 15, 20, 25, 30, 35, 40, 50, 60], ["DB", "LB"]],
    ["production:field-goals", "nfl-career-field-goals-made", [50, 100, 150, 200, 250, 300, 400, 500], ["K"]],
    ["production:punts", "nfl-career-punts", [100, 250, 500, 750, 1_000], ["P"]],
    ["award:mvp", "nfl-ap-mvp-awards", [1, 2, 3, 4, 5]],
  ] : [
    ["production:pass-yards", "cfb-career-passing-yards", Array.from({ length: 14 }, (_value, index) => 1_000 + index * 1_000), ["QB"]],
    ["production:pass-td", "cfb-career-passing-touchdowns", Array.from({ length: 13 }, (_value, index) => 10 + index * 10), ["QB"]],
    ["production:rush-yards", "cfb-career-rushing-yards", Array.from({ length: 12 }, (_value, index) => 500 + index * 500), ["RB"]],
    ["production:rush-td", "cfb-career-rushing-touchdowns", Array.from({ length: 15 }, (_value, index) => 5 + index * 5), ["RB"]],
    ["production:rec-yards", "cfb-career-receiving-yards", Array.from({ length: 8 }, (_value, index) => 500 + index * 500), ["WR", "TE"]],
    ["production:receptions", "cfb-career-receptions", [25, 50, 75, 100, 150, 200, 250, 300], ["WR", "TE"]],
    ["production:sacks", "cfb-career-sacks", [5, 10, 15, 20, 25, 30], ["DL", "LB"]],
    ["production:interceptions", "cfb-career-defensive-interceptions", [3, 5, 7, 10, 12, 15, 20], ["DB", "LB"]],
    ["award:heisman", "cfb-heisman-awards", [1, 2]],
  ];
  for (const [family, metricId, thresholds, positions] of playerSpecs) for (const threshold of thresholds) add(family, String(threshold), (person) => metricThreshold(person, "player", metricId, threshold, positions));

  if (league === "NFL") for (const position of playerPositions) {
    for (const threshold of [1, 2, 3, 4, 5, 6, 7]) add(`award:${position}:first-team-all-pro`, String(threshold), (person) => metricThreshold(person, "player", "nfl-first-team-all-pros", threshold, [position]));
    for (const threshold of [1, 2, 3, 4]) add(`championship:${position}:super-bowl`, String(threshold), (person) => metricThreshold(person, "player", "nfl-super-bowl-titles", threshold, [position]));
  }

  const coachSpecs: readonly NumericSpec[] = league === "NFL" ? [
    ["coach:seasons", "nfl-coach-seasons-since-1999", [3, 5, 8, 10, 12, 15, 20, 25]],
    ["coach:win-pct", "nfl-coach-win-percentage-since-1999", [45, 50, 55, 60, 65, 70, 75]],
    ["coach:best-win-pct", "nfl-coach-best-season-win-percentage-since-1999", [55, 60, 65, 70, 75, 80, 85]],
    ["coach:postseason", "nfl-coach-postseason-resume-since-1999", [1, 2, 4, 6, 8, 10, 12, 15, 20]],
  ] : [
    ["coach:wins", "cfb-coach-career-wins", Array.from({ length: 29 }, (_value, index) => 20 + index * 10)],
    ["coach:losses", "cfb-coach-career-losses", Array.from({ length: 15 }, (_value, index) => 10 + index * 10)],
    ["coach:national-titles", "cfb-coach-national-titles", [1, 2, 3, 4, 5, 6, 7]],
    ["coach:conference-titles", "cfb-coach-conference-titles", [1, 2, 3, 4, 5, 7, 10]],
  ];
  for (const [family, metricId, thresholds] of coachSpecs) for (const threshold of thresholds) add(family, String(threshold), (person) => metricThreshold(person, "coach", metricId, threshold));
  if (league === "CFB") for (const threshold of [45, 50, 55, 60, 65, 70, 75, 80, 85]) add("coach:career-win-pct", String(threshold), (person) => winPercentageThreshold(person, "coach", "cfb-coach-career-wins", "cfb-coach-career-losses", threshold));

  for (const position of playerPositions) {
    const fineGameThresholds = league === "NFL" ? Array.from({ length: 350 }, (_value, index) => index + 1) : Array.from({ length: 60 }, (_value, index) => index + 1);
    for (const threshold of fineGameThresholds) add(`production:${position}:games-fine`, String(threshold), (person) => metricThreshold(person, "player", league === "NFL" ? "nfl-career-games" : "cfb-career-games", threshold, [position]));
  }
  if (league === "NFL") {
    for (const cutoff of Array.from({ length: 15 }, (_value, index) => 1955 + index * 5)) {
      add("coach:era-fine", `started-before-${cutoff}`, (person) => person.role !== "coach" ? false : roleWindow(person) == null ? null : roleWindow(person)!.start < cutoff);
      add("coach:era-fine", `ended-before-${cutoff}`, (person) => person.role !== "coach" ? false : roleWindow(person) == null ? null : roleWindow(person)!.end < cutoff);
    }
    for (const years of Array.from({ length: 15 }, (_value, index) => 2 + index * 2)) add("coach:longevity-fine", `${years}-plus-seasons`, (person) => person.role !== "coach" ? false : roleWindow(person) == null ? null : roleWindow(person)!.end - roleWindow(person)!.start + 1 >= years);
  } else {
    for (const threshold of Array.from({ length: 57 }, (_value, index) => 20 + index * 5)) add("coach:wins-fine", String(threshold), (person) => metricThreshold(person, "coach", "cfb-coach-career-wins", threshold));
    for (const threshold of Array.from({ length: 39 }, (_value, index) => 10 + index * 5)) add("coach:losses-fine", String(threshold), (person) => metricThreshold(person, "coach", "cfb-coach-career-losses", threshold));
    for (const threshold of Array.from({ length: 21 }, (_value, index) => 40 + index * 2.5)) add("coach:career-win-pct-fine", String(threshold), (person) => winPercentageThreshold(person, "coach", "cfb-coach-career-wins", "cfb-coach-career-losses", threshold));
  }
  return rows;
}

function canonicalPartitionSignature(values: readonly boolean[]) {
  const direct = values.map((value) => value ? "1" : "0").join("");
  const inverse = values.map((value) => value ? "0" : "1").join("");
  return direct < inverse ? direct : inverse;
}

const metricLabels: Record<string, string> = {
  "production:pass-yards": "career passing yards",
  "production:pass-td": "career passing touchdowns",
  "production:rush-yards": "career rushing yards",
  "production:rush-td": "career rushing touchdowns",
  "production:rec-yards": "career receiving yards",
  "production:receptions": "career receptions",
  "production:rec-td": "career receiving touchdowns",
  "production:sacks": "career sacks",
  "production:interceptions": "career interceptions",
  "production:field-goals": "career field goals",
  "production:punts": "career punts",
  "award:mvp": "AP MVP awards",
  "award:heisman": "Heisman Trophies",
  "coach:seasons": "head-coaching seasons since 1999",
  "coach:win-pct": "head-coaching win percentage since 1999",
  "coach:best-win-pct": "best-season win percentage since 1999",
  "coach:postseason": "postseason résumé points since 1999",
  "coach:wins": "career head-coaching wins",
  "coach:wins-fine": "career head-coaching wins",
  "coach:losses": "career head-coaching losses",
  "coach:losses-fine": "career head-coaching losses",
  "coach:national-titles": "national titles as a head coach",
  "coach:conference-titles": "conference titles as a head coach",
  "coach:career-win-pct": "career head-coaching win percentage",
  "coach:career-win-pct-fine": "career head-coaching win percentage",
};

function questionLabel(league: FootballTwentyQuestionsLeague, family: string, id: string) {
  if (family === "role") return id === "head-coach" ? "Is this person a head coach?" : "Is this person a player?";
  if (family === "position") return `Is this player a ${id}?`;
  if (family === "position-family") return `Does this player play ${id.replace("-", " ")}?`;
  if (family === "player-program") return `Did this player play college football at ${id}?`;
  if (family === "player-college") return `Did this NFL player play college football at ${id}?`;
  if (family === "player-primary-program") return `Is this player's primary college program ${id}?`;
  if (family === "player-primary-college") return `Is this NFL player's primary college program ${id}?`;
  if (family === "franchise") return `Did this person play or coach for the ${id}?`;
  if (family === "program") return `Did this person play or coach at ${id}?`;
  if (family === "historical-conference") return `Was this person's college career affiliated with the ${id}?`;
  if (family.endsWith(":era") || family === "coach:era-fine") {
    const role = family.startsWith("player") ? "player" : family.startsWith("coach") ? "coach" : "person";
    if (id.startsWith("active-")) return `Was this ${role} active in the ${id.slice(7)}?`;
    if (id.startsWith("started-before-")) return `Did this ${role}'s career start before ${id.slice(15)}?`;
    if (id.startsWith("ended-before-")) return `Did this ${role}'s career end before ${id.slice(13)}?`;
  }
  if (family.endsWith(":longevity") || family === "coach:longevity-fine") return `Did this ${family.startsWith("player") ? "player" : "coach"} have a career lasting at least ${id.replace("-plus-seasons", "")} seasons?`;
  const gameMatch = family.match(/^production:([^:]+):games(?:-fine)?$/);
  if (gameMatch) return `Did this ${gameMatch[1]} play at least ${id} ${league === "NFL" ? "NFL" : "college"} games?`;
  const allProMatch = family.match(/^award:([^:]+):first-team-all-pro$/);
  if (allProMatch) return `Was this ${allProMatch[1]} a first-team All-Pro at least ${id} time${id === "1" ? "" : "s"}?`;
  const superBowlMatch = family.match(/^championship:([^:]+):super-bowl$/);
  if (superBowlMatch) return `Did this ${superBowlMatch[1]} win at least ${id} Super Bowl${id === "1" ? "" : "s"}?`;
  const metric = metricLabels[family];
  if (metric) return `Does this person have at least ${id} ${metric}?`;
  return `Does this person match ${family.replace(/[:\-]/g, " ")} ${id}?`;
}

function buildLiveQuestions(league: FootballTwentyQuestionsLeague, pool: readonly Person[]): TwentyQuestionsQuestion[] {
  const predicates = buildPredicates(league, pool);
  const byPartition = new Map<string, { predicate: Predicate; values: boolean[]; yes: number }>();
  for (const predicate of predicates) {
    const rawValues = pool.map(predicate.answer);
    if (rawValues.some((value) => value == null)) continue;
    const values = rawValues as boolean[];
    const yes = values.filter(Boolean).length;
    if (yes === 0 || yes === pool.length) continue;
    const signature = canonicalPartitionSignature(values);
    if (!byPartition.has(signature)) byPartition.set(signature, { predicate, values, yes });
  }
  return [...byPartition.values()].map(({ predicate, values, yes }) => {
    const answerById = new Map(pool.map((person, index) => [person.key, values[index]!]));
    return {
      id: `${predicate.family}:${normalize(predicate.id) || predicate.id}`,
      label: questionLabel(league, predicate.family, predicate.id),
      internalCost: twentyQuestionsCostForSplit(yes, pool.length),
      answer: (subjectId: string) => {
        const value = answerById.get(subjectId);
        if (value == null) throw new Error(`Unknown ${league} 20 Questions subject: ${subjectId}`);
        return value;
      },
    };
  });
}

const cache = new Map<FootballTwentyQuestionsLeague, TwentyQuestionsUniverse>();

export function getFootballTwentyQuestionsUniverse(league: FootballTwentyQuestionsLeague): TwentyQuestionsUniverse {
  const cached = cache.get(league);
  if (cached) return cached;
  const pool = selectLaunchPool(league);
  const subjects: TwentyQuestionsSubject[] = pool.map((person) => ({
    id: person.key,
    name: roleRecords(person)[0]?.name ?? person.records[0]?.name ?? person.key,
    kind: person.role,
    league,
  }));
  if (subjects.filter((subject) => subject.kind === "player").length !== FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT
    || subjects.filter((subject) => subject.kind === "coach").length !== FOOTBALL_TWENTY_QUESTIONS_COACH_COUNT) {
    throw new Error(`${league} 20 Questions launch pool must contain 100 players and 20 head coaches.`);
  }
  const universe = { league, subjects, questions: buildLiveQuestions(league, pool) } satisfies TwentyQuestionsUniverse;
  cache.set(league, universe);
  return universe;
}

export function footballTwentyQuestionsReadiness(league: FootballTwentyQuestionsLeague) {
  const universe = getFootballTwentyQuestionsUniverse(league);
  return {
    subjectCount: universe.subjects.length,
    playerCount: universe.subjects.filter((subject) => subject.kind === "player").length,
    coachCount: universe.subjects.filter((subject) => subject.kind === "coach").length,
    questionCount: universe.questions.length,
    unknownLiveAnswers: universe.questions.reduce((sum, question) => sum + universe.subjects.filter((subject) => typeof question.answer(subject.id) !== "boolean").length, 0),
  };
}
