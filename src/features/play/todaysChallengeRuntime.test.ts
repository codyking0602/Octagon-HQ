import { describe, expect, it } from "vitest";
import {
  advanceOfficialDailyRuntime,
  blindResumeV3RoundPoints,
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
  it("materializes deterministic immutable setup identities for all five non-Hit-the-Number games", () => {
    for (const game of games) {
      const first = buildOfficialDailySetup(game, day, scheduleVersion);
      const second = buildOfficialDailySetup(game, day, scheduleVersion);
      expect(second).toEqual(first);
      expect(first.setupKey).toBeTruthy();
      expect(first.contentVersion).toBeTruthy();
      expect(first.scoringVersion).toBe(
        game === "wavelength"
          ? "play-official-score-v2"
          : game === "blind_resume"
            ? "play-official-score-v3"
            : "play-official-score-v1",
      );
      expect(first.publicSetup.runtime_version).toBe("official-daily-runtime-v1");
      expect(record(first.publicSetup.initial_state).complete).toBe(false);
    }
  });

  it("keeps every browser-facing setup and initial state free of private grading evidence", () => {
    for (const game of games) {
      const setup = buildOfficialDailySetup(game, day, scheduleVersion);
      const browserProjection = JSON.stringify({
        public_setup: setup.publicSetup,
        public_state: initialOfficialDailyPublicState(setup.publicSetup),
      });
      expect(browserProjection).not.toContain("privateSetupEvidence");
      expect(browserProjection).not.toContain("privateGradingEvidence");
      expect(browserProjection).not.toContain("private_setup_evidence");
      expect(browserProjection).not.toContain("private_grading_evidence");
      expect(browserProjection).not.toContain('"ratings"');
      expect(browserProjection).not.toContain('"canonical_order"');
      expect(browserProjection).not.toContain('"model_top_four_ids"');
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

  it("uses deterministic prior-day Wavelength history without changing the official same-day setup", () => {
    const prior = buildOfficialDailySetup("wavelength", "2026-08-19", scheduleVersion);
    const current = buildOfficialDailySetup("wavelength", "2026-08-20", scheduleVersion);
    expect(buildOfficialDailySetup("wavelength", "2026-08-20", scheduleVersion)).toEqual(current);
    expect(current.setupKey).toContain("wavelength-daily-history-v1");
    expect(current.contentVersion).toContain("wavelength-daily-history-v1");

    const recentTargets = current.privateSetupEvidence.recent_targets as number[];
    const recentClueIds = current.privateSetupEvidence.recent_clue_ids as string[];
    expect(recentTargets).toHaveLength(4);
    expect(recentClueIds).toHaveLength(4);
    expect(recentTargets).toContain(prior.privateSetupEvidence.target);
    expect(recentClueIds).toContain(prior.privateSetupEvidence.opening_clue_id);
    expect(recentTargets).not.toContain(current.privateSetupEvidence.target);
    expect(recentClueIds).not.toContain(current.privateSetupEvidence.opening_clue_id);

    let runtime = contextFor("wavelength", current);
    for (let index = 0; index < 3; index += 1) {
      runtime = advance(runtime, { guess: 50 + index }).context;
    }
    const clueIds = runtime.submissionState.clue_ids as string[];
    expect(clueIds).toHaveLength(4);
    expect(clueIds.slice(1).every((id) => !recentClueIds.includes(id))).toBe(true);
  });

  it("builds the locked Blind Resume V3 mixed board and reveals only two stat values at first", () => {
    const setup = buildOfficialDailySetup("blind_resume", day, scheduleVersion);
    expect(setup.contentVersion).toBe("blind-resume-v3");
    expect(setup.scoringVersion).toBe("play-official-score-v3");

    const privateRounds = rows(setup.privateSetupEvidence.rounds);
    expect(privateRounds).toHaveLength(5);
    const difficultyCounts = privateRounds.reduce<Record<string, number>>((counts, round) => {
      const difficulty = String(round.difficulty);
      counts[difficulty] = (counts[difficulty] ?? 0) + 1;
      return counts;
    }, {});
    expect(difficultyCounts).toEqual({ nightmare: 1, tight: 1, competitive: 2, readable: 1 });

    const redundantOpening = new Set(["UFC title-fight wins", "Top-5 wins"]);
    for (const round of privateRounds) {
      const privateStats = rows(round.stats);
      expect(privateStats).toHaveLength(8);
      const firstTwo = privateStats.slice(0, 2).map((stat) => String(stat.label));
      expect(firstTwo.every((label) => redundantOpening.has(label))).toBe(false);
    }

    const initialState = record(setup.publicSetup.initial_state);
    const currentRound = record(initialState.current_round);
    const visibleStats = rows(currentRound.stats);
    expect(currentRound.revealed_count).toBe(2);
    expect(visibleStats).toHaveLength(8);
    visibleStats.forEach((stat, index) => {
      expect(stat.revealed).toBe(index < 2);
      if (index >= 2) {
        expect(stat.value_a).toBeNull();
        expect(stat.value_b).toBeNull();
      }
    });

    const initialJson = JSON.stringify(setup.publicSetup);
    for (const round of privateRounds) {
      expect(initialJson).not.toContain(String(round.fighter_a_id));
      expect(initialJson).not.toContain(String(round.fighter_b_id));
    }
  });

  it("locks Blind Resume V3 scoring economics exactly", () => {
    expect([2, 4, 6, 8].map((count) => blindResumeV3RoundPoints(count, true))).toEqual([20, 19, 18, 17]);
    expect([2, 4, 6, 8].map((count) => blindResumeV3RoundPoints(count, false))).toEqual([2, 4, 6, 8]);
    expect(() => blindResumeV3RoundPoints(3, true)).toThrow("2, 4, 6, or 8");
  });

  it("progressively reveals Blind Resume V3 stats and persists the reveal count used for every pick", () => {
    const setup = buildOfficialDailySetup("blind_resume", day, scheduleVersion);
    let runtime = contextFor("blind_resume", setup);
    const revealCounts = [8, 4, 6, 8, 2];

    for (let roundIndex = 0; roundIndex < revealCounts.length; roundIndex += 1) {
      const desiredCount = revealCounts[roundIndex]!;
      while (Number(record(runtime.publicState.current_round).revealed_count) < desiredCount) {
        const revealed = advance(runtime, { reveal: true });
        runtime = revealed.context;
        expect(revealed.result.complete).toBe(false);
        expect(rows(revealed.result.publicState.results)).toHaveLength(roundIndex);
      }

      expect(record(runtime.publicState.current_round).revealed_count).toBe(desiredCount);
      const picked = advance(runtime, { choice: roundIndex % 2 === 0 ? "A" : "B" });
      runtime = picked.context;
      expect(rows(picked.result.publicState.results)).toHaveLength(roundIndex + 1);
      expect(record(rows(picked.result.publicState.results)[roundIndex]).revealed_count).toBe(desiredCount);
      if (roundIndex < 4) {
        expect(picked.result.complete).toBe(false);
        expect(record(picked.result.publicState.current_round).round_index).toBe(roundIndex + 1);
        expect(record(picked.result.publicState.current_round).revealed_count).toBe(2);
      }
    }

    const finalSubmission = record(runtime.submissionState.final_submission);
    const answers = rows(finalSubmission.answers);
    expect(answers).toHaveLength(5);
    expect(answers.map((answer) => answer.revealed_count)).toEqual(revealCounts);
    expect(runtime.publicState.complete).toBe(true);
  });

  it("keeps the legacy Blind Resume V2 advance path available for already-published setup identities", () => {
    const v3 = buildOfficialDailySetup("blind_resume", day, scheduleVersion);
    const sourceRound = rows(v3.privateSetupEvidence.rounds)[0]!;
    const legacyContext: OfficialDailyRuntimeContext = {
      gameType: "blind_resume",
      setupKey: "blind-resume-v2:legacy-test:2026-08-05",
      publicSetup: {},
      revealSetup: {},
      privateSetupEvidence: {
        rounds: [{
          fighter_a_id: sourceRound.fighter_a_id,
          fighter_b_id: sourceRound.fighter_b_id,
          winner_id: sourceRound.winner_id,
          hidden_round: { round_index: 0, round_number: 1, stats: [] },
        }],
      },
      privateGradingEvidence: {},
      submissionState: {},
      publicState: { results: [] },
    };
    const completed = advanceOfficialDailyRuntime(legacyContext, { choice: "A" });
    expect(completed.complete).toBe(true);
    expect(record(completed.finalSubmission).choices).toHaveLength(1);
    expect(rows(completed.publicState.results)).toHaveLength(1);
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
