import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlayLineupHistory } from "../play/lineupModel";
import {
  FOOTBALL_FIND_LEADER_CANDIDATE_COUNT,
  FOOTBALL_FIND_LEADER_FAMILY_CYCLE,
  FOOTBALL_FIND_LEADER_MIN_POOL_SIZE,
  buildFootballFindLeaderBoard,
  createFootballFindLeaderBoard,
  footballFindLeaderCompetitionAudit,
  footballFindLeaderCanonicalMetricByMetric,
  footballFindLeaderEnabledMetricDefinitions,
  footballFindLeaderMetricQuality,
  footballFindLeaderMetricRows,
  footballFindLeaderPools,
  footballFindLeaderQuestions,
  footballFindLeaderReplayAudit,
  formatFootballFindLeaderValue,
} from "./footballFindLeaderModel";
import {
  FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE,
  FOOTBALL_FIND_LEADER_SUBJECT_COUNT,
  footballFindLeaderSubjects,
  getFootballFact,
} from "./footballFactualStats";
import {
  FOOTBALL_FIND_LEADER_METRIC_COUNT,
  footballFindLeaderMetricDefinitions,
} from "./footballFindLeaderStats";

function emptyHistory(): PlayLineupHistory {
  return { entries: [], recentItemIds: [], recentFighterIds: [], lastLineup: [] };
}

describe("Football Find the Leader maturity", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("owns one expanded activation catalog and keeps the surfaced question count in the target range", () => {
    expect(FOOTBALL_FIND_LEADER_METRIC_COUNT).toBe(56);
    expect(footballFindLeaderMetricDefinitions).toHaveLength(56);
    expect(footballFindLeaderQuestions.length).toBe(footballFindLeaderEnabledMetricDefinitions.length * 2);
    expect(footballFindLeaderQuestions.length).toBeGreaterThanOrEqual(90);
    expect(footballFindLeaderQuestions.length).toBeLessThanOrEqual(120);
    expect(new Set(footballFindLeaderQuestions.map((question) => question.id)).size).toBe(footballFindLeaderQuestions.length);
    expect(new Set(footballFindLeaderQuestions.map((question) => question.metricId)).size).toBe(footballFindLeaderEnabledMetricDefinitions.length);
    expect(new Set(footballFindLeaderQuestions.map((question) => question.family))).toEqual(new Set(FOOTBALL_FIND_LEADER_FAMILY_CYCLE));
  });

  it("keeps the permanent quality gate authoritative instead of auto-enabling every factual row", () => {
    const enabledIds = new Set(footballFindLeaderEnabledMetricDefinitions.map(({ id }) => id));
    for (const definition of footballFindLeaderMetricDefinitions) {
      expect(enabledIds.has(definition.id), definition.id).toBe(footballFindLeaderMetricQuality(definition.id).eligible);
    }

    expect(enabledIds.has("nfl-receiving-receptions")).toBe(true);
    expect(enabledIds.has("nfl-receiving-yards")).toBe(true);
    expect(enabledIds.has("nfl-receiving-touchdowns")).toBe(true);
    expect(enabledIds.has("nfl-defense-sacks")).toBe(true);
    expect(enabledIds.has("nfl-defense-interceptions")).toBe(true);

    expect(footballFindLeaderMetricRows("cfb-player-rushing-yards")).toHaveLength(10);
    expect(footballFindLeaderMetricRows("cfb-player-rushing-touchdowns")).toHaveLength(10);
    expect(footballFindLeaderMetricQuality("cfb-player-rushing-yards")).toMatchObject({ eligible: false, reason: "too-few-candidates" });
    expect(footballFindLeaderMetricQuality("cfb-player-rushing-touchdowns")).toMatchObject({ eligible: false, reason: "too-few-candidates" });
    expect(enabledIds.has("cfb-player-rushing-yards")).toBe(false);
    expect(enabledIds.has("cfb-player-rushing-touchdowns")).toBe(false);

    expect(footballFindLeaderMetricQuality("cfb-team-season-losses")).toMatchObject({ eligible: false, reason: "tied-leader" });
    expect(enabledIds.has("cfb-team-season-losses")).toBe(false);
    expect(FOOTBALL_FIND_LEADER_MIN_POOL_SIZE).toBe(11);
  });

  it("preserves the legacy 25-per-domain factual base without borrowing another game's roster", () => {
    expect(FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE).toBe(25);
    expect(FOOTBALL_FIND_LEADER_SUBJECT_COUNT).toBe(75);
    expect(new Set(footballFindLeaderSubjects.map((subject) => subject.id)).size).toBe(75);
    for (const domainId of ["nfl-qb-career", "nfl-rb-career", "cfb-champion-season"] as const) {
      expect(footballFindLeaderSubjects.filter((subject) => subject.domainId === domainId)).toHaveLength(25);
    }
  });

  it("declaratively queries every enabled number through the canonical registry and factual facade", () => {
    expect(footballFindLeaderPools).toHaveLength(footballFindLeaderEnabledMetricDefinitions.length);
    for (const metric of footballFindLeaderEnabledMetricDefinitions) {
      const rows = footballFindLeaderMetricRows(metric.id);
      expect(rows.length, metric.id).toBeGreaterThanOrEqual(FOOTBALL_FIND_LEADER_MIN_POOL_SIZE);
      const pool = footballFindLeaderPools.find(({ metricId }) => metricId === metric.id)!;
      expect(pool.canonicalMetricId).toBe(footballFindLeaderCanonicalMetricByMetric[metric.id]);
      for (const row of rows) {
        const fact = getFootballFact(row.id, footballFindLeaderCanonicalMetricByMetric[metric.id]);
        expect(fact, `${metric.id}:${row.id}`).not.toBeNull();
        expect(fact!.fact.value).toBe(row.value);
        expect(fact!.sources.length).toBeGreaterThan(0);
      }
    }
  });

  it("activates real receiving and defensive depth while leaving shallow college pools dormant", () => {
    expect(footballFindLeaderMetricRows("nfl-receiving-receptions")).toHaveLength(17);
    expect(footballFindLeaderMetricRows("nfl-receiving-yards")).toHaveLength(17);
    expect(footballFindLeaderMetricRows("nfl-receiving-touchdowns")).toHaveLength(17);
    expect(footballFindLeaderMetricRows("nfl-defense-sacks").length).toBeGreaterThanOrEqual(12);
    expect(footballFindLeaderMetricRows("nfl-defense-interceptions").length).toBeGreaterThanOrEqual(12);

    const receivingPool = footballFindLeaderPools.find(({ metricId }) => metricId === "nfl-receiving-yards")!;
    expect(receivingPool).toMatchObject({
      canonicalMetricId: "nfl-career-receiving-yards",
      factualScope: "nfl-player-career",
      subjectQuery: { kind: "player-career", league: "NFL", positions: ["WR", "TE"] },
    });
    const defensePool = footballFindLeaderPools.find(({ metricId }) => metricId === "nfl-defense-sacks")!;
    expect(defensePool).toMatchObject({
      canonicalMetricId: "nfl-career-sacks",
      factualScope: "nfl-player-career",
      subjectQuery: { kind: "player-career", league: "NFL", positions: ["DL", "LB", "DB"] },
    });
  });

  it("builds every enabled catalog question as a competitive ten-item board", () => {
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

  it("uses plausible decoys and limits true wildcards across the expanded catalog", () => {
    const audit = footballFindLeaderCompetitionAudit();
    expect(audit).toHaveLength(footballFindLeaderQuestions.length);
    for (const row of audit) {
      expect(row.boardValid, row.definitionId).toBe(true);
      expect(row.nearContenderCount, row.definitionId).toBeGreaterThanOrEqual(4);
      expect(row.outsideClosestNineCount, row.definitionId).toBeLessThanOrEqual(2);
      if (row.nonRecordLeaderAvailable) expect(row.leaderIsGlobalMax, row.definitionId).toBe(false);
    }
  });

  it("keeps NFL career, season, team, receiving and defense scopes genuinely distinct", () => {
    const careerIds = new Set(footballFindLeaderMetricRows("qb-passing-yards").map(({ id }) => id));
    const seasonIds = footballFindLeaderMetricRows("qb-season-passing-yards").map(({ id }) => id);
    const teamIds = footballFindLeaderMetricRows("nfl-team-wins").map(({ id }) => id);
    const receivingIds = footballFindLeaderMetricRows("nfl-receiving-yards").map(({ id }) => id);
    const defenseIds = footballFindLeaderMetricRows("nfl-defense-sacks").map(({ id }) => id);
    expect(seasonIds).toHaveLength(11);
    expect(teamIds).toHaveLength(18);
    expect(seasonIds.every((id) => !careerIds.has(id))).toBe(true);
    expect(seasonIds.filter((id) => teamIds.includes(id))).toHaveLength(0);
    expect(receivingIds.filter((id) => defenseIds.includes(id))).toHaveLength(0);
  });

  it("keeps the broader CFB team-season pool materially larger than champions", () => {
    const championIds = new Set(footballFindLeaderMetricRows("cfb-points-for").map(({ id }) => id));
    const broaderRows = footballFindLeaderMetricRows("cfb-team-season-wins");
    const pool = footballFindLeaderPools.find(({ metricId }) => metricId === "cfb-team-season-wins")!;
    expect(pool).toMatchObject({
      canonicalMetricId: "cfb-team-wins",
      factualScope: "cfb-team-season",
      subjectQuery: { kind: "team-season", league: "CFB" },
    });
    expect(broaderRows.length).toBeGreaterThan(25);
    expect(broaderRows.some(({ id }) => !championIds.has(id))).toBe(true);
  });

  it("is deterministic and avoids an immediate question, metric, or family repeat", () => {
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

  it("formats every enabled metric from the canonical factual definition", () => {
    for (const definition of footballFindLeaderEnabledMetricDefinitions) {
      for (const { value } of footballFindLeaderMetricRows(definition.id)) {
        const formatted = formatFootballFindLeaderValue({ metricId: definition.id }, value);
        expect(formatted.length).toBeGreaterThan(0);
      }
    }
    expect(formatFootballFindLeaderValue({ metricId: "nfl-defense-sacks" }, 132.5)).toBe("132.5");
  });

  it("rebalances 1,000 deterministic boards away from QB/RB careers while preserving replay variety", () => {
    const audit = footballFindLeaderReplayAudit(1000);
    console.info("Find the Leader 1,000-board PR3 audit", JSON.stringify(audit));
    expect(audit.cfbShare).toBe(0.5);
    expect(audit.uniqueUnorderedBoardShare).toBeGreaterThan(0.9);
    expect(audit.metricsSeen).toBeGreaterThanOrEqual(48);
    expect(audit.definitionsSeen).toBeGreaterThanOrEqual(85);
    expect(audit.subjectsSeen).toBeGreaterThan(100);
    expect(audit.cfbSubjectsSeen).toBeGreaterThan(25);

    const qbRbCareerShare = (audit.domainShare["nfl-qb-career"] ?? 0) + (audit.domainShare["nfl-rb-career"] ?? 0);
    expect(qbRbCareerShare).toBeLessThanOrEqual(0.21);
    expect(audit.domainShare["nfl-receiving-career"]).toBeGreaterThanOrEqual(0.09);
    expect(audit.domainShare["nfl-defense-career"]).toBeGreaterThanOrEqual(0.09);
    expect(audit.domainShare["nfl-qb-season"]).toBeGreaterThanOrEqual(0.04);
    expect(audit.domainShare["nfl-team-season"]).toBeGreaterThanOrEqual(0.04);
    expect(audit.domainShare["cfb-team-season"]).toBeGreaterThanOrEqual(0.09);
    expect(audit.domainShare["cfb-player-rushing"] ?? 0).toBe(0);
  });
});
