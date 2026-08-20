import { describe, expect, it } from "vitest";
import type { CanonicalFight, CanonicalFightSupplementalFacts } from "../rankings/engine/schemas";
import { deriveUfcCareerStats } from "./ufcCareerStats";

function supplemental(
  overrides: Partial<CanonicalFightSupplementalFacts> = {},
): CanonicalFightSupplementalFacts {
  return {
    source: {
      provider: "ufcstats",
      eventId: "event-1",
      fightId: "fight-1",
      checkedAt: "2026-08-19",
    },
    mainEvent: { status: "verified", value: false },
    bonuses: { status: "verified", values: [] },
    finish: { status: "not-applicable" },
    knockdowns: { status: "verified", for: 0, against: 0 },
    ...overrides,
  };
}

function fight(overrides: Partial<CanonicalFight> = {}): CanonicalFight {
  return {
    id: "fight-1",
    date: "2020-01-01",
    opponent: "Opponent",
    division: "Lightweight",
    officialResult: "win",
    scoringDisposition: "count-win",
    methodCategory: "decision",
    qualityTier: "unranked",
    championshipType: "none",
    championshipEligible: false,
    rounds: { status: "audited", won: 0, lost: 0, drawn: 0 },
    supplementalFacts: supplemental(),
    ...overrides,
  };
}

describe("shared UFC career stats", () => {
  it("derives ledger and UFCStats-backed career facts from one fight owner", () => {
    const fights: CanonicalFight[] = [
      fight({
        id: "ko-title",
        opponent: "Alpha",
        methodCategory: "ko-tko",
        championshipType: "normal",
        championshipEligible: true,
        supplementalFacts: supplemental({
          mainEvent: { status: "verified", value: true },
          bonuses: { status: "verified", values: ["performance-of-the-night"] },
          finish: { status: "verified", round: 1, timeSeconds: 61 },
          knockdowns: { status: "verified", for: 2, against: 0 },
        }),
      }),
      fight({
        id: "submission",
        date: "2021-02-01",
        opponent: "Beta",
        methodCategory: "submission",
        supplementalFacts: supplemental({
          bonuses: { status: "verified", values: ["fight-of-the-night"] },
          finish: { status: "verified", round: 2, timeSeconds: 125 },
          knockdowns: { status: "verified", for: 0, against: 1 },
        }),
      }),
      fight({
        id: "decision-loss",
        date: "2021-08-01",
        opponent: "Gamma",
        officialResult: "loss",
        scoringDisposition: "count-loss",
      }),
    ];

    expect(deriveUfcCareerStats(fights)).toEqual({
      fights: 3,
      wins: 2,
      decisionWins: 0,
      finishes: 2,
      koTkoWins: 1,
      knockoutWins: 1,
      submissionWins: 1,
      titleFights: 1,
      titleFightWins: 1,
      titleFightFinishes: 1,
      titleFightKnockoutWins: 1,
      titleFightSubmissionWins: 0,
      activeYears: 2,
      winningYears: 2,
      finishYears: 2,
      longestWinStreak: 2,
      longestFinishStreak: 2,
      longestKnockoutStreak: 1,
      longestSubmissionStreak: 1,
      uniqueTitleOpponentsFaced: 1,
      uniqueTitleOpponentsBeaten: 1,
      uniqueOpponentsBeaten: 2,
      uniqueOpponentsFinished: 2,
      mainEvents: 1,
      bonusAwards: 2,
      bonusAwardsByType: {
        "fight-of-the-night": 1,
        "performance-of-the-night": 1,
        "knockout-of-the-night": 0,
        "submission-of-the-night": 0,
      },
      firstRoundFinishes: 1,
      knockdownsFor: 2,
      knockdownsAgainst: 1,
    });
  });

  it("preserves official and ranking-scoring win semantics for the two existing consumers", () => {
    const technicalWin = fight({
      officialResult: "win",
      scoringDisposition: "technical-exception",
    });

    expect(deriveUfcCareerStats([technicalWin], "official").wins).toBe(1);
    expect(deriveUfcCareerStats([technicalWin], "scoring").wins).toBe(0);
  });

  it("never turns unavailable supplemental history into a factual zero", () => {
    const unavailable = fight({
      methodCategory: "ko-tko",
      supplementalFacts: supplemental({
        mainEvent: { status: "unavailable" },
        bonuses: { status: "verified", values: [] },
        finish: { status: "unavailable" },
        knockdowns: { status: "unavailable" },
      }),
    });

    const stats = deriveUfcCareerStats([unavailable]);
    expect(stats.wins).toBe(1);
    expect(stats.finishes).toBe(1);
    expect(stats.mainEvents).toBeNull();
    expect(stats.bonusAwards).toBe(0);
    expect(stats.firstRoundFinishes).toBeNull();
    expect(stats.knockdownsFor).toBeNull();
    expect(stats.knockdownsAgainst).toBeNull();
  });
});
