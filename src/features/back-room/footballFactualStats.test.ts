import { describe, expect, it } from "vitest";
import { footballRankFivePacks } from "./footballRankFiveModel";
import {
  footballFactMetricDefinitions,
  footballFactSources,
  footballFactualRecords,
  formatFootballFact,
  getFootballFact,
} from "./footballFactualStats";

describe("Football factual stat owner", () => {
  it("keeps one unique canonical record per comparison subject", () => {
    const comparisonSubjectIds = new Set(
      footballRankFivePacks.flatMap((pack) => pack.items.map((item) => item.id)),
    );
    const recordIds = footballFactualRecords.map((record) => record.subjectId);

    expect(new Set(recordIds).size).toBe(recordIds.length);
    expect(new Set(footballFactualRecords.map((record) => record.scope))).toEqual(
      new Set(["nfl-player-career", "cfb-team-season"]),
    );
    for (const subjectId of recordIds) {
      expect(comparisonSubjectIds.has(subjectId), `canonical Football subject: ${subjectId}`).toBe(true);
    }
  });

  it("requires every fact to use one metric definition and reviewed evidence source", () => {
    const metricIds = new Set(footballFactMetricDefinitions.map((metric) => metric.id));
    const sourcesById = new Map(footballFactSources.map((source) => [source.id, source]));

    expect(new Set(metricIds).size).toBe(footballFactMetricDefinitions.length);
    expect(new Set(footballFactSources.map((source) => source.id)).size).toBe(footballFactSources.length);

    for (const source of footballFactSources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.reviewedOn).toBe("2026-08-22");
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

  it("locks the reviewed seed facts that prove NFL and CFB support", () => {
    expect(getFootballFact("dan-marino", "nfl-career-passing-yards")?.fact.value).toBe(61361);
    expect(getFootballFact("john-elway", "nfl-super-bowl-titles")?.fact.value).toBe(2);
    expect(getFootballFact("emmitt-smith", "nfl-career-rushing-yards")?.fact.value).toBe(18355);
    expect(getFootballFact("barry-sanders", "nfl-career-rushing-yards")?.fact.value).toBe(15269);
    expect(getFootballFact("2013-florida-state", "cfb-team-wins")?.fact.value).toBe(14);
    expect(getFootballFact("2013-florida-state", "cfb-team-points-for")?.fact.value).toBe(723);
  });
});
