import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildNbaServerDailyPublication } from "../features/nba/nbaDailyServerPublication";
import { NBA_OWNER_PREVIEW_ORDER } from "../features/nba/nbaDailySchedule";
import { buildNbaAverageFanLeanPublication } from "../features/nba/nbaDailyServerPublication";
import { buildNbaSportsFeudLeanPublication } from "../features/nba/nbaDailyServerPublication";
import { buildNbaMillionaireLeanPublication } from "../features/nba/nbaDailyServerPublication";
import { buildNbaHitNumberLeanPublication } from "../features/nba/nbaDailyServerPublication";
import { buildNbaFindLeaderLeanPublication } from "../features/nba/nbaDailyServerPublication";
import { buildNbaWavelengthLeanPublication } from "../features/nba/nbaDailyServerPublication";
import { buildNbaHigherLowerLeanPublication } from "../features/nba/nbaDailyServerPublication";
import { buildNbaBarTriviaLeanPublication } from "../features/nba/nbaDailyServerPublication";

const lean = {
  average_fan: buildNbaAverageFanLeanPublication,
  sports_feud: buildNbaSportsFeudLeanPublication,
  millionaire: buildNbaMillionaireLeanPublication,
  hit_the_number: buildNbaHitNumberLeanPublication,
  find_leader: buildNbaFindLeaderLeanPublication,
  wavelength: buildNbaWavelengthLeanPublication,
  higher_lower: buildNbaHigherLowerLeanPublication,
  bar_trivia: buildNbaBarTriviaLeanPublication,
} as const;
const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");
const deploy = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");

describe("NBA Daily all-nine-mode CPU isolation", () => {
  it("retains canonical first-attempt publications for all eight other owner preview days", () => {
    for (const [index, game] of NBA_OWNER_PREVIEW_ORDER.entries()) {
      if (game === "who_am_i") continue;
      const day = new Date(Date.UTC(2026, 9, 23 + index)).toISOString().slice(0, 10);
      expect(lean[game](day, "nba-daily-owner-prelaunch-v1", game)).toEqual(
        buildNbaServerDailyPublication(day, "nba-daily-owner-prelaunch-v1", game));
    }
  });
  it("retains canonical content for each public first appearance", () => {
    expect(lean.average_fan("2026-11-01", "nba-daily-regular-v2-locked", "average_fan")).toEqual(buildNbaServerDailyPublication("2026-11-01", "nba-daily-regular-v2-locked", "average_fan"));
    expect(lean.sports_feud("2026-11-03", "nba-daily-regular-v2-locked", "sports_feud")).toEqual(buildNbaServerDailyPublication("2026-11-03", "nba-daily-regular-v2-locked", "sports_feud"));
    expect(lean.millionaire("2026-11-07", "nba-daily-regular-v2-locked", "millionaire")).toEqual(buildNbaServerDailyPublication("2026-11-07", "nba-daily-regular-v2-locked", "millionaire"));
    expect(lean.hit_the_number("2026-11-09", "nba-daily-regular-v2-locked", "hit_the_number")).toEqual(buildNbaServerDailyPublication("2026-11-09", "nba-daily-regular-v2-locked", "hit_the_number"));
    expect(lean.find_leader("2026-11-11", "nba-daily-regular-v2-locked", "find_leader")).toEqual(buildNbaServerDailyPublication("2026-11-11", "nba-daily-regular-v2-locked", "find_leader"));
    expect(lean.wavelength("2026-11-13", "nba-daily-regular-v2-locked", "wavelength")).toEqual(buildNbaServerDailyPublication("2026-11-13", "nba-daily-regular-v2-locked", "wavelength"));
    expect(lean.higher_lower("2026-11-19", "nba-daily-regular-v2-locked", "higher_lower")).toEqual(buildNbaServerDailyPublication("2026-11-19", "nba-daily-regular-v2-locked", "higher_lower"));
    expect(lean.bar_trivia("2026-11-21", "nba-daily-regular-v2-locked", "bar_trivia")).toEqual(buildNbaServerDailyPublication("2026-11-21", "nba-daily-regular-v2-locked", "bar_trivia"));
    expect(readFileSync("src/features/nba/nbaDailySchedule.ts", "utf8")).toContain("NBA_OFFICIAL_GAMES_RELEASE_READY = false");
    expect(edge).toContain("NBA_DAILY_EDGE_RELEASE_READY = false");
  });
  it("requires dedicated generated publication and action bundles in deploy", () => {
    expect(edge).toContain('gameType === "average_fan"');
    expect(bundler).toContain('nba-average-fan-publication.generated.mjs');
    expect(deploy).toContain('nba-average-fan-publication.generated.mjs');
    expect(edge).toContain('gameType === "sports_feud"');
    expect(bundler).toContain('nba-sports-feud-publication.generated.mjs');
    expect(deploy).toContain('nba-sports-feud-publication.generated.mjs');
    expect(edge).toContain('gameType === "millionaire"');
    expect(bundler).toContain('nba-millionaire-publication.generated.mjs');
    expect(deploy).toContain('nba-millionaire-publication.generated.mjs');
    expect(edge).toContain('gameType === "hit_the_number"');
    expect(bundler).toContain('nba-hit-the-number-publication.generated.mjs');
    expect(deploy).toContain('nba-hit-the-number-publication.generated.mjs');
    expect(edge).toContain('gameType === "find_leader"');
    expect(bundler).toContain('nba-find-leader-publication.generated.mjs');
    expect(deploy).toContain('nba-find-leader-publication.generated.mjs');
    expect(edge).toContain('gameType === "wavelength"');
    expect(bundler).toContain('nba-wavelength-publication.generated.mjs');
    expect(deploy).toContain('nba-wavelength-publication.generated.mjs');
    expect(edge).toContain('gameType === "higher_lower"');
    expect(bundler).toContain('nba-higher-lower-publication.generated.mjs');
    expect(deploy).toContain('nba-higher-lower-publication.generated.mjs');
    expect(edge).toContain('gameType === "bar_trivia"');
    expect(bundler).toContain('nba-bar-trivia-publication.generated.mjs');
    expect(deploy).toContain('nba-bar-trivia-publication.generated.mjs');
    expect(bundler).toContain('nba-bar-trivia-advance.generated.mjs');
    expect(deploy).toContain('nba-bar-trivia-advance.generated.mjs');
    expect(bundler).toContain('nba-find-leader-advance.generated.mjs');
    expect(deploy).toContain('nba-find-leader-advance.generated.mjs');
    expect(bundler).toContain('nba-wavelength-advance.generated.mjs');
    expect(deploy).toContain('nba-wavelength-advance.generated.mjs');
    expect(bundler).toContain('nba-hit-the-number-advance.generated.mjs');
    expect(deploy).toContain('nba-hit-the-number-advance.generated.mjs');
    expect(bundler).toContain('nba-higher-lower-advance.generated.mjs');
    expect(deploy).toContain('nba-higher-lower-advance.generated.mjs');
  });
});
