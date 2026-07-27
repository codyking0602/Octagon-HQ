import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  PickSetupBoutInput,
  PickSetupCardScope,
  PickSetupDraft,
  PickSetupMetadataPatch,
  PickSetupSourcePreview,
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

const sourcePreviewSchema = z.object({
  source_hash: z.string().min(1),
  requested_scope: z.enum(["auto", "main", "full"]),
  effective_scope: z.enum(["main", "full"]),
  source: z.string(),
  source_url: z.string(),
  fight_count: z.number().int().nonnegative(),
  changes: z.array(z.string()),
  warnings: z.array(z.string()).default([]),
});

export interface PickSetupRepository {
  loadDraft: () => Promise<PickSetupDraft | null>;
  syncNextEvent: (scope: PickSetupCardScope, sourceUrl?: string) => Promise<void>;
  previewSource: (scope: PickSetupCardScope, sourceUrl?: string) => Promise<PickSetupSourcePreview>;
  applySourcePreview: (preview: PickSetupSourcePreview) => Promise<void>;
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

function nonEmptyMessage(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sourceUrlBody(sourceUrl?: string) {
  const value = sourceUrl?.trim();
  return value ? { source_url: value } : {};
}

export async function pickSetupFunctionErrorMessage(error: unknown) {
  const candidate = error && typeof error === "object"
    ? error as { message?: unknown; context?: unknown }
    : null;
  const context = candidate?.context;

  if (context && typeof context === "object") {
    type JsonContext = {
      clone?: () => unknown;
      json?: () => Promise<unknown>;
    };
    const original = context as JsonContext;
    let readable = original;

    if (typeof original.clone === "function") {
      try {
        const cloned = original.clone();
        if (cloned && typeof cloned === "object") readable = cloned as JsonContext;
      } catch {
        // Fall through to the original context or generic Functions client message.
      }
    }

    if (typeof readable.json === "function") {
      try {
        const payload = await readable.json();
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          const message = nonEmptyMessage((payload as Record<string, unknown>).message);
          if (message) return message;
        }
      } catch {
        // The Functions client message remains the safe fallback for a non-JSON response.
      }
    }
  }

  return nonEmptyMessage(candidate?.message)
    ?? (error instanceof Error ? nonEmptyMessage(error.message) : null)
    ?? "The next UFC event could not be synced.";
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

export function mapPickSetupSourcePreview(value: unknown): PickSetupSourcePreview {
  const parsed = sourcePreviewSchema.parse(value);
  return {
    sourceHash: parsed.source_hash,
    requestedScope: parsed.requested_scope,
    effectiveScope: parsed.effective_scope,
    source: parsed.source,
    sourceUrl: parsed.source_url,
    fightCount: parsed.fight_count,
    changes: parsed.changes,
    warnings: parsed.warnings,
  };
}

export function createPickSetupRepository(): PickSetupRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  async function invokeSync(body: Record<string, unknown>) {
    const { data, error } = await client.functions.invoke("sync-next-ufc-event", { body });
    if (error) throw new Error(await pickSetupFunctionErrorMessage(error));
    return data;
  }

  return {
    async loadDraft() {
      return mapPickSetupDraft(await requireRpcSuccess(client.rpc("get_pick_event_setup")));
    },

    async syncNextEvent(scope, sourceUrl) {
      await invokeSync({ mode: "apply", card_scope: scope, ...sourceUrlBody(sourceUrl) });
    },

    async previewSource(scope, sourceUrl) {
      const data = await invokeSync({ mode: "preview", card_scope: scope, ...sourceUrlBody(sourceUrl) });
      return mapPickSetupSourcePreview(data);
    },

    async applySourcePreview(preview) {
      await invokeSync({
        mode: "apply",
        card_scope: preview.requestedScope,
        expected_hash: preview.sourceHash,
        source_url: preview.sourceUrl,
      });
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
