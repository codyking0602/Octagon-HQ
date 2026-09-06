import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BLIND_RANK_ARCHETYPES,
  FOOTBALL_KEEP_CUT_BOARD_STYLES,
  buildFootballBlindRankBoard,
  buildFootballKeepCutBoard,
  footballBlindRankBoardTypeForSeed,
  footballKeepCutBoardTypeForSeed,
} from "./footballComparisonGeneration";
import {
  buildFootballKeepCutLineup,
  footballKeepCutPacks,
} from "./footballKeepCutModel";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
} from "./footballRankFivePlayableModel";

describe("Football comparison generation maturity", () => {
  it("owns only the football-specific board lottery", () => {
    expect(FOOTBALL_BLIND_RANK_ARCHETYPES.map(({ id, weight }) => [id, weight])).toEqual([
      ["wild-card", 0.35],
      ["loaded", 0.15],
      ["middle-maze", 0.15],
      ["top-bottom", 0.10],
      ["knife-edge", 0.15],
      ["ladder", 0.10],
    ]);
    expect(FOOTBALL_KEEP_CUT_BOARD_STYLES.map(({ id, weight }) => [id, weight])).toEqual([
      ["wild-card", 0.30],
      ["loaded", 0.15],
      ["middle-maze", 0.15],
      ["top-bottom", 0.15],
      ["knife-edge", 0.20],
      ["ladder", 0.05],
    ]);
  });

  it("keeps Blind Rank deterministic for a seed while separating board type from reveal order", () => {
    for (const pack of footballRankFivePacks) {
      const seed = `blind-maturity-${pack.id}`;
      const first = buildFootballBlindRankBoard(pack.items, pack.id, seed);
      const second = buildFootballBlindRankBoard(pack.items, pack.id, seed);
      expect(first.boardType).toBe(footballBlindRankBoardTypeForSeed(pack.id, seed).id);
      expect(first.items.map((item) => item.id)).toEqual(second.items.map((item) => item.id));
      expect(buildFootballRankFiveLineup(pack.id, seed).map((item) => item.id)).toEqual(first.items.map((item) => item.id));
    }
  });

  it("keeps Keep/Cut deterministic and aligned with the canonical public lineup", () => {
    for (const pack of footballKeepCutPacks) {
      const seed = `keep-cut-maturity-${pack.id}`;
      const first = buildFootballKeepCutBoard(pack.items, pack.id, seed);
      const second = buildFootballKeepCutBoard(pack.items, pack.id, seed);
      expect(first.boardType).toBe(footballKeepCutBoardTypeForSeed(pack.id, seed).id);
      expect(first.items.map((item) => item.id)).toEqual(second.items.map((item) => item.id));
      expect(buildFootballKeepCutLineup(pack.id, seed).map((item) => item.id)).toEqual(first.items.map((item) => item.id));
    }
  });
});
