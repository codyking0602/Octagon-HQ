import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footballPlay = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const library = readFileSync("src/features/play/PlayLandingPresentation.tsx", "utf8");
const previewPage = readFileSync("src/features/back-room/FootballWeeklyBuildQbPreviewPage.tsx", "utf8");
const repository = readFileSync("src/features/play/footballWeeklyAuctionRepository.ts", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");

describe("NFL Weekly Build a QB owner preview", () => {
  it("keeps the private preview infrastructure off the Football Play library", () => {
    expect(footballPlay).not.toContain("weeklyBuildQbPreviewVisible");
    expect(library).not.toContain("Next Week · NFL Build a QB");
    expect(library).not.toContain("/football/weekly-build-qb-preview");
  });

  it("reuses the real Weekly Build a QB board while keeping preview bidding local", () => {
    expect(previewPage).toContain("<FootballWeeklyBuildQbGate");
    expect(previewPage).toContain("forceBoard");
    expect(previewPage).toContain("Preview bids stay on this screen");
    expect(previewPage).toContain("setState((current)");
    expect(repository).toContain('rpc(client, "get_my_football_weekly_build_qb_preview")');
  });

  it("has a dedicated owner-preview route", () => {
    expect(router).toContain('path: "football/weekly-build-qb-preview"');
    expect(router).toContain("<FootballWeeklyBuildQbPreviewPage />");
  });
});
