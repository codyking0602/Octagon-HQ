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
      "nfl-coach-career",
      "nfl-franchise-era",
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
    expect(getFootballFact("lawrence-taylor", "nfl-career-sacks")?.fact.value).toBe(132.5);
    expect(getFootballFact("nfl-ed-reed", "nfl-career-interceptions")?.fact.value).toBe(64);
    expect(getFootballFact("peyton-manning-2013", "nfl-season-passing-touchdowns")?.fact.value).toBe(55);
    expect(getFootballFact("cfb-joe-burrow-2019", "cfb-best-season-passing-yards")?.fact.value).toBe(4347);
    expect(getFootballFact("2017-cleveland-browns", "nfl-team-overall-wins")?.fact.value).toBe(0);
  });

  it("collapses cross-level aliases onto one canonical factual identity", () => {
    const canonicalLarry = getFootballFact("cfb-larry-fitzgerald", "nfl-career-receiving-yards");
    const nflAliasLarry = getFootballFact("nfl-larry-fitzgerald", "nfl-career-receiving-yards");
    expect(canonicalLarry?.record.subjectId).toBe("cfb-larry-fitzgerald");
    expect(nflAliasLarry?.record).toBe(canonicalLarry?.record);
    expect(canonicalLarry?.fact.value).toBe(17492);
    expect(getFootballFact("cfb-larry-fitzgerald", "cfb-best-season-receiving-yards")?.fact.value).toBe(1672);
  });

  it("covers modern CFB skill players, defenders, coaches, programs, Program Eras and non-title teams", () => {
    expect(getFootballFact("cfb-derrick-henry", "cfb-best-season-rushing-yards")?.fact.value).toBe(2219);
    expect(getFootballFact("cfb-devonta-smith", "cfb-best-season-receiving-yards")?.fact.value).toBe(1856);
    expect(getFootballFact("cfb-brock-bowers", "cfb-best-season-receiving-yards")?.fact.value).toBe(942);
    expect(getFootballFact("cfb-will-anderson-jr", "cfb-best-season-sacks")?.fact.value).toBe(17.5);
    expect(getFootballFact("cfb-travis-hunter", "cfb-best-season-defensive-interceptions")?.fact.value).toBe(4);
    expect(getFootballFact("nick-saban-cfb", "cfb-coach-national-titles")?.fact.value).toBe(7);
    expect(getFootballFact("program-alabama", "cfb-program-national-titles-since-2000")?.fact.value).toBe(6);
    expect(getFootballFact("alabama-2008-2023", "cfb-era-national-titles")?.fact.value).toBe(6);
    expect(getFootballFact("2022-tcu", "cfb-team-wins")?.fact.value).toBe(13);
    expect(getFootballFact("2022-tcu", "cfb-national-title")?.fact.value).toBe(0);
  });

  it("retains the compatibility seed facts that prove NFL and CFB support", () => {
    expect(getFootballFact("dan-marino", "nfl-career-passing-yards")?.fact.value).toBe(61361);
    expect(getFootballFact("john-elway", "nfl-super-bowl-titles")?.fact.value).toBe(2);
    expect(getFootballFact("emmitt-smith", "nfl-career-rushing-yards")?.fact.value).toBe(18355);
    expect(getFootballFact("barry-sanders", "nfl-career-rushing-yards")?.fact.value).toBe(15269);
    expect(getFootballFact("2013-florida-state", "cfb-team-wins")?.fact.value).toBe(14);
    expect(getFootballFact("2013-florida-state", "cfb-team-points-for")?.fact.value).toBe(723);
  });
});
