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

const monthNumbers: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
  jan: "01", feb: "02", mar: "03", apr: "04", jun: "06", jul: "07", aug: "08",
  sep: "09", sept: "09", oct: "10", nov: "11", dec: "12",
};

const clean = (value: unknown) => String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&", apos: "'", quot: '"', nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘",
  };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity: string) => {
    if (entity[0] !== "#") return named[entity.toLowerCase()] ?? `&${entity};`;
    const hex = entity[1]?.toLowerCase() === "x";
    const parsed = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
    return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : "";
  });
}

function visibleText(value: string) {
  return clean(decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/section)\b[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ));
}

function attrValue(attrs: string, name: string) {
  const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  return decodeHtml(match?.[2] ?? "");
}

function metaContent(html: string, key: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const identity = attrValue(tag, "property") || attrValue(tag, "name");
    if (identity.toLowerCase() === key.toLowerCase()) return clean(attrValue(tag, "content"));
  }
  return "";
}

function classText(html: string, className: string) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<([a-z0-9]+)\\b([^>]*\\bclass\\s*=\\s*["'][^"']*\\b${escaped}\\b[^"']*["'][^>]*)>([\\s\\S]*?)<\\/\\1>`,
    "i",
  );
  return visibleText(pattern.exec(html)?.[3] ?? "");
}

function firstTagText(html: string, tag: string) {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(html);
  return visibleText(match?.[1] ?? "");
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

function idStart(html: string, id: string) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`<[^>]+\\bid\\s*=\\s*["']${escaped}["'][^>]*>`, "i").exec(html)?.index ?? -1;
}

function sectionHtml(html: string, id: string) {
  const start = idStart(html, id);
  if (start < 0) return "";
  const later = ["main-card", "prelims-card", "early-prelims"]
    .filter((candidate) => candidate !== id)
    .map((candidate) => idStart(html.slice(start + 1), candidate))
    .filter((index) => index >= 0)
    .map((index) => start + 1 + index)
    .filter((index) => index > start);
  const end = later.length ? Math.min(...later) : html.length;
  return html.slice(start, end);
}

function sectionTimestamp(html: string, id: string) {
  const section = sectionHtml(html, id);
  if (!section) return "";
  const raw = section.match(/\bdata-timestamp\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
  return timestampIso(raw);
}

function referenceTimestamp(html: string, now: Date) {
  const headlineSuffix = classText(html, "c-hero__headline-suffix");
  const suffixTag = headlineSuffix
    ? html.match(/<[^>]+class=["'][^"']*c-hero__headline-suffix[^"']*["'][^>]*>/i)?.[0] ?? ""
    : "";
  const candidates = [
    attrValue(suffixTag, "data-timestamp"),
    html.match(/\bdata-timestamp\s*=\s*["']([^"']+)["']/i)?.[1] ?? "",
    html.match(/<time\b[^>]*\bdatetime\s*=\s*["']([^"']+)["']/i)?.[1] ?? "",
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

function classBlockText(html: string, className: string) {
  return classText(html, className);
}

function anchorFighterNames(row: string) {
  const names: string[] = [];
  const identities = new Set<string>();
  const pattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(row))) {
    const href = attrValue(match[1] ?? "", "href");
    if (!/\/(?:athlete|fighter)\//i.test(href)) continue;
    const name = canonicalName(visibleText(match[2] ?? ""));
    const identity = normalizeText(name);
    if (!identity || identities.has(identity)) continue;
    identities.add(identity);
    names.push(name);
  }
  return names;
}

function namesFromRow(row: string) {
  const red = canonicalName(classBlockText(row, "c-listing-fight__corner-name--red"));
  const blue = canonicalName(classBlockText(row, "c-listing-fight__corner-name--blue"));
  if (red && blue) return [red, blue];

  const title = classBlockText(row, "field--name-node-title");
  const titlePair = splitVersus(title).map(canonicalName).filter(Boolean);
  if (titlePair.length === 2) return titlePair;

  const linked = anchorFighterNames(row);
  return linked.length === 2 ? linked : [];
}

function weightClass(row: string) {
  const value = classBlockText(row, "c-listing-fight__class-text")
    || classBlockText(row, "weight-class");
  return clean(value).replace(/\s+Bout\b.*$/i, "");
}

function rowsForSection(html: string, id: string) {
  const section = sectionHtml(html, id);
  if (!section) return [] as string[];
  const rows: string[] = [];
  const pattern = /<li\b([^>]*)>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(section))) {
    const attrs = match[1] ?? "";
    const classes = attrValue(attrs, "class");
    if (!/(?:^|\s)(?:l-listing__item|c-listing-fight)(?:\s|$)/i.test(classes)) continue;
    rows.push(match[0]);
  }
  return rows;
}

function appendSectionBouts(
  rows: string[],
  segment: "main" | "prelim" | "early-prelim",
  bouts: ParsedUfcBout[],
  seen: Set<string>,
) {
  let mainIndex = 0;
  for (const row of rows) {
    const text = visibleText(row);
    if (!text || /\b(?:cancelled|canceled|postponed|scrapped)\b/i.test(text)) continue;
    const fighters = namesFromRow(row);
    if (fighters.length !== 2) continue;
    const pair = canonicalFightPair(fighters[0]!, fighters[1]!);
    if (!pair || seen.has(pair)) continue;
    seen.add(pair);
    bouts.push({
      section: segment === "main" ? (mainIndex++ === 0 ? "main-event" : "main") : segment,
      weight_class: weightClass(row),
      red_fighter_name: fighters[0]!,
      blue_fighter_name: fighters[1]!,
    });
  }
}

export function parseUfcFightCard(html: string, sourceUrl: string): UfcEventCard {
  const mainRows = rowsForSection(html, "main-card");
  const prelimRows = rowsForSection(html, "prelims-card");
  const earlyRows = rowsForSection(html, "early-prelims");
  const bouts: ParsedUfcBout[] = [];
  const seen = new Set<string>();

  if (mainRows.length) {
    appendSectionBouts(mainRows, "main", bouts, seen);
    appendSectionBouts(prelimRows, "prelim", bouts, seen);
    appendSectionBouts(earlyRows, "early-prelim", bouts, seen);
    return { sourceUrl, bouts, usedSectionHeadings: true };
  }

  return { sourceUrl, bouts, usedSectionHeadings: false };
}

function eventPlaceFromDescription(value: string) {
  const text = clean(value);
  const match = text.match(/\bLive\s+From\s+(.{2,140}?)\s+In\s+(.{2,160}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  if (match) return { venue: clean(match[1]), location: clean(match[2]) };
  const venueOnly = text.match(/\bLive\s+From\s+(.{2,180}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  return venueOnly ? { venue: clean(venueOnly[1]), location: "" } : { venue: "", location: "" };
}

function eventPlace(html: string, description: string) {
  const descriptionPlace = eventPlaceFromDescription(description);
  if (descriptionPlace.venue) return descriptionPlace;
  const venue = classBlockText(html, "field--name-venue");
  return { venue, location: descriptionPlace.location };
}

function eventName(html: string, card: UfcEventCard) {
  const prefix = classBlockText(html, "c-hero__headline-prefix");
  const pageTitle = firstTagText(html, "h1") || metaContent(html, "og:title");
  const evidence = `${prefix} ${pageTitle}`;
  const number = eventNumber(evidence);
  if (number) return `UFC ${number}`;
  if (/\bNoche\s+UFC\b/i.test(evidence)) return evidence.match(/\bNoche\s+UFC(?:\s+\d+)?\b/i)?.[0] ?? "Noche UFC";
  if (/\bUFC\s+White\s+House\b/i.test(evidence)) return evidence.match(/\bUFC\s+White\s+House(?:\s+\d+)?\b/i)?.[0] ?? "UFC White House";
  if (/\bUFC\s+Fight\s+Night\b/i.test(evidence) || card.bouts.length) return "UFC Fight Night";
  return "";
}

function orderedSubtitle(html: string, mainEvent: ParsedUfcBout) {
  const fullNames = [mainEvent.red_fighter_name, mainEvent.blue_fighter_name];
  const hero = classBlockText(html, "c-hero__headline");
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

function segmentTimes(html: string, eventType: UfcEventMetadata["eventType"], sourceUrl: string, now: Date) {
  const bodyText = visibleText(html);
  const reference = referenceTimestamp(html, now);
  const mainDirect = sectionTimestamp(html, "main-card") || reference;
  const prelimDirect = sectionTimestamp(html, "prelims-card");
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

  const card = parseUfcFightCard(html, sourceUrl);
  if (!card.usedSectionHeadings || card.bouts.length < 4 || card.bouts.length > 20) {
    throw new Error(`Official UFC did not provide a plausible sectioned fight card (${card.bouts.length} fights).`);
  }
  const mainEvent = card.bouts.find((bout) => bout.section === "main-event");
  if (!mainEvent) throw new Error("Official UFC did not provide a main event.");

  const name = eventName(html, card);
  if (!name) throw new Error("Official UFC did not provide an event name.");
  const number = eventNumber(name);
  const eventType: UfcEventMetadata["eventType"] = number ? "numbered" : "fight-night";
  const times = segmentTimes(html, eventType, sourceUrl, now);
  const description = metaContent(html, "og:description") || metaContent(html, "description");
  const place = eventPlace(html, description);
  const sourceEventKey = /^event\/[a-z0-9-]+$/i.test(clean(sourceEventKeyOverride))
    ? clean(sourceEventKeyOverride)
    : canonicalUfcEventKey(sourceUrl);
  if (!sourceEventKey) throw new Error("Official UFC did not produce a stable event identity.");
  const subtitle = orderedSubtitle(html, mainEvent);
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
