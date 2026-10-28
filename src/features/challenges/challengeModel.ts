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
  avatarPhotoData?: string | null;
}

export interface PlayChallenge {
  code: string;
  gameId: PlayGameId;
  gameVersion: string;
  gameTitle: string;
  summary: string;
  creatorId: string;
  recipientId: string;
  playUrl: string;
  setup: ChallengeJson;
  creatorResult: ChallengeJson;
  responderResult: ChallengeJson | null;
  createdAt: string;
  openedAt: string | null;
  completedAt: string | null;
  declinedAt: string | null;
  expiresAt: string;
  hiddenFor: string[];
}

export type ChallengeDirection = "sent" | "received";
export type ChallengeStatus = "new" | "waiting" | "opened" | "completed" | "declined";

export interface CreatePlayChallengeInput {
  code?: string;
  gameId: PlayGameId;
  gameVersion: string;
  gameTitle: string;
  summary: string;
  creatorId: string;
  recipientId: string;
  playUrl: string;
  setup: ChallengeJson;
  creatorResult: ChallengeJson;
  now?: Date;
  expiresInDays?: number;
}

function cleanCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

function generatedCode() {
  const source = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "")
    : `${Date.now()}${Math.random().toString(36).slice(2)}`;
  return cleanCode(source).slice(0, 8);
}

function uniqueProfiles(values: readonly string[]) {
  return [...new Set(values.filter(Boolean))];
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
    playUrl: input.playUrl,
    setup: input.setup,
    creatorResult: input.creatorResult,
    responderResult: null,
    createdAt: now.toISOString(),
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    expiresAt: expiresAt.toISOString(),
    hiddenFor: [],
  };
}

export function challengeDirection(challenge: PlayChallenge, profileId: string): ChallengeDirection | null {
  if (challenge.creatorId === profileId) return "sent";
  if (challenge.recipientId === profileId) return "received";
  return null;
}

export function challengeStatus(challenge: PlayChallenge, profileId: string): ChallengeStatus {
  if (challenge.completedAt && challenge.responderResult !== null) return "completed";
  if (challenge.declinedAt) return "declined";
  const direction = challengeDirection(challenge, profileId);
  if (direction === "sent") return challenge.openedAt ? "opened" : "waiting";
  return challenge.openedAt ? "opened" : "new";
}

export function challengeIsHidden(challenge: PlayChallenge, profileId: string) {
  return challenge.hiddenFor.includes(profileId);
}

export function markChallengeOpened(challenge: PlayChallenge, profileId: string, now = new Date()): PlayChallenge {
  if (
    challenge.recipientId !== profileId
    || challenge.openedAt
    || challenge.completedAt
    || challenge.declinedAt
    || challengeIsHidden(challenge, profileId)
  ) return challenge;
  return { ...challenge, openedAt: now.toISOString() };
}

export function submitChallengeResult(
  challenge: PlayChallenge,
  profileId: string,
  result: ChallengeJson,
  now = new Date(),
): PlayChallenge {
  if (
    challenge.recipientId !== profileId
    || challenge.completedAt
    || challenge.declinedAt
    || challengeIsHidden(challenge, profileId)
  ) return challenge;
  return {
    ...challenge,
    openedAt: challenge.openedAt ?? now.toISOString(),
    responderResult: result,
    completedAt: now.toISOString(),
  };
}

export function dismissChallenge(
  challenge: PlayChallenge,
  profileId: string,
  now = new Date(),
): PlayChallenge {
  const direction = challengeDirection(challenge, profileId);
  if (!direction || challengeIsHidden(challenge, profileId)) return challenge;

  const ignoredBeforeCompletion = direction === "received"
    && challenge.responderResult === null
    && !challenge.completedAt;

  return {
    ...challenge,
    declinedAt: ignoredBeforeCompletion ? challenge.declinedAt ?? now.toISOString() : challenge.declinedAt,
    hiddenFor: uniqueProfiles([...challenge.hiddenFor, profileId]),
  };
}

export function canViewChallengeResults(challenge: PlayChallenge, profileId: string) {
  return Boolean(
    challenge.completedAt
      && challenge.responderResult !== null
      && challengeDirection(challenge, profileId)
      && !challengeIsHidden(challenge, profileId),
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
