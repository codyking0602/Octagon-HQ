import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlayLineupHistory } from "../play/lineupModel";
import {
  FOOTBALL_FIND_LEADER_CANDIDATE_COUNT,
  FOOTBALL_FIND_LEADER_FAMILY_CYCLE,
  buildFootballFindLeaderBoard,
  createFootballFindLeaderBoard,
  footballFindLeaderCompetitionAudit,
  footballFindLeaderMetricRows,
  footballFindLeaderQuestions,
  footballFindLeaderReplayAudit,
} from "./footballFindLeaderModel";
import {
  FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE,
  FOOTBALL_FIND_LEADER_METRIC_COUNT,
  FOOTBALL_FIND_LEADER_SUBJECT_COUNT,
  footballFindLeaderMetricDefinitions,
  footballFindLeaderSources,
  footballFindLeaderSubjects,
  getFootballFindLeaderFact,
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
    expect(footballFindLeaderSources.every((source) => source.reviewedOn === "2026-08-22" && source.url.startsWith("https://"))).toBe(true);
    for (const metric of footballFindLeaderMetricDefinitions) {
      const rows = footballFindLeaderMetricRows(metric.id);
      expect(rows, metric.id).toHaveLength(25);
      for (const row of rows) {
        const fact = getFootballFindLeaderFact(row.id, metric.id);
        expect(fact, `${metric.id}:${row.id}`).not.toBeNull();
        expect(fact!.value).toBe(row.value);
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

  it("balances NFL and CFB near 50/50 and materially expands unordered replay variety", () => {
    const audit = footballFindLeaderReplayAudit(1000);
    expect(audit.cfbShare).toBeGreaterThanOrEqual(0.45);
    expect(audit.cfbShare).toBeLessThanOrEqual(0.55);
    expect(audit.uniqueUnorderedBoardShare).toBeGreaterThan(0.9);
    expect(audit.metricsSeen).toBe(41);
    expect(audit.familiesSeen).toBe(8);
  });
});
