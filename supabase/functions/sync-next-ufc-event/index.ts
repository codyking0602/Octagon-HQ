import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import * as cheerio from "npm:cheerio@1.0.0";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";
import { absoluteCbsSportsUfcEventUrl } from "./sourceUrls.ts";
import { sourceChanges } from "./cardChanges.ts";
import {
  parseCbsSportsEventPage,
  type CbsSportsCard,
  type CbsSportsEventCandidate,
  type ParsedCbsSportsBout as ParsedCardBout,
} from "./cbsSportsEventParser.ts";
import {
  resolveImportedCardScope,
  selectAndSequenceImportedBouts,
  type SequencedBoutMetadata,
} from "./importPolicy.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};

const CBS_UFC_SCHEDULE_URL = "https://www.cbssports.com/ufc/schedule/";
const MAX_CBS_EVENT_PAGE_ATTEMPTS = 6;
const requestHeaders = {
  "User-Agent": "OctagonHQ/2.0 (+https://octagon.hq-app.workers.dev)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

type CardScope = "auto" | "main" | "full";
type EffectiveScope = "main" | "full";
type ErrorStage = "authentication" | "cbs-index-fetch" | "cbs-fetch" | "cbs-parse" | "preview-build" | "database-read" | "database-write";

class SyncError extends Error {
  constructor(readonly code: string, message: string, readonly stage: ErrorStage, readonly safeDetails: Record<string, unknown> = {}) { super(message); }
}

function errorJson(error: unknown, requestId: string, fallbackStage: ErrorStage, status = 502) {
  const known = error instanceof SyncError;
  return json({
    code: known ? error.code : "SYNC_UNEXPECTED_ERROR",
    message: known ? error.message : "The next UFC event could not be previewed safely.",
    requestId,
    stage: known ? error.stage : fallbackStage,
    safeDetails: known ? error.safeDetails : {
      errorType: error instanceof Error ? error.name : typeof error,
    },
    deployment_sha: DEPLOYED_SOURCE_SHA,
  }, status);
}

interface StagedBout {
  bout_id: string;
  position: number;
  weight_class: string;
  red_fighter_slug: string;
  red_fighter_name: string;
  blue_fighter_slug: string;
  blue_fighter_name: string;
  card_segment: "prelim" | "main";
  segment_sequence: number;
  included: boolean;
}

interface ParsedEvent {
  source: string;
  source_event_key: string;
  source_url: string;
  event_id: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  starts_at: string;
  prelims_starts_at: string;
  locks_at: string;
  season: number;
  bouts: StagedBout[];
  warnings: string[];
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA,
    },
  });
}

function clean(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function resolveCardScope(name: string, subtitle: string, requested: CardScope): EffectiveScope {
  return resolveImportedCardScope(name, subtitle, requested);
}

function selectBouts(card: CbsSportsCard, scope: EffectiveScope) {
  return selectAndSequenceImportedBouts(card.bouts, scope);
}

function toStagedBouts(bouts: Array<ParsedCardBout & SequencedBoutMetadata>) {
  return bouts.map((bout, index): StagedBout => {
    const redSlug = slugify(bout.red_fighter_name);
    const blueSlug = slugify(bout.blue_fighter_name);
    return {
      bout_id: `${bout.section}-${redSlug}-${blueSlug}`,
      position: index + 1,
      weight_class: bout.weight_class,
      red_fighter_slug: redSlug,
      red_fighter_name: bout.red_fighter_name,
      blue_fighter_slug: blueSlug,
      blue_fighter_name: bout.blue_fighter_name,
      card_segment: bout.card_segment,
      segment_sequence: bout.segment_sequence,
      included: true,
    };
  });
}

async function fetchText(url: string, stage: "cbs-index-fetch" | "cbs-fetch") {
  let response: Response;
  try { response = await fetch(url, { headers: requestHeaders, redirect: "follow", signal: AbortSignal.timeout(8000) }); }
  catch { throw new SyncError("UPSTREAM_TIMEOUT", "CBS Sports did not respond within 8 seconds.", stage, { source: "CBS Sports" }); }
  if (!response.ok) throw new SyncError("UPSTREAM_HTTP_ERROR", `CBS Sports returned HTTP ${response.status}.`, stage, { source: "CBS Sports", status: response.status });
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > 2_000_000) throw new SyncError("UPSTREAM_RESPONSE_TOO_LARGE", "CBS Sports response exceeded the 2 MB safety limit.", stage, { source: "CBS Sports" });
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > 2_000_000) throw new SyncError("UPSTREAM_RESPONSE_TOO_LARGE", "CBS Sports response exceeded the 2 MB safety limit.", stage, { source: "CBS Sports" });
  return text;
}

function parseCbsEventCandidate(html: string, sourceUrl: string, sourceEventKeyOverride = ""): CbsSportsEventCandidate {
  try {
    return parseCbsSportsEventPage(html, sourceUrl, sourceEventKeyOverride);
  } catch (error) {
    throw new SyncError(
      "CBS_EVENT_REJECTED",
      error instanceof Error ? error.message : "CBS Sports event data could not be parsed safely.",
      "cbs-parse",
      { sourceUrl },
    );
  }
}

async function fetchExactCbsEvent(requestedUrl: string, sourceEventKeyOverride: string) {
  const sourceUrl = absoluteCbsSportsUfcEventUrl(requestedUrl);
  if (!sourceUrl) {
    throw new SyncError(
      "CBS_SOURCE_REJECTED",
      "The supplied source must be a specific CBS Sports UFC event URL.",
      "cbs-fetch",
      { reason: "invalid-event-url" },
    );
  }
  return parseCbsEventCandidate(
    await fetchText(sourceUrl, "cbs-fetch"),
    sourceUrl,
    sourceEventKeyOverride,
  );
}

async function discoverCbsEvent(now: Date, sourceEventKeyOverride: string) {
  const scheduleHtml = await fetchText(CBS_UFC_SCHEDULE_URL, "cbs-index-fetch");
  const $ = cheerio.load(scheduleHtml);
  const candidates = new Map<string, { url: string; order: number }>();
  let order = 0;

  $("a[href]").each((_, element) => {
    const url = absoluteCbsSportsUfcEventUrl($(element).attr("href") ?? "");
    if (!url) return;
    const context = clean(`${$(element).text()} ${$(element).parent().text()}`);
    if (!/\bufc\b/i.test(context) || /\b(?:DWCS|Road\s+To\s+UFC)\b/i.test(context)) return;
    if (!candidates.has(url)) candidates.set(url, { url, order: order++ });
  });

  const discovered = [...candidates.values()].slice(0, MAX_CBS_EVENT_PAGE_ATTEMPTS);
  if (!discovered.length) {
    throw new SyncError(
      "CBS_DISCOVERY_EMPTY",
      "CBS Sports did not return upcoming UFC event candidates.",
      "cbs-index-fetch",
      { reason: "no-event-links" },
    );
  }

  const parsed: Array<{ candidate: CbsSportsEventCandidate; order: number }> = [];
  let fetched = 0;
  for (const candidate of discovered) {
    try {
      const html = await fetchText(candidate.url, "cbs-fetch");
      fetched += 1;
      const event = parseCbsEventCandidate(html, candidate.url, sourceEventKeyOverride);
      if (Date.parse(event.metadata.starts_at) >= now.getTime() - 6 * 60 * 60 * 1000) {
        parsed.push({ candidate: event, order: candidate.order });
      }
    } catch {
      // A malformed or unavailable event cannot block the remaining bounded CBS candidates.
    }
  }

  if (!fetched) {
    throw new SyncError(
      "CBS_FETCH_EMPTY",
      "CBS Sports UFC event candidates could not be fetched safely.",
      "cbs-fetch",
      { reason: "no-candidate-fetched" },
    );
  }
  if (!parsed.length) {
    throw new SyncError(
      "CBS_DISCOVERY_REJECTED",
      "CBS Sports did not return a safely parsed current or upcoming UFC fight card.",
      "cbs-parse",
      { reason: "no-current-or-upcoming-card" },
    );
  }

  parsed.sort((left, right) => (
    Date.parse(left.candidate.metadata.starts_at) - Date.parse(right.candidate.metadata.starts_at)
    || right.candidate.card.bouts.length - left.candidate.card.bouts.length
    || left.order - right.order
  ));
  return parsed[0]!.candidate;
}

async function findCbsEvent(now: Date, preferredSourceUrl: string, sourceEventKeyOverride: string) {
  if (preferredSourceUrl) return fetchExactCbsEvent(preferredSourceUrl, sourceEventKeyOverride);
  try {
    return await discoverCbsEvent(now, sourceEventKeyOverride);
  } catch (error) {
    if (error instanceof SyncError) throw error;
    throw new SyncError(
      "CBS_DISCOVERY_FAILED",
      "Automatic CBS Sports UFC event discovery failed safely.",
      "cbs-fetch",
      { reason: "unexpected-discovery-failure" },
    );
  }
}

async function buildNextEvent(
  now: Date,
  requestedScope: CardScope,
  preferredSourceUrl: string,
  sourceEventKeyOverride: string,
) {
  const { card, metadata } = await findCbsEvent(now, preferredSourceUrl, sourceEventKeyOverride);
  const effectiveScope = resolveCardScope(metadata.name, metadata.subtitle, requestedScope);
  const selected = selectBouts(card, effectiveScope);
  if (!selected.length) {
    throw new SyncError(
      "CBS_CARD_REJECTED",
      "The CBS Sports event did not contain fights for the selected card scope.",
      "cbs-parse",
      { reason: "selected-scope-empty", effectiveScope },
    );
  }

  const bouts = toStagedBouts(selected);
  const warnings = [
    !metadata.venue ? "MISSING VENUE" : "",
    !metadata.location ? "MISSING LOCATION" : "",
    !card.usedSectionHeadings ? "CBS SPORTS CARD SECTIONS NEED REVIEW" : "",
    effectiveScope === "main" && bouts.length < 4 ? "FEWER THAN FOUR MAIN-CARD FIGHTS FOUND" : "",
    effectiveScope === "full" && bouts.length < 8 ? "FULL CARD HAS FEWER THAN EIGHT FIGHTS" : "",
    bouts.some((bout) => !bout.weight_class) ? "ONE OR MORE WEIGHT CLASSES NEED REVIEW" : "",
  ].filter(Boolean);

  const event: ParsedEvent = {
    source: "CBS Sports UFC event + card",
    source_event_key: metadata.source_event_key,
    source_url: card.sourceUrl,
    event_id: metadata.event_id,
    name: metadata.name,
    subtitle: metadata.subtitle,
    venue: metadata.venue,
    location: metadata.location,
    starts_at: metadata.starts_at,
    prelims_starts_at: metadata.prelims_starts_at,
    locks_at: metadata.locks_at,
    season: metadata.season,
    bouts,
    warnings,
  };
  return { event, effectiveScope };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function persistedSourceUrl(currentValue: unknown) {
  const current = asRecord(currentValue);
  return typeof current?.source_url === "string" ? current.source_url.trim() : "";
}

function persistedSourceEventKey(currentValue: unknown) {
  const current = asRecord(currentValue);
  return typeof current?.source_event_key === "string" ? current.source_event_key.trim() : "";
}

async function sourceHash(event: ParsedEvent, effectiveScope: EffectiveScope) {
  const canonical = JSON.stringify({
    effectiveScope,
    event: {
      source_event_key: event.source_event_key,
      source_url: event.source_url,
      event_id: event.event_id,
      name: event.name,
      subtitle: event.subtitle,
      venue: event.venue,
      location: event.location,
      starts_at: event.starts_at,
      prelims_starts_at: event.prelims_starts_at,
      locks_at: event.locks_at,
      bouts: event.bouts,
    },
  });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return errorJson(new SyncError("METHOD_NOT_ALLOWED", "Method not allowed.", "authentication"), requestId, "authentication", 405);

  let input: Record<string, unknown> = {};
  try {
    input = asRecord(await request.json()) ?? {};
  } catch {
    input = {};
  }
  if (input.mode === "deployment-info") {
    return json({ deployment_sha: DEPLOYED_SOURCE_SHA });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!supabaseUrl || !anonKey || !secretKey) return errorJson(new SyncError("SYNC_NOT_CONFIGURED", "Event sync is not configured.", "authentication"), requestId, "authentication", 503);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const internalMonitoring = input.mode === "monitoring-preview" && request.headers.get("apikey") === secretKey;
  let ownerProbe: { data: unknown; error: { message: string } | null };
  if (internalMonitoring) {
    const monitoringState = await admin.rpc("get_pick_monitoring_event_state");
    const state = asRecord(monitoringState.data);
    ownerProbe = { data: state?.staged ?? null, error: monitoringState.error };
  } else {
    if (!token) return errorJson(new SyncError("SYNC_NOT_CONFIGURED", "Event sync is not configured.", "authentication"), requestId, "authentication", 503);
    const user = await admin.auth.getUser(token);
    if (user.error || !user.data.user) return errorJson(new SyncError("OWNER_AUTH_REQUIRED", "Owner sign-in required.", "authentication"), requestId, "authentication", 401);

    const ownerClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const ownerResult = await ownerClient.rpc("get_pick_event_setup");
    ownerProbe = { data: ownerResult.data, error: ownerResult.error };
  }
  if (ownerProbe.error) {
    const denied = ownerProbe.error.message.toLowerCase().includes("pick control owner required");
    return errorJson(new SyncError(denied ? "OWNER_ACCESS_REQUIRED" : "DATABASE_READ_FAILED", denied ? "Fight Night owner access required." : "Event Setup is unavailable.", denied ? "authentication" : "database-read"), requestId, "database-read", denied ? 403 : 503);
  }

  const mode = internalMonitoring || input.mode === "preview" ? "preview" : "apply";
  const requestedScope: CardScope = input.card_scope === "main" || input.card_scope === "full" ? input.card_scope : "auto";
  const expectedHash = typeof input.expected_hash === "string" ? input.expected_hash : "";
  const suppliedSourceUrl = typeof input.source_url === "string" ? input.source_url.trim() : "";
  const savedSourceUrl = persistedSourceUrl(ownerProbe.data);
  const suppliedCbsSourceUrl = absoluteCbsSportsUfcEventUrl(suppliedSourceUrl);
  const savedCbsSourceUrl = absoluteCbsSportsUfcEventUrl(savedSourceUrl);
  const suppliedMatchesSaved = Boolean(suppliedSourceUrl && savedSourceUrl && suppliedSourceUrl === savedSourceUrl);
  const invalidExplicitSource = Boolean(
    suppliedSourceUrl
    && !suppliedCbsSourceUrl
    && !suppliedMatchesSaved
    && !internalMonitoring,
  );
  const preferredSourceUrl = suppliedCbsSourceUrl || (!suppliedSourceUrl || suppliedMatchesSaved ? savedCbsSourceUrl : "");
  const internalSourceEventKey = internalMonitoring && typeof input.source_event_key === "string"
    ? input.source_event_key.trim()
    : "";
  const sourceEventKeyOverride = internalSourceEventKey
    || ((!suppliedSourceUrl || suppliedMatchesSaved) ? persistedSourceEventKey(ownerProbe.data) : "");

  try {
    if (invalidExplicitSource) {
      throw new SyncError(
        "CBS_SOURCE_REJECTED",
        "The supplied source must be a specific CBS Sports UFC event URL.",
        "cbs-fetch",
        { reason: "invalid-event-url" },
      );
    }
    const { event, effectiveScope } = await buildNextEvent(
      new Date(),
      requestedScope,
      preferredSourceUrl,
      sourceEventKeyOverride,
    );
    const hash = await sourceHash(event, effectiveScope);
    const changes = sourceChanges(ownerProbe.data, event, effectiveScope);

    if (mode === "preview") {
      return json({
        source_hash: hash,
        requested_scope: requestedScope,
        effective_scope: effectiveScope,
        source: event.source,
        source_url: event.source_url,
        fight_count: event.bouts.length,
        changes,
        warnings: event.warnings,
        event_preview: event,
        deployment_sha: DEPLOYED_SOURCE_SHA,
      });
    }

    if (expectedHash && expectedHash !== hash) {
      return errorJson(new SyncError("SOURCE_HASH_CHANGED", "The source card changed after review. Check for card updates again before applying it.", "database-write"), requestId, "database-write", 409);
    }
    const staged = await admin.rpc("stage_pick_event_draft", { p_payload: event });
    if (staged.error) throw staged.error;
    return json({
      draftId: staged.data,
      source_hash: hash,
      effective_scope: effectiveScope,
      warnings: event.warnings,
      deployment_sha: DEPLOYED_SOURCE_SHA,
    });
  } catch (error) {
    return errorJson(error, requestId, mode === "preview" ? "preview-build" : "database-write");
  }
});
