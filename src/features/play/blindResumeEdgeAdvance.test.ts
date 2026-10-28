import { describe, expect, it } from "vitest";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
  type OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";
import { advancePersistedBlindResumeV3 } from "../../../supabase/functions/daily-challenge-runtime/blindResumeAdvance";

function officialContext(): OfficialDailyRuntimeContext {
  const publication = buildOfficialDailySetup("blind_resume", "2026-10-16", "play-rotation-v20-resume-v18-oct3");
  return {
    gameType: "blind_resume",
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: {},
    publicState: initialOfficialDailyPublicState(publication.publicSetup),
  };
}

describe("lightweight persisted UFC Blind Resume V3 Daily advance", () => {
  it("exactly matches canonical reveals, choices, scoring, five-round results, and final evidence", () => {
    let original = officialContext();
    let lightweight = officialContext();
    const roundActions = [
      [{ reveal: true }, { choice: "A" }],
      [{ reveal: true }, { reveal: true }, { choice: "B" }],
      [{ choice: "B" }],
      [{ reveal: true }, { reveal: true }, { reveal: true }, { choice: "A" }],
      [{ choice: "A" }],
    ];
    for (const actions of roundActions) {
      for (const action of actions) {
        const expected = advanceOfficialDailyRuntime(original, action);
        const actual = advancePersistedBlindResumeV3(lightweight, action);
        expect(actual).toEqual(expected);
        original = { ...original, submissionState: expected.submissionState, publicState: expected.publicState };
        lightweight = { ...lightweight, submissionState: actual.submissionState, publicState: actual.publicState };
      }
    }
    expect(lightweight.publicState.complete).toBe(true);
    expect((lightweight.publicState.results as unknown[]).length).toBe(5);
    expect(lightweight.submissionState.final_submission).toEqual(original.submissionState.final_submission);
  });

  it("never exposes future stats or fighter identity before a pick", () => {
    const context = officialContext();
    const first = advancePersistedBlindResumeV3(context, { reveal: true });
    expect(first.publicState.current_round).toEqual(
      advanceOfficialDailyRuntime(context, { reveal: true }).publicState.current_round,
    );
    const displayed = first.publicState.current_round as { stats: Array<{ revealed: boolean; value_a: unknown; value_b: unknown }> };
    expect(displayed.stats).toHaveLength(8);
    expect(displayed.stats.filter((stat) => stat.revealed)).toHaveLength(4);
    expect(displayed.stats.slice(4).every((stat) => stat.value_a === null && stat.value_b === null)).toBe(true);
    expect(JSON.stringify(first.publicState)).not.toContain('"winner_id"');
    expect(JSON.stringify(first.publicState)).not.toContain('"fighter_a_id"');
  });

  it("rejects archive versions and mismatched fighter identity snapshots", () => {
    const context = officialContext();
    expect(() => advancePersistedBlindResumeV3({ ...context, setupKey: "blind-resume-v2:old" }, { choice: "A" }))
      .toThrow("Only the published Blind Resume V3 board");
    const forged = {
      ...context,
      revealSetup: { rounds: [{ fighter_a: { id: "wrong" }, fighter_b: { id: "wrong" } }] },
    };
    expect(() => advancePersistedBlindResumeV3(forged, { choice: "A" }))
      .toThrow("do not match official evidence");
  });
});
