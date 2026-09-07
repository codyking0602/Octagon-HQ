import { describe, expect, it } from "vitest";
import {
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";
import { getFootballFactualRecord } from "../back-room/footballFactualStatsCore";
import { footballRankFivePacks } from "../back-room/footballRankFiveModel";

type League = "NFL" | "CFB";
type Answer = boolean | null;

interface Person {
  key: string;
  records: FootballSubjectProfile[];
}

interface Predicate {
  id: string;
  family: string;
  answer: (person: Person) => Answer;
}

const normalize = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

function stableHash(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const allPeople = (() => {
  const records = queryFootballSubjects({
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).filter((subject) => subject.kind === "player-career" || subject.kind === "coach");
  const people = new Map<string, Person>();
  for (const record of records) {
    const key = normalize(record.name);
    const person = people.get(key) ?? { key, records: [] };
    if (!person.records.some((existing) => existing.id === record.id && existing.league === record.league && existing.kind === record.kind)) {
      person.records.push(record);
    }
    people.set(key, person);
  }
  return [...people.values()];
})();

const reviewedKeysByLeague = (() => {
  const nflPacks = new Set([
    "nfl-quarterbacks",
    "nfl-running-backs",
    "nfl-wide-receivers",
    "nfl-tight-ends",
    "nfl-front-seven",
    "nfl-secondary",
    "nfl-head-coaches",
  ]);
  const cfbPacks = new Set(["college-quarterbacks", "college-running-backs", "college-head-coaches"]);
  return {
    NFL: new Set(footballRankFivePacks.filter((pack) => nflPacks.has(pack.id)).flatMap((pack) => pack.items).map((item) => normalize(item.name))),
    CFB: new Set(footballRankFivePacks.filter((pack) => cfbPacks.has(pack.id)).flatMap((pack) => pack.items).map((item) => normalize(item.name))),
  } as const;
})();

function leagueRecords(person: Person, league: League) {
  return person.records.filter((record) => record.league === league);
}

function players(person: Person, league: League) {
  return person.records.filter((record) => record.league === league && record.kind === "player-career");
}

function coaches(person: Person, league: League) {
  return person.records.filter((record) => record.league === league && record.kind === "coach");
}

function eligible(person: Person, league: League, kind: "player-career" | "coach") {
  return person.records.some(
    (record) => record.league === league && record.kind === kind && (record.recognizabilityTier === "A" || record.recognizabilityTier === "B"),
  );
}

function tierScore(person: Person, league: League, kind: "player-career" | "coach") {
  const relevant = person.records.filter((record) => record.league === league && record.kind === kind);
  if (relevant.some((record) => record.recognizabilityTier === "A")) return 2;
  if (relevant.some((record) => record.recognizabilityTier === "B")) return 1;
  return 0;
}

function factualBreadth(person: Person, league: League) {
  return leagueRecords(person, league).reduce(
    (sum, record) => sum + (getFootballFactualRecord(record.id)?.facts.length ?? 0),
    0,
  );
}

function selectLaunchPool(league: League) {
  const rank = (kind: "player-career" | "coach") => (a: Person, b: Person) => {
    const tier = tierScore(b, league, kind) - tierScore(a, league, kind);
    if (tier) return tier;
    const reviewed = Number(reviewedKeysByLeague[league].has(b.key)) - Number(reviewedKeysByLeague[league].has(a.key));
    if (reviewed) return reviewed;
    const facts = factualBreadth(b, league) - factualBreadth(a, league);
    if (facts) return facts;
    return stableHash(a.key) - stableHash(b.key);
  };

  const coachPool = allPeople.filter((person) => eligible(person, league, "coach")).sort(rank("coach"));
  const selectedCoaches = coachPool.slice(0, 20);
  const selected = new Set(selectedCoaches.map((person) => person.key));
  const playerPool = allPeople
    .filter((person) => eligible(person, league, "player-career") && !selected.has(person.key))
    .sort(rank("player-career"));
  const selectedPlayers = playerPool.slice(0, 100);
  return [...selectedCoaches, ...selectedPlayers];
}

function explicitBoolean(
  records: readonly FootballSubjectProfile[],
  field: "firstRoundPick" | "firstOverallPick" | "undrafted" | "heismanWinner" | "nationalChampion",
): Answer {
  if (!records.length) return false;
  const values = records.map((record) => record[field]);
  if (values.some((value) => value === true)) return true;
  if (values.every((value) => value === false)) return false;
  return null;
}

function numericFact(person: Person, metricId: string) {
  const values = person.records.flatMap((record) => {
    const fact = getFootballFactualRecord(record.id)?.facts.find((row) => row.metricId === metricId);
    return fact ? [fact.value] : [];
  });
  return values.length ? Math.max(...values) : null;
}

function playerMetric(
  person: Person,
  league: League,
  metricId: string,
  threshold: number,
  positions?: readonly string[],
): Answer {
  const relevant = players(person, league);
  if (!relevant.length) return false;
  if (positions?.length) {
    if (relevant.some((record) => record.position && positions.includes(record.position))) {
      const value = numericFact(person, metricId);
      return value == null ? null : value >= threshold;
    }
    if (relevant.every((record) => record.position != null)) return false;
    return null;
  }
  const value = numericFact(person, metricId);
  return value == null ? null : value >= threshold;
}

function buildPredicates(league: League, pool: readonly Person[]) {
  const result: Predicate[] = [];
  const add = (family: string, id: string, answer: Predicate["answer"]) => result.push({ family, id, answer });

  add("role", "is-player", (person) => players(person, league).length > 0);
  add("role", "is-head-coach", (person) => coaches(person, league).length > 0);
  add("role", "offense", (person) => {
    const relevant = players(person, league);
    if (!relevant.length) return false;
    if (relevant.some((record) => ["QB", "RB", "WR", "TE", "OL"].includes(record.position ?? ""))) return true;
    return relevant.every((record) => record.position != null) ? false : null;
  });
  add("role", "defense", (person) => {
    const relevant = players(person, league);
    if (!relevant.length) return false;
    if (relevant.some((record) => ["DL", "LB", "DB"].includes(record.position ?? ""))) return true;
    return relevant.every((record) => record.position != null) ? false : null;
  });

  for (const position of ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"] as const) {
    add("position", position.toLowerCase(), (person) => {
      const relevant = players(person, league);
      if (!relevant.length) return false;
      if (relevant.some((record) => record.position === position)) return true;
      return relevant.every((record) => record.position != null) ? false : null;
    });
  }

  for (const cutoff of [2000, 2010, 2020]) {
    add("era", `start-before-${cutoff}`, (person) => {
      const records = leagueRecords(person, league);
      const starts = records.map((record) => record.startSeason).filter((value): value is number => value != null);
      if (!starts.length || starts.length < records.length) return null;
      return Math.min(...starts) < cutoff;
    });
  }
  for (const decade of [1990, 2000, 2010, 2020]) {
    add("era", `active-${decade}s`, (person) => {
      const records = leagueRecords(person, league);
      if (records.some((record) => record.activeDecades?.includes(decade))) return true;
      return records.every((record) => record.activeDecades != null) ? false : null;
    });
  }

  add("crossover", "other-league-player", (person) => players(person, league === "NFL" ? "CFB" : "NFL").length > 0);
  add("crossover", "other-league-head-coach", (person) => coaches(person, league === "NFL" ? "CFB" : "NFL").length > 0);
  add("crossover", "player-and-head-coach", (person) => person.records.some((record) => record.kind === "player-career") && person.records.some((record) => record.kind === "coach"));

  if (league === "NFL") {
    add("draft", "first-round", (person) => explicitBoolean(players(person, "NFL"), "firstRoundPick"));
    add("draft", "first-overall", (person) => explicitBoolean(players(person, "NFL"), "firstOverallPick"));
    add("draft", "undrafted", (person) => explicitBoolean(players(person, "NFL"), "undrafted"));
    for (const [id, metric, threshold] of [
      ["mvp", "nfl-ap-mvp-awards", 1],
      ["multiple-mvp", "nfl-ap-mvp-awards", 2],
      ["first-team-all-pro", "nfl-first-team-all-pros", 1],
      ["super-bowl-player", "nfl-super-bowl-titles", 1],
      ["multiple-super-bowl-player", "nfl-super-bowl-titles", 2],
    ] as const) add("honors", id, (person) => playerMetric(person, "NFL", metric, threshold));

    for (const [id, metric, threshold, positions] of [
      ["pass-20k", "nfl-career-passing-yards", 20_000, ["QB"]],
      ["pass-40k", "nfl-career-passing-yards", 40_000, ["QB"]],
      ["pass-60k", "nfl-career-passing-yards", 60_000, ["QB"]],
      ["rush-5k", "nfl-career-rushing-yards", 5_000, ["RB"]],
      ["rush-10k", "nfl-career-rushing-yards", 10_000, ["RB"]],
      ["receive-5k", "nfl-career-receiving-yards", 5_000, ["WR", "TE"]],
      ["receive-10k", "nfl-career-receiving-yards", 10_000, ["WR", "TE"]],
      ["sacks-50", "nfl-career-sacks", 50, ["DL", "LB"]],
      ["sacks-100", "nfl-career-sacks", 100, ["DL", "LB"]],
      ["def-int-20", "nfl-career-interceptions", 20, ["DB", "LB"]],
    ] as const) add("production", id, (person) => playerMetric(person, "NFL", metric, threshold, positions));
  } else {
    add("honors", "heisman", (person) => {
      const identity = explicitBoolean(players(person, "CFB"), "heismanWinner");
      if (identity !== null) return identity;
      return playerMetric(person, "CFB", "cfb-heisman-awards", 1);
    });
    add("honors", "national-champion-player", (person) => explicitBoolean(players(person, "CFB"), "nationalChampion"));
    add("draft", "nfl-first-round", (person) => explicitBoolean(players(person, "NFL"), "firstRoundPick"));
    add("draft", "nfl-first-overall", (person) => explicitBoolean(players(person, "NFL"), "firstOverallPick"));
    for (const [id, metric, threshold] of [
      ["coach-100-wins", "cfb-coach-career-wins", 100],
      ["coach-150-wins", "cfb-coach-career-wins", 150],
      ["coach-title", "cfb-coach-national-titles", 1],
      ["coach-multiple-titles", "cfb-coach-national-titles", 2],
      ["coach-conference-title", "cfb-coach-conference-titles", 1],
    ] as const) add("coaching", id, (person) => {
      if (!coaches(person, "CFB").length) return false;
      const value = numericFact(person, metric);
      return value == null ? null : value >= threshold;
    });

    for (const [id, metric, threshold, positions] of [
      ["pass-5k", "cfb-career-passing-yards", 5_000, ["QB"]],
      ["pass-10k", "cfb-career-passing-yards", 10_000, ["QB"]],
      ["rush-3k", "cfb-career-rushing-yards", 3_000, ["RB"]],
      ["rush-5k", "cfb-career-rushing-yards", 5_000, ["RB"]],
      ["receive-2k", "cfb-career-receiving-yards", 2_000, ["WR", "TE"]],
      ["receive-3k", "cfb-career-receiving-yards", 3_000, ["WR", "TE"]],
      ["sacks-20", "cfb-career-sacks", 20, ["DL", "LB"]],
      ["def-int-10", "cfb-career-defensive-interceptions", 10, ["DB", "LB"]],
    ] as const) add("production", id, (person) => playerMetric(person, "CFB", metric, threshold, positions));
  }

  const affiliations = new Set<string>();
  for (const person of pool) {
    for (const record of leagueRecords(person, league)) {
      if (league === "NFL") for (const franchise of record.franchises ?? []) affiliations.add(franchise);
      else if (record.school) affiliations.add(record.school);
    }
  }
  for (const affiliation of affiliations) {
    add(league === "NFL" ? "franchise" : "program", normalize(affiliation), (person) => {
      const records = leagueRecords(person, league);
      const known = league === "NFL"
        ? records.flatMap((record) => record.franchises ?? [])
        : records.flatMap((record) => (record.school ? [record.school] : []));
      if (!known.length) return null;
      return known.includes(affiliation);
    });
  }

  if (league === "CFB") {
    const conferences = new Set<string>();
    for (const person of pool) for (const record of leagueRecords(person, "CFB")) if (record.conference) conferences.add(record.conference);
    for (const conference of conferences) {
      add("conference", normalize(conference), (person) => {
        const known = leagueRecords(person, "CFB").flatMap((record) => (record.conference ? [record.conference] : []));
        if (!known.length) return null;
        return known.includes(conference);
      });
    }
  }

  return result;
}

function percentile(values: readonly number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1))];
}

function analyze(pool: readonly Person[], predicates: readonly Predicate[]) {
  const rows = predicates.map((predicate) => {
    const values = pool.map(predicate.answer);
    const answered = values.filter((value): value is boolean => value !== null);
    const yes = answered.filter(Boolean).length;
    return {
      ...predicate,
      values,
      coverage: answered.length / pool.length,
      yes,
      no: answered.length - yes,
      yesRate: answered.length ? yes / answered.length : 0,
    };
  });
  const complete = rows.filter((row) => row.coverage === 1 && row.yes > 0 && row.no > 0);
  const bySignature = new Map<string, typeof complete>();
  for (const row of complete) {
    const signature = row.values.map((value) => (value ? "1" : "0")).join("");
    const group = bySignature.get(signature) ?? [];
    group.push(row);
    bySignature.set(signature, group);
  }
  const deduped = [...bySignature.values()].map((group) => group[0]);

  const fingerprints = new Map<string, number[]>();
  pool.forEach((_person, index) => {
    const fingerprint = deduped.map((row) => (row.values[index] ? "1" : "0")).join("");
    const group = fingerprints.get(fingerprint) ?? [];
    group.push(index);
    fingerprints.set(fingerprint, group);
  });
  const duplicateFingerprints = [...fingerprints.values()].filter((group) => group.length > 1);

  const depths: number[] = [];
  let unsolved = 0;
  pool.forEach((_person, target) => {
    let candidates = pool.map((_row, index) => index);
    const unused = new Set(deduped.map((_row, index) => index));
    let depth = 0;
    while (candidates.length > 1) {
      let best = -1;
      let bestWorst = Infinity;
      for (const predicateIndex of unused) {
        const row = deduped[predicateIndex];
        const yes = candidates.filter((index) => row.values[index] === true).length;
        const no = candidates.length - yes;
        if (!yes || !no) continue;
        const worst = Math.max(yes, no);
        if (worst < bestWorst) {
          best = predicateIndex;
          bestWorst = worst;
        }
      }
      if (best < 0) break;
      const answer = deduped[best].values[target];
      candidates = candidates.filter((index) => deduped[best].values[index] === answer);
      unused.delete(best);
      depth += 1;
    }
    if (candidates.length === 1) depths.push(depth);
    else unsolved += 1;
  });

  const familyCoverage = [...new Set(rows.map((row) => row.family))].map((family) => {
    const familyRows = rows.filter((row) => row.family === family);
    return {
      family,
      predicates: familyRows.length,
      fullyCovered: familyRows.filter((row) => row.coverage === 1).length,
      meanCoverage: Number((familyRows.reduce((sum, row) => sum + row.coverage, 0) / familyRows.length).toFixed(3)),
    };
  });

  return {
    predicateCount: rows.length,
    completeInformativePredicates: complete.length,
    dedupedCompletePredicates: deduped.length,
    incompletePredicates: rows.filter((row) => row.coverage < 1).length,
    extremeSplits: complete.filter((row) => row.yesRate < 0.05 || row.yesRate > 0.95).length,
    giveaways: complete.filter((row) => row.yes === 1 || row.no === 1).length,
    duplicatePredicateGroups: [...bySignature.values()].filter((group) => group.length > 1).length,
    indistinguishableGroups: duplicateFingerprints.length,
    indistinguishableSubjects: duplicateFingerprints.reduce((sum, group) => sum + group.length, 0),
    unsolvedSubjects: unsolved,
    solveDepth: {
      median: percentile(depths, 0.5),
      p75: percentile(depths, 0.75),
      p90: percentile(depths, 0.9),
      p95: percentile(depths, 0.95),
      max: depths.length ? Math.max(...depths) : null,
    },
    familyCoverage,
    weakestCoverage: rows
      .filter((row) => row.coverage < 1)
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 15)
      .map((row) => ({ family: row.family, id: row.id, coverage: Number(row.coverage.toFixed(3)) })),
  };
}

function summarize(league: League) {
  const pool = selectLaunchPool(league);
  const aCount = pool.filter((person) =>
    person.records.some((record) => record.league === league && (record.recognizabilityTier === "A")),
  ).length;
  const coachPeople = pool.filter((person) => coaches(person, league).length > 0).length;
  const playerPeople = pool.filter((person) => players(person, league).length > 0).length;
  const reviewedCount = pool.filter((person) => reviewedKeysByLeague[league].has(person.key)).length;
  return {
    poolSize: pool.length,
    tierA: aCount,
    tierBOnly: pool.length - aCount,
    playerPeople,
    coachPeople,
    reviewedGamePeople: reviewedCount,
    analysis: analyze(pool, buildPredicates(league, pool)),
  };
}

describe("20 Questions intended Football launch-pool calibration", () => {
  it("prints aggregate-only 120-person NFL and CFB calibration", () => {
    const report = { NFL: summarize("NFL"), CFB: summarize("CFB") };
    console.log(`TWENTY_QUESTIONS_LAUNCH_CALIBRATION=${JSON.stringify(report)}`);
    expect(report.NFL.poolSize).toBe(120);
    expect(report.CFB.poolSize).toBe(120);
    expect(report.NFL.coachPeople).toBeGreaterThanOrEqual(20);
    expect(report.CFB.coachPeople).toBeGreaterThanOrEqual(20);
  });
});
