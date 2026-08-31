import { describe, expect, it } from "vitest";
import { normalizeFootballEvent } from "./normalize";

function espnGame({
  id = "401",
  kickoff = "2026-09-12T19:30:00.000Z",
  home = "UTSA Roadrunners",
  homeAbbreviation = "UTSA",
  away = "Texas Longhorns",
  awayAbbreviation = "TEX",
} = {}) {
  return {
    id,
    date: kickoff,
    season: { year: 2026 },
    competitions: [{
      date: kickoff,
      venue: { fullName: "Test Stadium", address: { city: "Test", state: "TX" } },
      competitors: [
        { homeAway: "home", team: { displayName: home, abbreviation: homeAbbreviation } },
        { homeAway: "away", team: { displayName: away, abbreviation: awayAbbreviation } },
      ],
    }],
  };
}

function oddsGame({
  kickoff = "2026-09-12T19:30:00.000Z",
  home = "Texas-San Antonio Roadrunners",
  away = "Texas Longhorns",
  point = -4.5,
  withSpread = true,
} = {}) {
  return {
    commence_time: kickoff,
    home_team: home,
    away_team: away,
    bookmakers: [{
      last_update: "2026-09-12T18:00:00.000Z",
      markets: withSpread ? [{
        key: "spreads",
        outcomes: [
          { name: home, point },
          { name: away, point: -point },
        ],
      }] : [],
    }],
  };
}

describe("Football ATS provider matching", () => {
  it("keeps exact team-name matching as the first path", () => {
    const event = espnGame({ home: "Seattle Seahawks", homeAbbreviation: "SEA", away: "New England Patriots", awayAbbreviation: "NE" });
    const odds = oddsGame({ home: "Seattle Seahawks", away: "New England Patriots", point: -3.5 });

    expect(normalizeFootballEvent(event, [odds], "nfl").bouts[0].spread_home).toBe(-3.5);
  });

  it("uses the same kickoff plus one exact team to resolve a provider alias without changing the ESPN team identity", () => {
    const normalized = normalizeFootballEvent(espnGame(), [oddsGame()], "college-football");

    expect(normalized.name).toBe("Texas Longhorns at UTSA Roadrunners");
    expect(normalized.bouts[0].red_fighter_name).toBe("UTSA Roadrunners");
    expect(normalized.bouts[0].home_team_slug).toBe("utsa-roadrunners");
    expect(normalized.bouts[0].spread_home).toBe(-4.5);
    expect(normalized.bouts[0].spread_source).toBe("the-odds-api");
  });

  it("does not guess when more than one same-kickoff event shares the one exact team", () => {
    const duplicate = oddsGame({ home: "Another Provider Alias", away: "Texas Longhorns", point: -2.5 });

    expect(() => normalizeFootballEvent(espnGame(), [oddsGame(), duplicate], "college-football"))
      .toThrow("The Odds API has no matching event for Texas Longhorns at UTSA Roadrunners");
  });

  it("names the matchup when the provider event exists but has no ATS market", () => {
    expect(() => normalizeFootballEvent(espnGame(), [oddsGame({ withSpread: false })], "college-football"))
      .toThrow("The Odds API has no ATS line for Texas Longhorns at UTSA Roadrunners");
  });
});
