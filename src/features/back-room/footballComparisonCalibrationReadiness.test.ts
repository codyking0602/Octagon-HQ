import { describe, expect, it } from "vitest";
import {
  footballGreatnessTierForItem,
  footballGreatnessTierLabel,
} from "./footballGreatnessTier";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";

const PACK_IDS = [
  "nfl-quarterbacks",
  "nfl-running-backs",
  "nfl-wide-receivers",
  "nfl-tight-ends",
  "nfl-front-seven",
  "nfl-secondary",
] as const;

const WATCH_NAMES: Partial<Record<(typeof PACK_IDS)[number], readonly string[]>> = {
  "nfl-quarterbacks": [
    "Brett Favre", "Steve Young", "Dak Prescott", "Jared Goff", "Josh Allen",
    "Steve McNair", "Joe Namath", "Andy Dalton",
  ],
  "nfl-running-backs": ["Frank Gore", "LeSean McCoy"],
  "nfl-wide-receivers": ["Jerry Rice", "Randy Moss", "Antonio Brown", "Julio Jones"],
  "nfl-tight-ends": [
    "Mike Ditka", "George Kittle", "Benjamin Watson", "Hunter Henry", "Jared Cook",
  ],
  "nfl-front-seven": [
    "Michael Strahan", "Morgan Fox", "Von Miller", "Vonnie Holliday", "Luke Kuechly", "Manny Lawson",
  ],
  "nfl-secondary": [
    "Champ Bailey", "Brandon Carr", "Darrelle Revis", "Darnell Savage", "Brent Grimes",
  ],
};

describe("Football reviewed-profile calibration readiness", () => {
  it("prints the affected runtime distributions and watched anchors", () => {
    for (const packId of PACK_IDS) {
      const pack = getFootballRankFivePack(packId);
      const rows = pack.items
        .map((item) => ({
          id: item.id,
          name: item.name,
          rating: item.rating,
          tier: footballGreatnessTierLabel(footballGreatnessTierForItem(item), pack.items),
          source: (item as typeof item & { evaluationSource?: string }).evaluationSource ?? null,
          basis: item.ratingBasis ?? null,
        }))
        .sort((left, right) => right.rating - left.rating || left.name.localeCompare(right.name));
      const tierCounts = Object.fromEntries(
        [...new Set(rows.map((row) => row.tier))]
          .map((tier) => [tier, rows.filter((row) => row.tier === tier).length]),
      );
      const watched = rows.filter((row) => WATCH_NAMES[packId]?.includes(row.name));
      console.log("FOOTBALL_CALIBRATION_READINESS", JSON.stringify({
        packId,
        count: rows.length,
        tierCounts,
        watched,
        top15: rows.slice(0, 15).map(({ name, rating, tier, source }) => ({ name, rating, tier, source })),
      }));
      expect(rows.length).toBeGreaterThan(0);
    }
  });
});
