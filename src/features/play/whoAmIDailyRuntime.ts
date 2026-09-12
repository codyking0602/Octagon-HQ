import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_CLUES_PER_REVEAL,
  WHO_AM_I_RESCUE_GUESS_COUNT,
  whoAmIRecoveryScore,
  whoAmIRescueChoices,
  whoAmIScore,
  type WhoAmIClue,
  type WhoAmIRound,
  type WhoAmISubject,
} from "../games/whoAmIEngine";
import { seededLineupRandom } from "./lineupModel";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const WHO_AM_I_DAILY_CONTENT_VERSION = "who-am-i-daily-v1" as const;

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${label} must be a string array.`);
  }
  return value as string[];
}

function subjectArray(value: unknown, label: string): WhoAmISubject[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value.map((item) => {
    const row = asRecord(item, label);
    const id = String(row.id ?? "");
    const name = String(row.name ?? "");
    const kind = String(row.kind ?? "");
    if (!id || !name || !["fighter", "player", "coach"].includes(kind)) {
      throw new Error(`${label} contains an invalid subject.`);
    }
    return {
      id,
      name,
      kind: kind as WhoAmISubject["kind"],
      ...(typeof row.eraBand === "string" ? { eraBand: row.eraBand as WhoAmISubject["eraBand"] } : {}),
      ...(typeof row.rescueGroup === "string" ? { rescueGroup: row.rescueGroup } : {}),
    };
  });
}

function clueArray(value: unknown): WhoAmIClue[] {
  if (!Array.isArray(value)) throw new Error("Who Am I clues must be an array.");
  return value.map((item) => {
    const row = asRecord(item, "Who Am I clue");
    const id = String(row.id ?? "");
    const text = String(row.text ?? "");
    const band = String(row.band ?? "");
    if (!id || !text || !["broad", "helpful", "strong", "giveaway"].includes(band)) {
      throw new Error("Who Am I clue evidence is invalid.");
    }
    return { id, text, band: band as WhoAmIClue["band"] };
  });
}

function publicSubject(subject: WhoAmISubject) {
  return { id: subject.id, name: subject.name, kind: subject.kind };
}

function publicClue(clue: WhoAmIClue) {
  return { id: clue.id, text: clue.text };
}

function roundFromEvidence(context: OfficialDailyRuntimeContext): WhoAmIRound {
  const evidence = context.privateSetupEvidence;
  const hiddenId = String(evidence.hidden_subject_id ?? "");
  const subjects = subjectArray(evidence.subjects, "Who Am I subjects");
  const hiddenSubject = subjects.find((subject) => subject.id === hiddenId);
  if (!hiddenSubject) throw new Error("Who Am I hidden subject is unavailable.");
  const league = String(evidence.league ?? "");
  const sport = String(evidence.sport ?? "");
  if (!["UFC", "NFL", "CFB"].includes(league) || !["ufc", "football"].includes(sport)) {
    throw new Error("Who Am I round identity is invalid.");
  }
  return {
    sport: sport as WhoAmIRound["sport"],
    league: league as WhoAmIRound["league"],
    subjects,
    hiddenSubject,
    clues: clueArray(evidence.clues),
  };
}

function recoveryChoices(
  context: OfficialDailyRuntimeContext,
  round: WhoAmIRound,
  naturalGuesses: readonly string[],
) {
  const random = seededLineupRandom(
    WHO_AM_I_DAILY_CONTENT_VERSION,
    context.setupKey,
    "recovery",
    naturalGuesses.join(","),
  );
  return whoAmIRescueChoices(round, random, new Set(naturalGuesses));
}

function playingPublicState(
  round: WhoAmIRound,
  revealedCount: number,
  naturalGuesses: readonly string[],
) {
  return {
    complete: false,
    phase: "playing",
    league: round.league,
    revealed_count: revealedCount,
    clues: round.clues.slice(0, revealedCount).map(publicClue),
    wrong_guesses: naturalGuesses.length,
    rejected_subject_ids: [...naturalGuesses],
    recovery_wrong_guesses: 0,
    recovery_choices: [],
    recovery_rejected_subject_ids: [],
    score: null,
  };
}

function recoveryPublicState(
  context: OfficialDailyRuntimeContext,
  round: WhoAmIRound,
  naturalGuesses: readonly string[],
  recoveryGuesses: readonly string[] = [],
) {
  const choices = recoveryChoices(context, round, naturalGuesses);
  return {
    complete: false,
    phase: "recovery",
    league: round.league,
    revealed_count: WHO_AM_I_CLUE_LIMIT,
    clues: round.clues.map(publicClue),
    wrong_guesses: naturalGuesses.length,
    rejected_subject_ids: [...naturalGuesses],
    recovery_wrong_guesses: recoveryGuesses.length,
    recovery_choices: choices.map(publicSubject),
    recovery_rejected_subject_ids: [...recoveryGuesses],
    score: null,
  };
}

export function buildWhoAmIDailyPublication(
  round: WhoAmIRound,
  day: string,
  scheduleVersion: string,
  runtimeVersion: string,
  scoringVersion: OfficialDailySetupPublication["scoringVersion"],
): OfficialDailySetupPublication {
  const subjects = round.subjects.map((subject) => ({ ...subject }));
  const clues = round.clues.map((clue) => ({ ...clue }));
  return {
    setupKey: `${WHO_AM_I_DAILY_CONTENT_VERSION}:${runtimeVersion}:${scheduleVersion}:${day}:${round.league}`,
    contentVersion: WHO_AM_I_DAILY_CONTENT_VERSION,
    scoringVersion,
    publicSetup: {
      runtime_version: runtimeVersion,
      sport: round.sport,
      league: round.league,
      clue_limit: WHO_AM_I_CLUE_LIMIT,
      clues_per_reveal: WHO_AM_I_CLUES_PER_REVEAL,
      subjects: subjects.map(publicSubject),
      initial_state: playingPublicState(round, WHO_AM_I_CLUES_PER_REVEAL, []),
    },
    revealSetup: {
      identity: publicSubject(round.hiddenSubject),
      league: round.league,
      clues: clues.map(publicClue),
    },
    privateSetupEvidence: {
      sport: round.sport,
      league: round.league,
      subjects,
      hidden_subject_id: round.hiddenSubject.id,
      clues,
    },
    privateGradingEvidence: {
      subject_ids: subjects.map((subject) => subject.id),
      hidden_subject_id: round.hiddenSubject.id,
      clue_limit: WHO_AM_I_CLUE_LIMIT,
      clues_per_reveal: WHO_AM_I_CLUES_PER_REVEAL,
    },
  };
}

export function advanceWhoAmIDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  const parsed = asRecord(action, "Who Am I action");
  const round = roundFromEvidence(context);
  const naturalGuesses = stringArray(context.submissionState.natural_guesses ?? [], "Who Am I natural guesses");
  const recoveryGuesses = stringArray(context.submissionState.recovery_guesses ?? [], "Who Am I Recovery guesses");
  const phase = String(context.publicState.phase ?? "playing");
  const revealedCount = Number(context.publicState.revealed_count ?? WHO_AM_I_CLUES_PER_REVEAL);

  if (context.publicState.complete === true) throw new Error("The official Who Am I round is already complete.");

  if (parsed.type === "reveal") {
    if (phase !== "playing") throw new Error("Who Am I clues can only be revealed during natural play.");
    if (!Number.isInteger(revealedCount) || revealedCount < 2 || revealedCount >= WHO_AM_I_CLUE_LIMIT) {
      throw new Error("All Who Am I natural clues are already revealed.");
    }
    const nextRevealed = Math.min(WHO_AM_I_CLUE_LIMIT, revealedCount + WHO_AM_I_CLUES_PER_REVEAL);
    return {
      submissionState: { natural_guesses: naturalGuesses, recovery_guesses: recoveryGuesses, final_submission: null },
      publicState: playingPublicState(round, nextRevealed, naturalGuesses),
      complete: false,
      finalSubmission: null,
    };
  }

  if (parsed.type === "enter_recovery") {
    if (phase !== "playing" || revealedCount !== WHO_AM_I_CLUE_LIMIT) {
      throw new Error("Recovery Board opens only after all ten Who Am I clues are revealed.");
    }
    return {
      submissionState: { natural_guesses: naturalGuesses, recovery_guesses: [], final_submission: null },
      publicState: recoveryPublicState(context, round, naturalGuesses),
      complete: false,
      finalSubmission: null,
    };
  }

  if (parsed.type === "guess") {
    if (phase !== "playing") throw new Error("Natural Who Am I guesses are closed.");
    const subjectId = String(parsed.subject_id ?? "");
    if (!round.subjects.some((subject) => subject.id === subjectId)) throw new Error("That subject is not in this Who Am I pool.");
    if (naturalGuesses.includes(subjectId)) throw new Error("That Who Am I subject was already guessed.");

    if (subjectId === round.hiddenSubject.id) {
      const score = whoAmIScore(revealedCount, naturalGuesses.length);
      const nextNatural = [...naturalGuesses, subjectId];
      const finalSubmission = {
        outcome: "natural",
        revealed_count: revealedCount,
        natural_guesses: nextNatural,
        recovery_choices: [],
        recovery_guesses: [],
      };
      return {
        submissionState: { natural_guesses: nextNatural, recovery_guesses: [], final_submission: finalSubmission },
        publicState: {
          ...playingPublicState(round, revealedCount, naturalGuesses),
          complete: true,
          phase: "result",
          score,
          outcome: "natural",
        },
        complete: true,
        finalSubmission,
      };
    }

    const nextNatural = [...naturalGuesses, subjectId];
    if (revealedCount === WHO_AM_I_CLUE_LIMIT) {
      return {
        submissionState: { natural_guesses: nextNatural, recovery_guesses: [], final_submission: null },
        publicState: recoveryPublicState(context, round, nextNatural),
        complete: false,
        finalSubmission: null,
      };
    }

    return {
      submissionState: { natural_guesses: nextNatural, recovery_guesses: [], final_submission: null },
      publicState: playingPublicState(round, revealedCount, nextNatural),
      complete: false,
      finalSubmission: null,
    };
  }

  if (parsed.type === "recovery_guess") {
    if (phase !== "recovery") throw new Error("Recovery Board is not active.");
    const subjectId = String(parsed.subject_id ?? "");
    const choices = recoveryChoices(context, round, naturalGuesses);
    if (!choices.some((subject) => subject.id === subjectId)) throw new Error("That subject is not on the Recovery Board.");
    if (recoveryGuesses.includes(subjectId)) throw new Error("That Recovery Board subject was already guessed.");
    const nextRecovery = [...recoveryGuesses, subjectId];

    if (subjectId === round.hiddenSubject.id) {
      const score = whoAmIRecoveryScore(recoveryGuesses.length);
      const finalSubmission = {
        outcome: "recovered",
        revealed_count: WHO_AM_I_CLUE_LIMIT,
        natural_guesses: naturalGuesses,
        recovery_choices: choices.map((subject) => subject.id),
        recovery_guesses: nextRecovery,
      };
      return {
        submissionState: { natural_guesses: naturalGuesses, recovery_guesses: nextRecovery, final_submission: finalSubmission },
        publicState: {
          ...recoveryPublicState(context, round, naturalGuesses, recoveryGuesses),
          complete: true,
          phase: "result",
          recovery_wrong_guesses: recoveryGuesses.length,
          recovery_rejected_subject_ids: [...recoveryGuesses],
          score,
          outcome: "recovered",
        },
        complete: true,
        finalSubmission,
      };
    }

    if (nextRecovery.length >= WHO_AM_I_RESCUE_GUESS_COUNT) {
      const finalSubmission = {
        outcome: "miss",
        revealed_count: WHO_AM_I_CLUE_LIMIT,
        natural_guesses: naturalGuesses,
        recovery_choices: choices.map((subject) => subject.id),
        recovery_guesses: nextRecovery,
      };
      return {
        submissionState: { natural_guesses: naturalGuesses, recovery_guesses: nextRecovery, final_submission: finalSubmission },
        publicState: {
          ...recoveryPublicState(context, round, naturalGuesses, recoveryGuesses),
          complete: true,
          phase: "result",
          recovery_wrong_guesses: WHO_AM_I_RESCUE_GUESS_COUNT,
          recovery_rejected_subject_ids: nextRecovery,
          score: 0,
          outcome: "miss",
        },
        complete: true,
        finalSubmission,
      };
    }

    return {
      submissionState: { natural_guesses: naturalGuesses, recovery_guesses: nextRecovery, final_submission: null },
      publicState: recoveryPublicState(context, round, naturalGuesses, nextRecovery),
      complete: false,
      finalSubmission: null,
    };
  }

  throw new Error("Unsupported Who Am I Daily action.");
}
