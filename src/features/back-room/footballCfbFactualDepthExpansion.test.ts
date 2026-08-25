import { describe, expect, it } from "vitest";
import {
  footballFactualRecords,
  getFootballFact,
  type FootballFactMetricId,
  type FootballFactScope,
} from "./footballFactualStats";

const factCount = (scope: FootballFactScope, metricId: FootballFactMetricId) =>
  footballFactualRecords.filter(
    (record) => record.scope === scope && record.facts.some((fact) => fact.metricId === metricId),
  ).length;

describe("Football CFB factual depth expansion", () => {
  it("reaches reusable receiving and coach depth without crossing the dormant rushing boundary", () => {
    expect(factCount("cfb-player-career", "cfb-best-season-receptions")).toBe(11);
    expect(factCount("cfb-player-career", "cfb-best-season-receiving-yards")).toBe(11);
    expect(factCount("cfb-player-career", "cfb-best-season-receiving-touchdowns")).toBe(11);

    expect(factCount("cfb-coach-career", "cfb-coach-career-wins")).toBe(11);
    expect(factCount("cfb-coach-career", "cfb-coach-career-losses")).toBe(11);

    // PR3 owns Find the Leader activation; PR2 must not auto-enable the existing rushing definitions.
    expect(factCount("cfb-player-career", "cfb-best-season-rushing-yards")).toBe(10);
    expect(factCount("cfb-player-career", "cfb-best-season-rushing-touchdowns")).toBe(10);
  });

  it("stores the new CFB facts in the canonical ledger with source evidence", () => {
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
    ] as const) {
      expect(getFootballFact(subjectId, metricId)?.sources.length).toBeGreaterThan(0);
    }
  });
});
