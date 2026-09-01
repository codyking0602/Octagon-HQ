import {
  challengeDirection,
  challengeStatus,
  type ChallengeProfile,
  type PlayChallenge,
} from "../challenges/challengeModel";
import { challengePlayRoute } from "../challenges/challengeRuntime";

export interface YourHqNextAction {
  title: string;
  description: string;
  label: string;
  to: string;
}

export function meaningfulOpenChallenges(
  challenges: readonly PlayChallenge[],
  profileId: string,
) {
  return challenges.filter((challenge) => {
    if (!challengeDirection(challenge, profileId)) return false;
    const status = challengeStatus(challenge, profileId);
    return status !== "completed" && status !== "declined";
  });
}

export function mostRelevantOpenChallenge(
  challenges: readonly PlayChallenge[],
  profileId: string,
) {
  const priorities = {
    "received:new": 0,
    "received:opened": 1,
    "sent:opened": 2,
    "sent:waiting": 3,
  } as const;

  return meaningfulOpenChallenges(challenges, profileId)
    .slice()
    .sort((left, right) => {
      const leftKey = `${challengeDirection(left, profileId)}:${challengeStatus(left, profileId)}` as keyof typeof priorities;
      const rightKey = `${challengeDirection(right, profileId)}:${challengeStatus(right, profileId)}` as keyof typeof priorities;
      return (priorities[leftKey] ?? 99) - (priorities[rightKey] ?? 99)
        || right.createdAt.localeCompare(left.createdAt);
    })[0] ?? null;
}

export function buildDirectChallengeAction({
  openChallenges,
  profiles,
  profileId,
}: {
  openChallenges: readonly PlayChallenge[];
  profiles: readonly ChallengeProfile[];
  profileId: string;
}): YourHqNextAction | null {
  const relevant = mostRelevantOpenChallenge(openChallenges, profileId);
  if (!relevant || challengeDirection(relevant, profileId) !== "received") return null;

  const sender = profiles.find((profile) => profile.id === relevant.creatorId);
  return {
    title: `${sender?.displayName ?? "A friend"} is waiting for your answer`,
    description: `${relevant.gameTitle} challenge is ready.`,
    label: "RESPOND TO CHALLENGE",
    to: challengePlayRoute(relevant),
  };
}

export function buildYourHqNextAction({
  openChallenges,
  profiles,
  profileId,
  playedToday,
  currentStreak,
  dailyChallengeTitle = "Today’s Challenge",
  dailyChallengeRoute = "/play",
}: {
  openChallenges: readonly PlayChallenge[];
  profiles: readonly ChallengeProfile[];
  profileId: string;
  playedToday: boolean;
  currentStreak: number;
  dailyChallengeTitle?: string;
  dailyChallengeRoute?: string;
}): YourHqNextAction {
  const directChallenge = buildDirectChallengeAction({ openChallenges, profiles, profileId });
  if (directChallenge) return directChallenge;

  if (openChallenges.length) {
    const count = openChallenges.length;
    return {
      title: `${count} open challenge${count === 1 ? "" : "s"}`,
      description: "See what is new, opened, or waiting.",
      label: "OPEN CHALLENGE CENTER",
      to: "/play#challenge-center",
    };
  }

  if (!playedToday) {
    return currentStreak > 0
      ? {
          title: `Keep your ${currentStreak}-day streak alive`,
          description: `${dailyChallengeTitle} is ready.`,
          label: "PLAY TODAY’S CHALLENGE",
          to: dailyChallengeRoute,
        }
      : {
          title: "Start today’s UFC challenge",
          description: `${dailyChallengeTitle} is ready.`,
          label: "PLAY TODAY’S CHALLENGE",
          to: dailyChallengeRoute,
        };
  }

  return {
    title: "Today’s challenge is complete",
    description: "Try another game or create a matchup for a friend.",
    label: "PLAY ANOTHER UFC GAME",
    to: "/play",
  };
}
