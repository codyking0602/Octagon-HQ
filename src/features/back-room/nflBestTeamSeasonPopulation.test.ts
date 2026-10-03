import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const artifact = JSON.parse(
  readFileSync("data/generated/football/nfl/nfl-best-teams-grading-v1.json", "utf8"),
);

describe("NFL best team-seasons population + hidden ladder", () => {
  it("locks the curated 200-team auction population without changing runtime", () => {
    expect(artifact.status).toBe("audit-locked-not-runtime");
    expect(artifact.subject_key).toBe("nfl-best-team-seasons-since-2000");
    expect(artifact.population.source_graded_count).toBe(293);
    expect(artifact.population.count).toBe(200);
    expect(artifact.items).toHaveLength(200);
    expect(artifact.population.era_counts).toEqual({
      "2000-2004": 30,
      "2005-2009": 35,
      "2010-2014": 40,
      "2015-2019": 40,
      "2020-2025": 55,
    });
  });

  it("uses the locked yearly caps instead of keeping every graded season", () => {
    const counts = artifact.items.reduce(
      (acc: Record<string, number>, item: { season_year: number }) => {
        acc[item.season_year] = (acc[item.season_year] ?? 0) + 1;
        return acc;
      },
      {},
    );

    for (let season = 2000; season <= 2004; season += 1) expect(counts[season]).toBe(6);
    for (let season = 2005; season <= 2009; season += 1) expect(counts[season]).toBe(7);
    for (let season = 2010; season <= 2019; season += 1) expect(counts[season]).toBe(8);
    for (let season = 2020; season <= 2024; season += 1) expect(counts[season]).toBe(9);
    expect(counts[2025]).toBe(10);
  });

  it("preserves unique identities and the already-locked half-point grades", () => {
    const identities = artifact.items.map(
      (item: { season_year: number; franchise_id: string }) =>
        `${item.season_year}|${item.franchise_id}`,
    );
    expect(new Set(identities).size).toBe(artifact.items.length);

    for (const item of artifact.items) {
      expect(item.hidden_grade).toBeGreaterThanOrEqual(74);
      expect(item.hidden_grade).toBeLessThanOrEqual(100);
      expect(item.hidden_grade * 2).toBe(Math.trunc(item.hidden_grade * 2));
    }
  });

  it("keeps recognizable lower-grade value seasons without inflating their grades", () => {
    const grade = (season: number, franchise: string) =>
      artifact.items.find(
        (item: { season_year: number; franchise_id: string }) =>
          item.season_year === season && item.franchise_id === franchise,
      )?.hidden_grade;

    expect(grade(2008, "NE")).toBe(85);
    expect(grade(2010, "SEA")).toBe(74);
    expect(grade(2011, "DEN")).toBe(74);
    expect(grade(2012, "WAS")).toBe(81);
    expect(grade(2020, "CLE")).toBe(82.5);
    expect(grade(2023, "GB")).toBe(79);
  });

  it("preserves the top anchor curve and the grading sanity check", () => {
    const grade = (season: number, franchise: string) =>
      artifact.items.find(
        (item: { season_year: number; franchise_id: string }) =>
          item.season_year === season && item.franchise_id === franchise,
      )?.hidden_grade;

    expect(grade(2007, "NE")).toBe(100);
    expect(grade(2004, "NE")).toBe(99.5);
    expect(grade(2013, "SEA")).toBe(99);
    expect(grade(2000, "BAL")).toBe(98);
    expect(grade(2010, "GB")).toBe(94.5);
    expect(grade(2023, "KC")).toBe(91);
    expect(artifact.grading.pairwise_dominance_audit.inversions_over_1_point).toBe(0);
    expect(artifact.grading.locked_distribution).toBeUndefined();
  });
});
