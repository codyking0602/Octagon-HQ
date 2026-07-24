import {
  createPlayChallenge,
  markChallengeOpened,
  submitChallengeResult,
  type ChallengeJson,
  type CreatePlayChallengeInput,
  type PlayChallenge,
} from "./challengeModel";

export const CHALLENGE_STORAGE_KEY = "octagon-hq:play-challenges:v1";

export interface ChallengeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function validRows(value: unknown): PlayChallenge[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is PlayChallenge => Boolean(
    row
      && typeof row === "object"
      && typeof row.code === "string"
      && typeof row.creatorId === "string"
      && typeof row.recipientId === "string"
      && typeof row.gameId === "string",
  ));
}

export function loadChallenges(storage: ChallengeStorage): PlayChallenge[] {
  try {
    const raw = storage.getItem(CHALLENGE_STORAGE_KEY);
    return raw ? validRows(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function saveChallenges(storage: ChallengeStorage, rows: readonly PlayChallenge[]) {
  storage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(rows));
}

export function addChallenge(
  rows: readonly PlayChallenge[],
  input: CreatePlayChallengeInput,
): { rows: PlayChallenge[]; challenge: PlayChallenge } {
  const challenge = createPlayChallenge(input);
  return { rows: [challenge, ...rows], challenge };
}

export function openChallengeRow(
  rows: readonly PlayChallenge[],
  code: string,
  profileId: string,
  now = new Date(),
): PlayChallenge[] {
  return rows.map((row) => row.code === code ? markChallengeOpened(row, profileId, now) : row);
}

export function completeChallengeRow(
  rows: readonly PlayChallenge[],
  code: string,
  profileId: string,
  result: ChallengeJson,
  now = new Date(),
): PlayChallenge[] {
  return rows.map((row) => row.code === code ? submitChallengeResult(row, profileId, result, now) : row);
}

export function challengesForProfile(rows: readonly PlayChallenge[], profileId: string) {
  return rows
    .filter((row) => row.creatorId === profileId || row.recipientId === profileId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
