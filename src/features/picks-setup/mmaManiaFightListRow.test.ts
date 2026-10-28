import { describe, expect, it } from "vitest";
import { isMmaManiaFightListRow } from "../../../supabase/functions/sync-next-ufc-event/importPolicy";

describe("MMA Mania fight-list row guard", () => {
  it("keeps legitimate weighted fight rows even when they carry editorial suffixes", () => {
    expect(isMmaManiaFightListRow(
      "155 lbs.: Alpha One vs. Beta Two — odds, preview & prediction",
    )).toBe(true);
    expect(isMmaManiaFightListRow(
      "170 lbs.: Gamma Three vs. Delta Four — live stream, odds and preview",
    )).toBe(true);
  });

  it("rejects poll questions and standalone matchup editorial prose", () => {
    expect(isMmaManiaFightListRow(
      "Will Makhachev vs. Machado Garry go over or under 4.5 rounds?",
    )).toBe(false);
    expect(isMmaManiaFightListRow(
      "155 lbs.: Will Alpha One vs. Beta Two go over or under 2.5 rounds",
    )).toBe(false);
    expect(isMmaManiaFightListRow(
      "Alpha One vs. Beta Two Odds, Full Fight Preview & Prediction",
    )).toBe(false);
  });
});
