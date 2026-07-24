import type { PlayGameId } from "../play/playRegistry";

export type ChallengeJson =
  | null
  | boolean
  | number
  | string
  | ChallengeJson[]
  | { [key: string]: ChallengeJson };

export interface ChallengeProfile {
  id: string;
  displayName: string;
  initials: string;
}

export interface PlayChallenge {
  code: string;
  gameId: PlayGameId;
  gameVersion: string;
  gameTitle: string;
  summary: string;
  creatorId: string;
  recipientId: string;
  setup: ChallengeJson;
  creatorResult: ChallengeJson;
  responderResult: ChallengeJson | null;
  createdAt: string;
  openedAt: string | null;
  completedAt: string | null;
  expiresAt: string;
}

export type ChallengeDirection = "sent" | "received";
export type ChallengeStatus = "new" | "waiting" | "opened" | "completed";

export interface CreatePlayChallengeInput {
  code?: string;
  gameId: PlayGameId;
  gameVersion: string;
  gameTitle: string;
  summary: string;
  creatorId: string;
  recipientId: string;
  setup: ChallengeJson;
  creatorResult: ChallengeJson;
  now?: Date;
  expiresInDays?: number;
}

export const CHALLENGE_TEST_PROFILES: readonly ChallengeProfile[] = [
  { id: "cody-preview", displayName: "Cody", initials: "CK" },
  { id: "shane-preview", displayName: "Shane", initials: "SH" },
];

function cleanCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

function generatedCode() {
  const source = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "")
    : `${Date.now()}${Math.random().toString(36).slice(2)}`;
  return cleanCode(source).slice(0, 8);
}

export function createPlayChallenge(input: CreatePlayChallengeInput): PlayChallenge {
  const now = input.now ?? new Date();
  const expiresAt = new Date(now);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + (input.expiresInDays ?? 30));

  return {
    code: cleanCode(input.code ?? generatedCode()),
    gameId: input.gameId,
    gameVersion: input.gameVersion,
    gameTitle: input.gameTitle,
    summary: input.summary,
    creatorId: input.creatorId,
    recipientId: input.recipientId,
    setup: input.setup,
    creatorResult: input.creatorResult,
    responderResult: null,
    createdAt: now.toISOString(),
    openedAt: null,
    completedAt: null,
    expiresAt: expiresAt.toISOString(),
  };
}

export function challengeDirection(challenge: PlayChallenge, profileId: string): ChallengeDirection | null {
  if (challenge.creatorId === profileId) return "sent";
  if (challenge.recipientId === profileId) return "received";
  return null;
}

export function challengeStatus(challenge: PlayChallenge, profileId: string): ChallengeStatus {
  if (challenge.completedAt && challenge.responderResult !== null) return "completed";
  const direction = challengeDirection(challenge, profileId);
  if (direction === "sent") return challenge.openedAt ? "opened" : "waiting";
  return challenge.openedAt ? "opened" : "new";
}

export function markChallengeOpened(challenge: PlayChallenge, profileId: string, now = new Date()): PlayChallenge {
  if (challenge.recipientId !== profileId || challenge.openedAt || challenge.completedAt) return challenge;
  return { ...challenge, openedAt: now.toISOString() };
}

export function submitChallengeResult(
  challenge: PlayChallenge,
  profileId: string,
  result: ChallengeJson,
  now = new Date(),
): PlayChallenge {
  if (challenge.recipientId !== profileId || challenge.completedAt) return challenge;
  return {
    ...challenge,
    openedAt: challenge.openedAt ?? now.toISOString(),
    responderResult: result,
    completedAt: now.toISOString(),
  };
}

export function canViewChallengeResults(challenge: PlayChallenge, profileId: string) {
  return Boolean(
    challenge.completedAt
      && challenge.responderResult !== null
      && challengeDirection(challenge, profileId),
  );
}

export function challengeCounterpartId(challenge: PlayChallenge, profileId: string) {
  const direction = challengeDirection(challenge, profileId);
  if (direction === "sent") return challenge.recipientId;
  if (direction === "received") return challenge.creatorId;
  return null;
}

export function resultScore(result: ChallengeJson): number | null {
  if (!result || Array.isArray(result) || typeof result !== "object") return null;
  const value = result.score;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
