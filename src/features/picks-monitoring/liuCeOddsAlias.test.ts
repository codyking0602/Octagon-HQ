import { describe, expect, it } from "vitest";
import { filterOddsToMonitoredEvent, type MonitoringEvent } from "./manualMonitoringRunner";
import { adaptTheOddsApiResponse } from "./theOddsApi";

const observed = "2026-08-24T18:00:00Z";
const event: MonitoringEvent = {
  event_id: "ufc-shanghai",
  source_event_key: "ufc-shanghai",
  name: "UFC Fight Night",
  subtitle: "Nurmagomedov vs. Song",
  starts_at: "2026-08-29T10:00:00Z",
  locks_at: "2026-08-29T10:00:00Z",
  bouts: [{
    bout_id: "liu-ce-junior-tafa",
    red_fighter_slug: "liu-ce",
    red_fighter_name: "Liu Ce",
    blue_fighter_slug: "junior-tafa",
    blue_fighter_name: "Junior Tafa",
  }],
};

const providerPayload = [{
  id: "provider-liu-tafa",
  sport_key: "mma_mixed_martial_arts",
  commence_time: "2026-08-29T10:00:00Z",
  home_team: "Ce Liu",
  away_team: "Junior Tafa",
  bookmakers: [{
    key: "draftkings",
    title: "DraftKings",
    last_update: observed,
    markets: [{
      key: "h2h",
      outcomes: [
        { name: "Ce Liu", price: -135 },
        { name: "Junior Tafa", price: 115 },
      ],
    }],
  }],
}];

describe("Liu Ce odds alias", () => {
  it("matches Ce Liu provider odds to canonical Liu Ce", () => {
    const odds = adaptTheOddsApiResponse({ status: 200, body: providerPayload }, observed);
    const filtered = filterOddsToMonitoredEvent(odds, event);

    expect(filtered.snapshots).toHaveLength(1);
    expect(filtered.snapshots[0]).toMatchObject({
      matchupIdentity: "junior tafa|liu ce",
      prices: [
        { fighterName: "Junior Tafa", fighterIdentity: "junior tafa", americanOdds: 115 },
        { fighterName: "Liu Ce", fighterIdentity: "liu ce", americanOdds: -135 },
      ],
    });
    expect(filtered.coverage).toEqual({ providerEvents: 1, completeSnapshots: 1, missingSnapshots: 0 });
  });
});
