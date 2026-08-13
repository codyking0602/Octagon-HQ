export type CardScope = "auto" | "main" | "full";
export type EffectiveScope = "main" | "full";
export type CardSection = "main-event" | "main" | "prelim" | "early-prelim";
export type CardSegment = "main" | "prelim";

export interface SectionedBout {
  section: CardSection;
}

export interface SequencedBoutMetadata {
  card_segment: CardSegment;
  segment_sequence: number;
}

export interface OfficialUfcSegmentTimes {
  mainCardStartsAt: string;
  prelimsStartsAt: string;
  localEventDate: string;
}

/**
 * MMA Mania fight rows are terse matchup labels. Sectioned prose can also
 * contain "vs.", so fail closed on sentence/prompt signals before the card
 * parser attempts to split fighter names. Legitimate fight-list rows may carry
 * odds/preview/prediction suffixes, which the canonical parser already strips.
 */
export function isMmaManiaFightListRow(value: string) {
  const line = clean(value);
  if (!line || line.length > 220 || /[?!]/.test(line)) return false;
  if (!/\s+(?:vs\.?|v\.)\s+/i.test(line)) return false;

  const weightPrefix = /^\d{3}\s*(?:lbs?\.?|pounds?)\s*:\s*/i;
  const matchupLabel = line.replace(weightPrefix, "");
  if (/\b(?:poll|vote|voting|prop|question|over\s+or\s+under|pick['’]?em)\b/i.test(matchupLabel)) return false;
  if (/^(?:who|what|when|where|why|how|will|would|can|could|should|does|do|did|is|are|was|were)\b/i.test(matchupLabel)) return false;
  if (!weightPrefix.test(line) && /\b(?:prediction|predict|preview|odds|live\s+stream)\b/i.test(matchupLabel)) return false;
  return true;
}

const monthNumbers: Record<string, string> = {
  jan: "01", january: "01",
  feb: "02", february: "02",
  mar: "03", march: "03",
  apr: "04", april: "04",
  may: "05",
  jun: "06", june: "06",
  jul: "07", july: "07",
  aug: "08", august: "08",
  sep: "09", sept: "09", september: "09",
  oct: "10", october: "10",
  nov: "11", november: "11",
  dec: "12", december: "12",
};

const fixedOffsets: Record<string, string> = {
  EDT: "-04:00", EST: "-05:00",
  CDT: "-05:00", CST: "-06:00",
  MDT: "-06:00", MST: "-07:00",
  PDT: "-07:00", PST: "-08:00",
  GMT: "+00:00", UTC: "+00:00",
  BST: "+01:00", CET: "+01:00", CEST: "+02:00",
  JST: "+09:00", KST: "+09:00",
  AEST: "+10:00", AEDT: "+11:00",
  NZST: "+12:00", NZDT: "+13:00",
};

function clean(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function referenceYear(referenceIso: string, now: Date) {
  const reference = new Date(referenceIso);
  return Number.isFinite(reference.getTime()) ? reference.getUTCFullYear() : now.getUTCFullYear();
}

function localDateParts(text: string, year: number) {
  const match = text.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:day)?\s*,?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})\b/i)
    ?? text.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})\b/i);
  if (!match) return null;
  const month = monthNumbers[match[1]!.toLowerCase()];
  if (!month) return null;
  const day = match[2]!.padStart(2, "0");
  return {
    localEventDate: `${year}-${month}-${day}`,
  };
}

function timeAfterLabel(text: string, label: "Main Card" | "Prelims") {
  const lower = text.toLowerCase();
  const needle = label.toLowerCase();
  const values: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const index = lower.indexOf(needle, cursor);
    if (index < 0) break;
    cursor = index + needle.length;
    if (label === "Prelims" && /early\s*$/.test(lower.slice(Math.max(0, index - 12), index))) continue;

    const snippet = text.slice(cursor, cursor + 120);
    const match = snippet.match(/\b(\d{1,2}):(\d{2})\s*([AP]M)\s+([A-Z]{2,5})\b/i);
    if (!match || match.index === undefined) continue;
    const nextSegmentLabel = snippet.search(/\b(?:Early Prelims|Prelims|Main Card)\b/i);
    if (nextSegmentLabel >= 0 && nextSegmentLabel < match.index) continue;
    values.push(`${match[1]}:${match[2]} ${match[3].toUpperCase()} ${match[4].toUpperCase()}`);
  }

  return Array.from(new Set(values));
}

function offsetMinutes(value: string) {
  const zone = value.match(/\b([A-Z]{2,5})$/)?.[1] ?? "";
  const offset = fixedOffsets[zone];
  const match = offset?.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!match) return null;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

function localDateFromOfficialTimestamp(referenceIso: string, text: string) {
  const reference = new Date(referenceIso);
  if (!Number.isFinite(reference.getTime())) return null;
  const offsets = Array.from(new Set(
    timeAfterLabel(text, "Main Card")
      .map(offsetMinutes)
      .filter((value): value is number => value !== null),
  ));
  if (offsets.length !== 1) return null;
  const local = new Date(reference.getTime() + offsets[0]! * 60_000);
  return {
    localEventDate: [
      local.getUTCFullYear(),
      String(local.getUTCMonth() + 1).padStart(2, "0"),
      String(local.getUTCDate()).padStart(2, "0"),
    ].join("-"),
  };
}

function toIso(localEventDate: string, value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s+([AP]M)\s+([A-Z]{2,5})$/);
  if (!match) return "";
  const offset = fixedOffsets[match[4]!];
  if (!offset) return "";
  let hour = Number(match[1]) % 12;
  if (match[3] === "PM") hour += 12;
  const parsed = new Date(`${localEventDate}T${String(hour).padStart(2, "0")}:${match[2]}:00${offset}`);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : "";
}

function singleLabeledTime(text: string, label: "Main Card" | "Prelims", localEventDate: string) {
  const values = timeAfterLabel(text, label);
  const instants = Array.from(new Set(values.map((value) => toIso(localEventDate, value)).filter(Boolean)));
  if (instants.length > 1) {
    throw new Error(`Official UFC ${label} times are contradictory.`);
  }
  return instants[0] ?? "";
}

function topLineMainCardTime(text: string, localEventDate: string) {
  const match = text.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:day)?\s*,?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}\s*\/\s*(\d{1,2}):(\d{2})\s*([AP]M)\s+([A-Z]{2,5})(?:\s*\/\s*Main Card)?/i);
  if (!match) return "";
  return toIso(localEventDate, `${match[1]}:${match[2]} ${match[3].toUpperCase()} ${match[4].toUpperCase()}`);
}

export function parseOfficialUfcSegmentTimes(
  visibleText: string,
  referenceIso: string,
  requirePrelims: boolean,
  now = new Date(),
): OfficialUfcSegmentTimes {
  const text = clean(visibleText);
  const date = localDateParts(text, referenceYear(referenceIso, now))
    ?? localDateFromOfficialTimestamp(referenceIso, text);
  if (!date) throw new Error("Official UFC event date was not labeled safely.");

  const labeledMain = singleLabeledTime(text, "Main Card", date.localEventDate);
  const topLineMain = topLineMainCardTime(text, date.localEventDate);
  if (labeledMain && topLineMain && labeledMain !== topLineMain) {
    throw new Error("Official UFC Main Card times are contradictory.");
  }
  const mainCardStartsAt = labeledMain || topLineMain;
  if (!mainCardStartsAt) throw new Error("Official UFC Main Card time was not labeled safely.");

  const prelimsStartsAt = singleLabeledTime(text, "Prelims", date.localEventDate);
  if (requirePrelims && !prelimsStartsAt) {
    throw new Error("Official UFC Prelims time was not labeled safely.");
  }
  if (prelimsStartsAt && new Date(prelimsStartsAt).getTime() >= new Date(mainCardStartsAt).getTime()) {
    throw new Error("Official UFC Prelims time must precede the Main Card time.");
  }

  return {
    mainCardStartsAt,
    prelimsStartsAt: requirePrelims ? prelimsStartsAt : "",
    localEventDate: date.localEventDate,
  };
}

export function resolveImportedCardScope(
  name: string,
  subtitle: string,
  requested: CardScope,
): EffectiveScope {
  const numbered = /\bUFC\s+\d{3,4}\b/i.test(`${name} ${subtitle}`);
  if (!numbered) return "main";
  return requested === "main" ? "main" : "full";
}

export function selectAndSequenceImportedBouts<T extends SectionedBout>(
  bouts: T[],
  scope: EffectiveScope,
): Array<T & SequencedBoutMetadata> {
  const selected = bouts.filter((bout) => {
    if (bout.section === "early-prelim") return false;
    if (scope === "main") return bout.section === "main-event" || bout.section === "main";
    return bout.section === "main-event" || bout.section === "main" || bout.section === "prelim";
  });

  const totals: Record<CardSegment, number> = { main: 0, prelim: 0 };
  for (const bout of selected) {
    totals[bout.section === "prelim" ? "prelim" : "main"] += 1;
  }

  const seen: Record<CardSegment, number> = { main: 0, prelim: 0 };
  return selected.map((bout) => {
    const cardSegment: CardSegment = bout.section === "prelim" ? "prelim" : "main";
    seen[cardSegment] += 1;
    return {
      ...bout,
      card_segment: cardSegment,
      segment_sequence: totals[cardSegment] - seen[cardSegment] + 1,
    };
  });
}
