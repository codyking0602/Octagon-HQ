import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const router = readFileSync("src/app/router.tsx", "utf8");
const center = readFileSync("src/features/back-room/FootballWeeklyAuctionCenterPage.tsx", "utf8");
const gm = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
const nflFinal = readFileSync("src/features/back-room/FootballWeeklyNflTeamSeasonGate.tsx", "utf8");

describe("October 13 Football Weekly GM rollover", () => {
  it("keeps the Auction Center accessible instead of hijacking the archive route", () => {
    expect(router).toContain('{ path: "football/weekly-auction", element: <FootballWeeklyAuctionCenterPage /> }');
    expect(router).not.toMatch(/football\/weekly-auction.*Navigate to="\/football\/weekly-gm"/);
  });

  it("opens the completed Auction archive by default during GM featured week", () => {
    expect(center).toContain('gmWeek ? "results" : "week"');
    expect(center).toContain("(impostorWindow.active || gmWeek)");
    expect(center).toContain('navigate("/football/weekly-gm")');
    expect(center).toContain("Last week's Auction is complete.");
  });

  it("preserves full Auction finals in the Auction Center while GM has its own closed-week history", () => {
    expect(center).toContain("repository.loadHistory()");
    expect(center).toContain("<FootballWeeklyNflTeamSeasonFinalResult");
    expect(gm).toContain("repository.history()");
    expect(gm).toContain("PAST GM CHAMPIONSHIPS");
    expect(gm).toContain("FootballGmFranchiseReport");
    expect(gm).not.toContain("showAuctionReveal");
  });

  it("reveals the Day 7 Wildcard wheel in archived finals", () => {
    expect(nflFinal).toContain('className="football-weekly-nfl-team-season__final-wildcard" open={!showNewWeekAction}');
    expect(nflFinal).toContain("All Grades");
    expect(nflFinal).toContain("Collections");
    expect(nflFinal).toContain("<WheelResult wildcard={result.wildcard} />");
  });
});
