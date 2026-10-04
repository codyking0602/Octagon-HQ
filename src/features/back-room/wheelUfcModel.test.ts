import { describe, expect, it } from "vitest";
import {
  WHEEL_UFC_CATEGORIES,
  WHEEL_UFC_CATEGORY_WEIGHTS,
  WHEEL_UFC_ROSTER_SLOTS,
  WHEEL_UFC_VISUAL_SLICES,
  wheelUfcCategoryMidDegrees,
  wheelUfcSpinDisplay,
} from "./wheelUfcModel";

describe("Wheel of UFC model", () => {
  it("locks the eight men's weight-class roster", () => {
    expect(WHEEL_UFC_ROSTER_SLOTS).toEqual([
      "Flyweight",
      "Bantamweight",
      "Featherweight",
      "Lightweight",
      "Welterweight",
      "Middleweight",
      "Light Heavyweight",
      "Heavyweight",
    ]);
  });

  it("locks the approved weighted category mix", () => {
    expect(WHEEL_UFC_CATEGORY_WEIGHTS).toEqual({
      CHAMPION: 5,
      TOP_5: 10,
      SIX_TO_FIFTEEN: 15,
      UNRANKED: 20,
      COUNTRY: 20,
      YOUNG_GUN: 15,
      VETERAN: 15,
    });
    expect(WHEEL_UFC_CATEGORIES.reduce((sum, row) => sum + row.weight, 0)).toBe(100);
    expect(WHEEL_UFC_VISUAL_SLICES).toEqual([
      "CHAMPION", "TOP_5", "SIX_TO_FIFTEEN", "UNRANKED", "COUNTRY", "YOUNG_GUN", "VETERAN",
    ]);
    expect(wheelUfcCategoryMidDegrees("CHAMPION")).toBe(9);
    expect(wheelUfcCategoryMidDegrees("UNRANKED")).toBe(144);
    expect(wheelUfcCategoryMidDegrees("VETERAN")).toBe(333);
  });

  it("keeps the agreed Young Gun and Veteran rules in presentation", () => {
    expect(WHEEL_UFC_CATEGORIES.find((row) => row.id === "YOUNG_GUN")?.detail).toBe("Under 25");
    expect(WHEEL_UFC_CATEGORIES.find((row) => row.id === "VETERAN")?.detail).toBe("10+ UFC fights");
    expect(wheelUfcSpinDisplay("COUNTRY", "Brazil")).toBe("COUNTRY · BRAZIL");
  });
});
