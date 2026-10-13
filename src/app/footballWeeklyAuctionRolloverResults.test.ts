import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gm = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
const archive = readFileSync("src/features/back-room/FootballWeeklyAuctionCenterPage.tsx", "utf8");
const final = readFileSync("src/features/back-room/FootballWeeklyNflTeamSeasonGate.tsx", "utf8");
const repository = readFileSync("src/features/play/footballWeeklyAuctionRepository.ts", "utf8");

describe("Football featured weekly rollover results", () => {
  it("shows the previous auction champion and an entry to the full archive on the new GM week", () => {
    expect(gm).toContain("auctionRepository.loadHistory()");
    expect(gm).toContain("result.week_start < gmWeekStart");
    expect(gm).toContain("entry.is_winner");
    expect(gm).toContain("FINAL RESULTS ARE IN");
    expect(gm).toContain("/football/weekly-auction?results=latest");
  });

  it("deep-links directly to the newest finalized auction even with no current auction", () => {
    expect(archive).toContain('new URLSearchParams(location.search).get("results") === "latest"');
    expect(archive).toContain("setSelectedResult(nextHistory[0] ?? null)");
    expect(repository).toContain("get_my_football_weekly_auction_history");
  });

  it("preserves the established final standings, collections, grades and wildcard result", () => {
    expect(archive).toContain("FootballWeeklyNflTeamSeasonFinalResult");
    expect(final).toContain("Standings");
    expect(final).toContain("Collections");
    expect(final).toContain("All Grades");
    expect(final).toContain("WILDCARD RESULT");
    expect(final).toContain("WheelResult wildcard={result.wildcard}");
  });
});
