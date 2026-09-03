import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballComparisonCategorySpecs } from "../back-room/footballComparisonAuthority";
import { footballRankFivePacks as reviewedFootballRankFivePacks } from "../back-room/footballRankFiveModel";
import {
  GAME_SOURCE_AUTHORITY,
  footballGameComparisonCandidateIsEligible,
  footballGameComparisonCandidates,
  footballGameSubjectMeetsFactRequirements,
} from "./gameSourceAuthority";

describe("Games source authority", () => {
  it("declares canonical owners without inventing a second provider", () => {
    expect(GAME_SOURCE_AUTHORITY["find-the-leader"].Football.owners).toEqual(["football-factual-registry"]);
    expect(GAME_SOURCE_AUTHORITY["hit-the-number"].Football.owners).toEqual(["football-factual-registry"]);
    expect(GAME_SOURCE_AUTHORITY.wavelength.Football.owners).toEqual(["football-wavelength-catalog"]);
    expect(GAME_SOURCE_AUTHORITY["blind-resume"].Football.owners).toEqual([
      "football-factual-registry",
      "football-comparison-authority",
    ]);
    expect(GAME_SOURCE_AUTHORITY["blind-rank-5"].Football.owners).toEqual(["football-comparison-authority"]);
    expect(GAME_SOURCE_AUTHORITY["keep-4-cut-4"].Football.owners).toEqual(["football-comparison-authority"]);
    expect(GAME_SOURCE_AUTHORITY.auction.UFC.owners).toEqual([
      "ufc-auction-runtime",
      "ufc-calculated-ranking",
      "ufc-approved-play-ratings",
    ]);
    expect(GAME_SOURCE_AUTHORITY["20-questions"].Football.status).toBe("future");
    expect(GAME_SOURCE_AUTHORITY["who-am-i"].Football.status).toBe("future");
    expect(GAME_SOURCE_AUTHORITY["draft-room"].Football.status).toBe("future");
  });

  it("locks Football greatness games to tier truth instead of fake exact ordering", () => {
    expect(GAME_SOURCE_AUTHORITY["blind-resume"].Football.comparisonResolution).toBe("greatness-tier-three-way");
    expect(GAME_SOURCE_AUTHORITY["blind-rank-5"].Football.comparisonResolution).toBe("greatness-tier");
    expect(GAME_SOURCE_AUTHORITY["keep-4-cut-4"].Football.comparisonResolution).toBe("greatness-tier");

    const philosophy = readFileSync("docs/football-greatness-tier-philosophy.md", "utf8");
    expect(philosophy).toContain("Resume A");
    expect(philosophy).toContain("Same Tier");
    expect(philosophy).toContain("Resume B");
    expect(philosophy).toContain("it does not manufacture the historical answer");
  });

  it("keeps PR2 out of the unfinished Football Blind Resume tier-mechanic conversion", () => {
    const blindResume = readFileSync("src/features/back-room/footballBlindResumeModel.ts", "utf8");
    expect(blindResume).toContain('from "./footballRankFiveModel"');
    expect(blindResume).not.toContain('from "./footballRankFivePlayableModel"');
    expect(blindResume).not.toContain("footballGameComparisonCandidates");
  });

  it("fails closed through canonical factual and comparison eligibility", () => {
    expect(footballGameSubjectMeetsFactRequirements("not-a-canonical-subject", [
      { anyOf: ["nfl-career-passing-yards"] },
    ])).toBe(false);

    expect(footballGameComparisonCandidateIsEligible("nfl-quarterbacks", {
      evaluationSource: "canonical-facts",
      factMetricIds: [],
      rankingStatus: "rated",
    })).toBe(false);
    expect(footballGameComparisonCandidateIsEligible("nfl-quarterbacks", {
      evaluationSource: "reviewed",
      factMetricIds: [],
      rankingStatus: "low-confidence",
    })).toBe(false);
    expect(footballGameComparisonCandidateIsEligible("nfl-quarterbacks", {
      evaluationSource: "reviewed",
      factMetricIds: [],
      rankingStatus: "rated",
    })).toBe(true);

    const reviewedPack = reviewedFootballRankFivePacks.find((pack) => pack.id === "nfl-quarterbacks")!;
    const candidates = footballGameComparisonCandidates(reviewedPack.id, reviewedPack.items);
    const minimumFacts = footballComparisonCategorySpecs[reviewedPack.id].minimumFacts;
    expect(candidates.length).toBeGreaterThanOrEqual(5);
    expect(candidates.every((candidate) => candidate.rankingStatus === "rated")).toBe(true);
    expect(candidates.every((candidate) =>
      candidate.evaluationSource === "reviewed" || candidate.factMetricIds.length >= minimumFacts
    )).toBe(true);
  });

  it("keeps existing comparison and Auction runtimes on their established canonical paths", () => {
    const footballBlindRank = readFileSync("src/features/back-room/footballRankFivePlayableModel.ts", "utf8");
    const footballKeepCut = readFileSync("src/features/back-room/footballKeepCutModel.ts", "utf8");
    const auctionRepository = readFileSync("src/features/play/auctionRepository.ts", "utf8");

    expect(footballBlindRank).toContain("footballGameComparisonCandidates");
    expect(footballBlindRank).not.toContain("buildFootballComparisonCandidatePool");
    expect(footballKeepCut).toContain("footballRankFivePlayableModel");
    expect(auctionRepository).toContain("getSupabaseClient");
    expect(auctionRepository).toContain("get_auction_participant_state");
  });
});
