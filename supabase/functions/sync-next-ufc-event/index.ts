import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import * as cheerio from "npm:cheerio@1.0.0";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";
import { absoluteMmaManiaArticleUrl } from "./sourceUrls.ts";
import { chooseEventArticle, matchEventIdentity, rankDiscoveryCandidates, type ArticleIdentity } from "./eventIdentity.ts";
import { matchSourceIdentity, type NormalizedUfcEvent } from "./identityEngine.ts";
import { sourceChanges } from "./cardChanges.ts";
import { canonicalFightPair, canonicalFighterDisplay, fighterMatch } from "./normalization.ts";
import { adaptMmaManiaSource, adaptUfcSource, canonicalUfcEventFields } from "./sourceAdapters.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};

const UFC_EVENT_INDEX_URL = "https://www.ufc.com/events?language_content_entity=en";
const MMA_MANIA_INDEX_URL = "https://www.mmamania.com/ufc-fight-cards";
const requestHeaders = {
  "User-Agent": "OctagonHQ/2.0 (+https://octagon.hq-app.workers.dev)",
  Accept: "text/html,application/xhtml+xml",
};
const monthNumbers: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

type CardScope = "auto" | "main" | "full";
type EffectiveScope = "main" | "full";
type CardSection = "main-event" | "main" | "prelim" | "early-prelim";
type ErrorStage = "authentication" | "ufc-index-fetch" | "ufc-event-fetch" | "ufc-parse" | "mma-fetch" | "mma-parse" | "identity-match" | "preview-build" | "database-read" | "database-write";

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
    safeDetails: known ? error.safeDetails : {},
    deployment_sha: DEPLOYED_SOURCE_SHA,
  }, status);
}

interface UfcEventMetadata {
  source_event_key: string;
  ufc_source_url: string;
  event_id: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  starts_at: string;
  locks_at: string;
  season: number;
  normalized: NormalizedUfcEvent;
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

function absoluteUfcEventUrl(value: string) {
  try {
    const url = new URL(value, "https://www.ufc.com");
    return url.hostname.endsWith("ufc.com") && url.pathname.startsWith("/event/")
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function timezoneOffset(zone: string) {
  const offsets: Record<string, string> = {
    EDT: "-04:00", EST: "-05:00", CDT: "-05:00", CST: "-06:00",
    MDT: "-06:00", MST: "-07:00", PDT: "-07:00", PST: "-08:00",
    GMT: "+00:00", UTC: "+00:00",
  };
  return offsets[zone.toUpperCase()] ?? "";
}

function visibleDate(month: string, day: string, hour: number, minute: string, offset: string, year: number) {
  const monthNumber = monthNumbers[month];
  if (!monthNumber) return null;
  const parsed = new Date(`${year}-${monthNumber}-${day.padStart(2, "0")}T${String(hour).padStart(2, "0")}:${minute}:00${offset}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseVisibleEventTime(text: string, now: Date) {
  const match = text.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+([A-Z][a-z]{2})\s+(\d{1,2})\s*\/\s*(\d{1,2}):(\d{2})\s*([AP]M)\s+([A-Z]{2,4})\s*\/\s*Main Card/i);
  if (!match) return null;
  const [, month, dayValue, hourValue, minute, meridiem, zone] = match;
  let hour = Number(hourValue) % 12;
  if (meridiem.toUpperCase() === "PM") hour += 12;
  let year = now.getUTCFullYear();
  const offset = timezoneOffset(zone);
  if (!offset) return null;
  const candidate = visibleDate(month, dayValue, hour, minute, offset, year);
  if (!candidate) return null;
  if (candidate.getTime() < now.getTime() - 7 * 86400000) {
    year += 1;
    return visibleDate(month, dayValue, hour, minute, offset, year);
  }
  return candidate;
}

function eventTime($: cheerio.CheerioAPI, bodyText: string, now: Date) {
  const candidates = $("time[datetime]").map((_, element) => {
    const value = $(element).attr("datetime") ?? "";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }).get().filter((value): value is Date => Boolean(value));

  const future = candidates
    .filter((value) => value.getTime() >= now.getTime() - 6 * 3600000)
    .sort((left, right) => left.getTime() - right.getTime())[0];
  return future ?? parseVisibleEventTime(bodyText, now);
}

function headingText($: cheerio.CheerioAPI, selector: string) {
  return clean($(selector).map((_, element) => $(element).text()).get().find(Boolean) ?? "");
}

function extractMetadataLines($: cheerio.CheerioAPI) {
  const lines = $("body").text().split(/\n+/).map(clean).filter(Boolean);
  return lines.filter((line, index) => lines.indexOf(line) === index);
}

function extractVenueAndLocation($: cheerio.CheerioAPI, name: string, subtitle: string) {
  const explicitVenue = clean($("[class*='venue']").first().text()) || clean($("h5").first().text());
  const explicitLocation = clean($("[class*='location']").first().text());
  if (explicitVenue && explicitLocation && explicitVenue !== explicitLocation) {
    return { venue: explicitVenue, location: explicitLocation };
  }

  const lines = extractMetadataLines($);
  const dateIndex = lines.findIndex((line) => /Main Card/i.test(line) && /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),/.test(line));
  const candidates = (dateIndex >= 0 ? lines.slice(dateIndex + 1, dateIndex + 8) : lines).filter((line) => (
    line !== name
    && line !== subtitle
    && !/^(How to Watch|Tickets|Buy Tickets|VIP Experiences|Follow live|Start Times|Prelims|Main Card)$/i.test(line)
    && !/Watch On|Download|LIVE NOW|Round|Time|Method/i.test(line)
  ));
  return {
    venue: explicitVenue || candidates[0] || "",
    location: explicitLocation || candidates.slice(explicitVenue ? 0 : 1, explicitVenue ? 3 : 4).join(", "),
  };
}

export function parseUfcEventPage(html: string, sourceUrl: string, now = new Date()): UfcEventMetadata | null {
  const $ = cheerio.load(html);
  const bodyText = clean($("body").text());
  const startsAt = eventTime($, bodyText, now);
  if (!startsAt || startsAt.getTime() < now.getTime() - 6 * 3600000) return null;

  const name = headingText($, "h1") || "UFC Event";
  const versusHeadings = $("h1,h2,h3").map((_, element) => clean($(element).text())).get()
    .filter((value) => /\bvs\.?\b/i.test(value) && value !== name);
  const subtitle = versusHeadings[0] ?? "";
  const { venue, location } = extractVenueAndLocation($, name, subtitle);
  const sourceEventKey = new URL(sourceUrl).pathname.replace(/^\/+|\/+$/g, "");
  const season = startsAt.getUTCFullYear();

  const legacy = {
    source_event_key: sourceEventKey,
    ufc_source_url: sourceUrl,
    event_id: slugify(`${name}-${subtitle}-${season}-${startsAt.toISOString().slice(0, 10)}`),
    name,
    subtitle,
    venue,
    location,
    starts_at: startsAt.toISOString(),
    locks_at: startsAt.toISOString(),
    season,
  };
  const normalized = adaptUfcSource(html, sourceUrl, legacy);
  return {
    ...legacy,
    ...canonicalUfcEventFields(normalized),
    ufc_source_url: sourceUrl,
    normalized,
  };
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
  if (!line || line.length > 220 || /cancelled|canceled|scrapped|postponed/i.test(line)) return null;
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

export function parseMmaManiaCard(html: string, sourceUrl: string): MmaManiaCard {
  const $ = cheerio.load(html);
  const root = $("article").first().length
    ? $("article").first()
    : $(".c-entry-content, .article-body, main").first();
  const scope = root.length ? root : $("body");
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

export function resolveCardScope(name: string, subtitle: string, requested: CardScope): EffectiveScope {
  if (requested === "main" || requested === "full") return requested;
  return /\bUFC\s+\d{3,4}\b/i.test(`${name} ${subtitle}`) ? "full" : "main";
}

function selectBouts(card: MmaManiaCard, scope: EffectiveScope) {
  return card.bouts.filter((bout) => scope === "full" || bout.section === "main-event" || bout.section === "main");
}

function toStagedBouts(bouts: ParsedCardBout[]) {
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
      included: true,
    };
  });
}

function articleIdentity(html: string, url: string, card: MmaManiaCard): ArticleIdentity {
  const $ = cheerio.load(html);
  const title = clean($("meta[property='og:title']").attr("content") ?? $("title").text() ?? $("h1").first().text());
  const metadata = clean([
    $("meta[property='og:description']").attr("content"),
    $("meta[name='description']").attr("content"),
    $("meta[property='article:published_time']").attr("content"),
  ].filter(Boolean).join(" "));
  const root = $("article").first().length ? $("article").first() : $("main").first();
  const body = clean((root.length ? root : $("body")).text()).slice(0, 12000);
  const dateSentences = `${title}. ${metadata}. ${body.slice(0, 6000)}`.split(/(?<=[.!?])\s+/)
    .filter((sentence) => /\b(?:20\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(sentence)
      && /\b(?:event|card|ufc|takes? place|scheduled|saturday|sunday)\b/i.test(sentence))
    .slice(0, 8).join(" ");
  return {
    url,
    title,
    metadata,
    body,
    cardDateText: dateSentences,
    publishedAt: clean($("meta[property='article:published_time']").attr("content") ?? $("time[datetime]").first().attr("datetime") ?? ""),
    usedSectionHeadings: card.usedSectionHeadings,
    boutCount: card.bouts.length,
  };
}

function nameTokens(value: string) {
  return clean(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter((token) => token.length > 1);
}

function sameFighter(expected: string, actual: string) {
  const expectedTokens = nameTokens(expected);
  const actualTokens = new Set(nameTokens(actual));
  return expectedTokens.length > 0 && expectedTokens.every((token) => actualTokens.has(token));
}

function parsedMainEventMatches(metadata: UfcEventMetadata, card: MmaManiaCard) {
  const expected = metadata.subtitle.split(/\s+(?:vs\.?|versus|v\.?)\s+/i).map(clean).filter(Boolean);
  if (expected.length !== 2) return false;
  const mainEvent = card.bouts.find((bout) => bout.section === "main-event") ?? card.bouts[0];
  if (!mainEvent) return false;
  return (
    sameFighter(expected[0], mainEvent.red_fighter_name) && sameFighter(expected[1], mainEvent.blue_fighter_name)
  ) || (
    sameFighter(expected[0], mainEvent.blue_fighter_name) && sameFighter(expected[1], mainEvent.red_fighter_name)
  );
}

async function fetchText(url: string, sourceLabel: string) {
  const stage: ErrorStage = sourceLabel === "UFC.com" ? "ufc-event-fetch" : "mma-fetch";
  let response: Response;
  try { response = await fetch(url, { headers: requestHeaders, redirect: "follow", signal: AbortSignal.timeout(8000) }); }
  catch { throw new SyncError("UPSTREAM_TIMEOUT", `${sourceLabel} did not respond within 8 seconds.`, stage, { source: sourceLabel }); }
  if (!response.ok) throw new SyncError("UPSTREAM_HTTP_ERROR", `${sourceLabel} returned HTTP ${response.status}.`, stage, { source: sourceLabel, status: response.status });
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > 2_000_000) throw new SyncError("UPSTREAM_RESPONSE_TOO_LARGE", `${sourceLabel} response exceeded the 2 MB safety limit.`, stage, { source: sourceLabel });
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > 2_000_000) throw new SyncError("UPSTREAM_RESPONSE_TOO_LARGE", `${sourceLabel} response exceeded the 2 MB safety limit.`, stage, { source: sourceLabel });
  return text;
}

async function findNextUfcEvent(now: Date) {
  const indexHtml = await fetchText(UFC_EVENT_INDEX_URL, "UFC.com");
  const $ = cheerio.load(indexHtml);
  const urls = Array.from(new Set(
    $("a[href*='/event/']").map((_, element) => absoluteUfcEventUrl($(element).attr("href") ?? "")).get().filter(Boolean),
  )).slice(0, 12);
  if (!urls.length) throw new Error("UFC.com did not return any upcoming event links.");

  const parsed = (await Promise.all(urls.map(async (url) => {
    try {
      return parseUfcEventPage(await fetchText(url, "UFC.com"), url, now);
    } catch {
      return null;
    }
  }))).filter((value): value is UfcEventMetadata => Boolean(value));

  parsed.sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime());
  return parsed[0] ?? null;
}

async function fetchExactMmaManiaCard(metadata: UfcEventMetadata, requestedUrl: string) {
  const sourceUrl = absoluteMmaManiaArticleUrl(requestedUrl);
  if (!sourceUrl) {
    throw new Error("The supplied source must be a specific MMA Mania fight-card article URL, not the fight-card index or another website.");
  }
  const html = await fetchText(sourceUrl, "MMA Mania");
  const card = parseMmaManiaCard(html, sourceUrl);
  if (!card.usedSectionHeadings || card.bouts.length < 4 || card.bouts.length > 20) {
    throw new Error("The supplied MMA Mania article did not contain a plausible sectioned fight card.");
  }
  const article = adaptMmaManiaSource(html, sourceUrl, card.bouts, Array.from(new Set(card.bouts.map((bout) => bout.section))));
  const identity = matchSourceIdentity(metadata.normalized, article);
  if (!identity.accepted) {
    throw new SyncError("ARTICLE_IDENTITY_REJECTED", identity.reason, "identity-match", {
      confidence: identity.confidence, matchedSignals: identity.matchedSignals, conflicts: identity.conflicts,
      normalizedUfcEvent: identity.normalizedUfcEvent, normalizedArticleEvent: identity.normalizedArticleEvent,
    });
  }
  return card;
}

async function discoverMmaManiaCard(metadata: UfcEventMetadata) {
  const indexHtml = await fetchText(MMA_MANIA_INDEX_URL, "MMA Mania");
  const $ = cheerio.load(indexHtml);
  const candidates = new Map<string, { url: string; discoveryText: string; order: number }>();
  let order = 0;

  $("a[href]").each((_, element) => {
    const url = absoluteMmaManiaArticleUrl($(element).attr("href") ?? "");
    if (!url) return;
    const discoveryText = clean(`${$(element).text()} ${url}`);
    if (!/\bufc\b|fight[- ]card|fight[- ]night/i.test(discoveryText)) return;
    const previous = candidates.get(url);
    if (!previous || discoveryText.length > previous.discoveryText.length) {
      candidates.set(url, { url, discoveryText, order: previous?.order ?? order++ });
    }
  });

  const discovered = rankDiscoveryCandidates(metadata, Array.from(candidates.values()), 8);
  if (!discovered.length) throw new Error("Automatic MMA Mania discovery returned no UFC fight-card article links.");

  const evaluated: Array<{ card: MmaManiaCard; match: ReturnType<typeof matchEventIdentity> }> = [];
  let fetched = 0;
  let parsed = 0;
  for (const candidate of discovered) {
    try {
      const html = await fetchText(candidate.url, "MMA Mania");
      fetched += 1;
      const card = parseMmaManiaCard(html, candidate.url);
      if (card.usedSectionHeadings && card.bouts.length >= 4) parsed += 1;
      evaluated.push({ card, match: matchEventIdentity(metadata, articleIdentity(html, candidate.url, card)) });
    } catch {
      // A failed candidate fetch must not prevent evaluation of the remaining discovered articles.
    }
  }

  if (!fetched) throw new Error("Automatic MMA Mania discovery found article links, but none could be fetched.");
  if (!parsed) throw new Error("Automatic MMA Mania discovery did not find a plausible sectioned fight card.");
  const selected = chooseEventArticle(evaluated);
  if (!selected.candidate) throw new Error(selected.error);
  return selected.candidate.card;
}

async function findMmaManiaCard(metadata: UfcEventMetadata, preferredSourceUrl: string) {
  if (preferredSourceUrl) return fetchExactMmaManiaCard(metadata, preferredSourceUrl);
  try {
    return await discoverMmaManiaCard(metadata);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Automatic article discovery failed.";
    throw new Error(`${detail} Paste the exact MMA Mania fight-card article URL in Event Setup and try again. No UFC first-six fallback was used.`);
  }
}

async function buildNextEvent(now: Date, requestedScope: CardScope, preferredSourceUrl: string) {
  const metadata = await findNextUfcEvent(now);
  if (!metadata) throw new Error("No future UFC event metadata could be found.");
  const card = await findMmaManiaCard(metadata, preferredSourceUrl);
  const canonicalMetadata = canonicalUfcEventFields(metadata.normalized);
  const effectiveScope = resolveCardScope(canonicalMetadata.name, canonicalMetadata.subtitle, requestedScope);
  const selected = selectBouts(card, effectiveScope);
  if (!selected.length) throw new Error("The matched MMA Mania article did not contain fights for the selected card scope.");

  const bouts = toStagedBouts(selected);
  const cardHeadliners = [bouts[0]!.red_fighter_name, bouts[0]!.blue_fighter_name];
  const officialHeadliners = metadata.normalized.headliners;
  const cardMatchesOfficial = officialHeadliners.length === 2
    && officialHeadliners.every((name) => cardHeadliners.some((candidate) => fighterMatch(name, candidate, true)));
  const subtitle = cardMatchesOfficial
    ? `${cardHeadliners[0]} vs. ${cardHeadliners[1]}`
    : canonicalMetadata.subtitle;
  const warnings = [
    !canonicalMetadata.venue ? "MISSING VENUE" : "",
    !canonicalMetadata.location ? "MISSING LOCATION" : "",
    !card.usedSectionHeadings ? "MMA MANIA CARD SECTIONS NEED REVIEW" : "",
    effectiveScope === "main" && bouts.length < 4 ? "FEWER THAN FOUR MAIN-CARD FIGHTS FOUND" : "",
    effectiveScope === "full" && bouts.length < 8 ? "FULL CARD HAS FEWER THAN EIGHT FIGHTS" : "",
    bouts.some((bout) => !bout.weight_class) ? "ONE OR MORE WEIGHT CLASSES NEED REVIEW" : "",
  ].filter(Boolean);

  const event: ParsedEvent = {
    source: "UFC.com metadata + MMA Mania card",
    ...canonicalMetadata,
    source_url: card.sourceUrl,
    subtitle,
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
  if (!supabaseUrl || !anonKey || !secretKey || !token) return errorJson(new SyncError("SYNC_NOT_CONFIGURED", "Event sync is not configured.", "authentication"), requestId, "authentication", 503);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const user = await admin.auth.getUser(token);
  if (user.error || !user.data.user) return errorJson(new SyncError("OWNER_AUTH_REQUIRED", "Owner sign-in required.", "authentication"), requestId, "authentication", 401);

  const ownerClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const ownerProbe = await ownerClient.rpc("get_pick_event_setup");
  if (ownerProbe.error) {
    const denied = ownerProbe.error.message.toLowerCase().includes("pick control owner required");
    return errorJson(new SyncError(denied ? "OWNER_ACCESS_REQUIRED" : "DATABASE_READ_FAILED", denied ? "Fight Night owner access required." : "Event Setup is unavailable.", denied ? "authentication" : "database-read"), requestId, "database-read", denied ? 403 : 503);
  }

  const mode = input.mode === "preview" ? "preview" : "apply";
  const requestedScope: CardScope = input.card_scope === "main" || input.card_scope === "full" ? input.card_scope : "auto";
  const expectedHash = typeof input.expected_hash === "string" ? input.expected_hash : "";
  const suppliedSourceUrl = typeof input.source_url === "string" ? input.source_url.trim() : "";
  const preferredSourceUrl = suppliedSourceUrl || persistedSourceUrl(ownerProbe.data);

  try {
    const { event, effectiveScope } = await buildNextEvent(new Date(), requestedScope, preferredSourceUrl);
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
