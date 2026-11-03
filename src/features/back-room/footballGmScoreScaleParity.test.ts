import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_NBA_PARITY_TEAM_OVR_ANCHORS,
  footballGmFinalResultV2,
  footballGmOutcomeProbabilities,
  footballGmTeamOverall,
  type FootballGmSeasonResultV2,
} from "./footballGmStrategy";
import { initialRun } from "./FootballGmModePage";

const page = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const finalScreen = readFileSync("src/features/back-room/FootballGmFinalExperience.tsx", "utf8");
const report = readFileSync("src/features/back-room/FootballGmFranchiseReport.tsx", "utf8");

function season(year: 1 | 2 | 3, grade: number, finish: FootballGmSeasonResultV2["finish"]) {
  return {
    year, teamGrade: grade, rawTeamGrade: grade,
    wins: 14, losses: 3, finish, titleOdds: footballGmOutcomeProbabilities(grade).Champion * 100,
    weakLinkPenalty: 0, continuityWinChancePenalty: 0,
  } as FootballGmSeasonResultV2;
}
const threeSeasons = [
  season(1, 90.6, "Conference Championship"),
  season(2, 92, "Super Bowl Loss"),
  season(3, 92.8, "Champion"),
];

describe("NFL GM / NBA GM comparable OVR meaning", () => {
  it("reserves 95+ for exceptional franchises instead of treating 90 raw as 96", () => {
    expect(FOOTBALL_GM_NBA_PARITY_TEAM_OVR_ANCHORS.length).toBeGreaterThan(12);
    expect(footballGmTeamOverall(85.5, 2)).toBe(83);
    expect(footballGmTeamOverall(90, 2)).toBe(91);
    expect(footballGmTeamOverall(90.6, 2)).toBe(92);
    expect(footballGmTeamOverall(92, 2)).toBe(95);
    expect(footballGmTeamOverall(92.8, 2)).toBe(96);
    expect(footballGmTeamOverall(93.7, 2)).toBe(97);
    expect(footballGmTeamOverall(94.5, 2)).toBe(98);
    expect(footballGmTeamOverall(96, 2)).toBe(99);
    for (let grade = 78; grade < 98; grade += .1) {
      expect(footballGmTeamOverall(grade + .1, 2)).toBeGreaterThanOrEqual(footballGmTeamOverall(grade, 2));
    }
  });

  it("preserves old NFL saved ratings, same gameplay odds, same scoring weights", () => {
    expect(footballGmTeamOverall(90.6)).toBe(97);
    expect(footballGmTeamOverall(94)).toBe(99);
    const base = {
      seed: "historical-nfl-gm",
      yearOneRoster: [],
      finalRoster: [],
      resolvedSeasons: threeSeasons,
    };
    const archived = footballGmFinalResultV2(base);
    const current = footballGmFinalResultV2({...base, ratingScaleVersion: 2});
    expect(archived.teamOveralls).toEqual([97, 98, 98]);
    expect(current.teamOveralls).toEqual([92, 95, 96]);
    expect(current.playoffScore).toEqual(archived.playoffScore);
    expect(current.regularSeasonScore).toEqual(archived.regularSeasonScore);
    expect(current.seasons).toEqual(archived.seasons);
    expect(current.score).toBe(Math.round((
      current.rosterManagementScore * .90 +
      current.regularSeasonScore * .03 +
      current.playoffScore * .07
    ) * 10) / 10);
    expect(current.score).toBeLessThan(archived.score);
    expect(footballGmFinalResultV2(base).score).toBe(archived.score);
  });

  it("versions new runs and routes both season reveals and final experience to same rating", () => {
    expect(initialRun("nba-parity-solo").ratingScaleVersion).toBe(2);
    expect(initialRun("nba-parity-solo").playoffScoringVersion).toBe(2);
    // Avoid mixing old and recalibrated scores in an already-live weekly title.
    expect(initialRun("weekly-gm:2026-11-03:standard").ratingScaleVersion).toBeUndefined();
    expect(initialRun("weekly-gm:2026-11-10:standard").ratingScaleVersion).toBe(2);
    // Existing head-to-head challenges retain the creator's score version.
    expect(page).toContain("setup?.ratingScaleVersion === 2 ? 2 : undefined");
    expect(page).toContain("setup?.playoffScoringVersion === 2 ? 2 : undefined");
    expect(page).toContain("ratingScaleVersion: run.ratingScaleVersion ?? null");
    expect(page).toContain("ratingScaleVersion={run.ratingScaleVersion}");
    expect(page).toContain("ratingScaleVersion: run.ratingScaleVersion");
    expect(page).toContain("run.ratingScaleVersion, yearOneRoster");
    expect(report).toContain("ratingScaleVersion?: 2");
    for (const label of ["run", "opponentRun", "selectedRun"]) {
      expect(finalScreen).toContain("ratingScaleVersion: " + label + ".ratingScaleVersion");
      expect(finalScreen).toContain("playoffScoringVersion: " + label + ".playoffScoringVersion");
    }
  });
});
