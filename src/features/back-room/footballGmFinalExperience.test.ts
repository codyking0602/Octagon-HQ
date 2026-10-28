import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FOOTBALL_GM_PLAYER_POOL, footballGmProjectedGradeForPlayer } from "./footballGmEngine";
import { footballGmDevelopmentProfile, FOOTBALL_GM_DEVELOPMENT_SEED_TAG } from "./wheelFootballGmEconomy";
import { footballGmResultDevelopmentBand, footballGmResultMovementPosition } from "./FootballGmFinalExperience";

const seed = "gm-final-visual-regression" + FOOTBALL_GM_DEVELOPMENT_SEED_TAG;

describe("NFL GM final report development outcomes", () => {
  it("uses the SAME seeded Year 3 simulation but fixes START at the center for all players", () => {
    expect(FOOTBALL_GM_PLAYER_POOL.length).toBeGreaterThan(500);
    for (const player of FOOTBALL_GM_PLAYER_POOL) {
      const profile = footballGmDevelopmentProfile(player.id);
      expect(profile, player.id).toBeTruthy();
      const band = footballGmResultDevelopmentBand(player, seed);
      expect(band.calibrated).toBe(true);
      expect(band.final).toBe(footballGmProjectedGradeForPlayer(player, 3, seed));
      expect(band.start).toBe(footballGmProjectedGradeForPlayer(player, 1, seed));
      expect(band.startPercent).toBe(50);
      expect([12, 32, 50, 68, 88]).toContain(band.finalPercent);
      expect(band.finalPercent).toBe(footballGmResultMovementPosition(band.delta));
      if (band.delta < -0.85) expect(band.tone).toBe("down");
      if (band.delta > 0.85) expect(band.tone).toBe("up");
    }
  });

  it("uses only five fixed outcome positions, never relative absolute grade or player floor/ceiling", () => {
    expect([-25, -6, -2.5, -1, -0.8, 0, 0.8, 1, 2.5, 3, 25].map(footballGmResultMovementPosition))
      .toEqual([12, 12, 12, 32, 50, 50, 50, 68, 68, 88, 88]);
    expect(footballGmResultMovementPosition(-5)).toBe(footballGmResultMovementPosition(-20));
    expect(footballGmResultMovementPosition(1)).toBe(footballGmResultMovementPosition(2.5));
    const file = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballGmFinalExperience.tsx"), "utf8");
    expect(file).toContain('startPercent: 50');
    expect(file).toContain('finalPercent: footballGmResultMovementPosition(delta)');
    expect(file).toContain('footballGmDevelopmentResult(delta)');
    expect(file).not.toContain('const pct =');
    expect(file).not.toContain('FLOOR</small>');
    expect(file).not.toContain('CEILING</small>');
    expect(file).toContain('DECLINED</small>');
    expect(file).toContain('IMPROVED</small>');
    expect(file).toContain("Exact grades remain hidden");
  });

  it("keeps numerical individual grades private and draws no franchise line graph", () => {
    const file = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballGmFinalExperience.tsx"), "utf-8");
    expect(file).toContain("footballGmResultDevelopmentBand(player, selectedRun.seed)");
    expect(file).toContain("Exact grades stay hidden.");
    expect(file).toContain("footballGmDevelopmentProfile(player.id)");
    expect(file).not.toContain("band.final.toFixed");
    expect(file).not.toContain("<svg");
    expect(file).toContain("THREE-YEAR RESULTS");
    expect(file).toContain("RUN HIGHLIGHTS");
    expect(file).toContain("OFFSEASON MOVES");
    expect(file).toContain("GM SCORE BREAKDOWN");
  });

  it("keeps three-year outcomes and scoring owned by the existing canonical engine", () => {
    const file = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballGmFinalExperience.tsx"), "utf-8");
    expect(file).toContain("footballGmFinalResultV2({");
    expect(file).toContain("resolvedSeasons: run.resolvedSeasons");
    expect(file).toContain("footballGmSeasonRecordLabel(season)");
    expect(file).toContain("footballGmPlayoffFinishLabel(season.finish)");
    expect(file).toContain("footballGmAdjustedRosterCap(end, 3");
  });
});
