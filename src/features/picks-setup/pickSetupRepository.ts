import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  PickSetupBoutInput,
  PickSetupDraft,
  PickSetupMetadataPatch,
} from "./pickSetupModel";

const draftBoutSchema = z.object({
  bout_id: z.string(),
  position: z.number().int().positive(),
  weight_class: z.string(),
  red_fighter_slug: z.string(),
  red_fighter_name: z.string(),
  blue_fighter_slug: z.string(),
  blue_fighter_name: z.string(),
  included: z.boolean(),
});

const draftSchema = z.object({
  draft_id: z.string(),
  source: z.string(),
  source_event_key: z.string(),
  source_url: z.string().nullable(),
  event_id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  venue: z.string().nullable(),
  location: z.string().nullable(),
  starts_at: z.string().nullable(),
  locks_at: z.string().nullable(),
  season: z.number().int(),
  state: z.enum(["staged", "published"]),
  synced_at: z.string(),
  updated_at: z.string(),
  warnings: z.array(z.string()).default([]),
  can_publish: z.boolean(),
  bouts: z.array(draftBoutSchema),
});

export interface PickSetupRepository {
  loadDraft: () => Promise<PickSetupDraft | null>;
  syncNextEvent: () => Promise<void>;
  updateMetadata: (draftId: string, patch: PickSetupMetadataPatch) => Promise<void>;
  saveBout: (draftId: string, bout: PickSetupBoutInput) => Promise<void>;
  removeBout: (draftId: string, boutId: string) => Promise<void>;
  reorderBouts: (draftId: string, boutIds: string[]) => Promise<void>;
  publishDraft: (draftId: string) => Promise<void>;
  discardDraft: (draftId: string) => Promise<void>;
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Event Setup could not complete that request.");
  return data;
}

export function mapPickSetupDraft(value: unknown): PickSetupDraft | null {
  if (!value) return null;
  const parsed = draftSchema.parse(value);
  return {
    draftId: parsed.draft_id,
    source: parsed.source,
    sourceEventKey: parsed.source_event_key,
    sourceUrl: parsed.source_url,
    eventId: parsed.event_id,
    name: parsed.name,
    subtitle: parsed.subtitle,
    venue: parsed.venue ?? "",
    location: parsed.location ?? "",
    startsAt: parsed.starts_at,
    locksAt: parsed.locks_at,
    season: parsed.season,
    state: parsed.state,
    syncedAt: parsed.synced_at,
    updatedAt: parsed.updated_at,
    warnings: parsed.warnings,
    canPublish: parsed.can_publish,
    bouts: parsed.bouts.map((bout) => ({
      boutId: bout.bout_id,
      position: bout.position,
      weightClass: bout.weight_class,
      redFighterSlug: bout.red_fighter_slug,
      redFighterName: bout.red_fighter_name,
      blueFighterSlug: bout.blue_fighter_slug,
      blueFighterName: bout.blue_fighter_name,
      included: bout.included,
    })),
  };
}

export function createPickSetupRepository(): PickSetupRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async loadDraft() {
      return mapPickSetupDraft(await requireRpcSuccess(client.rpc("get_pick_event_setup")));
    },

    async syncNextEvent() {
      const { error } = await client.functions.invoke("sync-next-ufc-event", { body: {} });
      if (error) throw new Error(error.message || "The next UFC event could not be synced.");
    },

    async updateMetadata(draftId, patch) {
      await requireRpcSuccess(client.rpc("update_pick_event_draft", {
        p_draft_id: draftId,
        p_patch: patch,
      }));
    },

    async saveBout(draftId, bout) {
      await requireRpcSuccess(client.rpc("upsert_pick_event_draft_bout", {
        p_draft_id: draftId,
        p_bout: bout,
      }));
    },

    async removeBout(draftId, boutId) {
      await requireRpcSuccess(client.rpc("delete_pick_event_draft_bout", {
        p_draft_id: draftId,
        p_bout_id: boutId,
      }));
    },

    async reorderBouts(draftId, boutIds) {
      await requireRpcSuccess(client.rpc("reorder_pick_event_draft_bouts", {
        p_draft_id: draftId,
        p_bout_ids: boutIds,
      }));
    },

    async publishDraft(draftId) {
      await requireRpcSuccess(client.rpc("publish_pick_event_draft", { p_draft_id: draftId }));
    },

    async discardDraft(draftId) {
      await requireRpcSuccess(client.rpc("discard_pick_event_draft", { p_draft_id: draftId }));
    },
  };
}
