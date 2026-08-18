function clean(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const sourceRankingPrefix = /^(?:(?:no\.?|number)\s*#?\s*\d{1,2}|#\s*\d{1,2})\s+/i;
const ufcChampionPrefix = /^UFC\s+(?:(?:interim|undisputed)\s+)?(?:women(?:['’]s)?\s+)?(?:strawweight|flyweight|bantamweight|featherweight|lightweight|welterweight|middleweight|light\s+heavyweight|heavyweight)\s+champion\s+/i;

function normalizeText(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'").replace(/[‐‑‒–—]/g, "-")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function canonicalFighterDisplay(value) {
  return clean(value)
    .replace(/\s*\(\s*not\s+[^)]+\)\s*$/i, "")
    .replace(sourceRankingPrefix, "")
    .replace(ufcChampionPrefix, "")
    .replace(/\s*\((?:rematch\s*)?#?2\)\s*$/i, "")
    .replace(/\s+(?:rematch\s*)?#?2\s*$/i, "")
    .replace(/[.,;:]+$/, "")
    .trim();
}

function normalizeFighter(value) {
  return normalizeText(canonicalFighterDisplay(value))
    .replace(/\b(?:interim|undisputed|former|current|champion|champ|titleholder)\b/g, " ")
    .replace(/\b(?:no|number)?\s*#?\d{1,2}\b/g, " ")
    .replace(/\s+/g, " ").trim()
    .split(" ").filter((token) => !["jr", "sr", "ii", "iii", "iv"].includes(token)).join(" ");
}

function fightPair(bout) {
  return [
    normalizeFighter(bout?.red_fighter_name),
    normalizeFighter(bout?.blue_fighter_name),
  ].sort().join("|");
}

function sectionFromBoutId(boutId) {
  const value = String(boutId ?? "");
  if (value.startsWith("main-event-")) return "main-event";
  if (value.startsWith("early-prelim-")) return "early-prelim";
  if (value.startsWith("prelim-")) return "prelim";
  return "main";
}

function sectionLabel(section) {
  if (section === "main-event") return "main event";
  if (section === "main") return "main card";
  if (section === "early-prelim") return "early prelims";
  return "prelims";
}

function sameTimestamp(left, right) {
  const leftValue = clean(left);
  const rightValue = clean(right);
  const leftTime = Date.parse(leftValue);
  const rightTime = Date.parse(rightValue);
  return Number.isFinite(leftTime) && Number.isFinite(rightTime)
    ? leftTime === rightTime
    : leftValue === rightValue;
}

function isCbsSportsUfcEventUrl(value) {
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, "");
    return url.protocol === "https:"
      && url.hostname === "www.cbssports.com"
      && /^\/ufc\/event\/\d+\/[a-z0-9-]+$/i.test(path);
  } catch {
    return false;
  }
}

function normalizedIdentityFingerprint(value) {
  if (!value || typeof value !== "object") return "";
  return JSON.stringify({
    eventNumber: value.eventNumber ?? null,
    headliners: Array.isArray(value.headliners) ? value.headliners : [],
    eventDate: value.eventDate ?? null,
    location: value.location ?? null,
  });
}

function hasCombinedVenueAndLocation(value) {
  const parts = clean(value).split(/\s*,\s*/).filter(Boolean);
  return parts.length >= 2 && parts.every((part) => part.length >= 2);
}

export function assertCurrentEventPreview(event, now = new Date()) {
  if (!event || typeof event !== "object") {
    throw new Error("Preview is missing the event payload.");
  }

  for (const field of ["name", "subtitle"]) {
    if (!clean(event[field])) throw new Error(`Preview is missing ${field}.`);
  }

  const venue = clean(event.venue);
  const location = clean(event.location);
  if (!venue) throw new Error("Preview is missing venue.");
  if (!location && !hasCombinedVenueAndLocation(venue)) {
    throw new Error("Preview is missing location.");
  }

  const startsAt = Date.parse(clean(event.starts_at));
  const locksAt = Date.parse(clean(event.locks_at));
  if (!Number.isFinite(startsAt) || !Number.isFinite(locksAt)) {
    throw new Error("Preview has an invalid event or Picks lock timestamp.");
  }
  if (startsAt < now.getTime() - 24 * 60 * 60 * 1000) {
    throw new Error("Preview selected an event more than one day in the past.");
  }
  if (locksAt > startsAt) {
    throw new Error("Preview places the Picks lock after the event start.");
  }

  if (!isCbsSportsUfcEventUrl(event.source_url)) {
    throw new Error("Preview is missing a specific CBS Sports UFC event source.");
  }

  const bouts = Array.isArray(event.bouts) ? event.bouts : [];
  if (bouts.length < 4 || bouts.length > 20) {
    throw new Error(`Preview returned an implausible ${bouts.length}-fight card.`);
  }

  const seenIds = new Set();
  const seenPairs = new Set();
  for (const bout of bouts) {
    const boutId = clean(bout?.bout_id);
    const red = clean(bout?.red_fighter_name);
    const blue = clean(bout?.blue_fighter_name);
    if (!boutId || !red || !blue) throw new Error("Preview contains an incomplete fight.");
    if (seenIds.has(boutId)) throw new Error(`Preview repeats bout ID ${boutId}.`);
    const pair = fightPair(bout);
    if (!pair || pair.startsWith("|") || pair.endsWith("|")) {
      throw new Error(`Preview contains an invalid fighter pair for ${boutId}.`);
    }
    if (seenPairs.has(pair)) throw new Error(`Preview repeats fighter pair ${red} vs. ${blue}.`);
    seenIds.add(boutId);
    seenPairs.add(pair);
  }

  const visible = JSON.stringify({
    name: event.name,
    subtitle: event.subtitle,
    venue: event.venue,
    location: event.location,
  });
  if (/iframe|googletagmanager|skip\s+to\s+main|src\s*=|<|>/i.test(visible)) {
    throw new Error("Preview contains rejected visible-page pollution.");
  }
}

export function assertSafeEventSourceRollover(body) {
  if (body?.code !== "ARTICLE_IDENTITY_REJECTED" || body?.stage !== "identity-match") {
    throw new Error(
      `Expected a safe article identity rejection, received ${body?.code ?? "missing"}/${body?.stage ?? "missing"}.`,
    );
  }

  const details = body.safeDetails;
  if (!details || typeof details !== "object") {
    throw new Error("Safe article rejection is missing structured identity details.");
  }
  if (!Array.isArray(details.conflicts) || !details.conflicts.length) {
    throw new Error("Safe article rejection did not report an identity conflict.");
  }

  const ufcFingerprint = normalizedIdentityFingerprint(details.normalizedUfcEvent);
  const articleFingerprint = normalizedIdentityFingerprint(details.normalizedArticleEvent);
  if (!ufcFingerprint || !articleFingerprint || ufcFingerprint === articleFingerprint) {
    throw new Error("Safe article rejection does not prove a real source rollover mismatch.");
  }
}

export function expectedSourceChanges(current, event, effectiveScope = "main") {
  const sourceBouts = Array.isArray(event?.bouts) ? event.bouts : [];
  if (!isRecord(current)) {
    return [
      `Stage a new ${effectiveScope === "full" ? "full" : "main"} card with ${sourceBouts.length} fights.`,
    ];
  }

  const changes = [];
  const metadata = [
    ["Event name", current.name, event?.name],
    ["Main event", current.subtitle, event?.subtitle],
    ["Venue", current.venue, event?.venue],
    ["Location", current.location, event?.location],
    ["Card source", current.source_url, event?.source_url],
  ];
  for (const [label, before, after] of metadata) {
    if (clean(before) !== clean(after)) changes.push(`${label} changed.`);
  }

  const timestamps = [
    ["Main-card time", current.starts_at, event?.starts_at],
    ["Prelims time", current.prelims_starts_at, event?.prelims_starts_at],
    ["Picks lock", current.locks_at, event?.locks_at],
  ];
  for (const [label, before, after] of timestamps) {
    if (!sameTimestamp(before, after)) changes.push(`${label} changed.`);
  }

  const currentBouts = Array.isArray(current.bouts) ? current.bouts : [];
  const currentMap = new Map(currentBouts.map((bout) => [fightPair(bout), bout]));
  const sourceMap = new Map(sourceBouts.map((bout) => [fightPair(bout), bout]));

  for (const [key, bout] of sourceMap) {
    const existing = currentMap.get(key);
    if (!existing) {
      changes.push(`Added ${sectionLabel(sectionFromBoutId(bout.bout_id))}: ${bout.red_fighter_name} vs. ${bout.blue_fighter_name}.`);
      continue;
    }
    const oldSection = sectionFromBoutId(existing.bout_id);
    const newSection = sectionFromBoutId(bout.bout_id);
    if (oldSection !== newSection) {
      changes.push(`Moved ${bout.red_fighter_name} vs. ${bout.blue_fighter_name} from ${sectionLabel(oldSection)} to ${sectionLabel(newSection)}.`);
    }
    if (clean(existing.weight_class) !== clean(bout.weight_class)) {
      changes.push(`Weight class changed for ${bout.red_fighter_name} vs. ${bout.blue_fighter_name}.`);
    }
  }

  for (const [key, bout] of currentMap) {
    if (!sourceMap.has(key)) {
      changes.push(`Removed ${sectionLabel(sectionFromBoutId(bout.bout_id))}: ${bout.red_fighter_name} vs. ${bout.blue_fighter_name}.`);
    }
  }

  const oldOrder = currentBouts.map(fightPair).filter((key) => sourceMap.has(key));
  const newOrder = sourceBouts.map(fightPair).filter((key) => currentMap.has(key));
  if (oldOrder.length === newOrder.length && oldOrder.some((key, index) => key !== newOrder[index])) {
    changes.push("Fight order changed.");
  }

  return [...new Set(changes)];
}

export function assertReportedSourceChanges(current, event, reported, effectiveScope = "main") {
  const expected = expectedSourceChanges(current, event, effectiveScope);
  if (JSON.stringify(reported) !== JSON.stringify(expected)) {
    throw new Error(
      `Preview change list mismatch; expected ${JSON.stringify(expected)}, received ${JSON.stringify(reported)}.`,
    );
  }
}
