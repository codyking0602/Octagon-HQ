import { getSupabaseClient } from "../../lib/supabase";
import type { PersistedRun } from "./FootballGmModePage";

export type WeeklyGmScenario = "elite" | "young";
export interface WeeklyGmAttempt {
  seed: string;
  state: PersistedRun | null;
  completed: boolean;
  score: number | null;
}
export interface WeeklyGmStanding {
  profile_id: string;
  display_name: string;
  elite_score: number | null;
  young_score: number | null;
  total_score: number;
  completed_runs: number;
  rank: number;
}
export interface WeeklyGmState {
  week_start: string;
  opens_at: string;
  closes_at: string;
  status: "upcoming" | "active" | "closed";
  attempts: Partial<Record<WeeklyGmScenario, WeeklyGmAttempt>>;
  leaderboard: WeeklyGmStanding[];
}
export interface WeeklyGmResult {
  display_name: string;
  score: number;
  state: PersistedRun;
}

export function createFootballWeeklyGmRepository() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;
  let queue: Promise<void> = Promise.resolve();
  async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    const { data, error } = await client.rpc(name, args);
    if (error) throw new Error(error.message || "Weekly GM could not be synced.");
    return data as T;
  }
  return {
    load: () => rpc<WeeklyGmState>("get_my_football_weekly_gm"),
    start: (scenario: WeeklyGmScenario) =>
      rpc<WeeklyGmAttempt>("start_my_football_weekly_gm", { p_scenario: scenario }),
    result: (profileId: string | null, scenario: WeeklyGmScenario) =>
      rpc<WeeklyGmResult>("get_football_weekly_gm_result", { p_profile_id: profileId, p_scenario: scenario }),
    save: (scenario: WeeklyGmScenario, seed: string, state: PersistedRun, score: number | null) => {
      const request = queue.then(async () => {
        await rpc("save_my_football_weekly_gm", {
          p_scenario: scenario, p_seed: seed, p_state: state,
          p_completed: score !== null, p_score: score,
        });
      });
      queue = request.catch(() => undefined);
      return request;
    },
  };
}
