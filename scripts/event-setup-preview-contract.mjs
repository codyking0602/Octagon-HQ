function clean(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'").replace(/[‐‑‒–—]/g, "-")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function canonicalFighterDisplay(value) {
  return clean(value)
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

export function expectedSourceChanges(current, event) {
  const changes = [];
  const metadata = [
    ["Event name", current?.name, event?.name],
    ["Main event", current?.subtitle, event?.subtitle],
    ["Venue", current?.venue, event?.venue],
    ["Location", current?.location, event?.location],
    ["Card source", current?.source_url, event?.source_url],
  ];
  for (const [label, before, after] of metadata) {
    if (clean(before) !== clean(after)) changes.push(`${label} changed.`);
  }

  const timestamps = [
    ["Event time", current?.starts_at, event?.starts_at],
    ["Picks lock", current?.locks_at, event?.locks_at],
  ];
  for (const [label, before, after] of timestamps) {
    if (!sameTimestamp(before, after)) changes.push(`${label} changed.`);
  }

  const currentBouts = Array.isArray(current?.bouts) ? current.bouts : [];
  const sourceBouts = Array.isArray(event?.bouts) ? event.bouts : [];
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

export function assertReportedSourceChanges(current, event, reported) {
  const expected = expectedSourceChanges(current, event);
  if (JSON.stringify(reported) !== JSON.stringify(expected)) {
    throw new Error(
      `Preview change list mismatch; expected ${JSON.stringify(expected)}, received ${JSON.stringify(reported)}.`,
    );
  }
}
