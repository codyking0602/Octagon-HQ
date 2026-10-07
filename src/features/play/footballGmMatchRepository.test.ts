import { describe, expect, it } from "vitest";
import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterEntry } from "../back-room/footballGmEngine";
import { FOOTBALL_GM_VERSION, footballGmSeasonResultV2 } from "../back-room/footballGmStrategy";
import { createFootballGmMatchRepository } from "./footballGmMatchRepository";

function roster(): FootballGmRosterEntry[] {
  const used = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
    const player = FOOTBALL_GM_PLAYER_POOL.find((candidate) => !used.has(candidate.id) && candidate.eligibleSlots.includes(slot));
    if (!player) throw new Error(`missing ${slot}`);
    used.add(player.id);
    return { slot, playerId: player.id, acquired: "draft" as const };
  });
}

function state(year1Result: ReturnType<typeof footballGmSeasonResultV2>) {
  const active = "11111111-1111-4111-8111-111111111111";
  return {
    code: "GM1234",
    seed: "0123456789abcdef0123456789abcdef",
    phase: "offseason",
    turn_count: 14,
    current_turn_profile_id: active,
    pending_team_code: null,
    offseason_first_profile_id: active,
    participants: [
      { id: active, display_name: "A", seat_order: 0, accepted: true, run_state: {}, year1_result: year1Result, year1_acknowledged: true, offseason_complete: false },
      { id: "22222222-2222-4222-8222-222222222222", display_name: "B", seat_order: 1, accepted: true, run_state: {}, year1_result: year1Result, year1_acknowledged: true, offseason_complete: false },
    ],
    opened_at: null,
    completed_at: null,
    declined_at: null,
    forfeited_by_profile_id: null,
    forfeited_at: null,
  };
}

describe("footballGmMatchRepository", () => {
  it("locks the submitted Year 1 result and persists all three resolved seasons at offseason completion", async () => {
    const team = roster();
    const seed = "0123456789abcdef0123456789abcdef:11111111-1111-4111-8111-111111111111";
    const year1 = footballGmSeasonResultV2({ seed, yearOneRoster: team, roster: team, year: 1 });
    const calls: Array<{ name: string; args?: Record<string, unknown> }> = [];
    const client = {
      async rpc(name: string, args?: Record<string, unknown>) {
        calls.push({ name, args });
        return { data: state(year1), error: null };
      },
    };
    const repository = createFootballGmMatchRepository(client)!;
    await repository.finishOffseason("GM1234", {
      version: "football-gm-v8-head-to-head",
      seed,
      roster: team,
      finalRoster: team,
    });
    expect(calls.map((call) => call.name)).toEqual(["get_my_football_gm_match", "finish_football_gm_offseason"]);
    const payload = calls[1]!.args?.p_run_state as Record<string, unknown>;
    expect(payload.version).toBe(FOOTBALL_GM_VERSION);
    const seasons = payload.resolvedSeasons as Array<Record<string, unknown>>;
    expect(seasons).toHaveLength(3);
    expect(seasons[0]).toEqual(year1);
    expect(seasons.map((season) => season.year)).toEqual([1, 2, 3]);
  });
});
