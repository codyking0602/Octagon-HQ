import { describe, expect, it } from "vitest";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";
import {
  getNflQbHistoricalConsensus,
  historicalRankPercentile,
  NFL_QB_MANUAL_AUDIT_ORDER,
  PFR_HOF_MONITOR_QB_FIELD_SIZE,
  resolveHistoricalConsensus,
} from "./footballHistoricalConsensus";

describe("football historical consensus", () => {
  it("converts PFR ranks to the 250-QB percentile backbone", () => {
    expect(historicalRankPercentile(1, 250)).toBe(100);
    expect(historicalRankPercentile(250, 250)).toBe(0);
    expect(historicalRankPercentile(10, 250)).toBeCloseTo(96.3855, 4);
  });

  it("uses a Ranker top-50 placement only as the agreed 30% modifier on the PFR universe", () => {
    const result = resolveHistoricalConsensus({
      pfr: { rank: 10, fieldSize: PFR_HOF_MONITOR_QB_FIELD_SIZE },
      ranker: { rank: 5, fieldSize: 70 },
    });
    const pfr = historicalRankPercentile(10, 250);
    const rankerAdjusted = historicalRankPercentile(5, 250);

    expect(result.calculationSource).toBe("pfr-ranker");
    expect(result.requiresAudit).toBe(false);
    expect(result.rankerPercentile).toBeCloseTo(rankerAdjusted, 6);
    expect(result.score).toBeCloseTo(pfr * 0.7 + rankerAdjusted * 0.3, 6);
  });

  it("uses PFR alone when Ranker is missing", () => {
    const result = resolveHistoricalConsensus({
      pfr: { rank: 10, fieldSize: PFR_HOF_MONITOR_QB_FIELD_SIZE },
    });

    expect(result.calculationSource).toBe("pfr-only");
    expect(result.requiresAudit).toBe(false);
    expect(result.score).toBeCloseTo(historicalRankPercentile(10, 250), 6);
  });

  it("ignores Ranker positions 51-70 instead of treating deep fan-vote placement as negative evidence", () => {
    const result = resolveHistoricalConsensus({
      pfr: { rank: 69, fieldSize: PFR_HOF_MONITOR_QB_FIELD_SIZE },
      ranker: { rank: 58, fieldSize: 70 },
    });

    expect(result.calculationSource).toBe("pfr-only");
    expect(result.rankerPercentile).toBeNull();
    expect(result.score).toBeCloseTo(historicalRankPercentile(69, 250), 6);
  });

  it("requires an explicit audit for a current career even when PFR and Ranker are present", () => {
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

  it("uses each rule on representative runtime QBs", () => {
    expect(getNflQbHistoricalConsensus("tom-brady").calculationSource).toBe("pfr-ranker");
    expect(getNflQbHistoricalConsensus("nflverse-player-00-0008442").calculationSource).toBe("pfr-only");
    expect(getNflQbHistoricalConsensus("aaron-rodgers").calculationSource).toBe("manual-audit");
    expect(getNflQbHistoricalConsensus("drew-brees").calculationSource).toBe("manual-audit");
  });

  it("covers the exact canonical 122-QB runtime pool with unique audit placements", () => {
    const canonicalIds = getFootballRankFivePack("nfl-quarterbacks").items.map((item) => item.id);

    expect(NFL_QB_MANUAL_AUDIT_ORDER).toHaveLength(122);
    expect(new Set(NFL_QB_MANUAL_AUDIT_ORDER).size).toBe(122);
    expect(new Set(NFL_QB_MANUAL_AUDIT_ORDER)).toEqual(new Set(canonicalIds));
    expect(NFL_QB_MANUAL_AUDIT_ORDER.every((id) => getNflQbHistoricalConsensus(id).score != null)).toBe(true);
  });
});
