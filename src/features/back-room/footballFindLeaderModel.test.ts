import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlayLineupHistory } from "../play/lineupModel";
import {
  FOOTBALL_FIND_LEADER_CANDIDATE_COUNT,
  FOOTBALL_FIND_LEADER_FAMILY_CYCLE,
  buildFootballFindLeaderBoard,
  createFootballFindLeaderBoard,
  footballFindLeaderCompetitionAudit,
  footballFindLeaderCanonicalMetricByMetric,
  footballFindLeaderMetricRows,
  footballFindLeaderQuestions,
  footballFindLeaderReplayAudit,
  formatFootballFindLeaderValue,
} from "./footballFindLeaderModel";
import {
  FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE,
  FOOTBALL_FIND_LEADER_METRIC_COUNT,
  FOOTBALL_FIND_LEADER_SUBJECT_COUNT,
  footballFindLeaderMetricDefinitions,
  footballFindLeaderSubjects,
  getFootballFact,
} from "./footballFactualStats";

function emptyHistory(): PlayLineupHistory {
  return { entries: [], recentItemIds: [], recentFighterIds: [], lastLineup: [] };
}

describe("Football Find the Leader maturity", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("owns 82 questions across 41 real comparable metrics and both NFL + CFB", () => {
    expect(FOOTBALL_FIND_LEADER_METRIC_COUNT).toBe(41);
    expect(footballFindLeaderQuestions).toHaveLength(82);
    expect(new Set(footballFindLeaderQuestions.map((question) => question.id)).size).toBe(82);
    expect(new Set(footballFindLeaderQuestions.map((question) => question.metricId)).size).toBe(41);
    expect(new Set(footballFindLeaderMetricDefinitions.map((metric) => metric.domainId))).toEqual(new Set([
      "nfl-qb-career",
      "nfl-rb-career",
      "cfb-champion-season",
    ]));
    expect(new Set(footballFindLeaderQuestions.map((question) => question.family))).toEqual(new Set(FOOTBALL_FIND_LEADER_FAMILY_CYCLE));
  });

  it("owns 25 audited candidates per domain without borrowing Hit the Number's subject pool", () => {
    expect(FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE).toBe(25);
    expect(FOOTBALL_FIND_LEADER_SUBJECT_COUNT).toBe(75);
    expect(new Set(footballFindLeaderSubjects.map((subject) => subject.id)).size).toBe(75);
    for (const domainId of ["nfl-qb-career", "nfl-rb-career", "cfb-champion-season"] as const) {
      expect(footballFindLeaderSubjects.filter((subject) => subject.domainId === domainId)).toHaveLength(25);
    }
  });

  it("resolves every objective number through the canonical factual facade with reviewed evidence", () => {
    for (const metric of footballFindLeaderMetricDefinitions) {
      const rows = footballFindLeaderMetricRows(metric.id);
      expect(rows, metric.id).toHaveLength(25);
      for (const row of rows) {
        const fact = getFootballFact(row.id, footballFindLeaderCanonicalMetricByMetric[metric.id]);
        expect(fact, `${metric.id}:${row.id}`).not.toBeNull();
        expect(fact!.fact.value).toBe(row.value);
        expect(fact!.sources.length).toBeGreaterThan(0);
      }
    }
  });

  it("builds every catalog question as a competitive ten-item board", () => {
    for (const question of footballFindLeaderQuestions) {
      const board = buildFootballFindLeaderBoard(question, `catalog|${question.id}`);
      expect(board, question.id).not.toBeNull();
      expect(board!.candidates).toHaveLength(FOOTBALL_FIND_LEADER_CANDIDATE_COUNT);
      expect(new Set(board!.candidates.map((candidate) => candidate.id)).size).toBe(FOOTBALL_FIND_LEADER_CANDIDATE_COUNT);
      const leader = board!.candidates.find((candidate) => candidate.id === board!.leaderId)!;
      expect(leader.value).toBe(board!.leaderValue);
      expect(board!.candidates.every((candidate) => candidate.value <= leader.value)).toBe(true);
    }
  });

  it("uses plausible decoys and limits true wildcards even with the deeper pools", () => {
    const audit = footballFindLeaderCompetitionAudit();
    expect(audit).toHaveLength(82);
    for (const row of audit) {
      expect(row.boardValid, row.definitionId).toBe(true);
      expect(row.nearContenderCount, row.definitionId).toBeGreaterThanOrEqual(4);
      expect(row.outsideClosestNineCount, row.definitionId).toBeLessThanOrEqual(2);
      if (row.nonRecordLeaderAvailable) expect(row.leaderIsGlobalMax, row.definitionId).toBe(false);
    }
  });

  it("is deterministic and never immediately repeats question, metric, or family", () => {
    const seed = "football-find-leader-deterministic";
    const first = createFootballFindLeaderBoard(seed, emptyHistory());
    expect(createFootballFindLeaderBoard(seed, emptyHistory())).toEqual(first);
    const recent = [
      `question:${first.definitionId}`,
      `metric:${first.metricId}`,
      `family:${first.family}`,
      ...first.candidates.map((candidate) => candidate.id),
    ];
    const history: PlayLineupHistory = {
      entries: [],
      recentItemIds: recent,
      recentFighterIds: [],
      lastLineup: recent,
    };
    const second = createFootballFindLeaderBoard("football-find-leader-next", history);
    expect(second.family).not.toBe(first.family);
    expect(second.definitionId).not.toBe(first.definitionId);
    expect(second.metricId).not.toBe(first.metricId);
  });

  it("preserves fixed-seed boards and exact formatted values from before the canonical rewire", () => {
    const fixtures = [
      {
        seed: "football-find-leader-deterministic",
        definitionId: "cfb-points-per-game:group",
        leaderId: "2000-oklahoma",
        candidates: ["2009-alabama", "2015-alabama", "1998-tennessee", "2004-usc", "2006-florida", "2000-oklahoma", "2012-alabama", "2021-georgia", "1999-florida-state", "2007-lsu"],
        formatted: ["32.1", "35.1", "34.0", "38.2", "29.7", "39.0", "38.7", "38.6", "37.5", "38.6"],
      },
      {
        seed: "parity-seed-17",
        definitionId: "cfb-points-against:standard",
        leaderId: "2000-oklahoma",
        candidates: ["2006-florida", "1995-nebraska", "1999-florida-state", "2008-florida", "2004-usc", "2012-alabama", "2009-alabama", "2002-ohio-state", "2000-oklahoma", "2017-alabama"],
        formatted: ["189", "150", "174", "181", "169", "153", "164", "183", "192", "167"],
      },
      {
        seed: "parity-seed-42",
        definitionId: "qb-passing-yards-per-game:group",
        leaderId: "andrew-luck",
        candidates: ["matt-ryan", "peyton-manning", "eli-manning", "brett-favre", "johnny-unitas", "kurt-warner", "dan-fouts", "tom-brady", "andrew-luck", "cam-newton"],
        formatted: ["268.3", "270.5", "241.6", "237.9", "190.7", "260.8", "237.8", "266.3", "275.2", "218.8"],
      },
    ] as const;

    for (const fixture of fixtures) {
      const board = createFootballFindLeaderBoard(fixture.seed, emptyHistory());
      expect(board.definitionId).toBe(fixture.definitionId);
      expect(board.leaderId).toBe(fixture.leaderId);
      expect(board.candidates.map(({ id }) => id)).toEqual(fixture.candidates);
      expect(board.candidates.map(({ value }) => formatFootballFindLeaderValue(board, value))).toEqual(fixture.formatted);
    }
  });

  it("preserves legacy display formatting for every factual metric", () => {
    for (const definition of footballFindLeaderMetricDefinitions) {
      for (const { value } of footballFindLeaderMetricRows(definition.id)) {
        const number = value.toLocaleString("en-US", {
          minimumFractionDigits: definition.decimals,
          maximumFractionDigits: definition.decimals,
        });
        const expected = definition.unit === "percent" ? `${number}%` : number;
        expect(formatFootballFindLeaderValue({ metricId: definition.id }, value)).toBe(expected);
      }
    }
  });

  it("balances NFL and CFB near 50/50 and materially expands unordered replay variety", () => {
    const audit = footballFindLeaderReplayAudit(1000);
    expect(audit.cfbShare).toBeGreaterThanOrEqual(0.45);
    expect(audit.cfbShare).toBeLessThanOrEqual(0.55);
    expect(audit.uniqueUnorderedBoardShare).toBeGreaterThan(0.9);
    expect(audit.metricsSeen).toBe(41);
    expect(audit.familiesSeen).toBe(8);
  });
});
