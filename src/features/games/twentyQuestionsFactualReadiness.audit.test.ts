import { describe, expect, it } from "vitest";
import { footballCareerAffiliationHistoryFor } from "../back-room/footballCareerAffiliationProjection";
import { getFootballFactualRecord } from "../back-room/footballFactualStatsCore";
import {
  getFootballSubject,
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";

type League = "NFL" | "CFB";
type Role = "player" | "coach";
type Answer = boolean | null;
type Person = { key: string; nameKey: string; role: Role; records: FootballSubjectProfile[] };
type PersonCandidate = Omit<Person, "role">;
type Predicate = { family: string; id: string; answer: (person: Person) => Answer };
type NumericSpec =
  | readonly [string, string, readonly number[]]
  | readonly [string, string, readonly number[], readonly string[]];

const PLAYER_TARGET = 100;
const COACH_TARGET = 20;
const MIN_USEFUL_YES = 1;
const MIN_USEFUL_NO = 1;

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
const isEligibleTier = (record: FootballSubjectProfile) => record.recognizabilityTier === "A" || record.recognizabilityTier === "B";

function roleRecords(person: Pick<Person, "role" | "records">) {
  return person.records.filter((record) => person.role === "player" ? record.kind === "player-career" : record.kind === "coach");
}

function strongestRoleTier(records: readonly FootballSubjectProfile[], role: Role) {
  return Math.max(0, ...records
    .filter((record) => role === "player" ? record.kind === "player-career" : record.kind === "coach")
    .map((record) => tierRank(record.recognizabilityTier)));
}

function rawPeople(league: League) {
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
    const existing = byIdentity.get(identityKey) ?? {
      key: identityKey,
      nameKey: normalize(record.name),
      records: [],
    };
    if (!existing.records.some((candidate) => candidate.id === record.id && candidate.kind === record.kind)) {
      existing.records.push(record);
    }
    byIdentity.set(identityKey, existing);
  }
  return [...byIdentity.values()];
}

function sortRoleCandidates(candidates: readonly PersonCandidate[], role: Role) {
  return [...candidates]
    .filter((person) => strongestRoleTier(person.records, role) > 0)
    .sort((a, b) => strongestRoleTier(b.records, role) - strongestRoleTier(a.records, role) || stableHash(a.key) - stableHash(b.key));
}

function selectLaunchPool(league: League) {
  const people = rawPeople(league);
  const coaches = sortRoleCandidates(people, "coach").slice(0, COACH_TARGET);
  const coachNames = new Set(coaches.map((person) => person.nameKey));
  const players = sortRoleCandidates(people.filter((person) => !coachNames.has(person.nameKey)), "player").slice(0, PLAYER_TARGET);
  return [
    ...players.map((person): Person => ({ ...person, role: "player" })),
    ...coaches.map((person): Person => ({ ...person, role: "coach" })),
  ];
}

function roleTier(person: Person) {
  return strongestRoleTier(person.records, person.role);
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

function winPercentageThreshold(
  person: Person,
  role: Role,
  winsMetricId: string,
  lossesMetricId: string,
  threshold: number,
): Answer {
  if (person.role !== role) return false;
  const wins = numericFact(person, winsMetricId);
  const losses = numericFact(person, lossesMetricId);
  if (wins == null || losses == null || wins + losses <= 0) return null;
  return wins / (wins + losses) * 100 >= threshold;
}

function careerAffiliations(person: Person) {
  const records = roleRecords(person);
  const histories = records
    .map((record) => footballCareerAffiliationHistoryFor(record))
    .filter((history) => history != null);
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

function buildPredicates(league: League, pool: readonly Person[]) {
  const rows: Predicate[] = [];
  const add = (family: string, id: string, answer: Predicate["answer"]) => rows.push({ family, id, answer });

  add("role", "head-coach", (person) => person.role === "coach");
  add("role", "player", (person) => person.role === "player");

  const playerPositions = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"] as const;
  for (const position of playerPositions) {
    add("position", position, (person) => {
      if (person.role === "coach") return false;
      const known = rolePosition(person);
      return known == null ? null : known === position;
    });
  }
  add("position-family", "offense", (person) => {
    if (person.role === "coach") return false;
    const known = rolePosition(person);
    return known == null ? null : ["QB", "RB", "WR", "TE", "OL"].includes(known);
  });
  add("position-family", "defense", (person) => {
    if (person.role === "coach") return false;
    const known = rolePosition(person);
    return known == null ? null : ["DL", "LB", "DB"].includes(known);
  });
  add("position-family", "special-teams", (person) => {
    if (person.role === "coach") return false;
    const known = rolePosition(person);
    return known == null ? null : ["K", "P"].includes(known);
  });

  const eraCutoffs = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;
  for (const role of ["player", "coach"] as const) {
    for (const cutoff of eraCutoffs) {
      add(`${role}:era`, `started-before-${cutoff}`, (person) => {
        if (person.role !== role) return false;
        const window = roleWindow(person);
        return window == null ? null : window.start < cutoff;
      });
      add(`${role}:era`, `ended-before-${cutoff}`, (person) => {
        if (person.role !== role) return false;
        const window = roleWindow(person);
        return window == null ? null : window.end < cutoff;
      });
    }
    for (const decade of eraCutoffs) {
      add(`${role}:era`, `active-${decade}s`, (person) => {
        if (person.role !== role) return false;
        const decades = roleActiveDecades(person);
        return decades == null ? null : decades.includes(decade);
      });
    }
    for (const years of [4, 8, 12, 16, 20]) {
      add(`${role}:longevity`, `${years}-plus-seasons`, (person) => {
        if (person.role !== role) return false;
        const window = roleWindow(person);
        return window == null ? null : window.end - window.start + 1 >= years;
      });
    }
  }

  if (league === "CFB") {
    const playerSchools = new Set(pool.flatMap((person) => person.role === "player" ? (roleSchool(person) ? [roleSchool(person)!] : []) : []));
    for (const school of playerSchools) {
      add("player-program", normalize(school), (person) => {
        if (person.role !== "player") return false;
        const known = roleSchool(person);
        return known == null ? null : known === school;
      });
    }
  }

  const affiliationValues = new Set(pool.flatMap((person) => careerAffiliations(person)?.affiliations ?? []));
  for (const affiliation of affiliationValues) {
    add(league === "NFL" ? "franchise" : "program", normalize(affiliation), (person) => affiliationAnswer(person, affiliation, "affiliations"));
  }
  if (league === "CFB") {
    const conferenceValues = new Set(pool.flatMap((person) => careerAffiliations(person)?.conferences ?? []));
    for (const conference of conferenceValues) {
      add("historical-conference", normalize(conference), (person) => affiliationAnswer(person, conference, "conferences"));
    }
  }

  for (const position of playerPositions) {
    const thresholds = league === "NFL" ? [25, 50, 75, 100, 125, 150, 175, 200, 225, 250] : [10, 20, 30, 40, 50, 60];
    for (const threshold of thresholds) {
      add(`production:${position}:games`, String(threshold), (person) => metricThreshold(
        person,
        "player",
        league === "NFL" ? "nfl-career-games" : "cfb-career-games",
        threshold,
        [position],
      ));
    }
  }

  const playerSpecs: readonly NumericSpec[] = league === "NFL" ? [
    ["production:pass-yards", "nfl-career-passing-yards", [5_000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000, 45_000, 50_000, 55_000, 60_000, 65_000, 70_000, 75_000], ["QB"]],
    ["production:pass-td", "nfl-career-passing-touchdowns", [50, 100, 150, 200, 250, 300, 350, 400, 450, 500], ["QB"]],
    ["production:rush-yards", "nfl-career-rushing-yards", [1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_500, 9_000, 10_000, 11_000, 12_500, 14_000, 16_000], ["RB"]],
    ["production:rush-td", "nfl-career-rushing-touchdowns", [10, 20, 30, 40, 50, 60, 75, 100, 125], ["RB"]],
    ["production:rec-yards", "nfl-career-receiving-yards", [1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_500, 9_000, 10_000, 11_000, 12_500, 14_000, 16_000], ["WR", "TE"]],
    ["production:receptions", "nfl-career-receptions", [100, 200, 300, 400, 500, 600, 750, 900, 1_000, 1_200], ["WR", "TE"]],
    ["production:rec-td", "nfl-career-receiving-touchdowns", [10, 20, 30, 40, 50, 60, 75, 100, 125], ["WR", "TE"]],
    ["production:sacks", "nfl-career-sacks", [10, 25, 40, 50, 60, 75, 90, 100, 110, 125, 140, 160], ["DL", "LB"]],
    ["production:interceptions", "nfl-career-interceptions", [5, 10, 15, 20, 25, 30, 35, 40, 50, 60], ["DB", "LB"]],
    ["production:field-goals", "nfl-career-field-goals-made", [50, 100, 150, 200, 250, 300, 400, 500], ["K"]],
    ["production:punts", "nfl-career-punts", [100, 250, 500, 750, 1_000], ["P"]],
    ["award:mvp", "nfl-ap-mvp-awards", [1, 2, 3, 4, 5]],
  ] : [
    ["production:pass-yards", "cfb-career-passing-yards", [2_000, 3_000, 4_000, 5_000, 6_000, 7_500, 9_000, 10_000, 12_000, 14_000], ["QB"]],
    ["production:pass-td", "cfb-career-passing-touchdowns", [20, 30, 40, 50, 60, 75, 100, 125], ["QB"]],
    ["production:rush-yards", "cfb-career-rushing-yards", [500, 1_000, 1_500, 2_000, 2_500, 3_000, 3_500, 4_000, 5_000, 6_000], ["RB"]],
    ["production:rush-td", "cfb-career-rushing-touchdowns", [10, 20, 30, 40, 50, 60, 75], ["RB"]],
    ["production:rec-yards", "cfb-career-receiving-yards", [500, 1_000, 1_500, 2_000, 2_500, 3_000, 3_500, 4_000], ["WR", "TE"]],
    ["production:receptions", "cfb-career-receptions", [25, 50, 75, 100, 150, 200, 250, 300], ["WR", "TE"]],
    ["production:sacks", "cfb-career-sacks", [5, 10, 15, 20, 25, 30], ["DL", "LB"]],
    ["production:interceptions", "cfb-career-defensive-interceptions", [3, 5, 7, 10, 12, 15, 20], ["DB", "LB"]],
    ["award:heisman", "cfb-heisman-awards", [1, 2]],
  ];
  for (const [family, metricId, thresholds, positions] of playerSpecs) {
    for (const threshold of thresholds) add(family, String(threshold), (person) => metricThreshold(person, "player", metricId, threshold, positions));
  }

  if (league === "NFL") {
    for (const position of playerPositions) {
      for (const threshold of [1, 2, 3, 4, 5, 6, 7]) {
        add(`award:${position}:first-team-all-pro`, String(threshold), (person) => metricThreshold(person, "player", "nfl-first-team-all-pros", threshold, [position]));
      }
      for (const threshold of [1, 2, 3, 4]) {
        add(`championship:${position}:super-bowl`, String(threshold), (person) => metricThreshold(person, "player", "nfl-super-bowl-titles", threshold, [position]));
      }
    }
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
  for (const [family, metricId, thresholds] of coachSpecs) {
    for (const threshold of thresholds) add(family, String(threshold), (person) => metricThreshold(person, "coach", metricId, threshold));
  }
  if (league === "CFB") {
    for (const threshold of [45, 50, 55, 60, 65, 70, 75, 80, 85]) {
      add("coach:career-win-pct", String(threshold), (person) => winPercentageThreshold(
        person,
        "coach",
        "cfb-coach-career-wins",
        "cfb-coach-career-losses",
        threshold,
      ));
    }
  }
  return rows;
}

function percentile(values: readonly number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1))]!;
}

function canonicalPartitionSignature(values: readonly Answer[]) {
  const direct = values.map((value) => value ? "1" : "0").join("");
  const inverse = values.map((value) => value ? "0" : "1").join("");
  return direct < inverse ? direct : inverse;
}

function isolationDepths(pool: readonly Person[], live: readonly { values: readonly Answer[] }[], indexes: readonly number[]) {
  const depths: number[] = [];
  let impossible = 0;
  for (const target of indexes) {
    let candidates = pool.map((_person, index) => index);
    const unused = new Set(live.map((_row, index) => index));
    let depth = 0;
    while (candidates.length > 1 && unused.size) {
      let bestIndex: number | null = null;
      let bestRemaining = candidates.length;
      for (const predicateIndex of unused) {
        const targetValue = live[predicateIndex]!.values[target];
        const remaining = candidates.filter((candidate) => live[predicateIndex]!.values[candidate] === targetValue).length;
        if (remaining < bestRemaining) { bestRemaining = remaining; bestIndex = predicateIndex; }
      }
      if (bestIndex == null) break;
      const targetValue = live[bestIndex]!.values[target];
      candidates = candidates.filter((candidate) => live[bestIndex]!.values[candidate] === targetValue);
      unused.delete(bestIndex);
      depth += 1;
    }
    if (candidates.length === 1) depths.push(depth);
    else impossible += 1;
  }
  return { depths, impossible };
}

function analyze(pool: readonly Person[], predicates: readonly Predicate[]) {
  const evaluated = predicates.map((predicate) => {
    const values = pool.map(predicate.answer);
    const unknown = values.filter((answer) => answer === null).length;
    const yes = values.filter((answer) => answer === true).length;
    const no = values.filter((answer) => answer === false).length;
    return { ...predicate, values, unknown, yes, no, coverage: (pool.length - unknown) / pool.length };
  });
  const fullyCovered = evaluated.filter((row) => row.unknown === 0);
  const informative = fullyCovered.filter((row) => row.yes >= MIN_USEFUL_YES && row.no >= MIN_USEFUL_NO);
  const byPartition = new Map<string, typeof informative[number]>();
  let redundantPredicates = 0;
  for (const row of informative) {
    const signature = canonicalPartitionSignature(row.values);
    if (byPartition.has(signature)) redundantPredicates += 1;
    else byPartition.set(signature, row);
  }
  const live = [...byPartition.values()];

  const fingerprintGroups = new Map<string, number[]>();
  pool.forEach((_person, index) => {
    const fingerprint = live.map((row) => row.values[index] ? "1" : "0").join("");
    const group = fingerprintGroups.get(fingerprint) ?? [];
    group.push(index);
    fingerprintGroups.set(fingerprint, group);
  });
  const duplicateGroups = [...fingerprintGroups.values()].filter((group) => group.length > 1);
  const impossibleIndexes = new Set(duplicateGroups.flat());
  const allIndexes = pool.map((_person, index) => index);
  const solvedIndexes = allIndexes.filter((index) => !impossibleIndexes.has(index));
  const overallDepth = isolationDepths(pool, live, solvedIndexes);

  const subgroup = (indexes: number[]) => {
    const unresolved = indexes.filter((index) => impossibleIndexes.has(index)).length;
    const solved = indexes.filter((index) => !impossibleIndexes.has(index));
    const { depths } = isolationDepths(pool, live, solved);
    return {
      count: indexes.length,
      unresolved,
      p50: percentile(depths, 0.5),
      p95: percentile(depths, 0.95),
      max: depths.length ? Math.max(...depths) : null,
    };
  };

  const coachIndexes = allIndexes.filter((index) => pool[index]!.role === "coach");
  const olIndexes = allIndexes.filter((index) => rolePosition(pool[index]!) === "OL");
  const eraDistribution = Object.fromEntries([1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((decade) => [
    `${decade}s`,
    pool.filter((person) => roleActiveDecades(person)?.includes(decade)).length,
  ]));

  const familyStats = [...new Set(evaluated.map((row) => row.family))].map((family) => {
    const familyRows = evaluated.filter((row) => row.family === family);
    return {
      family,
      predicates: familyRows.length,
      fullyCovered: familyRows.filter((row) => row.unknown === 0).length,
      live: live.filter((row) => row.family === family).length,
      unknownAnswers: familyRows.reduce((sum, row) => sum + row.unknown, 0),
      meanCoverage: Number((familyRows.reduce((sum, row) => sum + row.coverage, 0) / familyRows.length).toFixed(3)),
    };
  });

  return {
    eligibleCount: pool.length,
    tierMix: { A: pool.filter((person) => roleTier(person) === 2).length, B: pool.filter((person) => roleTier(person) === 1).length },
    roleMix: { player: pool.filter((person) => person.role === "player").length, coach: pool.filter((person) => person.role === "coach").length },
    positionDistribution: Object.fromEntries([...new Set(pool.map((person) => rolePosition(person) ?? "Unknown"))].sort().map((position) => [position, pool.filter((person) => (rolePosition(person) ?? "Unknown") === position).length])),
    eraDistribution,
    predicateCoverage: {
      candidate: evaluated.length,
      fullyCovered: fullyCovered.length,
      live: live.length,
      incomplete: evaluated.filter((row) => row.unknown > 0).length,
      totalUnknownAnswers: evaluated.reduce((sum, row) => sum + row.unknown, 0),
    },
    redundantPredicates,
    duplicateAnswerFingerprints: duplicateGroups.length,
    collisionGroupSizes: duplicateGroups.map((group) => group.length).sort((a, b) => b - a),
    uniquelyDistinguishable: pool.length - impossibleIndexes.size,
    uniquelyDistinguishablePct: Number(((pool.length - impossibleIndexes.size) / pool.length * 100).toFixed(1)),
    impossibleToDistinguish: impossibleIndexes.size,
    optimalIsolation: {
      solved: overallDepth.depths.length,
      p50: percentile(overallDepth.depths, 0.5),
      p75: percentile(overallDepth.depths, 0.75),
      p90: percentile(overallDepth.depths, 0.9),
      p95: percentile(overallDepth.depths, 0.95),
      max: overallDepth.depths.length ? Math.max(...overallDepth.depths) : null,
    },
    subgroupFairness: { coaches: subgroup(coachIndexes), offensiveLine: subgroup(olIndexes) },
    familyStats,
  };
}

describe("Football 20 Questions factual readiness audit", () => {
  it("allows affiliation No only when every relevant career record is complete", () => {
    for (const league of ["NFL", "CFB"] as const) {
      for (const person of selectLaunchPool(league)) {
        const records = roleRecords(person);
        const expectedComplete = records.length > 0
          && records.every((record) => footballCareerAffiliationHistoryFor(record)?.complete === true);
        expect(careerAffiliations(person)?.complete ?? false).toBe(expectedComplete);
      }
    }
  });

  for (const league of ["NFL", "CFB"] as const) {
    it(`${league} measures the hidden A/B player + head-coach census without roster spoilers`, () => {
      const pool = selectLaunchPool(league);
      const result = analyze(pool, buildPredicates(league, pool));
      console.log(`TWENTY_QUESTIONS_READINESS_${league}=${JSON.stringify(result)}`);

      expect(pool).toHaveLength(PLAYER_TARGET + COACH_TARGET);
      expect(result.roleMix).toEqual({ player: PLAYER_TARGET, coach: COACH_TARGET });
      expect(pool.every((person) => roleRecords(person).some(isEligibleTier))).toBe(true);
      expect(result.predicateCoverage.fullyCovered).toBeGreaterThan(0);
    });
  }
});