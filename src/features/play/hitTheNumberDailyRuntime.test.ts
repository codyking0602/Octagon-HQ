import { describe, expect, it } from "vitest";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
  OFFICIAL_DAILY_RUNTIME_VERSION,
  type OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";

const scheduleVersion = "test-hit-number-daily-v1";

function contextFor(day: string): OfficialDailyRuntimeContext {
  const setup = buildOfficialDailySetup("hit_the_number", day, scheduleVersion);
  return {
    gameType: "hit_the_number",
    setupKey: setup.setupKey,
    publicSetup: setup.publicSetup,
    revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence,
    privateGradingEvidence: setup.privateGradingEvidence,
    submissionState: {},
    publicState: initialOfficialDailyPublicState(setup.publicSetup),
  };
}

describe("official Hit the Number daily runtime", () => {
  it("builds deterministic public boards without leaking values or the exact solution", () => {
    const observedModes = new Set<string>();

    for (let index = 0; index < 40; index += 1) {
      const day = `2026-10-${String((index % 28) + 1).padStart(2, "0")}`;
      const first = buildOfficialDailySetup("hit_the_number", day, scheduleVersion);
      const second = buildOfficialDailySetup("hit_the_number", day, scheduleVersion);
      expect(second).toEqual(first);
      expect(first.contentVersion).toBe("hit-the-number-v1");
      expect(first.scoringVersion).toBe("play-official-score-v1");
      expect(first.publicSetup.runtime_version).toBe(OFFICIAL_DAILY_RUNTIME_VERSION);
      expect(first.publicSetup.version).toBe("hit-the-number-v1");
      expect(first.publicSetup.target).toEqual(expect.any(Number));
      expect(first.publicSetup.pickCount).toEqual(expect.any(Number));
      expect(first.publicSetup.fighterIds).toEqual(expect.any(Array));
      observedModes.add(String(first.publicSetup.boardType));

      const browserJson = JSON.stringify({
        public_setup: first.publicSetup,
        public_state: initialOfficialDailyPublicState(first.publicSetup),
        reveal_setup: first.revealSetup,
      });
      expect(browserJson).not.toContain("solutionFighterIds");
      expect(browserJson).not.toContain("solution_fighter_ids");
      expect(browserJson).not.toContain('"values"');
      expect(first.privateGradingEvidence.values).toEqual(expect.any(Object));
      expect(first.revealSetup).toEqual({});
    }

    expect(observedModes).toEqual(new Set(["open-roster", "random-pool"]));
  });

  it("persists reversible selections and requires an explicit lock to finish", () => {
    let context = contextFor("2026-10-15");
    const fighterIds = context.privateSetupEvidence.fighter_ids as string[];
    const pickCount = Number(context.privateSetupEvidence.pick_count);
    const chosen = fighterIds.slice(0, pickCount);

    for (const fighterId of chosen) {
      const next = advanceOfficialDailyRuntime(context, { fighter_id: fighterId });
      expect(next.complete).toBe(false);
      expect(next.finalSubmission).toBeNull();
      context = {
        ...context,
        submissionState: next.submissionState,
        publicState: next.publicState,
      };
    }

    expect(context.publicState.selected_ids).toEqual(chosen);
    expect(context.publicState.complete).toBe(false);

    const removed = advanceOfficialDailyRuntime(context, { fighter_id: chosen[0] });
    expect(removed.publicState.selected_ids).toEqual(chosen.slice(1));
    context = {
      ...context,
      submissionState: removed.submissionState,
      publicState: removed.publicState,
    };
    expect(() => advanceOfficialDailyRuntime(context, { lock: true })).toThrow(/exactly/i);

    const restored = advanceOfficialDailyRuntime(context, { fighter_id: chosen[0] });
    context = {
      ...context,
      submissionState: restored.submissionState,
      publicState: restored.publicState,
    };
    const locked = advanceOfficialDailyRuntime(context, { lock: true });
    expect(locked.complete).toBe(true);
    expect(locked.publicState.complete).toBe(true);
    expect(locked.finalSubmission).toEqual({ selected_ids: [...chosen.slice(1), chosen[0]] });
  });
});
