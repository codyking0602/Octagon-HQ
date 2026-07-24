import {
  createWavelengthRound,
  nextWavelengthClue,
  type WavelengthClue,
  type WavelengthRound,
} from "./wavelengthEngine";

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function createWavelengthSeed() {
  const random = Math.floor(Math.random() * 0xffffffff).toString(36);
  return `${Date.now().toString(36)}-${random}`;
}

export function createChallengeWavelengthRound(seed: string): WavelengthRound {
  return createWavelengthRound(0, mulberry32(hashSeed(`round|${seed}`)));
}

export function nextChallengeWavelengthClue(
  round: WavelengthRound,
  lastGuess: number,
  nextClueIndex: number,
  seed: string,
  guesses: readonly number[],
): WavelengthClue {
  const path = [...guesses, lastGuess].join("-");
  return nextWavelengthClue(
    round,
    lastGuess,
    nextClueIndex,
    mulberry32(hashSeed(`clue|${seed}|${nextClueIndex}|${path}`)),
  );
}

export function wavelengthChallengeUrl(seed: string) {
  const url = new URL("/play/wavelength", window.location.origin);
  url.searchParams.set("challenge", seed);
  return url.toString();
}
