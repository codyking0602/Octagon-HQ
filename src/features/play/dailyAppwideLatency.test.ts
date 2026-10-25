import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  advanceMillionaireDailyRuntime,
  buildMillionaireDailySetup,
} from "./millionaireDailyRuntime";
import { MILLIONAIRE_TIME_BANK_MS } from "./millionaireRuntimeShared";

const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");

describe("all-sport Daily action latency invariants", () => {
  it("acknowledges nonterminal saved actions without a second context RPC for UFC, Football and NBA", () => {
    const acknowledge = edge.match(/acknowledgedUnfinishedProgress\(context, saved\.data, nextSubmissionState\)/g);
    expect(acknowledge).toHaveLength(3);
    expect(edge).toContain("revision !== Number(context.progress_revision) + 1");
    expect(edge).toContain('requiredRecord(saved.public_state, "Saved Daily public progress")');
    expect(edge).toContain("if (advanced.complete) {");
    expect(edge).toContain("context = await finalizePending(userClient, admin, context, profileId);");
  });

  it("keeps idempotency, server grading and stale protection intact", () => {
    expect(edge).toContain("submissionStateWithClientActionId(");
    expect(edge).toContain('save_daily_challenge_runtime_progress');
    expect(edge).toContain('return safeError(409, "STALE_PROGRESS"');
    expect(edge).toContain("if (advanced.complete) {");
  });

  it("uses a lean Millionaire answer engine for UFC, Football and NBA", () => {
    expect(bundler).toContain("millionaire-advance.generated.mjs");
    expect(bundler).toContain("millionaireDailyAdvanceRuntime.ts");
    expect(edge.match(/loadMillionaireAdvanceRuntime\(\)/g)?.length).toBeGreaterThanOrEqual(4);
    expect(MILLIONAIRE_TIME_BANK_MS).toBe(120_000);
  });

  it("preserves the published Millionaire score and question progression", () => {
    const setup = buildMillionaireDailySetup("ufc", "2026-10-25", "latency-proof-v1");
    const context = {
      gameType: "millionaire" as const,
      setupKey: setup.setupKey,
      publicSetup: setup.publicSetup,
      revealSetup: setup.revealSetup,
      privateSetupEvidence: setup.privateSetupEvidence,
      privateGradingEvidence: setup.privateGradingEvidence,
      submissionState: {},
      publicState: setup.publicSetup.initial_state as Record<string, unknown>,
    };
    const first = advanceMillionaireDailyRuntime(context, {
      type: "answer",
      choice_id: "A",
      time_remaining_ms: 119000,
    });
    expect(first.publicState.time_remaining_ms).toBe(119000);
    expect(first.publicState.current_question_index).toBeGreaterThanOrEqual(1);
    expect(first.publicState.last_question_reveal).toBeTruthy();
    expect(first.publicState.complete).toBe(false);
  });
});
