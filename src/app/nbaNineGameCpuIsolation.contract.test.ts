import { advanceNbaOfficialDailyRuntime } from "../features/nba/nbaDailyServerAdvance";
import { advanceNbaHitNumberLeanDailyRuntime, advanceNbaWavelengthLeanDailyRuntime, advanceNbaHigherLowerLeanDailyRuntime } from "../features/nba/nbaDailyServerAdvance";
import { advanceFindLeaderOnlyDailyRuntime } from "../features/play/footballTodayChallengeAdvanceRuntime";
import { advanceBarTriviaDailyRuntime } from "../features/play/barTriviaDailyRuntime";
import type { OfficialDailyRuntimeContext } from "../features/play/todaysChallengeRuntime";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildNbaServerDailyPublication } from "../features/nba/nbaDailyServerPublication";
import { NBA_OWNER_PREVIEW_ORDER, nbaRegularSeasonDaily } from "../features/nba/nbaDailySchedule";
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
  it("smoke-tests only the actual first regular-season Average Fan publication", () => {
    expect(nbaRegularSeasonDaily("2026-10-30")).toMatchObject({
      day: "2026-10-29", gameType: "bar_trivia", isPublicationDay: false,
    });
    expect(nbaRegularSeasonDaily("2026-11-15")).toMatchObject({
      day: "2026-11-15", gameType: "average_fan", isPublicationDay: true,
    });
    expect(bundler.match(/day: "2026-11-15", gameType: "average_fan"/g)).toHaveLength(2);
    expect(bundler).not.toContain('day: "2026-10-30", gameType: "average_fan"');
  });
  it("keeps historical owner QA isolated while the Oct 29 board is public", () => {
    expect(NBA_OWNER_PREVIEW_ORDER.slice(0, 6)).toEqual([
      "average_fan", "sports_feud", "millionaire", "who_am_i", "find_leader", "wavelength",
    ]);
    // No replay of a historical preview can become the publicly scheduled board.
    expect(edge).toContain('admin.rpc("get_nba_owner_prelaunch_materialization_request")');
    expect(edge).toContain('admin.rpc("get_daily_challenge_materialization_request"');
    expect(edge).toContain('p_sport: "nba"');
  });
  it("retains lean-vs-canonical content for each verified public first appearance", () => {
    for (const [game, publisher] of Object.entries(lean)) {
      // October 29 already has the exact immutable certified Bar Trivia setup.
      // Starting November 1, resolve each *actual* opening date from the same
      // 28-board schedule used by production instead of hardcoded old dates.
      let found: string | null = null;
      for (let offset = 0; offset < 65; offset++) {
        const day = new Date(Date.UTC(2026, 10, 1 + offset)).toISOString().slice(0, 10);
        const slot = nbaRegularSeasonDaily(day);
        if (slot?.isPublicationDay && slot.gameType === game) {
          found = day;
          break;
        }
      }
      expect(found, `First public appearance missing: ${game}`).not.toBeNull();
      const day = found!;
      expect(nbaRegularSeasonDaily(day)).toMatchObject({ day, gameType: game, isPublicationDay: true });
      expect(publisher(day, "nba-daily-regular-v3-oct30-public", game)).toEqual(
        buildNbaServerDailyPublication(day, "nba-daily-regular-v3-oct30-public", game as Parameters<typeof buildNbaServerDailyPublication>[2]),
      );
    }
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
        day: "2026-11-07", gameType: "hit_the_number" as const, action: null,
        isolated: advanceNbaHitNumberLeanDailyRuntime,
      },
      {
        day: "2026-11-17", gameType: "higher_lower" as const, action: { choice: "higher" },
        isolated: advanceNbaHigherLowerLeanDailyRuntime,
      },
    ];
    for (const item of cases) {
      const context = initial(item.day, item.day >= "2026-10-30" ? "nba-daily-regular-v3-oct30-public" : "nba-daily-owner-prelaunch-v1", item.gameType);
      const action = item.gameType === "hit_the_number"
        ? { fighter_id: ((context.publicState.active_round as Value).available_subject_ids as string[])[0] ?? (context.publicState.active_round as Value).available_subject_ids }
        : item.action;
      const canonical = advanceNbaOfficialDailyRuntime(context, action);
      const isolated = item.isolated(context, action);
      expect(isolated).toEqual(canonical);
    }
  });

  it("keeps NBA Bar Trivia initial answer identical", () => {
    const day = new Date(Date.UTC(2026, 10, 19)).toISOString().slice(0, 10);
    expect(nbaRegularSeasonDaily(day)?.gameType).toBe("bar_trivia");
    const context = initial(day, "nba-daily-regular-v3-oct30-public", "bar_trivia");
    const question = context.publicState.current_question as Value;
    const action = { choice: (question.choices as string[])[0] };
    expect(advanceBarTriviaDailyRuntime(context, action)).toEqual(advanceNbaOfficialDailyRuntime(context, action));
  });
});
