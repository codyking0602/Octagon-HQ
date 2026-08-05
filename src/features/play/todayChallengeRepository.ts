import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { DailyGameType, OfficialAttempt } from "./todaysChallengeAdapters";

const jsonRecordSchema = z.record(z.string(), z.unknown());
const gameTypeSchema = z.enum([
  "find_leader",
  "blind_resume",
  "wavelength",
  "blind_rank_5",
  "keep_4_cut_4",
]);
const attemptSchema = z.object({
  native_score: z.coerce.number().int(),
  normalized_score: z.coerce.number().int().min(0).max(100),
  completed_at: z.string(),
  public_result: jsonRecordSchema.default({}),
});
const projectionSchema = z.object({
  available: z.literal(true),
  id: z.string().uuid(),
  central_day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  schedule_version: z.string().min(1),
  game_type: gameTypeSchema,
  setup_key: z.string().min(1),
  content_version: z.string().min(1),
  scoring_version: z.string().min(1),
  fallback_reason: z.string().nullable().optional(),
  public_setup: jsonRecordSchema,
  progress_revision: z.coerce.number().int().nonnegative(),
  public_state: jsonRecordSchema,
  reveal_setup: jsonRecordSchema.nullable(),
  official_attempt: attemptSchema.nullable(),
  deployment_sha: z.string().min(1),
});
const historySchema = z.object({
  day: z.string(),
  schedule_version: z.string(),
  game_type: gameTypeSchema,
  native_score: z.coerce.number().int(),
  normalized_score: z.coerce.number().int(),
  completed_at: z.string(),
  public_result: jsonRecordSchema.default({}),
});
const leaderboardSchema = z.object({
  unlocked: z.boolean(),
  player_count: z.coerce.number().int().nonnegative(),
  entries: z.array(z.object({
    rank: z.coerce.number().int().positive(),
    display_name: z.string(),
    initials: z.string(),
    avatar_photo_data: z.string().nullable().optional(),
    game_type: gameTypeSchema,
    native_score: z.coerce.number().int(),
    normalized_score: z.coerce.number().int(),
    is_current_user: z.boolean(),
  })),
});
const streakSchema = z.object({
  current_streak: z.coerce.number().int().nonnegative(),
  best_streak: z.coerce.number().int().nonnegative(),
});

export interface TodayChallengeProjection {
  available: true;
  id: string;
  centralDay: string;
  scheduleVersion: string;
  gameType: DailyGameType;
  setupKey: string;
  contentVersion: string;
  scoringVersion: string;
  fallbackReason: string | null;
  publicSetup: Record<string, unknown>;
  progressRevision: number;
  publicState: Record<string, unknown>;
  revealSetup: Record<string, unknown> | null;
  officialAttempt: OfficialAttempt | null;
  deploymentSha: string;
}

export interface TodayChallengeHistoryRow {
  day: string;
  scheduleVersion: string;
  gameType: DailyGameType;
  nativeScore: number;
  normalizedScore: number;
  completedAt: string;
  publicResult: Record<string, unknown>;
}

export interface TodayChallengeLeaderboard {
  unlocked: boolean;
  playerCount: number;
  entries: Array<{
    rank: number;
    displayName: string;
    initials: string;
    avatarPhotoData: string | null;
    gameType: DailyGameType;
    nativeScore: number;
    normalizedScore: number;
    isCurrentUser: boolean;
  }>;
}

export interface TodayChallengeStreak {
  currentStreak: number;
  bestStreak: number;
}

type FunctionError = {
  message?: string;
  context?: unknown;
};

type TodayChallengeClient = {
  functions: {
    invoke: (
      name: string,
      options: { body: Record<string, unknown> },
    ) => PromiseLike<{ data: unknown; error: FunctionError | null }>;
  };
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

async function functionErrorPayload(error: FunctionError) {
  const context = error.context;
  if (context instanceof Response) {
    try {
      return asRecord(await context.clone().json());
    } catch {
      return null;
    }
  }
  return asRecord(context);
}

export class TodayChallengeRepositoryError extends Error {
  code: string;
  stale: boolean;
  signInRequired: boolean;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TodayChallengeRepositoryError";
    this.code = code;
    this.stale = code === "STALE_PROGRESS" || code === "DAILY_IDENTITY_CHANGED";
    this.signInRequired = code === "SIGN_IN_REQUIRED";
  }
}

function toAttempt(row: z.infer<typeof attemptSchema>): OfficialAttempt {
  return {
    nativeScore: row.native_score,
    normalizedScore: row.normalized_score,
    completedAt: row.completed_at,
    publicResult: row.public_result,
  };
}

export function parseTodayChallengeProjection(value: unknown): TodayChallengeProjection {
  const row = projectionSchema.parse(value);
  return {
    available: true,
    id: row.id,
    centralDay: row.central_day,
    scheduleVersion: row.schedule_version,
    gameType: row.game_type,
    setupKey: row.setup_key,
    contentVersion: row.content_version,
    scoringVersion: row.scoring_version,
    fallbackReason: row.fallback_reason ?? null,
    publicSetup: row.public_setup,
    progressRevision: row.progress_revision,
    publicState: row.public_state,
    revealSetup: row.reveal_setup,
    officialAttempt: row.official_attempt ? toAttempt(row.official_attempt) : null,
    deploymentSha: row.deployment_sha,
  };
}

async function invokeRuntime(
  client: TodayChallengeClient,
  body: Record<string, unknown>,
) {
  const { data, error } = await client.functions.invoke("daily-challenge-runtime", { body });
  if (!error) return data;

  const payload = await functionErrorPayload(error);
  const code = typeof payload?.code === "string" ? payload.code : "DAILY_RUNTIME_FAILED";
  const message = typeof payload?.message === "string"
    ? payload.message
    : error.message || "Octagon HQ could not sync Today’s Challenge.";
  throw new TodayChallengeRepositoryError(code, message);
}

async function rpc(
  client: TodayChallengeClient,
  name: string,
  args?: Record<string, unknown>,
) {
  const { data, error } = await client.rpc(name, args);
  if (error) {
    throw new TodayChallengeRepositoryError(
      "DAILY_HISTORY_FAILED",
      error.message || "Octagon HQ could not sync Today’s Challenge.",
    );
  }
  return data;
}

export interface TodayChallengeRepository {
  loadToday(): Promise<TodayChallengeProjection>;
  advance(
    projection: Pick<TodayChallengeProjection, "id" | "progressRevision">,
    action: Record<string, unknown>,
  ): Promise<TodayChallengeProjection>;
  loadHistory(): Promise<TodayChallengeHistoryRow[]>;
  loadStreak(): Promise<TodayChallengeStreak>;
  loadDailyLeaderboard(day: string, scheduleVersion: string): Promise<TodayChallengeLeaderboard>;
}

export function createTodayChallengeRepository(
  suppliedClient?: TodayChallengeClient | null,
): TodayChallengeRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as TodayChallengeClient | null
    : suppliedClient;
  if (!client) return null;

  return {
    async loadToday() {
      return parseTodayChallengeProjection(await invokeRuntime(client, { mode: "get-today" }));
    },
    async advance(projection, action) {
      return parseTodayChallengeProjection(await invokeRuntime(client, {
        mode: "advance",
        daily_challenge_id: projection.id,
        revision: projection.progressRevision,
        action,
      }));
    },
    async loadHistory() {
      const rows = z.array(historySchema).parse(
        await rpc(client, "list_my_daily_challenge_history") ?? [],
      );
      return rows.map((row) => ({
        day: row.day,
        scheduleVersion: row.schedule_version,
        gameType: row.game_type,
        nativeScore: row.native_score,
        normalizedScore: row.normalized_score,
        completedAt: row.completed_at,
        publicResult: row.public_result,
      }));
    },
    async loadStreak() {
      const row = streakSchema.parse(await rpc(client, "get_my_daily_challenge_streak"));
      return { currentStreak: row.current_streak, bestStreak: row.best_streak };
    },
    async loadDailyLeaderboard(day, scheduleVersion) {
      const row = leaderboardSchema.parse(await rpc(
        client,
        "get_daily_challenge_leaderboard",
        { p_day: day, p_schedule_version: scheduleVersion },
      ));
      return {
        unlocked: row.unlocked,
        playerCount: row.player_count,
        entries: row.entries.map((entry) => ({
          rank: entry.rank,
          displayName: entry.display_name,
          initials: entry.initials,
          avatarPhotoData: entry.avatar_photo_data ?? null,
          gameType: entry.game_type,
          nativeScore: entry.native_score,
          normalizedScore: entry.normalized_score,
          isCurrentUser: entry.is_current_user,
        })),
      };
    },
  };
}
