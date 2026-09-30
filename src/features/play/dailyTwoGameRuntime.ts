import type {
  OfficialDailyAdvanceResult,
  OfficialDailyGameType,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";
import {
  DAILY_TWO_GAME_FORMAT_VERSION,
  DAILY_TWO_GAME_SCORING_VERSION,
} from "./dailyTwoGameContract";

type JsonRecord = Record<string, unknown>;

export type DailyTwoGameAdvanceChild = (
  context: OfficialDailyRuntimeContext,
  action: unknown,
) => OfficialDailyAdvanceResult;

export type DailyTwoGameScoreChild = (
  context: OfficialDailyRuntimeContext,
  advanced: OfficialDailyAdvanceResult,
) => number;

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

function records(value: unknown, label: string): JsonRecord[] {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function childPublication(publication: OfficialDailySetupPublication) {
  return {
    setup_key: publication.setupKey,
    content_version: publication.contentVersion,
    scoring_version: publication.scoringVersion,
    public_setup: publication.publicSetup,
    reveal_setup: publication.revealSetup,
    private_setup_evidence: publication.privateSetupEvidence,
    private_grading_evidence: publication.privateGradingEvidence,
  };
}

export function buildTwoGameDailyPublication({
  sport,
  gameType,
  day,
  scheduleVersion,
  children,
}: {
  sport: "ufc" | "football";
  gameType: OfficialDailyGameType;
  day: string;
  scheduleVersion: string;
  children: readonly [OfficialDailySetupPublication, OfficialDailySetupPublication];
}): OfficialDailySetupPublication {
  const rounds = children.map(childPublication);
  const firstInitial = record(rounds[0]!.public_setup.initial_state, "Two-game Daily first initial state");
  return {
    setupKey: `${DAILY_TWO_GAME_FORMAT_VERSION}:${sport}:${gameType}:${scheduleVersion}:${day}`,
    contentVersion: `${DAILY_TWO_GAME_FORMAT_VERSION}:${children[0].contentVersion}:${children[1].contentVersion}`,
    scoringVersion: DAILY_TWO_GAME_SCORING_VERSION,
    publicSetup: {
      format_version: DAILY_TWO_GAME_FORMAT_VERSION,
      sport,
      game_type: gameType,
      round_count: 2,
      rounds: rounds.map((round) => round.public_setup),
      initial_state: {
        complete: false,
        format_version: DAILY_TWO_GAME_FORMAT_VERSION,
        round_index: 0,
        round_count: 2,
        awaiting_next: false,
        handoff_pending: false,
        completed_rounds: [],
        round_scores: [],
        active_round: firstInitial,
        active_reveal: null,
        score: null,
      },
    },
    revealSetup: {
      format_version: DAILY_TWO_GAME_FORMAT_VERSION,
      rounds: rounds.map((round) => round.reveal_setup),
    },
    privateSetupEvidence: {
      format_version: DAILY_TWO_GAME_FORMAT_VERSION,
      sport,
      game_type: gameType,
      rounds,
    },
    privateGradingEvidence: {
      format_version: DAILY_TWO_GAME_FORMAT_VERSION,
      game_type: gameType,
      rounds: rounds.map((round) => ({
        scoring_version: round.scoring_version,
        private_grading_evidence: round.private_grading_evidence,
      })),
    },
  };
}

export function isTwoGameDailyContext(context: Pick<OfficialDailyRuntimeContext, "privateSetupEvidence">) {
  return context.privateSetupEvidence.format_version === DAILY_TWO_GAME_FORMAT_VERSION;
}

function childContext(
  context: OfficialDailyRuntimeContext,
  child: JsonRecord,
  submissionState: JsonRecord,
  publicState: JsonRecord,
): OfficialDailyRuntimeContext {
  return {
    gameType: context.gameType,
    setupKey: String(child.setup_key ?? ""),
    publicSetup: record(child.public_setup, "Two-game Daily child public setup"),
    revealSetup: record(child.reveal_setup, "Two-game Daily child reveal setup"),
    privateSetupEvidence: record(child.private_setup_evidence, "Two-game Daily child setup evidence"),
    privateGradingEvidence: record(child.private_grading_evidence, "Two-game Daily child grading evidence"),
    submissionState,
    publicState,
  };
}

function storedRoundState(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function normalizedRoundScore(value: number) {
  if (!Number.isFinite(value)) throw new Error("Two-game Daily round score is invalid.");
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function advanceTwoGameDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
  advanceChild: DailyTwoGameAdvanceChild,
  scoreChild: DailyTwoGameScoreChild,
): OfficialDailyAdvanceResult {
  if (!isTwoGameDailyContext(context)) {
    throw new Error("Two-game Daily runtime received a single-game context.");
  }

  const children = records(context.privateSetupEvidence.rounds, "Two-game Daily children");
  if (children.length !== 2) throw new Error("Two-game Daily requires exactly two games.");
  const index = Number(context.publicState.round_index ?? 0);
  if (!Number.isInteger(index) || index < 0 || index > 1) {
    throw new Error("Two-game Daily active game index is invalid.");
  }
  if (context.publicState.complete === true) {
    throw new Error("The two-game Daily is already complete.");
  }

  const parsedAction = record(action, "Two-game Daily action");
  const savedRounds = records(context.submissionState.rounds ?? [], "Two-game Daily saved rounds");
  const completed = records(context.publicState.completed_rounds ?? [], "Two-game Daily completed rounds");
  const scores = Array.isArray(context.publicState.round_scores)
    ? context.publicState.round_scores.map(Number)
    : [];

  if (context.publicState.handoff_pending === true) {
    if (
      parsedAction.type !== "next_game"
      || context.gameType !== "wavelength"
      || index !== 1
      || completed.length !== 1
      || scores.length !== 1
    ) {
      throw new Error("Finish the Wavelength Game 1 handoff before continuing.");
    }
    return {
      submissionState: { rounds: savedRounds, final_submission: null },
      publicState: {
        ...context.publicState,
        handoff_pending: false,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  if (context.publicState.awaiting_next === true) {
    if (parsedAction.type !== "next_game" || index !== 0 || completed.length !== 1) {
      throw new Error("Finish the two-game Daily transition before continuing.");
    }
    const secondInitial = record(
      record(children[1]!.public_setup, "Two-game Daily second setup").initial_state,
      "Two-game Daily second initial state",
    );
    return {
      submissionState: { rounds: savedRounds, final_submission: null },
      publicState: {
        complete: false,
        format_version: DAILY_TWO_GAME_FORMAT_VERSION,
        round_index: 1,
        round_count: 2,
        awaiting_next: false,
        handoff_pending: context.gameType === "wavelength",
        completed_rounds: completed,
        round_scores: scores,
        active_round: secondInitial,
        active_reveal: null,
        score: null,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  const child = children[index]!;
  const childSubmission = storedRoundState(savedRounds[index]);
  const childPublic = record(context.publicState.active_round, "Two-game Daily active state");
  const activeContext = childContext(context, child, childSubmission, childPublic);
  const advanced = advanceChild(activeContext, parsedAction);

  const nextSavedRounds = [...savedRounds];
  nextSavedRounds[index] = advanced.submissionState;

  if (!advanced.complete) {
    return {
      submissionState: { rounds: nextSavedRounds, final_submission: null },
      publicState: {
        ...context.publicState,
        complete: false,
        active_round: advanced.publicState,
        active_reveal: null,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  const roundScore = normalizedRoundScore(scoreChild(activeContext, advanced));
  const nextScores = [...scores];
  nextScores[index] = roundScore;
  const summary = {
    game_index: index,
    normalized_score: roundScore,
  };
  const nextCompleted = [...completed];
  nextCompleted[index] = summary;

  if (index === 0) {
    const secondInitial = record(
      record(children[1]!.public_setup, "Two-game Daily second setup").initial_state,
      "Two-game Daily second initial state",
    );
    return {
      submissionState: { rounds: nextSavedRounds, final_submission: null },
      publicState: {
        complete: false,
        format_version: DAILY_TWO_GAME_FORMAT_VERSION,
        round_index: 1,
        round_count: 2,
        awaiting_next: false,
        handoff_pending: context.gameType === "wavelength",
        completed_rounds: nextCompleted,
        round_scores: nextScores,
        active_round: secondInitial,
        active_reveal: null,
        score: null,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  if (nextScores.length !== 2 || nextScores.some((score) => !Number.isFinite(score))) {
    throw new Error("Two-game Daily cannot finish without both round scores.");
  }
  const averageScore = Math.round((nextScores[0]! + nextScores[1]!) / 2);
  const roundSubmissions = nextSavedRounds.map((roundState, roundIndex) => {
    const finalSubmission = record(roundState, `Two-game Daily round ${roundIndex + 1} state`).final_submission;
    return record(finalSubmission, `Two-game Daily round ${roundIndex + 1} submission`);
  });
  const finalSubmission = { rounds: roundSubmissions };

  return {
    submissionState: { rounds: nextSavedRounds, final_submission: finalSubmission },
    publicState: {
      complete: true,
      format_version: DAILY_TWO_GAME_FORMAT_VERSION,
      round_index: 1,
      round_count: 2,
      awaiting_next: false,
      handoff_pending: false,
      completed_rounds: nextCompleted,
      round_scores: nextScores,
      active_round: advanced.publicState,
      active_reveal: child.reveal_setup,
      score: averageScore,
    },
    complete: true,
    finalSubmission,
  };
}
