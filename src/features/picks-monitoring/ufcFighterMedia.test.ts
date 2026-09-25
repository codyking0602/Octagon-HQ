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
                id: "123",
                athlete: {
                  fullName: "Alpha Fighter",
                },
              },
              {
                id: "456",
                athlete: {
                  fullName: "Beta Fighter",
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


  it("handles current ESPN/UFC identity aliases without weakening generic fighter matching", () => {
    const aliasEvent: MonitoringEvent = {
      ...event,
      bouts: [{
        bout_id: "main-osmanli-black",
        red_fighter_slug: "mahammadali-osmanli",
        red_fighter_name: "Mahammadali Osmanli",
        blue_fighter_slug: "tina-black",
        blue_fighter_name: "Tina Black",
      }],
    };

    const result = adaptEspnUfcFighterMedia({
      event: aliasEvent,
      body: {
        events: [{
          id: "600061266",
          date: "2026-09-26T21:00:00Z",
          competitions: [{
            competitors: [
              {
                id: "5345640",
                athlete: { fullName: "Mehemmedeli Osmanli" },
              },
              {
                id: "4836549",
                athlete: { fullName: "Valesca Machado" },
              },
            ],
          }],
        }],
      },
    });

    expect(result).toEqual([
      {
        fighter_slug: "mahammadali-osmanli",
        display_name: "Mahammadali Osmanli",
        photo_url: "https://a.espncdn.com/i/headshots/mma/players/full/5345640.png",
        source: "espn",
        source_page_url: "https://www.espn.com/mma/fighter/_/id/5345640",
        source_fighter_id: "5345640",
      },
      {
        fighter_slug: "tina-black",
        display_name: "Tina Black",
        photo_url: "https://a.espncdn.com/i/headshots/mma/players/full/4836549.png",
        source: "espn",
        source_page_url: "https://www.espn.com/mma/fighter/_/id/4836549",
        source_fighter_id: "4836549",
      },
    ]);

    expect(ufcAthletePageUrl("mahammadali-osmanli"))
      .toBe("https://www.ufc.com/athlete/mehemmedeli-osmanli");
    expect(ufcAthletePageUrl("tina-black"))
      .toBe("https://www.ufc.com/athlete/valesca-machado");
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
