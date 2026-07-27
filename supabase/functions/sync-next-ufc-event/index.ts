import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import * as cheerio from "npm:cheerio@1.0.0";
import { absoluteMmaManiaArticleUrl } from "./sourceUrls.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clean(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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

  return {
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
  return clean(value)
    .replace(/^#?\d+\s+/, "")
    .replace(/\s+(?:[-–—|]\s*)?(?:odds|prediction|preview|live stream)\b.*$/i, "")
    .replace(/\s*\([^)]*(?:cancelled|canceled|scrapped|replacement|odds)[^)]*\)\s*$/i, "")
    .replace(/[.,;:]+$/, "")
    .trim();
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

  scope.find("h2,h3,h4,p,li").each((_, element) => {
    const tag = element.tagName?.toLowerCase();
    if (tag === "h2" || tag === "h3" || tag === "h4") {
      const nextSection = classifySection($(element).text());
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
      const pairKey = [slugify(parsed.red_fighter_name), slugify(parsed.blue_fighter_name)].sort().join("|");
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

function cardSectionLabel(section: CardSection) {
  if (section === "main-event") return "main event";
  if (section === "main") return "main card";
  if (section === "early-prelim") return "early prelims";
  return "prelims";
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

function eventSearchTokens(metadata: UfcEventMetadata) {
  return Array.from(new Set(
    `${metadata.name} ${metadata.subtitle}`.toLowerCase().match(/[a-z0-9]+/g)
      ?.filter((token) => token.length >= 4 && !["fight", "night", "versus", "with"].includes(token)) ?? [],
  ));
}

function mmaLinkScore(text: string, href: string, metadata: UfcEventMetadata) {
  const haystack = `${text} ${href}`.toLowerCase();
  let score = /fight-card|fight card/.test(haystack) ? 2 : 0;
  const numbered = `${metadata.name} ${metadata.subtitle}`.match(/\bUFC\s+(\d{3,4})\b/i)?.[1];
  if (numbered && new RegExp(`(?:ufc[- ]?)${numbered}\\b`, "i").test(haystack)) score += 30;
  for (const token of eventSearchTokens(metadata)) {
    if (haystack.includes(token)) score += 5;
  }
  return score;
}

async function fetchText(url: string, sourceLabel: string) {
  const response = await fetch(url, { headers: requestHeaders, redirect: "follow" });
  if (!response.ok) throw new Error(`${sourceLabel} returned HTTP ${response.status}.`);
  return response.text();
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

async function findMmaManiaCard(metadata: UfcEventMetadata) {
  const indexHtml = await fetchText(MMA_MANIA_INDEX_URL, "MMA Mania");
  const $ = cheerio.load(indexHtml);
  const candidates = new Map<string, { url: string; score: number }>();

  $("a[href]").each((_, element) => {
    const url = absoluteMmaManiaArticleUrl($(element).attr("href") ?? "");
    if (!url) return;
    const score = mmaLinkScore(clean($(element).text()), url, metadata);
    const previous = candidates.get(url);
    if (!previous || score > previous.score) candidates.set(url, { url, score });
  });

  const ranked = Array.from(candidates.values()).sort((left, right) => right.score - left.score).slice(0, 12);
  if (!ranked.length) throw new Error("MMA Mania did not return any UFC fight-card articles.");

  let best: { card: MmaManiaCard; score: number } | null = null;
  for (const candidate of ranked) {
    if (candidate.score < 5) continue;
    try {
      const card = parseMmaManiaCard(await fetchText(candidate.url, "MMA Mania"), candidate.url);
      const score = candidate.score + card.bouts.length;
      if (card.usedSectionHeadings && card.bouts.length >= 4 && (!best || score > best.score)) {
        best = { card, score };
      }
    } catch {
      // Try the next matched article.
    }
  }

  if (!best) {
    throw new Error("MMA Mania did not return a sectioned fight card matching the next UFC event. No UFC first-six fallback was used.");
  }
  return best.card;
}

async function buildNextEvent(now: Date, requestedScope: CardScope) {
  const metadata = await findNextUfcEvent(now);
  if (!metadata) throw new Error("No future UFC event metadata could be found.");
  const card = await findMmaManiaCard(metadata);
  const effectiveScope = resolveCardScope(metadata.name, metadata.subtitle, requestedScope);
  const selected = selectBouts(card, effectiveScope);
  if (!selected.length) throw new Error("The matched MMA Mania article did not contain fights for the selected card scope.");

  const bouts = toStagedBouts(selected);
  const subtitle = metadata.subtitle || `${bouts[0]!.red_fighter_name} vs. ${bouts[0]!.blue_fighter_name}`;
  const warnings = [
    !metadata.venue ? "MISSING VENUE" : "",
    !metadata.location ? "MISSING LOCATION" : "",
    !card.usedSectionHeadings ? "MMA MANIA CARD SECTIONS NEED REVIEW" : "",
    effectiveScope === "main" && bouts.length < 4 ? "FEWER THAN FOUR MAIN-CARD FIGHTS FOUND" : "",
    effectiveScope === "full" && bouts.length < 8 ? "FULL CARD HAS FEWER THAN EIGHT FIGHTS" : "",
    bouts.some((bout) => !bout.weight_class) ? "ONE OR MORE WEIGHT CLASSES NEED REVIEW" : "",
  ].filter(Boolean);

  const event: ParsedEvent = {
    source: "UFC.com metadata + MMA Mania card",
    source_event_key: metadata.source_event_key,
    source_url: card.sourceUrl,
    event_id: metadata.event_id,
    name: metadata.name,
    subtitle,
    venue: metadata.venue,
    location: metadata.location,
    starts_at: metadata.starts_at,
    locks_at: metadata.locks_at,
    season: metadata.season,
    bouts,
    warnings,
  };
  return { event, effectiveScope };
}

function sectionFromBoutId(boutId: string): CardSection {
  if (boutId.startsWith("main-event-")) return "main-event";
  if (boutId.startsWith("early-prelim-")) return "early-prelim";
  if (boutId.startsWith("prelim-")) return "prelim";
  return "main";
}

function pairKey(red: string, blue: string) {
  return [slugify(red), slugify(blue)].sort().join("|");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function sourceChanges(currentValue: unknown, event: ParsedEvent, effectiveScope: EffectiveScope) {
  const current = asRecord(currentValue);
  if (!current) return [`Stage a new ${effectiveScope === "full" ? "full" : "main"} card with ${event.bouts.length} fights.`];
  const changes: string[] = [];
  const metadataFields: Array<[string, string, unknown, unknown]> = [
    ["Event name", "name", current.name, event.name],
    ["Main event", "subtitle", current.subtitle, event.subtitle],
    ["Venue", "venue", current.venue, event.venue],
    ["Location", "location", current.location, event.location],
    ["Event time", "starts_at", current.starts_at, event.starts_at],
    ["Picks lock", "locks_at", current.locks_at, event.locks_at],
  ];
  for (const [label, , oldValue, newValue] of metadataFields) {
    if (clean(String(oldValue ?? "")) !== clean(String(newValue ?? ""))) changes.push(`${label} changed.`);
  }

  const currentBouts = Array.isArray(current.bouts) ? current.bouts.map(asRecord).filter(Boolean) as Record<string, unknown>[] : [];
  const currentMap = new Map(currentBouts.map((bout) => [
    pairKey(String(bout.red_fighter_name ?? ""), String(bout.blue_fighter_name ?? "")),
    bout,
  ]));
  const sourceMap = new Map(event.bouts.map((bout) => [pairKey(bout.red_fighter_name, bout.blue_fighter_name), bout]));

  for (const [key, bout] of sourceMap) {
    const existing = currentMap.get(key);
    if (!existing) {
      changes.push(`Added ${cardSectionLabel(sectionFromBoutId(bout.bout_id))}: ${bout.red_fighter_name} vs. ${bout.blue_fighter_name}.`);
      continue;
    }
    const oldSection = sectionFromBoutId(String(existing.bout_id ?? ""));
    const newSection = sectionFromBoutId(bout.bout_id);
    if (oldSection !== newSection) {
      changes.push(`Moved ${bout.red_fighter_name} vs. ${bout.blue_fighter_name} from ${cardSectionLabel(oldSection)} to ${cardSectionLabel(newSection)}.`);
    }
    if (clean(String(existing.weight_class ?? "")) !== clean(bout.weight_class)) {
      changes.push(`Weight class changed for ${bout.red_fighter_name} vs. ${bout.blue_fighter_name}.`);
    }
  }

  for (const [key, bout] of currentMap) {
    if (sourceMap.has(key)) continue;
    changes.push(`Removed ${cardSectionLabel(sectionFromBoutId(String(bout.bout_id ?? "")))}: ${String(bout.red_fighter_name ?? "")} vs. ${String(bout.blue_fighter_name ?? "")}.`);
  }

  const oldOrder = currentBouts.map((bout) => pairKey(String(bout.red_fighter_name ?? ""), String(bout.blue_fighter_name ?? ""))).filter((key) => sourceMap.has(key));
  const newOrder = event.bouts.map((bout) => pairKey(bout.red_fighter_name, bout.blue_fighter_name)).filter((key) => currentMap.has(key));
  if (oldOrder.length === newOrder.length && oldOrder.some((key, index) => key !== newOrder[index])) {
    changes.push("Fight order changed.");
  }
  return Array.from(new Set(changes));
}

async function sourceHash(event: ParsedEvent, effectiveScope: EffectiveScope) {
  const canonical = JSON.stringify({
    effectiveScope,
    event: {
      source_event_key: event.source_event_key,
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
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!supabaseUrl || !anonKey || !secretKey || !token) return json({ message: "Event sync is not configured." }, 503);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const user = await admin.auth.getUser(token);
  if (user.error || !user.data.user) return json({ message: "Owner sign-in required." }, 401);

  const ownerClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const ownerProbe = await ownerClient.rpc("get_pick_event_setup");
  if (ownerProbe.error) {
    const denied = ownerProbe.error.message.toLowerCase().includes("pick control owner required");
    return json({ message: denied ? "Fight Night owner access required." : "Event Setup is unavailable." }, denied ? 403 : 503);
  }

  let input: Record<string, unknown> = {};
  try {
    input = asRecord(await request.json()) ?? {};
  } catch {
    input = {};
  }
  const mode = input.mode === "preview" ? "preview" : "apply";
  const requestedScope: CardScope = input.card_scope === "main" || input.card_scope === "full" ? input.card_scope : "auto";
  const expectedHash = typeof input.expected_hash === "string" ? input.expected_hash : "";

  try {
    const { event, effectiveScope } = await buildNextEvent(new Date(), requestedScope);
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
      });
    }

    if (expectedHash && expectedHash !== hash) {
      return json({ message: "The source card changed after review. Check for card updates again before applying it." }, 409);
    }
    const staged = await admin.rpc("stage_pick_event_draft", { p_payload: event });
    if (staged.error) throw staged.error;
    return json({ draftId: staged.data, source_hash: hash, effective_scope: effectiveScope, warnings: event.warnings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The next UFC event could not be staged.";
    return json({ message }, 502);
  }
});
