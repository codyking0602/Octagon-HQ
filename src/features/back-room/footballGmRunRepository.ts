import { getSupabaseClient } from "../../lib/supabase";
import type { ChallengeJson } from "../challenges/challengeModel";

export interface FootballGmRunSave {
  seed: string;
  gameVersion: string;
  snapshot: ChallengeJson;
  completed: boolean;
}

export interface FootballGmRunRepository {
  save: (input: FootballGmRunSave) => Promise<void>;
  loadLatestActive: () => Promise<ChallengeJson | null>;
}

export function createFootballGmRunRepository(): FootballGmRunRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;
  let queue: Promise<void> = Promise.resolve();

  return {
    async loadLatestActive() {
      const { data, error } = await client.rpc("load_my_latest_football_gm_run");
      if (error) throw new Error(error.message || "GM run could not be restored.");
      return (data ?? null) as ChallengeJson | null;
    },
    save(input) {
      const request = queue.then(async () => {
        const { error } = await client.rpc("save_my_football_gm_run", {
          p_seed: input.seed,
          p_game_version: input.gameVersion,
          p_state: input.snapshot,
          p_completed: input.completed,
        });
        if (error) throw new Error(error.message || "GM run could not be saved.");
      });

      queue = request.catch(() => undefined);
      return request;
    },
  };
}
