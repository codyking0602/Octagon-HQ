import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gate = readFileSync("src/features/back-room/FootballWeeklyAuctionGate.tsx", "utf8");
const footballPlay = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const library = readFileSync("src/features/play/PlayLandingPresentation.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const styles = readFileSync("src/styles/football-weekly-auction.css", "utf8");

describe("CFB Weekly Auction final results production wiring", () => {
  it("keeps the approved final-results experience in the live weekly auction flow", () => {
    expect(gate).toContain("export function FootballWeeklyAuctionFinalResult");
    expect(gate).toContain("<FootballWeeklyAuctionFinalResult");
    expect(gate).toContain("state.previous_final");
    expect(gate).toContain("WEEKLY CHAMPION");
    expect(gate).toContain("Standings");
    expect(gate).toContain("Collections");
    expect(gate).toContain("All Grades");
    expect(gate).toContain("collectionForProfile");
    expect(gate).toContain("Select player collection");
    expect(gate).toContain("entry.winner_profile_id === profileId");
    expect(gate).toContain("right.grade - left.grade");
    expect(gate).toContain("left.winning_bid - right.winning_bid");
  });

  it("keeps the final result chrome tightly content-sized", () => {
    const compactFinal = styles.slice(styles.indexOf("/* Compact final-results pass"));

    expect(compactFinal).toContain("min-height: 0;");
    expect(compactFinal).toContain("height: auto;");
    expect(compactFinal).toContain("padding: 5px 8px;");
    expect(compactFinal).toContain("min-height: 26px;");
    expect(compactFinal).toContain("min-height: 34px;");
    expect(compactFinal).not.toContain("min-height: 44px;");
  });

  it("removes the temporary owner preview surface", () => {
    expect(footballPlay).not.toContain("weeklyAuctionFinalPreviewVisible");
    expect(library).not.toContain("CFB Final Results Preview");
    expect(library).not.toContain("/football/weekly-auction-final-preview");
    expect(router).not.toContain("football/weekly-auction-final-preview");
  });
});
