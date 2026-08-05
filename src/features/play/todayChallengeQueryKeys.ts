export const todayChallengeRuntimeQueryKey = (profileId: string) => [
  "today-challenge-runtime",
  profileId,
] as const;

export const todayChallengeHistoryQueryKey = (profileId: string) => [
  "today-challenge-history",
  profileId,
] as const;

export const todayChallengeStreakQueryKey = (profileId: string) => [
  "today-challenge-streak",
  profileId,
] as const;

export const todayChallengeLeaderboardQueryKey = (
  profileId: string,
  day: string,
  scheduleVersion: string,
) => [
  "today-challenge-leaderboard",
  profileId,
  day,
  scheduleVersion,
] as const;
