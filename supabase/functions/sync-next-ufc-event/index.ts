import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import * as cheerio from "npm:cheerio@1.0.0";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";
import { absoluteMmaManiaArticleUrl } from "./sourceUrls.ts";
import { sourceChanges } from "./cardChanges.ts";
import { canonicalFightPair, canonicalFighterDisplay } from "./normalization.ts";
import { parseMmaManiaEventMetadata, type MmaManiaEventMetadata } from "./mmaManiaEventMetadata.ts";
import {
  resolveImportedCardScope,
  isMmaManiaFightListRow,
  selectAndSequenceImportedBouts,
  type SequencedBoutMetadata,
} from "./importPolicy.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};

const MMA_MANIA_INDEX_URL = "https://www.mmamania.com/ufc-fight-cards";
const MAX_MMA_MANIA_ARTICLE_ATTEMPTS = 6;
const requestHeaders = {
  "User-Agent": "OctagonHQ/2.0 (+https://octagon.hq-app.workers.dev)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

type CardScope = "auto" | "main" | "full";
type EffectiveScope = "main" | "full";
type CardSection = "main-event" | "main" | "prelim" | "early-prelim";
type ErrorStage = "authentication" | "mma-index-fetch" | "mma-fetch" | "mma-parse" | "preview-build" | "database-read" | "database-write";

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

interface ParsedCardBout {
  section: CardSection;
  weight_class: string;
  red_fighter_name: string;
  blue_fighter_name: string;
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

interface MmaManiaCard {
  sourceUrl: string;
  bouts: ParsedCardBout[];
  usedSectionHeadings: boolean;
}

interface MmaManiaEventCandidate {
  card: MmaManiaCard;
  metadata: MmaManiaEventMetadata;
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

function classifySection(value: string): CardSection | null {
  const heading = clean(value).toLowerCase();
  if (/early\s+prelim/.test(heading)) return "early-prelim";
  if (/prelim/.test(heading)) return "prelim";
  if (/main\s+event/.test(heading)) return "main-event";
  if (/main\s+card/.test(heading)) return "main";
  return null;
}

function weightClassFromPounds(value: number | null) {
  if (value === null) return "";
  const classes: Record<number, string> = {
    115: "Strawweight", 125: "Flyweight", 135: "Bantamweight", 145: "Featherweight",
    155: "Lightweight", 170: "Welterweight", 185: "Middleweight",
    205: "Light Heavyweight", 265: "Heavyweight",
  };
  return classes[value] ?? (value ? `${value} lb. Catchweight` : "");
}

function cleanFighterName(value: string) {
  return canonicalFighterDisplay(
    clean(value)
      .replace(/^#?\d+\s+/, "")
      .replace(/\s+(?:[-–—|]\s*)?(?:odds|prediction|preview|live stream)\b.*$/i, "")
      .replace(/\s*\([^)]*(?:cancelled|canceled|scrapped|replacement|odds)[^)]*\)\s*$/i, ""),
  );
}

function parseFightLine(value: string, section: CardSection): ParsedCardBout | null {
  const line = clean(value);
  if (!isMmaManiaFightListRow(line) || /cancelled|canceled|scrapped|postponed/i.test(line)) return null;
  const marker = line.match(/\s+(?:vs\.?|v\.)\s+/i);
  if (!marker || marker.index === undefined) return null;

  let left = line.slice(0, marker.index).trim();
  let right = line.slice(marker.index + marker[0].length).trim();
  const weightMatch = left.match(/^(\d{3})\s*(?:lbs?\.?|pounds?)\s*:\s*/i);
  const pounds = weightMatch ? Number(weightMatch[1]) : null;
  if (weightMatch) left = left.slice(weightMatch[0].length);
  right = right.split(/\s+[–—|]\s+/)[0] ?? right;

  const redName = cleanFighterName(left);
  const blueName = cleanFighterName(right);
  if (redName.length < 2 || blueName.length < 2 || redName.length > 70 || blueName.length > 70) return null;
  if (!/[a-z]/i.test(redName) || !/[a-z]/i.test(blueName)) return null;

  return {
    section,
    weight_class: weightClassFromPounds(pounds),
    red_fighter_name: redName,
    blue_fighter_name: blueName,
  };
}

function elementLines($: cheerio.CheerioAPI, element: cheerio.Element) {
  const clone = $(element).clone();
  clone.find("br").replaceWith("\n");
  return clone.text().split(/\n+/).map(clean).filter(Boolean);
}

function mmaManiaArticleRoot($: cheerio.CheerioAPI) {
  const article = $("article").first();
  if (article.length) return article;
  const content = $(".c-entry-content, .article-body, main").first();
  return content.length ? content : $("body");
}

function parseMmaManiaCardDocument($: cheerio.CheerioAPI, sourceUrl: string): MmaManiaCard {
  const scope = mmaManiaArticleRoot($);
  const bouts: ParsedCardBout[] = [];
  const seen = new Set<string>();
  let section: CardSection | null = null;
  let usedSectionHeadings = false;

  scope.find("h1,h2,h3,h4,h5,h6,p,li,td").each((_, element) => {
    const tag = element.tagName?.toLowerCase();
    const headingSection = classifySection($(element).text());
    const semanticHeading = /^h[1-6]$/.test(tag ?? "")
      || (!/\s(?:vs\.?|v\.?|versus)\s/i.test($(element).text()) && clean($(element).text()).length < 60 && Boolean($(element).find("strong,b").length));
    if (semanticHeading) {
      const nextSection = headingSection;
      if (nextSection) {
        section = nextSection;
        usedSectionHeadings = true;
      }
      return;
    }
    if (!section || $(element).parents("p,li").length || $(element).find("s,del").length) return;

    for (const line of elementLines($, element)) {
      const parsed = parseFightLine(line, section);
      if (!parsed) continue;
      const pairKey = canonicalFightPair(parsed.red_fighter_name, parsed.blue_fighter_name);
      if (seen.has(pairKey)) continue;
      seen.add(pairKey);
      bouts.push(parsed);
    }
  });

  return { sourceUrl, bouts, usedSectionHeadings };
}

export function parseMmaManiaCard(html: string, sourceUrl: string): MmaManiaCard {
  return parseMmaManiaCardDocument(cheerio.load(html), sourceUrl);
}

export function resolveCardScope(name: string, subtitle: string, requested: CardScope): EffectiveScope {
  return resolveImportedCardScope(name, subtitle, requested);
}

function selectBouts(card: MmaManiaCard, scope: EffectiveScope) {
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

function articleText($: cheerio.CheerioAPI) {
  return clean(mmaManiaArticleRoot($).text()).slice(0, 50_000);
}

async function fetchText(url: string, stage: "mma-index-fetch" | "mma-fetch") {
  let response: Response;
  try { response = await fetch(url, { headers: requestHeaders, redirect: "follow", signal: AbortSignal.timeout(8000) }); }
  catch { throw new SyncError("UPSTREAM_TIMEOUT", "MMA Mania did not respond within 8 seconds.", stage, { source: "MMA Mania" }); }
  if (!response.ok) throw new SyncError("UPSTREAM_HTTP_ERROR", `MMA Mania returned HTTP ${response.status}.`, stage, { source: "MMA Mania", status: response.status });
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > 2_000_000) throw new SyncError("UPSTREAM_RESPONSE_TOO_LARGE", "MMA Mania response exceeded the 2 MB safety limit.", stage, { source: "MMA Mania" });
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > 2_000_000) throw new SyncError("UPSTREAM_RESPONSE_TOO_LARGE", "MMA Mania response exceeded the 2 MB safety limit.", stage, { source: "MMA Mania" });
  return text;
}

function parseMmaManiaEventCandidate(html: string, sourceUrl: string, sourceEventKeyOverride = ""): MmaManiaEventCandidate {
  const $ = cheerio.load(html);
  const card = parseMmaManiaCardDocument($, sourceUrl);
  if (!card.usedSectionHeadings || card.bouts.length < 4 || card.bouts.length > 20) {
    throw new SyncError(
      "ARTICLE_CARD_REJECTED",
      "The MMA Mania article did not contain a plausible sectioned UFC fight card.",
      "mma-parse",
      { sourceUrl, boutCount: card.bouts.length, usedSectionHeadings: card.usedSectionHeadings },
    );
  }
  const mainEvent = card.bouts.find((bout) => bout.section === "main-event") ?? card.bouts[0];
  if (!mainEvent) {
    throw new SyncError("ARTICLE_CARD_REJECTED", "The MMA Mania article did not contain a main event.", "mma-parse", { sourceUrl });
  }
  try {
    return {
      card,
      metadata: parseMmaManiaEventMetadata({
        sourceUrl,
        articleText: articleText($),
        mainEvent,
        ...(sourceEventKeyOverride ? { sourceEventKeyOverride } : {}),
      }),
    };
  } catch (error) {
    throw new SyncError(
      "ARTICLE_METADATA_REJECTED",
      error instanceof Error ? error.message : "MMA Mania event metadata could not be parsed safely.",
      "mma-parse",
      { sourceUrl },
    );
  }
}

async function fetchExactMmaManiaEvent(requestedUrl: string, sourceEventKeyOverride: string) {
  const sourceUrl = absoluteMmaManiaArticleUrl(requestedUrl);
  if (!sourceUrl) {
    throw new SyncError(
      "ARTICLE_SOURCE_REJECTED",
      "The supplied source must be a specific MMA Mania fight-card article URL.",
      "mma-fetch",
      { reason: "invalid-article-url" },
    );
  }
  return parseMmaManiaEventCandidate(
    await fetchText(sourceUrl, "mma-fetch"),
    sourceUrl,
    sourceEventKeyOverride,
  );
}

async function discoverMmaManiaEvent(now: Date) {
  const indexHtml = await fetchText(MMA_MANIA_INDEX_URL, "mma-index-fetch");
  const $ = cheerio.load(indexHtml);
  const candidates = new Map<string, { url: string; order: number }>();
  let order = 0;

  $("a[href]").each((_, element) => {
    const url = absoluteMmaManiaArticleUrl($(element).attr("href") ?? "");
    if (!url) return;
    const context = clean(`${$(element).text()} ${$(element).parent().text()} ${url}`);
    if (!/\bufc\b/i.test(context) || !/(?:fight\s*card|fight\s*night|up\s+next|ufc\s+\d{3,4})/i.test(context)) return;
    if (!candidates.has(url)) candidates.set(url, { url, order: order++ });
  });

  const discovered = [...candidates.values()].slice(0, MAX_MMA_MANIA_ARTICLE_ATTEMPTS);
  if (!discovered.length) {
    throw new SyncError(
      "ARTICLE_DISCOVERY_EMPTY",
      "MMA Mania did not return UFC fight-card article candidates.",
      "mma-index-fetch",
      { reason: "no-article-links" },
    );
  }

  const parsed: Array<{ candidate: MmaManiaEventCandidate; order: number }> = [];
  let fetched = 0;
  for (const candidate of discovered) {
    try {
      const html = await fetchText(candidate.url, "mma-fetch");
      fetched += 1;
      const event = parseMmaManiaEventCandidate(html, candidate.url);
      if (Date.parse(event.metadata.starts_at) >= now.getTime() - 6 * 60 * 60 * 1000) {
        parsed.push({ candidate: event, order: candidate.order });
      }
    } catch {
      // A malformed or unavailable candidate cannot block the remaining bounded MMA Mania candidates.
    }
  }

  if (!fetched) {
    throw new SyncError(
      "ARTICLE_FETCH_EMPTY",
      "MMA Mania article candidates could not be fetched safely.",
      "mma-fetch",
      { reason: "no-candidate-fetched" },
    );
  }
  if (!parsed.length) {
    throw new SyncError(
      "ARTICLE_DISCOVERY_REJECTED",
      "MMA Mania did not return a safely parsed current or upcoming UFC fight card.",
      "mma-parse",
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

async function findMmaManiaEvent(now: Date, preferredSourceUrl: string, sourceEventKeyOverride: string) {
  if (preferredSourceUrl) return fetchExactMmaManiaEvent(preferredSourceUrl, sourceEventKeyOverride);
  try {
    return await discoverMmaManiaEvent(now);
  } catch (error) {
    if (error instanceof SyncError) throw error;
    throw new SyncError(
      "ARTICLE_DISCOVERY_FAILED",
      "Automatic MMA Mania article discovery failed safely.",
      "mma-fetch",
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
  const { card, metadata } = await findMmaManiaEvent(now, preferredSourceUrl, sourceEventKeyOverride);
  const effectiveScope = resolveCardScope(metadata.name, metadata.subtitle, requestedScope);
  const selected = selectBouts(card, effectiveScope);
  if (!selected.length) {
    throw new SyncError(
      "ARTICLE_CARD_REJECTED",
      "The MMA Mania article did not contain fights for the selected card scope.",
      "mma-parse",
      { reason: "selected-scope-empty", effectiveScope },
    );
  }

  const bouts = toStagedBouts(selected);
  const warnings = [
    !metadata.venue ? "MISSING VENUE" : "",
    !metadata.location ? "MISSING LOCATION" : "",
    !card.usedSectionHeadings ? "MMA MANIA CARD SECTIONS NEED REVIEW" : "",
    effectiveScope === "main" && bouts.length < 4 ? "FEWER THAN FOUR MAIN-CARD FIGHTS FOUND" : "",
    effectiveScope === "full" && bouts.length < 8 ? "FULL CARD HAS FEWER THAN EIGHT FIGHTS" : "",
    bouts.some((bout) => !bout.weight_class) ? "ONE OR MORE WEIGHT CLASSES NEED REVIEW" : "",
  ].filter(Boolean);

  const event: ParsedEvent = {
    source: "MMA Mania event + card",
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
  const preferredSourceUrl = suppliedSourceUrl || savedSourceUrl;
  const internalSourceEventKey = internalMonitoring && typeof input.source_event_key === "string"
    ? input.source_event_key.trim()
    : "";
  const reuseSavedSource = Boolean(savedSourceUrl && preferredSourceUrl === savedSourceUrl);
  const sourceEventKeyOverride = internalSourceEventKey
    || (reuseSavedSource ? persistedSourceEventKey(ownerProbe.data) : "");

  try {
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
