import { describe, expect, it } from "vitest";
import {
  footballFactualRecords,
  getFootballFact,
  getFootballSubject,
  type FootballFactMetricId,
  type FootballFactScope,
} from "./footballFactualStats";

const factCount = (scope: FootballFactScope, metricId: FootballFactMetricId) =>
  footballFactualRecords.filter(
    (record) => record.scope === scope && record.facts.some((fact) => fact.metricId === metricId),
  ).length;

const metricFactCount = (metricId: FootballFactMetricId) =>
  footballFactualRecords.filter((record) => record.facts.some((fact) => fact.metricId === metricId)).length;

describe("Football CFB factual depth expansion", () => {
  it("keeps receiving and coaching depth while making recognizable rushing depth materially reusable", () => {
    expect(factCount("cfb-player-career", "cfb-best-season-receptions")).toBeGreaterThanOrEqual(20);
    expect(factCount("cfb-player-career", "cfb-best-season-receiving-yards")).toBeGreaterThanOrEqual(20);
    expect(factCount("cfb-player-career", "cfb-best-season-receiving-touchdowns")).toBeGreaterThanOrEqual(20);

    expect(factCount("cfb-coach-career", "cfb-coach-career-wins")).toBe(11);
    expect(factCount("cfb-coach-career", "cfb-coach-career-losses")).toBe(11);

    expect(metricFactCount("cfb-best-season-rushing-yards")).toBeGreaterThanOrEqual(20);
    expect(metricFactCount("cfb-best-season-rushing-touchdowns")).toBeGreaterThanOrEqual(20);
  });

  it("stores the expanded CFB facts in the canonical ledger with source evidence", () => {
    expect(getFootballFact("cfb-amari-cooper", "cfb-best-season-receiving-yards")?.fact.value).toBe(1727);
    expect(getFootballFact("cfb-christian-mccaffrey", "cfb-best-season-receptions")?.fact.value).toBe(45);
    expect(getFootballFact("cfb-desmond-howard", "cfb-best-season-receiving-touchdowns")?.fact.value).toBe(19);
    expect(getFootballFact("cfb-bijan-robinson", "cfb-best-season-receiving-yards")?.fact.value).toBe(314);
    expect(getFootballFact("cfb-saquon-barkley", "cfb-best-season-receptions")?.fact.value).toBe(54);

    expect(getFootballFact("cfb-nndamukong-suh", "cfb-best-season-sacks")?.fact.value).toBe(12);
    expect(getFootballFact("cfb-joey-bosa", "cfb-best-season-tackles-for-loss")?.fact.value).toBe(21);
    expect(getFootballFact("cfb-minkah-fitzpatrick", "cfb-best-season-defensive-interceptions")?.fact.value).toBe(6);

    expect(getFootballFact("kirby-smart-cfb", "cfb-coach-career-wins")?.fact.value).toBe(117);
    expect(getFootballFact("dabo-swinney-cfb", "cfb-coach-career-wins")?.fact.value).toBe(187);
    expect(getFootballFact("mack-brown-cfb", "cfb-coach-career-ties")?.fact.value).toBe(1);
    expect(getFootballFact("chris-petersen-cfb", "cfb-coach-career-losses")?.fact.value).toBe(38);
    expect(getFootballFact("gary-patterson-cfb", "cfb-coach-career-wins")?.fact.value).toBe(181);

    for (const [subjectId, metricId] of [
      ["cfb-amari-cooper", "cfb-best-season-receiving-yards"],
      ["cfb-saquon-barkley", "cfb-best-season-receptions"],
      ["cfb-nndamukong-suh", "cfb-best-season-sacks"],
      ["dabo-swinney-cfb", "cfb-coach-career-wins"],
      ["cfb-ashton-jeanty", "cfb-best-season-rushing-yards"],
      ["cfb-mark-ingram-ii", "cfb-best-season-rushing-touchdowns"],
    ] as const) {
      expect(getFootballFact(subjectId, metricId)?.sources.length).toBeGreaterThan(0);
    }
  });

  it("keeps the new rushing depth inside the curated recognizable CFB subject universe", () => {
    const expectedRecognizableSubjects = [
      ["cfb-lamar-jackson", "Lamar Jackson"],
      ["cfb-mark-ingram-ii", "Mark Ingram II"],
      ["cfb-christian-mccaffrey", "Christian McCaffrey"],
      ["cfb-saquon-barkley", "Saquon Barkley"],
      ["cfb-ezekiel-elliott", "Ezekiel Elliott"],
      ["cfb-keenan-reynolds", "Keenan Reynolds"],
      ["cfb-ashton-jeanty", "Ashton Jeanty"],
      ["cfb-ron-dayne", "Ron Dayne"],
      ["cfb-eddie-george", "Eddie George"],
      ["cfb-rashaan-salaam", "Rashaan Salaam"],
      ["cfb-braelon-allen", "Braelon Allen"],
    ] as const;

    for (const [subjectId, expectedName] of expectedRecognizableSubjects) {
      const subject = getFootballSubject(subjectId);
      expect(subject?.name, subjectId).toBe(expectedName);
      expect(subject && (subject.leagues ?? [subject.league]).includes("CFB"), subjectId).toBe(true);
      expect(getFootballFact(subjectId, "cfb-best-season-rushing-yards"), subjectId).not.toBeNull();
      expect(getFootballFact(subjectId, "cfb-best-season-rushing-touchdowns"), subjectId).not.toBeNull();
    }
  });
});
