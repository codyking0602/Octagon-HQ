import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footballPlay = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const library = readFileSync("src/features/play/PlayLandingPresentation.tsx", "utf8");
const preview = readFileSync("src/features/back-room/FootballWeeklyAuctionFinalPreviewPage.tsx", "utf8");
const gate = readFileSync("src/features/back-room/FootballWeeklyAuctionGate.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");

describe("CFB Weekly Auction final owner preview", () => {
  it("adds a Cody-only Football Play entry", () => {
    expect(footballPlay).toContain("weeklyAuctionFinalPreviewVisible={isFootballWeeklyAuctionFinalPreviewOwner(identity.profile)}");
    expect(library).toContain("CFB Final Results Preview");
    expect(library).toContain("/football/weekly-auction-final-preview");
  });

  it("renders the exact production final-result component with sanitized local data", () => {
    expect(gate).toContain("export function FootballWeeklyAuctionFinalResult");
    expect(preview).toContain("<FootballWeeklyAuctionFinalResult");
    expect(preview).toContain("Sanitized sample data only.");
    expect(preview).not.toContain("createFootballWeeklyAuctionRepository");
    expect(preview).not.toContain("get_my_football_weekly_auction");
  });

  it("has a dedicated owner-only preview route", () => {
    expect(router).toContain('path: "football/weekly-auction-final-preview"');
    expect(router).toContain("<FootballWeeklyAuctionFinalPreviewPage />");
    expect(preview).toContain("isFootballWeeklyAuctionFinalPreviewOwner(identity.profile)");
    expect(preview).toContain('<Navigate to="/football" replace />');
  });
});
