import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";
import { advanceFamilyFeudDailyRuntime } from "./familyFeudDailyRuntime";
import { advanceFamilyFeudDailyCore, buildFamilyFeudDailySetup } from "./familyFeudDailyCore";

const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");

describe("UFC Feud lean post-Oct-26 Daily action path", () => {
  it("routes only new UFC Feud packets through the existing small Feud bundle", () => {
    expect(edge).toContain('canUseLeanUfcFeudAdvance(context)');
    expect(edge).toContain('(await loadNbaFeudAdvanceRuntime()).advanceFamilyFeudDailyCore');
    expect(edge).toContain('day >= "2026-10-27"');
    expect(edge).toContain('context.gameType !== "sports_feud" || isDailyCombo(context)');
    expect(edge).toContain('context.gameType === "blind_resume"');
  });
  it("matches every main/fast submission and final score on the published Oct 27 UFC board", () => {
    const pack = buildSportsFeudPack("ufc", "2026-10-27");
    const published = buildFamilyFeudDailySetup(pack, "2026-10-27", "ufc-daily-v21-48h-oct25");
    let regular: Record<string, unknown> = {};
    let lean: Record<string, unknown> = {};
    const actions: Record<string, unknown>[] = [];
    for (let board = 0; board < 2; board++) {
      const row = pack.mainBoards[board]!;
      const answerId = row.answers[0]!.entityId;
      const answer = pack.entities.find(entity => entity.id === answerId)!.displayName;
      actions.push({ type: "answer", answer });
      actions.push({ type: "answer", answer });
      for (let miss = 0; miss < 3; miss++) {
        actions.push({ type: "answer", answer: "not an actual answer " + board + " " + miss });
      }
    }
    for (let i = 0; i < 5; i++) {
      const row = pack.fastMoney[i]!;
      const answerId = row.answers[0]!.entityId;
      const answer = pack.entities.find(entity => entity.id === answerId)!.displayName;
      actions.push({ type: "answer", answer, question_id: row.id,
        question_index: i, time_remaining_ms: 49_000 - i * 5_000 });
    }
    for (const action of actions) {
      const context = (submissionState: Record<string, unknown>) => ({
        setupKey: published.setupKey, publicSetup: published.publicSetup,
        privateSetupEvidence: published.privateSetupEvidence, submissionState,
      });
      const oldResult = advanceFamilyFeudDailyRuntime(context(regular), action);
      const nextResult = advanceFamilyFeudDailyCore(context(lean), action);
      expect(nextResult, JSON.stringify(action)).toEqual(oldResult);
      regular = oldResult.submissionState;
      lean = nextResult.submissionState;
    }
    expect(lean.final_submission).toMatchObject({
      normalized_score: expect.any(Number), native_score: expect.any(Number),
    });
  });
});
