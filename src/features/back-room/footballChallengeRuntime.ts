import type { ChallengeJson } from "../challenges/challengeModel";
import {
  curatedLineupIdentity,
  rememberLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";

export function challengeRecord(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

export function challengeStrings(value: ChallengeJson | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function challengeString(value: ChallengeJson | undefined) {
  return typeof value === "string" ? value : null;
}

export function asChallengeJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

export function footballChallengeUrl(route: string, params: Record<string, string>) {
  const url = new URL(route, window.location.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

export function footballCuratedIdentity(
  gameId: string,
  challengeId: string,
  itemIds: readonly string[],
  scopeId = "football-challenge",
  fighterIds: readonly string[] = [],
): PlayLineupIdentity {
  const identity = curatedLineupIdentity(gameId, challengeId, itemIds, scopeId);
  rememberLineup(identity, itemIds, fighterIds);
  return identity;
}
