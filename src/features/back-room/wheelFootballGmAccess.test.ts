import { describe, expect, it } from "vitest";
import { isWheelFootballGmPlaytester } from "./wheelFootballGmAccess";

describe("Wheel Football GM playtest access", () => {
  it("allows Cody and the canonical TEST profile only when they hold owner capability", () => {
    expect(isWheelFootballGmPlaytester({
      id: "cody",
      displayName: "Cody",
      initials: "C",
      canControlPicks: true,
    })).toBe(true);

    expect(isWheelFootballGmPlaytester({
      id: "test",
      displayName: "TEST",
      initials: "T",
      canControlPicks: true,
    })).toBe(true);

    expect(isWheelFootballGmPlaytester({
      id: "test",
      displayName: "TEST",
      initials: "T",
      canControlPicks: false,
    })).toBe(false);
  });

  it("keeps TEST2 and unrelated owner-capable profiles out of GM Mode", () => {
    expect(isWheelFootballGmPlaytester({
      id: "test2",
      displayName: "TEST2",
      initials: "T",
      canControlPicks: true,
    })).toBe(false);

    expect(isWheelFootballGmPlaytester({
      id: "other",
      displayName: "SHANE",
      initials: "S",
      canControlPicks: true,
    })).toBe(false);

    expect(isWheelFootballGmPlaytester(null)).toBe(false);
  });
});
