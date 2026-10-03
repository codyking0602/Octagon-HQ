import { describe, expect, it } from "vitest";
import {
  isValidWheelFootballGrade,
  wheelFootballDisplayScore,
  wheelFootballGradeBand,
  wheelFootballRawTeamGrade,
} from "./wheelFootballGrading";

describe("Wheel of Football grading contract", () => {
  it("locks the hidden current-ability 0-100 half-point scale", () => {
    expect(isValidWheelFootballGrade(100)).toBe(true);
    expect(isValidWheelFootballGrade(92.5)).toBe(true);
    expect(isValidWheelFootballGrade(75)).toBe(true);
    expect(isValidWheelFootballGrade(92.3)).toBe(false);
    expect(isValidWheelFootballGrade(-0.5)).toBe(false);
    expect(isValidWheelFootballGrade(100.5)).toBe(false);

    expect(wheelFootballGradeBand(99)).toBe("Best in the NFL");
    expect(wheelFootballGradeBand(96)).toBe("Elite");
    expect(wheelFootballGradeBand(93)).toBe("High-end");
    expect(wheelFootballGradeBand(89)).toBe("Very good");
    expect(wheelFootballGradeBand(85)).toBe("Good starter");
    expect(wheelFootballGradeBand(81)).toBe("Solid starter");
    expect(wheelFootballGradeBand(77)).toBe("Below-average starter / useful player");
    expect(wheelFootballGradeBand(70)).toBe("Weak Wheel selection");
  });

  it("weights all seven Superteam slots equally", () => {
    expect(wheelFootballRawTeamGrade({
      QB: 100,
      RB: 95,
      WR: 90,
      Flex: 85,
      "Front Seven": 80,
      Secondary: 75,
      "Head Coach": 70,
    })).toBe(85);
  });

  it("uses the clamped CFB-style presentation curve without changing raw grading", () => {
    expect(wheelFootballDisplayScore(90)).toBe(70);
    expect(wheelFootballDisplayScore(92)).toBe(80);
    expect(wheelFootballDisplayScore(94)).toBe(90);
    expect(wheelFootballDisplayScore(96)).toBe(100);
    expect(wheelFootballDisplayScore(85)).toBe(45);
    expect(wheelFootballDisplayScore(100)).toBe(100);
    expect(wheelFootballDisplayScore(null)).toBeNull();
  });

  it("does not give Flex a separate quality multiplier", () => {
    expect(wheelFootballRawTeamGrade({
      QB: 90,
      RB: 90,
      WR: 90,
      Flex: 90,
      "Front Seven": 90,
      Secondary: 90,
      "Head Coach": 90,
    })).toBe(90);
  });
});
