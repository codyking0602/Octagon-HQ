import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  adaptTheOddsApiResponse,
  buildTheOddsApiRequestUrl,
} from "../features/picks-monitoring/theOddsApi.ts";
import { canonicalFightPair } from "../../supabase/functions/sync-next-ufc-event/normalization.ts";

const fetchedAt = "2026-08-10T15:00:00Z";

function fixture(name: string) {
  return JSON.parse(readFileSync(
    `src/features/picks-monitoring/__fixtures__/${name}.json`,
    "utf8",
  ));
}

function adapt(body: unknown, headers: Record<string, string> = {}) {
  return adaptTheOddsApiResponse({ status: 200, body, headers }, fetchedAt);
}

describe("Phase 1 The Odds API adapter", () => {
  it("builds the locked MMA moneyline request without adding a second provider", () => {
    const url = buildTheOddsApiRequestUrl("test-key");

    expect(url.origin).toBe("https://api.the-odds-api.com");
    expect(url.pathname).toBe("/v4/sports/mma_mixed_martial_arts/odds");
    expect(url.searchParams.get("markets")).toBe("h2h");
    expect(url.searchParams.get("bookmakers")).toBe("draftkings,fanduel");
    expect(url.searchParams.get("oddsFormat")).toBe("american");
    expect(url.searchParams.get("dateFormat")).toBe("iso");
  });

  it("prefers one complete DraftKings snapshot and preserves its provenance", () => {
    const result = adapt(fixture("draftkings-primary"));

    expect(result.diagnostics).toEqual([]);
    expect(result.coverage).toEqual({ providerEvents: 1, completeSnapshots: 1, missingSnapshots: 0 });
    expect(result.snapshots).toHaveLength(1);
    expect(result.snapshots[0]).toMatchObject({
      provider: "the-odds-api",
      sportKey: "mma_mixed_martial_arts",
      sourceEventId: "mma-event-medic-rodriguez",
      sourceEventIdentity: "mma_mixed_martial_arts:mma-event-medic-rodriguez",
      matchupIdentity: canonicalFightPair("Uroš Medić", "Daniel Rodriguez"),
      commenceTime: "2026-08-15T22:00:00Z",
      sportsbook: "draftkings",
      sportsbookTitle: "DraftKings",
      sportsbookUpdatedAt: "2026-08-10T12:05:00Z",
      fetchedAt,
    });
    expect(result.snapshots[0].prices).toEqual([
      { fighterName: "Daniel Rodriguez", fighterIdentity: "daniel rodriguez", americanOdds: -130 },
      { fighterName: "Uroš Medić", fighterIdentity: "uros medic", americanOdds: 110 },
    ]);
  });

  it("uses FanDuel only when DraftKings lacks a complete two-sided market", () => {
    const result = adapt(fixture("fanduel-fallback"));

    expect(result.snapshots).toHaveLength(1);
    expect(result.snapshots[0].sportsbook).toBe("fanduel");
    expect(result.snapshots[0].prices.map((price) => price.americanOdds)).toEqual([-135, 115]);
    expect(result.snapshots[0].prices.some((price) => price.americanOdds === -120)).toBe(false);
  });

  it("accepts partial event coverage without failing the complete matchup", () => {
    const result = adapt(fixture("partial-coverage"));

    expect(result.coverage).toEqual({ providerEvents: 2, completeSnapshots: 1, missingSnapshots: 1 });
    expect(result.snapshots[0].sourceEventId).toBe("mma-event-tybura-stirling");
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: "missing_complete_bookmaker",
      sourceEventId: "mma-event-janicic-cepo",
    }));
  });

  it("treats reversed corners and normalized fighter formatting as one matchup", () => {
    const first = adapt(fixture("draftkings-primary")).snapshots[0];
    const reversed = adapt([{
      id: "mma-event-reversed",
      sport_key: "mma_mixed_martial_arts",
      commence_time: "2026-08-15T22:00:00Z",
      home_team: "Daniel Rodriguez",
      away_team: "Uros Medic Jr.",
      bookmakers: [{
        key: "draftkings",
        title: "DraftKings",
        last_update: "2026-08-10T12:06:00Z",
        markets: [{
          key: "h2h",
          outcomes: [
            { name: "Uroš Medić", price: 105 },
            { name: "Daniel Rodriguez", price: -125 },
          ],
        }],
      }],
    }]).snapshots[0];

    expect(reversed.matchupIdentity).toBe(first.matchupIdentity);
    expect(reversed.prices.map((price) => price.fighterIdentity)).toEqual([
      "daniel rodriguez",
      "uros medic",
    ]);
  });

  it("fails closed when duplicate provider events normalize to one matchup", () => {
    const duplicate = fixture("draftkings-primary")[0];
    const result = adapt([
      duplicate,
      { ...duplicate, id: "mma-event-medic-rodriguez-duplicate" },
    ]);

    expect(result.snapshots).toEqual([]);
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: "ambiguous_matchup",
      matchupIdentity: canonicalFightPair("Uroš Medić", "Daniel Rodriguez"),
    }));
  });

  it("rejects malformed three-way markets and invalid American prices", () => {
    const result = adapt([{
      id: "mma-event-malformed",
      sport_key: "mma_mixed_martial_arts",
      commence_time: "2026-08-16T01:00:00Z",
      home_team: "Gilbert Urbina",
      away_team: "Dusko Todorovic",
      bookmakers: [{
        key: "draftkings",
        title: "DraftKings",
        last_update: "2026-08-10T14:30:00Z",
        markets: [{
          key: "h2h",
          outcomes: [
            { name: "Gilbert Urbina", price: 90 },
            { name: "Dusko Todorovic", price: -110 },
            { name: "Draw", price: 2500 },
          ],
        }],
      }],
    }]);

    expect(result.snapshots).toEqual([]);
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: "missing_complete_bookmaker",
      sourceEventId: "mma-event-malformed",
    }));
  });

  it("returns provider failures and quota headers as diagnostics rather than fabricated odds", () => {
    const result = adaptTheOddsApiResponse({
      status: 429,
      body: { error_code: "OUT_OF_USAGE_CREDITS", message: "Usage quota exhausted." },
      headers: {
        "x-requests-remaining": "0",
        "x-requests-used": "500",
        "x-requests-last": "1",
      },
    }, fetchedAt);

    expect(result.snapshots).toEqual([]);
    expect(result.diagnostics).toEqual([expect.objectContaining({
      code: "provider_http_error",
      message: "Usage quota exhausted.",
    })]);
    expect(result.quota).toEqual({
      requestsRemaining: 0,
      requestsUsed: 500,
      lastRequestCost: 1,
    });
  });
});
