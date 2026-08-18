import * as cheerio from "npm:cheerio@1.0.0";
import {
  canonicalFightPair,
  canonicalFighterDisplay,
  eventNumber,
  fighterMatch,
  normalizeText,
  splitVersus,
} from "./normalization.ts";
import {
  parseOfficialUfcSegmentTimes,
  type CardSection,
} from "./importPolicy.ts";
import { absoluteUfcEventUrl, canonicalUfcEventKey } from "./sourceUrls.ts";

export interface ParsedUfcBout {
  section: CardSection;
  weight_class: string;
  red_fighter_name: string;
  blue_fighter_name: string;
}

export interface UfcEventCard {
  sourceUrl: string;
  bouts: ParsedUfcBout[];
  usedSectionHeadings: boolean;
}

export interface UfcEventMetadata {
  source_event_key: string;
  event_id: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  starts_at: string;
  prelims_starts_at: string;
  locks_at: string;
  season: number;
  eventType: "numbered" | "fight-night";
  localEventDate: string;
}

export interface UfcEventCandidate {
  card: UfcEventCard;
  metadata: UfcEventMetadata;
}

type HtmlElement = unknown;

const monthNumbers: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
  jan: "01", feb: "02", mar: "03", apr: "04", jun: "06", jul: "07", aug: "08",
  sep: "09", sept: "09", oct: "10", nov: "11", dec: "12",
};

const clean = (value: unknown) => String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

function metaContent($: cheerio.CheerioAPI, selector: string) {
  return clean($(selector).first().attr("content"));
}

function visibleText($: cheerio.CheerioAPI) {
  return clean($("body").text());
}

function timestampIso(value: unknown) {
  const raw = clean(value);
  if (!raw) return "";
  if (/^\d{9,14}$/.test(raw)) {
    const numeric = Number(raw);
    const milliseconds = numeric > 10_000_000_000 ? numeric : numeric * 1000;
    const parsed = new Date(milliseconds);
    return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : "";
  }
  const parsed = new Date(raw);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : "";
}

function sectionTimestamp($: cheerio.CheerioAPI, selector: string) {
  const section = $(selector).first();
  if (!section.length) return "";
  const candidates = [
    section.find(".c-event-fight-card-broadcaster__time[data-timestamp]").first().attr("data-timestamp"),
    section.find("[data-timestamp]").first().attr("data-timestamp"),
  ];
  return candidates.map(timestampIso).find(Boolean) ?? "";
}

function referenceTimestamp($: cheerio.CheerioAPI, now: Date) {
  const candidates = [
    $(".c-hero__headline-suffix[data-timestamp]").first().attr("data-timestamp"),
    $(".c-hero__bottom-text [data-timestamp]").first().attr("data-timestamp"),
    $("time[datetime]").first().attr("datetime"),
  ];
  return candidates.map(timestampIso).find(Boolean) ?? now.toISOString();
}

function dateFromSourceUrl(sourceUrl: string) {
  const slug = new URL(sourceUrl).pathname.split("/").filter(Boolean).at(-1) ?? "";
  const match = slug.match(/-(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)-(\d{1,2})-(20\d{2})$/i);
  if (!match) return "";
  const month = monthNumbers[match[1]!.toLowerCase()];
  return month ? `${match[3]}-${month}-${match[2]!.padStart(2, "0")}` : "";
}

function dateFromVisibleText(text: string, referenceIso: string) {
  const referenceYear = new Date(referenceIso).getUTCFullYear();
  const match = text.match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:day)?\s*,?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:,\s*(20\d{2}))?/i)
    ?? text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:,\s*(20\d{2}))?/i);
  if (!match) return "";
  const month = monthNumbers[match[1]!.toLowerCase()];
  const year = match[3] ?? String(referenceYear);
  return month ? `${year}-${month}-${match[2]!.padStart(2, "0")}` : "";
}

function canonicalName(value: unknown) {
  const name = canonicalFighterDisplay(clean(value));
  return name.length >= 2 && name.length <= 80 ? name : "";
}

function namesFromRow($: cheerio.CheerioAPI, row: HtmlElement) {
  const node = $(row);
  const red = canonicalName(node.find(".c-listing-fight__corner-name--red").first().text());
  const blue = canonicalName(node.find(".c-listing-fight__corner-name--blue").first().text());
  if (red && blue) return [red, blue];

  const title = clean(node.find(".field--name-node-title").first().text());
  const titlePair = splitVersus(title).map(canonicalName).filter(Boolean);
  if (titlePair.length === 2) return titlePair;

  const linked = node.find(".c-listing-fight__corner-name a, a[href*='/athlete/'], a[href*='/fighter/']")
    .map((_: number, element: HtmlElement) => canonicalName($(element).text()))
    .get() as string[];
  const unique: string[] = [];
  const identities = new Set<string>();
  for (const name of linked) {
    const identity = normalizeText(name);
    if (!identity || identities.has(identity)) continue;
    identities.add(identity);
    unique.push(name);
  }
  return unique.length === 2 ? unique : [];
}

function weightClass($: cheerio.CheerioAPI, row: HtmlElement) {
  return clean(
    $(row).find(".c-listing-fight__class-text,[class*='listing-fight__class-text'],[class*='weight-class']")
      .first().text(),
  ).replace(/\s+Bout\b.*$/i, "");
}

function rowsForSection($: cheerio.CheerioAPI, selector: string) {
  const section = $(selector).first();
  if (!section.length) return [] as HtmlElement[];
  const rows = section.find(".l-listing__item").get() as HtmlElement[];
  return rows.length ? rows : section.find(".c-listing-fight,[class*='listing-fight']").get() as HtmlElement[];
}

function appendSectionBouts(
  $: cheerio.CheerioAPI,
  rows: HtmlElement[],
  segment: "main" | "prelim" | "early-prelim",
  bouts: ParsedUfcBout[],
  seen: Set<string>,
) {
  let mainIndex = 0;
  for (const row of rows) {
    const text = clean($(row).text());
    if (!text || /\b(?:cancelled|canceled|postponed|scrapped)\b/i.test(text)) continue;
    const fighters = namesFromRow($, row);
    if (fighters.length !== 2) continue;
    const pair = canonicalFightPair(fighters[0]!, fighters[1]!);
    if (!pair || seen.has(pair)) continue;
    seen.add(pair);
    bouts.push({
      section: segment === "main" ? (mainIndex++ === 0 ? "main-event" : "main") : segment,
      weight_class: weightClass($, row),
      red_fighter_name: fighters[0]!,
      blue_fighter_name: fighters[1]!,
    });
  }
}

export function parseUfcFightCard(html: string, sourceUrl: string): UfcEventCard {
  const $ = cheerio.load(html);
  const mainRows = rowsForSection($, "#main-card");
  const prelimRows = rowsForSection($, "#prelims-card");
  const earlyRows = rowsForSection($, "#early-prelims");
  const bouts: ParsedUfcBout[] = [];
  const seen = new Set<string>();

  if (mainRows.length) {
    appendSectionBouts($, mainRows, "main", bouts, seen);
    appendSectionBouts($, prelimRows, "prelim", bouts, seen);
    appendSectionBouts($, earlyRows, "early-prelim", bouts, seen);
    return { sourceUrl, bouts, usedSectionHeadings: true };
  }

  const unsectioned = $(".l-listing__group--bordered .l-listing__item").get() as HtmlElement[];
  appendSectionBouts($, unsectioned, "main", bouts, seen);
  return { sourceUrl, bouts, usedSectionHeadings: false };
}

function eventPlaceFromDescription(value: string) {
  const text = clean(value);
  const match = text.match(/\bLive\s+From\s+(.{2,140}?)\s+In\s+(.{2,160}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  if (match) return { venue: clean(match[1]), location: clean(match[2]) };
  const venueOnly = text.match(/\bLive\s+From\s+(.{2,180}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  return venueOnly ? { venue: clean(venueOnly[1]), location: "" } : { venue: "", location: "" };
}

function venueLines($: cheerio.CheerioAPI) {
  const root = $(".field--name-venue").first();
  if (!root.length) return [] as string[];
  const descendants = root.find(".field__item,div,p,span").map((_: number, element: HtmlElement) => clean($(element).text())).get() as string[];
  const candidates = descendants.filter((value) => value && value.length <= 180);
  const unique = Array.from(new Set(candidates));
  if (unique.length >= 2) return unique.filter((value) => !unique.some((other) => other !== value && other.includes(value) && other.length > value.length));
  return clean(root.text()).split(/\s{2,}|\n+/).map(clean).filter(Boolean);
}

function eventPlace($: cheerio.CheerioAPI, description: string) {
  const descriptionPlace = eventPlaceFromDescription(description);
  if (descriptionPlace.venue) return descriptionPlace;
  const lines = venueLines($);
  if (lines.length >= 2) return { venue: lines[0]!, location: lines.slice(1).join(", ") };
  const hero = clean($(".c-hero__bottom-text").text());
  return {
    venue: lines[0] ?? "",
    location: descriptionPlace.location || (hero.length <= 180 ? hero : ""),
  };
}

function eventName($: cheerio.CheerioAPI, card: UfcEventCard) {
  const prefix = clean($(".c-hero__headline-prefix").first().text());
  const pageTitle = clean($(".c-hero__header h1").first().text())
    || clean($("h1").first().text())
    || metaContent($, "meta[property='og:title']");
  const evidence = `${prefix} ${pageTitle}`;
  const number = eventNumber(evidence);
  if (number) return `UFC ${number}`;
  if (/\bNoche\s+UFC\b/i.test(evidence)) return evidence.match(/\bNoche\s+UFC(?:\s+\d+)?\b/i)?.[0] ?? "Noche UFC";
  if (/\bUFC\s+White\s+House\b/i.test(evidence)) return evidence.match(/\bUFC\s+White\s+House(?:\s+\d+)?\b/i)?.[0] ?? "UFC White House";
  if (/\bUFC\s+Fight\s+Night\b/i.test(evidence) || card.bouts.length) return "UFC Fight Night";
  return "";
}

function orderedSubtitle($: cheerio.CheerioAPI, mainEvent: ParsedUfcBout) {
  const fullNames = [mainEvent.red_fighter_name, mainEvent.blue_fighter_name];
  const hero = clean($(".c-hero__headline").first().text());
  const abbreviated = splitVersus(hero);
  if (abbreviated.length === 2) {
    const firstMatches = fullNames.filter((name) => fighterMatch(abbreviated[0]!, name));
    const secondMatches = fullNames.filter((name) => fighterMatch(abbreviated[1]!, name));
    if (firstMatches.length === 1 && secondMatches.length === 1 && firstMatches[0] !== secondMatches[0]) {
      return `${firstMatches[0]} vs. ${secondMatches[0]}`;
    }
  }
  return `${mainEvent.red_fighter_name} vs. ${mainEvent.blue_fighter_name}`;
}

function segmentTimes($: cheerio.CheerioAPI, eventType: UfcEventMetadata["eventType"], sourceUrl: string, now: Date) {
  const bodyText = visibleText($);
  const reference = referenceTimestamp($, now);
  const mainDirect = sectionTimestamp($, "#main-card") || reference;
  const prelimDirect = sectionTimestamp($, "#prelims-card");
  let parsed: ReturnType<typeof parseOfficialUfcSegmentTimes> | null = null;
  try {
    parsed = parseOfficialUfcSegmentTimes(bodyText, reference, eventType === "numbered", now);
  } catch {
    parsed = null;
  }

  const mainCardStartsAt = parsed?.mainCardStartsAt || mainDirect;
  const prelimsStartsAt = parsed?.prelimsStartsAt || prelimDirect;
  if (!mainCardStartsAt) throw new Error("Official UFC did not provide a Main Card start time.");
  if (eventType === "numbered" && !prelimsStartsAt) {
    throw new Error("Official UFC did not provide a numbered-event Prelims start time.");
  }
  if (prelimsStartsAt && Date.parse(prelimsStartsAt) >= Date.parse(mainCardStartsAt)) {
    throw new Error("Official UFC Prelims time must precede the Main Card time.");
  }

  const localEventDate = parsed?.localEventDate
    || dateFromSourceUrl(sourceUrl)
    || dateFromVisibleText(bodyText, reference)
    || mainCardStartsAt.slice(0, 10);
  return { mainCardStartsAt, prelimsStartsAt, localEventDate };
}

export function parseUfcEventPage(
  html: string,
  requestedUrl: string,
  sourceEventKeyOverride = "",
  now = new Date(),
): UfcEventCandidate {
  const sourceUrl = absoluteUfcEventUrl(requestedUrl);
  if (!sourceUrl) throw new Error("Official UFC event parsing requires an exact UFC.com event URL.");

  const $ = cheerio.load(html);
  const card = parseUfcFightCard(html, sourceUrl);
  if (!card.usedSectionHeadings || card.bouts.length < 4 || card.bouts.length > 20) {
    throw new Error(`Official UFC did not provide a plausible sectioned fight card (${card.bouts.length} fights).`);
  }
  const mainEvent = card.bouts.find((bout) => bout.section === "main-event");
  if (!mainEvent) throw new Error("Official UFC did not provide a main event.");

  const name = eventName($, card);
  if (!name) throw new Error("Official UFC did not provide an event name.");
  const number = eventNumber(name);
  const eventType: UfcEventMetadata["eventType"] = number ? "numbered" : "fight-night";
  const times = segmentTimes($, eventType, sourceUrl, now);
  const description = metaContent($, "meta[property='og:description']")
    || metaContent($, "meta[name='description']");
  const place = eventPlace($, description);
  const sourceEventKey = /^event\/[a-z0-9-]+$/i.test(clean(sourceEventKeyOverride))
    ? clean(sourceEventKeyOverride)
    : canonicalUfcEventKey(sourceUrl);
  if (!sourceEventKey) throw new Error("Official UFC did not produce a stable event identity.");
  const subtitle = orderedSubtitle($, mainEvent);
  const startsAt = eventType === "numbered" ? times.prelimsStartsAt : times.mainCardStartsAt;
  const eventId = normalizeText(`${name} ${subtitle} ${times.localEventDate}`).replace(/\s+/g, "-");

  return {
    card,
    metadata: {
      source_event_key: sourceEventKey,
      event_id: eventId,
      name,
      subtitle,
      venue: place.venue,
      location: place.location,
      starts_at: startsAt,
      prelims_starts_at: eventType === "numbered" ? times.prelimsStartsAt : "",
      locks_at: startsAt,
      season: Number(times.localEventDate.slice(0, 4)),
      eventType,
      localEventDate: times.localEventDate,
    },
  };
}
