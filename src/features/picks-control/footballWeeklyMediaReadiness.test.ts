import { describe, expect, it, vi } from "vitest";
import { expectedFootballEditorialAssetPaths, verifyFootballWeeklyMedia } from "./footballWeeklyMediaReadiness";
import type { FootballWeeklyContentPackage } from "../home/footballWeeklyContentRepository";

const content = {
  week_of: "2026-10-13",
  cfb_spotlight: { photo_asset_path: "/assets/football/weekly/2026-10-13/cfb/spotlight.webp" },
  cfb_game_of_week: { header_asset_path: "/assets/football/weekly/2026-10-13/cfb/game-header.webp" },
  production: { cfb: { prepared_at: "2026-10-12T00:00:00Z" } },
} as unknown as FootballWeeklyContentPackage;

describe("Football weekly release media inspection", () => {
  it("uses canonical path and verifies both sizes before returning the SHA-bound receipt", async () => {
    const load = vi.fn(async () => {});
    const receipt = await verifyFootballWeeklyMedia(content, "cfb", load, async () => "a".repeat(40));
    expect(load).toHaveBeenNthCalledWith(1,
      expectedFootballEditorialAssetPaths("2026-10-13", "cfb").spotlight,
      { width: 720, height: 900 });
    expect(load).toHaveBeenNthCalledWith(2,
      expectedFootballEditorialAssetPaths("2026-10-13", "cfb").header,
      { width: 1600, height: 900 });
    expect(receipt.spotlight_url).toContain("/cfb/spotlight.webp");
    expect(receipt.deployed_sha).toHaveLength(40);
  });
  it("blocks a bad uploaded path, missing art, or incorrect deployment marker", async () => {
    const check = vi.fn(async () => {});
    await expect(verifyFootballWeeklyMedia({
      ...content, cfb_spotlight: { ...content.cfb_spotlight!, photo_asset_path: "/bad.webp" },
    }, "cfb", check, async () => "a".repeat(40))).rejects.toThrow();
    await expect(verifyFootballWeeklyMedia(content, "cfb", check,
      async () => "not-sha")).rejects.toThrow();
    await expect(verifyFootballWeeklyMedia(content, "cfb",
      async () => { throw new Error("Not deployed"); }, async () => "a".repeat(40))).rejects.toThrow("Not deployed");
  });
});
