import { getSupabaseClient } from "../../lib/supabase";
import type { NbaGmDevSnapshot } from "./nbaGmDevModel";

export interface NbaGmDevelopmentRepository {
  load(): Promise<NbaGmDevSnapshot>;
  start(): Promise<NbaGmDevSnapshot>;
  spin(revision: number): Promise<NbaGmDevSnapshot>;
  pick(revision: number, playerId: string, slot: string): Promise<NbaGmDevSnapshot>;
  finish(revision: number): Promise<NbaGmDevSnapshot>;
}

/**
 * Reuses Football GM's private run/snapshot persistence. All state changes,
 * spin randomization, cap checks and final 82-game simulations occur in one
 * authenticated, owner-gated SQL transaction. No browser-generated spin/result.
 */
export function createNbaGmDevelopmentRepository(): NbaGmDevelopmentRepository | null {
  const client = getSupabaseClient();
  if (!client) return null;
  const request = async (
    action: "load" | "new" | "spin" | "pick" | "finish",
    revision?: number, playerId?: string, slot?: string,
  ): Promise<NbaGmDevSnapshot> => {
    const { data, error } = await client.rpc("nba_gm_dev_action", {
      p_action: action,
      p_expected_revision: revision ?? null,
      p_player_id: playerId ?? null,
      p_slot: slot ?? null,
    });
    if (error) throw new Error(error.message || "NBA GM development session unavailable");
    if (!data || typeof data !== "object" || !("catalog" in data) || !("run" in data)) {
      throw new Error("NBA GM development response is invalid");
    }
    return data as unknown as NbaGmDevSnapshot;
  };
  return {
    load: () => request("load"),
    start: () => request("new"),
    spin: revision => request("spin", revision),
    pick: (revision, playerId, slot) => request("pick", revision, playerId, slot),
    finish: revision => request("finish", revision),
  };
}
