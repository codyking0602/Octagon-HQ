import { describe, expect, it } from "vitest";
import type { MonitoringEvent } from "./manualMonitoringRunner";
import {
  adaptEspnUfcFighterMedia,
  espnUfcMediaScoreboardUrl,
  parseUfcAthletePhoto,
  ufcAthletePageUrl,
} from "./ufcFighterMedia";

const event: MonitoringEvent = {
  event_id: "ufc-fight-night-alpha-vs-beta-2026-09-26",
  name: "UFC Fight Night",
  subtitle: "Alpha vs. Beta",
  starts_at: "2026-09-27T00:00:00.000Z",
  locks_at: "2026-09-27T00:00:00.000Z",
  bouts: [{
    bout_id: "main-alpha-beta",
    red_fighter_slug: "alpha-fighter",
    red_fighter_name: "Alpha Fighter",
    blue_fighter_slug: "beta-fighter",
    blue_fighter_name: "Beta Fighter",
  }],
};

describe("UFC fighter media discovery", () => {
  it("uses the event's canonical local-date identity for the ESPN scoreboard query", () => {
    expect(espnUfcMediaScoreboardUrl(event)).toBe(
      "https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard?dates=20260926",
    );
  });

  it("extracts only matched ESPN MMA athlete headshots", () => {
    const result = adaptEspnUfcFighterMedia({
      event,
      body: {
        events: [{
          id: "401999999",
          date: "2026-09-27T00:00:00Z",
          competitions: [{
            competitors: [
              {
                athlete: {
                  id: "123",
                  fullName: "Alpha Fighter",
                  headshot: { href: "https://a.espncdn.com/i/headshots/mma/players/full/123.png" },
                },
              },
              {
                athlete: {
                  id: "456",
                  fullName: "Beta Fighter",
                  headshot: { href: "https://a.espncdn.com/i/headshots/mma/players/full/456.png" },
                },
              },
            ],
          }],
        }],
      },
    });

    expect(result).toEqual([
      {
        fighter_slug: "alpha-fighter",
        display_name: "Alpha Fighter",
        photo_url: "https://a.espncdn.com/i/headshots/mma/players/full/123.png",
        source: "espn",
        source_page_url: "https://www.espn.com/mma/fighter/_/id/123",
        source_fighter_id: "123",
      },
      {
        fighter_slug: "beta-fighter",
        display_name: "Beta Fighter",
        photo_url: "https://a.espncdn.com/i/headshots/mma/players/full/456.png",
        source: "espn",
        source_page_url: "https://www.espn.com/mma/fighter/_/id/456",
        source_fighter_id: "456",
      },
    ]);
  });

  it("accepts official UFC athlete-page social imagery and rejects placeholders", () => {
    const sourcePageUrl = ufcAthletePageUrl("alpha-fighter")!;
    expect(parseUfcAthletePhoto({
      html: '<meta property="og:image" content="https://dmxg5wxfqgb4u.cloudfront.net/styles/card/s3/alpha.png">',
      fighterSlug: "alpha-fighter",
      displayName: "Alpha Fighter",
      sourcePageUrl,
    })).toMatchObject({
      fighter_slug: "alpha-fighter",
      source: "ufc",
      source_page_url: sourcePageUrl,
    });

    expect(parseUfcAthletePhoto({
      html: '<meta property="og:image" content="https://example.test/silhouette.png">',
      fighterSlug: "alpha-fighter",
      displayName: "Alpha Fighter",
      sourcePageUrl,
    })).toBeNull();
  });
});
