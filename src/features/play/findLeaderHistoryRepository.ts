import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { FindLeaderHistoryRow } from "./findLeaderStorage";

const historyRowSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  official_score: z.coerce.number().int().min(0).max(10),
  best_score: z.coerce.number().int().min(0).max(10),
  attempts: z.coerce.number().int().min(1),
  completed_at: z.string(),
});

const dailyLeaderboardEntrySchema = z.object({
  rank: z.coerce.number().int().min(1),
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
  avatar_photo_data: z.string().nullable().optional(),
  official_score: z.coerce.number().int().min(0).max(10),
  is_current_user: z.boolean(),
});

const dailyLeaderboardSchema = z.object({
  unlocked: z.boolean(),
  player_count: z.coerce.number().int().nonnegative(),
  entries: z.array(dailyLeaderboardEntrySchema),
});

export interface FindLeaderDailyLeaderboardEntry {
  rank: number;
  displayName: string;
  initials: string;
  avatarPhotoData: string | null;
  officialScore: number;
  isCurrentUser: boolean;
}

export interface FindLeaderDailyLeaderboard {
  unlocked: boolean;
  playerCount: number;
  entries: FindLeaderDailyLeaderboardEntry[];
}

export interface FindLeaderHistoryRepository {
  load: () => Promise<FindLeaderHistoryRow[]>;
  loadDailyLeaderboard?: (day: string) => Promise<FindLeaderDailyLeaderboard>;
  recordAttempt: (day: string, score: number) => Promise<FindLeaderHistoryRow>;
}

function toHistoryRow(value: unknown): FindLeaderHistoryRow {
  const row = historyRowSchema.parse(value);
  return {
    day: row.day,
    officialScore: row.official_score,
    bestScore: row.best_score,
    attempts: row.attempts,
    completedAt: row.completed_at,
  };
}

function toDailyLeaderboard(value: unknown): FindLeaderDailyLeaderboard {
  const row = dailyLeaderboardSchema.parse(value);
  return {
    unlocked: row.unlocked,
    playerCount: row.player_count,
    entries: row.entries.map((entry) => ({
      rank: entry.rank,
      displayName: entry.display_name,
      initials: entry.initials,
      avatarPhotoData: entry.avatar_photo_data ?? null,
      officialScore: entry.official_score,
      isCurrentUser: entry.is_current_user,
    })),
  };
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Octagon HQ could not sync Find the Leader history.");
  return data;
}

export function createFindLeaderHistoryRepository(): FindLeaderHistoryRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async load() {
      const data = await requireRpcSuccess(client.rpc("list_my_find_leader_history"));
      return z.array(historyRowSchema).parse(data ?? []).map(toHistoryRow);
    },

    async loadDailyLeaderboard(day) {
      const data = await requireRpcSuccess(client.rpc("get_find_leader_daily_leaderboard", {
        p_day: day,
      }));
      return toDailyLeaderboard(data ?? { unlocked: false, player_count: 0, entries: [] });
    },

    async recordAttempt(day, score) {
      const data = await requireRpcSuccess(client.rpc("record_my_find_leader_attempt", {
        p_day: day,
        p_score: score,
        p_completed_at: new Date().toISOString(),
      }));
      const value = Array.isArray(data) ? data[0] : data;
      if (!value) throw new Error("The Find the Leader result was not saved.");
      return toHistoryRow(value);
    },
  };
}
