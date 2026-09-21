import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gate = readFileSync("src/features/back-room/FootballWeeklyAuctionGate.tsx", "utf8");
const footballPlay = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const library = readFileSync("src/features/play/PlayLandingPresentation.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");

describe("CFB Weekly Auction final results production wiring", () => {
  it("keeps the approved final-results experience in the live weekly auction flow", () => {
    expect(gate).toContain("export function FootballWeeklyAuctionFinalResult");
    expect(gate).toContain("<FootballWeeklyAuctionFinalResult");
    expect(gate).toContain("state.previous_final");
    expect(gate).toContain("WEEKLY CHAMPION");
    expect(gate).toContain("Standings");
    expect(gate).toContain("Your Collection");
    expect(gate).toContain("All Grades");
  });

  it("removes the temporary owner preview surface", () => {
    expect(footballPlay).not.toContain("weeklyAuctionFinalPreviewVisible");
    expect(library).not.toContain("CFB Final Results Preview");
    expect(library).not.toContain("/football/weekly-auction-final-preview");
    expect(router).not.toContain("football/weekly-auction-final-preview");
  });
});
