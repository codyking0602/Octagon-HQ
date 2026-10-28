import { describe, expect, it } from "vitest";
import { filterOddsToMonitoredEvent, type MonitoringEvent } from "./manualMonitoringRunner";
import { adaptTheOddsApiResponse } from "./theOddsApi";

const observed = "2026-08-18T20:30:00Z";
const event: MonitoringEvent = {
  event_id: "ufc-sacramento",
  source_event_key: "ufc-sacramento",
  name: "UFC Fight Night",
  subtitle: "Hernandez vs. Rodrigues",
  starts_at: "2026-08-22T23:00:00Z",
  locks_at: "2026-08-22T23:00:00Z",
  bouts: [{
    bout_id: "serghei-spivac-vitor-petrino",
    red_fighter_slug: "serghei-spivac",
    red_fighter_name: "Serghei Spivac",
    blue_fighter_slug: "vitor-petrino",
    blue_fighter_name: "Vitor Petrino",
  }],
};

const providerPayload = [{
  id: "provider-spivak-petrino",
  sport_key: "mma_mixed_martial_arts",
  commence_time: "2026-08-22T23:00:00Z",
  home_team: "Sergey Spivak",
  away_team: "Vitor Petrino",
  bookmakers: [{
    key: "draftkings",
    title: "DraftKings",
    last_update: observed,
    markets: [{
      key: "h2h",
      outcomes: [
        { name: "Sergey Spivak", price: 135 },
        { name: "Vitor Petrino", price: -160 },
      ],
    }],
  }],
}];

describe("Odds fighter aliases", () => {
  it("matches Sergey Spivak provider odds to canonical Serghei Spivac", () => {
    const odds = adaptTheOddsApiResponse({ status: 200, body: providerPayload }, observed);
    const filtered = filterOddsToMonitoredEvent(odds, event);

    expect(filtered.snapshots).toHaveLength(1);
    expect(filtered.snapshots[0]).toMatchObject({
      matchupIdentity: "serghei spivac|vitor petrino",
      prices: [
        { fighterName: "Serghei Spivac", fighterIdentity: "serghei spivac", americanOdds: 135 },
        { fighterName: "Vitor Petrino", fighterIdentity: "vitor petrino", americanOdds: -160 },
      ],
    });
    expect(filtered.coverage).toEqual({ providerEvents: 1, completeSnapshots: 1, missingSnapshots: 0 });
  });

  it("matches the three UFC Paris provider name variants to the canonical Picks fighters", () => {
    const parisEvent: MonitoringEvent = {
      event_id: "ufc-paris-2026",
      source_event_key: "ufc-paris-2026",
      name: "UFC Fight Night",
      subtitle: "Hooker vs. Parnasse",
      starts_at: "2026-09-05T19:00:00Z",
      locks_at: "2026-09-05T19:00:00Z",
      bouts: [
        {
          bout_id: "main-event-dan-hooker-salahdine-parnasse",
          red_fighter_slug: "dan-hooker",
          red_fighter_name: "Dan Hooker",
          blue_fighter_slug: "salahdine-parnasse",
          blue_fighter_name: "Salahdine Parnasse",
        },
        {
          bout_id: "main-michael-venom-page-nursulton-ruziboev",
          red_fighter_slug: "michael-venom-page",
          red_fighter_name: "Michael Venom Page",
          blue_fighter_slug: "nursulton-ruziboev",
          blue_fighter_name: "Nursulton Ruziboev",
        },
        {
          bout_id: "main-losene-keita-muhammad-naimov",
          red_fighter_slug: "losene-keita",
          red_fighter_name: "Losene Keita",
          blue_fighter_slug: "muhammad-naimov",
          blue_fighter_name: "Muhammad Naimov",
        },
      ],
    };
    const parisPayload = [
      {
        id: "provider-hooker-parnasse",
        sport_key: "mma_mixed_martial_arts",
        commence_time: "2026-09-05T19:00:00Z",
        home_team: "Daniel Hooker",
        away_team: "Salahdine Parnasse",
        bookmakers: [{
          key: "draftkings",
          title: "DraftKings",
          last_update: observed,
          markets: [{
            key: "h2h",
            outcomes: [
              { name: "Daniel Hooker", price: 380 },
              { name: "Salahdine Parnasse", price: -500 },
            ],
          }],
        }],
      },
      {
        id: "provider-page-ruziboev",
        sport_key: "mma_mixed_martial_arts",
        commence_time: "2026-09-05T19:00:00Z",
        home_team: "Michael Page",
        away_team: "Nursulton Ruziboev",
        bookmakers: [{
          key: "draftkings",
          title: "DraftKings",
          last_update: observed,
          markets: [{
            key: "h2h",
            outcomes: [
              { name: "Michael Page", price: -185 },
              { name: "Nursulton Ruziboev", price: 154 },
            ],
          }],
        }],
      },
      {
        id: "provider-keita-naimov",
        sport_key: "mma_mixed_martial_arts",
        commence_time: "2026-09-05T19:00:00Z",
        home_team: "Losene Keita",
        away_team: "Muhammadjon Naimov",
        bookmakers: [{
          key: "draftkings",
          title: "DraftKings",
          last_update: observed,
          markets: [{
            key: "h2h",
            outcomes: [
              { name: "Losene Keita", price: -360 },
              { name: "Muhammadjon Naimov", price: 285 },
            ],
          }],
        }],
      },
    ];

    const odds = adaptTheOddsApiResponse({ status: 200, body: parisPayload }, observed);
    const filtered = filterOddsToMonitoredEvent(odds, parisEvent);
    const snapshotsByMatchup = new Map(filtered.snapshots.map((snapshot) => [snapshot.matchupIdentity, snapshot]));

    expect(filtered.coverage).toEqual({ providerEvents: 3, completeSnapshots: 3, missingSnapshots: 0 });
    expect(new Set(snapshotsByMatchup.keys())).toEqual(new Set([
      "dan hooker|salahdine parnasse",
      "michael venom page|nursulton ruziboev",
      "losene keita|muhammad naimov",
    ]));
    expect(snapshotsByMatchup.get("dan hooker|salahdine parnasse")?.prices[0]).toEqual({
      fighterName: "Dan Hooker",
      fighterIdentity: "dan hooker",
      americanOdds: 380,
    });
    expect(snapshotsByMatchup.get("michael venom page|nursulton ruziboev")?.prices[0]).toEqual({
      fighterName: "Michael Venom Page",
      fighterIdentity: "michael venom page",
      americanOdds: -185,
    });
    expect(snapshotsByMatchup.get("losene keita|muhammad naimov")?.prices[1]).toEqual({
      fighterName: "Muhammad Naimov",
      fighterIdentity: "muhammad naimov",
      americanOdds: 285,
    });
  });
});
