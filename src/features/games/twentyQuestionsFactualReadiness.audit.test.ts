import { describe, expect, it } from "vitest";
import {
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";
import { getFootballFactualRecord } from "../back-room/footballFactualStatsCore";

type League = "NFL" | "CFB";
type Role = "player" | "coach";
type Answer = boolean | null;
type Person = {
  key: string;
  role: Role;
  records: FootballSubjectProfile[];
};
type Predicate = {
  family: string;
  id: string;
  answer: (person: Person) => Answer;
};

type NumericSpec = readonly [
  family: string,
  metricId: string,
  thresholds: readonly number[],
  positions?: readonly string[],
];

const PLAYER_TARGET = 100;
const COACH_TARGET = 20;
const MIN_USEFUL_YES = 4;
const MIN_USEFUL_NO = 4;

const normalize = (value: string) => value
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[^a-z0-9]/g, "");

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

function roleRecords(person: Person) {
  return person.records.filter((record) => person.role === "player"
    ? record.kind === "player-career"
    : record.kind === "coach");
}

function strongestRoleTier(records: readonly FootballSubjectProfile[], role: Role) {
  return Math.max(0, ...records
    .filter((record) => role === "player" ? record.kind === "player-career" : record.kind === "coach")
    .map((record) => tierRank(record.recognizabilityTier)));
}

function rawPeople(league: League) {
  const byPerson = new Map<string, FootballSubjectProfile[]>();
  for (const record of queryFootballSubjects({
    league,
    recognizabilityTiers: ["A", "B"],
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).filter((subject) => subject.kind === "player-career" || subject.kind === "coach")) {
    const key = normalize(record.name);
    const records = byPerson.get(key) ?? [];
    if (!records.some((existing) => existing.id === record.id && existing.kind === record.kind)) records.push(record);
    byPerson.set(key, records);
  }
  return [...byPerson.entries()].map(([key, records]) => ({ key, records }));
}

function sortRoleCandidates(
  candidates: readonly { key: string; records: FootballSubjectProfile[] }[],
  role: Role,
) {
  return [...candidates]
    .filter((person) => strongestRoleTier(person.records, role) > 0)
    .sort((a, b) => (
      strongestRoleTier(b.records, role) - strongestRoleTier(a.records, role)
      || stableHash(a.key) - stableHash(b.key)
    ));
}

function selectLaunchPool(league: League) {
  const people = rawPeople(league);
  const coaches = sortRoleCandidates(people, "coach").slice(0, COACH_TARGET);
  const coachKeys = new Set(coaches.map((person) => person.key));
  const players = sortRoleCandidates(people.filter((person) => !coachKeys.has(person.key)), "player")
    .slice(0, PLAYER_TARGET);
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

function rolePosition(person: Person) {
  if (person.role === "coach") return "Coach";
  const positions = [...new Set(roleRecords(person).flatMap((record) => record.position ? [record.position] : []))];
  return positions.length === 1 ? positions[0]! : null;
}

function numericFact(person: Person, metricId: string) {
  const values = roleRecords(person).flatMap((record) => {
    const fact = getFootballFactualRecord(record.id)?.facts.find((row) => row.metricId === metricId);
    return fact ? [fact.value] : [];
  });
  const unique = [...new Set(values)];
  return unique.length === 1 ? unique[0]! : null;
}

function metricThreshold(
  person: Person,
  role: Role,
  metricId: string,
  threshold: number,
  positions?: readonly string[],
): Answer {
  if (person.role !== role) return false;
  if (role === "player" && positions?.length) {
    const position = rolePosition(person);
    if (position == null) return null;
    if (!positions.includes(position)) return false;
  }
  const value = numericFact(person, metricId);
  return value == null ? null : value >= threshold;
}

function candidateAffiliations(person: Person, league: League) {
  const records = roleRecords(person);
  if (league === "NFL") {
    const known = records.flatMap((record) => record.franchises ?? []);
    return known.length ? [...new Set(known)] : null;
  }
  const known = records.flatMap((record) => record.school ? [record.school] : []);
  return known.length ? [...new Set(known)] : null;
}

function buildPredicates(league: League, pool: readonly Person[]) {
  const rows: Predicate[] = [];
  const add = (family: string, id: string, answer: Predicate["answer"]) => rows.push({ family, id, answer });

  add("role", "head-coach", (person) => person.role === "coach");
  add("role", "player", (person) => person.role === "player");

  for (const position of ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"] as const) {
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

  for (const cutoff of [1960, 1970, 1980, 1990, 2000, 2010, 2020]) {
    add("era", `started-before-${cutoff}`, (person) => {
      const window = roleWindow(person);
      return window == null ? null : window.start < cutoff;
    });
  }
  for (const decade of [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]) {
    add("era", `active-${decade}s`, (person) => {
      const window = roleWindow(person);
      return window == null ? null : window.start <= decade + 9 && window.end >= decade;
    });
  }
  for (const years of [4, 8, 12, 16, 20]) {
    add("longevity", `${years}-plus-seasons`, (person) => {
      const window = roleWindow(person);
      return window == null ? null : window.end - window.start + 1 >= years;
    });
  }

  const affiliationValues = new Set(pool.flatMap((person) => candidateAffiliations(person, league) ?? []));
  for (const affiliation of affiliationValues) {
    add(league === "NFL" ? "franchise" : "program", normalize(affiliation), (person) => {
      const known = candidateAffiliations(person, league);
      if (known == null) return null;
      return known.includes(affiliation);
    });
  }

  const playerSpecs: readonly NumericSpec[] = league === "NFL" ? [
    ["production:games", "nfl-career-games", [50, 75, 100, 125, 150, 175, 200]],
    ["production:pass-yards", "nfl-career-passing-yards", [10_000, 20_000, 30_000, 40_000, 50_000, 60_000], ["QB"]],
    ["production:pass-td", "nfl-career-passing-touchdowns", [100, 200, 300, 400], ["QB"]],
    ["production:rush-yards", "nfl-career-rushing-yards", [3_000, 5_000, 7_500, 10_000, 12_500], ["RB"]],
    ["production:rec-yards", "nfl-career-receiving-yards", [3_000, 5_000, 7_500, 10_000, 12_500], ["WR", "TE"]],
    ["production:sacks", "nfl-career-sacks", [25, 50, 75, 100, 125], ["DL", "LB"]],
    ["production:interceptions", "nfl-career-interceptions", [10, 20, 30, 40, 50], ["DB", "LB"]],
    ["award:mvp", "nfl-ap-mvp-awards", [1, 2, 3]],
    ["award:first-team-all-pro", "nfl-first-team-all-pros", [1, 3, 5, 7]],
    ["championship:super-bowl", "nfl-super-bowl-titles", [1, 2, 3]],
  ] : [
    ["production:games", "cfb-career-games", [20, 30, 40, 50]],
    ["production:pass-yards", "cfb-career-passing-yards", [3_000, 5_000, 7_500, 10_000], ["QB"]],
    ["production:rush-yards", "cfb-career-rushing-yards", [1_000, 2_000, 3_000, 4_000], ["RB"]],
    ["production:rec-yards", "cfb-career-receiving-yards", [1_000, 2_000, 3_000], ["WR", "TE"]],
    ["production:sacks", "cfb-career-sacks", [5, 10, 15, 20], ["DL", "LB"]],
    ["production:interceptions", "cfb-career-defensive-interceptions", [3, 5, 10], ["DB", "LB"]],
    ["award:heisman", "cfb-heisman-awards", [1]],
  ];

  for (const [family, metricId, thresholds, positions] of playerSpecs) {
    for (const threshold of thresholds) {
      add(family, String(threshold), (person) => metricThreshold(person, "player", metricId, threshold, positions));
    }
  }

  const coachSpecs: readonly NumericSpec[] = league === "NFL" ? [
    ["coach:seasons", "nfl-coach-seasons-since-1999", [3, 5, 8, 10, 15, 20]],
    ["coach:win-pct", "nfl-coach-win-percentage-since-1999", [50, 55, 60, 65, 70]],
    ["coach:best-win-pct", "nfl-coach-best-season-win-percentage-since-1999", [60, 70, 75, 80]],
    ["coach:postseason", "nfl-coach-postseason-resume-since-1999", [1, 4, 8, 12, 20]],
  ] : [
    ["coach:wins", "cfb-coach-career-wins", [50, 75, 100, 150, 200, 250]],
    ["coach:national-titles", "cfb-coach-national-titles", [1, 2, 3, 5]],
    ["coach:conference-titles", "cfb-coach-conference-titles", [1, 3, 5, 10]],
  ];
  for (const [family, metricId, thresholds] of coachSpecs) {
    for (const threshold of thresholds) {
      add(family, String(threshold), (person) => metricThreshold(person, "coach", metricId, threshold));
    }
  }

  return rows;
}

function percentile(values: readonly number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1))]!;
}

function analyze(pool: readonly Person[], predicates: readonly Predicate[]) {
  const evaluated = predicates.map((predicate) => {
    const values = pool.map(predicate.answer);
    const unknown = values.filter((value) => value === null).length;
    const yes = values.filter((value) => value === true).length;
    const no = values.filter((value) => value === false).length;
    return { ...predicate, values, unknown, yes, no, coverage: (pool.length - unknown) / pool.length };
  });

  const fullyCovered = evaluated.filter((row) => row.unknown === 0);
  const informative = fullyCovered.filter((row) => row.yes >= MIN_USEFUL_YES && row.no >= MIN_USEFUL_NO);
  const bySignature = new Map<string, typeof informative[number]>();
  let redundantPredicates = 0;
  for (const row of informative) {
    const signature = row.values.map((value) => value ? "1" : "0").join("");
    if (bySignature.has(signature)) redundantPredicates += 1;
    else bySignature.set(signature, row);
  }
  const live = [...bySignature.values()];

  const fingerprintGroups = new Map<string, number[]>();
  pool.forEach((_person, index) => {
    const fingerprint = live.map((row) => row.values[index] ? "1" : "0").join("");
    const group = fingerprintGroups.get(fingerprint) ?? [];
    group.push(index);
    fingerprintGroups.set(fingerprint, group);
  });
  const duplicateGroups = [...fingerprintGroups.values()].filter((group) => group.length > 1);
  const impossibleIndexes = new Set(duplicateGroups.flat());

  const solveDepths: number[] = [];
  for (let target = 0; target < pool.length; target += 1) {
    if (impossibleIndexes.has(target)) continue;
    let candidates = pool.map((_person, index) => index);
    const unused = new Set(live.map((_row, index) => index));
    let depth = 0;
    while (candidates.length > 1 && unused.size) {
      let bestIndex: number | null = null;
      let bestRemaining = candidates.length;
      for (const predicateIndex of unused) {
        const targetValue = live[predicateIndex]!.values[target];
        const remaining = candidates.filter((candidate) => live[predicateIndex]!.values[candidate] === targetValue).length;
        if (remaining < bestRemaining) {
          bestRemaining = remaining;
          bestIndex = predicateIndex;
        }
      }
      if (bestIndex == null) break;
      const targetValue = live[bestIndex]!.values[target];
      candidates = candidates.filter((candidate) => live[bestIndex]!.values[candidate] === targetValue);
      unused.delete(bestIndex);
      depth += 1;
    }
    if (candidates.length === 1) solveDepths.push(depth);
  }

  const familyStats = [...new Set(evaluated.map((row) => row.family))].map((family) => {
    const rows = evaluated.filter((row) => row.family === family);
    return {
      family,
      predicates: rows.length,
      fullyCovered: rows.filter((row) => row.unknown === 0).length,
      live: live.filter((row) => row.family === family).length,
      unknownAnswers: rows.reduce((sum, row) => sum + row.unknown, 0),
      meanCoverage: Number((rows.reduce((sum, row) => sum + row.coverage, 0) / rows.length).toFixed(3)),
    };
  });

  const positionDistribution = Object.fromEntries(
    [...new Set(pool.map((person) => rolePosition(person) ?? "Unknown"))]
      .sort()
      .map((position) => [position, pool.filter((person) => (rolePosition(person) ?? "Unknown") === position).length]),
  );

  const missingFamiliesByPerson = pool.map((person, index) => new Set(
    evaluated.filter((row) => row.values[index] === null).map((row) => row.family),
  ));
  const subjectsWithMissingFamily = Object.fromEntries(
    [...new Set(evaluated.map((row) => row.family))]
      .sort()
      .map((family) => [family, missingFamiliesByPerson.filter((families) => families.has(family)).length]),
  );

  return {
    eligibleCount: pool.length,
    tierMix: {
      A: pool.filter((person) => roleTier(person) === 2).length,
      B: pool.filter((person) => roleTier(person) === 1).length,
    },
    roleMix: {
      player: pool.filter((person) => person.role === "player").length,
      coach: pool.filter((person) => person.role === "coach").length,
    },
    positionDistribution,
    predicateCoverage: {
      candidate: evaluated.length,
      fullyCovered: fullyCovered.length,
      live: live.length,
      incomplete: evaluated.filter((row) => row.unknown > 0).length,
      totalUnknownAnswers: evaluated.reduce((sum, row) => sum + row.unknown, 0),
    },
    liveYesNoSplit: live.map((row) => ({ family: row.family, id: row.id, yes: row.yes, no: row.no })),
    redundantPredicates,
    duplicateAnswerFingerprints: duplicateGroups.length,
    collisionGroupSizes: duplicateGroups.map((group) => group.length).sort((a, b) => b - a),
    uniquelyDistinguishable: pool.length - impossibleIndexes.size,
    uniquelyDistinguishablePct: Number(((pool.length - impossibleIndexes.size) / pool.length * 100).toFixed(1)),
    impossibleToDistinguish: impossibleIndexes.size,
    optimalIsolation: {
      solved: solveDepths.length,
      p50: percentile(solveDepths, 0.5),
      p75: percentile(solveDepths, 0.75),
      p90: percentile(solveDepths, 0.9),
      p95: percentile(solveDepths, 0.95),
      max: solveDepths.length ? Math.max(...solveDepths) : null,
    },
    familyStats,
    subjectsWithMissingFamily,
  };
}

describe("Football 20 Questions factual readiness audit", () => {
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
