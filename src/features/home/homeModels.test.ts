import { describe, expect, it } from "vitest";
import type { ChallengeProfile, PlayChallenge } from "../challenges/challengeModel";
import { allTime } from "../rankings/rankingModel";
import { dailyRankingSpotlight } from "./homeSpotlightModel";
import { buildYourHqNextAction } from "./yourHqModel";

const cody: ChallengeProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const shane: ChallengeProfile = {
  id: "22222222-2222-4222-8222-222222222222",
  displayName: "SHANE",
  initials: "SH",
};

function challenge(overrides: Partial<PlayChallenge> = {}): PlayChallenge {
  return {
    code: "MATCH123",
    gameId: "find-leader",
    gameVersion: "find-leader-v2",
    gameTitle: "Find the Leader",
    summary: "Who has the most UFC wins?",
    creatorId: shane.id,
    recipientId: cody.id,
    playUrl: "https://octagon.test/play/find-leader?day=2026-07-25",
    setup: { day: "2026-07-25" },
    creatorResult: { score: 8 },
    responderResult: null,
    createdAt: "2026-07-25T12:00:00.000Z",
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-08-24T12:00:00.000Z",
    hiddenFor: [],
    ...overrides,
  };
}

describe("Your HQ next action", () => {
  it("prioritizes a received challenge over every other Home action", () => {
    const action = buildYourHqNextAction({
      openChallenges: [
        challenge(),
        challenge({
          code: "SENT123",
          creatorId: cody.id,
          recipientId: shane.id,
          createdAt: "2026-07-25T13:00:00.000Z",
        }),
      ],
      profiles: [cody, shane],
      profileId: cody.id,
      playedToday: false,
      currentStreak: 8,
    });

    expect(action.title).toBe("SHANE is waiting for your answer");
    expect(action.label).toBe("RESPOND TO CHALLENGE");
    expect(action.to).toContain("challenge=MATCH123");
  });

  it("routes other open challenges to the existing Challenge Center", () => {
    const action = buildYourHqNextAction({
      openChallenges: [challenge({ creatorId: cody.id, recipientId: shane.id })],
      profiles: [cody, shane],
      profileId: cody.id,
      playedToday: false,
      currentStreak: 4,
    });

    expect(action.title).toBe("1 open challenge");
    expect(action.to).toBe("/play#challenge-center");
  });

  it("protects the daily streak when no challenge needs attention", () => {
    const action = buildYourHqNextAction({
      openChallenges: [],
      profiles: [cody],
      profileId: cody.id,
      playedToday: false,
      currentStreak: 4,
    });

    expect(action.title).toBe("Keep your 4-day streak alive");
    expect(action.label).toBe("PLAY TODAY’S FIND THE LEADER");
    expect(action.to).toBe("/play/find-leader");
  });

  it("moves to another game after today's challenge is complete", () => {
    const action = buildYourHqNextAction({
      openChallenges: [],
      profiles: [cody],
      profileId: cody.id,
      playedToday: true,
      currentStreak: 4,
    });

    expect(action.title).toBe("Today’s challenge is complete");
    expect(action.to).toBe("/play");
  });
});

describe("daily Ranking Spotlight", () => {
  it("stays fixed for the day and advances without a refresh-time random choice", () => {
    const first = dailyRankingSpotlight(allTime, "2026-07-25");
    const repeated = dailyRankingSpotlight(allTime, "2026-07-25");
    const next = dailyRankingSpotlight(allTime, "2026-07-26");

    expect(first?.slug).toBe(repeated?.slug);
    expect(next?.slug).not.toBe(first?.slug);
  });
});
