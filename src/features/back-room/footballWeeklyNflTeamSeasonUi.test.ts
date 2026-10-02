import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gate = readFileSync(
  "src/features/back-room/FootballWeeklyNflTeamSeasonGate.tsx",
  "utf8",
);
const styles = readFileSync(
  "src/styles/football-weekly-nfl-team-seasons.css",
  "utf8",
);
const repository = readFileSync(
  "src/features/play/footballWeeklyAuctionRepository.ts",
  "utf8",
);
const today = readFileSync(
  "src/features/back-room/FootballTodayChallengePage.tsx",
  "utf8",
);
const center = readFileSync(
  "src/features/back-room/FootballWeeklyAuctionCenterPage.tsx",
  "utf8",
);
const router = readFileSync("src/app/router.tsx", "utf8");

describe("NFL team-season Weekly Auction presentation", () => {
  it("keeps season year as a separate non-truncating identity element on mobile", () => {
    expect(gate).toContain('className="nfl-ts__season"');
    expect(gate).toContain("seasonYear");
    expect(styles).toContain(".nfl-ts__season");
    expect(styles).toContain("flex: 0 0 auto;");
    expect(styles).toContain("white-space: nowrap;");
    expect(styles).toContain("text-overflow: clip;");
    expect(styles).toContain("overflow: visible;");
  });

  it("shows the four Wildcards before the literal 0-5 ticket decision", () => {
    expect(repository).toContain("z.array(nflTeamSeasonWildcardCardSchema).length(4)");
    expect(gate).toContain("Rank only Wildcards you would actually accept");
    expect(gate).toContain("[0,1,2,3,4,5]");
    expect(gate).toContain("PRIORITY TICKET");
    expect(gate).toContain("REAPING TICKET");
    expect(gate).toContain("PASS IS SAFE");
    expect(gate).toContain("No Priority wheel. No Wildcard. No Reaping wheel.");
  });

  it("renders separate literal-ticket Priority and Reaping wheels after resolution", () => {
    expect(gate).toContain('kind="priority"');
    expect(gate).toContain('kind="reaping"');
    expect(gate).toContain("Array.from");
    expect(gate).toContain("entry.entry_count");
    expect(gate).toContain("TICKETS");
    expect(gate).toContain("starts the next calendar Weekly Auction");
  });

  it("wires production Day 7 submission independently from normal sealed bids", () => {
    expect(repository).toContain("submitWildcard(entries: number, rankings: string[])");
    expect(repository).toContain("submit_my_football_weekly_nfl_team_season_wildcard");
    expect(today).toContain("submitWeeklyWildcard");
    expect(today).toContain("onSubmitWildcard={submitWeeklyWildcard}");
  });

  it("exposes a true owner-only full-week review route from Auction Center", () => {
    expect(center).toContain("BEST NFL TEAM-SEASONS PLAYTHROUGH");
    expect(center).toContain("/football/weekly-auction-nfl-team-seasons-lab");
    expect(router).toContain("FootballWeeklyNflTeamSeasonLabPage");
    expect(router).toContain('path: "football/weekly-auction-nfl-team-seasons-lab"');
  });

  it("does not expose hidden grades in active card schemas", () => {
    const cardStart = repository.indexOf("const nflTeamSeasonCardSchema");
    const wildcardStart = repository.indexOf("const nflTeamSeasonWildcardCardSchema");
    const activeCards = repository.slice(cardStart, wildcardStart);
    expect(activeCards).not.toContain("hidden_grade");
    expect(activeCards).not.toContain("grade:");
  });
});
