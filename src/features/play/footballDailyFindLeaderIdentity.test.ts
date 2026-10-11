import { describe, expect, it } from "vitest";
import { footballDailyFindLeaderIdentity } from "./footballDailyFindLeaderIdentity";

describe("published Football Daily Find the Leader identity", () => {
  it("restores Peyton Manning's year from the existing October 11 immutable setup", () => {
    expect(footballDailyFindLeaderIdentity("Peyton Manning 2008")).toEqual({
      displayName: "Peyton Manning",
      season: 2008,
    });
  });

  it("restores team-season years in the alternate CFB round", () => {
    expect(footballDailyFindLeaderIdentity("2019 LSU")).toEqual({
      displayName: "LSU",
      season: 2019,
    });
  });

  it("preserves canonical future published year metadata and leaves career names alone", () => {
    expect(footballDailyFindLeaderIdentity("Peyton Manning 2013", "Peyton Manning", 2013))
      .toEqual({ displayName: "Peyton Manning", season: 2013 });
    expect(footballDailyFindLeaderIdentity("Peyton Manning"))
      .toEqual({ displayName: "Peyton Manning" });
  });
});
