import { describe, expect, it } from "vitest";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
  type OfficialDailyGameType,
  type OfficialDailyRuntimeContext,
  type OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

const day = "2026-08-06";
const scheduleVersion = "test-official-runtime-v1";
const games: readonly OfficialDailyGameType[] = [
  "find_leader",
  "blind_resume",
  "wavelength",
  "blind_rank_5",
  "keep_4_cut_4",
];

function record(value: unknown) {
  return value as Record<string, unknown>;
}

function rows(value: unknown) {
  return value as Array<Record<string, unknown>>;
}

function contextFor(
  gameType: OfficialDailyGameType,
  setup: OfficialDailySetupPublication,
): OfficialDailyRuntimeContext {
  return {
    gameType,
    setupKey: setup.setupKey,
    publicSetup: setup.publicSetup,
    revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence,
    privateGradingEvidence: setup.privateGradingEvidence,
    submissionState: {},
    publicState: initialOfficialDailyPublicState(setup.publicSetup),
  };
}

function advance(
  context: OfficialDailyRuntimeContext,
  action: Record<string, unknown>,
) {
  const next = advanceOfficialDailyRuntime(context, action);
  return {
    result: next,
    context: {
      ...context,
      submissionState: next.submissionState,
      publicState: next.publicState,
    },
  };
}

describe("official Today’s Challenge runtime", () => {
  it("materializes deterministic immutable setup identities for all five eligible games", () => {
    for (const game of games) {
      const first = buildOfficialDailySetup(game, day, scheduleVersion);
      const second = buildOfficialDailySetup(game, day, scheduleVersion);
      expect(second).toEqual(first);
      expect(first.setupKey).toBeTruthy();
      expect(first.contentVersion).toBeTruthy();
      expect(first.scoringVersion).toBe("play-official-score-v1");
      expect(first.publicSetup.runtime_version).toBe("official-daily-runtime-v1");
      expect(record(first.publicSetup.initial_state).complete).toBe(false);
    }
  });

  it("keeps Wavelength target, clue ratings, and future clues private until their reveal boundary", () => {
    const setup = buildOfficialDailySetup("wavelength", day, scheduleVersion);
    const publicJson = JSON.stringify(setup.publicSetup);
    expect(publicJson).not.toContain('"target"');
    expect(publicJson).not.toContain('"rating"');
    expect(rows(record(setup.publicSetup.initial_state).clues)).toHaveLength(1);

    let runtime = contextFor("wavelength", setup);
    for (let index = 0; index < 3; index += 1) {
      const next = advance(runtime, { guess: 50 + index });
      runtime = next.context;
      expect(next.result.complete).toBe(false);
      expect(JSON.stringify(next.result.publicState)).not.toContain('"target"');
      expect(JSON.stringify(next.result.publicState)).not.toContain('"rating"');
      expect(rows(next.result.publicState.clues)).toHaveLength(index + 2);
    }
    const completed = advance(runtime, { guess: 53 }).result;
    expect(completed.complete).toBe(true);
    expect(completed.finalSubmission).toEqual({ guesses: [50, 51, 52, 53] });
    expect(record(completed.publicState.reveal).target).toBe(setup.privateSetupEvidence.target);
    expect(rows(record(completed.publicState.reveal).clues)).toHaveLength(4);
  });

  it("keeps Blind Resume identities private until each locked pick", () => {
    const setup = buildOfficialDailySetup("blind_resume", day, scheduleVersion);
    const privateRounds = rows(setup.privateSetupEvidence.rounds);
    const initialJson = JSON.stringify(setup.publicSetup);
    for (const round of privateRounds) {
      expect(initialJson).not.toContain(String(round.fighter_a_id));
      expect(initialJson).not.toContain(String(round.fighter_b_id));
    }

    let runtime = contextFor("blind_resume", setup);
    for (let index = 0; index < 5; index += 1) {
      const next = advance(runtime, { choice: index % 2 === 0 ? "A" : "B" });
      runtime = next.context;
      expect(rows(next.result.publicState.results)).toHaveLength(index + 1);
      if (index < 4) {
        expect(next.result.complete).toBe(false);
        expect(record(next.result.publicState.current_round).round_index).toBe(index + 1);
      }
    }
    const finalSubmission = record(runtime.submissionState.final_submission);
    expect(finalSubmission.choices).toHaveLength(5);
    expect(runtime.publicState.complete).toBe(true);
  });

  it("reveals Blind Rank fighters one at a time and locks every slot", () => {
    const setup = buildOfficialDailySetup("blind_rank_5", day, scheduleVersion);
    const fighterIds = setup.privateSetupEvidence.fighter_ids as string[];
    const initialJson = JSON.stringify(setup.publicSetup);
    expect(initialJson).toContain(fighterIds[0]!);
    fighterIds.slice(1).forEach((id) => expect(initialJson).not.toContain(id));

    let runtime = contextFor("blind_rank_5", setup);
    const slots = [3, 1, 5, 2, 4];
    for (let index = 0; index < slots.length; index += 1) {
      const next = advance(runtime, { slot: slots[index] });
      runtime = next.context;
      expect(next.result.publicState.reveal_index).toBe(index + 1);
      if (index < 4) {
        expect(JSON.stringify(next.result.publicState.current_fighter)).toContain(fighterIds[index + 1]!);
        fighterIds.slice(index + 2).forEach((id) => {
          expect(JSON.stringify(next.result.publicState)).not.toContain(id);
        });
      }
    }
    expect(record(runtime.submissionState.final_submission).ordered_ids).toEqual([
      fighterIds[1], fighterIds[3], fighterIds[0], fighterIds[4], fighterIds[2],
    ]);
    expect(runtime.publicState.complete).toBe(true);
  });

  it("preserves blind locked Keep Cut decisions and derives the four kept ids", () => {
    const setup = buildOfficialDailySetup("keep_4_cut_4", day, scheduleVersion);
    const fighterIds = setup.privateSetupEvidence.fighter_ids as string[];
    const initialJson = JSON.stringify(setup.publicSetup);
    expect(initialJson).toContain(fighterIds[0]!);
    fighterIds.slice(1).forEach((id) => expect(initialJson).not.toContain(id));

    let runtime = contextFor("keep_4_cut_4", setup);
    const choices = ["keep", "cut", "keep", "cut", "keep", "cut", "keep", "cut"];
    for (let index = 0; index < choices.length; index += 1) {
      const next = advance(runtime, { choice: choices[index] });
      runtime = next.context;
      expect(next.result.publicState.reveal_index).toBe(index + 1);
      if (index < 7) {
        expect(JSON.stringify(next.result.publicState.current_fighter)).toContain(fighterIds[index + 1]!);
        fighterIds.slice(index + 2).forEach((id) => {
          expect(JSON.stringify(next.result.publicState)).not.toContain(id);
        });
      }
    }
    expect(record(runtime.submissionState.final_submission).kept_ids).toEqual([
      fighterIds[0], fighterIds[2], fighterIds[4], fighterIds[6],
    ]);
    expect(rows(runtime.publicState.kept)).toHaveLength(4);
    expect(rows(runtime.publicState.cut)).toHaveLength(4);
    expect(runtime.publicState.complete).toBe(true);
  });

  it("forces Keep Cut to the remaining tray after one side reaches four", () => {
    const setup = buildOfficialDailySetup("keep_4_cut_4", day, scheduleVersion);
    let runtime = contextFor("keep_4_cut_4", setup);
    for (let index = 0; index < 4; index += 1) {
      runtime = advance(runtime, { choice: "keep" }).context;
    }
    expect(runtime.publicState.forced_choice).toBe("cut");
    expect(() => advanceOfficialDailyRuntime(runtime, { choice: "keep" })).toThrow("must be cut");
  });

  it("persists Find the Leader elimination order without exposing the leader", () => {
    const setup = buildOfficialDailySetup("find_leader", day, scheduleVersion);
    const candidateIds = setup.privateSetupEvidence.candidate_ids as string[];
    const leaderId = String(setup.privateSetupEvidence.leader_id);
    expect(JSON.stringify(setup.publicSetup)).not.toContain('"leader_id"');
    const safeIds = candidateIds.filter((id) => id !== leaderId);
    let runtime = contextFor("find_leader", setup);
    for (let index = 0; index < 9; index += 1) {
      const next = advance(runtime, { eliminated_id: safeIds[index] });
      runtime = next.context;
    }
    expect(runtime.publicState.complete).toBe(true);
    expect(record(runtime.submissionState.final_submission).eliminated_ids).toEqual(safeIds);
  });
});
