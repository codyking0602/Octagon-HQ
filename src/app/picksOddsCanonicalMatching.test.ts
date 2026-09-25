import { describe, expect, it } from "vitest";
import { canonicalFightPair, fighterMatch } from "../../supabase/functions/sync-next-ufc-event/normalization.ts";
import { filterOddsToMonitoredEvent, type MonitoringEvent } from "../features/picks-monitoring/manualMonitoringRunner.ts";
import { fighterOddsIdentity, type NormalizedFightOddsSnapshot, type OddsAdapterResult } from "../features/picks-monitoring/oddsModel.ts";
import { adaptTheOddsApiResponse, buildTheOddsApiEventsUrl, buildTheOddsApiRequestUrl, providerEventIdsNearMonitoredStart } from "../features/picks-monitoring/theOddsApi.ts";

const event: MonitoringEvent = {
  event_id: "ufc-fight-night-gamrot-vs-salkilld-2026-08-09",
  source_event_key: "ufc-fight-night-gamrot-vs-salkilld-2026-08-09",
  name: "UFC Fight Night",
  subtitle: "Gamrot vs Salkilld",
  starts_at: "2026-08-09T00:00:00Z",
  locks_at: "2026-08-09T00:00:00Z",
  bouts: [
    {
      bout_id: "ferreira-quarantillo",
      red_fighter_slug: "diego-ferreira",
      red_fighter_name: "Diego Ferreira",
      blue_fighter_slug: "billy-quarantillo",
      blue_fighter_name: "Billy Quarantillo",
    },
    {
      bout_id: "elkins-del-valle",
      red_fighter_slug: "darren-elkins",
      red_fighter_name: "Darren Elkins",
      blue_fighter_slug: "yadier-del-valle",
      blue_fighter_name: "Yadier del Valle",
    },
    {
      bout_id: "goff-miller",
      red_fighter_slug: "billy-ray-goff",
      red_fighter_name: "Billy Ray Goff",
      blue_fighter_slug: "ty-miller",
      blue_fighter_name: "Ty Miller",
    },
  ],
};

function snapshot(
  sourceEventId: string,
  left: string,
  leftOdds: number,
  right: string,
  rightOdds: number,
  commenceTime = "2026-08-08T22:00:00Z",
): NormalizedFightOddsSnapshot {
  const prices = [
    { fighterName: left, fighterIdentity: left.toLowerCase(), americanOdds: leftOdds },
    { fighterName: right, fighterIdentity: right.toLowerCase(), americanOdds: rightOdds },
  ] as const;
  return {
    provider: "the-odds-api",
    sportKey: "mma_mixed_martial_arts",
    sourceEventId,
    sourceEventIdentity: `mma_mixed_martial_arts:${sourceEventId}`,
    matchupIdentity: canonicalFightPair(left, right),
    commenceTime,
    sportsbook: "draftkings",
    sportsbookTitle: "DraftKings",
    sportsbookUpdatedAt: "2026-08-08T16:00:00Z",
    fetchedAt: "2026-08-08T16:01:00Z",
    prices,
  };
}

function oddsResult(snapshots: NormalizedFightOddsSnapshot[], diagnostics: OddsAdapterResult["diagnostics"] = []): OddsAdapterResult {
  return {
    snapshots,
    diagnostics,
    coverage: { providerEvents: snapshots.length, completeSnapshots: snapshots.length, missingSnapshots: 0 },
    quota: { requestsRemaining: 480, requestsUsed: 20, lastRequestCost: 1 },
  };
}

describe("Picks odds canonical fighter matching", () => {
  it("accepts durable UFC fighter-name variants without changing canonical Picks identities", () => {
    expect(fighterMatch("Diego Ferreira", "Carlos Diego Ferreira")).toBe(true);
    expect(fighterMatch("Yadier del Valle", "Yadier Delvalle")).toBe(true);
    expect(fighterMatch("Ty Miller", "Ty Thriller Miller")).toBe(true);

    const filtered = filterOddsToMonitoredEvent(oddsResult([
      snapshot("ferreira-provider", "Carlos Diego Ferreira", -180, "Billy Quarantillo", 150),
      snapshot("elkins-provider", "Darren Elkins", 500, "Yadier Delvalle", -700),
      snapshot("miller-provider", "Billy Goff", 230, "Ty Thriller Miller", -285),
    ]), event);

    expect(filtered.coverage).toEqual({ providerEvents: 3, completeSnapshots: 3, missingSnapshots: 0 });
    expect(filtered.diagnostics).toEqual([]);
    expect(filtered.snapshots.map((item) => item.matchupIdentity).sort()).toEqual([
      canonicalFightPair("Diego Ferreira", "Billy Quarantillo"),
      canonicalFightPair("Darren Elkins", "Yadier del Valle"),
      canonicalFightPair("Billy Ray Goff", "Ty Miller"),
    ].sort());
    expect(filtered.snapshots.flatMap((item) => item.prices.map((price) => price.fighterIdentity)).sort()).toEqual([
      "diego ferreira",
      "billy quarantillo",
      "darren elkins",
      "yadier del valle",
      "billy ray goff",
      "ty miller",
    ].sort());
  });

  it("accepts one provider event when its sportsbook outcomes use a shorter durable fighter name", () => {
    const adapted = adaptTheOddsApiResponse({
      status: 200,
      body: [{
        id: "ferreira-provider",
        sport_key: "mma_mixed_martial_arts",
        commence_time: "2026-08-08T22:00:00Z",
        home_team: "Carlos Diego Ferreira",
        away_team: "Billy Quarantillo",
        bookmakers: [{
          key: "draftkings",
          title: "DraftKings",
          last_update: "2026-08-08T16:00:00Z",
          markets: [{
            key: "h2h",
            outcomes: [
              { name: "Diego Ferreira", price: -180 },
              { name: "Billy Quarantillo", price: 150 },
            ],
          }],
        }],
      }],
    }, "2026-08-08T16:01:00Z");

    expect(adapted.diagnostics).toEqual([]);
    expect(adapted.snapshots).toHaveLength(1);
    const filtered = filterOddsToMonitoredEvent(adapted, event);
    expect(filtered.coverage.completeSnapshots).toBe(1);
    expect(filtered.snapshots[0].matchupIdentity).toBe(canonicalFightPair("Diego Ferreira", "Billy Quarantillo"));
    expect(filtered.snapshots[0].prices).toEqual(expect.arrayContaining([
      expect.objectContaining({ fighterIdentity: "diego ferreira", americanOdds: -180 }),
      expect.objectContaining({ fighterIdentity: "billy quarantillo", americanOdds: 150 }),
    ]));
  });

  it("maps provider diagnostics for a name variant back to the canonical monitored bout", () => {
    const filtered = filterOddsToMonitoredEvent(oddsResult([
      snapshot("ferreira-provider", "Carlos Diego Ferreira", -180, "Billy Quarantillo", 150),
    ], [{
      code: "missing_complete_bookmaker",
      severity: "warning",
      message: "No configured sportsbook supplied one complete two-fighter moneyline snapshot.",
      sourceEventId: "elkins-provider",
      matchupIdentity: canonicalFightPair("Darren Elkins", "Yadier Delvalle"),
    }]), event);

    expect(filtered.diagnostics).toContainEqual(expect.objectContaining({
      code: "missing_complete_bookmaker",
      matchupIdentity: canonicalFightPair("Darren Elkins", "Yadier del Valle"),
    }));
  });



  it("treats official same-person UFC name corrections as one odds identity", () => {
    expect(fighterOddsIdentity("Valesca Machado")).toBe(fighterOddsIdentity("Tina Black"));
    expect(fighterOddsIdentity("Mehemmedeli Osmanli")).toBe(fighterOddsIdentity("Mahammadali Osmanli"));

    const correctedEvent: MonitoringEvent = {
      ...event,
      starts_at: "2026-09-27T00:00:00Z",
      bouts: [
        {
          bout_id: "amaya-black",
          red_fighter_slug: "melissa-amaya",
          red_fighter_name: "Melissa Amaya",
          blue_fighter_slug: "tina-black",
          blue_fighter_name: "Tina Black",
        },
        {
          bout_id: "osmanli-akylbek",
          red_fighter_slug: "mahammadali-osmanli",
          red_fighter_name: "Mahammadali Osmanli",
          blue_fighter_slug: "ilimbek-akylbek",
          blue_fighter_name: "Ilimbek Akylbek",
        },
      ],
    };
    const adapted = adaptTheOddsApiResponse({
      status: 200,
      body: [
        {
          id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          sport_key: "mma_mixed_martial_arts",
          commence_time: "2026-09-26T21:00:00Z",
          home_team: "Melissa Amaya",
          away_team: "Valesca Machado",
          bookmakers: [{
            key: "draftkings",
            title: "DraftKings",
            last_update: "2026-09-25T12:00:00Z",
            markets: [{ key: "h2h", outcomes: [
              { name: "Melissa Amaya", price: 180 },
              { name: "Valesca Machado", price: -218 },
            ] }],
          }],
        },
        {
          id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          sport_key: "mma_mixed_martial_arts",
          commence_time: "2026-09-26T21:00:00Z",
          home_team: "Mehemmedeli Osmanli",
          away_team: "Ilimbek Akylbek Uulu",
          bookmakers: [{
            key: "draftkings",
            title: "DraftKings",
            last_update: "2026-09-25T12:00:00Z",
            markets: [{ key: "h2h", outcomes: [
              { name: "Mehemmedeli Osmanli", price: -290 },
              { name: "Ilimbek Akylbek Uulu", price: 235 },
            ] }],
          }],
        },
      ],
    }, "2026-09-25T12:01:00Z");

    const filtered = filterOddsToMonitoredEvent(adapted, correctedEvent);
    expect(filtered.snapshots).toHaveLength(2);
    expect(filtered.coverage).toEqual({ providerEvents: 2, completeSnapshots: 2, missingSnapshots: 0 });
    expect(filtered.snapshots.flatMap((item) => item.prices)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fighterName: "Tina Black", americanOdds: -218 }),
      expect.objectContaining({ fighterName: "Mahammadali Osmanli", americanOdds: -290 }),
    ]));
  });

  it("matches an unknown future provider name through the stable UFC athlete slug", () => {
    const renamedEvent: MonitoringEvent = {
      ...event,
      bouts: [{
        bout_id: "future-rename",
        red_fighter_slug: "original-provider-name",
        red_fighter_name: "Completely New Public Name",
        blue_fighter_slug: "billy-quarantillo",
        blue_fighter_name: "Billy Quarantillo",
      }],
    };
    const filtered = filterOddsToMonitoredEvent(oddsResult([
      snapshot("future-rename-provider", "Original Provider Name", -145, "Billy Quarantillo", 125),
    ]), renamedEvent);

    expect(filtered.coverage).toEqual({ providerEvents: 1, completeSnapshots: 1, missingSnapshots: 0 });
    expect(filtered.diagnostics).toEqual([]);
    expect(filtered.snapshots[0]).toMatchObject({
      matchupIdentity: fighterOddsIdentity("Billy Quarantillo") + "|" + fighterOddsIdentity("Completely New Public Name"),
      prices: expect.arrayContaining([
        expect.objectContaining({ fighterName: "Completely New Public Name", americanOdds: -145 }),
        expect.objectContaining({ fighterName: "Billy Quarantillo", americanOdds: 125 }),
      ]),
    });
  });

  it("uses quota-free event discovery to constrain the same single odds request", () => {
    const eventsUrl = buildTheOddsApiEventsUrl("secret", "https://example.test");
    expect(eventsUrl.pathname).toBe("/v4/sports/mma_mixed_martial_arts/events");

    const ids = providerEventIdsNearMonitoredStart([
      { id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", sport_key: "mma_mixed_martial_arts", commence_time: "2026-09-26T21:00:00Z" },
      { id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", sport_key: "mma_mixed_martial_arts", commence_time: "2026-09-27T01:00:00Z" },
      { id: "cccccccccccccccccccccccccccccccc", sport_key: "mma_mixed_martial_arts", commence_time: "2026-10-03T21:00:00Z" },
    ], "2026-09-27T00:00:00Z");

    expect(ids).toEqual([
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ]);
    const oddsUrl = buildTheOddsApiRequestUrl("secret", "https://example.test", ids);
    expect(oddsUrl.searchParams.get("eventIds")).toBe(ids.join(","));
    expect(oddsUrl.searchParams.get("markets")).toBe("h2h");
    expect(oddsUrl.searchParams.get("bookmakers")).toBe("draftkings,fanduel,betmgm,caesars");
  });

  it("fails closed when multiple provider aliases map to the same canonical bout", () => {
    const filtered = filterOddsToMonitoredEvent(oddsResult([
      snapshot("ferreira-provider-1", "Diego Ferreira", -180, "Billy Quarantillo", 150),
      snapshot("ferreira-provider-2", "Carlos Diego Ferreira", -175, "Billy Quarantillo", 145),
    ]), event);

    expect(filtered.snapshots).toEqual([]);
    expect(filtered.diagnostics).toContainEqual(expect.objectContaining({
      code: "ambiguous_matchup",
      severity: "error",
      matchupIdentity: canonicalFightPair("Diego Ferreira", "Billy Quarantillo"),
    }));
  });
});
