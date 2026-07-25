import {
  challengeDirection,
  challengeStatus,
  type PlayChallenge,
} from "../challenges/challengeModel";

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
