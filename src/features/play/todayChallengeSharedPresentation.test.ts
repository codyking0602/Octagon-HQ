import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const hub = readFileSync("src/features/play/TodayChallengeHub.tsx", "utf8");
const css = readFileSync("src/styles/today-challenge-hub.css", "utf8");
const footballPlay = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");

describe("Stage 11 shared Daily presentation polish", () => {
  it("renders one compact rank-name-score leaderboard for both sports without an inner scroller", () => {
    expect(hub).toContain('className="today-hub-leaderboard__rows"');
    expect(hub).toContain("<b>#{entry.rank}</b>");
    expect(hub).toContain("<strong>{entry.displayName}</strong>");
    expect(hub).toContain("<small>{entry.normalizedScore}</small>");
    expect(hub).not.toContain("<LeaderboardAvatar");

    expect(css).toContain("grid-template-columns: 34px minmax(0, 1fr) auto");
    expect(css).toContain("grid-template-columns: 30px minmax(0, 1fr) auto");
    expect(css).not.toMatch(/\.today-hub-leaderboard__rows\s*\{[^}]*overflow-y:\s*auto/s);
    expect(css).not.toMatch(/\.today-hub-leaderboard__rows\s*\{[^}]*max-height:/s);
  });

  it("uses the same hub structure for UFC and Football with sport-only accent differences", () => {
    expect(hub).toContain('data-sport={sport}');
    expect(css).toContain('.today-hub[data-sport="football"] .today-hub-card::before');
    expect(css).toContain("background: var(--football-accent)");
  });

  it("removes the stale Football games early-access banner from Play", () => {
    expect(footballPlay).not.toContain("FootballGamesEarlyAccessBanner");
    expect(footballPlay).not.toContain("Games and features are still being built and refined.");
    expect(footballPlay).toContain('<TodayChallengeHub sport="football" />');
    expect(footballPlay).toContain('<PlayLandingGameLibrary sport="football"');
  });
});
