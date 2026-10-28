import { describe, expect, it } from "vitest";
import {
  challengeResultScoreLabel,
  challengeResultVerdict,
} from "../challenges/ChallengeResultDetails";
import type { PlayChallenge } from "../challenges/challengeModel";

function challenge(
  creatorResult: PlayChallenge["creatorResult"],
  responderResult: PlayChallenge["responderResult"],
): PlayChallenge {
  return {
    code: "HL1234",
    gameId: "higher-lower",
    gameVersion: "football-higher-lower-v1",
    gameTitle: "Football Higher or Lower",
    summary: "NFL · 8/10",
    creatorId: "creator",
    recipientId: "responder",
    playUrl: "https://octagon.hq-app.workers.dev/football/higher-lower",
    setup: {},
    creatorResult,
    responderResult,
    openedAt: "2026-10-05T00:00:00.000Z",
    completedAt: responderResult ? "2026-10-05T00:01:00.000Z" : null,
    declinedAt: null,
    createdAt: "2026-10-05T00:00:00.000Z",
  } as PlayChallenge;
}

describe("Football Higher or Lower challenge scoring", () => {
  it("always puts accuracy ahead of speed", () => {
    const row = challenge(
      { score: 8, correct: 8, timeMs: 62000 },
      { score: 7, correct: 7, timeMs: 21000 },
    );
    expect(challengeResultVerdict(row, "Cody", "Shane")).toBe("Cody wins");
  });

  it("uses completion time only when accuracy is tied", () => {
    const row = challenge(
      { score: 8, correct: 8, timeMs: 38400 },
      { score: 8, correct: 8, timeMs: 43700 },
    );
    expect(challengeResultVerdict(row, "Cody", "Shane")).toBe("Cody wins on time");
    expect(challengeResultScoreLabel(row, row.creatorResult)).toBe("8/10 · 38.4s");
    expect(challengeResultScoreLabel(row, row.responderResult!)).toBe("8/10 · 43.7s");
  });

  it("keeps a true tie when both accuracy and time match", () => {
    const row = challenge(
      { score: 10, correct: 10, timeMs: 30000 },
      { score: 10, correct: 10, timeMs: 30000 },
    );
    expect(challengeResultVerdict(row, "Cody", "Shane")).toBe("Tie game");
  });
});
