import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

// A Football editorial week begins at midnight Tuesday in America/Chicago.
// SQL derives the UTC release instant, automatically accounting for CST/CDT.
export const footballEditorialTuesdaySchema = z.iso.date().refine(
  (value) => new Date(value + "T12:00:00Z").getUTCDay() === 2,
  "Football editorial week must begin on Tuesday",
);

const stat = z.strictObject({
  value: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

export const footballWeeklySpotlightSchema = z.strictObject({
  name: z.string().trim().min(1),
  team: z.string().trim().min(1),
  position: z.string().trim().min(1),
  stats: z.array(stat).length(4),
  result: z.string().trim().min(1),
  measurements: z.string().trim().min(1),
  team_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  highlight_url: z.url().refine((url) => url.startsWith("https://")),
  photo_source: z.url().optional(),
  photo_asset_path: z.string().trim().min(1).optional(),
  photo_kind: z.enum(["action", "portrait", "manual"]).optional(),
});

export const footballWeeklyGameSchema = z.strictObject({
  home_team: z.string().trim().min(1),
  away_team: z.string().trim().min(1),
  kickoff_at: z.iso.datetime({ offset: true }),
  event_id: z.string().trim().min(1).optional(),
  breakdown_id: z.string().trim().min(1).optional(),
  header_storage_path: z.string().trim().min(1).optional(),
  header_photo_sources: z.array(z.url()).max(4).optional(),
}).refine((game) => game.home_team !== game.away_team, "Featured opponents must differ");

export const footballWeeklyDraftPatchSchema = z.strictObject({
  cfb_spotlight: footballWeeklySpotlightSchema.nullable().optional(),
  nfl_spotlight: footballWeeklySpotlightSchema.nullable().optional(),
  cfb_game_of_week: footballWeeklyGameSchema.nullable().optional(),
  nfl_game_of_week: footballWeeklyGameSchema.nullable().optional(),
}).refine((patch) => Object.keys(patch).length > 0, "Draft patch cannot be empty");

export const footballWeeklyContentPackageSchema = z.object({
  week_of: footballEditorialTuesdaySchema,
  release_at: z.iso.datetime({ offset: true }),
  status: z.enum(["draft", "approved", "ready", "published"]),
  cfb_spotlight: footballWeeklySpotlightSchema.nullable(),
  nfl_spotlight: footballWeeklySpotlightSchema.nullable(),
  cfb_game_of_week: footballWeeklyGameSchema.nullable(),
  nfl_game_of_week: footballWeeklyGameSchema.nullable(),
  approved_at: z.string().nullable(),
  ready_at: z.string().nullable(),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type FootballWeeklyDraftPatch = z.infer<typeof footballWeeklyDraftPatchSchema>;
export type FootballWeeklyContentPackage = z.infer<typeof footballWeeklyContentPackageSchema>;

export interface FootballWeeklyContentRepository {
  load: (weekOf: string) => Promise<FootballWeeklyContentPackage | null>;
  saveDraft: (weekOf: string, patch: FootballWeeklyDraftPatch) => Promise<FootballWeeklyContentPackage>;
}

// Phase 1: owner-only persistence, not a live content publishing path.
export function createFootballWeeklyContentRepository(): FootballWeeklyContentRepository | null {
  const client = getSupabaseClient();
  if (!client) return null;
  return {
    async load(weekOf) {
      const { data, error } = await client.rpc("get_football_weekly_content_package", {
        p_week_of: footballEditorialTuesdaySchema.parse(weekOf),
      });
      if (error) throw new Error(error.message);
      return data === null ? null : footballWeeklyContentPackageSchema.parse(data);
    },
    async saveDraft(weekOf, patch) {
      const { data, error } = await client.rpc("save_football_weekly_content_draft", {
        p_week_of: footballEditorialTuesdaySchema.parse(weekOf),
        p_patch: footballWeeklyDraftPatchSchema.parse(patch),
      });
      if (error) throw new Error(error.message);
      return footballWeeklyContentPackageSchema.parse(data);
    },
  };
}
