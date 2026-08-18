import {
  canonicalFightPair,
  canonicalFighterDisplay,
  eventNumber,
  fighterMatch,
  normalizeText,
  splitVersus,
} from "./normalization.ts";
import type { CardSection } from "./importPolicy.ts";

export interface ParsedCbsSportsBout {
  section: CardSection;
  weight_class: string;
  red_fighter_name: string;
  blue_fighter_name: string;
}

export interface CbsSportsCard {
  sourceUrl: string;
  bouts: ParsedCbsSportsBout[];
  usedSectionHeadings: boolean;
}

export interface CbsSportsEventMetadata {
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

export interface CbsSportsEventCandidate {
  card: CbsSportsCard;
  metadata: CbsSportsEventMetadata;
}

const monthNumbers: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const clean = (value: unknown) => String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    quot: '"',
    nbsp: " ",
    ndash: "–",
    mdash: "—",
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
      .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6])\b[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ));
}

interface ElementRange {
  text: string;
  start: number;
  end: number;
  raw: string;
  attrs: string;
}

function elementRanges(html: string, tag: "h1" | "h2" | "h3" | "a") {
  const ranges: ElementRange[] = [];
  const pattern = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) {
    ranges.push({
      text: visibleText(match[2] ?? ""),
      start: match.index,
      end: pattern.lastIndex,
      raw: match[0],
      attrs: match[1] ?? "",
    });
  }
  return ranges;
}

function classifySection(value: string): "main" | "prelim" | "early-prelim" | null {
  const heading = clean(value).toLowerCase();
  if (/^early\s+prelims?$/.test(heading)) return "early-prelim";
  if (/^prelims?$/.test(heading)) return "prelim";
  if (/^main\s+card$/.test(heading)) return "main";
  return null;
}

function fighterNamesFromFightHtml(html: string) {
  const names: string[] = [];
  const identities = new Set<string>();
  for (const anchor of elementRanges(html, "a")) {
    const href = anchor.attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
    if (!/\/ufc\/fighter\//i.test(href)) continue;
    const name = canonicalFighterDisplay(anchor.text);
    const identity = normalizeText(name);
    if (!identity || identities.has(identity)) continue;
    identities.add(identity);
    names.push(name);
  }
  return names;
}

function weightClassFromHeading(value: string) {
  return clean(value.replace(/\s+Bout\b[\s\S]*$/i, ""));
}

/** Parses only CBS Sports' explicit UFC card section and fighter-link markup. */
export function parseCbsSportsCard(html: string, sourceUrl: string): CbsSportsCard {
  const bouts: ParsedCbsSportsBout[] = [];
  const seen = new Set<string>();
  const sections = elementRanges(html, "h2")
    .map((heading) => ({ ...heading, section: classifySection(heading.text) }))
    .filter((heading): heading is ElementRange & { section: "main" | "prelim" | "early-prelim" } => Boolean(heading.section));

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const section = sections[sectionIndex]!;
    const end = sections[sectionIndex + 1]?.start ?? html.length;
    const sectionHtml = html.slice(section.end, end);
    const fights = elementRanges(sectionHtml, "h3").filter((heading) => /\bBout\b/i.test(heading.text));

    for (let fightIndex = 0; fightIndex < fights.length; fightIndex += 1) {
      const heading = fights[fightIndex]!;
      const fightEnd = fights[fightIndex + 1]?.start ?? sectionHtml.length;
      const fightHtml = sectionHtml.slice(heading.end, fightEnd);
      if (/\b(?:cancelled|canceled|postponed|scrapped)\b/i.test(visibleText(fightHtml))) continue;
      const fighters = fighterNamesFromFightHtml(fightHtml);
      if (fighters.length !== 2) continue;
      const pair = canonicalFightPair(fighters[0]!, fighters[1]!);
      if (!pair || seen.has(pair)) continue;
      seen.add(pair);
      bouts.push({
        section: section.section === "main"
          ? (/\bMain\s+Event\b/i.test(heading.text) ? "main-event" : "main")
          : section.section,
        weight_class: weightClassFromHeading(heading.text),
        red_fighter_name: fighters[0]!,
        blue_fighter_name: fighters[1]!,
      });
    }
  }

  if (!bouts.some((bout) => bout.section === "main-event")) {
    const firstMain = bouts.find((bout) => bout.section === "main");
    if (firstMain) firstMain.section = "main-event";
  }

  return { sourceUrl, bouts, usedSectionHeadings: sections.length > 0 };
}

function eventDateFromSourceUrl(sourceUrl: string) {
  const path = new URL(sourceUrl).pathname.replace(/\/+$/, "");
  const match = path.match(/-(january|february|march|april|may|june|july|august|september|october|november|december)-(\d{1,2})-(20\d{2})$/i);
  if (!match) return "";
  const month = monthNumbers[match[1]!.toLowerCase()];
  if (!month) return "";
  return `${match[3]}-${String(month).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
}

function zonedIso(localEventDate: string, hour: number, minute: number, timeZone: string) {
  const [year, month, day] = localEventDate.split("-").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return "";
  const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = desired;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const values = Object.fromEntries(
      formatter.formatToParts(new Date(guess))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
    const represented = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    );
    if (!Number.isFinite(represented)) return "";
    const correction = desired - represented;
    guess += correction;
    if (correction === 0) break;
  }
  return new Date(guess).toISOString();
}

function segmentTimes(headerText: string, localEventDate: string) {
  const main = new Set<string>();
  const prelims = new Set<string>();
  for (const match of headerText.matchAll(/\b(\d{1,2}):(\d{2})\s*(am|pm)\s+ET\s+(Prelims|Main Card)\b/gi)) {
    let hour = Number(match[1]) % 12;
    if (match[3]!.toLowerCase() === "pm") hour += 12;
    const instant = zonedIso(localEventDate, hour, Number(match[2]), "America/New_York");
    if (!instant) continue;
    if (/prelim/i.test(match[4]!)) prelims.add(instant);
    else main.add(instant);
  }
  if (main.size !== 1) throw new Error("CBS Sports did not provide one unambiguous Main Card start time.");
  if (prelims.size > 1) throw new Error("CBS Sports returned contradictory Prelims start times.");
  return { mainCardStartsAt: [...main][0]!, prelimsStartsAt: [...prelims][0] ?? "" };
}

function eventHeader(html: string) {
  const headings = elementRanges(html, "h1").filter((heading) => /\bUFC\b/i.test(heading.text));
  const heading = headings[0];
  if (!heading) return { title: "", details: "" };
  const nextH2 = elementRanges(html.slice(heading.end), "h2")[0];
  const detailsEnd = nextH2 ? heading.end + nextH2.start : Math.min(html.length, heading.end + 8_000);
  return { title: heading.text, details: visibleText(html.slice(heading.end, detailsEnd)) };
}

function eventPlace(headerDetails: string) {
  const timeIndex = headerDetails.search(/\b\d{1,2}:\d{2}\s*(?:am|pm)\s+ET\b/i);
  const place = clean(timeIndex >= 0 ? headerDetails.slice(0, timeIndex) : headerDetails);
  if (!place) return { venue: "", location: "" };
  const venueMatch = place.match(/^(.+?\b(?:Arena|Center|Centre|Stadium|APEX|Garden|Dome|Pavilion|Hall|Forum|Theater|Theatre|Coliseum|Fieldhouse|Palace))\s+(.+)$/i);
  if (venueMatch) return { venue: clean(venueMatch[1]), location: clean(venueMatch[2]) };
  return { venue: "", location: place };
}

function eventName(title: string, number: string) {
  if (number) return `UFC ${number}`;
  const prefix = clean(title.split(":")[0] ?? "");
  if (/^Noche\s+UFC\b/i.test(prefix)) return prefix.replace(/^noche/i, "Noche").replace(/ufc/i, "UFC");
  if (/^UFC\s+White\s+House\b/i.test(prefix)) return prefix.replace(/^ufc/i, "UFC");
  return "UFC Fight Night";
}

function orderedSubtitle(title: string, mainEvent: ParsedCbsSportsBout) {
  const fullNames = [mainEvent.red_fighter_name, mainEvent.blue_fighter_name];
  const titleSubtitle = clean(title.split(":").slice(1).join(":"));
  const abbreviated = splitVersus(titleSubtitle);
  if (abbreviated.length === 2) {
    const firstMatches = fullNames.filter((name) => fighterMatch(abbreviated[0]!, name));
    const secondMatches = fullNames.filter((name) => fighterMatch(abbreviated[1]!, name));
    if (firstMatches.length === 1 && secondMatches.length === 1 && firstMatches[0] !== secondMatches[0]) {
      return `${firstMatches[0]} vs. ${secondMatches[0]}`;
    }
  }
  return `${mainEvent.red_fighter_name} vs. ${mainEvent.blue_fighter_name}`;
}

/** Parses one exact CBS Sports UFC event page into the canonical source contract. */
export function parseCbsSportsEventPage(
  html: string,
  sourceUrl: string,
  sourceEventKeyOverride = "",
): CbsSportsEventCandidate {
  const url = new URL(sourceUrl);
  if (!/(?:^|\.)cbssports\.com$/i.test(url.hostname) || !/^\/ufc\/event\/\d+\//i.test(url.pathname)) {
    throw new Error("CBS Sports event parsing requires an exact CBS UFC event URL.");
  }

  const card = parseCbsSportsCard(html, sourceUrl);
  if (!card.usedSectionHeadings || card.bouts.length < 4 || card.bouts.length > 20) {
    throw new Error(`CBS Sports did not provide a plausible sectioned UFC card (${card.bouts.length} fights).`);
  }
  const mainEvent = card.bouts.find((bout) => bout.section === "main-event");
  if (!mainEvent) throw new Error("CBS Sports did not provide a main event.");

  const header = eventHeader(html);
  if (!header.title || !/\bUFC\b/i.test(header.title)) throw new Error("CBS Sports did not provide a UFC event title.");
  const localEventDate = eventDateFromSourceUrl(sourceUrl);
  if (!localEventDate) throw new Error("CBS Sports event URL did not provide one explicit event date.");
  const times = segmentTimes(header.details, localEventDate);
  const number = eventNumber(header.title);
  const eventType: CbsSportsEventMetadata["eventType"] = number ? "numbered" : "fight-night";
  if (eventType === "numbered" && !times.prelimsStartsAt) {
    throw new Error("CBS Sports did not provide a numbered-event Prelims start time.");
  }

  const sourceId = url.pathname.match(/^\/ufc\/event\/(\d+)\//i)?.[1] ?? "";
  const sourceEventKey = clean(sourceEventKeyOverride) || (sourceId ? `cbs:${sourceId}` : "");
  if (!sourceEventKey) throw new Error("CBS Sports did not provide a stable event identity.");
  const name = eventName(header.title, number);
  const subtitle = orderedSubtitle(header.title, mainEvent);
  const place = eventPlace(header.details);
  const startsAt = eventType === "numbered" ? times.prelimsStartsAt : times.mainCardStartsAt;
  const eventId = normalizeText(`${name} ${subtitle} ${startsAt.slice(0, 10)}`).replace(/\s+/g, "-");

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
      season: Number(localEventDate.slice(0, 4)),
      eventType,
      localEventDate,
    },
  };
}
