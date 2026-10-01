import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const artifact = JSON.parse(
  readFileSync("data/generated/football/nfl/nfl-best-teams-grading-v1.json", "utf8"),
);

describe("NFL best team-seasons population + hidden ladder", () => {
  it("locks the 2000-2025 population without changing runtime", () => {
    expect(artifact.status).toBe("audit-locked-not-runtime");
    expect(artifact.subject_key).toBe("nfl-best-team-seasons-since-2000");
    expect(artifact.population.count).toBe(293);
    expect(artifact.items).toHaveLength(293);
    expect(artifact.population.era_counts).toEqual({
      "2000-2004": 34,
      "2005-2009": 47,
      "2010-2014": 65,
      "2015-2019": 61,
      "2020-2025": 86,
    });
  });

  it("keeps every season identity unique and grades on half-point increments", () => {
    const identities = artifact.items.map(
      (item: { season_year: number; franchise_id: string }) =>
        `${item.season_year}|${item.franchise_id}`,
    );
    expect(new Set(identities).size).toBe(artifact.items.length);

    for (const item of artifact.items) {
      expect(item.season_year).toBeGreaterThanOrEqual(2000);
      expect(item.season_year).toBeLessThanOrEqual(2025);
      expect(item.hidden_grade).toBeGreaterThanOrEqual(74);
      expect(item.hidden_grade).toBeLessThanOrEqual(100);
      expect(item.hidden_grade * 2).toBe(Math.trunc(item.hidden_grade * 2));
      expect(item.card_tag).toContain(item.record);
    }
  });

  it("locks the intended anchor curve", () => {
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
    expect(grade(2007, "NYG")).toBe(88.5);
    expect(grade(2010, "SEA")).toBe(74);
  });

  it("keeps recognition as a membership rule, not a grade bonus", () => {
    expect(artifact.population.recognition_hooks).toHaveLength(6);
    expect(
      artifact.items.filter(
        (item: { membership_basis: string }) => item.membership_basis === "recognition-hook",
      ),
    ).toHaveLength(6);
  });

  it("passes the locked pairwise dominance audit", () => {
    expect(artifact.grading.pairwise_dominance_audit.inversions_over_1_point).toBe(0);
  });
});
