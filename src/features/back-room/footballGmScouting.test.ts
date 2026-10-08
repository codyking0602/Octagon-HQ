import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FOOTBALL_GM_PLAYER_POOL, footballGmPlayerById, footballGmProjectedGradeForPlayer } from "./footballGmEngine";
import { footballGmDevelopmentOdds, FOOTBALL_GM_DEVELOPMENT_SEED_TAG } from "./wheelFootballGmEconomy";
import {
  footballGmDevelopmentResult,
  footballGmOutlookFromOdds,
  footballGmRepriceLabel,
  footballGmScoutingSnapshot,
  footballGmTalentTier,
} from "./footballGmScouting";

const seed = "locked-scout-test" + FOOTBALL_GM_DEVELOPMENT_SEED_TAG;
const src = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("NFL GM locked scouting pills", () => {
  it("keeps exactly four player ability tiers and does not expose underlying grades", () => {
    expect([70, 82, 83, 88, 89, 93, 94, 99].map(footballGmTalentTier))
      .toEqual(["DEPTH", "DEPTH", "STARTER", "STARTER", "IMPACT", "IMPACT", "ELITE", "ELITE"]);
  });

  it("reserves five future probability outlooks for genuinely different risk shapes", () => {
    expect(footballGmOutlookFromOdds({ breakoutPct: 30, improvePct: 32, declinePct: 8, steadyPct: 30 })).toBe("HIGH UPSIDE");
    expect(footballGmOutlookFromOdds({ breakoutPct: 9, improvePct: 39, declinePct: 22, steadyPct: 30 })).toBe("RISING");
    expect(footballGmOutlookFromOdds({ breakoutPct: 4, improvePct: 14, declinePct: 14, steadyPct: 68 })).toBe("STEADY");
    expect(footballGmOutlookFromOdds({ breakoutPct: 26, improvePct: 23, declinePct: 37, steadyPct: 14 })).toBe("BOOM/BUST");
    expect(footballGmOutlookFromOdds({ breakoutPct: 3, improvePct: 9, declinePct: 47, steadyPct: 41 })).toBe("DECLINE RISK");
  });

  it("uses every player's authored odds, and recalculates the year-three odds from ACTUAL seeded year-two ability", () => {
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    const firstYearLabels = new Set<string>();
    const secondYearLabels = new Set<string>();
    for (const player of FOOTBALL_GM_PLAYER_POOL) {
      const draft = footballGmScoutingSnapshot(player, 1, seed);
      const offseason = footballGmScoutingSnapshot(player, 2, seed);
      firstYearLabels.add(draft.outlook);
      secondYearLabels.add(offseason.outlook);
      expect(draft.tier).toBe(footballGmTalentTier(player.currentGrade));
      expect(offseason.tier).toBe(footballGmTalentTier(footballGmProjectedGradeForPlayer(player, 2, seed)));
      expect(draft.development).toBeNull();
      expect(offseason.development).toBe(footballGmDevelopmentResult(
        footballGmProjectedGradeForPlayer(player, 2, seed) - player.currentGrade,
      ));
      const odds = footballGmDevelopmentOdds({
        playerId: player.id, step: 1, grade: footballGmProjectedGradeForPlayer(player, 2, seed),
        originalGrade: player.currentGrade, age: player.age + 1, position: player.marketPosition,
      });
      expect(odds).toBeTruthy();
      expect(offseason.outlook).toBe(footballGmOutlookFromOdds(odds!));
    }
    expect(firstYearLabels.size).toBe(5);
    expect(secondYearLabels.size).toBeGreaterThanOrEqual(4);
  });

  it("keeps two separate Travis Hunter identities and adjusts scouting independently", () => {
    const wr = footballGmPlayerById("JAX|WR|travishunter");
    const db = footballGmPlayerById("JAX|Secondary|travishunter");
    expect(wr?.currentGrade).toBe(77);
    expect(db?.currentGrade).toBe(82);
    expect(footballGmScoutingSnapshot(wr!, 1, seed).outlook).toBe("BOOM/BUST");
    expect(footballGmScoutingSnapshot(db!, 1, seed).outlook).toBe("BOOM/BUST");
  });

  it("shows actual historical movement as a small secondary line using existing report thresholds", () => {
    expect([-4, -1, 0, 1, 4].map(footballGmDevelopmentResult))
      .toEqual(["MAJOR REGRESSION", "REGRESSED", "HELD STEADY", "IMPROVED", "BREAKOUT"]);
    const solo = src("src/features/back-room/FootballGmModePage.tsx");
    const multi = src("src/features/back-room/FootballGmHeadToHeadPage.tsx");
    const style = src("src/styles/football-gm-mode.css");
    expect(solo).toContain('year={2} seed={seed}');
    expect(solo).toContain('<PlayerDevelopmentNote player={player} seed={seed} />');
    expect(solo).toContain('<PlayerDevelopmentNote player={player} seed={run.seed} />');
    expect(multi).toContain('<PlayerDevelopmentNote player={player} seed={run.seed} />');
    expect(style).toContain('.football-gm__development-note');
    expect(style).toContain('flex: 1 0 100%');
    expect(solo).not.toContain('outlook={player.outlook}');
    expect(multi).not.toContain('outlook={player.outlook}');
  });

  it("keeps draft reprice exposure separate and never shows stale market risk in the offseason", () => {
    expect(["LOW", "MEDIUM", "HIGH", "LOCKED"].map(x =>
      footballGmRepriceLabel(x as "LOW" | "MEDIUM" | "HIGH" | "LOCKED")))
      .toEqual(["LOW REPRICE", "MED REPRICE", "HIGH REPRICE", "SALARY LOCKED"]);
    const solo = src("src/features/back-room/FootballGmModePage.tsx");
    expect(solo).toContain('footballGmRepriceLabel(player.extensionRisk)');
    expect(solo).toContain('year === 1 ? <small className="football-gm__roster-reprice"');
    expect(solo).not.toContain('Y2/Y3 MARKET</span>');
    expect(solo).toContain('footballGmAdjustedSalaryForPlayer(player, year, seed, consequences)');
  });
});
