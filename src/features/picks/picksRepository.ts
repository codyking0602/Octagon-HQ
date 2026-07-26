import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  PickEvent,
  PickHistory,
  PickSummary,
  ProfileEventPick,
} from "./picksModel";

const boutSchema = z.object({
  bout_id: z.string(),
  position: z.number().int().positive(),
  weight_class: z.string(),
  red_fighter_slug: z.string(),
  red_fighter_name: z.string(),
  blue_fighter_slug: z.string(),
  blue_fighter_name: z.string(),
  winner_fighter_slug: z.string().nullable(),
});

const eventSchema = z.object({
  event_id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  venue: z.string(),
  location: z.string(),
  starts_at: z.string(),
  locks_at: z.string(),
  season: z.number().int(),
  status: z.enum(["upcoming", "locked", "complete"]),
  bouts: z.array(boutSchema),
});

const pickRowSchema = z.object({
  event_id: z.string(),
  bout_id: z.string(),
  fighter_slug: z.string(),
  picked_at: z.string(),
  updated_at: z.string(),
});

const summaryRowSchema = z.object({
  correct: z.number().int().nonnegative(),
  incorrect: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  events_entered: z.number().int().nonnegative(),
});

const historyRecordSchema = z.object({
  correct: z.number().int().nonnegative(),
  incorrect: z.number().int().nonnegative(),
  missing: z.number().int().nonnegative(),
  excluded: z.number().int().nonnegative(),
});

const historyBoutSchema = z.object({
  bout_id: z.string(),
  position: z.number().int().positive(),
  weight_class: z.string(),
  red_fighter_slug: z.string(),
  red_fighter_name: z.string(),
  blue_fighter_slug: z.string(),
  blue_fighter_name: z.string(),
  result_status: z.enum(["pending", "red_win", "blue_win", "draw", "no_contest", "cancelled"]),
  winner_fighter_slug: z.string().nullable(),
  picked_fighter_slug: z.string().nullable(),
  verdict: z.enum(["correct", "incorrect", "missing", "excluded", "pending"]),
});

const groupResultSchema = historyRecordSchema.extend({
  display_name: z.string(),
  is_current_user: z.boolean(),
});

const historyEventSchema = z.object({
  event_id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  venue: z.string(),
  location: z.string(),
  starts_at: z.string(),
  season: z.number().int(),
  completed_at: z.string(),
  record: historyRecordSchema,
  bouts: z.array(historyBoutSchema),
  group_results: z.array(groupResultSchema),
});

const historySchema = z.object({
  season: z.number().int().nullable(),
  summary: historyRecordSchema.extend({
    events_entered: z.number().int().nonnegative(),
  }),
  events: z.array(historyEventSchema),
});

export interface PicksRepository {
  loadCurrentEvent: () => Promise<PickEvent | null>;
  loadMyPicks: (eventId: string) => Promise<ProfileEventPick[]>;
  loadMySummary: (season: number) => Promise<PickSummary>;
  loadMyHistory: (season: number | null) => Promise<PickHistory>;
  savePick: (eventId: string, boutId: string, fighterSlug: string) => Promise<ProfileEventPick>;
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Octagon HQ could not load Picks.");
  return data;
}

function mapEvent(value: unknown): PickEvent | null {
  if (!value) return null;
  const parsed = eventSchema.parse(value);
  return {
    eventId: parsed.event_id,
    name: parsed.name,
    subtitle: parsed.subtitle,
    venue: parsed.venue,
    location: parsed.location,
    startsAt: parsed.starts_at,
    locksAt: parsed.locks_at,
    season: parsed.season,
    status: parsed.status,
    bouts: parsed.bouts.map((bout) => ({
      boutId: bout.bout_id,
      position: bout.position,
      weightClass: bout.weight_class,
      redFighterSlug: bout.red_fighter_slug,
      redFighterName: bout.red_fighter_name,
      blueFighterSlug: bout.blue_fighter_slug,
      blueFighterName: bout.blue_fighter_name,
      winnerFighterSlug: bout.winner_fighter_slug,
    })),
  };
}

function mapPick(value: unknown): ProfileEventPick {
  const parsed = pickRowSchema.parse(value);
  return {
    eventId: parsed.event_id,
    boutId: parsed.bout_id,
    fighterSlug: parsed.fighter_slug,
    pickedAt: parsed.picked_at,
    updatedAt: parsed.updated_at,
  };
}

function mapSummary(value: unknown): PickSummary {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = summaryRowSchema.parse(raw);
  return {
    correct: parsed.correct,
    incorrect: parsed.incorrect,
    pending: parsed.pending,
    eventsEntered: parsed.events_entered,
  };
}

function mapHistory(value: unknown): PickHistory {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = historySchema.parse(raw);
  return {
    season: parsed.season,
    summary: {
      correct: parsed.summary.correct,
      incorrect: parsed.summary.incorrect,
      missing: parsed.summary.missing,
      excluded: parsed.summary.excluded,
      eventsEntered: parsed.summary.events_entered,
    },
    events: parsed.events.map((event) => ({
      eventId: event.event_id,
      name: event.name,
      subtitle: event.subtitle,
      venue: event.venue,
      location: event.location,
      startsAt: event.starts_at,
      season: event.season,
      completedAt: event.completed_at,
      record: {
        correct: event.record.correct,
        incorrect: event.record.incorrect,
        missing: event.record.missing,
        excluded: event.record.excluded,
      },
      bouts: event.bouts.map((bout) => ({
        boutId: bout.bout_id,
        position: bout.position,
        weightClass: bout.weight_class,
        redFighterSlug: bout.red_fighter_slug,
        redFighterName: bout.red_fighter_name,
        blueFighterSlug: bout.blue_fighter_slug,
        blueFighterName: bout.blue_fighter_name,
        resultStatus: bout.result_status,
        winnerFighterSlug: bout.winner_fighter_slug,
        pickedFighterSlug: bout.picked_fighter_slug,
        verdict: bout.verdict,
      })),
      groupResults: event.group_results.map((result) => ({
        displayName: result.display_name,
        correct: result.correct,
        incorrect: result.incorrect,
        missing: result.missing,
        excluded: result.excluded,
        isCurrentUser: result.is_current_user,
      })),
    })),
  };
}

export function createPicksRepository(): PicksRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async loadCurrentEvent() {
      const data = await requireRpcSuccess(client.rpc("get_current_pick_event"));
      return mapEvent(data);
    },

    async loadMyPicks(eventId) {
      const data = await requireRpcSuccess(client.rpc("list_my_event_picks", {
        p_event_id: eventId,
      }));
      return z.array(pickRowSchema).parse(data ?? []).map(mapPick);
    },

    async loadMySummary(season) {
      const data = await requireRpcSuccess(client.rpc("get_my_pick_summary", {
        p_season: season,
      }));
      return mapSummary(data);
    },

    async loadMyHistory(season) {
      const data = await requireRpcSuccess(client.rpc("get_my_pick_history", {
        p_season: season,
      }));
      return mapHistory(data);
    },

    async savePick(eventId, boutId, fighterSlug) {
      const data = await requireRpcSuccess(client.rpc("save_my_event_pick", {
        p_event_id: eventId,
        p_bout_id: boutId,
        p_fighter_slug: fighterSlug,
      }));
      return mapPick(Array.isArray(data) ? data[0] : data);
    },
  };
}
