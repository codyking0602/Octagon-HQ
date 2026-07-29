import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { PickBoutResultStatus } from "../picks/picksModel";
import type { PickControlEvent } from "./pickControlModel";

const completedEventOptionSchema = z.object({
  event_id: z.string(),
  name: z.string(),
  starts_at: z.string(),
  completed_at: z.string(),
});

const controlBoutSchema = z.object({
  bout_id: z.string(),
  position: z.number().int().positive(),
  weight_class: z.string(),
  red_fighter_slug: z.string(),
  red_fighter_name: z.string(),
  blue_fighter_slug: z.string(),
  blue_fighter_name: z.string(),
  result_status: z.enum(["pending", "red_win", "blue_win", "draw", "no_contest", "cancelled"]),
  winner_fighter_slug: z.string().nullable(),
  result_recorded_at: z.string().nullable(),
  included_in_picks: z.boolean().optional().default(true),
  can_cancel: z.boolean().optional().default(false),
  can_restore: z.boolean().optional().default(false),
  can_replace: z.boolean().optional().default(false),
  can_remove_from_picks: z.boolean().optional().default(false),
  can_restore_to_picks: z.boolean().optional().default(false),
  can_correct_result: z.boolean().optional().default(false),
  has_replacement_history: z.boolean().optional().default(false),
  has_removal_history: z.boolean().optional().default(false),
  has_correction_history: z.boolean().optional().default(false),
});

const controlEventSchema = z.object({
  event_id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  venue: z.string(),
  location: z.string(),
  starts_at: z.string(),
  locks_at: z.string(),
  season: z.number().int(),
  status: z.enum(["upcoming", "locked", "complete"]),
  can_lock: z.boolean(),
  can_complete: z.boolean(),
  can_reorder: z.boolean().optional().default(false),
  has_reorder_history: z.boolean().optional().default(false),
  recent_completed_events: z.array(completedEventOptionSchema).optional().default([]),
  bouts: z.array(controlBoutSchema),
});

export interface PickControlRepository {
  loadControlEvent: (eventId?: string) => Promise<PickControlEvent | null>;
  lockEvent: (eventId: string) => Promise<void>;
  adjustLockTime?: (eventId: string, locksAt: string, expectedLocksAt: string, reason: string) => Promise<void>;
  setCancellation: (eventId: string, boutId: string, cancelled: boolean, reason: string) => Promise<void>;
  setBoutInclusion: (eventId: string, bout: PickControlEvent["bouts"][number], includedInPicks: boolean, reason: string) => Promise<void>;
  replaceFighter: (eventId: string, bout: PickControlEvent["bouts"][number], corner: "red" | "blue", slug: string, name: string, reason: string) => Promise<void>;
  reorderCard: (eventId: string, expectedBoutIds: string[], proposedBoutIds: string[], reason: string) => Promise<void>;
  recordResult: (eventId: string, boutId: string, result: PickBoutResultStatus) => Promise<void>;
  correctResult: (eventId: string, bout: PickControlEvent["bouts"][number], result: PickBoutResultStatus, reason: string) => Promise<void>;
  completeEvent: (eventId: string) => Promise<void>;
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Fight Night Control could not complete that request.");
  return data;
}

export function mapPickControlEvent(value: unknown): PickControlEvent | null {
  if (!value) return null;
  const parsed = controlEventSchema.parse(value);
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
    canLock: parsed.can_lock,
    canComplete: parsed.can_complete,
    canReorder: parsed.can_reorder,
    hasReorderHistory: parsed.has_reorder_history,
    recentCompletedEvents: parsed.recent_completed_events.map((event) => ({
      eventId: event.event_id,
      name: event.name,
      startsAt: event.starts_at,
      completedAt: event.completed_at,
    })),
    bouts: parsed.bouts.map((bout) => ({
      boutId: bout.bout_id,
      position: bout.position,
      weightClass: bout.weight_class,
      redFighterSlug: bout.red_fighter_slug,
      redFighterName: bout.red_fighter_name,
      blueFighterSlug: bout.blue_fighter_slug,
      blueFighterName: bout.blue_fighter_name,
      resultStatus: bout.result_status,
      winnerFighterSlug: bout.winner_fighter_slug,
      resultRecordedAt: bout.result_recorded_at,
      includedInPicks: bout.included_in_picks,
      canCancel: bout.can_cancel,
      canRestore: bout.can_restore,
      canReplace: bout.can_replace,
      canRemoveFromPicks: bout.can_remove_from_picks,
      canRestoreToPicks: bout.can_restore_to_picks,
      canCorrectResult: bout.can_correct_result,
      hasReplacementHistory: bout.has_replacement_history,
      hasRemovalHistory: bout.has_removal_history,
      hasCorrectionHistory: bout.has_correction_history,
    })),
  };
}

export function createPickControlRepository(): PickControlRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async loadControlEvent(eventId) {
      const request = eventId
        ? client.rpc("get_pick_control_event", { p_event_id: eventId })
        : client.rpc("get_pick_control_event");
      const data = await requireRpcSuccess(request);
      return mapPickControlEvent(data);
    },

    async lockEvent(eventId) {
      await requireRpcSuccess(client.rpc("transition_pick_event", {
        p_event_id: eventId,
        p_target_status: "locked",
      }));
    },

    async adjustLockTime(eventId, locksAt, expectedLocksAt, reason) {
      const expectedDeadline = Date.parse(expectedLocksAt);
      if (!Number.isFinite(expectedDeadline) || Date.now() >= expectedDeadline) {
        throw new Error("Picks deadline has passed; it cannot be reopened.");
      }
      await requireRpcSuccess(client.rpc("adjust_pick_event_lock_time", {
        p_event_id: eventId,
        p_locks_at: locksAt,
        p_expected_locks_at: expectedLocksAt,
        p_reason: reason,
      }));
    },

    async setCancellation(eventId, boutId, cancelled, reason) {
      await requireRpcSuccess(client.rpc("approve_pick_bout_cancellation", {
        p_event_id: eventId,
        p_bout_id: boutId,
        p_cancelled: cancelled,
        p_reason: reason,
      }));
    },

    async setBoutInclusion(eventId, bout, includedInPicks, reason) {
      await requireRpcSuccess(client.rpc("approve_pick_bout_inclusion", {
        p_event_id: eventId,
        p_bout_id: bout.boutId,
        p_included_in_picks: includedInPicks,
        p_expected_included_in_picks: bout.includedInPicks,
        p_expected_red_fighter_slug: bout.redFighterSlug,
        p_expected_blue_fighter_slug: bout.blueFighterSlug,
        p_reason: reason,
      }));
    },

    async replaceFighter(eventId, bout, corner, slug, name, reason) {
      await requireRpcSuccess(client.rpc("approve_pick_fighter_replacement", {
        p_event_id: eventId,
        p_bout_id: bout.boutId,
        p_corner: corner,
        p_expected_red_fighter_slug: bout.redFighterSlug,
        p_expected_blue_fighter_slug: bout.blueFighterSlug,
        p_replacement_fighter_slug: slug,
        p_replacement_fighter_name: name,
        p_reason: reason,
      }));
    },

    async reorderCard(eventId, expectedBoutIds, proposedBoutIds, reason) {
      await requireRpcSuccess(client.rpc("approve_pick_card_reorder", {
        p_event_id: eventId,
        p_expected_bout_ids: expectedBoutIds,
        p_proposed_bout_ids: proposedBoutIds,
        p_reason: reason,
      }));
    },

    async recordResult(eventId, boutId, result) {
      await requireRpcSuccess(client.rpc("record_official_pick_bout_result", {
        p_event_id: eventId,
        p_bout_id: boutId,
        p_result_status: result,
      }));
    },

    async correctResult(eventId, bout, result, reason) {
      await requireRpcSuccess(client.rpc("correct_official_pick_bout_result", {
        p_event_id: eventId,
        p_bout_id: bout.boutId,
        p_result_status: result,
        p_expected_result_status: bout.resultStatus,
        p_expected_winner_fighter_slug: bout.winnerFighterSlug,
        p_expected_result_recorded_at: bout.resultRecordedAt,
        p_reason: reason,
      }));
    },

    async completeEvent(eventId) {
      await requireRpcSuccess(client.rpc("transition_pick_event", {
        p_event_id: eventId,
        p_target_status: "complete",
      }));
    },
  };
}