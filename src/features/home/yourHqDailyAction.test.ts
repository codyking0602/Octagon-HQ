import { describe, expect, it } from "vitest";
import { buildYourHqNextAction } from "./yourHqModel";

describe("Your HQ official daily action", () => {
  it("opens the active backend-selected game instead of hard-coding Find the Leader", () => {
    expect(buildYourHqNextAction({
      openChallenges: [],
      profiles: [],
      profileId: "profile-one",
      playedToday: false,
      currentStreak: 4,
      dailyChallengeTitle: "Blind Resume",
      dailyChallengeRoute: "/play/blind-resume?mode=daily",
    })).toEqual({
      title: "Keep your 4-day streak alive",
      description: "Blind Resume is ready.",
      label: "PLAY TODAY’S CHALLENGE",
      to: "/play/blind-resume?mode=daily",
    });
  });

  it("falls back to the shared Play hub while the official identity is loading", () => {
    expect(buildYourHqNextAction({
      openChallenges: [],
      profiles: [],
      profileId: "profile-one",
      playedToday: false,
      currentStreak: 0,
    })).toMatchObject({
      description: "Today’s Challenge is ready.",
      to: "/play",
    });
  });
});
