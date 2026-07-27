import * as cheerio from "npm:cheerio@1.0.0";
import { eventNumber, explicitIsoDates, splitVersus } from "./normalization.ts";
import type { NormalizedArticleEvent, NormalizedUfcEvent } from "./identityEngine.ts";

type Bout = NormalizedArticleEvent["bouts"][number];

function clean(value: unknown) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function records(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(records);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  return [record, ...records(record["@graph"])];
}

function jsonLd($: cheerio.CheerioAPI) {
  return $("script[type='application/ld+json']").map((_, element) => {
    try {
      return JSON.parse($(element).text());
    } catch {
      return null;
    }
  }).get().flatMap(records);
}

function first(...values: unknown[]) {
  return values.map(clean).find(Boolean) ?? "";
}

function metaContent($: cheerio.CheerioAPI, selector: string) {
  return clean($(selector).first().attr("content"));
}

function semanticLines($: cheerio.CheerioAPI) {
  const root = $("article").first().length
    ? $("article").first()
    : $(".c-entry-content, .article-body, main").first();
  const scope = root.length ? root : $("body");
  const lines = scope.find("h1,h2,h3,h4,h5,h6,p,li,td").get().flatMap((element) => {
    const clone = $(element).clone();
    clone.find("br").replaceWith("\n");
    return clone.text().split(/\n+/).map(clean).filter(Boolean);
  });
  const unique = Array.from(new Set(lines));
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

function versusLabel(value: string) {
  const text = clean(value);
  if (!text) return "";
  const colonTail = text.includes(":") ? text.slice(text.lastIndexOf(":") + 1) : text;
  const candidate = clean(colonTail.split(/\s*\|\s*|,\s*(?:Live|From|On|at)\b/i)[0]);
  const parts = splitVersus(candidate);
  if (parts.length !== 2 || parts.some((part) => part.length < 2 || part.length > 80)) return "";
  return `${parts[0]} vs ${parts[1]}`;
}

function ufcPlaceFromDescription(value: string) {
  const text = clean(value);
  const withLocation = text.match(/\bLive\s+From\s+(.{2,120}?)\s+In\s+(.{2,120}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  if (withLocation) return { venue: clean(withLocation[1]), location: clean(withLocation[2]) };
  const venueOnly = text.match(/\bLive\s+From\s+(.{2,160}?)\s+On\s+(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}/i);
  return venueOnly ? { venue: clean(venueOnly[1]), location: "" } : { venue: "", location: "" };
}

function reasonableLocation(value: string) {
  const text = clean(value);
  return text && text.length <= 160 && !/<|iframe|skip to main|main content/i.test(text) ? text : "";
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
  const event = structured.find((item) => /event/i.test(clean(item["@type"]))) ?? {};
  if (Object.keys(event).length) evidence.push("json-ld:Event");

  const embedded = $("script[type='application/json'],script#__NEXT_DATA__").map((_, element) => $(element).text()).get().join(" ");
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
  const name = first(event.name, $("[data-event-name]").attr("data-event-name"), fallback.name, $("h1").first().text());
  const number = eventNumber(`${name} ${pageTitle} ${subtitle} ${embedded}`);
  const place = ufcPlaceFromDescription(description);
  const eventLocation = event.location && typeof event.location === "object" ? event.location as Record<string, unknown> : {};
  const venue = first(eventLocation.name, place.venue, fallback.venue);
  const location = first(place.location, reasonableLocation(fallback.location));
  const parts = location.split(",").map(clean).filter(Boolean);
  const structuredStart = first(event.startDate);
  const localEventDate = structuredStart.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0]
    ?? explicitIsoDates(description)[0]
    ?? fallback.starts_at.slice(0, 10);

  evidence.push(
    name === fallback.name ? "ufc-parser:event-name" : "structured:event-name",
    dataFightLabel && subtitle === versusLabel(dataFightLabel) ? "semantic:headliners" : "official-metadata:headliners",
    place.venue ? "official-metadata:venue" : "ufc-parser:venue",
    place.location ? "official-metadata:location" : "ufc-parser:location",
  );

  return {
    canonicalEventKey: fallback.source_event_key,
    promotion: "UFC",
    eventType: number ? "numbered" : "fight-night",
    eventNumber: number,
    eventName: name,
    headliners: splitVersus(subtitle).slice(0, 2),
    startsAt: fallback.starts_at,
    localEventDate,
    venue,
    city: parts[0] ?? "",
    region: parts.length > 2 ? parts[1] ?? "" : "",
    country: parts.at(-1) ?? "",
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
  const article = structured.find((item) => /article|newsarticle/i.test(clean(item["@type"]))) ?? {};
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
  ].map(clean).filter(Boolean);
  const lines = Array.from(new Set([...semanticLines($), description].filter(Boolean)));
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
