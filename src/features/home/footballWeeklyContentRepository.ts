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
  header_asset_path: z.string().trim().min(1).optional(),
  header_photo_sources: z.array(z.url()).max(4).optional(),
}).refine((game) => game.home_team !== game.away_team, "Featured opponents must differ");

export const footballWeeklyDraftPatchSchema = z.strictObject({
  cfb_spotlight: footballWeeklySpotlightSchema.nullable().optional(),
  nfl_spotlight: footballWeeklySpotlightSchema.nullable().optional(),
  cfb_game_of_week: footballWeeklyGameSchema.nullable().optional(),
  nfl_game_of_week: footballWeeklyGameSchema.nullable().optional(),
}).refine((patch) => Object.keys(patch).length > 0, "Draft patch cannot be empty");

// Weekly recommendations are lightweight; the owner chooses IDs before full art/editorial prep.
const candidateId = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
export const footballWeeklyPlayerCandidateSchema = z.strictObject({
  id: candidateId,
  name: z.string().trim().min(1),
  team: z.string().trim().min(1),
  position: z.string().trim().min(1),
  summary: z.string().trim().min(1),
});
export const footballWeeklyGameCandidateSchema = z.strictObject({
  id: candidateId,
  home_team: z.string().trim().min(1),
  away_team: z.string().trim().min(1),
  kickoff_at: z.iso.datetime({ offset: true }),
  summary: z.string().trim().min(1),
}).refine((game) => game.home_team !== game.away_team, "Featured opponents must differ");

export const footballWeeklyCandidateSetSchema = z.strictObject({
  players: z.array(footballWeeklyPlayerCandidateSchema).length(5).refine(
    (items) => new Set(items.map((item) => item.id)).size === 5, "Each player ID must be unique",
  ),
  games: z.array(footballWeeklyGameCandidateSchema).length(5).refine(
    (items) => new Set(items.map((item) => item.id)).size === 5, "Each game ID must be unique",
  ),
});

const candidateLists = z.strictObject({
  cfb: footballWeeklyCandidateSetSchema.optional(),
  nfl: footballWeeklyCandidateSetSchema.optional(),
}).default({});
const choice = z.strictObject({
  player: footballWeeklyPlayerCandidateSchema,
  game: footballWeeklyGameCandidateSchema,
  selected_at: z.iso.datetime({ offset: true }),
  selected_by: z.uuid(),
});
const choiceLists = z.strictObject({ cfb: choice.optional(), nfl: choice.optional() }).default({});

// The upcoming content week is always the NEXT local Tuesday, even on Tuesday.
export function nextFootballEditorialTuesday(now = new Date()): string {
  const pieces = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) => Number(pieces.find((piece) => piece.type === name)?.value);
  const localNoonUtc = new Date(Date.UTC(part("year"), part("month") - 1, part("day"), 12));
  const delta = (2 - localNoonUtc.getUTCDay() + 7) % 7 || 7;
  localNoonUtc.setUTCDate(localNoonUtc.getUTCDate() + delta);
  return localNoonUtc.toISOString().slice(0, 10);
}


const editorialText = z.string().trim().min(35);
const editorialBattle = z.strictObject({
  title: z.string().trim().min(1), body: editorialText, edge: z.string().trim().min(1),
});
const editorialTeamPath = z.strictObject({ team: z.string().trim().min(1), body: editorialText });
const editorialPlayer = z.strictObject({
  name: z.string().trim().min(1), position: z.string().trim().min(1),
  body: z.string().trim().min(1),
});
const editorialPlayerTeam = z.strictObject({
  team: z.string().trim().min(1), players: z.array(editorialPlayer).length(3),
});

export const footballWeeklyEditorialProofSchema = z.strictObject({
  source_urls: z.array(z.url().refine((url) => url.startsWith("https://"))).min(2),
  breakdown: z.strictObject({
    setup: z.array(z.string().trim().min(40)).length(2),
    things: z.array(editorialBattle).length(3),
    paths_to_win: z.array(editorialTeamPath).length(2),
    players_to_watch: z.array(editorialPlayerTeam).length(2),
    unit_edges: z.array(editorialBattle).length(2),
  }),
});
const preparedEditorial = footballWeeklyEditorialProofSchema.extend({
  prepared_at: z.iso.datetime({ offset: true }),
  player_id: candidateId,
  game_id: candidateId,
});
const editorialProductions = z.strictObject({
  cfb: preparedEditorial.optional(),
  nfl: preparedEditorial.optional(),
}).default({});

export const footballWeeklyPreparedSpotlightSchema = footballWeeklySpotlightSchema.safeExtend({
  photo_source: z.url().refine((url) => url.startsWith("https://")),
  photo_asset_path: z.string().regex(/^\/assets\/football\/weekly\/\d{4}-\d{2}-\d{2}\/(cfb|nfl)\/spotlight[.]webp$/),
  photo_kind: z.enum(["action", "portrait", "manual"]),
  highlight_url: z.url().refine((url) => /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)),
}).refine((item) => new Set(item.stats.map((stat) => stat.label.trim().toUpperCase())).size === 4,
  "Spotlight stats must use four distinct labels");

export const footballWeeklyPreparedGameSchema = footballWeeklyGameSchema.safeExtend({
  header_asset_path: z.string().regex(/^\/assets\/football\/weekly\/\d{4}-\d{2}-\d{2}\/(cfb|nfl)\/game-header[.]webp$/),
  header_photo_sources: z.array(z.url().refine((url) => url.startsWith("https://"))).length(2),
});

export const footballWeeklyContentPackageSchema = z.object({
  week_of: footballEditorialTuesdaySchema,
  release_at: z.iso.datetime({ offset: true }),
  status: z.enum(["draft", "approved", "ready", "published"]),
  cfb_spotlight: footballWeeklySpotlightSchema.nullable(),
  nfl_spotlight: footballWeeklySpotlightSchema.nullable(),
  cfb_game_of_week: footballWeeklyGameSchema.nullable(),
  nfl_game_of_week: footballWeeklyGameSchema.nullable(),
  proposals: candidateLists,
  choices: choiceLists,
  production: editorialProductions,
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
  stageCandidates: (weekOf: string, sport: "cfb" | "nfl", candidates: z.infer<typeof footballWeeklyCandidateSetSchema>) => Promise<FootballWeeklyContentPackage>;
  selectChoices: (weekOf: string, sport: "cfb" | "nfl", playerId: string, gameId: string) => Promise<FootballWeeklyContentPackage>;
  prepareEditorial: (weekOf: string, sport: "cfb" | "nfl", spotlight: z.infer<typeof footballWeeklyPreparedSpotlightSchema>, game: z.infer<typeof footballWeeklyPreparedGameSchema>, editorial: z.infer<typeof footballWeeklyEditorialProofSchema>) => Promise<FootballWeeklyContentPackage>;
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
    async stageCandidates(weekOf, sport, candidates) {
      const { data, error } = await client.rpc("stage_football_weekly_editorial_candidates", {
        p_week_of: footballEditorialTuesdaySchema.parse(weekOf),
        p_sport: sport,
        p_candidates: footballWeeklyCandidateSetSchema.parse(candidates),
      });
      if (error) throw new Error(error.message);
      return footballWeeklyContentPackageSchema.parse(data);
    },
    async selectChoices(weekOf, sport, playerId, gameId) {
      const { data, error } = await client.rpc("select_football_weekly_editorial_choices", {
        p_week_of: footballEditorialTuesdaySchema.parse(weekOf),
        p_sport: sport,
        p_player_id: candidateId.parse(playerId),
        p_game_id: candidateId.parse(gameId),
      });
      if (error) throw new Error(error.message);
      return footballWeeklyContentPackageSchema.parse(data);
    },
    async prepareEditorial(weekOf, sport, spotlight, game, editorial) {
      const { data, error } = await client.rpc("prepare_football_weekly_editorial", {
        p_week_of: footballEditorialTuesdaySchema.parse(weekOf),
        p_sport: sport,
        p_spotlight: footballWeeklyPreparedSpotlightSchema.parse(spotlight),
        p_game: footballWeeklyPreparedGameSchema.parse(game),
        p_editorial: footballWeeklyEditorialProofSchema.parse(editorial),
      });
      if (error) throw new Error(error.message);
      return footballWeeklyContentPackageSchema.parse(data);
    },
  };
}
