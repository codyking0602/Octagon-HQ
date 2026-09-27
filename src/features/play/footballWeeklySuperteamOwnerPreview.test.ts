import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballWeeklySuperteamPreviewPage.tsx", "utf8");
const gate = readFileSync("src/features/back-room/FootballWeeklySuperteamGate.tsx", "utf8");
const repository = readFileSync("src/features/play/footballWeeklyAuctionRepository.ts", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");

describe("CFB Superteam owner preview", () => {
  it("uses the real Superteam gate and keeps preview bids local", () => {
    expect(page).toContain("<FootballWeeklySuperteamGate");
    expect(page).toContain("forceBoard");
    expect(page).toContain("Preview bids stay local");
    expect(page).toContain("setState((current)");
  });

  it("loads the dedicated owner-only backend preview", () => {
    expect(repository).toContain('rpc(client, "get_my_football_weekly_superteam_preview")');
    expect(page).toContain("isFootballWeeklyBuildQbPreviewOwner");
  });

  it("has a dedicated owner preview route", () => {
    expect(router).toContain('path: "football/weekly-superteam-preview"');
    expect(router).toContain("<FootballWeeklySuperteamPreviewPage />");
  });

  it("renders eight candidates with claim priority and no grade surface", () => {
    expect(gate).toContain("8–12 candidates");
    expect(gate).toContain("<strong>{state.teams.length}</strong><span>CANDIDATES</span>");
    expect(gate).toContain("CLAIM PRIORITY");
    expect(gate).toContain("P1 is your first claim");
    expect(gate).not.toContain("card.grade");
  });
});
