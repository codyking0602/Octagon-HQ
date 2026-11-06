import { describe, expect, it } from "vitest";
import { createNbaGmDevRepository } from "./nbaGmDevRepository";
import type { NbaGmDevRun } from "./nbaGmDevModel";

const v13Start: NbaGmDevRun = {
  version: "nba-gm-dev-v2",
  economyVersion: 4,
  developmentModelVersion: 2,
  simulationModelVersion: 13,
  lineupModelVersion: 2,
  seed: "nba-gm-v13-production-client-contract",
  phase: "draft",
  picks: [],
  yearOnePicks: [],
  pendingTeam: null,
  pendingSlot: null,
  spinIndex: 0,
  caps: [175_000_000, 175_000_000, 175_000_000],
  results: [],
  shopPlayerId: null,
  tradeTeam: null,
  tradeAttempts: 0,
  tradesUsed: 0,
  freeAgencyTeam: null,
  freeAgencyVisits: 0,
  releasedIds: [],
};

describe("NBA GM V13 frontend and historical save contract", () => {
  it("accepts server-created V13 franchises on start and subsequent load", async () => {
    const operations: string[] = [];
    const repo = createNbaGmDevRepository({
      rpc: async (_name, args) => {
        operations.push(String(args?.p_action));
        return { data: v13Start, error: null };
      },
    });
    const started = await repo!.action("start");
    const loaded = await repo!.action("load");
    expect(operations).toEqual(["start", "load"]);
    for (const state of [started, loaded]) {
      expect(state?.simulationModelVersion).toBe(13);
      expect(state?.lineupModelVersion).toBe(2);
      expect(state?.caps).toEqual([175_000_000, 175_000_000, 175_000_000]);
      expect(state?.phase).toBe("draft");
    }
  });

  it("keeps existing V12 saves loadable without rewriting their simulation version", async () => {
    const saved: NbaGmDevRun = { ...v13Start, simulationModelVersion: 12, seed: "nba-gm-v12-saved-franchise" };
    const repo = createNbaGmDevRepository({
      rpc: async () => ({ data: saved, error: null }),
    });
    const loaded = await repo!.action("load");
    expect(loaded?.simulationModelVersion).toBe(12);
    expect(loaded?.seed).toBe(saved.seed);
  });

  it("does not silently accept unimplemented future simulation versions", async () => {
    const repo = createNbaGmDevRepository({
      rpc: async () => ({ data: { ...v13Start, simulationModelVersion: 14 }, error: null }),
    });
    await expect(repo!.action("start")).rejects.toThrow();
  });
});
