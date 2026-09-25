import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

export const MLB_PLAY_CURRENT_CHALLENGE_KEY = "mlb-2026-play-01";
export const MLB_PLAY_CURRENT_CHALLENGE_DATE = "2026-09-29";

const jsonRecord = z.record(z.string(), z.unknown());

const ownResultSchema = z.object({
  raw_score: z.number(),
  game_type: z.string(),
  public_result: jsonRecord,
  result_detail: jsonRecord,
  completed_at: z.string(),
}).nullable();

const leaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  profile_id: z.string(),
  display_name: z.string(),
  initials: z.string(),
  avatar_photo_data: z.string().nullable().optional().default(null),
  raw_score: z.number(),
  game_type: z.string(),
  public_result: jsonRecord,
  result_detail: jsonRecord,
  completed_at: z.string(),
  is_current_user: z.boolean(),
});

const overviewSchema = z.object({
  unlocked: z.boolean(),
  player_count: z.number().int().nonnegative(),
  own_result: ownResultSchema,
  entries: z.array(leaderboardEntrySchema),
});

export type MlbPlayChallengeResult = {
  rawScore: number;
  gameType: string;
  publicResult: Record<string, unknown>;
  resultDetail: Record<string, unknown>;
  completedAt: string;
};

export type MlbPlayChallengeLeaderboardEntry = MlbPlayChallengeResult & {
  rank: number;
  profileId: string;
  displayName: string;
  initials: string;
  avatarPhotoData: string | null;
  isCurrentUser: boolean;
};

export type MlbPlayChallengeOverview = {
  unlocked: boolean;
  playerCount: number;
  ownResult: MlbPlayChallengeResult | null;
  entries: MlbPlayChallengeLeaderboardEntry[];
};

function mapResult(value: z.infer<typeof ownResultSchema>): MlbPlayChallengeResult | null {
  return value ? {
    rawScore: value.raw_score,
    gameType: value.game_type,
    publicResult: value.public_result,
    resultDetail: value.result_detail,
    completedAt: value.completed_at,
  } : null;
}

function mapOverview(value: unknown): MlbPlayChallengeOverview {
  const parsed = overviewSchema.parse(value);
  return {
    unlocked: parsed.unlocked,
    playerCount: parsed.player_count,
    ownResult: mapResult(parsed.own_result),
    entries: parsed.entries.map((entry) => ({
      rank: entry.rank,
      profileId: entry.profile_id,
      displayName: entry.display_name,
      initials: entry.initials,
      avatarPhotoData: entry.avatar_photo_data,
      rawScore: entry.raw_score,
      gameType: entry.game_type,
      publicResult: entry.public_result,
      resultDetail: entry.result_detail,
      completedAt: entry.completed_at,
      isCurrentUser: entry.is_current_user,
    })),
  };
}

async function rpc(name: string, params: Record<string, unknown>) {
  const client = getSupabaseClient();
  if (!client) throw new Error("MLB Play is not connected on this build.");
  const { data, error } = await client.rpc(name, params);
  if (error) throw new Error(error.message || "MLB Play could not load.");
  return data;
}

export async function loadMlbPlayChallengeOverview(season: number, challengeKey: string) {
  return mapOverview(await rpc("get_mlb_postseason_challenge_overview", {
    p_season: season,
    p_challenge_key: challengeKey,
  }));
}

export async function recordMlbPlayChallengeResult({
  season,
  challengeKey,
  rawScore,
  gameType,
  publicResult,
  resultDetail,
}: {
  season: number;
  challengeKey: string;
  rawScore: number;
  gameType: string;
  publicResult: Record<string, unknown>;
  resultDetail: Record<string, unknown>;
}) {
  const value = ownResultSchema.unwrap().parse(await rpc("record_mlb_postseason_challenge_result", {
    p_season: season,
    p_challenge_key: challengeKey,
    p_raw_score: rawScore,
    p_game_type: gameType,
    p_public_result: publicResult,
    p_result_detail: resultDetail,
  }));
  return mapResult(value)!;
}


const PREVIEW_STORAGE_PREFIX = "octagon:mlb-play-preview:";

export function loadMlbPlayPreviewResult(challengeKey: string): MlbPlayChallengeResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${PREVIEW_STORAGE_PREFIX}${challengeKey}`);
    if (!raw) return null;
    const parsed = ownResultSchema.safeParse(JSON.parse(raw));
    return parsed.success ? mapResult(parsed.data) : null;
  } catch {
    return null;
  }
}

export function saveMlbPlayPreviewResult(
  challengeKey: string,
  result: MlbPlayChallengeResult,
): MlbPlayChallengeResult {
  if (typeof window === "undefined") return result;
  const existing = loadMlbPlayPreviewResult(challengeKey);
  if (existing) return existing;
  try {
    window.localStorage.setItem(
      `${PREVIEW_STORAGE_PREFIX}${challengeKey}`,
      JSON.stringify({
        raw_score: result.rawScore,
        game_type: result.gameType,
        public_result: result.publicResult,
        result_detail: result.resultDetail,
        completed_at: result.completedAt,
      }),
    );
  } catch {
    // Preview persistence is best-effort only. Production uses the canonical RPC.
  }
  return result;
}
