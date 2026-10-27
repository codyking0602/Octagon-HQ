import { describe, expect, it } from "vitest";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationWavelength";
import { advanceFootballOfficialDailyRuntime } from "./footballTodayChallengeAdvanceRuntime";
import { advanceFootballWavelengthDailyRuntime } from "./footballWavelengthDailyAdvance";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

const published = buildFootballDailyPersistenceSetup(
  "2026-10-27",
  "football-daily-v22-higher-lower-oct27",
  "wavelength",
);

function startingContext(): OfficialDailyRuntimeContext {
  return {
    gameType: "wavelength",
    setupKey: published.setupKey,
    publicSetup: published.publicSetup,
    revealSetup: published.revealSetup,
    privateSetupEvidence: published.privateSetupEvidence,
    privateGradingEvidence: published.privateGradingEvidence,
    submissionState: {},
    publicState: published.publicSetup.initial_state as Record<string, unknown>,
  };
}

describe("October 27 Wavelength lean advance parity", () => {
  it("advances all guesses, Game 2 handoff and both canonical scores identically", () => {
    let context = startingContext();
    for (const action of [
      { guess: 20 }, { guess: 40 }, { guess: 60 }, { guess: 80 },
      { type: "next_game" },
      { guess: 90 }, { guess: 70 }, { guess: 50 }, { guess: 30 },
    ]) {
      const expected = advanceFootballOfficialDailyRuntime(context, action);
      const lean = advanceFootballWavelengthDailyRuntime(context, action);
      expect(lean).toEqual(expected);
      context = { ...context, submissionState: lean.submissionState, publicState: lean.publicState };
    }
    expect(context.publicState.complete).toBe(true);
    expect(context.publicState.round_scores).toHaveLength(2);
    expect(context.publicState.score).toBeTypeOf("number");
    expect(context.submissionState.final_submission).toHaveProperty("rounds");
  });

  it("rejects other game types before any state mutation", () => {
    expect(() => advanceFootballWavelengthDailyRuntime(
      { ...startingContext(), gameType: "hit_the_number" },
      { guess: 50 },
    )).toThrow("another game type");
  });
});
