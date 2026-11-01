import { parseUfcEventPage } from "../supabase/functions/sync-next-ufc-event/ufcEventParser.ts";
import { parseOfficialUfcSegmentTimes } from "../supabase/functions/sync-next-ufc-event/importPolicy.ts";
import { absoluteUfcEventUrl } from "../supabase/functions/sync-next-ufc-event/sourceUrls.ts";

/**
 * Public, read-only UFC Picks calendar. Discover the next numbered card from
 * UFC's official event listing without staging or publishing it.
 */
const INDEX_URL = "https://www.ufc.com/events?language_content_entity=en";
const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard";
const UFC_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.ufc.com/",
};
const MAX_CANDIDATES = 12;
const MAX_HTML_LENGTH = 3_000_000;

export interface NextNumberedUfcEvent {
  name: string;
  matchup: string;
  startsAt: string;
  venue: string;
  location: string;
  imageUrl: string | null;
}

function safeOfficialImageUrl(html: string) {
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of metas) {
    const property = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
    if (property.toLowerCase() !== "og:image") continue;
    const src = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, "&") ?? "";
    try {
      const url = new URL(src);
      if (url.protocol === "https:" && (
        url.hostname === "www.ufc.com"
        || url.hostname === "ufc.com"
        || url.hostname === "dmxg5wxfqgb4u.cloudfront.net"
      )) return url.toString();
    } catch { /* Invalid images fall back to the atmospheric card treatment. */ }
  }
  return null;
}

/**
 * The official calendar sometimes lists the next numbered event before four
 * matchups are booked. In that case retain only independently sourced event
 * timing and identity, without fabricating the main event.
 */
export function numberedEventScheduleFallback(html: string, url: string, now = new Date()): NextNumberedUfcEvent | null {
  const number = new URL(url).pathname.match(/^\/event\/ufc-(\d{3})(?:-|$)/)?.[1];
  if (!number) return null;
  const headline = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?? html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (!new RegExp("\\bUFC\\s*" + number + "\\b", "i").test(headline)) return null;

  const rawTimestamp = html.match(/\bdata-timestamp\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
  const parsedTimestamp = /^\d{9,14}$/.test(rawTimestamp)
    ? new Date(Number(rawTimestamp) * (rawTimestamp.length > 10 ? 1 : 1000))
    : new Date(rawTimestamp);
  if (!Number.isFinite(parsedTimestamp.getTime())) return null;

  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ");
  let startsAt = "";
  try {
    startsAt = parseOfficialUfcSegmentTimes(text, parsedTimestamp.toISOString(), false, now).mainCardStartsAt;
  } catch {
    return null;
  }
  const hero = html.match(/<[^>]*class\s*=\s*["'][^"']*c-hero__headline(?:\s|["'])[^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] ?? "";
  const matchup = hero.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const venue = html.match(/<[^>]*class\s*=\s*["'][^"']*field--name-venue(?:\s|["'])[^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1]
    ?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return {
    name: "UFC " + number,
    matchup: /\bvs\.?\b/i.test(matchup) ? matchup : "Main event to be announced",
    startsAt,
    venue,
    location: "",
    imageUrl: safeOfficialImageUrl(html),
  };
}

export function numberedUfcEventLinks(html: string) {
  // UFC event slugs contain their numbered designation; this excludes Fight
  // Nights, DWCS and Road to UFC without relying on surrounding marketing text.
  const links = new Set<string>();
  // Match the same upcoming-only scope used by the existing UFC sync owner.
  // Otherwise archived event links can exhaust our bounded candidate budget.
  const upcomingStart = html.search(/\bid\s*=\s*["']events-list-upcoming["']/i);
  const tail = upcomingStart >= 0 ? html.slice(upcomingStart) : html;
  const pastStart = tail.search(/\bid\s*=\s*["']events-list-(?:past|previous|results)["']/i);
  const listing = pastStart > 0 ? tail.slice(0, pastStart) : tail;
  const anchors = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchors.exec(listing)) !== null) {
    const url = absoluteUfcEventUrl(match[1]!.replace(/&amp;/g, "&"));
    if (!url) continue;
    if (!/^\/event\/ufc-\d{3}(?:-|$)/i.test(new URL(url).pathname)) continue;
    links.add(url);
  }
  return [...links].slice(0, MAX_CANDIDATES);
}

export function closestUpcomingNumberedEvent(
  candidates: NextNumberedUfcEvent[],
  now = new Date(),
): NextNumberedUfcEvent | null {
  return candidates
    .filter((event) => /^UFC \d{3}$/.test(event.name)
      && Number.isFinite(Date.parse(event.startsAt))
      && Date.parse(event.startsAt) > now.getTime())
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0] ?? null;
}

/**
 * ESPN's public UFC scoreboard exposes a compact season calendar including
 * future numbered events. UFC.com often blocks the events index from Workers,
 * even though a specific official event page is still accessible. Do not let
 * a blocked promotional index hide an already announced numbered card.
 *
 * Calendar startDate is the ESPN event window (not necessarily main-card time).
 * Prefer the UFC.com main-card time when the official event page parses.
 */
export function numberedEventsFromEspnCalendar(value: unknown): NextNumberedUfcEvent[] {
  if (!value || typeof value !== "object") return [];
  const leagues = (value as { leagues?: unknown }).leagues;
  if (!Array.isArray(leagues)) return [];
  const records: NextNumberedUfcEvent[] = [];
  for (const league of leagues) {
    if (!league || typeof league !== "object") continue;
    const calendar = (league as { calendar?: unknown }).calendar;
    if (!Array.isArray(calendar)) continue;
    for (const item of calendar) {
      if (!item || typeof item !== "object") continue;
      const row = item as { label?: unknown; startDate?: unknown };
      if (typeof row.label !== "string" || typeof row.startDate !== "string") continue;
      const label = row.label.replace(/\\s+/g, " ").trim();
      const match = /^UFC\\s+(\\d{3,4})(?:\\s*:\\s*(.+))?$/i.exec(label);
      if (!match || !Number.isFinite(Date.parse(row.startDate))) continue;
      const matchup = match[2]?.trim();
      records.push({
        name: "UFC " + match[1],
        matchup: matchup && /\\bvs\\.?\\b/i.test(matchup)
          ? matchup.replace(/\\s+vs\\.?\\s+/i, " vs. ")
          : "Main event to be announced",
        startsAt: new Date(row.startDate).toISOString(),
        venue: "",
        location: "",
        imageUrl: null,
      });
    }
  }
  return records;
}

async function espnCalendar(fetchImpl: typeof fetch) {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 8000);
  try {
    const response = await fetchImpl(ESPN_SCOREBOARD_URL, {
      headers: { Accept: "application/json", "User-Agent": "OctagonHQ/1.0" },
      signal: abort.signal,
    });
    if (!response.ok) throw new Error("ESPN UFC calendar unavailable.");
    const raw = await response.text();
    if (!raw || raw.length > MAX_HTML_LENGTH) throw new Error("ESPN UFC calendar invalid.");
    return numberedEventsFromEspnCalendar(JSON.parse(raw));
  } finally {
    clearTimeout(timeout);
  }
}

async function officialCardEnrichment(event: NextNumberedUfcEvent, fetchImpl: typeof fetch, now: Date) {
  const number = event.name.match(/^UFC (\\d{3,4})$/)?.[1];
  if (!number) return event;
  const url = absoluteUfcEventUrl("https://www.ufc.com/event/ufc-" + number);
  if (!url) return event;
  try {
    const html = await officialHtml(url, fetchImpl);
    try {
      const parsed = parseUfcEventPage(html, url, "", now);
      if (parsed.metadata.name !== event.name) return event;
      return {
        name: event.name,
        matchup: parsed.metadata.subtitle,
        startsAt: parsed.metadata.starts_at,
        venue: parsed.metadata.venue,
        location: parsed.metadata.location,
        imageUrl: safeOfficialImageUrl(html),
      } satisfies NextNumberedUfcEvent;
    } catch {
      const fallback = numberedEventScheduleFallback(html, url, now);
      return fallback?.name === event.name ? { ...event, ...fallback } : event;
    }
  } catch {
    // ESPN's verified future schedule is enough to show a countdown, even if
    // the UFC page is currently rate-limited or its card markup changes.
    return event;
  }
}

async function officialHtml(url: string, fetchImpl: typeof fetch) {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 9000);
  try {
    const response = await fetchImpl(url, { headers: UFC_HEADERS, signal: abort.signal });
    if (!response.ok) throw new Error("UFC source unavailable.");
    const html = await response.text();
    if (!html || html.length > MAX_HTML_LENGTH) throw new Error("UFC source content unavailable.");
    return html;
  } finally {
    clearTimeout(timeout);
  }
}

async function discoverViaUfcIndex(now: Date, fetchImpl: typeof fetch) {
  const index = await officialHtml(INDEX_URL, fetchImpl);
  const links = numberedUfcEventLinks(index);
  if (!links.length) throw new Error("UFC numbered-event discovery unavailable.");
  const candidates = await Promise.all(links.map(async (url) => {
    try {
      const html = await officialHtml(url, fetchImpl);
      try {
        const parsed = parseUfcEventPage(html, url, "", now);
        if (parsed.metadata.eventType !== "numbered") return null;
        return {
          name: parsed.metadata.name,
          matchup: parsed.metadata.subtitle,
          startsAt: parsed.metadata.starts_at,
          venue: parsed.metadata.venue,
          location: parsed.metadata.location,
          imageUrl: safeOfficialImageUrl(html),
        } satisfies NextNumberedUfcEvent;
      } catch {
        return numberedEventScheduleFallback(html, url, now);
      }
    } catch {
      return null;
    }
  }));
  return closestUpcomingNumberedEvent(
    candidates.filter((event): event is NextNumberedUfcEvent => event !== null),
    now,
  );
}

export async function discoverNextNumberedUfcEvent(now = new Date(), fetchImpl: typeof fetch = fetch) {
  try {
    const calendar = await espnCalendar(fetchImpl);
    const next = closestUpcomingNumberedEvent(calendar, now);
    if (next) return officialCardEnrichment(next, fetchImpl, now);
  } catch {
    // ESPN is a discovery fallback, not a publication dependency.
  }
  return discoverViaUfcIndex(now, fetchImpl);
}

function jsonResponse(body: object, status: number, maxAge: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": status === 200
        ? "public, max-age=" + maxAge + ", stale-while-revalidate=1800"
        : "no-store",
    },
  });
}

export async function serveNextNumberedUfcEvent(request: Request, context?: { waitUntil(promise: Promise<unknown>): void }) {
  const cache = (globalThis as unknown as { caches?: { default: Cache } }).caches?.default;
  const cached = cache ? await cache.match(request) : null;
  if (cached) return cached;
  try {
    const event = await discoverNextNumberedUfcEvent();
    const response = jsonResponse({ event }, 200, event ? 1800 : 300);
    if (cache && context) context.waitUntil(cache.put(request, response.clone()));
    return response;
  } catch {
    return jsonResponse({ event: null, error: "UFC calendar temporarily unavailable" }, 503, 0);
  }
}
