import { advanceNbaOfficialDailyRuntime } from "../features/nba/nbaDailyServerAdvance";
import { advanceNbaHitNumberLeanDailyRuntime, advanceNbaWavelengthLeanDailyRuntime, advanceNbaHigherLowerLeanDailyRuntime } from "../features/nba/nbaDailyServerAdvance";
import { advanceFindLeaderOnlyDailyRuntime } from "../features/play/footballTodayChallengeAdvanceRuntime";
import { advanceBarTriviaDailyRuntime } from "../features/play/barTriviaDailyRuntime";
import type { OfficialDailyRuntimeContext } from "../features/play/todaysChallengeRuntime";
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
      if (game === "who_am_i" || index >= 7) continue; // Oct 30-31 now belong to public Daily.
      const day = new Date(Date.UTC(2026, 9, 23 + index)).toISOString().slice(0, 10);
      expect(lean[game](day, "nba-daily-owner-prelaunch-v1", game)).toEqual(
        buildNbaServerDailyPublication(day, "nba-daily-owner-prelaunch-v1", game));
    }
  });
  it("retains canonical content for each public first appearance", () => {
    expect(lean.average_fan("2026-11-01", "nba-daily-regular-v4-nov01-public", "average_fan")).toEqual(buildNbaServerDailyPublication("2026-11-01", "nba-daily-regular-v4-nov01-public", "average_fan"));
    expect(lean.sports_feud("2026-11-03", "nba-daily-regular-v4-nov01-public", "sports_feud")).toEqual(buildNbaServerDailyPublication("2026-11-03", "nba-daily-regular-v4-nov01-public", "sports_feud"));
    expect(lean.millionaire("2026-11-07", "nba-daily-regular-v4-nov01-public", "millionaire")).toEqual(buildNbaServerDailyPublication("2026-11-07", "nba-daily-regular-v4-nov01-public", "millionaire"));
    expect(lean.hit_the_number("2026-11-09", "nba-daily-regular-v4-nov01-public", "hit_the_number")).toEqual(buildNbaServerDailyPublication("2026-11-09", "nba-daily-regular-v4-nov01-public", "hit_the_number"));
    expect(lean.find_leader("2026-11-11", "nba-daily-regular-v4-nov01-public", "find_leader")).toEqual(buildNbaServerDailyPublication("2026-11-11", "nba-daily-regular-v4-nov01-public", "find_leader"));
    expect(lean.wavelength("2026-11-13", "nba-daily-regular-v4-nov01-public", "wavelength")).toEqual(buildNbaServerDailyPublication("2026-11-13", "nba-daily-regular-v4-nov01-public", "wavelength"));
    expect(lean.higher_lower("2026-11-19", "nba-daily-regular-v4-nov01-public", "higher_lower")).toEqual(buildNbaServerDailyPublication("2026-11-19", "nba-daily-regular-v4-nov01-public", "higher_lower"));
    expect(lean.bar_trivia("2026-11-21", "nba-daily-regular-v4-nov01-public", "bar_trivia")).toEqual(buildNbaServerDailyPublication("2026-11-21", "nba-daily-regular-v4-nov01-public", "bar_trivia"));
    expect(readFileSync("src/features/nba/nbaDailySchedule.ts", "utf8")).toContain("NBA_OFFICIAL_GAMES_RELEASE_READY = true");
    expect(edge).toContain("NBA_DAILY_EDGE_RELEASE_READY = true");
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

type Value = Record<string, unknown>;
function initial(day: string, version: string, gameType: "find_leader" | "hit_the_number" | "wavelength" | "higher_lower" | "bar_trivia"): OfficialDailyRuntimeContext {
  const p = buildNbaServerDailyPublication(day, version, gameType);
  return {
    gameType,
    setupKey: p.setupKey,
    publicSetup: p.publicSetup,
    revealSetup: p.revealSetup,
    privateSetupEvidence: p.privateSetupEvidence,
    privateGradingEvidence: p.privateGradingEvidence,
    submissionState: {},
    publicState: p.publicSetup.initial_state as Value,
  };
}
function update(previous: OfficialDailyRuntimeContext, result: ReturnType<typeof advanceNbaOfficialDailyRuntime>) {
  return { ...previous, submissionState: result.submissionState, publicState: result.publicState };
}

describe("NBA Daily lean gameplay equivalence", () => {
  it("preserves Find the Leader elimination, both game transitions, and average score", () => {
    let context = initial("2026-10-27", "nba-daily-owner-prelaunch-v1", "find_leader");
    const children = context.privateSetupEvidence.rounds as Value[];
    expect(children).toHaveLength(2);
    for (const child of children) {
      const evidence = child.private_setup_evidence as Value;
      const choices = (evidence.candidate_ids as string[]).filter(id => id !== evidence.leader_id);
      expect(choices).toHaveLength(9);
      for (const eliminated_id of choices) {
        const action = { eliminated_id };
        const canonical = advanceNbaOfficialDailyRuntime(context, action);
        const isolated = advanceFindLeaderOnlyDailyRuntime(context, action);
        expect(isolated).toEqual(canonical);
        context = update(context, isolated);
      }
    }
    expect(context.publicState.complete).toBe(true);
    expect(context.publicState.round_scores).toEqual([100, 100]);
    expect(context.publicState.score).toBe(100);
  });

  it("keeps NBA Wavelength, Hit the Number, and Higher or Lower canonical actions identical", () => {
    const cases = [
      {
        day: "2026-10-28", gameType: "wavelength" as const, action: { guess: 50 },
        isolated: advanceNbaWavelengthLeanDailyRuntime,
      },
      {
        day: "2026-11-09", gameType: "hit_the_number" as const, action: null,
        isolated: advanceNbaHitNumberLeanDailyRuntime,
      },
      {
        day: "2026-11-19", gameType: "higher_lower" as const, action: { choice: "higher" },
        isolated: advanceNbaHigherLowerLeanDailyRuntime,
      },
    ];
    for (const item of cases) {
      const context = initial(item.day, item.day >= "2026-11-01" ? "nba-daily-regular-v4-nov01-public" : "nba-daily-owner-prelaunch-v1", item.gameType);
      const action = item.gameType === "hit_the_number"
        ? { fighter_id: ((context.publicState.active_round as Value).available_subject_ids as string[])[0] ?? (context.publicState.active_round as Value).available_subject_ids }
        : item.action;
      const canonical = advanceNbaOfficialDailyRuntime(context, action);
      const isolated = item.isolated(context, action);
      expect(isolated).toEqual(canonical);
    }
  });

  it("keeps NBA Bar Trivia initial answer identical", () => {
    const context = initial("2026-10-29", "nba-daily-owner-prelaunch-v1", "bar_trivia");
    const question = context.publicState.current_question as Value;
    const action = { choice: (question.choices as string[])[0] };
    expect(advanceBarTriviaDailyRuntime(context, action)).toEqual(advanceNbaOfficialDailyRuntime(context, action));
  });
});
