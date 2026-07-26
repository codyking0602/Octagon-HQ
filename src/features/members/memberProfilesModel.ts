import {
  challengeDirection,
  challengeStatus,
  type ChallengeProfile,
  type PlayChallenge,
} from "../challenges/challengeModel";

export interface MemberCardSummary {
  displayName: string;
  initials: string;
  favoriteFighterSlug: string | null;
  currentStreak: number;
  picksCorrect: number;
  picksIncorrect: number;
  isCurrentUser: boolean;
}

export interface MemberProfileSummary extends MemberCardSummary {
  bestStreak: number;
  perfectRuns: number;
  recordedDays: number;
  bestFindLeaderScore: number;
  picksPending: number;
  picksEventsEntered: number;
}

export interface MemberChallengeSummary {
  open: number;
  completed: number;
  sent: number;
  received: number;
}

export function normalizeMemberName(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function memberProfilePath(displayName: string) {
  return `/members/${encodeURIComponent(normalizeMemberName(displayName))}`;
}

export function memberProfileByName(
  profiles: readonly ChallengeProfile[],
  displayName: string,
) {
  const normalized = normalizeMemberName(displayName);
  return profiles.find((profile) => normalizeMemberName(profile.displayName) === normalized) ?? null;
}

export function challengesSharedWithMember(
  challenges: readonly PlayChallenge[],
  profiles: readonly ChallengeProfile[],
  activeProfileId: string,
  memberDisplayName: string,
) {
  const member = memberProfileByName(profiles, memberDisplayName);
  if (!member || member.id === activeProfileId) return [];

  return challenges
    .filter((challenge) => (
      (challenge.creatorId === activeProfileId && challenge.recipientId === member.id)
      || (challenge.recipientId === activeProfileId && challenge.creatorId === member.id)
    ))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function summarizeMemberChallenges(
  challenges: readonly PlayChallenge[],
  activeProfileId: string,
): MemberChallengeSummary {
  return challenges.reduce<MemberChallengeSummary>((summary, challenge) => {
    const direction = challengeDirection(challenge, activeProfileId);
    if (!direction) return summary;
    const status = challengeStatus(challenge, activeProfileId);
    if (direction === "sent") summary.sent += 1;
    if (direction === "received") summary.received += 1;
    if (status === "completed") summary.completed += 1;
    if (status !== "completed" && status !== "declined") summary.open += 1;
    return summary;
  }, { open: 0, completed: 0, sent: 0, received: 0 });
}

export function challengeIsComparisonOnly(challenge: PlayChallenge) {
  return challenge.gameId === "blind-rank"
    || challenge.gameId === "keep-cut"
    || challenge.gameId === "better-than";
}
