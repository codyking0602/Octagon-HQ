import { describe, expect, it } from "vitest";
import { FOOTBALL_FUTURES_TOTAL_POINTS } from "./footballPicksScoring";
import { EMPTY_FOOTBALL_FUTURES_PICKS, validateFootballFuturesPicks } from "./footballFuturesDraft";

describe("Football Futures draft", () => {
  it("keeps the locked Futures board at 78 points", () => {
    expect(FOOTBALL_FUTURES_TOTAL_POINTS).toBe(78);
  });

  it("allows a logically nested partial draft", () => {
    const result = validateFootballFuturesPicks({
      ...EMPTY_FOOTBALL_FUTURES_PICKS,
      cfbPlayoffTeams: ["Texas", "Georgia"],
      cfbSemifinalists: ["Texas"],
      cfbNationalChampion: "Texas",
      nflPlayoffTeams: ["Dallas", "Philadelphia"],
      nflDivisionChampions: ["Dallas"],
      nflConferenceChampionshipTeams: ["Dallas"],
      nflSuperBowlChampion: "Dallas",
    });
    expect(result.errors).toEqual([]);
  });

  it("rejects children that are outside their playoff field", () => {
    const result = validateFootballFuturesPicks({
      ...EMPTY_FOOTBALL_FUTURES_PICKS,
      cfbSemifinalists: ["Texas"],
      nflConferenceChampionshipTeams: ["Dallas"],
    });
    expect(result.errors).toContain("CFP semifinalists must also appear in the parent playoff field.");
    expect(result.errors).toContain("Conference championship teams must also appear in the parent playoff field.");
  });

  it("rejects duplicates and overfilled categories", () => {
    const result = validateFootballFuturesPicks({
      ...EMPTY_FOOTBALL_FUTURES_PICKS,
      cfbPower4Champions: ["Texas", "Texas", "Georgia", "Miami", "Oregon"],
    });
    expect(result.errors).toContain("Power 4 champions allows 4 selections.");
    expect(result.errors).toContain("Power 4 champions cannot contain duplicates.");
  });
});
