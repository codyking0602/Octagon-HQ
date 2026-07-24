import { describe, expect, it } from "vitest";
import {
  canViewChallengeResults,
  challengeDirection,
  challengeStatus,
  createPlayChallenge,
  markChallengeOpened,
  submitChallengeResult,
} from "./challengeModel";
import {
  addChallenge,
  challengesForProfile,
  completeChallengeRow,
  openChallengeRow,
} from "./challengeRepository";

describe("Play challenge domain", () => {
  it("keeps the sender result hidden until the recipient completes the exact challenge", () => {
    const created = createPlayChallenge({
      code: "TEST1234",
      gameId: "find-leader",
      gameVersion: "find-leader-v2",
      gameTitle: "Find the Leader",
      summary: "Who has the most UFC wins?",
      creatorId: "cody-preview",
      recipientId: "shane-preview",
      setup: { day: "2026-07-24" },
      creatorResult: { score: 8 },
      now: new Date("2026-07-24T12:00:00Z"),
    });

    expect(challengeDirection(created, "cody-preview")).toBe("sent");
    expect(challengeDirection(created, "shane-preview")).toBe("received");
    expect(challengeStatus(created, "cody-preview")).toBe("waiting");
    expect(challengeStatus(created, "shane-preview")).toBe("new");
    expect(canViewChallengeResults(created, "cody-preview")).toBe(false);
    expect(canViewChallengeResults(created, "shane-preview")).toBe(false);

    const opened = markChallengeOpened(created, "shane-preview", new Date("2026-07-24T12:05:00Z"));
    expect(challengeStatus(opened, "cody-preview")).toBe("opened");
    expect(challengeStatus(opened, "shane-preview")).toBe("opened");
    expect(canViewChallengeResults(opened, "cody-preview")).toBe(false);

    const completed = submitChallengeResult(opened, "shane-preview", { score: 9 }, new Date("2026-07-24T12:10:00Z"));
    expect(challengeStatus(completed, "cody-preview")).toBe("completed");
    expect(challengeStatus(completed, "shane-preview")).toBe("completed");
    expect(canViewChallengeResults(completed, "cody-preview")).toBe(true);
    expect(canViewChallengeResults(completed, "shane-preview")).toBe(true);
  });

  it("stores one shared row that appears in Sent for the creator and Received for the recipient", () => {
    const added = addChallenge([], {
      code: "CENTER01",
      gameId: "find-leader",
      gameVersion: "find-leader-v2",
      gameTitle: "Find the Leader",
      summary: "Who has the most UFC finishes?",
      creatorId: "cody-preview",
      recipientId: "shane-preview",
      setup: { day: "2026-07-24" },
      creatorResult: { score: 7 },
      now: new Date("2026-07-24T12:00:00Z"),
    });

    expect(challengesForProfile(added.rows, "cody-preview")).toHaveLength(1);
    expect(challengesForProfile(added.rows, "shane-preview")).toHaveLength(1);

    const opened = openChallengeRow(added.rows, "CENTER01", "shane-preview", new Date("2026-07-24T12:05:00Z"));
    expect(opened[0]?.openedAt).toBe("2026-07-24T12:05:00.000Z");

    const completed = completeChallengeRow(opened, "CENTER01", "shane-preview", { score: 10 }, new Date("2026-07-24T12:10:00Z"));
    expect(completed[0]?.completedAt).toBe("2026-07-24T12:10:00.000Z");
    expect(completed[0]?.responderResult).toEqual({ score: 10 });
  });
});
