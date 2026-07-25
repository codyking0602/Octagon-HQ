import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { PickEvent, PickSummary, ProfileEventPick } from "./picksModel";

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

export interface PicksRepository {
  loadCurrentEvent: () => Promise<PickEvent | null>;
  loadMyPicks: (eventId: string) => Promise<ProfileEventPick[]>;
  loadMySummary: (season: number) => Promise<PickSummary>;
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
