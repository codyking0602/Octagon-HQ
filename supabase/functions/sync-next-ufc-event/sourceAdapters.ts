// @ts-ignore -- Supabase Edge Functions resolve Deno npm: specifiers at runtime.
import * as cheerio from "npm:cheerio@1.0.0";
import { canonicalFighterDisplay, eventNumber, explicitIsoDates, normalizeText, splitVersus } from "./normalization.ts";
import type { NormalizedArticleEvent, NormalizedUfcEvent } from "./identityEngine.ts";

type Bout = NormalizedArticleEvent["bouts"][number];
type HtmlElement = unknown;

function clean(value: unknown) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function records(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(records);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  return [record, ...records(record["@graph"])];
}

function jsonLd($: cheerio.CheerioAPI): Record<string, unknown>[] {
  const values = $("script[type='application/ld+json']").map((_: number, element: HtmlElement) => {
    try {
      return JSON.parse($(element).text()) as unknown;
    } catch {
      return null;
    }
  }).get() as unknown[];
  return values.flatMap(records);
}

function first(...values: unknown[]) {
  return values.map(clean).find(Boolean) ?? "";
}

function metaContent($: cheerio.CheerioAPI, selector: string) {
  return clean($(selector).first().attr("content"));
}

function semanticLines($: cheerio.CheerioAPI): string[] {
  const root = $("article").first().length
    ? $("article").first()
    : $(".c-entry-content, .article-body, main").first();
  const scope = root.length ? root : $("body");
  const elements = scope.find("h1,h2,h3,h4,h5,h6,p,li,td").get() as HtmlElement[];
  const lines = elements.flatMap((element: HtmlElement) => {
    const clone = $(element).clone();
    clone.find("br").replaceWith("\n");
    return String(clone.text()).split(/\n+/).map(clean).filter(Boolean);
  });
  const unique = Array.from(new Set<string>(lines));
  return unique.length ? unique : [clean(scope.text())].filter(Boolean);
}

const fieldBoundary = String.raw`(?:Event|Date|Location|Start\s*times?)\s*:`;

function labeledField(lines: string[], label: string) {
  const pattern = new RegExp(String.raw`\b${label}\s*:\s*(.+)$`, "i");
  for (const line of lines) {
    const value = line.match(pattern)?.[1];
    if (!value) continue;
    return clean(value.split(new RegExp(fieldBoundary, "i"))[0]);
  }

  const body = lines.join(" ");
  return clean(body.match(new RegExp(
    String.raw`\b${label}\s*:\s*(.{1,220}?)(?=${fieldBoundary}|$)`,
    "i",
  ))?.[1]);
}

function eventDateEvidence(lines: string[]) {
  const evidence = lines.filter((line) => (
    /\bdate\s*:/i.test(line)
    || /\b(?:takes? place|scheduled(?: for)?|event (?:is )?(?:on|for)|card (?:is )?on)\b/i.test(line)
  ));
  return explicitIsoDates(evidence.join(" "));
}

function locationEvidence(lines: string[]) {
  const labeled = labeledField(lines, "Location");
  const contextual = lines.filter((line) => (
    /\blocation\s*:/i.test(line)
    || /\b(?:inside|held at|takes? place at)\b/i.test(line)
    || /\bat\s+[A-Z][^.!?]{2,120}(?:Arena|Center|Centre|Stadium|Apex|Garden|Dome|Pavilion|Hall)\b/i.test(line)
  )).slice(0, 6);
  return Array.from(new Set([labeled, ...contextual].map(clean).filter(Boolean)));
}

function ufcPlaceFromDescription(value: string) {
  const text = clean(value);
  const withLocation = text.match(/\bLive\s+From\s+(.{2,120}?)\s+In\s+(.{2,120}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  if (withLocation) return { venue: clean(withLocation[1]), location: clean(withLocation[2]) };
  const venueOnly = text.match(/\bLive\s+From\s+(.{2,160}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  return venueOnly ? { venue: clean(venueOnly[1]), location: "" } : { venue: "", location: "" };
}

function safeMetadata(value: unknown, maxLength: number) {
  const text = clean(value);
  if (!text || text.length > maxLength) return "";
  if (/<|>|iframe|googletagmanager|skip\s+to\s+main|main\s+content|src\s*=|<\/?(?:script|style|nav)\b/i.test(text)) return "";
  return text;
}

function safeEventName(value: string, number: string) {
  if (number) return `UFC ${number}`;
  return /\bufc\s+fight\s+night\b/i.test(value) ? "UFC Fight Night" : safeMetadata(value, 80);
}

function versusLabel(value: string) {
  const text = safeMetadata(value, 400);
  if (!text) return "";
  const colonTail = text.includes(":") ? text.slice(text.lastIndexOf(":") + 1) : text;
  const candidate = clean(colonTail.split(/\s*\|\s*|,\s*(?:Live|From|On|at)\b/i)[0]);
  const parts = splitVersus(candidate).map(canonicalFighterDisplay);
  if (parts.length !== 2 || parts.some((part) => part.length < 2 || part.length > 80)) return "";
  return `${parts[0]} vs ${parts[1]}`;
}

function locationParts(value: unknown) {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const address = record.address && typeof record.address === "object"
    ? record.address as Record<string, unknown>
    : {};
  const country = address.addressCountry && typeof address.addressCountry === "object"
    ? clean((address.addressCountry as Record<string, unknown>).name)
    : clean(address.addressCountry);
  return {
    venue: safeMetadata(record.name, 120),
    city: safeMetadata(address.addressLocality, 80),
    region: safeMetadata(address.addressRegion, 80),
    country: safeMetadata(country, 80),
  };
}

function validIso(value: unknown) {
  const text = clean(value);
  const parsed = new Date(text);
  return text && Number.isFinite(parsed.getTime()) ? parsed.toISOString() : "";
}

function canonicalUfcLocation(event: NormalizedUfcEvent) {
  const city = safeMetadata(event.city, 80);
  const region = safeMetadata(event.region, 80);
  const country = safeMetadata(event.country, 80);
  const preserveTwoLetterRegion = /^(?:US|USA|United States(?: of America)?|CA|CAN|Canada)$/i.test(country);
  const terseInternationalRegion = Boolean(city && country && /^[A-Z]{2}$/.test(region) && !preserveTwoLetterRegion);
  return safeMetadata([city, terseInternationalRegion ? "" : region, country].filter(Boolean).join(", "), 180);
}

export function canonicalUfcEventFields(event: NormalizedUfcEvent) {
  const number = event.eventNumber || eventNumber(event.eventName);
  const name = safeEventName(event.eventName, number);
  const headliners = event.headliners.map(canonicalFighterDisplay).filter(Boolean);
  const venue = safeMetadata(event.venue, 120);
  const location = canonicalUfcLocation(event);
  const startsAt = validIso(event.startsAt);
  const sourceEventKey = safeMetadata(event.canonicalEventKey, 180);

  if (!name || headliners.length !== 2 || !startsAt || !sourceEventKey) {
    throw new Error("Official UFC metadata did not produce a safe canonical event identity.");
  }

  const subtitle = `${headliners[0]} vs. ${headliners[1]}`;
  const date = startsAt.slice(0, 10);
  return {
    source_event_key: sourceEventKey,
    event_id: normalizeText(`${name} ${subtitle} ${date}`).replace(/\s+/g, "-"),
    name,
    subtitle,
    venue,
    location,
    starts_at: startsAt,
    locks_at: startsAt,
    season: Number(date.slice(0, 4)),
  };
}

/** UFC owns identity. Structured data wins, then official metadata and canonical parser fallbacks. */
export function adaptUfcSource(
  html: string,
  canonicalUrl: string,
  fallback: { name: string; subtitle: string; starts_at: string; venue: string; location: string; source_event_key: string },
): NormalizedUfcEvent {
  const $ = cheerio.load(html);
  const structured = jsonLd($);
  const evidence: string[] = [];
  const event = structured.find((item: Record<string, unknown>) => /event/i.test(clean(item["@type"]))) ?? {};
  if (Object.keys(event).length) evidence.push("json-ld:Event");

  const embedded = $("script[type='application/json'],script#__NEXT_DATA__").map((_: number, element: HtmlElement) => $(element).text()).get().join(" ");
  if (embedded) evidence.push("embedded-page-state");
  const pageTitle = first(metaContent($, "meta[property='og:title']"), $("title").first().text());
  const description = first(
    metaContent($, "meta[property='og:description']"),
    metaContent($, "meta[name='description']"),
  );
  const dataFightLabel = clean($("[data-fight-label]").first().attr("data-fight-label"));
  const subtitle = first(
    versusLabel(dataFightLabel),
    versusLabel(pageTitle),
    versusLabel(description),
    versusLabel(fallback.subtitle),
  );
  const rawName = first(event.name, $("[data-event-name]").attr("data-event-name"), pageTitle, fallback.name, $("h1").first().text());
  const number = eventNumber(`${rawName} ${pageTitle} ${subtitle} ${embedded}`);
  const name = safeEventName(rawName, number);
  const descriptionPlace = ufcPlaceFromDescription(description);
  const structuredPlace = locationParts(event.location);
  const fallbackVenue = safeMetadata(fallback.venue, 120);
  const fallbackLocation = safeMetadata(fallback.location, 180);
  const venue = first(
    structuredPlace.venue,
    safeMetadata(descriptionPlace.venue, 120),
    fallbackVenue,
  );
  const descriptionLocation = safeMetadata(descriptionPlace.location, 180);
  const fallbackParts = first(descriptionLocation, fallbackLocation).split(",").map((part) => safeMetadata(part, 80)).filter(Boolean);
  const city = first(structuredPlace.city, fallbackParts[0]);
  const country = first(structuredPlace.country, fallbackParts.at(-1));
  const region = first(structuredPlace.region, fallbackParts.length > 2 ? fallbackParts[1] : "");
  const startsAt = first(validIso(event.startDate), validIso(fallback.starts_at));
  const localEventDate = startsAt.slice(0, 10)
    || explicitIsoDates(description)[0]
    || safeMetadata(fallback.starts_at.slice(0, 10), 10);
  const canonicalEventKey = safeMetadata(fallback.source_event_key, 180)
    || safeMetadata(new URL(canonicalUrl).pathname.replace(/^\/+|\/+$/g, ""), 180);

  evidence.push(
    name === safeEventName(fallback.name, number) ? "ufc-parser:event-name" : "structured:event-name",
    dataFightLabel && subtitle === versusLabel(dataFightLabel) ? "semantic:headliners" : "official-metadata:headliners",
    structuredPlace.venue || descriptionPlace.venue ? "official-metadata:venue" : "ufc-parser:venue",
    structuredPlace.city || descriptionPlace.location ? "official-metadata:location" : "ufc-parser:location",
  );

  return {
    canonicalEventKey,
    promotion: "UFC",
    eventType: number ? "numbered" : "fight-night",
    eventNumber: number,
    eventName: name,
    headliners: splitVersus(subtitle).slice(0, 2).map(canonicalFighterDisplay),
    startsAt,
    localEventDate,
    venue,
    city,
    region,
    country,
    canonicalUrl,
    extractionEvidence: evidence,
  };
}

/** MMA Mania owns sections/order. Publication dates remain isolated from explicit event dates. */
export function adaptMmaManiaSource(
  html: string,
  canonicalUrl: string,
  bouts: Bout[],
  cardSections: string[],
): NormalizedArticleEvent {
  const $ = cheerio.load(html);
  const structured = jsonLd($);
  const evidence: string[] = [];
  const article = structured.find((item: Record<string, unknown>) => /article|newsarticle/i.test(clean(item["@type"]))) ?? {};
  if (Object.keys(article).length) evidence.push("json-ld:Article");

  const title = first(
    article.headline,
    metaContent($, "meta[property='og:title']"),
    $("h1").first().text(),
    $("title").text(),
  );
  const description = first(
    metaContent($, "meta[property='og:description']"),
    metaContent($, "meta[name='description']"),
  );
  const publicationDates = [
    article.datePublished,
    article.dateModified,
    metaContent($, "meta[property='article:published_time']"),
    metaContent($, "meta[property='article:modified_time']"),
  ].map((value: unknown) => clean(value)).filter(Boolean);
  const lines: string[] = Array.from(new Set<string>([...semanticLines($), description].filter(Boolean)));
  const eventField = labeledField(lines, "Event");
  const dateField = labeledField(lines, "Date");
  const locationSignals = locationEvidence(lines);
  const mainEvent = bouts.find((bout) => bout.section === "main-event") ?? bouts[0];
  const fieldHeadliners = splitVersus(first(eventField, title)).slice(-2);
  const headliners = mainEvent
    ? [mainEvent.red_fighter_name, mainEvent.blue_fighter_name]
    : fieldHeadliners;
  const explicitEventDates = Array.from(new Set([
    ...explicitIsoDates(dateField),
    ...eventDateEvidence(lines),
  ]));
  const explicitEventName = first(
    eventField,
    title.match(/\bUFC\s+(?:\d{3,4}|Fight Night|[A-Z][\p{L}'’-]+)(?:\s*:\s*[^|–—]+)?/iu)?.[0],
  );

  evidence.push(
    $("article").length ? "semantic:article" : "visible:body",
    dateField ? "labeled:event-date" : "contextual:event-date",
    locationSignals.length ? "labeled-or-contextual:location" : "location:missing",
    mainEvent ? "section-parser:main-event-headliners" : "headline:headliners",
    `section-parser:${cardSections.join("|") || "none"}`,
  );

  return {
    canonicalUrl,
    articleTitle: title,
    explicitEventName,
    eventNumber: eventNumber(`${title} ${explicitEventName}`),
    headliners,
    explicitEventDates,
    publicationDates,
    venueSignals: locationSignals,
    locationSignals,
    cardSections: Array.from(new Set(cardSections)),
    bouts,
    extractionEvidence: evidence,
  };
}
