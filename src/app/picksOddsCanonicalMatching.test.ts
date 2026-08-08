import { describe, expect, it } from "vitest";
import { canonicalFightPair, fighterMatch } from "../../supabase/functions/sync-next-ufc-event/normalization.ts";
import { filterOddsToMonitoredEvent, type MonitoringEvent } from "../features/picks-monitoring/manualMonitoringRunner.ts";
import type { NormalizedFightOddsSnapshot, OddsAdapterResult } from "../features/picks-monitoring/oddsModel.ts";
import { adaptTheOddsApiResponse } from "../features/picks-monitoring/theOddsApi.ts";

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
      snapshot("miller-provider", "Billy Ray Goff", 230, "Ty Thriller Miller", -285),
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
      message: "Neither DraftKings nor FanDuel supplied one complete two-fighter moneyline snapshot.",
      sourceEventId: "elkins-provider",
      matchupIdentity: canonicalFightPair("Darren Elkins", "Yadier Delvalle"),
    }]), event);

    expect(filtered.diagnostics).toContainEqual(expect.objectContaining({
      code: "missing_complete_bookmaker",
      matchupIdentity: canonicalFightPair("Darren Elkins", "Yadier del Valle"),
    }));
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
