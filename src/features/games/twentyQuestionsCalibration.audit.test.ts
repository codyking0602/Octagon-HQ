import { describe, expect, it } from "vitest";
import {
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";
import { getFootballFactualRecord } from "../back-room/footballFactualStatsCore";
import { footballRankFivePacks } from "../back-room/footballRankFiveModel";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";

type League = "NFL" | "CFB";
type Answer = boolean | null;

interface FootballPerson {
  key: string;
  records: FootballSubjectProfile[];
}

interface Predicate<T> {
  id: string;
  answer: (subject: T) => Answer;
}

const normalizeName = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

function uniqueBy<T>(rows: readonly T[], key: (row: T) => string) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const id = key(row);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function percentile(values: readonly number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

function analyze<T>(subjects: readonly T[], predicates: readonly Predicate<T>[]) {
  const evaluated = predicates.map((predicate) => {
    const values = subjects.map(predicate.answer);
    const answered = values.filter((value): value is boolean => value !== null);
    const yes = answered.filter(Boolean).length;
    const no = answered.length - yes;
    return {
      id: predicate.id,
      values,
      coverage: subjects.length ? answered.length / subjects.length : 0,
      yes,
      no,
      yesRate: answered.length ? yes / answered.length : 0,
    };
  });

  const complete = evaluated.filter((row) => row.coverage === 1 && row.yes > 0 && row.no > 0);
  const incomplete = evaluated.filter((row) => row.coverage < 1);
  const extreme = complete.filter((row) => row.yesRate < 0.05 || row.yesRate > 0.95);
  const giveaways = complete.filter((row) => row.yes === 1 || row.no === 1);

  const duplicateColumns = new Map<string, string[]>();
  for (const row of complete) {
    const signature = row.values.map((value) => (value ? "1" : "0")).join("");
    const group = duplicateColumns.get(signature) ?? [];
    group.push(row.id);
    duplicateColumns.set(signature, group);
  }
  const duplicateGroups = [...duplicateColumns.values()].filter((group) => group.length > 1);
  const dedupedComplete = [...duplicateColumns.values()].map((group) => complete.find((row) => row.id === group[0])!);

  const fingerprints = new Map<string, number[]>();
  subjects.forEach((_subject, index) => {
    const signature = dedupedComplete.map((row) => (row.values[index] ? "1" : "0")).join("");
    const group = fingerprints.get(signature) ?? [];
    group.push(index);
    fingerprints.set(signature, group);
  });
  const indistinguishable = [...fingerprints.values()].filter((group) => group.length > 1);

  const depths: number[] = [];
  let unsolved = 0;
  subjects.forEach((_subject, targetIndex) => {
    let candidates = subjects.map((_row, index) => index);
    const unused = new Set(dedupedComplete.map((_row, index) => index));
    let depth = 0;

    while (candidates.length > 1) {
      let bestPredicate = -1;
      let bestWorstBranch = Number.POSITIVE_INFINITY;
      let bestImbalance = Number.POSITIVE_INFINITY;

      for (const predicateIndex of unused) {
        const row = dedupedComplete[predicateIndex];
        let yes = 0;
        let no = 0;
        for (const candidateIndex of candidates) {
          if (row.values[candidateIndex]) yes += 1;
          else no += 1;
        }
        if (!yes || !no) continue;
        const worstBranch = Math.max(yes, no);
        const imbalance = Math.abs(yes - no);
        if (
          worstBranch < bestWorstBranch ||
          (worstBranch === bestWorstBranch && imbalance < bestImbalance)
        ) {
          bestPredicate = predicateIndex;
          bestWorstBranch = worstBranch;
          bestImbalance = imbalance;
        }
      }

      if (bestPredicate < 0) break;
      const row = dedupedComplete[bestPredicate];
      const targetAnswer = row.values[targetIndex];
      candidates = candidates.filter((candidateIndex) => row.values[candidateIndex] === targetAnswer);
      unused.delete(bestPredicate);
      depth += 1;
    }

    if (candidates.length === 1) depths.push(depth);
    else unsolved += 1;
  });

  const coverageBuckets = {
    full: evaluated.filter((row) => row.coverage === 1).length,
    atLeast90: evaluated.filter((row) => row.coverage >= 0.9 && row.coverage < 1).length,
    atLeast75: evaluated.filter((row) => row.coverage >= 0.75 && row.coverage < 0.9).length,
    below75: evaluated.filter((row) => row.coverage < 0.75).length,
  };

  return {
    subjectCount: subjects.length,
    candidatePredicateCount: predicates.length,
    completeInformativePredicateCount: complete.length,
    dedupedCompletePredicateCount: dedupedComplete.length,
    coverageBuckets,
    incompletePredicateCount: incomplete.length,
    extremeSplitCount: extreme.length,
    giveawayCount: giveaways.length,
    duplicatePredicateGroupCount: duplicateGroups.length,
    indistinguishableGroupCount: indistinguishable.length,
    indistinguishableSubjectCount: indistinguishable.reduce((sum, group) => sum + group.length, 0),
    unsolvedSubjectCount: unsolved,
    solveDepth: {
      median: percentile(depths, 0.5),
      p75: percentile(depths, 0.75),
      p90: percentile(depths, 0.9),
      p95: percentile(depths, 0.95),
      max: depths.length ? Math.max(...depths) : null,
    },
    weakestCoverage: incomplete
      .slice()
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 12)
      .map((row) => ({ id: row.id, coverage: Number(row.coverage.toFixed(3)) })),
    extremePredicates: extreme
      .slice()
      .sort((a, b) => Math.min(a.yesRate, 1 - a.yesRate) - Math.min(b.yesRate, 1 - b.yesRate))
      .slice(0, 12)
      .map((row) => ({ id: row.id, yesRate: Number(row.yesRate.toFixed(3)) })),
  };
}

const allFootballPeople = (() => {
  const records = queryFootballSubjects({
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).filter((subject) => subject.kind === "player-career" || subject.kind === "coach");
  const byPerson = new Map<string, FootballPerson>();
  for (const record of records) {
    const key = normalizeName(record.name);
    const person = byPerson.get(key) ?? { key, records: [] };
    if (!person.records.some((existing) => existing.id === record.id && existing.league === record.league && existing.kind === record.kind)) {
      person.records.push(record);
    }
    byPerson.set(key, person);
  }
  return [...byPerson.values()];
})();

function eligibleFootballPeople(league: League) {
  return allFootballPeople.filter((person) =>
    person.records.some(
      (record) =>
        record.league === league &&
        (record.kind === "player-career" || record.kind === "coach") &&
        (record.recognizabilityTier === "A" || record.recognizabilityTier === "B"),
    ),
  );
}

function leagueRecords(person: FootballPerson, league: League) {
  return person.records.filter(
    (record) => record.league === league && (record.kind === "player-career" || record.kind === "coach"),
  );
}

function playerRecords(person: FootballPerson, league: League) {
  return person.records.filter((record) => record.league === league && record.kind === "player-career");
}

function coachRecords(person: FootballPerson, league: League) {
  return person.records.filter((record) => record.league === league && record.kind === "coach");
}

function explicitBooleanAcross(
  records: readonly FootballSubjectProfile[],
  field: "firstRoundPick" | "firstOverallPick" | "undrafted" | "heismanWinner" | "nationalChampion",
): Answer {
  if (!records.length) return false;
  const values = records.map((record) => record[field]);
  if (values.some((value) => value === true)) return true;
  if (values.every((value) => value === false)) return false;
  return null;
}

function numericFact(person: FootballPerson, metricId: string) {
  const values = person.records.flatMap((record) => {
    const factual = getFootballFactualRecord(record.id);
    const fact = factual?.facts.find((row) => row.metricId === metricId);
    return fact ? [fact.value] : [];
  });
  return values.length ? Math.max(...values) : null;
}

function playerMetricAtLeast(
  person: FootballPerson,
  league: League,
  metricId: string,
  threshold: number,
  positions?: readonly string[],
): Answer {
  const players = playerRecords(person, league);
  if (!players.length) return false;
  if (positions?.length) {
    const knownPositions = players.map((record) => record.position).filter(Boolean);
    if (knownPositions.length === players.length && !knownPositions.some((position) => positions.includes(position!))) return false;
    if (knownPositions.length < players.length && !knownPositions.some((position) => positions.includes(position!))) return null;
  }
  const value = numericFact(person, metricId);
  return value == null ? null : value >= threshold;
}

function footballPredicates(league: League, people: readonly FootballPerson[]): Predicate<FootballPerson>[] {
  const predicates: Predicate<FootballPerson>[] = [];
  const add = (id: string, answer: Predicate<FootballPerson>["answer"]) => predicates.push({ id, answer });

  add("role-player", (person) => playerRecords(person, league).length > 0);
  add("role-head-coach", (person) => coachRecords(person, league).length > 0);
  add("role-offense", (person) => {
    const players = playerRecords(person, league);
    if (!players.length) return false;
    if (players.some((record) => ["QB", "RB", "WR", "TE", "OL"].includes(record.position ?? ""))) return true;
    return players.every((record) => record.position != null) ? false : null;
  });
  add("role-defense", (person) => {
    const players = playerRecords(person, league);
    if (!players.length) return false;
    if (players.some((record) => ["DL", "LB", "DB"].includes(record.position ?? ""))) return true;
    return players.every((record) => record.position != null) ? false : null;
  });

  for (const position of ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"] as const) {
    add(`position-${position.toLowerCase()}`, (person) => {
      const players = playerRecords(person, league);
      if (!players.length) return false;
      if (players.some((record) => record.position === position)) return true;
      return players.every((record) => record.position != null) ? false : null;
    });
  }

  for (const cutoff of [2000, 2010, 2020]) {
    add(`era-start-before-${cutoff}`, (person) => {
      const records = leagueRecords(person, league);
      const starts = records.map((record) => record.startSeason).filter((value): value is number => value != null);
      if (!starts.length) return null;
      if (starts.length < records.length) return null;
      return Math.min(...starts) < cutoff;
    });
  }

  for (const decade of [1990, 2000, 2010, 2020]) {
    add(`era-active-${decade}s`, (person) => {
      const records = leagueRecords(person, league);
      if (records.some((record) => record.activeDecades?.includes(decade))) return true;
      return records.every((record) => record.activeDecades != null) ? false : null;
    });
  }

  add("crossover-other-league-player", (person) => playerRecords(person, league === "NFL" ? "CFB" : "NFL").length > 0);
  add("crossover-other-league-head-coach", (person) => coachRecords(person, league === "NFL" ? "CFB" : "NFL").length > 0);
  add("crossover-player-and-head-coach", (person) => person.records.some((record) => record.kind === "player-career") && person.records.some((record) => record.kind === "coach"));

  if (league === "NFL") {
    add("draft-first-round", (person) => explicitBooleanAcross(playerRecords(person, "NFL"), "firstRoundPick"));
    add("draft-first-overall", (person) => explicitBooleanAcross(playerRecords(person, "NFL"), "firstOverallPick"));
    add("draft-undrafted", (person) => explicitBooleanAcross(playerRecords(person, "NFL"), "undrafted"));
    add("draft-top-10", (person) => {
      const players = playerRecords(person, "NFL");
      if (!players.length) return false;
      if (players.some((record) => record.draftPick != null && record.draftPick <= 10)) return true;
      if (players.every((record) => record.draftPick != null || record.undrafted === true)) return false;
      return null;
    });
    add("draft-top-5", (person) => {
      const players = playerRecords(person, "NFL");
      if (!players.length) return false;
      if (players.some((record) => record.draftPick != null && record.draftPick <= 5)) return true;
      if (players.every((record) => record.draftPick != null || record.undrafted === true)) return false;
      return null;
    });
    add("award-ap-mvp", (person) => playerMetricAtLeast(person, "NFL", "nfl-ap-mvp-awards", 1));
    add("award-multiple-ap-mvp", (person) => playerMetricAtLeast(person, "NFL", "nfl-ap-mvp-awards", 2));
    add("award-first-team-all-pro", (person) => playerMetricAtLeast(person, "NFL", "nfl-first-team-all-pros", 1));
    add("title-super-bowl-as-player", (person) => playerMetricAtLeast(person, "NFL", "nfl-super-bowl-titles", 1));
    add("title-multiple-super-bowls-as-player", (person) => playerMetricAtLeast(person, "NFL", "nfl-super-bowl-titles", 2));
    add("qb-pass-yards-20000", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-passing-yards", 20_000, ["QB"]));
    add("qb-pass-yards-40000", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-passing-yards", 40_000, ["QB"]));
    add("qb-pass-yards-60000", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-passing-yards", 60_000, ["QB"]));
    add("rb-rush-yards-5000", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-rushing-yards", 5_000, ["RB"]));
    add("rb-rush-yards-10000", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-rushing-yards", 10_000, ["RB"]));
    add("receiver-yards-5000", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-receiving-yards", 5_000, ["WR", "TE"]));
    add("receiver-yards-10000", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-receiving-yards", 10_000, ["WR", "TE"]));
    add("defense-sacks-50", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-sacks", 50, ["DL", "LB"]));
    add("defense-sacks-100", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-sacks", 100, ["DL", "LB"]));
    add("defense-interceptions-20", (person) => playerMetricAtLeast(person, "NFL", "nfl-career-interceptions", 20, ["DB", "LB"]));
  } else {
    add("award-heisman", (person) => {
      const players = playerRecords(person, "CFB");
      const explicit = explicitBooleanAcross(players, "heismanWinner");
      if (explicit !== null) return explicit;
      return playerMetricAtLeast(person, "CFB", "cfb-heisman-awards", 1);
    });
    add("title-national-champion-as-player", (person) => explicitBooleanAcross(playerRecords(person, "CFB"), "nationalChampion"));
    add("draft-first-round-nfl", (person) => explicitBooleanAcross(playerRecords(person, "NFL"), "firstRoundPick"));
    add("draft-first-overall-nfl", (person) => explicitBooleanAcross(playerRecords(person, "NFL"), "firstOverallPick"));
    add("coach-100-wins", (person) => {
      if (!coachRecords(person, "CFB").length) return false;
      const value = numericFact(person, "cfb-coach-career-wins");
      return value == null ? null : value >= 100;
    });
    add("coach-150-wins", (person) => {
      if (!coachRecords(person, "CFB").length) return false;
      const value = numericFact(person, "cfb-coach-career-wins");
      return value == null ? null : value >= 150;
    });
    add("coach-national-title", (person) => {
      if (!coachRecords(person, "CFB").length) return false;
      const value = numericFact(person, "cfb-coach-national-titles");
      return value == null ? null : value >= 1;
    });
    add("coach-multiple-national-titles", (person) => {
      if (!coachRecords(person, "CFB").length) return false;
      const value = numericFact(person, "cfb-coach-national-titles");
      return value == null ? null : value >= 2;
    });
    add("qb-pass-yards-5000", (person) => playerMetricAtLeast(person, "CFB", "cfb-career-passing-yards", 5_000, ["QB"]));
    add("qb-pass-yards-10000", (person) => playerMetricAtLeast(person, "CFB", "cfb-career-passing-yards", 10_000, ["QB"]));
    add("rb-rush-yards-3000", (person) => playerMetricAtLeast(person, "CFB", "cfb-career-rushing-yards", 3_000, ["RB"]));
    add("rb-rush-yards-5000", (person) => playerMetricAtLeast(person, "CFB", "cfb-career-rushing-yards", 5_000, ["RB"]));
    add("receiver-yards-2000", (person) => playerMetricAtLeast(person, "CFB", "cfb-career-receiving-yards", 2_000, ["WR", "TE"]));
    add("receiver-yards-3000", (person) => playerMetricAtLeast(person, "CFB", "cfb-career-receiving-yards", 3_000, ["WR", "TE"]));
    add("defense-sacks-20", (person) => playerMetricAtLeast(person, "CFB", "cfb-career-sacks", 20, ["DL", "LB"]));
    add("defense-interceptions-10", (person) => playerMetricAtLeast(person, "CFB", "cfb-career-defensive-interceptions", 10, ["DB", "LB"]));
  }

  const affiliationValues = new Set<string>();
  for (const person of people) {
    for (const record of leagueRecords(person, league)) {
      if (league === "NFL") for (const franchise of record.franchises ?? []) affiliationValues.add(franchise);
      else if (record.school) affiliationValues.add(record.school);
    }
  }
  for (const affiliation of affiliationValues) {
    const id = `${league === "NFL" ? "franchise" : "program"}-${normalizeName(affiliation)}`;
    add(id, (person) => {
      const records = leagueRecords(person, league);
      const values = league === "NFL"
        ? records.flatMap((record) => record.franchises ?? [])
        : records.flatMap((record) => (record.school ? [record.school] : []));
      if (!values.length) return null;
      return values.includes(affiliation);
    });
  }

  if (league === "CFB") {
    const conferences = new Set<string>();
    for (const person of people) {
      for (const record of leagueRecords(person, "CFB")) if (record.conference) conferences.add(record.conference);
    }
    for (const conference of conferences) {
      add(`conference-${normalizeName(conference)}`, (person) => {
        const records = leagueRecords(person, "CFB");
        const values = records.flatMap((record) => (record.conference ? [record.conference] : []));
        if (!values.length) return null;
        return values.includes(conference);
      });
    }
  }

  return predicates;
}

function footballUniverseSummary(league: League) {
  const people = eligibleFootballPeople(league);
  const playerCount = people.filter((person) => playerRecords(person, league).length).length;
  const coachCount = people.filter((person) => coachRecords(person, league).length).length;
  const dualRoleCount = people.filter((person) => playerRecords(person, league).length && coachRecords(person, league).length).length;
  const tierA = people.filter((person) =>
    person.records.some((record) => record.league === league && record.recognizabilityTier === "A"),
  ).length;
  const tierBOnly = people.length - tierA;
  return {
    eligiblePeople: people.length,
    tierA,
    tierBOnly,
    playerCount,
    coachCount,
    dualRoleCount,
    calibration: analyze(people, footballPredicates(league, people)),
  };
}

function reviewedCfbDepthSummary() {
  const relevant = new Set(["college-quarterbacks", "college-running-backs", "college-head-coaches"]);
  const reviewedKeys = new Set(
    footballRankFivePacks
      .filter((pack) => relevant.has(pack.id))
      .flatMap((pack) => pack.items)
      .map((item) => normalizeName(item.name)),
  );
  const currentEligible = new Set(eligibleFootballPeople("CFB").map((person) => person.key));
  const registered = new Set(allFootballPeople.map((person) => person.key));
  return {
    reviewedUniquePeople: reviewedKeys.size,
    reviewedOutsideCurrentAB: [...reviewedKeys].filter((key) => !currentEligible.has(key)).length,
    reviewedOutsideCurrentABButRegistered: [...reviewedKeys].filter((key) => !currentEligible.has(key) && registered.has(key)).length,
    reviewedMissingPersonRegistry: [...reviewedKeys].filter((key) => !registered.has(key)).length,
  };
}

type UfcFighter = (typeof canonicalRankingInputs.fighters)[number];

function normalizeMethod(method: string) {
  return method.toLowerCase().replace(/[^a-z]/g, "");
}

function ufcPredicates(fighters: readonly UfcFighter[]): Predicate<UfcFighter>[] {
  const predicates: Predicate<UfcFighter>[] = [];
  const add = (id: string, answer: Predicate<UfcFighter>["answer"]) => predicates.push({ id, answer });

  const divisions = new Set<string>();
  for (const fighter of fighters) {
    divisions.add(fighter.facts.identity.primaryDivision);
    for (const division of fighter.facts.identity.secondaryDivisions) divisions.add(division);
  }
  for (const division of divisions) {
    add(`division-${normalizeName(division)}`, (fighter) =>
      fighter.facts.identity.primaryDivision === division || fighter.facts.identity.secondaryDivisions.includes(division),
    );
  }

  for (const cutoff of [2005, 2010, 2015, 2020]) {
    add(`era-ufc-debut-before-${cutoff}`, (fighter) => {
      const debut = Math.min(...fighter.facts.fights.map((fight) => Number(fight.date.slice(0, 4))));
      return debut < cutoff;
    });
  }
  add("era-fought-since-2024", (fighter) =>
    Math.max(...fighter.facts.fights.map((fight) => Number(fight.date.slice(0, 4)))) >= 2024,
  );

  for (const threshold of [10, 20, 30]) add(`volume-fights-${threshold}`, (fighter) => fighter.facts.fights.length >= threshold);
  for (const threshold of [5, 10, 15, 20]) add(`wins-${threshold}`, (fighter) => fighter.facts.fights.filter((fight) => fight.officialResult === "win").length >= threshold);
  add("has-loss", (fighter) => fighter.facts.fights.some((fight) => fight.officialResult === "loss"));
  add("losses-5", (fighter) => fighter.facts.fights.filter((fight) => fight.officialResult === "loss").length >= 5);

  const isKo = (method: string) => normalizeMethod(method).includes("ko") || normalizeMethod(method).includes("tko");
  const isSub = (method: string) => normalizeMethod(method).includes("sub");
  const isDecision = (method: string) => normalizeMethod(method).includes("dec");
  const winCount = (fighter: UfcFighter, matcher: (method: string) => boolean) =>
    fighter.facts.fights.filter((fight) => fight.officialResult === "win" && matcher(fight.methodCategory)).length;
  const lossCount = (fighter: UfcFighter, matcher: (method: string) => boolean) =>
    fighter.facts.fights.filter((fight) => fight.officialResult === "loss" && matcher(fight.methodCategory)).length;

  add("finish-ko-win", (fighter) => winCount(fighter, isKo) >= 1);
  add("finish-submission-win", (fighter) => winCount(fighter, isSub) >= 1);
  add("decision-win", (fighter) => winCount(fighter, isDecision) >= 1);
  add("finishes-5", (fighter) => winCount(fighter, isKo) + winCount(fighter, isSub) >= 5);
  add("finishes-10", (fighter) => winCount(fighter, isKo) + winCount(fighter, isSub) >= 10);
  add("style-more-ko-than-sub", (fighter) => winCount(fighter, isKo) > winCount(fighter, isSub));
  add("style-more-sub-than-ko", (fighter) => winCount(fighter, isSub) > winCount(fighter, isKo));
  add("loss-ko-tko", (fighter) => lossCount(fighter, isKo) >= 1);
  add("loss-submission", (fighter) => lossCount(fighter, isSub) >= 1);

  const isTitleFight = (championshipType: string) => {
    const normalized = championshipType.toLowerCase();
    return normalized.includes("title") || normalized.includes("champion") || normalized.includes("undisputed") || normalized.includes("interim");
  };
  add("title-fight", (fighter) => fighter.facts.fights.some((fight) => isTitleFight(fight.championshipType)));
  add("title-fight-win", (fighter) => fighter.facts.fights.some((fight) => fight.officialResult === "win" && isTitleFight(fight.championshipType)));
  add("multiple-title-fight-wins", (fighter) => fighter.facts.fights.filter((fight) => fight.officialResult === "win" && isTitleFight(fight.championshipType)).length >= 2);
  add("interim-title-fight-win", (fighter) => fighter.facts.fights.some((fight) => fight.officialResult === "win" && fight.championshipType.toLowerCase().includes("interim")));
  add("title-fights-multiple-divisions", (fighter) => {
    const divisions = new Set(
      fighter.facts.fights
        .filter((fight) => isTitleFight(fight.championshipType))
        .map((fight) => fight.division)
        .filter((division): division is string => Boolean(division)),
    );
    return divisions.size >= 2;
  });

  return predicates;
}

function ufcCoverageSummary() {
  const fighters = canonicalRankingInputs.fighters;
  const championshipTypes = [...new Set(fighters.flatMap((fighter) => fighter.facts.fights.map((fight) => fight.championshipType)))].sort();
  const methodCategories = [...new Set(fighters.flatMap((fighter) => fighter.facts.fights.map((fight) => fight.methodCategory)))].sort();
  const supplemental = fighters.map((fighter) => {
    const fights = fighter.facts.fights;
    const audited = fights.filter((fight) => fight.supplementalFacts != null).length;
    return fights.length ? audited / fights.length : 0;
  });
  return {
    rankedEligibleCount: fighters.length,
    expansionTargetRange: "95-105",
    expansionGapTo95: Math.max(0, 95 - fighters.length),
    expansionGapTo105: Math.max(0, 105 - fighters.length),
    championshipTypeValues: championshipTypes,
    methodCategoryValues: methodCategories,
    supplementalFactCoverage: {
      fightersWithFullCoverage: supplemental.filter((coverage) => coverage === 1).length,
      fightersWithAnyCoverage: supplemental.filter((coverage) => coverage > 0).length,
      medianFightCoverage: percentile(supplemental.map((coverage) => Math.round(coverage * 1000)), 0.5)! / 1000,
    },
    calibration: analyze(fighters, ufcPredicates(fighters)),
  };
}

describe("20 Questions aggregate calibration audit", () => {
  it("prints a spoiler-safe calibration report from canonical owners", () => {
    const report = {
      generatedFrom: "canonical owners only",
      football: {
        NFL: footballUniverseSummary("NFL"),
        CFB: footballUniverseSummary("CFB"),
        reviewedCfbDepth: reviewedCfbDepthSummary(),
      },
      UFC: ufcCoverageSummary(),
    };

    console.log(`TWENTY_QUESTIONS_CALIBRATION=${JSON.stringify(report)}`);
    expect(report.UFC.rankedEligibleCount).toBe(canonicalRankingInputs.counts.fighters);
    expect(report.football.NFL.eligiblePeople).toBeGreaterThan(0);
    expect(report.football.CFB.eligiblePeople).toBeGreaterThan(0);
  });
});
