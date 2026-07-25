import { describe, expect, it } from "vitest";
import {
  canViewChallengeResults,
  challengeDirection,
  challengeStatus,
  createPlayChallenge,
  dismissChallenge,
  markChallengeOpened,
  submitChallengeResult,
} from "./challengeModel";

function challengeInput() {
  return {
    code: "TEST1234",
    gameId: "find-leader" as const,
    gameVersion: "find-leader-v2",
    gameTitle: "Find the Leader",
    summary: "Who has the most UFC wins?",
    creatorId: "cody-profile",
    recipientId: "shane-profile",
    playUrl: "https://example.test/play/find-leader?day=2026-07-24",
    setup: { day: "2026-07-24" },
    creatorResult: { score: 8 },
    now: new Date("2026-07-24T12:00:00Z"),
  };
}

describe("Play challenge domain", () => {
  it("keeps the sender result locked until the recipient completes the exact challenge", () => {
    const created = createPlayChallenge(challengeInput());

    expect(challengeDirection(created, "cody-profile")).toBe("sent");
    expect(challengeDirection(created, "shane-profile")).toBe("received");
    expect(challengeStatus(created, "cody-profile")).toBe("waiting");
    expect(challengeStatus(created, "shane-profile")).toBe("new");
    expect(canViewChallengeResults(created, "cody-profile")).toBe(false);
    expect(canViewChallengeResults(created, "shane-profile")).toBe(false);

    const opened = markChallengeOpened(created, "shane-profile", new Date("2026-07-24T12:05:00Z"));
    expect(challengeStatus(opened, "cody-profile")).toBe("opened");
    expect(challengeStatus(opened, "shane-profile")).toBe("opened");
    expect(canViewChallengeResults(opened, "cody-profile")).toBe(false);

    const completed = submitChallengeResult(opened, "shane-profile", { score: 9 }, new Date("2026-07-24T12:10:00Z"));
    expect(challengeStatus(completed, "cody-profile")).toBe("completed");
    expect(challengeStatus(completed, "shane-profile")).toBe("completed");
    expect(canViewChallengeResults(completed, "cody-profile")).toBe(true);
    expect(canViewChallengeResults(completed, "shane-profile")).toBe(true);
  });

  it("lets the recipient decline an unplayed challenge without deleting the sender's history", () => {
    const created = createPlayChallenge(challengeInput());
    const ignored = dismissChallenge(created, "shane-profile", new Date("2026-07-24T12:05:00Z"));

    expect(ignored.declinedAt).toBe("2026-07-24T12:05:00.000Z");
    expect(ignored.hiddenFor).toEqual(["shane-profile"]);
    expect(challengeStatus(ignored, "cody-profile")).toBe("declined");
  });

  it("does not let the sender open or complete the recipient side", () => {
    const created = createPlayChallenge(challengeInput());
    const senderOpened = markChallengeOpened(created, "cody-profile", new Date("2026-07-24T12:05:00Z"));
    const senderCompleted = submitChallengeResult(created, "cody-profile", { score: 10 }, new Date("2026-07-24T12:10:00Z"));

    expect(senderOpened).toEqual(created);
    expect(senderCompleted).toEqual(created);
  });
});
