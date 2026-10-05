import { describe, expect, it } from "vitest";
import {
  footballGmPlaytestOpponentName,
  isFootballGmPlaytestProfile,
} from "./footballGmAccess";

describe("Football GM playtest access", () => {
  it("allows only the owner Cody profile and canonical TEST profile", () => {
    expect(isFootballGmPlaytestProfile({
      id: "00000000-0000-0000-0000-000000000001",
      displayName: "CODY",
      initials: "C",
      canControlPicks: true,
    })).toBe(true);
    expect(isFootballGmPlaytestProfile({
      id: "c8b9d8a2-22a6-44cf-8a5f-3287d151f025",
      displayName: "TEST",
      initials: "T",
      canControlPicks: true,
    })).toBe(true);
  });

  it("rejects TEST2, normal members, and owner-like names without owner capability", () => {
    expect(isFootballGmPlaytestProfile({
      id: "00000000-0000-0000-0000-000000000002",
      displayName: "TEST2",
      initials: "T2",
      canControlPicks: true,
    })).toBe(false);
    expect(isFootballGmPlaytestProfile({
      id: "00000000-0000-0000-0000-000000000003",
      displayName: "SHANE",
      initials: "S",
    })).toBe(false);
    expect(isFootballGmPlaytestProfile({
      id: "00000000-0000-0000-0000-000000000004",
      displayName: "CODY",
      initials: "C",
      canControlPicks: false,
    })).toBe(false);
  });

  it("locks the two playtest profiles to each other", () => {
    expect(footballGmPlaytestOpponentName({
      id: "00000000-0000-0000-0000-000000000001",
      displayName: "CODY",
      initials: "C",
      canControlPicks: true,
    })).toBe("TEST");
    expect(footballGmPlaytestOpponentName({
      id: "c8b9d8a2-22a6-44cf-8a5f-3287d151f025",
      displayName: "TEST",
      initials: "T",
      canControlPicks: true,
    })).toBe("CODY");
  });
});
