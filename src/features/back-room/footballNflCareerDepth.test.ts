import { describe, expect, it } from "vitest";
import { getFootballRatingBand, type FootballRatingBand } from "./footballContentContract";
import { footballRankFivePacks, type FootballRankFivePackId } from "./footballRankFiveModel";

const nflCareerPackIds: readonly FootballRankFivePackId[] = [
  "nfl-quarterbacks",
  "nfl-running-backs",
  "nfl-wide-receivers",
  "nfl-head-coaches",
];

function bandCounts(packId: FootballRankFivePackId) {
  const pack = footballRankFivePacks.find((row) => row.id === packId)!;
  return pack.items.reduce<Record<FootballRatingBand, number>>((counts, item) => {
    counts[getFootballRatingBand(item.rating)] += 1;
    return counts;
  }, {
    elite: 0,
    great: 0,
    good: 0,
    average: 0,
    "below-average": 0,
    bad: 0,
  });
}

describe("Football NFL career depth", () => {
  it("gives every reviewed NFL career pack enough recognizable depth for real tier variety", () => {
    const nflSubjects = nflCareerPackIds.flatMap((packId) => {
      const pack = footballRankFivePacks.find((row) => row.id === packId)!;
      expect(pack.items.length).toBeGreaterThanOrEqual(38);
      expect(pack.items.every((item) => item.league === "NFL")).toBe(true);
      expect(pack.items.every((item) => (item.ratingBasis?.length ?? 0) > 30)).toBe(true);
      return pack.items;
    });

    expect(nflSubjects.length).toBeGreaterThanOrEqual(160);
    expect(new Set(nflSubjects.map((item) => item.id)).size).toBe(nflSubjects.length);
  });

  it("uses the full absolute scale instead of treating the bottom of an all-star pool as low", () => {
    for (const packId of nflCareerPackIds) {
      const counts = bandCounts(packId);
      expect(counts.elite).toBeGreaterThanOrEqual(6);
      expect(counts.great).toBeGreaterThanOrEqual(10);
      expect(counts.good).toBeGreaterThanOrEqual(4);
      expect(counts.average).toBeGreaterThanOrEqual(4);
      expect(counts["below-average"]).toBeGreaterThanOrEqual(2);
      expect(counts.bad).toBeGreaterThanOrEqual(2);

      const pack = footballRankFivePacks.find((row) => row.id === packId)!;
      expect(pack.items.filter((item) => item.rating < 70).length).toBeGreaterThanOrEqual(8);
    }
  });

  it("anchors the low end with recognizable failed or short NFL careers", () => {
    const expectations: Record<string, FootballRatingBand> = {
      "ryan-leaf": "bad",
      "johnny-manziel": "bad",
      "trent-richardson": "bad",
      "montee-ball": "bad",
      "corey-coleman": "bad",
      "nkeal-harry": "bad",
      "matt-patricia": "bad",
      "hue-jackson": "bad",
      "mitchell-trubisky": "below-average",
      "darren-mcfadden": "below-average",
      "kelvin-benjamin": "below-average",
      "adam-gase": "below-average",
    };

    const byId = new Map(
      nflCareerPackIds.flatMap((packId) => footballRankFivePacks.find((row) => row.id === packId)!.items)
        .map((item) => [item.id, item] as const),
    );

    for (const [itemId, expectedBand] of Object.entries(expectations)) {
      const item = byId.get(itemId);
      expect(item, itemId).toBeDefined();
      expect(getFootballRatingBand(item!.rating)).toBe(expectedBand);
    }
  });
});
