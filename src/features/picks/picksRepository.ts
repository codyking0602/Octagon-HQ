import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  PickEvent,
  PickEventSpotlight,
  PickGroupPick,
  PickHistory,
  PickSummary,
  ProfileEventPick,
  UnderdogLock,
} from "./picksModel";

const americanOddsSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : value;
  }
  return value;
}, z.number().int().nullable());

const groupPickSchema = z.object({ display_name: z.string(), picked_fighter_slug: z.string().nullable(), is_current_user: z.boolean() });
const watchMomentSchema = z.object({ title: z.string().min(3).max(120), url: z.string().url() });
const spotlightWatchSchema = z.object({ fighter_slug: z.string().min(1), url: z.string().url() });
const spotlightFighterSchema = z.object({
  fighter_slug: z.string().min(1), record: z.string().min(1), age: z.string().min(1), height: z.string().min(1), reach: z.string().min(1), stance: z.string().min(1),
  edges: z.array(z.string().min(3)).min(1).max(3),
});
const spotlightSchema = z.object({
  bout_id: z.string().min(1), preview: z.string().min(20), red: spotlightFighterSchema, blue: spotlightFighterSchema,
  watch_spotlights: z.array(spotlightWatchSchema).max(2), source: z.literal("UFCStats"), generated_at: z.string().min(10),
});

const boutSchema = z.object({
  bout_id: z.string(), locks_at: z.string().optional(), is_locked: z.boolean().optional(), position: z.number().int().positive(), weight_class: z.string(),
  red_fighter_slug: z.string(), red_fighter_name: z.string(), blue_fighter_slug: z.string(), blue_fighter_name: z.string(),
  red_american_odds: americanOddsSchema, blue_american_odds: americanOddsSchema,
  odds_source: z.string().nullable().optional().default(null), odds_updated_at: z.string().nullable().optional().default(null),
  winner_fighter_slug: z.string().nullable(), result_status: z.enum(["pending", "red_win", "blue_win", "draw", "no_contest", "cancelled"]).optional().default("pending"),
  result_recorded_at: z.string().nullable().optional().default(null), included_in_picks: z.boolean().optional().default(true),
  group_picks: z.array(groupPickSchema).optional().default([]), repick_required: z.boolean().optional().default(false),
});

const eventSchema = z.object({
  event_id: z.string(), name: z.string(), subtitle: z.string(), venue: z.string(), location: z.string(), starts_at: z.string(), locks_at: z.string(),
  season: z.number().int(), status: z.enum(["upcoming", "locked", "complete"]), can_control: z.boolean().optional().default(false),
  header_storage_path: z.string().nullable().optional().default(null),
  header_natural_width: z.number().int().positive().nullable().optional().default(null),
  header_natural_height: z.number().int().positive().nullable().optional().default(null),
  spotlights: z.array(spotlightSchema).optional().default([]), bouts: z.array(boutSchema),
});

const pickRowSchema = z.object({ event_id: z.string(), bout_id: z.string(), fighter_slug: z.string(), picked_at: z.string(), updated_at: z.string() });
const summaryRowSchema = z.object({ correct: z.number().int().nonnegative(), incorrect: z.number().int().nonnegative(), pending: z.number().int().nonnegative(), events_entered: z.number().int().nonnegative(), base_points: z.number().int().nonnegative(), lock_bonus: z.number().int().nonnegative(), total_points: z.number().int().nonnegative() });
const lockSchema = z.object({ event_id: z.string(), bout_id: z.string(), fighter_slug: z.string(), selected_at: z.string(), frozen_american_odds: z.number().int().nullable() });
const historyRecordSchema = z.object({ correct: z.number().int().nonnegative(), incorrect: z.number().int().nonnegative(), missing: z.number().int().nonnegative(), excluded: z.number().int().nonnegative(), base_points: z.number().int().nonnegative(), lock_bonus: z.number().int().nonnegative(), total_points: z.number().int().nonnegative() });
const historyBoutSchema = z.object({
  bout_id: z.string(), position: z.number().int().positive(), weight_class: z.string(), red_fighter_slug: z.string(), red_fighter_name: z.string(), blue_fighter_slug: z.string(), blue_fighter_name: z.string(),
  result_status: z.enum(["pending", "red_win", "blue_win", "draw", "no_contest", "cancelled"]), winner_fighter_slug: z.string().nullable(), picked_fighter_slug: z.string().nullable(), verdict: z.enum(["correct", "incorrect", "missing", "excluded", "pending"]),
  included_in_picks: z.boolean().optional().default(true), group_picks: z.array(groupPickSchema).optional().default([]), repick_required: z.boolean().optional().default(false),
});
const groupResultSchema = historyRecordSchema.extend({ rank: z.number().int().positive(), profile_id: z.string().nullable().optional().default(null), display_name: z.string(), is_current_user: z.boolean() });
const seasonStandingSchema = groupResultSchema.extend({ events_entered: z.number().int().nonnegative() });
const historyEventSchema = z.object({
  event_id: z.string(), name: z.string(), subtitle: z.string(), venue: z.string(), location: z.string(), starts_at: z.string(), season: z.number().int(), completed_at: z.string(),
  record: historyRecordSchema, underdog_lock: lockSchema.nullable(), watch_moments: z.array(watchMomentSchema).optional().default([]), bouts: z.array(historyBoutSchema), group_results: z.array(groupResultSchema),
});
const historySchema = z.object({ season: z.number().int().nullable(), summary: historyRecordSchema.extend({ events_entered: z.number().int().nonnegative() }), season_standings: z.array(seasonStandingSchema).optional().default([]), events: z.array(historyEventSchema) });

export interface PicksRepository {
  loadCurrentEvent: () => Promise<PickEvent | null>;
  loadMyPicks: (eventId: string) => Promise<ProfileEventPick[]>;
  loadMyUnderdogLock: (eventId: string) => Promise<UnderdogLock | null>;
  loadMySummary: (season: number) => Promise<PickSummary>;
  loadMyHistory: (season: number | null) => Promise<PickHistory>;
  savePick: (eventId: string, boutId: string, fighterSlug: string) => Promise<ProfileEventPick>;
  setUnderdogLock: (eventId: string, boutId: string, fighterSlug: string) => Promise<UnderdogLock>;
  clearUnderdogLock: (eventId: string) => Promise<void>;
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Octagon HQ could not load Picks.");
  return data;
}

function mapGroupPick(value: z.infer<typeof groupPickSchema>): PickGroupPick {
  return { displayName: value.display_name, pickedFighterSlug: value.picked_fighter_slug, isCurrentUser: value.is_current_user };
}
function mapSpotlightFighter(value: z.infer<typeof spotlightFighterSchema>) {
  return { fighterSlug: value.fighter_slug, record: value.record, age: value.age, height: value.height, reach: value.reach, stance: value.stance, edges: value.edges };
}
function mapSpotlight(value: z.infer<typeof spotlightSchema>): PickEventSpotlight {
  return {
    boutId: value.bout_id, preview: value.preview, red: mapSpotlightFighter(value.red), blue: mapSpotlightFighter(value.blue),
    watchSpotlights: value.watch_spotlights.map((watch) => ({ fighterSlug: watch.fighter_slug, url: watch.url })), source: value.source, generatedAt: value.generated_at,
  };
}

export function mapPickEvent(value: unknown): PickEvent | null {
  if (!value) return null;
  const parsed = eventSchema.parse(value);
  return {
    eventId: parsed.event_id, name: parsed.name, subtitle: parsed.subtitle, venue: parsed.venue, location: parsed.location, startsAt: parsed.starts_at, locksAt: parsed.locks_at,
    season: parsed.season, status: parsed.status, canControl: parsed.can_control,
    headerStoragePath: parsed.header_storage_path, headerNaturalWidth: parsed.header_natural_width, headerNaturalHeight: parsed.header_natural_height,
    spotlights: parsed.spotlights.map(mapSpotlight),
    bouts: parsed.bouts.map((bout) => ({
      boutId: bout.bout_id, locksAt: bout.locks_at, isLocked: bout.is_locked, position: bout.position, weightClass: bout.weight_class,
      redFighterSlug: bout.red_fighter_slug, redFighterName: bout.red_fighter_name, blueFighterSlug: bout.blue_fighter_slug, blueFighterName: bout.blue_fighter_name,
      redAmericanOdds: bout.red_american_odds, blueAmericanOdds: bout.blue_american_odds, oddsSource: bout.odds_source, oddsUpdatedAt: bout.odds_updated_at,
      winnerFighterSlug: bout.winner_fighter_slug, resultStatus: bout.result_status, resultRecordedAt: bout.result_recorded_at, includedInPicks: bout.included_in_picks,
      groupPicks: bout.group_picks.map(mapGroupPick), repickRequired: bout.repick_required,
    })),
  };
}

function mapLock(value: unknown): UnderdogLock {
  const parsed = lockSchema.parse(value);
  return { eventId: parsed.event_id, boutId: parsed.bout_id, fighterSlug: parsed.fighter_slug, selectedAt: parsed.selected_at, frozenAmericanOdds: parsed.frozen_american_odds };
}
function mapPick(value: unknown): ProfileEventPick {
  const parsed = pickRowSchema.parse(value);
  return { eventId: parsed.event_id, boutId: parsed.bout_id, fighterSlug: parsed.fighter_slug, pickedAt: parsed.picked_at, updatedAt: parsed.updated_at };
}
function mapSummary(value: unknown): PickSummary {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = summaryRowSchema.parse(raw);
  return { correct: parsed.correct, incorrect: parsed.incorrect, pending: parsed.pending, eventsEntered: parsed.events_entered, basePoints: parsed.base_points, lockBonus: parsed.lock_bonus, totalPoints: parsed.total_points };
}
function mapHistory(value: unknown): PickHistory {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = historySchema.parse(raw);
  return {
    season: parsed.season,
    summary: { correct: parsed.summary.correct, incorrect: parsed.summary.incorrect, missing: parsed.summary.missing, excluded: parsed.summary.excluded, eventsEntered: parsed.summary.events_entered, basePoints: parsed.summary.base_points, lockBonus: parsed.summary.lock_bonus, totalPoints: parsed.summary.total_points },
    seasonStandings: parsed.season_standings.map((standing) => ({ rank: standing.rank, profileId: standing.profile_id, displayName: standing.display_name, correct: standing.correct, incorrect: standing.incorrect, missing: standing.missing, excluded: standing.excluded, eventsEntered: standing.events_entered, basePoints: standing.base_points, lockBonus: standing.lock_bonus, totalPoints: standing.total_points, isCurrentUser: standing.is_current_user })),
    events: parsed.events.map((event) => ({
      eventId: event.event_id, name: event.name, subtitle: event.subtitle, venue: event.venue, location: event.location, startsAt: event.starts_at, season: event.season, completedAt: event.completed_at,
      record: { correct: event.record.correct, incorrect: event.record.incorrect, missing: event.record.missing, excluded: event.record.excluded, basePoints: event.record.base_points, lockBonus: event.record.lock_bonus, totalPoints: event.record.total_points },
      underdogLock: event.underdog_lock ? mapLock(event.underdog_lock) : null,
      watchMoments: event.watch_moments.map((moment) => ({ title: moment.title, url: moment.url })),
      bouts: event.bouts.map((bout) => ({ boutId: bout.bout_id, position: bout.position, weightClass: bout.weight_class, redFighterSlug: bout.red_fighter_slug, redFighterName: bout.red_fighter_name, blueFighterSlug: bout.blue_fighter_slug, blueFighterName: bout.blue_fighter_name, resultStatus: bout.result_status, winnerFighterSlug: bout.winner_fighter_slug, pickedFighterSlug: bout.picked_fighter_slug, verdict: bout.verdict, includedInPicks: bout.included_in_picks, groupPicks: bout.group_picks.map(mapGroupPick), repickRequired: bout.repick_required })),
      groupResults: event.group_results.map((result) => ({ rank: result.rank, profileId: result.profile_id, displayName: result.display_name, correct: result.correct, incorrect: result.incorrect, missing: result.missing, excluded: result.excluded, basePoints: result.base_points, lockBonus: result.lock_bonus, totalPoints: result.total_points, isCurrentUser: result.is_current_user })),
    })),
  };
}

export function createPicksRepository(): PicksRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;
  return {
    async loadCurrentEvent() { return mapPickEvent(await requireRpcSuccess(client.rpc("get_current_pick_event"))); },
    async loadMyPicks(eventId) { return z.array(pickRowSchema).parse(await requireRpcSuccess(client.rpc("list_my_event_picks", { p_event_id: eventId })) ?? []).map(mapPick); },
    async loadMyUnderdogLock(eventId) { const data = await requireRpcSuccess(client.rpc("get_my_event_underdog_lock", { p_event_id: eventId })); const raw = Array.isArray(data) ? data[0] : data; return raw ? mapLock(raw) : null; },
    async loadMySummary(season) { return mapSummary(await requireRpcSuccess(client.rpc("get_my_pick_summary", { p_season: season }))); },
    async loadMyHistory(season) { return mapHistory(await requireRpcSuccess(client.rpc("get_my_pick_history", { p_season: season }))); },
    async savePick(eventId, boutId, fighterSlug) { const data = await requireRpcSuccess(client.rpc("save_my_event_pick", { p_event_id: eventId, p_bout_id: boutId, p_fighter_slug: fighterSlug })); return mapPick(Array.isArray(data) ? data[0] : data); },
    async setUnderdogLock(eventId, boutId, fighterSlug) { const data = await requireRpcSuccess(client.rpc("set_my_event_underdog_lock", { p_event_id: eventId, p_bout_id: boutId, p_fighter_slug: fighterSlug })); return mapLock(Array.isArray(data) ? data[0] : data); },
    async clearUnderdogLock(eventId) { await requireRpcSuccess(client.rpc("clear_my_event_underdog_lock", { p_event_id: eventId })); },
  };
}
