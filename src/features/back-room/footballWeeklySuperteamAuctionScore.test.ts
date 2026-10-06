import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballWeeklySuperteamAuctionScore } from "./footballWeeklySuperteamAuctionScore";

describe("CFB Superteam visual Auction Score", () => {
  it("uses the approved five-times presentation curve", () => {
    expect(footballWeeklySuperteamAuctionScore(90)).toBe(70);
    expect(footballWeeklySuperteamAuctionScore(92)).toBe(80);
    expect(footballWeeklySuperteamAuctionScore(94)).toBe(90);
    expect(footballWeeklySuperteamAuctionScore(96)).toBe(100);
    expect(footballWeeklySuperteamAuctionScore(94.1)).toBe(91);
    expect(footballWeeklySuperteamAuctionScore(93.5)).toBe(88);
  });

  it("keeps missing scores missing", () => {
    expect(footballWeeklySuperteamAuctionScore(null)).toBeNull();
    expect(footballWeeklySuperteamAuctionScore(undefined)).toBeNull();
  });

  it("keeps Auction Score as the headline while revealing final roster grades", () => {
    const gate = readFileSync(
      "src/features/back-room/FootballWeeklySuperteamGate.tsx",
      "utf8",
    );

    expect(gate).toContain("AUCTION SCORE");
    expect(gate).not.toContain("7-player Superteam average");
    expect(gate).toContain(">All Grades<");
    expect(gate).toContain("item.grade.toFixed(1)");
    expect(gate).not.toContain("entry.grade.toFixed");
  });
});
