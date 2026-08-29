import { describe, expect, it } from "vitest";
import {
  FOOTBALL_HISTORICAL_POOL_RECOGNITION_CENSUS,
  footballHistoricalPoolRecognitionRecords,
} from "./footballHistoricalPoolRecognitionEvidence";
import {
  FOOTBALL_ESPN_CFB150_REVIEWED_ARCHIVE_RANKS,
  FOOTBALL_NFL100_REVIEWED_ARCHIVE_RANKS,
} from "./footballHistoricalPoolRecognitionDisposition";
import { footballHistoricalTierIssue } from "./footballRecognitionHistoricalPolicy";
import { footballProjectedNonPlayerRecognitionSubjects } from "./footballRecognizabilityProjection";

describe("Football historical game and NFL era recognition census", () => {
  it("is rooted in broad independent historical reviews rather than the old shallow pools", () => {
    expect(FOOTBALL_HISTORICAL_POOL_RECOGNITION_CENSUS.nflGames.reviewedCandidates).toBe(100);
    expect(FOOTBALL_HISTORICAL_POOL_RECOGNITION_CENSUS.cfbGames.reviewedCandidates).toBe(150);
    expect(FOOTBALL_HISTORICAL_POOL_RECOGNITION_CENSUS.nflGames.refreshThroughSeason).toBe(2025);
    expect(FOOTBALL_HISTORICAL_POOL_RECOGNITION_CENSUS.cfbGames.refreshThroughSeason).toBe(2025);
  });

  it("durably accounts for every ranked source candidate as admitted or reviewed archive", () => {
    const assertExhaustiveDisposition = (
      evidenceFamily: "nfl-100-games" | "espn-cfb150-games",
      reviewedCandidates: number,
      archivedRanks: readonly number[],
    ) => {
      const admittedRanks = footballHistoricalPoolRecognitionRecords
        .filter((record) => record.evidenceFamily === evidenceFamily && record.sourceRank != null)
        .map((record) => record.sourceRank!);
      expect(new Set(admittedRanks).size).toBe(admittedRanks.length);
      expect(new Set(archivedRanks).size).toBe(archivedRanks.length);

      const allDispositionRanks = [...admittedRanks, ...archivedRanks].sort((a, b) => a - b);
      expect(new Set(allDispositionRanks).size).toBe(reviewedCandidates);
      expect(allDispositionRanks).toEqual(Array.from({ length: reviewedCandidates }, (_, index) => index + 1));
    };

    assertExhaustiveDisposition(
      "nfl-100-games",
      FOOTBALL_HISTORICAL_POOL_RECOGNITION_CENSUS.nflGames.reviewedCandidates,
      FOOTBALL_NFL100_REVIEWED_ARCHIVE_RANKS,
    );
    assertExhaustiveDisposition(
      "espn-cfb150-games",
      FOOTBALL_HISTORICAL_POOL_RECOGNITION_CENSUS.cfbGames.reviewedCandidates,
      FOOTBALL_ESPN_CFB150_REVIEWED_ARCHIVE_RANKS,
    );
  });

  it("keeps reviewed recognition identities unique and historical-policy legal", () => {
    const ids = footballHistoricalPoolRecognitionRecords.map((record) => record.subject.id);
    const sourceIds = footballHistoricalPoolRecognitionRecords.map((record) => record.sourceIdentityKey.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(sourceIds).size).toBe(sourceIds.length);
    expect(footballHistoricalPoolRecognitionRecords.every((record) => record.sourceIdentityKey.provider === "octagon-hq")).toBe(true);
    expect(footballHistoricalPoolRecognitionRecords.every((record) => (
      footballHistoricalTierIssue(
        record.subject.league,
        record.subject.endSeason ?? record.subject.season,
        record.tier,
      ) == null
    ))).toBe(true);
  });

  it("restores deep NFL game history with real A, B and C depth", () => {
    const games = footballProjectedNonPlayerRecognitionSubjects.filter(
      (row) => row.subject.kind === "game" && row.subject.league === "NFL",
    );
    expect(games.length).toBeGreaterThan(26);
    expect(new Set(games.map((row) => row.tier))).toEqual(new Set(["A", "B", "C"]));
    for (const id of [
      "nfl-game-1958-championship",
      "nfl-game-1972-immaculate-reception",
      "nfl-game-1981-nfc-title",
      "nfl-game-2007-super-bowl-xlii",
      "nfl-game-2021-bills-chiefs",
    ]) {
      expect(games.some((row) => row.subject.id === id)).toBe(true);
    }
  });

  it("restores deep CFB game history with real A, B and C depth", () => {
    const games = footballProjectedNonPlayerRecognitionSubjects.filter(
      (row) => row.subject.kind === "game" && row.subject.league === "CFB",
    );
    expect(games.length).toBeGreaterThan(25);
    expect(new Set(games.map((row) => row.tier))).toEqual(new Set(["A", "B", "C"]));
    for (const id of [
      "cfb-game-1971-nebraska-oklahoma",
      "cfb-game-1982-cal-stanford",
      "cfb-game-1984-hail-flutie",
      "cfb-game-2007-app-state-michigan",
      "cfb-game-2013-kick-six",
      "cfb-game-2025-indiana-miami-title",
    ]) {
      expect(games.some((row) => row.subject.id === id)).toBe(true);
    }
  });

  it("restores NFL era depth beyond the modern 12-row seed and includes all three tiers", () => {
    const eras = footballProjectedNonPlayerRecognitionSubjects.filter(
      (row) => row.subject.kind === "program-era" && row.subject.league === "NFL",
    );
    expect(eras.length).toBeGreaterThan(12);
    expect(new Set(eras.map((row) => row.tier))).toEqual(new Set(["A", "B", "C"]));
    for (const id of [
      "nfl-era-packers-lombardi",
      "nfl-era-steelers-steel-curtain",
      "nfl-era-cowboys-landry",
      "nfl-era-washington-gibbs",
      "nfl-era-patriots-belichick-brady",
      "nfl-era-chiefs-mahomes-reid",
    ]) {
      expect(eras.some((row) => row.subject.id === id)).toBe(true);
    }
  });

  it("does not leak source-list ordering into the product recognition tier contract", () => {
    const ranked = footballHistoricalPoolRecognitionRecords.filter((record) => record.sourceRank != null);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.some((record) => record.sourceRank! > 50 && record.tier === "A")).toBe(true);
    expect(ranked.some((record) => record.sourceRank! < 50 && record.tier === "B")).toBe(true);
  });
});
