import { describe, expect, it } from "vitest";
import {
  canonicalRankingInputs,
  historicalRankingMigrationInputs,
  rankingInputDatasetSchema,
} from "./rankingInputs";
import { rankingContract } from "../engine/rankingContract";
import { v1ProductionRankingParityFixture } from "../engine/parityFixture";

describe("V2 ranking ownership", () => {
  it("owns the live roster and scoring contract inside Octagon HQ", () => {
    expect(canonicalRankingInputs.source.repository).toBe("codyking0602/Octagon-HQ");
    expect(canonicalRankingInputs.source.commit).toBe("octagon-hq-ranking-inputs-v1");
    expect(canonicalRankingInputs.source.historicalBaseline).toEqual({
      repository: "codyking0602/ufc-goat-rankings",
      commit: "842ba06ea09c4f40723226f4c4dfd35041cb3314",
    });
    expect(rankingContract).toEqual({
      categoryMax: v1ProductionRankingParityFixture.contract.categoryMax,
      weights: v1ProductionRankingParityFixture.contract.weights,
      ovr: v1ProductionRankingParityFixture.contract.ovr,
    });
  });

  it("keeps the imported 80-fighter roster as sealed migration evidence", () => {
    expect(historicalRankingMigrationInputs.counts).toEqual({
      fighters: 80,
      men: 65,
      women: 15,
    });
    expect(historicalRankingMigrationInputs.fighters).toHaveLength(80);
  });

  it("accepts a complete additional fighter without a hard-coded roster count", () => {
    const fighter = structuredClone(canonicalRankingInputs.fighters[0]);
    fighter.fighter = "V2 Expansion Test Fighter";
    fighter.judgments.championship.fighter = fighter.fighter;
    fighter.judgments.opponentQuality.fighter = fighter.fighter;
    fighter.judgments.apex.fighter = fighter.fighter;
    fighter.eraDepth.fighter = fighter.fighter;
    fighter.presentation.slug = "v2-expansion-test-fighter";

    const expanded = rankingInputDatasetSchema.parse({
      ...canonicalRankingInputs,
      counts: {
        fighters: canonicalRankingInputs.counts.fighters + 1,
        men: canonicalRankingInputs.counts.men + 1,
        women: canonicalRankingInputs.counts.women,
      },
      fighters: [...canonicalRankingInputs.fighters, fighter],
      filters: {
        ...canonicalRankingInputs.filters,
        eraMembership: {
          ...canonicalRankingInputs.filters.eraMembership,
          [fighter.fighter]: canonicalRankingInputs.filters.eraMembership[
            canonicalRankingInputs.fighters[0].fighter
          ],
        },
      },
    });

    expect(expanded.counts.fighters).toBe(81);
    expect(expanded.counts.men).toBe(66);
  });
});
