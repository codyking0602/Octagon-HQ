import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  footballSlateUnavailableMessage,
  normalizeFootballEvent,
  normalizeFootballSlate,
} from "./normalize";

function espnGame({
  id = "401",
  kickoff = "2026-09-12T19:30:00.000Z",
  home = "UTSA Roadrunners",
  homeAbbreviation = "UTSA",
  homeLogo = "https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png",
  away = "Texas Longhorns",
  awayAbbreviation = "TEX",
  awayLogo = "https://a.espncdn.com/i/teamlogos/ncaa/500/251.png",
} = {}) {
  return {
    id,
    date: kickoff,
    season: { year: 2026 },
    competitions: [{
      date: kickoff,
      venue: { fullName: "Test Stadium", address: { city: "Test", state: "TX" } },
      competitors: [
        { homeAway: "home", team: { displayName: home, abbreviation: homeAbbreviation, logo: homeLogo } },
        { homeAway: "away", team: { displayName: away, abbreviation: awayAbbreviation, logo: awayLogo } },
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

  it("carries ESPN team logos as presentation assets on the normalized canonical game", () => {
    const normalized = normalizeFootballEvent(espnGame(), [oddsGame()], "college-football");

    expect(normalized.bouts[0].home_team_logo_url).toBe("https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png");
    expect(normalized.bouts[0].away_team_logo_url).toBe("https://a.espncdn.com/i/teamlogos/ncaa/500/251.png");
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

  it("collects every unavailable ATS matchup instead of stopping at the first missing line", () => {
    const readyEspn = espnGame({
      id: "501",
      home: "Seattle Seahawks",
      homeAbbreviation: "SEA",
      away: "New England Patriots",
      awayAbbreviation: "NE",
    });
    const noEventEspn = espnGame({
      id: "502",
      kickoff: "2026-09-12T20:00:00.000Z",
      home: "Kansas Jayhawks",
      homeAbbreviation: "KU",
      away: "Missouri Tigers",
      awayAbbreviation: "MIZ",
    });
    const noSpreadEspn = espnGame({
      id: "503",
      kickoff: "2026-09-12T20:30:00.000Z",
      home: "Iowa State Cyclones",
      homeAbbreviation: "ISU",
      away: "Iowa Hawkeyes",
      awayAbbreviation: "IOWA",
    });
    const readyOdds = oddsGame({ home: "Seattle Seahawks", away: "New England Patriots", point: -3.5 });
    const noSpreadOdds = oddsGame({
      kickoff: "2026-09-12T20:30:00.000Z",
      home: "Iowa State Cyclones",
      away: "Iowa Hawkeyes",
      withSpread: false,
    });

    const result = normalizeFootballSlate([
      { espnEvent: readyEspn, oddsEvents: [readyOdds], league: "nfl" },
      { espnEvent: noEventEspn, oddsEvents: [], league: "college-football" },
      { espnEvent: noSpreadEspn, oddsEvents: [noSpreadOdds], league: "college-football" },
    ]);

    expect(result.events).toHaveLength(1);
    expect(result.unavailable).toEqual([
      { matchup: "Missouri Tigers at Kansas Jayhawks", reason: "missing-event" },
      { matchup: "Iowa Hawkeyes at Iowa State Cyclones", reason: "missing-spread" },
    ]);
    expect(footballSlateUnavailableMessage(result.unavailable, 3)).toBe(
      "The Odds API cannot stage 2 of 3 selected games yet. Nothing was staged. Unavailable ATS: Missouri Tigers at Kansas Jayhawks; Iowa Hawkeyes at Iowa State Cyclones. Try again when the lines are posted.",
    );
  });

  it("keeps weekly staging behind ATS readiness and ESPN asset caching", () => {
    const source = readFileSync("supabase/functions/sync-next-football-event/index.ts", "utf8");
    const readinessCheck = source.indexOf("if (normalization.unavailable.length)");
    const assetWrite = source.indexOf("cacheFootballTeamAssets(admin, normalization.events)");
    const stageWrite = source.indexOf("stageFootballEvents(admin, normalization.events)");

    expect(readinessCheck).toBeGreaterThanOrEqual(0);
    expect(assetWrite).toBeGreaterThan(readinessCheck);
    expect(stageWrite).toBeGreaterThan(assetWrite);
    expect(source).toContain("unavailable_game_count: normalization.unavailable.length");
    expect(source).toContain("}, 409);");
  });
});
