import {
  footballWavelengthAvailableClues,
  nextFootballWavelengthClue,
  type FootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { wavelengthScore } from "./wavelengthEngine";
import {
  advanceTwoGameDailyRuntime,
  isTwoGameDailyContext,
} from "./dailyTwoGameRuntime";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Football Wavelength action must be an object.");
  }
  return value as JsonRecord;
}

function integer(value: unknown, label: string, min: number, max: number) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  }
  return Number(value);
}

function stringArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) {
    throw new Error(`${label} must be a string array.`);
  }
  return value as string[];
}

function cluePresentation(clue: FootballWavelengthClue) {
  return { id: clue.id, category: clue.category, text: clue.text };
}

function clueFor(id: string) {
  const clue = footballWavelengthAvailableClues.find((row) => row.id === id);
  if (!clue) throw new Error(`Football Wavelength clue ${id} is unavailable.`);
  return clue;
}

// Single-source authoritative gameplay shared by the all-game engine and the
// small Wavelength-only Edge bundle. No client-created clues or scores.
export function advanceFootballWavelengthRound(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  const parsedAction = record(action);
  const target = integer(context.privateSetupEvidence.target, "Football Wavelength target", 1, 100);
  const seed = String(context.privateSetupEvidence.seed ?? "");
  const guesses = Array.isArray(context.submissionState.guesses)
    ? context.submissionState.guesses.map((value) => integer(value, "Football Wavelength guess", 1, 100))
    : [];
  if (guesses.length >= 4) throw new Error("The Football Wavelength round is complete.");
  const guess = integer(parsedAction.guess, "Football Wavelength guess", 1, 100);
  const nextGuesses = [...guesses, guess];
  const clueIds = stringArray(
    context.submissionState.clue_ids ?? [String(context.privateSetupEvidence.opening_clue_id ?? "")],
    "Football Wavelength clues",
  );
  let nextClueIds = [...clueIds];
  if (nextGuesses.length < 4) {
    const round = { target, clues: clueIds.map(clueFor) };
    const clue = nextFootballWavelengthClue(round, guess, nextGuesses.length, seed, guesses);
    nextClueIds = [...nextClueIds, clue.id];
  }
  const complete = nextGuesses.length === 4;
  const finalSubmission = complete ? { guesses: nextGuesses } : null;
  return {
    submissionState: { guesses: nextGuesses, clue_ids: nextClueIds, final_submission: finalSubmission },
    publicState: {
      complete,
      guesses: nextGuesses,
      clues: nextClueIds.map((id) => cluePresentation(clueFor(id))),
      next_guess_number: complete ? null : nextGuesses.length + 1,
      reveal: complete ? {
        target,
        clues: nextClueIds.map((id) => ({ ...cluePresentation(clueFor(id)), rating: clueFor(id).rating })),
      } : null,
    },
    complete,
    finalSubmission,
  };
}

export function scoreFootballWavelengthTwoGameChild(
  context: OfficialDailyRuntimeContext,
  advanced: OfficialDailyAdvanceResult,
) {
  const guesses = Array.isArray(advanced.submissionState.guesses)
    ? advanced.submissionState.guesses.map(Number)
    : [];
  const finalGuess = guesses.at(-1);
  const target = Number(context.privateSetupEvidence.target);
  if (!Number.isFinite(finalGuess) || !Number.isFinite(target)) {
    throw new Error("Football two-game Wavelength score evidence is unavailable.");
  }
  return wavelengthScore(Number(finalGuess), target);
}

export function advanceFootballWavelengthDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  if (context.gameType !== "wavelength") {
    throw new Error("Wavelength-only advance runtime received another game type.");
  }
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(context, action, advanceFootballWavelengthRound, scoreFootballWavelengthTwoGameChild)
    : advanceFootballWavelengthRound(context, action);
}
