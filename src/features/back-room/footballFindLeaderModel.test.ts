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
} from "./footballFindLeaderModel";
import {
  FOOTBALL_FIND_LEADER_METRIC_COUNT,
  footballFindLeaderMetricDefinitions,
  footballFindLeaderSources,
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

  it("resolves every objective number through the canonical factual facade with reviewed evidence", () => {
    expect(footballFindLeaderSources.every((source) => source.reviewedOn === "2026-08-22" && source.url.startsWith("https://"))).toBe(true);
    for (const metric of footballFindLeaderMetricDefinitions) {
      const rows = footballFindLeaderMetricRows(metric.id);
      expect(rows.length, metric.id).toBeGreaterThanOrEqual(10);
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

  it("uses plausible decoys and avoids the overall record holder whenever a non-record leader is viable", () => {
    const audit = footballFindLeaderCompetitionAudit();
    expect(audit).toHaveLength(82);
    for (const row of audit) {
      expect(row.boardValid, row.definitionId).toBe(true);
      expect(row.nearContenderCount, row.definitionId).toBeGreaterThanOrEqual(4);
      expect(row.outsideClosestNineCount, row.definitionId).toBeLessThanOrEqual(2);
      if (row.nonRecordLeaderAvailable) expect(row.leaderIsGlobalMax, row.definitionId).toBe(false);
    }
  });

  it("is deterministic for the same seed/history and rotates away from recently used families", () => {
    const seed = "football-find-leader-deterministic";
    const first = createFootballFindLeaderBoard(seed, emptyHistory());
    expect(createFootballFindLeaderBoard(seed, emptyHistory())).toEqual(first);
    const history: PlayLineupHistory = {
      entries: [],
      recentItemIds: [`question:${first.definitionId}`, `metric:${first.metricId}`, `family:${first.family}`],
      recentFighterIds: [],
      lastLineup: [],
    };
    const second = createFootballFindLeaderBoard("football-find-leader-next", history);
    expect(second.family).not.toBe(first.family);
    expect(second.definitionId).not.toBe(first.definitionId);
    expect(second.metricId).not.toBe(first.metricId);
  });
});
