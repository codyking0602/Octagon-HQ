import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { PlayGameId } from "../play/playRegistry";
import { usePlayChallenges } from "./ChallengeProvider";
import type { PlayChallenge } from "./challengeModel";

export const PLAY_ROUTE_BY_GAME: Partial<Record<PlayGameId, string>> = {
  "find-leader": "/play/find-leader",
  wavelength: "/play/wavelength",
  "blind-resume": "/play/blind-resume",
  "blind-rank": "/play/blind-rank",
  "keep-cut": "/play/keep-cut",
  auction: "/play/auction",
  "hit-the-number": "/play/hit-the-number",
};

function challengeCodeFromSearch(search: string, gameId: PlayGameId) {
  const params = new URLSearchParams(search);
  const value = params.get("match")
    ?? (gameId === "find-leader" ? params.get("challenge") : null)
    ?? "";
  return /^[a-z0-9]{4,12}$/i.test(value) ? value.toUpperCase() : "";
}

export function challengePlayRoute(challenge: PlayChallenge) {
  const canonicalRoute = PLAY_ROUTE_BY_GAME[challenge.gameId];
  if (!canonicalRoute) return "/play";

  if (challenge.playUrl) {
    try {
      const url = new URL(challenge.playUrl, typeof window === "undefined" ? "https://octagon.invalid" : window.location.origin);
      url.searchParams.set(challenge.gameId === "find-leader" ? "challenge" : "match", challenge.code);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      // Fall back to the canonical route below.
    }
  }

  const params = new URLSearchParams({
    [challenge.gameId === "find-leader" ? "challenge" : "match"]: challenge.code,
  });
  return `${canonicalRoute}?${params.toString()}`;
}

export function useProfileChallengeMatch(gameId: PlayGameId) {
  const location = useLocation();
  const {
    activeProfile,
    profiles,
    getChallenge,
    markOpened,
    submitResult,
  } = usePlayChallenges();
  const code = useMemo(() => challengeCodeFromSearch(location.search, gameId), [gameId, location.search]);
  const candidate = code ? getChallenge(code) : null;
  const challenge = candidate?.gameId === gameId ? candidate : null;
  const creator = challenge
    ? profiles.find((profile) => profile.id === challenge.creatorId) ?? null
    : null;
  const isRecipient = Boolean(challenge && activeProfile?.id === challenge.recipientId);

  useEffect(() => {
    if (
      challenge
      && isRecipient
      && !challenge.openedAt
      && !challenge.completedAt
      && !challenge.declinedAt
    ) {
      markOpened(challenge.code);
    }
  }, [challenge, isRecipient, markOpened]);

  return {
    code,
    challenge,
    creator,
    isRecipient,
    activeProfile,
    submitResult: (result: Parameters<typeof submitResult>[1]) => {
      if (challenge && isRecipient && challenge.responderResult === null) {
        submitResult(challenge.code, result);
      }
    },
  };
}
