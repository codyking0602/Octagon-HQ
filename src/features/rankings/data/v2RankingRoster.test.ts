import { describe, expect, it } from "vitest";
import {
  v2RankingRoster,
  type V2RankingRosterOverlay,
} from "./v2RankingRoster";

const sourceOverrides: Pick<
  V2RankingRosterOverlay,
  | "modelAsOfDate"
  | "factsVersion"
  | "judgmentVersion"
  | "eraLedgerVersion"
  | "eraDepthVersion"
  | "eraDepthResolutionVersion"
> = {
  modelAsOfDate: v2RankingRoster.modelAsOfDate,
  factsVersion: v2RankingRoster.factsVersion,
  judgmentVersion: v2RankingRoster.judgmentVersion,
  eraLedgerVersion: v2RankingRoster.eraLedgerVersion,
  eraDepthVersion: v2RankingRoster.eraDepthVersion,
  eraDepthResolutionVersion: v2RankingRoster.eraDepthResolutionVersion,
};

describe("V2 ranking roster overlay", () => {
  it("keeps the empty overlay compatible with every optional source override", () => {
    expect(v2RankingRoster.additions).toEqual([]);
    expect(v2RankingRoster.replacements).toEqual({});
    expect(v2RankingRoster.eraMembership).toEqual({});
    expect(sourceOverrides).toEqual({
      modelAsOfDate: undefined,
      factsVersion: undefined,
      judgmentVersion: undefined,
      eraLedgerVersion: undefined,
      eraDepthVersion: undefined,
      eraDepthResolutionVersion: undefined,
    });
  });
});
