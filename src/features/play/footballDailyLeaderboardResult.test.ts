import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const hub = readFileSync("src/features/play/TodayChallengeHub.tsx", "utf8");
const footballDaily = readFileSync(
  "src/features/back-room/FootballTodayChallengePage.tsx",
  "utf8",
);

describe("Football Daily leaderboard result renderer", () => {
  it("uses the Football result presentation instead of the UFC official renderer", () => {
    expect(hub).toContain("FootballTodayChallengeResult");
    expect(hub).toContain('sport === "football"');
    expect(hub).toContain("<FootballTodayChallengeResult projection={resultProjection} />");
    expect(hub).toContain("sport={sport}");
  });

  it("covers every Football Daily game type, including Hit the Number", () => {
    expect(footballDaily).toContain("export function FootballTodayChallengeResult");
    for (const gameType of [
      "find_leader",
      "blind_resume",
      "wavelength",
      "blind_rank_5",
      "keep_4_cut_4",
      "hit_the_number",
      "who_am_i",
    ]) {
      expect(footballDaily).toContain(`case "${gameType}":`);
    }
    expect(footballDaily).toContain(
      "return <HitTheNumber projection={projection} advance={advance} />",
    );
  });
});
