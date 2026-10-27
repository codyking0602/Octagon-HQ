import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  OFFICIAL_DAILY_RUNTIME_VERSION,
  type OfficialDailyRuntimeContext,
  type OfficialDailySetupPublication,
} from "../features/play/todaysChallengeRuntime";
import { advanceFootballOfficialDailyRuntime } from "../features/play/footballTodayChallengeAdvanceRuntime";
import { buildUfcHigherLowerTwoGameDailyPublication } from "../features/play/ufcHigherLowerDailyRuntime";
import { buildFootballHigherLowerTwoGameDailyPublication } from "../features/play/footballHigherLowerDailyRuntime";
import {
  advanceUfcFindLeaderOnlyDailyRuntime,
  advanceUfcWavelengthOnlyDailyRuntime,
} from "../features/play/ufcDailyActionCore";
import { advanceOfficialDailyGameRuntime as ufcHigherLower } from "../features/play/leanDaily/UfcHigherLowerAdvance";
import { advanceOfficialDailyGameRuntime as footballHigherLower } from "../features/play/leanDaily/FootballHigherLowerAdvance";
import { advanceOfficialDailyGameRuntime as ufcHitNumber } from "../features/play/leanDaily/UfcHitNumberAdvance";
import { advanceFootballComparisonOnlyDailyRuntime } from "../features/play/footballComparisonActionCore";
import { advanceUfcComparisonOnlyDailyRuntime } from "../features/play/ufcComparisonActionCore";

const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");
const deploy = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");

function initial(gameType: OfficialDailyRuntimeContext["gameType"], publication: OfficialDailySetupPublication): OfficialDailyRuntimeContext {
  return {
    gameType,
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: {},
    publicState: publication.publicSetup.initial_state as Record<string, unknown>,
  };
}

describe("Official Daily game-specific resource-limit regression", () => {
  it("keeps UFC Find the Leader elimination and Wavelength guesses identical to the canonical two-game evaluator", () => {
    expect(OFFICIAL_DAILY_RUNTIME_VERSION).toBe("official-daily-runtime-v1");
    const find = initial("find_leader", buildOfficialDailySetup("find_leader", "2026-10-27", "play-rotation-v9-millionaire-no-double"));
    const first = (find.privateSetupEvidence.rounds as Array<Record<string, unknown>>)[0]!;
    const evidence = first.private_setup_evidence as Record<string, unknown>;
    const eliminate = (evidence.candidate_ids as string[]).find(id => id !== evidence.leader_id);
    expect(eliminate).toBeDefined();
    expect(advanceUfcFindLeaderOnlyDailyRuntime(find, { eliminated_id: eliminate })).toEqual(
      advanceOfficialDailyRuntime(find, { eliminated_id: eliminate }),
    );

    const wave = initial("wavelength", buildOfficialDailySetup("wavelength", "2026-10-27", "play-rotation-v9-millionaire-no-double"));
    expect(advanceUfcWavelengthOnlyDailyRuntime(wave, { guess: 50 })).toEqual(
      advanceOfficialDailyRuntime(wave, { guess: 50 }),
    );
  });

  it("preserves UFC and Football Higher/Lower two-game progression and answer safety", () => {
    const cases = [
      {
        context: initial("higher_lower", buildUfcHigherLowerTwoGameDailyPublication("2026-11-02", "play-rotation-v9-millionaire-no-double")),
        isolated: ufcHigherLower,
        canonical: advanceOfficialDailyRuntime,
      },
      {
        context: initial("higher_lower", buildFootballHigherLowerTwoGameDailyPublication("2026-10-27", "football-daily-v22-higher-lower-oct27")),
        isolated: footballHigherLower,
        canonical: advanceFootballOfficialDailyRuntime,
      },
    ];
    for (const { context, isolated, canonical } of cases) {
      expect(context.publicState.round_count).toBe(2);
      const action = { choice: "higher" };
      const expected = canonical(context, action);
      expect(isolated(context, action)).toEqual(expected);
      expect(expected.complete).toBe(false);
      expect((expected.publicState.active_round as Record<string, unknown>).reveal).toBeUndefined();
    }
  });

  it("routes two-game UFC Hit the Number through canonical per-child scoring", () => {
    const context = initial("hit_the_number", buildOfficialDailySetup(
      "hit_the_number", "2026-10-27", "play-rotation-v9-millionaire-no-double",
    ));
    expect(context.publicState.round_count).toBe(2);
    const evidence = (context.privateSetupEvidence.rounds as Array<Record<string, unknown>>)[0]!
      .private_setup_evidence as Record<string, unknown>;
    const slots = evidence.slot_eligible_ids as string[][] | undefined;
    const id = slots?.[0]?.[0] ?? (evidence.fighter_ids as string[])[0]!;
    const action = slots?.length ? { fighter_id: id, slot_index: 0 } : { fighter_id: id };
    const expected = advanceOfficialDailyRuntime(context, action);
    expect(ufcHitNumber(context, action)).toEqual(expected);
  });

  it("isolates Blind Resume / Rank / Keep-Cut without duplicating canonical evaluators", () => {
    const football = readFileSync("src/features/play/footballTodayChallengeAdvanceRuntime.ts", "utf8");
    const ufc = readFileSync("src/features/play/todaysChallengeRuntime.ts", "utf8");
    expect(football).toContain('from "./footballComparisonActionCore"');
    expect(ufc).toContain('from "./ufcComparisonActionCore"');
    expect(typeof advanceFootballComparisonOnlyDailyRuntime).toBe("function");
    expect(typeof advanceUfcComparisonOnlyDailyRuntime).toBe("function");
    expect(edge).toContain('isDailyCombo(context) ? null : await loadIsolatedDailyAction("football", context.gameType)');
    expect(edge).toContain('isDailyCombo(context) ? null : await loadIsolatedDailyAction("ufc", context.gameType)');
  });

  it("requires all action-only artifacts in the exact Supabase deploy source", () => {
    for (const name of [
      "ufc-find-leader", "ufc-wavelength", "ufc-comparison", "ufc-hit-number",
      "ufc-higher-lower", "football-find-leader", "football-higher-lower",
      "football-comparison", "bar-trivia", "legacy-feud",
    ]) {
      expect(bundler).toContain(name + "-advance.generated.mjs");
      expect(deploy).toContain(name + "-advance.generated.mjs");
      expect(edge).toContain(name + "-advance.generated.mjs");
    }
    expect(edge).toContain('if (gameType === "who_am_i")');
    expect(edge).toContain("loadNbaAdvanceRuntime(context.gameType)");
    expect(edge).toContain("dailyClientActionIds(context).includes(clientActionId)");
    expect(edge).toContain("save_daily_challenge_runtime_progress");
    expect(edge).toContain("await finalizePending(");
  });
});
