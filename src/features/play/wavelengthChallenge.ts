import {
  createWavelengthRound,
  nextWavelengthClue,
  wavelengthClues,
  type WavelengthClue,
  type WavelengthRecentHistory,
  type WavelengthRound,
} from "./wavelengthEngine";
import {
  createReplaySeed,
  seededLineupRandom,
  type PlayLineupHistory,
} from "./lineupModel";

function record(value: unknown): Record<string, unknown> | null {
  return value && !Array.isArray(value) && typeof value === "object"
    ? value as Record<string, unknown>
    : null;
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

export function wavelengthRecentHistoryFromLineup(history: PlayLineupHistory): WavelengthRecentHistory {
  const targets: number[] = [];
  const clueIds: string[] = [];
  const clueSequenceKeys: string[] = [];

  for (const entry of history.entries) {
    for (const itemId of entry.itemIds) {
      if (itemId.startsWith("target:")) {
        const target = Number(itemId.slice("target:".length));
        if (Number.isInteger(target)) targets.push(target);
      } else if (itemId.startsWith("clue:")) {
        clueIds.push(itemId.slice("clue:".length));
      }
    }

    const result = record(entry.result);
    const wavelengthHistory = record(result?.wavelengthHistory);
    if (!wavelengthHistory) continue;
    if (typeof wavelengthHistory.target === "number" && Number.isInteger(wavelengthHistory.target)) {
      targets.push(wavelengthHistory.target);
    }
    if (Array.isArray(wavelengthHistory.clueIds)) {
      clueIds.push(...wavelengthHistory.clueIds.filter((id): id is string => typeof id === "string"));
    }
    if (typeof wavelengthHistory.sequenceKey === "string") {
      clueSequenceKeys.push(wavelengthHistory.sequenceKey);
    }
  }

  const canonicalClueIds = unique(clueIds).filter((id) => wavelengthClues.some((clue) => clue.id === id));
  return {
    targets: unique(targets),
    clueIds: canonicalClueIds,
    categories: unique(canonicalClueIds.flatMap((id) => {
      const clue = wavelengthClues.find((candidate) => candidate.id === id);
      return clue ? [clue.category] : [];
    })),
    clueSequenceKeys: unique(clueSequenceKeys),
  };
}

export function createWavelengthSeed() {
  return createReplaySeed("wavelength");
}

export function createChallengeWavelengthRound(
  seed: string,
  recent?: WavelengthRecentHistory,
): WavelengthRound {
  return createWavelengthRound({
    recent,
    random: seededLineupRandom("wavelength", "round", seed),
  });
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
