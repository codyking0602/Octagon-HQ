import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  PickSetupBoutInput,
  PickSetupCardScope,
  PickSetupDraft,
  PickSetupFootballLeague,
  PickSetupFootballWeekGame,
  PickSetupFootballWeekPreview,
  PickSetupMetadataPatch,
  PickSetupSourcePreview,
  PickSetupSport,
  PickSetupSpotlight,
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
  kickoff_at: z.string().nullable().optional(),
  home_team_slug: z.string().nullable().optional(),
  away_team_slug: z.string().nullable().optional(),
  spread_home: z.number().nullable().optional(),
  spread_source: z.string().nullable().optional(),
  spread_updated_at: z.string().nullable().optional(),
});

const spotlightWatchDbSchema = z.object({ fighter_slug: z.string().min(1), url: z.string().url() });
const spotlightFighterDbSchema = z.object({
  fighter_slug: z.string().min(1),
  record: z.string().min(1),
  age: z.string().min(1),
  height: z.string().min(1),
  reach: z.string().min(1),
  stance: z.string().min(1),
  edges: z.array(z.string().min(3)).max(3),
});
const spotlightDbSchema = z.object({
  bout_id: z.string().min(1),
  preview: z.string().min(20),
  red: spotlightFighterDbSchema,
  blue: spotlightFighterDbSchema,
  watch_spotlights: z.array(spotlightWatchDbSchema).max(2),
  source: z.literal("UFCStats"),
  generated_at: z.string().min(10),
});

const spotlightWatchSchema = z.object({ fighterSlug: z.string().min(1), url: z.string().url() });
const spotlightFighterSchema = z.object({
  fighterSlug: z.string().min(1),
  record: z.string().min(1),
  age: z.string().min(1),
  height: z.string().min(1),
  reach: z.string().min(1),
  stance: z.string().min(1),
  edges: z.array(z.string().min(3)).max(3),
});
const spotlightSchema = z.object({
  boutId: z.string().min(1),
  preview: z.string().min(20),
  red: spotlightFighterSchema,
  blue: spotlightFighterSchema,
  watchSpotlights: z.array(spotlightWatchSchema).max(2),
  source: z.literal("UFCStats"),
  generatedAt: z.string().min(10),
});

const draftSchema = z.object({
  draft_id: z.string(), source: z.string(), source_event_key: z.string(), source_url: z.string().nullable(),
  event_id: z.string(), sport: z.enum(["mma", "football"]).optional(), league: z.string().nullable().optional(),
  event_kind: z.string().optional(), name: z.string(), subtitle: z.string(), venue: z.string().nullable(), location: z.string().nullable(),
  starts_at: z.string().nullable(), locks_at: z.string().nullable(), season: z.number().int(), state: z.enum(["staged", "published"]),
  synced_at: z.string(), updated_at: z.string(), warnings: z.array(z.string()).default([]), can_publish: z.boolean(),
  spotlights: z.array(spotlightDbSchema).optional().default([]), bouts: z.array(draftBoutSchema),
});

const sourcePreviewSchema = z.object({
  source_hash: z.string().min(1), requested_scope: z.enum(["auto", "main", "full"]), effective_scope: z.enum(["main", "full"]),
  source: z.string(), source_url: z.string(), fight_count: z.number().int().nonnegative(), changes: z.array(z.string()), warnings: z.array(z.string()).default([]),
  event_preview: z.object({
    name: z.string(), subtitle: z.string(), venue: z.string(), location: z.string(), starts_at: z.string(), locks_at: z.string(), bouts: z.array(draftBoutSchema),
  }),
});

const footballWeekGameSchema = z.object({
  espn_event_id: z.string().min(1),
  league: z.enum(["nfl", "college-football"]),
  name: z.string().min(1),
  kickoff_at: z.string().min(1),
  home_team_name: z.string().min(1),
  away_team_name: z.string().min(1),
  home_rank: z.number().int().min(1).max(25).nullable(),
  away_rank: z.number().int().min(1).max(25).nullable(),
  candidate_rank: z.number().int().positive().optional(),
});

const footballWeekPreviewSchema = z.object({
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  week_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  required_college_count: z.number().int().nonnegative().max(8),
  nfl_games: z.array(footballWeekGameSchema),
  college_candidates: z.array(footballWeekGameSchema).max(12),
});

export interface PickSetupRepository {
  loadDraft: (sport?: PickSetupSport) => Promise<PickSetupDraft | null>;
  syncNextEvent: (scope: PickSetupCardScope, sourceUrl?: string) => Promise<void>;
  syncFootballGame?: (league: PickSetupFootballLeague, espnEventId: string) => Promise<void>;
  previewFootballWeek?: (weekStart: string) => Promise<PickSetupFootballWeekPreview>;
  stageFootballWeek?: (weekStart: string, collegeEventIds: string[]) => Promise<void>;
  previewSource: (scope: PickSetupCardScope, sourceUrl?: string) => Promise<PickSetupSourcePreview>;
  applySourcePreview: (preview: PickSetupSourcePreview) => Promise<void>;
  updateMetadata: (draftId: string, patch: PickSetupMetadataPatch) => Promise<void>;
  saveBout: (draftId: string, bout: PickSetupBoutInput) => Promise<void>;
  removeBout: (draftId: string, boutId: string) => Promise<void>;
  reorderBouts: (draftId: string, boutIds: string[]) => Promise<void>;
  buildSpotlight?: (draftId: string, boutId: string) => Promise<PickSetupSpotlight>;
  saveSpotlights?: (draftId: string, spotlights: PickSetupSpotlight[]) => Promise<void>;
  publishDraft: (draftId: string) => Promise<void>;
  discardDraft: (draftId: string) => Promise<void>;
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Event Setup could not complete that request.");
  return data;
}
function nonEmptyMessage(value: unknown) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function sourceUrlBody(sourceUrl?: string) { const value = sourceUrl?.trim(); return value ? { source_url: value } : {}; }

export async function pickSetupFunctionErrorMessage(error: unknown) {
  const candidate = error && typeof error === "object" ? error as { message?: unknown; context?: unknown } : null;
  const context = candidate?.context;
  if (context && typeof context === "object") {
    type JsonContext = { clone?: () => unknown; json?: () => Promise<unknown> };
    const original = context as JsonContext;
    let readable = original;
    if (typeof original.clone === "function") {
      try { const cloned = original.clone(); if (cloned && typeof cloned === "object") readable = cloned as JsonContext; } catch { /* fallback below */ }
    }
    if (typeof readable.json === "function") {
      try {
        const payload = await readable.json();
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          const message = nonEmptyMessage((payload as Record<string, unknown>).message) ?? nonEmptyMessage((payload as Record<string, unknown>).error);
          if (message) return message;
        }
      } catch { /* fallback below */ }
    }
  }
  return nonEmptyMessage(candidate?.message) ?? (error instanceof Error ? nonEmptyMessage(error.message) : null) ?? "The Picks event could not be synced.";
}

function mapBout(bout: z.infer<typeof draftBoutSchema>) {
  return {
    boutId: bout.bout_id, position: bout.position, weightClass: bout.weight_class,
    redFighterSlug: bout.red_fighter_slug, redFighterName: bout.red_fighter_name,
    blueFighterSlug: bout.blue_fighter_slug, blueFighterName: bout.blue_fighter_name, included: bout.included,
    ...(bout.kickoff_at !== undefined ? { kickoffAt: bout.kickoff_at } : {}),
    ...(bout.home_team_slug !== undefined ? { homeTeamSlug: bout.home_team_slug } : {}),
    ...(bout.away_team_slug !== undefined ? { awayTeamSlug: bout.away_team_slug } : {}),
    ...(bout.spread_home !== undefined ? { spreadHome: bout.spread_home } : {}),
    ...(bout.spread_source !== undefined ? { spreadSource: bout.spread_source } : {}),
    ...(bout.spread_updated_at !== undefined ? { spreadUpdatedAt: bout.spread_updated_at } : {}),
  };
}
function mapDbFighter(fighter: z.infer<typeof spotlightFighterDbSchema>) {
  return { fighterSlug: fighter.fighter_slug, record: fighter.record, age: fighter.age, height: fighter.height, reach: fighter.reach, stance: fighter.stance, edges: fighter.edges };
}
function mapDbSpotlight(spotlight: z.infer<typeof spotlightDbSchema>): PickSetupSpotlight {
  return {
    boutId: spotlight.bout_id, preview: spotlight.preview, red: mapDbFighter(spotlight.red), blue: mapDbFighter(spotlight.blue),
    watchSpotlights: spotlight.watch_spotlights.map((watch) => ({ fighterSlug: watch.fighter_slug, url: watch.url })),
    source: spotlight.source, generatedAt: spotlight.generated_at,
  };
}
function spotlightPayload(spotlight: PickSetupSpotlight) {
  const fighter = (value: PickSetupSpotlight["red"]) => ({ fighter_slug: value.fighterSlug, record: value.record, age: value.age, height: value.height, reach: value.reach, stance: value.stance, edges: value.edges });
  return {
    bout_id: spotlight.boutId, preview: spotlight.preview, red: fighter(spotlight.red), blue: fighter(spotlight.blue),
    watch_spotlights: spotlight.watchSpotlights.map((watch) => ({ fighter_slug: watch.fighterSlug, url: watch.url })),
    source: spotlight.source, generated_at: spotlight.generatedAt,
  };
}
function mapFootballWeekGame(value: z.infer<typeof footballWeekGameSchema>): PickSetupFootballWeekGame {
  return {
    espnEventId: value.espn_event_id,
    league: value.league,
    name: value.name,
    kickoffAt: value.kickoff_at,
    homeTeamName: value.home_team_name,
    awayTeamName: value.away_team_name,
    homeRank: value.home_rank,
    awayRank: value.away_rank,
    ...(value.candidate_rank !== undefined ? { candidateRank: value.candidate_rank } : {}),
  };
}

export function mapPickSetupDraft(value: unknown): PickSetupDraft | null {
  if (!value) return null;
  const parsed = draftSchema.parse(value);
  return {
    draftId: parsed.draft_id, source: parsed.source, sourceEventKey: parsed.source_event_key, sourceUrl: parsed.source_url,
    eventId: parsed.event_id,
    ...(parsed.sport !== undefined ? { sport: parsed.sport } : {}),
    ...(parsed.league !== undefined ? { league: parsed.league } : {}),
    ...(parsed.event_kind !== undefined ? { eventKind: parsed.event_kind } : {}),
    name: parsed.name, subtitle: parsed.subtitle, venue: parsed.venue ?? "", location: parsed.location ?? "",
    startsAt: parsed.starts_at, locksAt: parsed.locks_at, season: parsed.season, state: parsed.state, syncedAt: parsed.synced_at, updatedAt: parsed.updated_at,
    warnings: parsed.warnings, canPublish: parsed.can_publish, spotlights: parsed.spotlights.map(mapDbSpotlight), bouts: parsed.bouts.map(mapBout),
  };
}
export function mapPickSetupSourcePreview(value: unknown): PickSetupSourcePreview {
  const parsed = sourcePreviewSchema.parse(value);
  return {
    sourceHash: parsed.source_hash, requestedScope: parsed.requested_scope, effectiveScope: parsed.effective_scope, source: parsed.source, sourceUrl: parsed.source_url,
    fightCount: parsed.fight_count, changes: parsed.changes, warnings: parsed.warnings,
    event: { name: parsed.event_preview.name, subtitle: parsed.event_preview.subtitle, venue: parsed.event_preview.venue, location: parsed.event_preview.location, startsAt: parsed.event_preview.starts_at, locksAt: parsed.event_preview.locks_at, bouts: parsed.event_preview.bouts.map(mapBout) },
  };
}
export function mapPickSetupFootballWeekPreview(value: unknown): PickSetupFootballWeekPreview {
  const parsed = footballWeekPreviewSchema.parse(value);
  return {
    weekStart: parsed.week_start,
    weekEnd: parsed.week_end,
    requiredCollegeCount: parsed.required_college_count,
    nflGames: parsed.nfl_games.map(mapFootballWeekGame),
    collegeCandidates: parsed.college_candidates.map(mapFootballWeekGame),
  };
}
export function mapBuiltPickSetupSpotlight(value: unknown): PickSetupSpotlight {
  return spotlightSchema.parse(value);
}

export function createPickSetupRepository(): PickSetupRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;
  async function invoke(name: string, body: Record<string, unknown>) {
    const { data, error } = await client.functions.invoke(name, { body });
    if (error) throw new Error(await pickSetupFunctionErrorMessage(error));
    return data;
  }
  async function syncFootball(body: Record<string, unknown>) {
    return invoke("sync-next-football-event", body);
  }
  return {
    async loadDraft(sport = "mma") {
      const request = sport === "football"
        ? client.rpc("get_pick_event_setup", { p_sport: "football" })
        : client.rpc("get_pick_event_setup");
      return mapPickSetupDraft(await requireRpcSuccess(request));
    },
    async syncNextEvent(scope, sourceUrl) { await invoke("sync-next-ufc-event", { mode: "apply", card_scope: scope, ...sourceUrlBody(sourceUrl) }); },
    async syncFootballGame(league, espnEventId) { await syncFootball({ mode: "apply", league, espn_event_id: espnEventId.trim() }); },
    async previewFootballWeek(weekStart) { return mapPickSetupFootballWeekPreview(await syncFootball({ mode: "week-preview", week_start: weekStart })); },
    async stageFootballWeek(weekStart, collegeEventIds) { await syncFootball({ mode: "week-apply", week_start: weekStart, college_event_ids: collegeEventIds }); },
    async previewSource(scope, sourceUrl) { return mapPickSetupSourcePreview(await invoke("sync-next-ufc-event", { mode: "preview", card_scope: scope, ...sourceUrlBody(sourceUrl) })); },
    async applySourcePreview(preview) { await invoke("sync-next-ufc-event", { mode: "apply", card_scope: preview.requestedScope, expected_hash: preview.sourceHash, source_url: preview.sourceUrl }); },
    async updateMetadata(draftId, patch) { await requireRpcSuccess(client.rpc("update_pick_event_draft", { p_draft_id: draftId, p_patch: patch })); },
    async saveBout(draftId, bout) { await requireRpcSuccess(client.rpc("upsert_pick_event_draft_bout", { p_draft_id: draftId, p_bout: bout })); },
    async removeBout(draftId, boutId) { await requireRpcSuccess(client.rpc("delete_pick_event_draft_bout", { p_draft_id: draftId, p_bout_id: boutId })); },
    async reorderBouts(draftId, boutIds) { await requireRpcSuccess(client.rpc("reorder_pick_event_draft_bouts", { p_draft_id: draftId, p_bout_ids: boutIds })); },
    async buildSpotlight(draftId, boutId) {
      const payload = await invoke("build-pick-spotlight", { draft_id: draftId, bout_id: boutId });
      const raw = payload && typeof payload === "object" ? (payload as Record<string, unknown>).spotlight : null;
      return mapBuiltPickSetupSpotlight(raw);
    },
    async saveSpotlights(draftId, spotlights) {
      await requireRpcSuccess(client.rpc("set_pick_event_draft_spotlight", { p_draft_id: draftId, p_spotlight: spotlights.map(spotlightPayload) }));
    },
    async publishDraft(draftId) { await requireRpcSuccess(client.rpc("publish_pick_event_draft", { p_draft_id: draftId })); },
    async discardDraft(draftId) { await requireRpcSuccess(client.rpc("discard_pick_event_draft", { p_draft_id: draftId })); },
  };
}
