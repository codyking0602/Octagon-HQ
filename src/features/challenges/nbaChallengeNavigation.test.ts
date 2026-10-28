import { describe, expect, it } from "vitest";
import { challengePlayRoute } from "./challengeRuntime";
import type { PlayChallenge } from "./challengeModel";

function nbaChallenge(gameId: PlayChallenge["gameId"], gameVersion: string, playUrl: string): PlayChallenge {
  return {
    code: "ABC123", gameId, gameVersion, playUrl, gameTitle: gameId,
    summary: "", creatorId: "test-creator", recipientId: "test-recipient",
    setup: {}, creatorResult: {}, responderResult: null,
    createdAt: "2026-10-23T00:00:00.000Z", expiresAt: "2026-11-23T00:00:00.000Z",
    openedAt: null, completedAt: null, declinedAt: null, hiddenFor: [],
  };
}

describe("NBA matchup navigation", () => {
  it("opens the same NBA Hit the Number seed, never redirects into UFC", () => {
    const match = nbaChallenge("hit-the-number", "nba-hit-the-number-v1", "/nba/hit-the-number?seed=original");
    expect(challengePlayRoute(match)).toBe("/nba/hit-the-number?seed=original&match=ABC123");
  });

  it("preserves all existing NBA matchup routes", () => {
    expect(challengePlayRoute(nbaChallenge("who-am-i", "nba-who-am-i-v1", "/nba/who-am-i")))
      .toBe("/nba/who-am-i?match=ABC123");
    expect(challengePlayRoute(nbaChallenge("find-leader", "nba-find-leader-v1", "/nba/find-the-leader")))
      .toBe("/nba/find-the-leader?challenge=ABC123");
    expect(challengePlayRoute(nbaChallenge("higher-lower", "nba-higher-lower-v1", "/nba/higher-lower")))
      .toBe("/nba/higher-lower?match=ABC123");
  });
});
