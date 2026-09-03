import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footballPage = readFileSync("src/features/back-room/FootballFindLeaderPage.tsx", "utf8");
const footballModel = readFileSync("src/features/back-room/footballFindLeaderModel.ts", "utf8");
const footballDailyRuntime = readFileSync("src/features/play/footballTodayChallengeRuntime.ts", "utf8");
const ufcPage = readFileSync("src/features/play/PlayPage.tsx", "utf8");
const sourceAuthority = readFileSync("src/features/games/gameSourceAuthority.ts", "utf8");

describe("Find the Leader final parity and source contract", () => {
  it("keeps the mature UFC and Football interaction hierarchy aligned", () => {
    for (const source of [ufcPage, footballPage]) {
      expect(source).toContain("GameResultActions");
      expect(source).toContain("ROUND");
      expect(source).toContain("STANDING");
      expect(source).toContain("SAFE");
      expect(source).toContain("NEW LINEUP");
    }

    expect(ufcPage).toContain("Eliminate fighters until only the leader remains.");
    expect(footballPage).toContain("Eliminate nine decoys until only the leader remains.");
  });

  it("uses the exact canonical Football board version for replayable challenges", () => {
    expect(footballPage).toContain("gameVersion: board.version");
    expect(footballPage).not.toContain("football-find-leader-v1");
  });

  it("preserves the existing factual owners and daily Football board path", () => {
    expect(sourceAuthority).toContain('owners: ["ufc-factual-ledger"]');
    expect(sourceAuthority).toContain('owners: ["football-factual-registry"]');
    expect(ufcPage).toContain('from "./findLeaderEngine"');
    expect(footballModel).toContain('from "./footballFactualStats"');
    expect(footballModel).toContain('from "./footballSubjectRegistry"');
    expect(footballDailyRuntime).toContain("buildFootballFindLeaderBoard");
  });
});
