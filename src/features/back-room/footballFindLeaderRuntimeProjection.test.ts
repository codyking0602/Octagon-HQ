import { describe, expect, it } from "vitest";
import runtimeProjectionJson from "../../../data/generated/football/find-leader-runtime-projection.json";
import {
  footballFindLeaderMetricRows,
  footballFindLeaderPools,
} from "./footballFindLeaderModel";
import {
  getFootballFact,
  getFootballSubject,
  queryFootballSubjects,
} from "./footballFactualStats";
import {
  footballFindLeaderProjectedFactualRecords,
  FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_ELIGIBILITY,
  FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY,
} from "./footballFindLeaderRuntimeProjection";

describe("Football Find the Leader PR7 runtime projection", () => {
  it("keeps the checked-in compact projection internally deterministic", () => {
    const subjectIds = runtimeProjectionJson.subjects.map(({ id }) => id);
    const subjectIdSet = new Set(subjectIds);

    expect(subjectIdSet.size).toBe(subjectIds.length);
    expect(FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY.subjectCount).toBe(runtimeProjectionJson.subjects.length);
    expect(FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY.factualRecordCount).toBe(runtimeProjectionJson.records.length);
    expect(FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY.subjectCount).toBeGreaterThan(250);
    expect(FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY.factualRecordCount).toBeGreaterThan(250);
    expect(runtimeProjectionJson.subjects.every(({ tier }) => tier === "A" || tier === "B" || tier === "C")).toBe(true);
    for (const record of runtimeProjectionJson.records) {
      expect(subjectIdSet.has(record.subjectId), record.subjectId).toBe(true);
    }
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

  it("reconciles every projected fact subject through the canonical registry", () => {
    for (const record of footballFindLeaderProjectedFactualRecords) {
      expect(getFootballSubject(record.subjectId), record.subjectId).not.toBeNull();
    }
  });

  it("keeps source reconciliation internal and reviewed canonical facts authoritative", () => {
    const projectedBurrow = footballFindLeaderProjectedFactualRecords.find((record) =>
      getFootballSubject(record.subjectId)?.id === "cfb-joe-burrow"
      && record.facts.some((fact) => fact.metricId === "cfb-best-season-passing-yards"),
    );
    expect(projectedBurrow).toBeDefined();
    const canonicalBurrow = getFootballSubject(projectedBurrow!.subjectId);
    expect(canonicalBurrow?.id).toBe("cfb-joe-burrow");
    expect(canonicalBurrow?.aliases ?? []).not.toContain(projectedBurrow!.subjectId);

    const fact = getFootballFact("cfb-joe-burrow", "cfb-best-season-passing-yards");
    expect(fact).not.toBeNull();
    expect(fact!.fact.evidence.sourceIds).not.toContain("cfbfast-r-find-leader-projection");
  });

  it("never presents left-censored source windows as complete career facts", () => {
    expect(FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_ELIGIBILITY).toMatchObject({
      nflCareerMinimumStartSeason: 1999,
      cfbCareerMinimumStartSeason: 2015,
      nflQbSeasonMinimumAttempts: 200,
    });

    const subjectById = new Map(runtimeProjectionJson.subjects.map((subject) => [subject.id, subject]));
    for (const record of runtimeProjectionJson.records) {
      const subject = subjectById.get(record.subjectId);
      expect(subject, record.subjectId).toBeDefined();
      if (record.scope === "nfl-player-career") {
        expect(subject!.startSeason, record.subjectId).toBeGreaterThanOrEqual(1999);
      }
      if (record.scope === "cfb-player-career") {
        expect(subject!.startSeason, record.subjectId).toBeGreaterThanOrEqual(2015);
      }
    }
  });

  it("keeps enabled projected game rows on A-C casual subjects and the canonical fact facade", () => {
    const projectedPools = footballFindLeaderPools.filter((pool) => pool.subjectQuery.includeProjectedSourceSubjects === true);
    expect(projectedPools.length).toBeGreaterThan(0);

    for (const pool of projectedPools) {
      const eligibleSubjects = queryFootballSubjects(pool.subjectQuery);
      expect(eligibleSubjects.length, pool.metricId).toBeGreaterThanOrEqual(11);
      expect(eligibleSubjects.every((subject) => subject.casualEligible), pool.metricId).toBe(true);
      expect(eligibleSubjects.every((subject) => subject.recognizabilityTier !== "D"), pool.metricId).toBe(true);

      for (const row of footballFindLeaderMetricRows(pool.metricId)) {
        const fact = getFootballFact(row.id, pool.canonicalMetricId);
        expect(fact, `${pool.metricId}:${row.id}`).not.toBeNull();
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
