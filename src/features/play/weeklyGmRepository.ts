import { getSupabaseClient } from "../../lib/supabase";
import type { PersistedRun } from "../back-room/FootballGmModePage";
import type { FootballGmFinalResultV2 } from "../back-room/footballGmStrategy";

export type WeeklyGmScenario = "elite" | "young";
export interface WeeklyGmEntry {
  scenario: WeeklyGmScenario;
  revision: number;
  seed: string;
  state: PersistedRun | null;
  completed_at: string | null;
  score: number | null;
}
export interface WeeklyGmStanding {
  profile_id: string;
  display_name: string;
  elite_score: number | null;
  young_score: number | null;
  total: number;
  completed: number;
  elite_result: FootballGmFinalResultV2 | null;
  young_result: FootballGmFinalResultV2 | null;
}
export interface WeeklyGmStatus {
  week_start: string;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
  entries: WeeklyGmEntry[];
  standings: WeeklyGmStanding[];
}
function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Weekly GM is not connected.");
  return supabase;
}
async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await client().rpc(name, args);
  if (error) throw new Error(error.message || "Weekly GM is unavailable.");
  return data as T;
}
export const weeklyGmRepository = {
  status: () => rpc<WeeklyGmStatus>("get_weekly_football_gm"),
  start: (scenario: WeeklyGmScenario) =>
    rpc<WeeklyGmEntry>("start_weekly_football_gm", { p_scenario: scenario }),
  save: (scenario: WeeklyGmScenario, state: PersistedRun,
    result: FootballGmFinalResultV2 | null, expectedRevision: number) =>
    rpc<WeeklyGmEntry>("save_weekly_football_gm", {
      p_scenario: scenario, p_expected_revision: expectedRevision,
      p_state: state, p_result: result,
    }),
};
