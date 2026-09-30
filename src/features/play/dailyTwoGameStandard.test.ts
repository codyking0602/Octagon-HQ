import { describe, expect, it } from "vitest";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
  type OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";
import {
  DAILY_TWO_GAME_FORMAT_VERSION,
  DAILY_TWO_GAME_SCORING_VERSION,
  dailyUsesTwoGameAverage,
} from "./dailyTwoGameContract";
import { buildFootballDailyPersistenceSetup as buildFootballWavelengthDaily } from "./footballDailyPublicationWavelength";
import { buildFootballDailyPersistenceSetup as buildFootballFindLeaderDaily } from "./footballDailyPublicationFindLeader";
import { buildFootballDailyPersistenceSetup as buildFootballHitNumberDaily } from "./footballDailyPublicationHitNumber";
import { advanceFootballOfficialDailyRuntime } from "./footballTodayChallengeAdvanceRuntime";

function record(value: unknown) {
  return value as Record<string, unknown>;
}

function rows(value: unknown) {
  return value as Array<Record<string, unknown>>;
}

function strings(value: unknown) {
  return value as string[];
}

function contextFor(
  gameType: "find_leader" | "wavelength" | "hit_the_number",
  setup: ReturnType<typeof buildOfficialDailySetup>,
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

describe("two-game Daily standard", () => {
  it("cuts over only the three approved games beginning September 27", () => {
    for (const game of ["find_leader", "wavelength", "hit_the_number"]) {
      expect(dailyUsesTwoGameAverage(game, "2026-09-26")).toBe(false);
      expect(dailyUsesTwoGameAverage(game, "2026-09-27")).toBe(true);
    }
    expect(dailyUsesTwoGameAverage("who_am_i", "2026-09-27")).toBe(false);
    expect(dailyUsesTwoGameAverage("millionaire", "2026-09-27")).toBe(false);
  });

  it("preserves today's already-played Game 1 identities while adding Game 2", () => {
    const ufc = buildOfficialDailySetup(
      "find_leader",
      "2026-09-27",
      "play-rotation-v16-weighted-sep27",
    );
    expect(ufc.scoringVersion).toBe(DAILY_TWO_GAME_SCORING_VERSION);
    expect(ufc.publicSetup.format_version).toBe(DAILY_TWO_GAME_FORMAT_VERSION);
    const ufcRounds = rows(ufc.privateSetupEvidence.rounds);
    expect(ufcRounds).toHaveLength(2);
    expect(record(ufcRounds[0]!.private_setup_evidence).leader_id).toBe("amanda-nunes");
    expect(ufcRounds[1]!.setup_key).not.toBe(ufcRounds[0]!.setup_key);

    const football = buildFootballWavelengthDaily(
      "2026-09-27",
      "football-daily-v16-weighted-sep25",
      "wavelength",
    );
    expect(football.scoringVersion).toBe(DAILY_TWO_GAME_SCORING_VERSION);
    const footballRounds = rows(football.privateSetupEvidence.rounds);
    expect(footballRounds).toHaveLength(2);
    expect(record(footballRounds[0]!.private_setup_evidence)).toMatchObject({
      target: 99,
      opening_clue_id: "freak-randy-moss",
    });
    expect(record(footballRounds[1]!.private_setup_evidence).target)
      .not.toBe(record(footballRounds[0]!.private_setup_evidence).target);
    expect(record(footballRounds[1]!.private_setup_evidence).opening_clue_id)
      .not.toBe(record(footballRounds[0]!.private_setup_evidence).opening_clue_id);
  });


  it("keeps Wavelength Game 2 preloaded behind a durable server handoff", () => {
    const setup = buildFootballWavelengthDaily(
      "2026-09-30",
      "football-daily-v16-weighted-sep25",
      "wavelength",
    );
    let context: OfficialDailyRuntimeContext = {
      gameType: "wavelength",
      setupKey: setup.setupKey,
      publicSetup: setup.publicSetup,
      revealSetup: setup.revealSetup,
      privateSetupEvidence: setup.privateSetupEvidence,
      privateGradingEvidence: setup.privateGradingEvidence,
      submissionState: {},
      publicState: initialOfficialDailyPublicState(setup.publicSetup),
    };

    for (const guess of [70, 79, 90, 96]) {
      const next = advanceFootballOfficialDailyRuntime(context, { guess });
      context = {
        ...context,
        submissionState: next.submissionState,
        publicState: next.publicState,
      };
    }

    expect(context.publicState.round_index).toBe(1);
    expect(context.publicState.awaiting_next).toBe(false);
    expect(context.publicState.handoff_pending).toBe(true);
    expect(context.publicState.round_scores).toHaveLength(1);
    expect(record(context.publicState.active_round).guesses).toEqual([]);

    const acknowledged = advanceFootballOfficialDailyRuntime(context, { type: "next_game" });
    expect(acknowledged.complete).toBe(false);
    expect(acknowledged.publicState.round_index).toBe(1);
    expect(acknowledged.publicState.handoff_pending).toBe(false);
    expect(record(acknowledged.publicState.active_round).guesses).toEqual([]);
    expect(acknowledged.publicState.round_scores).toEqual(context.publicState.round_scores);
  });

  it("balances Football Find the Leader and Hit the Number across NFL and CFB", () => {
    const findLeader = buildFootballFindLeaderDaily(
      "2026-10-01",
      "football-test-two-game-v1",
      "find_leader",
    );
    const findRounds = rows(findLeader.publicSetup.rounds);
    expect(findRounds).toHaveLength(2);
    expect(findRounds.map((round) => round.league).sort()).toEqual(["CFB", "NFL"]);

    const hitNumber = buildFootballHitNumberDaily(
      "2026-10-03",
      "football-test-two-game-v1",
      "hit_the_number",
    );
    const hitRounds = rows(hitNumber.publicSetup.rounds);
    expect(hitRounds).toHaveLength(2);
    expect(hitRounds.map((round) => round.league).sort()).toEqual(["CFB", "NFL"]);
  });

  it("locks Game 1 and enters Game 2 in the same successful action", () => {
    const setup = buildOfficialDailySetup(
      "find_leader",
      "2026-09-27",
      "play-rotation-v16-weighted-sep27",
    );
    let context = contextFor("find_leader", setup);
    const privateRounds = rows(setup.privateSetupEvidence.rounds);

    const firstEvidence = record(privateRounds[0]!.private_setup_evidence);
    const firstLeader = String(firstEvidence.leader_id);
    const firstCandidates = strings(firstEvidence.candidate_ids);
    const firstMiss = firstCandidates.find((id) => id === firstLeader)!;
    const first = advanceOfficialDailyRuntime(context, { eliminated_id: firstMiss });
    context = {
      ...context,
      submissionState: first.submissionState,
      publicState: first.publicState,
    };

    expect(first.complete).toBe(false);
    expect(first.publicState.awaiting_next).toBe(false);
    expect(first.publicState.round_index).toBe(1);
    expect(first.publicState.round_scores).toEqual([10]);

    const secondEvidence = record(privateRounds[1]!.private_setup_evidence);
    const secondLeader = String(secondEvidence.leader_id);
    const secondCandidates = strings(secondEvidence.candidate_ids);
    for (const id of secondCandidates.filter((candidateId) => candidateId !== secondLeader)) {
      const next = advanceOfficialDailyRuntime(context, { eliminated_id: id });
      context = {
        ...context,
        submissionState: next.submissionState,
        publicState: next.publicState,
      };
      if (next.complete) break;
    }

    expect(context.publicState.complete).toBe(true);
    expect(context.publicState.round_scores).toEqual([10, 100]);
    expect(context.publicState.score).toBe(55);
    expect(rows(record(context.submissionState.final_submission).rounds)).toHaveLength(2);
  });
});
