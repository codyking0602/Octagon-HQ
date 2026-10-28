import { describe, expect, it } from "vitest";
import type { OddsAdapterResult } from "./oddsModel";
import {
  buildMonitoringRunPayload,
  monitoringRunStatus,
  snapshotIsBeforeLock,
} from "./monitoringStorageModel";

function oddsResult(overrides: Partial<OddsAdapterResult> = {}): OddsAdapterResult {
  return {
    snapshots: [
      {
        provider: "the-odds-api",
        sportKey: "mma_mixed_martial_arts",
        sourceEventId: "provider-event-1",
        sourceEventIdentity: "ufc-fight-night-example",
        matchupIdentity: "fighter-alpha|fighter-beta",
        commenceTime: "2026-08-01T23:00:00.000Z",
        sportsbook: "draftkings",
        sportsbookTitle: "DraftKings",
        sportsbookUpdatedAt: "2026-08-01T18:00:00.000Z",
        fetchedAt: "2026-08-01T18:01:00.000Z",
        prices: [
          { fighterName: "Fighter Alpha", fighterIdentity: "fighter-alpha", americanOdds: -130 },
          { fighterName: "Fighter Beta", fighterIdentity: "fighter-beta", americanOdds: 110 },
        ],
      },
    ],
    diagnostics: [],
    coverage: { providerEvents: 1, completeSnapshots: 1, missingSnapshots: 0 },
    quota: { requestsRemaining: 499, requestsUsed: 1, lastRequestCost: 1 },
    ...overrides,
  };
}

describe("monitoring storage model", () => {
  it("maps the normalized odds adapter result into the atomic storage payload", () => {
    const payload = buildMonitoringRunPayload({
      triggerKind: "manual",
      sourceEventIdentity: "ufc-fight-night-example",
      eventId: "ufc-fight-night-example-2026-08-01",
      locksAt: "2026-08-01T22:00:00.000Z",
      startedAt: "2026-08-01T18:00:59.000Z",
      completedAt: "2026-08-01T18:01:01.000Z",
      cardSource: "ufc.com+mma-mania",
      cardSourceUrl: "https://www.mmamania.com/example-card",
      odds: oddsResult(),
      boutIdByMatchup: { "fighter-alpha|fighter-beta": "fighter-alpha-fighter-beta" },
    });

    expect(payload.status).toBe("completed");
    expect(payload.quota).toEqual({
      requests_remaining: 499,
      requests_used: 1,
      last_request_cost: 1,
    });
    expect(payload.coverage).toEqual({
      provider_events: 1,
      complete_snapshots: 1,
      missing_snapshots: 0,
    });
    expect(payload.odds_snapshots[0]).toMatchObject({
      provider: "the-odds-api",
      sport_key: "mma_mixed_martial_arts",
      sportsbook: "draftkings",
      bout_id: "fighter-alpha-fighter-beta",
      prices: [
        { fighter_identity: "fighter-alpha", american_odds: -130 },
        { fighter_identity: "fighter-beta", american_odds: 110 },
      ],
    });
  });

  it("classifies clean, partial, and failed provider results deterministically", () => {
    expect(monitoringRunStatus(oddsResult())).toBe("completed");
    expect(monitoringRunStatus(oddsResult({
      diagnostics: [{ code: "missing_complete_bookmaker", severity: "warning", message: "Missing line" }],
      coverage: { providerEvents: 2, completeSnapshots: 1, missingSnapshots: 1 },
    }))).toBe("partial");
    expect(monitoringRunStatus(oddsResult({
      snapshots: [],
      diagnostics: [{ code: "provider_http_error", severity: "error", message: "Provider failed" }],
      coverage: { providerEvents: 0, completeSnapshots: 0, missingSnapshots: 0 },
    }))).toBe("failed");
  });

  it("treats locks_at as a strict odds-application boundary", () => {
    const lock = "2026-08-01T22:00:00.000Z";
    expect(snapshotIsBeforeLock("2026-08-01T21:59:59.999Z", lock)).toBe(true);
    expect(snapshotIsBeforeLock(lock, lock)).toBe(false);
    expect(snapshotIsBeforeLock("2026-08-01T22:00:00.001Z", lock)).toBe(false);
    expect(snapshotIsBeforeLock("2026-08-01T21:00:00.000Z", null)).toBe(false);
  });
});
