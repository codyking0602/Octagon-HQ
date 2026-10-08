import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FOOTBALL_GM_PLAYER_POOL, footballGmProjectedGradeForPlayer } from "./footballGmEngine";
import { footballGmDevelopmentProfile, FOOTBALL_GM_DEVELOPMENT_SEED_TAG } from "./wheelFootballGmEconomy";
import { footballGmResultDevelopmentBand } from "./FootballGmFinalExperience";

const seed = "gm-final-visual-regression" + FOOTBALL_GM_DEVELOPMENT_SEED_TAG;

describe("NFL GM final report development outcomes", () => {
  it("uses player-specific authored range limits and the SAME seeded Year 3 simulation", () => {
    expect(FOOTBALL_GM_PLAYER_POOL.length).toBeGreaterThan(500);
    for (const player of FOOTBALL_GM_PLAYER_POOL) {
      const profile = footballGmDevelopmentProfile(player.id);
      expect(profile, player.id).toBeTruthy();
      const band = footballGmResultDevelopmentBand(player, seed);
      expect(band.calibrated).toBe(true);
      expect(band.final).toBe(footballGmProjectedGradeForPlayer(player, 3, seed));
      expect(band.start).toBe(footballGmProjectedGradeForPlayer(player, 1, seed));
      expect(band.startPercent).toBeGreaterThanOrEqual(0);
      expect(band.startPercent).toBeLessThanOrEqual(100);
      expect(band.finalPercent).toBeGreaterThanOrEqual(0);
      expect(band.finalPercent).toBeLessThanOrEqual(100);
      if (band.delta < -0.85) expect(band.tone).toBe("down");
      if (band.delta > 0.85) expect(band.tone).toBe("up");
    }
  });

  it("keeps numerical individual grades private and draws no franchise line graph", () => {
    const file = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballGmFinalExperience.tsx"), "utf-8");
    expect(file).toContain("footballGmResultDevelopmentBand(player, run.seed)");
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
