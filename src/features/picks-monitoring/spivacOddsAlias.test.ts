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

describe("Spivac odds alias", () => {
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
});
