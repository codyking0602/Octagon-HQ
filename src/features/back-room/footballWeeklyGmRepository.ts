import { getSupabaseClient } from "../../lib/supabase";
import type { PersistedRun } from "./FootballGmModePage";

export type WeeklyGmScenario = "elite" | "young";
export interface WeeklyGmAttempt {
  seed: string;
  starting_player_id?: string | null;
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

export interface WeeklyGmArchivedWeek {
  week_start: string;
  opens_at: string;
  closes_at: string;
  standings: WeeklyGmStanding[];
  champions: WeeklyGmStanding[];
}

export function createFootballWeeklyGmRepository(preview = false) {
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
    load: () => rpc<WeeklyGmState>(preview ? "get_my_football_weekly_gm_preview" : "get_my_football_weekly_gm"),
    history: () => preview ? Promise.resolve([] as WeeklyGmArchivedWeek[])
      : rpc<WeeklyGmArchivedWeek[]>("get_football_weekly_gm_history"),
    archivedResult: (weekStart: string, profileId: string, scenario: WeeklyGmScenario) =>
      rpc<WeeklyGmResult>("get_football_weekly_gm_archived_result", {
        p_week_start: weekStart, p_profile_id: profileId, p_scenario: scenario,
      }),
    start: (scenario: WeeklyGmScenario, startingPlayerId?: string) =>
      startingPlayerId && !preview
        ? rpc<WeeklyGmAttempt>("start_my_football_weekly_gm_with_player", {
          p_scenario: scenario, p_player_id: startingPlayerId,
        })
        : rpc<WeeklyGmAttempt>(preview ? "start_my_football_weekly_gm_preview" : "start_my_football_weekly_gm", { p_scenario: scenario }),
    result: (profileId: string | null, scenario: WeeklyGmScenario) =>
      rpc<WeeklyGmResult>(preview ? "get_football_weekly_gm_preview_result" : "get_football_weekly_gm_result", { p_profile_id: profileId, p_scenario: scenario }),
    resetPreview: () => {
      if (!preview) throw new Error("Only owner test attempts may be reset.");
      return rpc<boolean>("reset_my_football_weekly_gm_preview");
    },
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
