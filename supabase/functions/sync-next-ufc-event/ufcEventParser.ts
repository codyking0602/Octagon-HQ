import * as cheerio from "npm:cheerio@1.0.0";
import {
  canonicalFightPair,
  canonicalFighterDisplay,
  eventNumber,
  normalizeText,
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

const clean = (value: unknown) => String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

function metaContent($: cheerio.CheerioAPI, selector: string) {
  return clean($(selector).first().attr("content"));
}

function visibleText($: cheerio.CheerioAPI) {
  return clean($("body").text());
}

function classifySection(value: string): "main" | "prelim" | "early-prelim" | null {
  const heading = clean(value).toLowerCase();
  if (/\bearly\s+prelims?\b/.test(heading)) return "early-prelim";
  if (/\bprelims?\b/.test(heading)) return "prelim";
  if (/\bmain\s+card\b/.test(heading)) return "main";
  return null;
}

function sectionLabel($: cheerio.CheerioAPI, section: HtmlElement) {
  const node = $(section);
  return clean(node.find("h1,h2,h3,h4,[class*='card-title'],[class*='fight-card-title']").first().text());
}

function sectionKind($: cheerio.CheerioAPI, section: HtmlElement, index: number) {
  return classifySection(sectionLabel($, section))
    ?? (index === 0 ? "main" : index === 1 ? "prelim" : "early-prelim");
}

function uniqueFighterNames($: cheerio.CheerioAPI, row: HtmlElement) {
  const node = $(row);
  const candidates = node.find(
    ".c-listing-fight__corner-name a, a[href*='/athlete/'], a[href*='/fighter/']",
  ).map((_: number, element: HtmlElement) => canonicalFighterDisplay($(element).text())).get() as string[];
  const names: string[] = [];
  const identities = new Set<string>();
  for (const candidate of candidates) {
    const name = clean(candidate);
    const identity = normalizeText(name);
    if (!identity || identities.has(identity)) continue;
    if (name.length < 2 || name.length > 80) continue;
    identities.add(identity);
    names.push(name);
  }
  return names;
}

function weightClass($: cheerio.CheerioAPI, row: HtmlElement) {
  const node = $(row);
  return clean(
    node.find(".c-listing-fight__class-text,[class*='listing-fight__class-text'],[class*='weight-class']")
      .first().text(),
  ).replace(/\s+Bout\b.*$/i, "");
}

function fightRows($: cheerio.CheerioAPI, section: HtmlElement) {
  const node = $(section);
  const explicit = node.find("ul > li.c-listing-fight, ul > li[class*='listing-fight']").get() as HtmlElement[];
  if (explicit.length) return explicit;
  return node.find("ul > li").get() as HtmlElement[];
}

export function parseUfcFightCard(html: string, sourceUrl: string): UfcEventCard {
  const $ = cheerio.load(html);
  const root = $(".fight-card").first().length ? $(".fight-card").first() : $("[class*='fight-card']").first();
  if (!root.length) return { sourceUrl, bouts: [], usedSectionHeadings: false };

  let sections = root.find(":scope > div > div > section").get() as HtmlElement[];
  if (!sections.length) sections = root.find("section").get() as HtmlElement[];
  if (!sections.length) sections = [root.get(0)!];

  const bouts: ParsedUfcBout[] = [];
  const seen = new Set<string>();
  let usedSectionHeadings = false;

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const section = sections[sectionIndex]!;
    const labeled = classifySection(sectionLabel($, section));
    if (labeled) usedSectionHeadings = true;
    const segment = sectionKind($, section, sectionIndex);
    const rows = fightRows($, section);
    let mainFightIndex = 0;

    for (const row of rows) {
      const text = clean($(row).text());
      if (!text || /\b(?:cancelled|canceled|postponed|scrapped)\b/i.test(text)) continue;
      const fighters = uniqueFighterNames($, row);
      if (fighters.length !== 2) continue;
      const pair = canonicalFightPair(fighters[0]!, fighters[1]!);
      if (!pair || seen.has(pair)) continue;
      seen.add(pair);
      const sectionValue: CardSection = segment === "main"
        ? (mainFightIndex++ === 0 ? "main-event" : "main")
        : segment;
      bouts.push({
        section: sectionValue,
        weight_class: weightClass($, row),
        red_fighter_name: fighters[0]!,
        blue_fighter_name: fighters[1]!,
      });
    }
  }

  if (!bouts.some((bout) => bout.section === "main-event")) {
    const firstMain = bouts.find((bout) => bout.section === "main");
    if (firstMain) firstMain.section = "main-event";
  }

  return { sourceUrl, bouts, usedSectionHeadings };
}

function eventPlaceFromDescription(value: string) {
  const text = clean(value);
  const match = text.match(/\bLive\s+From\s+(.{2,140}?)\s+In\s+(.{2,160}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  if (match) return { venue: clean(match[1]), location: clean(match[2]) };
  const venueOnly = text.match(/\bLive\s+From\s+(.{2,180}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  return venueOnly ? { venue: clean(venueOnly[1]), location: "" } : { venue: "", location: "" };
}

function referenceTimestamp($: cheerio.CheerioAPI, now: Date) {
  const raw = clean($(".c-hero__bottom-text [data-timestamp],[data-timestamp]").first().attr("data-timestamp"));
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) {
    const milliseconds = numeric > 10_000_000_000 ? numeric : numeric * 1000;
    const parsed = new Date(milliseconds);
    if (Number.isFinite(parsed.getTime())) return parsed.toISOString();
  }
  const datetime = clean($("time[datetime]").first().attr("datetime"));
  const parsed = new Date(datetime);
  return datetime && Number.isFinite(parsed.getTime()) ? parsed.toISOString() : now.toISOString();
}

function eventName($: cheerio.CheerioAPI, card: UfcEventCard) {
  const pageTitle = clean($(".c-hero__header h1").first().text())
    || clean($("h1").first().text())
    || metaContent($, "meta[property='og:title']");
  const number = eventNumber(pageTitle);
  if (number) return `UFC ${number}`;
  if (/\bNoche\s+UFC\b/i.test(pageTitle)) return pageTitle.match(/\bNoche\s+UFC(?:\s+\d+)?\b/i)?.[0] ?? "Noche UFC";
  if (/\bUFC\s+White\s+House\b/i.test(pageTitle)) return pageTitle.match(/\bUFC\s+White\s+House(?:\s+\d+)?\b/i)?.[0] ?? "UFC White House";
  if (card.bouts.length) return "UFC Fight Night";
  return "";
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
  if (card.bouts.length < 4 || card.bouts.length > 20) {
    throw new Error(`Official UFC did not provide a plausible fight card (${card.bouts.length} fights).`);
  }
  const mainEvent = card.bouts.find((bout) => bout.section === "main-event");
  if (!mainEvent) throw new Error("Official UFC did not provide a main event.");

  const name = eventName($, card);
  if (!name) throw new Error("Official UFC did not provide an event name.");
  const number = eventNumber(name);
  const eventType: UfcEventMetadata["eventType"] = number ? "numbered" : "fight-night";
  const bodyText = visibleText($);
  const times = parseOfficialUfcSegmentTimes(
    bodyText,
    referenceTimestamp($, now),
    eventType === "numbered",
    now,
  );
  const description = metaContent($, "meta[property='og:description']")
    || metaContent($, "meta[name='description']");
  const place = eventPlaceFromDescription(description);
  const heroPlace = clean($(".c-hero__bottom-text").text());
  const venue = place.venue || clean($("[class*='venue']").first().text());
  const location = place.location || clean($("[class*='location']").first().text())
    || (heroPlace && !/iframe|googletagmanager|skip\s+to\s+main/i.test(heroPlace) ? heroPlace : "");
  const sourceEventKey = /^event\/[a-z0-9-]+$/i.test(clean(sourceEventKeyOverride))
    ? clean(sourceEventKeyOverride)
    : canonicalUfcEventKey(sourceUrl);
  if (!sourceEventKey) throw new Error("Official UFC did not produce a stable event identity.");
  const subtitle = `${mainEvent.red_fighter_name} vs. ${mainEvent.blue_fighter_name}`;
  const startsAt = eventType === "numbered" ? times.prelimsStartsAt : times.mainCardStartsAt;
  const eventId = normalizeText(`${name} ${subtitle} ${times.localEventDate}`).replace(/\s+/g, "-");

  return {
    card,
    metadata: {
      source_event_key: sourceEventKey,
      event_id: eventId,
      name,
      subtitle,
      venue,
      location,
      starts_at: startsAt,
      prelims_starts_at: eventType === "numbered" ? times.prelimsStartsAt : "",
      locks_at: startsAt,
      season: Number(times.localEventDate.slice(0, 4)),
      eventType,
      localEventDate: times.localEventDate,
    },
  };
}
