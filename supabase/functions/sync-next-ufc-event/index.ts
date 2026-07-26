import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import * as cheerio from "npm:cheerio@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EVENT_INDEX_URL = "https://www.ufc.com/events?language_content_entity=en";
const requestHeaders = {
  "User-Agent": "OctagonHQ/2.0 (+https://octagon.hq-app.workers.dev)",
  Accept: "text/html,application/xhtml+xml",
};

const weightClasses = [
  "Women's Strawweight",
  "Women's Flyweight",
  "Women's Bantamweight",
  "Women's Featherweight",
  "Light Heavyweight",
  "Super Heavyweight",
  "Catch Weight",
  "Strawweight",
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Heavyweight",
];

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
  starts_at: string | null;
  locks_at: string | null;
  season: number;
  bouts: StagedBout[];
  warnings: string[];
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

function absoluteEventUrl(value: string) {
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
    EDT: "-04:00",
    EST: "-05:00",
    CDT: "-05:00",
    CST: "-06:00",
    MDT: "-06:00",
    MST: "-07:00",
    PDT: "-07:00",
    PST: "-08:00",
    GMT: "+00:00",
    UTC: "+00:00",
  };
  return offsets[zone.toUpperCase()] ?? "";
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
  const candidate = new Date(`${month} ${dayValue}, ${year} ${String(hour).padStart(2, "0")}:${minute}:00 ${offset}`);
  if (Number.isNaN(candidate.getTime())) return null;
  if (candidate.getTime() < now.getTime() - 7 * 86400000) {
    year += 1;
    const nextYear = new Date(`${month} ${dayValue}, ${year} ${String(hour).padStart(2, "0")}:${minute}:00 ${offset}`);
    return Number.isNaN(nextYear.getTime()) ? null : nextYear;
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

function smallestBoutContainer($: cheerio.CheerioAPI, element: cheerio.Element) {
  let current = $(element).parent();
  for (let depth = 0; depth < 7 && current.length; depth += 1) {
    const athleteLinks = current.find("a[href*='/athlete/']");
    const names = athleteLinks.map((_, link) => clean($(link).text())).get().filter(Boolean);
    if (new Set(names).size === 2 && clean(current.text()).length < 1200) return current;
    current = current.parent();
  }
  return null;
}

function extractBouts($: cheerio.CheerioAPI) {
  const seen = new Set<string>();
  const bouts: StagedBout[] = [];

  $("a[href*='/athlete/']").each((_, element) => {
    const container = smallestBoutContainer($, element);
    if (!container) return;
    const links = container.find("a[href*='/athlete/']").toArray();
    const fighters = links.map((link) => ({
      name: clean($(link).text()),
      href: $(link).attr("href") ?? "",
    })).filter((fighter) => fighter.name);
    const unique = fighters.filter((fighter, index) => fighters.findIndex((other) => other.name === fighter.name) === index);
    if (unique.length !== 2) return;
    const key = unique.map((fighter) => fighter.name).join("|");
    if (seen.has(key)) return;
    seen.add(key);

    const text = clean(container.text());
    const weightClass = weightClasses.find((value) => text.toLowerCase().includes(value.toLowerCase())) ?? "";
    const redName = unique[0]!.name;
    const blueName = unique[1]!.name;
    const redSlug = slugify(unique[0]!.href.split("/athlete/")[1]?.split(/[?#/]/)[0] || redName);
    const blueSlug = slugify(unique[1]!.href.split("/athlete/")[1]?.split(/[?#/]/)[0] || blueName);
    bouts.push({
      bout_id: `${redSlug}-${blueSlug}`,
      position: bouts.length + 1,
      weight_class: weightClass,
      red_fighter_slug: redSlug,
      red_fighter_name: redName,
      blue_fighter_slug: blueSlug,
      blue_fighter_name: blueName,
      included: true,
    });
  });

  return bouts.slice(0, 6);
}

export function parseUfcEventPage(html: string, sourceUrl: string, now = new Date()): ParsedEvent | null {
  const $ = cheerio.load(html);
  const bodyText = clean($("body").text());
  const startsAt = eventTime($, bodyText, now);
  if (!startsAt || startsAt.getTime() < now.getTime() - 6 * 3600000) return null;

  const name = headingText($, "h1") || "UFC Event";
  const versusHeadings = $("h1,h2,h3").map((_, element) => clean($(element).text())).get()
    .filter((value) => /\bvs\.?\b/i.test(value) && value !== name);
  const bouts = extractBouts($);
  const subtitle = versusHeadings[0]
    || (bouts[0] ? `${bouts[0].red_fighter_name} vs. ${bouts[0].blue_fighter_name}` : "");
  const { venue, location } = extractVenueAndLocation($, name, subtitle);
  const warnings = [
    !venue ? "MISSING VENUE" : "",
    !location ? "MISSING LOCATION" : "",
    bouts.length < 4 ? "FEWER THAN FOUR MAIN-CARD FIGHTS FOUND" : "",
    bouts.some((bout) => !bout.weight_class) ? "ONE OR MORE WEIGHT CLASSES NEED REVIEW" : "",
  ].filter(Boolean);
  const sourceEventKey = new URL(sourceUrl).pathname.replace(/^\/+|\/+$/g, "");
  const season = startsAt.getUTCFullYear();

  return {
    source: "ufc.com",
    source_event_key: sourceEventKey,
    source_url: sourceUrl,
    event_id: slugify(`${name}-${subtitle}-${season}-${startsAt.toISOString().slice(0, 10)}`),
    name,
    subtitle,
    venue,
    location,
    starts_at: startsAt.toISOString(),
    locks_at: startsAt.toISOString(),
    season,
    bouts,
    warnings,
  };
}

async function fetchText(url: string) {
  const response = await fetch(url, { headers: requestHeaders, redirect: "follow" });
  if (!response.ok) throw new Error(`UFC source returned HTTP ${response.status}.`);
  return response.text();
}

async function findNextEvent(now: Date) {
  const indexHtml = await fetchText(EVENT_INDEX_URL);
  const $ = cheerio.load(indexHtml);
  const urls = Array.from(new Set(
    $("a[href*='/event/']").map((_, element) => absoluteEventUrl($(element).attr("href") ?? "")).get().filter(Boolean),
  )).slice(0, 10);
  if (!urls.length) throw new Error("UFC did not return any upcoming event links.");

  const parsed = (await Promise.all(urls.map(async (url) => {
    try {
      return parseUfcEventPage(await fetchText(url), url, now);
    } catch {
      return null;
    }
  }))).filter((value): value is ParsedEvent => Boolean(value));

  parsed.sort((left, right) => new Date(left.starts_at!).getTime() - new Date(right.starts_at!).getTime());
  return parsed[0] ?? null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!supabaseUrl || !secretKey || !token) return json({ message: "Event sync is not configured." }, 503);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const user = await admin.auth.getUser(token);
  if (user.error || !user.data.user) return json({ message: "Owner sign-in required." }, 401);

  const owner = await admin.rpc("is_pick_control_owner", { p_profile_id: user.data.user.id });
  if (owner.error || owner.data !== true) return json({ message: "Fight Night owner access required." }, 403);

  try {
    const event = await findNextEvent(new Date());
    if (!event) return json({ message: "No future UFC event could be staged from the official source." }, 502);
    const staged = await admin.rpc("stage_pick_event_draft", { p_payload: event });
    if (staged.error) throw staged.error;
    return json({ draftId: staged.data, event, warnings: event.warnings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The next UFC event could not be staged.";
    return json({ message }, 502);
  }
});
