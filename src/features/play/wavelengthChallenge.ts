import {
  createWavelengthRound,
  nextWavelengthClue,
  type WavelengthClue,
  type WavelengthRecentHistory,
  type WavelengthRound,
} from "./wavelengthEngine";
import { createReplaySeed, seededLineupRandom } from "./lineupModel";

export function createWavelengthSeed() {
  return createReplaySeed("wavelength");
}

export function createChallengeWavelengthRound(seed: string): WavelengthRound {
  return createWavelengthRound(0, seededLineupRandom("wavelength", "round", seed));
}

export function nextChallengeWavelengthClue(
  round: WavelengthRound,
  lastGuess: number,
  nextClueIndex: number,
  seed: string,
  guesses: readonly number[],
  recent?: WavelengthRecentHistory,
): WavelengthClue {
  const path = [...guesses, lastGuess].join("-");
  return nextWavelengthClue(
    round,
    lastGuess,
    nextClueIndex,
    seededLineupRandom("wavelength", "clue", seed, nextClueIndex, path),
    recent,
  );
}

export function wavelengthChallengeUrl(seed: string) {
  const url = new URL("/play/wavelength", window.location.origin);
  url.searchParams.set("challenge", seed);
  return url.toString();
}
