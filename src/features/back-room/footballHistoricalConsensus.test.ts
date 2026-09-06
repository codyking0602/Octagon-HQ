import { describe, expect, it } from "vitest";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";
import {
  getNflQbHistoricalConsensus,
  historicalRankPercentile,
  NFL_QB_MANUAL_AUDIT_ORDER,
  resolveHistoricalConsensus,
} from "./footballHistoricalConsensus";

describe("football historical consensus", () => {
  it("converts source ranks to within-position percentiles", () => {
    expect(historicalRankPercentile(1, 250)).toBe(100);
    expect(historicalRankPercentile(250, 250)).toBe(0);
    expect(historicalRankPercentile(10, 250)).toBeCloseTo(96.3855, 4);
    expect(historicalRankPercentile(5, 70)).toBeCloseTo(94.2029, 4);
  });

  it("weights complete retired-player evidence 70% PFR and 30% Ranker", () => {
    const result = resolveHistoricalConsensus({
      pfr: { rank: 10, fieldSize: 250 },
      ranker: { rank: 5, fieldSize: 70 },
    });

    expect(result.calculationSource).toBe("pfr-ranker");
    expect(result.requiresAudit).toBe(false);
    expect(result.score).toBeCloseTo(95.7307, 4);
  });

  it("never reweights a lone source to 100%", () => {
    const result = resolveHistoricalConsensus({
      pfr: { rank: 10, fieldSize: 250 },
    });

    expect(result.calculationSource).toBe("unresolved");
    expect(result.requiresAudit).toBe(true);
    expect(result.score).toBeNull();
  });

  it("requires an audit for a current career even when both sources exist", () => {
    const unresolved = resolveHistoricalConsensus({
      pfr: { rank: 3, fieldSize: 250 },
      ranker: { rank: 3, fieldSize: 70 },
      currentCareer: true,
    });
    expect(unresolved.score).toBeNull();
    expect(unresolved.requiresAudit).toBe(true);

    const audited = resolveHistoricalConsensus({
      pfr: { rank: 3, fieldSize: 250 },
      ranker: { rank: 3, fieldSize: 70 },
      currentCareer: true,
      auditedPercentile: 97.5,
    });
    expect(audited.calculationSource).toBe("manual-audit");
    expect(audited.score).toBe(97.5);
  });

  it("uses the source formula for complete retired snapshots", () => {
    const brady = getNflQbHistoricalConsensus("tom-brady");
    expect(brady.calculationSource).toBe("pfr-ranker");
    expect(brady.score).toBe(100);

    const mcnair = getNflQbHistoricalConsensus("nflverse-player-00-0011024");
    expect(mcnair.calculationSource).toBe("pfr-ranker");
    expect(mcnair.score).toBeGreaterThan(75);
    expect(mcnair.score).toBeLessThan(80);
  });

  it("uses explicit audit placement for current or missing-source QBs", () => {
    expect(getNflQbHistoricalConsensus("aaron-rodgers").calculationSource).toBe("manual-audit");
    expect(getNflQbHistoricalConsensus("patrick-mahomes").calculationSource).toBe("manual-audit");
  });

  it("covers the exact canonical 122-QB runtime pool with unique audit decisions", () => {
    const canonicalIds = getFootballRankFivePack("nfl-quarterbacks").items.map((item) => item.id);

    expect(NFL_QB_MANUAL_AUDIT_ORDER).toHaveLength(122);
    expect(new Set(NFL_QB_MANUAL_AUDIT_ORDER).size).toBe(122);
    expect(new Set(NFL_QB_MANUAL_AUDIT_ORDER)).toEqual(new Set(canonicalIds));
    expect(NFL_QB_MANUAL_AUDIT_ORDER.every((id) => getNflQbHistoricalConsensus(id).score != null)).toBe(true);
  });
});
