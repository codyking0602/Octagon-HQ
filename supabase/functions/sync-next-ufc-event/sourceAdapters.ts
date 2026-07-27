import * as cheerio from "npm:cheerio@1.0.0";
import { eventNumber, explicitIsoDates, normalizeText, splitVersus } from "./normalization.ts";
import type { NormalizedArticleEvent, NormalizedUfcEvent } from "./identityEngine.ts";

type Bout = NormalizedArticleEvent["bouts"][number];

function clean(value:unknown) { return String(value ?? "").replace(/\u00a0/g," ").replace(/\s+/g," ").trim(); }
function records(value:unknown):Record<string,unknown>[] { return Array.isArray(value) ? value.flatMap(records) : value && typeof value === "object" ? [value as Record<string,unknown>] : []; }
function jsonLd($:cheerio.CheerioAPI) {
  return $("script[type='application/ld+json']").map((_,el) => { try { return JSON.parse($(el).text()); } catch { return null; } }).get().flatMap(records);
}
function first(...values:unknown[]) { return values.map(clean).find(Boolean) ?? ""; }

/** UFC owns identity. Structured data wins, then embedded state/semantic attributes, then visible copy. */
export function adaptUfcSource(html:string, canonicalUrl:string, fallback:{name:string;subtitle:string;starts_at:string;venue:string;location:string;source_event_key:string}):NormalizedUfcEvent {
  const $=cheerio.load(html), structured=jsonLd($), evidence:string[]=[];
  const event=structured.find((item) => /event/i.test(clean(item["@type"]))) ?? {};
  if (Object.keys(event).length) evidence.push("json-ld:Event");
  const embedded=$("script[type='application/json'],script#__NEXT_DATA__").map((_,el)=>$(el).text()).get().join(" ");
  if (embedded) evidence.push("embedded-page-state");
  const visible=clean($("body").text());
  const name=first(event.name, $("[data-event-name]").attr("data-event-name"), fallback.name, $("h1").first().text());
  const subtitle=first($("[data-fight-label]").attr("data-fight-label"), fallback.subtitle, visible.match(/[A-Z][\p{L}'’-]+(?:\s+[A-Z][\p{L}'’-]+)*\s+(?:vs\.?|v\.?|versus)\s+[A-Z][\p{L}'’-]+(?:\s+[A-Z][\p{L}'’-]+)*/u)?.[0]);
  const number=eventNumber(`${name} ${subtitle} ${embedded}`), location=clean(fallback.location), parts=location.split(",").map(clean);
  evidence.push(name===fallback.name?"ufc-parser:event-name":"semantic:event-name", subtitle===fallback.subtitle?"ufc-parser:headliners":"visible:headliners");
  return { canonicalEventKey:fallback.source_event_key,promotion:"UFC",eventType:number?"numbered":"fight-night",eventNumber:number,eventName:name,headliners:splitVersus(subtitle).slice(0,2),startsAt:fallback.starts_at,localEventDate:fallback.starts_at.slice(0,10),venue:first((event.location as Record<string,unknown>)?.name,fallback.venue),city:parts[0]??"",region:parts.length>2?parts[1]??"":"",country:parts.at(-1)??"",canonicalUrl,extractionEvidence:evidence };
}

function eventDateCopy(text:string) {
  return text.split(/(?<=[.!?])\s+/).filter((part) => /\b(?:date\s*:|takes? place|scheduled|event (?:is )?(?:on|for))\b/i.test(part)).join(" ");
}

/** MMA Mania owns sections/order. Publication dates are intentionally isolated from event dates. */
export function adaptMmaManiaSource(html:string,canonicalUrl:string,bouts:Bout[],cardSections:string[]):NormalizedArticleEvent {
  const $=cheerio.load(html), structured=jsonLd($), evidence:string[]=[];
  const article=structured.find((item)=>/article|newsarticle/i.test(clean(item["@type"])))??{};
  if (Object.keys(article).length) evidence.push("json-ld:Article");
  const title=first(article.headline,$("meta[property='og:title']").attr("content"),$("h1").first().text(),$("title").text());
  const publicationDates=[article.datePublished,article.dateModified,$("meta[property='article:published_time']").attr("content"),$("meta[property='article:modified_time']").attr("content")].map(clean).filter(Boolean);
  const root=$("article").first().length?$("article").first():$("main").first(); const body=clean((root.length?root:$("body")).text());
  const explicitCopy=eventDateCopy(`${title}. ${body.slice(0,10000)}`); const explicitEventDates=explicitIsoDates(explicitCopy).filter((date)=>!publicationDates.some((published)=>published.startsWith(date)) || explicitCopy.includes(date));
  const explicitEventName=first(title.match(/\bUFC\s+(?:\d{3,4}|Fight Night)(?:\s*:\s*[^|–—]+)?/i)?.[0],body.match(/\bUFC\s+(?:\d{3,4}|Fight Night)(?:\s*:\s*[^.!?]+)?/i)?.[0]);
  const headline=first(title, explicitEventName); const names=splitVersus(headline).map((part)=>part.replace(/^.*?\b(?:UFC\s+\d{3,4}|Fight Night)\s*:?\s*/i,"")).slice(0,2);
  const locationSignals=[...body.matchAll(/\b(?:at|inside)\s+([^.!?]{3,100})/gi)].slice(0,4).map((match)=>clean(match[1]));
  evidence.push($("article").length?"semantic:article":"visible:body",`section-parser:${cardSections.join("|")||"none"}`);
  return {canonicalUrl,articleTitle:title,explicitEventName,eventNumber:eventNumber(`${title} ${explicitEventName}`),headliners:names,explicitEventDates,publicationDates,venueSignals:locationSignals,locationSignals,cardSections,bouts,extractionEvidence:evidence};
}
