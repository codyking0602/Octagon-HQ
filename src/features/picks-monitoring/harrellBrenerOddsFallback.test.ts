import { describe, expect, it } from "vitest";
import { filterOddsToMonitoredEvent, type MonitoringEvent } from "./manualMonitoringRunner";
import { adaptTheOddsApiResponse, buildTheOddsApiRequestUrl } from "./theOddsApi";

const observed = "2026-09-21T18:00:00Z";

const event: MonitoringEvent = {
  event_id: "ufc-fight-night-raul-rosas-jr-vs-raoni-barcelos-2026-09-26",
  source_event_key: "event/ufc-fight-night-september-26-2026",
  name: "UFC Fight Night",
  subtitle: "Raul Rosas Jr vs. Raoni Barcelos",
  starts_at: "2026-09-27T00:00:00Z",
  locks_at: "2026-09-27T00:00:00Z",
  bouts: [{
    bout_id: "main-josiah-harrell-elves-brener",
    red_fighter_slug: "josiah-harrell",
    red_fighter_name: "Josiah Harrell",
    blue_fighter_slug: "elves-brener",
    blue_fighter_name: "Elves Brener",
  }],
};

describe("Harrell vs Brener odds coverage", () => {
  it("requests BetMGM and Caesars after DraftKings/FanDuel so a bout missing from those books can still appear", () => {
    const url = new URL(buildTheOddsApiRequestUrl("test-key"));
    expect(url.searchParams.get("bookmakers")).toBe("draftkings,fanduel,betmgm,caesars");
  });

  it("uses a complete BetMGM moneyline when DraftKings and FanDuel do not return the bout", () => {
    const payload = [{
      id: "provider-harrell-brener",
      sport_key: "mma_mixed_martial_arts",
      commence_time: "2026-09-27T02:00:00Z",
      home_team: "Josiah Harrell",
      away_team: "Elves Brener",
      bookmakers: [{
        key: "betmgm",
        title: "BetMGM",
        last_update: observed,
        markets: [{
          key: "h2h",
          outcomes: [
            { name: "Josiah Harrell", price: -110 },
            { name: "Elves Brener", price: -110 },
          ],
        }],
      }],
    }];

    const adapted = adaptTheOddsApiResponse({ status: 200, body: payload }, observed);
    const filtered = filterOddsToMonitoredEvent(adapted, event);

    expect(filtered.snapshots).toHaveLength(1);
    expect(filtered.snapshots[0]).toMatchObject({
      sportsbook: "betmgm",
      sportsbookTitle: "BetMGM",
      matchupIdentity: "elves brener|josiah harrell",
      prices: [
        { fighterName: "Josiah Harrell", fighterIdentity: "josiah harrell", americanOdds: -110 },
        { fighterName: "Elves Brener", fighterIdentity: "elves brener", americanOdds: -110 },
      ],
    });
  });
});
