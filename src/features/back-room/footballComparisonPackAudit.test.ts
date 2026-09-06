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
  "nfl-head-coaches",
  "college-quarterbacks",
  "college-head-coaches",
  "college-program-eras",
] as const;

describe("temporary football comparison pack audit", () => {
  it("prints exact runtime counts, tiers, tops and boundaries", () => {
    console.log("FOOTBALL_PACK_AUDIT_BEGIN");
    for (const packId of PACK_IDS) {
      const pack = getFootballRankFivePack(packId);
      const rows = pack.items
        .map((item) => ({
          id: item.id,
          name: item.name,
          rating: item.rating,
          internalTier: footballGreatnessTierForItem(item),
          visibleTier: footballGreatnessTierLabel(footballGreatnessTierForItem(item), pack.items),
          evaluationSource: (item as typeof item & { evaluationSource?: string }).evaluationSource ?? null,
        }))
        .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
      const tierCounts = Object.fromEntries(
        [...new Set(rows.map((row) => row.visibleTier))]
          .sort((a, b) => Number(a.replace("TIER ", "")) - Number(b.replace("TIER ", "")))
          .map((tier) => [tier, rows.filter((row) => row.visibleTier === tier).length]),
      );
      const boundaries = rows
        .slice(0, -1)
        .filter((row, index) => row.visibleTier !== rows[index + 1]!.visibleTier)
        .map((row, index) => ({
          upper: row,
          lower: rows[rows.indexOf(row) + 1],
        }));
      console.log(JSON.stringify({
        packId,
        count: rows.length,
        tierCounts,
        top15: rows.slice(0, 15),
        boundaries,
      }));
      expect(rows.length).toBeGreaterThan(0);
    }
    console.log("FOOTBALL_PACK_AUDIT_END");
  });
});
