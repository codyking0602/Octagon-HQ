import { describe, expect, it } from "vitest";
import {
  FOOTBALL_FACTUAL_CATALOG_SUBJECT_COUNT,
  FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE,
  footballCfbChampionSeasonRows,
  footballFactualCatalogSubjects,
  footballFindLeaderSources,
  footballFactualStatLineSources,
  footballNflQbCareerRows,
  footballNflRbCareerRows,
  getFootballFindLeaderFact,
} from "./footballFactualStats";

describe("canonical Football factual catalog", () => {
  it("owns the current NFL and CFB stat-line universes", () => {
    expect(footballNflQbCareerRows).toHaveLength(FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE);
    expect(footballNflRbCareerRows).toHaveLength(FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE);
    expect(footballCfbChampionSeasonRows).toHaveLength(FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE);
    expect(footballFactualCatalogSubjects).toHaveLength(FOOTBALL_FACTUAL_CATALOG_SUBJECT_COUNT);
    expect(new Set(footballFactualCatalogSubjects.map((subject) => subject.id)).size).toBe(
      FOOTBALL_FACTUAL_CATALOG_SUBJECT_COUNT,
    );
  });

  it("preserves the reviewed stat-line values consumed by Find the Leader", () => {
    expect(footballNflQbCareerRows.find((row) => row.id === "peyton-manning")?.passingYards).toBe(71940);
    expect(footballNflRbCareerRows.find((row) => row.id === "emmitt-smith")?.rushingYards).toBe(18355);
    expect(footballCfbChampionSeasonRows.find((row) => row.id === "2005-texas")?.pointsFor).toBe(652);

    expect(getFootballFindLeaderFact("peyton-manning", "qb-passing-yards")?.value).toBe(71940);
    expect(getFootballFindLeaderFact("emmitt-smith", "rb-rushing-yards")?.value).toBe(18355);
    expect(getFootballFindLeaderFact("2005-texas", "cfb-points-for")?.value).toBe(652);
  });

  it("keeps factual evidence ownership outside the game adapter", () => {
    expect(footballFindLeaderSources).toBe(footballFactualStatLineSources);
    expect(footballFactualStatLineSources.map((source) => source.id)).toEqual([
      "pfr-career-stat-lines",
      "cfr-champion-season-stat-lines",
    ]);
  });
});
