import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  footballFindLeaderMetricRows,
  footballFindLeaderPools,
} from "./footballFindLeaderModel";
import {
  getFootballFact,
  queryFootballSubjects,
} from "./footballFactualStats";
import { FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY } from "./footballFindLeaderRuntimeProjection";

const deepMetricIds = [
  "qb-passing-yards",
  "rb-rushing-yards",
  "nfl-receiving-yards",
  "nfl-defense-sacks",
  "qb-season-passing-yards",
  "nfl-team-wins",
  "cfb-player-rushing-yards",
  "cfb-player-receiving-yards",
  "cfb-team-season-wins",
] as const;

describe("Football Find the Leader PR7 runtime projection", () => {
  it("keeps the checked-in compact projection deterministic", () => {
    expect(() => execFileSync("node", ["scripts/generate-football-find-leader-runtime.mjs", "--check"], { stdio: "pipe" })).not.toThrow();
    expect(FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY.subjectCount).toBeGreaterThan(250);
    expect(FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY.factualRecordCount).toBeGreaterThan(250);
  });

  it("materially deepens every source-safe Find the Leader lane", () => {
    expect(footballFindLeaderMetricRows("qb-passing-yards").length).toBeGreaterThan(40);
    expect(footballFindLeaderMetricRows("rb-rushing-yards").length).toBeGreaterThan(40);
    expect(footballFindLeaderMetricRows("nfl-receiving-yards").length).toBeGreaterThan(40);
    expect(footballFindLeaderMetricRows("nfl-defense-sacks").length).toBeGreaterThan(30);
    expect(footballFindLeaderMetricRows("qb-season-passing-yards").length).toBeGreaterThan(50);
    expect(footballFindLeaderMetricRows("nfl-team-wins").length).toBeGreaterThan(30);
    expect(footballFindLeaderMetricRows("cfb-player-rushing-yards").length).toBeGreaterThan(20);
    expect(footballFindLeaderMetricRows("cfb-player-receiving-yards").length).toBeGreaterThan(20);
    expect(footballFindLeaderMetricRows("cfb-team-season-wins").length).toBeGreaterThan(30);
  });

  it("keeps game rows on A-C casual subjects and the canonical fact facade", () => {
    for (const metricId of deepMetricIds) {
      const pool = footballFindLeaderPools.find((candidate) => candidate.metricId === metricId)!;
      const eligibleSubjects = queryFootballSubjects(pool.subjectQuery);
      expect(eligibleSubjects.length, metricId).toBeGreaterThanOrEqual(11);
      expect(eligibleSubjects.every((subject) => subject.casualEligible), metricId).toBe(true);
      expect(eligibleSubjects.every((subject) => subject.recognizabilityTier !== "D"), metricId).toBe(true);

      for (const row of footballFindLeaderMetricRows(metricId)) {
        const fact = getFootballFact(row.id, pool.canonicalMetricId);
        expect(fact, `${metricId}:${row.id}`).not.toBeNull();
        expect(fact!.fact.value).toBe(row.value);
      }
    }
  });

  it("does not invent an unsafe cross-program coach identity", () => {
    const coachPool = footballFindLeaderPools.find((candidate) => candidate.metricId === "cfb-coach-career-wins")!;
    expect(coachPool.subjectQuery).not.toHaveProperty("includeProjectedSourceSubjects", true);
    expect(coachPool.subjectQuery).not.toHaveProperty("sourceProvider");
  });
});
