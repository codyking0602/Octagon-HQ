import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nbaGmDevSeasonPicks, type NbaGmDevRun } from "./nbaGmDevModel";
import { createNbaGmDevRepository } from "./nbaGmDevRepository";

const slots = ["PG", "SG", "SF", "PF", "C", "GUARD", "BIG"] as const;
const draft = slots.map((slot, i) => ({ slot, playerId: "player-" + (i + 1) }));
const yr2 = draft.map(p => p.slot === "PG" ? { ...p, playerId: "player-6" } :
  p.slot === "GUARD" ? { ...p, playerId: "player-1" } : p);
const yr3 = draft.map(p => p.slot === "C" ? { ...p, playerId: "player-7" } :
  p.slot === "BIG" ? { ...p, playerId: "player-5" } : p);
const season = (year: number, picks: typeof draft) => ({
  season: year, wins: 47, losses: 35, offense: 89, defense: 87,
  positionalFit: 27, finish: "Conference Semifinals", teamOverall: 88,
  titleOdds: 14.5, seasonPicks: picks,
});
const state: NbaGmDevRun = {
  version: "nba-gm-dev-v2", economyVersion: 4, simulationModelVersion: 12,
  lineupModelVersion: 2, developmentModelVersion: 2,
  seed: "nba-gm-v12-season-snapshot-regression", phase: "final",
  picks: yr3, yearOnePicks: draft, pendingTeam: null, pendingSlot: null,
  spinIndex: 7, caps: [175_000_000, 175_000_000, 175_000_000],
  results: [season(1, draft), season(2, yr2), season(3, yr3)],
  shopPlayerId: null, tradeTeam: null, tradeAttempts: 0, tradesUsed: 0,
  freeAgencyTeam: null, freeAgencyVisits: 0, releasedIds: [],
  scoreBreakdown: { score: 91, roster: 92, regularSeason: 85, playoffs: 90,
    weights: [0.9, 0.03, 0.07] },
};

describe("NBA GM V12 server-authoritative season snapshots", () => {
  it("parses real V12-shaped RPC responses, preserves all seven positions and the 175M cap", async () => {
    const repo = createNbaGmDevRepository({
      rpc: async () => ({ data: state, error: null }),
    });
    const read = await repo!.action("load");
    expect(read?.simulationModelVersion).toBe(12);
    expect(read?.lineupModelVersion).toBe(2);
    expect(read?.results).toHaveLength(3);
    expect(read?.caps).toEqual([175_000_000, 175_000_000, 175_000_000]);
    for (const year of [1, 2, 3] as const) {
      expect(nbaGmDevSeasonPicks(read!, [], year)).toEqual(state.results[year - 1]!.seasonPicks);
      expect(new Set(nbaGmDevSeasonPicks(read!, [], year).map(p => p.slot)).size).toBe(7);
    }
    expect(nbaGmDevSeasonPicks(read!, [], 2)).not.toEqual(read?.picks);
    expect(read?.yearOnePicks).toEqual(draft);
  });

  it("never guesses a V12 lineup from older V10 client logic", () => {
    const missingYr2 = { ...state,
      results: state.results.filter(s => s.season !== 2) };
    expect(nbaGmDevSeasonPicks(missingYr2, [], 2)).toEqual(yr3);
    expect(nbaGmDevSeasonPicks(state, [], 1)).toEqual(draft);
  });

  it("guards the server-side lineup payload and test-only public action cutover", () => {
    const migration = readFileSync(
      "supabase/migrations/202612310939_nba_gm_v12_six_skill_composition_pilot.sql", "utf8");
    const candidate = readFileSync(
      "supabase/tests/nba_gm_v12_release_candidate_install.sql", "utf8");
    const threeSeasons = readFileSync(
      "supabase/tests/nba_gm_v12_release_candidate_three_seasons.sql", "utf8");
    expect(migration).toContain("'seasonPicks',v_v12_lineup");
    expect(candidate).toContain("'simulationModelVersion',12,'lineupModelVersion',2");
    expect(candidate).toContain("private.nba_gm_v10_season_lineup(v_next,3)");
    expect(threeSeasons).toContain("public.nba_gm_dev_action('advance')");
    expect(threeSeasons).toContain("private.nba_gm_v12_final_score(v_state)");
  });
});
