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

function spotlightDay(offset: number) {
  const epoch = Date.parse("2026-08-06T12:00:00Z");
  return new Date(epoch + offset * 86_400_000).toISOString().slice(0, 10);
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
    expect(action.label).toBe("PLAY TODAY’S CHALLENGE");
    expect(action.to).toBe("/play");
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
  it("stays fixed for the day without a refresh-time random choice", () => {
    const first = dailyRankingSpotlight(allTime, spotlightDay(0));
    const repeated = dailyRankingSpotlight(allTime, spotlightDay(0));
    const next = dailyRankingSpotlight(allTime, spotlightDay(1));

    expect(first?.slug).toBe(repeated?.slug);
    expect(next?.slug).not.toBe(first?.slug);
  });

  it("features Khamzat on August 15 and moves on the next day", () => {
    const featured = dailyRankingSpotlight(allTime, "2026-08-15");
    const next = dailyRankingSpotlight(allTime, "2026-08-16");

    expect(featured?.slug).toBe("khamzat-chimaev");
    expect(next?.slug).not.toBe("khamzat-chimaev");
  });

  it("randomizes the full roster without repeats before reshuffling", () => {
    const firstCycle = Array.from({ length: allTime.length }, (_, offset) =>
      dailyRankingSpotlight(allTime, spotlightDay(offset))?.slug,
    );
    const secondCycle = Array.from({ length: allTime.length }, (_, offset) =>
      dailyRankingSpotlight(allTime, spotlightDay(allTime.length + offset))?.slug,
    );
    const rankedOrder = allTime.map((fighter) => fighter.slug);

    expect(new Set(firstCycle).size).toBe(allTime.length);
    expect(new Set(firstCycle)).toEqual(new Set(rankedOrder));
    expect(firstCycle).not.toEqual(rankedOrder);
    expect(new Set(secondCycle).size).toBe(allTime.length);
    expect(new Set(secondCycle)).toEqual(new Set(rankedOrder));
    expect(secondCycle).not.toEqual(firstCycle);
    expect(secondCycle[0]).not.toBe(firstCycle.at(-1));
  });
});
