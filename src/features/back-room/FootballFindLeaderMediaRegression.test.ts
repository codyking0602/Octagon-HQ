import { describe, expect, it } from "vitest";
import { footballFindLeaderCandidateAsset } from "./FootballFindLeaderPage";
import { footballSubjectAsset } from "./footballSubjectAssets";

describe("Football Find the Leader media regression", () => {
  it("uses the shared Football subject media owner for NFL career players", () => {
    for (const [domainId, playerId] of [
      ["nfl-qb-career", "tom-brady"],
      ["nfl-rb-career", "emmitt-smith"],
    ] as const) {
      const sharedAsset = footballSubjectAsset(playerId);
      expect(sharedAsset, playerId).not.toBeNull();
      expect(footballFindLeaderCandidateAsset(domainId, playerId)).toBe(sharedAsset);
    }
  });
});
