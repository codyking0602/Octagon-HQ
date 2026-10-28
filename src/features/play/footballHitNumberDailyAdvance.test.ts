import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationHitNumber";
import { advanceFootballOfficialDailyRuntime } from "./footballTodayChallengeAdvanceRuntime";
import { advanceFootballHitNumberDailyRuntime } from "./footballHitNumberDailyAdvance";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

type JsonRecord = Record<string, unknown>;
const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const bundle = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");

function contextFor(day: string): OfficialDailyRuntimeContext {
  const publication = buildFootballDailyPersistenceSetup(
    day, "football-daily-v18-average-fan-oct1", "hit_the_number",
  );
  return {
    gameType: "hit_the_number",
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: {},
    publicState: publication.publicSetup.initial_state as JsonRecord,
  };
}

function nextContext(context: OfficialDailyRuntimeContext, result: {
  submissionState: JsonRecord; publicState: JsonRecord;
}): OfficialDailyRuntimeContext {
  return { ...context, submissionState: result.submissionState, publicState: result.publicState };
}

function nextPick(context: OfficialDailyRuntimeContext) {
  const evidence = (context.privateSetupEvidence.format_version === "daily-two-game-average-v1"
    ? (context.privateSetupEvidence.rounds as JsonRecord[])[Number(context.publicState.round_index ?? 0)]!.private_setup_evidence
    : context.privateSetupEvidence) as JsonRecord;
  const selection = (context.privateSetupEvidence.format_version === "daily-two-game-average-v1"
    ? (context.publicState.active_round as JsonRecord).selected_ids
    : context.publicState.selected_ids) as string[];
  const ids = evidence.fighter_ids as string[];
  const slotIds = evidence.progression_slot_subject_ids as string[][];
  const candidate = (slotIds?.[selection.length] ?? ids).find((id) => !selection.includes(id));
  if (!candidate) throw new Error("No valid Hit the Number candidate for test progression.");
  return candidate;
}

describe("CPU-safe Football Official Daily Hit the Number", () => {
  it("uses a dedicated Edge bundle rather than booting every Football game for picks and lock", () => {
    expect(bundle).toContain('fileName: "football-hit-number-advance.generated.mjs"');
    expect(edge).toContain('import("./football-hit-number-advance.generated.mjs")');
    expect(edge).toContain('context.gameType === "hit_the_number" && !isDailyCombo(context)');
    const lean = readFileSync("src/features/play/footballHitNumberDailyAdvance.ts", "utf8");
    const core = readFileSync("src/features/play/footballHitNumberAdvanceCore.ts", "utf8");
    expect(lean).not.toContain("footballTodayChallengeAdvanceRuntime");
    expect(core).not.toContain("footballHitTheNumberModel");
    expect(lean).toContain("advanceTwoGameDailyRuntime");
  });

  it("keeps every action and both Game 1→2 lock transitions identical to the canonical runtime", () => {
    let context = contextFor("2026-10-25");
    expect(context.privateSetupEvidence.format_version).toBe("daily-two-game-average-v1");
    for (let gameIndex = 0; gameIndex < 2; gameIndex++) {
      const roundSetup = (context.privateSetupEvidence.rounds as JsonRecord[])[gameIndex]!.public_setup as JsonRecord;
      const pickCount = Number(roundSetup.pick_count);
      expect([4, 5, 6]).toContain(pickCount);
      for (let pick = 0; pick < pickCount; pick++) {
        const action = { fighter_id: nextPick(context) };
        const canonical = advanceFootballOfficialDailyRuntime(context, action);
        const lean = advanceFootballHitNumberDailyRuntime(context, action);
        expect(lean).toEqual(canonical);
        expect(lean.complete).toBe(false);
        context = nextContext(context, lean);
      }
      const canonical = advanceFootballOfficialDailyRuntime(context, { lock: true });
      const lean = advanceFootballHitNumberDailyRuntime(context, { lock: true });
      expect(lean).toEqual(canonical);
      if (gameIndex === 0) {
        expect(lean.complete).toBe(false);
        expect(lean.publicState.round_index).toBe(1);
        expect(lean.publicState.awaiting_next).toBe(false);
        expect((lean.publicState.round_scores as number[])).toHaveLength(1);
      } else {
        expect(lean.complete).toBe(true);
        expect(lean.finalSubmission).toMatchObject({ rounds: expect.any(Array) });
        expect((lean.publicState.round_scores as number[])).toHaveLength(2);
      }
      context = nextContext(context, lean);
    }
  });

  it("preserves historical single-board hit number grading", () => {
    let context = contextFor("2026-09-18");
    expect(context.privateSetupEvidence.format_version).not.toBe("daily-two-game-average-v1");
    const pickCount = Number(context.publicSetup.pick_count);
    for (let i = 0; i < pickCount; i++) {
      const action = { fighter_id: nextPick(context) };
      const canonical = advanceFootballOfficialDailyRuntime(context, action);
      const lean = advanceFootballHitNumberDailyRuntime(context, action);
      expect(lean).toEqual(canonical);
      context = nextContext(context, lean);
    }
    const action = { lock: true };
    expect(advanceFootballHitNumberDailyRuntime(context, action))
      .toEqual(advanceFootballOfficialDailyRuntime(context, action));
  });
});
