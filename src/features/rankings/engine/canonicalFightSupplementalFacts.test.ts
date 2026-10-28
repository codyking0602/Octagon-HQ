import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "../data/rankingInputs";
import {
  canonicalFightSupplementalCoverage,
  canonicalFightSupplementalMetricIsComplete,
  verifiedUfcBonuses,
  verifiedUfcFinishDetails,
  verifiedUfcKnockdowns,
  verifiedUfcMainEvent,
} from "./canonicalFightSupplementalFacts";
import { canonicalFightSchema, type CanonicalFight } from "./schemas";

function baseFight(overrides: Record<string, unknown> = {}) {
  return {
    id: "2026-08-15-test-opponent",
    date: "2026-08-15",
    opponent: "Test Opponent",
    division: "Lightweight",
    officialResult: "win",
    scoringDisposition: "count-win",
    methodCategory: "ko-tko",
    qualityTier: "solid",
    championshipType: "none",
    championshipEligible: true,
    championshipOpponentStrength: null,
    championshipManualCredit: null,
    rounds: { status: "unavailable", won: 0, lost: 0, drawn: 0 },
    lossClassification: { competitive: true, divisionContext: "home", overrideRule: null },
    ...overrides,
  };
}

function auditedSupplementalFacts() {
  return {
    source: {
      provider: "ufcstats",
      eventId: "event-123",
      fightId: "fight-456",
      checkedAt: "2026-08-19",
    },
    mainEvent: { status: "verified", value: true },
    bonuses: { status: "verified", values: ["fight-of-the-night"] },
    finish: { status: "verified", round: 1, timeSeconds: 87 },
    knockdowns: { status: "verified", for: 2, against: 0 },
  };
}

describe("canonical UFC supplemental fight facts", () => {
  it("accepts one fully audited UFCStats evidence block and exposes verified values", () => {
    const fight = canonicalFightSchema.parse(baseFight({
      supplementalFacts: auditedSupplementalFacts(),
    }));

    expect(verifiedUfcMainEvent(fight)).toBe(true);
    expect(verifiedUfcBonuses(fight)).toEqual(["fight-of-the-night"]);
    expect(verifiedUfcFinishDetails(fight)).toEqual({ round: 1, timeSeconds: 87 });
    expect(verifiedUfcKnockdowns(fight)).toEqual({ for: 2, against: 0 });
  });

  it("distinguishes verified zero from unavailable and explicitly supports a non-finish", () => {
    const fight = canonicalFightSchema.parse(baseFight({
      officialResult: "loss",
      scoringDisposition: "count-loss",
      methodCategory: "decision",
      supplementalFacts: {
        ...auditedSupplementalFacts(),
        mainEvent: { status: "verified", value: false },
        bonuses: { status: "verified", values: [] },
        finish: { status: "not-applicable" },
        knockdowns: { status: "verified", for: 0, against: 0 },
      },
    }));

    expect(verifiedUfcMainEvent(fight)).toBe(false);
    expect(verifiedUfcBonuses(fight)).toEqual([]);
    expect(verifiedUfcFinishDetails(fight)).toBeNull();
    expect(verifiedUfcKnockdowns(fight)).toEqual({ for: 0, against: 0 });

    const unavailable = canonicalFightSchema.parse(baseFight({
      supplementalFacts: {
        ...auditedSupplementalFacts(),
        mainEvent: { status: "unavailable" },
        bonuses: { status: "unavailable" },
        finish: { status: "unavailable" },
        knockdowns: { status: "unavailable" },
      },
    }));
    expect(verifiedUfcMainEvent(unavailable)).toBeNull();
    expect(verifiedUfcBonuses(unavailable)).toBeNull();
    expect(verifiedUfcFinishDetails(unavailable)).toBeNull();
    expect(verifiedUfcKnockdowns(unavailable)).toBeNull();
  });

  it("requires every supported fact to be explicit once a fight has supplemental evidence", () => {
    const incomplete = auditedSupplementalFacts() as Record<string, unknown>;
    delete incomplete.bonuses;
    expect(() => canonicalFightSchema.parse(baseFight({ supplementalFacts: incomplete }))).toThrow();
  });

  it("rejects invalid supplemental values instead of coercing them", () => {
    expect(() => canonicalFightSchema.parse(baseFight({
      supplementalFacts: {
        ...auditedSupplementalFacts(),
        bonuses: {
          status: "verified",
          values: ["fight-of-the-night", "fight-of-the-night"],
        },
      },
    }))).toThrow("UFC fight bonuses must be unique.");

    expect(() => canonicalFightSchema.parse(baseFight({
      supplementalFacts: {
        ...auditedSupplementalFacts(),
        finish: { status: "verified", round: 6, timeSeconds: 10 },
      },
    }))).toThrow();

    expect(() => canonicalFightSchema.parse(baseFight({
      supplementalFacts: {
        ...auditedSupplementalFacts(),
        knockdowns: { status: "verified", for: -1, against: 0 },
      },
    }))).toThrow();
  });

  it("owns metric coverage so consumers can fail closed on incomplete career totals", () => {
    const verified = canonicalFightSchema.parse(baseFight({
      supplementalFacts: auditedSupplementalFacts(),
    }));
    const partiallyUnavailable = canonicalFightSchema.parse(baseFight({
      id: "2026-08-16-test-opponent-two",
      supplementalFacts: {
        ...auditedSupplementalFacts(),
        mainEvent: { status: "unavailable" },
        finish: { status: "not-applicable" },
        knockdowns: { status: "unavailable" },
      },
    }));
    const legacy = canonicalFightSchema.parse(baseFight({
      id: "2026-08-17-test-opponent-three",
    }));
    const fights: CanonicalFight[] = [verified, partiallyUnavailable, legacy];

    expect(canonicalFightSupplementalCoverage(fights)).toEqual({
      totalFights: 3,
      auditedFights: 2,
      known: {
        "main-event": 1,
        bonuses: 2,
        "finish-details": 2,
        knockdowns: 1,
      },
    });
    expect(canonicalFightSupplementalMetricIsComplete(fights, "bonuses")).toBe(false);
    expect(canonicalFightSupplementalMetricIsComplete([verified], "knockdowns")).toBe(true);
    expect(canonicalFightSupplementalMetricIsComplete([], "knockdowns")).toBe(false);
  });

  it("keeps the existing canonical ranking ledger valid without inventing supplemental data", () => {
    const fights = canonicalRankingInputs.fighters.flatMap((fighter) => fighter.facts.fights);
    expect(fights.length).toBeGreaterThan(0);
    for (const fight of fights) {
      expect(() => canonicalFightSchema.parse(fight)).not.toThrow();
    }
  });
});
