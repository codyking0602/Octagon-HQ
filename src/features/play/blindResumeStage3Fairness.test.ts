import { describe, expect, it } from "vitest";
import {
  BLIND_RESUME_ROUNDS,
  blindResumePairIsEvidenceSafe,
  blindResumeStats,
  blindResumeWinner,
  createEvidenceSafeBlindResumeRounds,
} from "./blindResumeEngine";
import {
  createBlindResumeV3Card,
  createEvidenceSafeBlindResumeV3Card,
} from "./blindResumeV3";
import { rankedPlayFighters } from "./playFighterPool";
import {
  buildOfficialDailySetup,
  UFC_BLIND_RESUME_STAGE3_CUTOVER_DAY,
} from "./todaysChallengeRuntime";

const HELD_PAIRS = new Set([
  "justin-gaethje|tito-ortiz",
  "alexander-volkanovski|matt-hughes",
  "brock-lesnar|shogun-rua",
  "conor-mcgregor|petr-yan",
  "jessica-andrade|ronda-rousey",
]);

describe("Stage 3 evidence-safe UFC Blind Resume selection", () => {
  it("builds reproducible five-pair slates with fair, varied openings", () => {
    let mixedOpenings = 0;
    for (let index = 0; index < 30; index += 1) {
      const seed = `stage3-quality-${index}`;
      const card = createEvidenceSafeBlindResumeV3Card(seed);
      expect(createEvidenceSafeBlindResumeV3Card(seed)).toEqual(card);
      expect(card.selectionVersion).toBe("evidence-safe-stage3-v1");
      expect(card.roundSet.pairs).toHaveLength(BLIND_RESUME_ROUNDS);
      const ids = card.roundSet.pairs.flatMap((pair) => [pair.fighterA.id, pair.fighterB.id]);
      expect(new Set(ids).size).toBe(10);
      card.roundSet.pairs.forEach((pair, round) => {
        const key = [pair.fighterA.id, pair.fighterB.id].sort().join("|");
        expect(HELD_PAIRS.has(key)).toBe(false);
        expect(pair.fighterA.gender).toBe(pair.fighterB.gender);
        expect(blindResumePairIsEvidenceSafe(pair)).toBe(true);
        expect(blindResumeWinner(pair).id).toMatch(/\S/);
        const ordered = card.statsByRound[round]!;
        expect(ordered).toHaveLength(8);
        expect(new Set(ordered.map((stat) => stat.label))).toEqual(
          new Set(blindResumeStats(pair).map((stat) => stat.label)),
        );
        // The opening must not be two facts that both point to the rejected fighter.
        const winner = blindResumeWinner(pair).id;
        const winnerOnA = winner === pair.fighterA.id;
        const positive = ordered.slice(0, 2).filter((stat) => {
          const value = (s: string) => {
            const m = /^(\d+)-(\d+)/.exec(s);
            return m ? Number(m[1]) - Number(m[2]) : Number.parseFloat(s);
          };
          const a = value(stat.valueA);
          const b = value(stat.valueB);
          return Number.isFinite(a) && Number.isFinite(b)
            && (winnerOnA ? a > b : b > a);
        });
        expect(positive.length).toBeGreaterThanOrEqual(1);
        const opposing = ordered.slice(0, 2).filter((stat) => {
          const value = (v: string) => {
            const match = /^(\d+)-(\d+)/.exec(v);
            return match ? Number(match[1]) - Number(match[2]) : Number.parseFloat(v);
          };
          const a = value(stat.valueA);
          const b = value(stat.valueB);
          return Number.isFinite(a) && Number.isFinite(b)
            && (winnerOnA ? a < b : b < a);
        });
        if (opposing.length) mixedOpenings += 1;
        const winnerLeadsThrough = (count: number) => ordered.slice(0, count).filter((stat) => {
          const value = (v: string) => {
            const match = /^(\\d+)-(\\d+)/.exec(v);
            return match ? Number(match[1]) - Number(match[2]) : Number.parseFloat(v);
          };
          const a = value(stat.valueA);
          const b = value(stat.valueB);
          return Number.isFinite(a) && Number.isFinite(b)
            && (winnerOnA ? a > b : b > a);
        }).length;
        expect(winnerLeadsThrough(4)).toBeGreaterThanOrEqual(2);
        expect(winnerLeadsThrough(6)).toBeGreaterThanOrEqual(3);
      });
    }
    // Hard rounds should retain legitimate tradeoffs, not reveal two
    // winner-favoring stats in every single opening.
    expect(mixedOpenings).toBeGreaterThan(0);
  });

  it("excludes each known disputed matchup from new eligibility", () => {
    const byId = new Map(rankedPlayFighters.map((fighter) => [fighter.id, fighter]));
    for (const key of HELD_PAIRS) {
      const [leftId, rightId] = key.split("|");
      const fighterA = byId.get(leftId!)!;
      const fighterB = byId.get(rightId!)!;
      expect(fighterA).toBeDefined();
      expect(fighterB).toBeDefined();
      expect(blindResumePairIsEvidenceSafe({
        id: `held-${key}`,
        fighterA,
        fighterB,
        gender: fighterA.gender,
        scoreGap: Math.abs(fighterA.model.rawScore - fighterB.model.rawScore),
        band: "close",
      })).toBe(false);
    }
  });

  it("keeps previously published V3 setup generation unchanged at the cutover", () => {
    const legacy = buildOfficialDailySetup("blind_resume", "2026-10-16", "stage3-historic-pin");
    const post = buildOfficialDailySetup("blind_resume", UFC_BLIND_RESUME_STAGE3_CUTOVER_DAY, "stage3-future-pin");
    expect((legacy.privateSetupEvidence as Record<string, unknown>).selection_version).toBeUndefined();
    expect((post.privateSetupEvidence as Record<string, unknown>).selection_version)
      .toBe("evidence-safe-stage3-v1");
    expect(legacy.setupKey).not.toContain("evidence-safe-stage3-v1");
    expect(post.setupKey).toContain("evidence-safe-stage3-v1");
    const oldCard = createBlindResumeV3Card("stage3-old-casual-seed");
    expect(oldCard.selectionVersion).toBe("legacy");
    expect(createBlindResumeV3Card("stage3-old-casual-seed")).toEqual(oldCard);
    const future = createEvidenceSafeBlindResumeRounds("stage3-future-mode-check");
    expect(future.pairs.every(blindResumePairIsEvidenceSafe)).toBe(true);
  });
});
