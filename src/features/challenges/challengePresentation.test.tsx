import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { challengeRoute } from "./ChallengeCenter";
import { ChallengeResultDetails } from "./ChallengeResultDetails";
import { createPlayChallenge, type PlayChallenge } from "./challengeModel";

function completedChallenge(overrides: Partial<PlayChallenge>): PlayChallenge {
  return {
    ...createPlayChallenge({
      code: "COMPARE1",
      gameId: "find-leader",
      gameVersion: "test-v1",
      gameTitle: "Test Game",
      summary: "Same exact setup",
      creatorId: "cody-preview",
      recipientId: "shane-preview",
      setup: {},
      creatorResult: { score: 8 },
      now: new Date("2026-07-24T12:00:00Z"),
    }),
    openedAt: "2026-07-24T12:05:00.000Z",
    completedAt: "2026-07-24T12:10:00.000Z",
    responderResult: { score: 9 },
    ...overrides,
  };
}

describe("Challenge Center game adapters", () => {
  it("routes every game back to its profile challenge owner", () => {
    expect(challengeRoute(completedChallenge({ gameId: "find-leader", setup: { day: "2026-07-24" } })))
      .toBe("/play/find-leader?challenge=COMPARE1&day=2026-07-24");
    expect(challengeRoute(completedChallenge({ gameId: "wavelength" })))
      .toBe("/play/wavelength?profileChallenge=COMPARE1");
    expect(challengeRoute(completedChallenge({ gameId: "blind-resume" })))
      .toBe("/play/blind-resume?profileChallenge=COMPARE1");
    expect(challengeRoute(completedChallenge({ gameId: "blind-rank" })))
      .toBe("/play/blind-rank?profileChallenge=COMPARE1");
    expect(challengeRoute(completedChallenge({ gameId: "keep-cut" })))
      .toBe("/play/keep-cut?profileChallenge=COMPARE1");
    expect(challengeRoute(completedChallenge({ gameId: "better-than" })))
      .toBe("/play/better-than?profileChallenge=COMPARE1");
  });

  it("compares exact Blind Rank slots", () => {
    const challenge = completedChallenge({
      gameId: "blind-rank",
      creatorResult: { placements: ["a", "b", "c", "d", "e"] },
      responderResult: { placements: ["a", "c", "b", "d", "e"] },
    });
    const { container } = render(<ChallengeResultDetails challenge={challenge} />);
    expect(container.textContent).toContain("EXACT SLOT MATCHES");
    expect(container.textContent).toContain("3/5");
  });

  it("compares matching and split Keep Cut calls", () => {
    const challenge = completedChallenge({
      gameId: "keep-cut",
      setup: { lineupIds: ["a", "b", "c", "d", "e", "f", "g", "h"] },
      creatorResult: { keptIds: ["a", "b", "c", "d"] },
      responderResult: { keptIds: ["a", "b", "e", "f"] },
    });
    const { container } = render(<ChallengeResultDetails challenge={challenge} />);
    expect(container.textContent).toContain("SAME CALLS");
    expect(container.textContent).toContain("4/8");
    expect(container.textContent).toContain("SPLIT DECISIONS");
  });

  it("compares Better Than list overlap without declaring an official winner", () => {
    const challenge = completedChallenge({
      gameId: "better-than",
      creatorResult: { selectionIds: ["a", "b", "c", "d"] },
      responderResult: { selectionIds: ["a", "b", "e", "f"] },
    });
    const { container } = render(<ChallengeResultDetails challenge={challenge} />);
    expect(container.textContent).toContain("LIST OVERLAP");
    expect(container.textContent).toContain("50%");
    expect(container.textContent).toContain("SHARED NAMES");
  });
});
