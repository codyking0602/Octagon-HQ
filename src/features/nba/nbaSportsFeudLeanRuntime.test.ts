import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildNbaSportsFeudPack } from "./nbaSportsFeudBank";
import {
  advanceFamilyFeudDailyRuntime,
  buildFamilyFeudDailySetup,
} from "../play/familyFeudDailyRuntime";
import { advanceFamilyFeudDailyCore } from "../play/familyFeudDailyCore";

const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");
const core = readFileSync("src/features/play/familyFeudDailyCore.ts", "utf8");

describe("NBA Sports Feud lightweight official Daily runtime", () => {
  it("loads its own tiny grading bundle without legacy NFL/CFB/UFC question banks", () => {
    expect(core).not.toContain('from "./sportsFeudDailyBanks"');
    expect(bundler).toContain('fileName: "nba-feud-advance.generated.mjs"');
    expect(bundler).toContain('requiredExports: ["advanceFamilyFeudDailyCore"]');
    expect(edge).toContain('import("./nba-feud-advance.generated.mjs")');
    expect(edge).toContain('context.gameType === "sports_feud"');
    expect(edge).toContain('(await loadNbaFeudAdvanceRuntime()).advanceFamilyFeudDailyCore(context, action)');
    expect(edge).toContain("const NBA_DAILY_EDGE_RELEASE_READY = false;");
    expect(edge).toContain("save_daily_challenge_runtime_progress");
  });

  it("preserves NBA's exact board, strike, alias, Fast Money, and final score behavior", () => {
    const pack = buildNbaSportsFeudPack("nba-feud-lean-edge-parity-v1");
    const publication = buildFamilyFeudDailySetup(pack, "2026-10-24", "nba-daily-owner-prelaunch-v1");
    let baselineSubmission: Record<string, unknown> = {};
    let leanSubmission: Record<string, unknown> = {};

    const actions: Record<string, unknown>[] = [];
    // Both boards: a valid ranked answer, a duplicate and three strikes.
    for (let board = 0; board < 2; board++) {
      const answerId = pack.mainBoards[board]!.answers[0]!.entityId;
      const answer = pack.entities.find(entity => entity.id === answerId)!.displayName;
      actions.push({ type: "answer", answer });
      actions.push({ type: "answer", answer });
      for (let miss = 0; miss < 3; miss++) {
        actions.push({ type: "answer", answer: `this cannot be an NBA answer ${board}-${miss}` });
      }
    }
    for (let index = 0; index < 5; index++) {
      const question = pack.fastMoney[index]!;
      const entityId = question.answers[0]!.entityId;
      const name = pack.entities.find(entity => entity.id === entityId)!.displayName;
      actions.push({
        type: "answer", answer: name, question_id: question.id,
        question_index: index, time_remaining_ms: 46_000 - index * 4_000,
      });
    }

    for (const action of actions) {
      const baseline = advanceFamilyFeudDailyRuntime({
        setupKey: publication.setupKey,
        publicSetup: publication.publicSetup,
        privateSetupEvidence: publication.privateSetupEvidence,
        submissionState: baselineSubmission,
      }, action);
      const lean = advanceFamilyFeudDailyCore({
        setupKey: publication.setupKey,
        publicSetup: publication.publicSetup,
        privateSetupEvidence: publication.privateSetupEvidence,
        submissionState: leanSubmission,
      }, action);
      expect(lean).toEqual(baseline);
      baselineSubmission = baseline.submissionState;
      leanSubmission = lean.submissionState;
    }
    const result = leanSubmission.final_submission as Record<string, unknown>;
    expect(result.normalized_score).toBeTypeOf("number");
  });
});
