import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { PlaySport } from "./playRegistry";

const recapEntrySchema = z.object({
  rank: z.coerce.number().int().positive(),
  profile_id: z.string().uuid(),
  display_name: z.string(),
  initials: z.string(),
  avatar_photo_data: z.string().nullable().optional(),
  wins: z.coerce.number().int().nonnegative(),
  played: z.coerce.number().int().positive(),
  average_score: z.coerce.number().nonnegative(),
  is_current_user: z.boolean(),
});

const auctionBonusSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  subject_key: z.string(),
  subject_label: z.string(),
}).nullable();

const recapSchema = z.object({
  sport: z.enum(["ufc", "football"]),
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  week_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: z.array(recapEntrySchema).min(1),
  auction_bonus: auctionBonusSchema,
}).nullable();

export interface WeeklyChampionshipRecapEntry {
  rank: number;
  profileId: string;
  displayName: string;
  initials: string;
  avatarPhotoData: string | null;
  wins: number;
  played: number;
  averageScore: number;
  isCurrentUser: boolean;
}

export interface WeeklyChampionshipAuctionBonus {
  profileId: string;
  displayName: string;
  subjectKey: string;
  subjectLabel: string;
}

export interface WeeklyChampionshipRecap {
  sport: "ufc" | "football";
  weekStart: string;
  weekEnd: string;
  entries: WeeklyChampionshipRecapEntry[];
  auctionBonus: WeeklyChampionshipAuctionBonus | null;
}

type RpcError = { message?: string };
type Client = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: RpcError | null }>;
};

export interface WeeklyChampionshipRecapRepository {
  load(sport: PlaySport): Promise<WeeklyChampionshipRecap | null>;
  acknowledge(sport: PlaySport, weekStart: string): Promise<void>;
}

export class WeeklyChampionshipRecapRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeeklyChampionshipRecapRepositoryError";
  }
}

async function rpc(client: Client, name: string, args: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, args);
  if (error) {
    throw new WeeklyChampionshipRecapRepositoryError(
      error.message || "The weekly championship recap could not be synced.",
    );
  }
  return data;
}

function toRecap(value: unknown): WeeklyChampionshipRecap | null {
  const row = recapSchema.parse(value);
  if (!row) return null;

  return {
    sport: row.sport,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    entries: row.entries.map((entry) => ({
      rank: entry.rank,
      profileId: entry.profile_id,
      displayName: entry.display_name,
      initials: entry.initials,
      avatarPhotoData: entry.avatar_photo_data ?? null,
      wins: entry.wins,
      played: entry.played,
      averageScore: entry.average_score,
      isCurrentUser: entry.is_current_user,
    })),
    auctionBonus: row.auction_bonus ? {
      profileId: row.auction_bonus.profile_id,
      displayName: row.auction_bonus.display_name,
      subjectKey: row.auction_bonus.subject_key,
      subjectLabel: row.auction_bonus.subject_label,
    } : null,
  };
}

export function createWeeklyChampionshipRecapRepository(
  suppliedClient?: Client | null,
): WeeklyChampionshipRecapRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as Client | null
    : suppliedClient;
  if (!client) return null;

  return {
    async load(sport) {
      return toRecap(await rpc(client, "get_my_daily_challenge_weekly_recap", {
        p_sport: sport,
      }));
    },
    async acknowledge(sport, weekStart) {
      z.literal(true).parse(await rpc(
        client,
        "acknowledge_my_daily_challenge_weekly_recap",
        { p_sport: sport, p_week_start: weekStart },
      ));
    },
  };
}
