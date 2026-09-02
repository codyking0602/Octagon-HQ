import { describe, expect, it } from "vitest";
import {
  footballFactMetricDefinitions,
  footballFactSources,
  footballFactualRecords,
  formatFootballFact,
  getFootballFact,
  getFootballSubject,
} from "./footballFactualStats";

describe("Football factual stat owner", () => {
  it("keeps one unique canonical record per factual subject across broad Football scopes", () => {
    const recordIds = footballFactualRecords.map((record) => record.subjectId);
    const scopes = new Set(footballFactualRecords.flatMap((record) => record.scopes ?? [record.scope]));

    expect(new Set(recordIds).size).toBe(recordIds.length);
    expect(footballFactualRecords.length).toBeGreaterThanOrEqual(140);
    expect(scopes).toEqual(new Set([
      "nfl-player-career",
      "nfl-player-season",
      "nfl-team-season",
      "nfl-franchise",
      "cfb-player-career",
      "cfb-player-season",
      "cfb-team-season",
      "cfb-coach-career",
      "cfb-program",
      "cfb-program-era",
    ]));

    // Notable-game membership is recognition-owned. Game facts remain legitimately absent
    // until Stage 13.6 hydrates reviewed identities from factual source owners.
    expect(scopes.has("nfl-game")).toBe(false);
    expect(scopes.has("cfb-game")).toBe(false);

    for (const subjectId of recordIds) {
      const subject = getFootballSubject(subjectId);
      expect(subject, `canonical Football subject: ${subjectId}`).not.toBeNull();
      expect(subject?.id, `canonical Football identity: ${subjectId}`).toBe(subjectId);
    }
  });

  it("requires every fact to use one metric definition and reviewed evidence source", () => {
    const metricIds = new Set(footballFactMetricDefinitions.map((metric) => metric.id));
    const sourcesById = new Map(footballFactSources.map((source) => [source.id, source]));
    const approvedReviewDates = new Set(["2026-08-22", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28", "2026-09-02"]);

    expect(new Set(metricIds).size).toBe(footballFactMetricDefinitions.length);
    expect(new Set(footballFactSources.map((source) => source.id)).size).toBe(footballFactSources.length);

    for (const source of footballFactSources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(approvedReviewDates.has(source.reviewedOn), `${source.id}: ${source.reviewedOn}`).toBe(true);
      expect(source.coverage.length).toBeGreaterThan(10);
    }

    for (const record of footballFactualRecords) {
      const seenMetrics = new Set<string>();
      for (const fact of record.facts) {
        expect(metricIds.has(fact.metricId), `${record.subjectId}: ${fact.metricId}`).toBe(true);
        expect(seenMetrics.has(fact.metricId), `${record.subjectId}: duplicate ${fact.metricId}`).toBe(false);
        seenMetrics.add(fact.metricId);
        expect(Number.isFinite(fact.value)).toBe(true);
        expect(fact.evidence.sourceIds.length).toBeGreaterThan(0);
        for (const sourceId of fact.evidence.sourceIds) {
          expect(sourcesById.has(sourceId), `${record.subjectId}: ${sourceId}`).toBe(true);
        }
        if (fact.evidence.kind === "derived") {
          expect(fact.evidence.formula?.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("returns traceable numeric facts without importing comparison ratings", () => {
    const peytonYards = getFootballFact("peyton-manning", "nfl-career-passing-yards");
    expect(peytonYards?.fact.value).toBe(71940);
    expect(peytonYards?.sources.map((source) => source.id)).toEqual(["pfr-peyton-manning"]);
    expect(formatFootballFact("nfl-career-passing-yards", peytonYards!.fact.value)).toBe("71,940");

    const texasPoints = getFootballFact("2005-texas", "cfb-team-points-for");
    expect(texasPoints?.fact.value).toBe(652);
    expect(formatFootballFact("cfb-team-points-per-game", 50.2)).toBe("50.2");
    expect(formatFootballFact("cfb-national-title", 1)).toBe("Yes");
    expect(getFootballFact("2005-texas", "nfl-career-passing-yards")).toBeNull();
  });

  it("covers receivers, tight ends, defenders, player seasons and NFL team seasons", () => {
    expect(getFootballFact("nfl-jerry-rice", "nfl-career-receiving-yards")?.fact.value).toBe(22895);
    expect(getFootballFact("nfl-tony-gonzalez", "nfl-career-receptions")?.fact.value).toBe(1325);
    expect(getFootballFact("nfl-ray-lewis", "nfl-career-solo-tackles")?.fact.value).toBeGreaterThan(1000);
    expect(getFootballFact("nfl-jj-watt", "nfl-career-sacks")?.fact.value).toBeGreaterThan(100);
    expect(getFootballFact("nfl-ed-reed", "nfl-career-interceptions")?.fact.value).toBe(64);
    expect(getFootballFact("nfl-2004-peyton-manning", "nfl-season-passing-touchdowns")?.fact.value).toBe(49);
    expect(getFootballFact("nfl-team-season-2007-ne", "nfl-team-overall-wins")?.fact.value).toBe(18);
  });

  it("collapses cross-level aliases onto one canonical factual identity", () => {
    expect(getFootballFact("caleb-williams", "nfl-career-passing-yards")?.record.subjectId).toBe("nfl-caleb-williams");
    expect(getFootballFact("nfl-caleb-williams", "nfl-career-passing-yards")?.fact.value).toBeGreaterThan(3000);
  });

  it("covers modern CFB skill players, defenders, coaches, programs, Program Eras and non-title teams", () => {
    expect(getFootballFact("cfb-joe-burrow", "cfb-career-passing-yards")?.fact.value).toBeGreaterThan(8000);
    expect(getFootballFact("cfb-davante-adams", "cfb-career-receiving-yards")?.fact.value).toBeGreaterThan(2000);
    expect(getFootballFact("cfb-myles-garrett", "cfb-career-sacks")?.fact.value).toBeGreaterThan(30);
    expect(getFootballFact("cfb-nick-saban", "cfb-coach-career-wins")?.fact.value).toBeGreaterThan(250);
    expect(getFootballFact("cfb-program-alabama", "cfb-program-wins-since-2000")?.fact.value).toBeGreaterThan(200);
    expect(getFootballFact("cfb-era-2007-2023-alabama", "cfb-era-national-titles")?.fact.value).toBeGreaterThanOrEqual(6);
    expect(getFootballFact("cfb-team-season-2023-texas", "cfb-team-wins")?.fact.value).toBe(12);
  });

  it("retains the compatibility seed facts that prove NFL and CFB support", () => {
    expect(getFootballFact("peyton-manning", "nfl-career-passing-yards")?.fact.value).toBe(71940);
    expect(getFootballFact("2005-texas", "cfb-team-points-for")?.fact.value).toBe(652);
  });
});
