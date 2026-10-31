import { describe, expect, it } from "vitest";
import {
  BLIND_RESUME_ROUNDS,
  blindResumePairIsEvidenceSafe,
  blindResumeStats,
  blindResumeWinner,
  createBlindResumeRounds,
  createEvidenceSafeBlindResumeRounds,
  type BlindResumePair,
} from "./blindResumeEngine";
import {
  createBlindResumeV3Card,
  createEvidenceSafeBlindResumeV3Card,
} from "./blindResumeV3";
import { rankedPlayFighters, type RankedPlayFighter } from "./playFighterPool";
import {
  buildOfficialDailySetup,
  UFC_BLIND_RESUME_STAGE3_CUTOVER_DAY,
} from "./todaysChallengeRuntime";

function withRésumé(
  fighter: RankedPlayFighter,
  stats: {
    titleFightWins: number;
    topFiveWins: number;
    primeRecord: string;
    activeEliteYears: number;
    finishRatePct: number;
  },
): RankedPlayFighter {
  return { ...fighter, model: {
    ...fighter.model,
    visibleStats: { ...fighter.model.visibleStats, ...stats },
  } };
}

describe("Stage 3 UFC Blind Resume — full-reveal solvability only", () => {
  it("rejects full-resume domination but keeps tricky comparisons with legitimate counterarguments", () => {
    const men = rankedPlayFighters.filter((fighter) => fighter.gender === "men")
      .sort((a, b) => a.model.rank - b.model.rank);
    const canonicalWinner = men[0]!;
    const canonicalLoser = men[1]!;

    const losingEveryCategory: BlindResumePair = {
      id: "losing-every-stat",
      fighterA: withRésumé(canonicalWinner, {
        titleFightWins: 0, topFiveWins: 0, primeRecord: "0-10",
        activeEliteYears: 0, finishRatePct: 0,
      }),
      fighterB: withRésumé(canonicalLoser, {
        titleFightWins: 10, topFiveWins: 10, primeRecord: "10-0",
        activeEliteYears: 10, finishRatePct: 90,
      }),
      gender: "men", scoreGap: 2, band: "close",
    };
    expect(blindResumeWinner(losingEveryCategory).id).toBe(canonicalWinner.id);
    expect(blindResumePairIsEvidenceSafe(losingEveryCategory)).toBe(false);

    const aGenuineDebate: BlindResumePair = {
      ...losingEveryCategory,
      id: "mixed-résumé",
      fighterA: withRésumé(canonicalWinner, {
        titleFightWins: 3, topFiveWins: 4, primeRecord: "1-9",
        activeEliteYears: 1, finishRatePct: 10,
      }),
      fighterB: withRésumé(canonicalLoser, {
        titleFightWins: 1, topFiveWins: 3, primeRecord: "9-1",
        activeEliteYears: 10, finishRatePct: 90,
      }),
    };
    // Winner leads only two of five independently verifiable categories:
    // the player still has to weigh a real, non-obvious full résumé.
    expect(blindResumePairIsEvidenceSafe(aGenuineDebate)).toBe(true);
  });

  it("generates reproducible 5-round slates with intact old eight-stat random reveals", () => {
    let earlyCounterarguments = 0;
    const openingLabels = new Set<string>();
    for (let i = 0; i < 40; i += 1) {
      const seed = `stage3-minimal-ufc-${i}`;
      const card = createEvidenceSafeBlindResumeV3Card(seed);
      expect(createEvidenceSafeBlindResumeV3Card(seed)).toEqual(card);
      expect(card.selectionVersion).toBe("evidence-safe-stage3-v1");
      expect(card.roundSet.pairs).toHaveLength(BLIND_RESUME_ROUNDS);
      const names = card.roundSet.pairs.flatMap((pair) => [pair.fighterA.id, pair.fighterB.id]);
      expect(new Set(names).size).toBe(10);
      card.roundSet.pairs.forEach((pair, index) => {
        expect(pair.gender).toBe(pair.fighterA.gender);
        expect(pair.fighterA.gender).toBe(pair.fighterB.gender);
        expect(blindResumePairIsEvidenceSafe(pair)).toBe(true);
        const stats = card.statsByRound[index]!;
        expect(stats).toHaveLength(8);
        const canonical = blindResumeStats(pair);
        expect(new Set(stats.map((stat) => stat.label))).toEqual(
          new Set(canonical.map((stat) => stat.label)),
        );
        expect(stats.every((stat) => stat.valueA.trim() && stat.valueB.trim())).toBe(true);
        for (const row of stats.slice(0, 2)) {
          openingLabels.add(row.label);
          const a = Number.parseFloat(row.valueA);
          const b = Number.parseFloat(row.valueB);
          if (Number.isFinite(a) && Number.isFinite(b) && a !== b) {
            const winnerOnA = blindResumeWinner(pair).id === pair.fighterA.id;
            if (winnerOnA ? a < b : b < a) earlyCounterarguments += 1;
          }
        }
      });
    }
    // A difficult, misleading opening is still allowed. No scripted
    // winner-favoring evidence at 2, 4 or 6 reveals.
    expect(earlyCounterarguments).toBeGreaterThan(0);
    expect(openingLabels.size).toBeGreaterThanOrEqual(6);
  });

  it("preserves legacy Daily, casual and unmarked shared replay generation", () => {
    const lastDay = buildOfficialDailySetup("blind_resume", "2026-10-18", "legacy-stage3-pinned");
    expect((lastDay.privateSetupEvidence as Record<string, unknown>).selection_version).toBeUndefined();
    expect(lastDay.setupKey).not.toContain("evidence-safe-stage3-v1");

    const oldCard = createBlindResumeV3Card("stage3-old-casual-seed");
    expect(oldCard.selectionVersion).toBe("legacy");
    expect(createBlindResumeV3Card("stage3-old-casual-seed")).toEqual(oldCard);
    // Card identity exposes the share seed; the canonical internal generation
    // seed additionally includes Daily runtime/version/day ownership.
    const oldPublication = buildOfficialDailySetup("blind_resume", "2000-01-01", "stage3-old-casual-seed");
    const internalSeed = (oldPublication.privateSetupEvidence as { seed: string }).seed;
    expect(createBlindResumeRounds(internalSeed).pairs).toEqual(oldCard.roundSet.pairs);

    // New Daily publication is deliberately disabled until an approved
    // release date. This reserved day still exercises the future Daily owner.
    expect(UFC_BLIND_RESUME_STAGE3_CUTOVER_DAY).toBe("2099-01-01");
    const future = buildOfficialDailySetup("blind_resume", UFC_BLIND_RESUME_STAGE3_CUTOVER_DAY, "stage3-future-pin");
    expect((future.privateSetupEvidence as Record<string, unknown>).selection_version)
      .toBe("evidence-safe-stage3-v1");
    expect(future.setupKey).toContain("evidence-safe-stage3-v1");
    expect(createEvidenceSafeBlindResumeRounds("stage3-future-mode-check")
      .pairs.every(blindResumePairIsEvidenceSafe)).toBe(true);
  });
});
