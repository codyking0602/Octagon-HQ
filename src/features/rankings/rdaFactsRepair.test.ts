import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./data/rankingInputs";
import { divisionRankingReport } from "./rankingControls";
import { getFighter } from "./rankingModel";

describe("Rafael dos Anjos factual reconciliation", () => {
  it("matches the corrected UFC career ledger", () => {
    const input = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Rafael dos Anjos",
    );
    const fighter = getFighter("rafael-dos-anjos");

    expect(input).toBeDefined();
    expect(fighter).toBeDefined();
    expect(input?.facts.fights).toHaveLength(36);
    expect(input?.facts.fights.filter((fight) => fight.officialResult === "win")).toHaveLength(21);
    expect(input?.facts.fights.filter((fight) => fight.officialResult === "loss")).toHaveLength(15);
    expect(fighter?.visibleStats.ufcRecord).toBe("21-15");
  });

  it("keeps the Moicano catchweight bout out of RDA's division boards", () => {
    const lightweight = divisionRankingReport.boards.Lightweight?.find(
      (row) => row.fighter.fighter === "Rafael dos Anjos",
    );
    const welterweight = divisionRankingReport.boards.Welterweight?.find(
      (row) => row.fighter.fighter === "Rafael dos Anjos",
    );

    expect(lightweight?.stats).toMatchObject({
      ufcRecord: "15-9",
      ufcFightCount: 24,
      ufcWins: 15,
      ufcLosses: 9,
    });
    expect(welterweight?.stats).toMatchObject({
      ufcRecord: "5-6",
      ufcFightCount: 11,
      ufcWins: 5,
      ufcLosses: 6,
    });
    expect((lightweight?.stats.ufcFightCount ?? 0) + (welterweight?.stats.ufcFightCount ?? 0)).toBe(35);
  });

  it("preserves heavyweight allocation for Stipe Miocic", () => {
    const heavyweight = divisionRankingReport.boards.Heavyweight?.find(
      (row) => row.fighter.fighter === "Stipe Miocic",
    );

    expect(heavyweight?.stats.ufcRecord).toBe("14-5");
    expect(divisionRankingReport.passed).toBe(true);
  });
});