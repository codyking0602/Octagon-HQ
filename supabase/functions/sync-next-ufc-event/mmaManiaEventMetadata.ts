import { canonicalFighterDisplay, eventNumber, explicitIsoDates, normalizeText } from "./normalization.ts";

export interface MmaManiaMainEvent {
  red_fighter_name: string;
  blue_fighter_name: string;
}

export interface MmaManiaEventMetadata {
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

const zoneNames: Record<string, string> = {
  ET: "America/New_York",
  CT: "America/Chicago",
  MT: "America/Denver",
  PT: "America/Los_Angeles",
};

const fixedOffsets: Record<string, string> = {
  EDT: "-04:00", EST: "-05:00",
  CDT: "-05:00", CST: "-06:00",
  MDT: "-06:00", MST: "-07:00",
  PDT: "-07:00", PST: "-08:00",
  UTC: "+00:00", GMT: "+00:00",
};

function clean(value: unknown) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function labeledField(text: string, labelPattern: string) {
  const boundary = String.raw`(?:Event|Date|Location|Broadcast|Streaming\s+platform|Start\s*times?)\s*:`;
  const label = text.match(new RegExp(String.raw`${labelPattern}\s*:\s*`, "i"));
  if (!label || label.index === undefined) return "";
  const remainder = text.slice(label.index + label[0].length);
  const nextBoundary = remainder.match(new RegExp(boundary, "i"));
  const end = nextBoundary?.index ?? Math.min(remainder.length, 420);
  return clean(remainder.slice(0, end));
}

function locationParts(value: string) {
  const text = clean(value);
  if (!text) return { venue: "", location: "" };

  const inMatch = text.match(/^(.{2,140}?)\s+in\s+(.{2,180})$/i);
  if (inMatch) {
    return { venue: clean(inMatch[1]), location: clean(inMatch[2]) };
  }

  const parts = text.split(",").map(clean).filter(Boolean);
  const venueLike = /\b(?:arena|center|centre|stadium|apex|garden|dome|pavilion|hall|forum|theater|theatre)\b/i;
  if (parts.length >= 2 && venueLike.test(parts[0]!)) {
    return { venue: parts[0]!, location: parts.slice(1).join(", ") };
  }
  return { venue: "", location: text };
}

function clockParts(value: RegExpMatchArray) {
  let hour = Number(value[1]) % 12;
  const minute = Number(value[2] || "0");
  if (value[3]?.toUpperCase() === "P") hour += 12;
  return { hour, minute, zone: String(value[4] ?? "").toUpperCase() };
}

function fixedOffsetIso(localEventDate: string, hour: number, minute: number, offset: string) {
  const parsed = new Date(`${localEventDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00${offset}`);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : "";
}

function zonedIso(localEventDate: string, hour: number, minute: number, timeZone: string) {
  const [year, month, day] = localEventDate.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return "";
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

function clockIso(localEventDate: string, match: RegExpMatchArray) {
  const { hour, minute, zone } = clockParts(match);
  const fixed = fixedOffsets[zone];
  if (fixed) return fixedOffsetIso(localEventDate, hour, minute, fixed);
  const timeZone = zoneNames[zone];
  return timeZone ? zonedIso(localEventDate, hour, minute, timeZone) : "";
}

function nearestLabelDistance(text: string, index: number, pattern: RegExp) {
  let best = Number.POSITIVE_INFINITY;
  for (const match of text.matchAll(pattern)) {
    if (match.index === undefined) continue;
    const distance = Math.abs(match.index - index);
    if (distance < best) best = distance;
  }
  return best;
}

function segmentTimes(value: string, localEventDate: string) {
  const text = clean(value);
  const clock = /\b(\d{1,2})(?::(\d{2}))?\s*([AP])\.?\s*M\.?\s+([A-Z]{2,5})\b/gi;
  const main = new Set<string>();
  const prelims = new Set<string>();

  const classify = (segment: string) => {
    if (/\bearly\s+prelims?\b/i.test(segment)) return;
    const hasMain = /\bmain\s+card\b/i.test(segment);
    const hasPrelims = /\bprelims?\b/i.test(segment);
    const matches = [...segment.matchAll(clock)];
    for (const match of matches) {
      if (match.index === undefined) continue;
      const instant = clockIso(localEventDate, match);
      if (!instant) continue;
      if (hasMain && !hasPrelims) {
        main.add(instant);
        continue;
      }
      if (hasPrelims && !hasMain) {
        prelims.add(instant);
        continue;
      }
      const mainDistance = nearestLabelDistance(segment, match.index, /\bmain\s+card\b/gi);
      const prelimDistance = nearestLabelDistance(segment, match.index, /\bprelims?\b/gi);
      const distance = Math.min(mainDistance, prelimDistance);
      if (!Number.isFinite(distance) || distance > 110) continue;
      if (mainDistance < prelimDistance) main.add(instant);
      else if (prelimDistance < mainDistance) prelims.add(instant);
    }
  };

  const sections = text.split(/\s*\|\s*/).map(clean).filter(Boolean);
  if (sections.length > 1) sections.forEach(classify);
  else classify(text);

  if (main.size !== 1) throw new Error("MMA Mania did not provide one unambiguous Main Card start time.");
  if (prelims.size > 1) throw new Error("MMA Mania returned contradictory Prelims start times.");
  return {
    mainCardStartsAt: [...main][0]!,
    prelimsStartsAt: [...prelims][0] ?? "",
  };
}

function eventName(eventLabel: string, number: string) {
  if (number) return `UFC ${number}`;
  const noche = eventLabel.match(/\bNoche\s+UFC(?:\s+\d+)?\b/i)?.[0];
  if (noche) return clean(noche).replace(/^noche/i, "Noche").replace(/ufc/i, "UFC");
  const whiteHouse = eventLabel.match(/\bUFC\s+White\s+House(?:\s+\d+)?\b/i)?.[0];
  if (whiteHouse) return clean(whiteHouse).replace(/ufc/i, "UFC");
  return "UFC Fight Night";
}

export function parseMmaManiaEventMetadata(input: {
  sourceUrl: string;
  articleText: string;
  mainEvent: MmaManiaMainEvent;
  sourceEventKeyOverride?: string;
}): MmaManiaEventMetadata {
  const articleText = clean(input.articleText);
  const eventLabel = labeledField(articleText, "Event");
  if (!eventLabel || !/\bufc\b/i.test(eventLabel)) {
    throw new Error("MMA Mania did not provide a labeled UFC event identity.");
  }

  const dateLabel = labeledField(articleText, "Date");
  const dates = explicitIsoDates(dateLabel);
  if (dates.length !== 1) {
    throw new Error("MMA Mania did not provide one explicit event date.");
  }
  const localEventDate = dates[0]!;

  const timeLabel = labeledField(articleText, "Start\\s*times?");
  if (!timeLabel) throw new Error("MMA Mania did not provide labeled card start times.");
  const times = segmentTimes(timeLabel, localEventDate);

  const number = eventNumber(eventLabel);
  const type: MmaManiaEventMetadata["eventType"] = number ? "numbered" : "fight-night";
  if (type === "numbered" && !times.prelimsStartsAt) {
    throw new Error("MMA Mania did not provide a numbered-event Prelims start time.");
  }

  const red = canonicalFighterDisplay(input.mainEvent.red_fighter_name);
  const blue = canonicalFighterDisplay(input.mainEvent.blue_fighter_name);
  if (!red || !blue) throw new Error("MMA Mania did not provide a safe main-event pairing.");
  const subtitle = `${red} vs. ${blue}`;
  const name = eventName(eventLabel, number);

  const sourceUrl = new URL(input.sourceUrl);
  if (!/(?:^|\.)mmamania\.com$/i.test(sourceUrl.hostname)) {
    throw new Error("MMA Mania event metadata requires an MMA Mania article URL.");
  }
  const sourceEventKey = clean(input.sourceEventKeyOverride)
    || sourceUrl.pathname.replace(/^\/+|\/+$/g, "");
  if (!sourceEventKey) throw new Error("MMA Mania did not produce a stable event identity.");

  const place = locationParts(labeledField(articleText, "Location"));
  const startsAt = times.mainCardStartsAt;
  const eventIdDate = startsAt.slice(0, 10);
  const eventId = normalizeText(`${name} ${subtitle} ${eventIdDate}`).replace(/\s+/g, "-");

  return {
    source_event_key: sourceEventKey,
    event_id: eventId,
    name,
    subtitle,
    venue: place.venue,
    location: place.location,
    starts_at: startsAt,
    prelims_starts_at: type === "numbered" ? times.prelimsStartsAt : "",
    locks_at: startsAt,
    season: Number(eventIdDate.slice(0, 4)),
    eventType: type,
    localEventDate,
  };
}