import { canonicalFightPair } from "./normalization.ts";

type EffectiveScope = "main" | "full";
type CardSection = "main-event" | "main" | "prelim" | "early-prelim";

interface SourceBout {
  bout_id: string;
  weight_class: string;
  red_fighter_name: string;
  blue_fighter_name: string;
}

interface SourceEvent {
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  starts_at: string;
  locks_at: string;
  source_url: string;
  bouts: SourceBout[];
}

function clean(value: unknown) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function sectionFromBoutId(boutId: string): CardSection {
  if (boutId.startsWith("main-event-")) return "main-event";
  if (boutId.startsWith("early-prelim-")) return "early-prelim";
  if (boutId.startsWith("prelim-")) return "prelim";
  return "main";
}

function cardSectionLabel(section: CardSection) {
  if (section === "main-event") return "main event";
  if (section === "main") return "main card";
  if (section === "early-prelim") return "early prelims";
  return "prelims";
}

export function sourceChanges(currentValue: unknown, event: SourceEvent, effectiveScope: EffectiveScope) {
  const current = asRecord(currentValue);
  if (!current) {
    return [`Stage a new ${effectiveScope === "full" ? "full" : "main"} card with ${event.bouts.length} fights.`];
  }

  const changes: string[] = [];
  const metadataFields: Array<[string, unknown, unknown]> = [
    ["Event name", current.name, event.name],
    ["Main event", current.subtitle, event.subtitle],
    ["Venue", current.venue, event.venue],
    ["Location", current.location, event.location],
    ["Event time", current.starts_at, event.starts_at],
    ["Picks lock", current.locks_at, event.locks_at],
    ["Card source", current.source_url, event.source_url],
  ];
  for (const [label, oldValue, newValue] of metadataFields) {
    if (clean(oldValue) !== clean(newValue)) changes.push(`${label} changed.`);
  }

  const currentBouts = Array.isArray(current.bouts)
    ? current.bouts.map(asRecord).filter(Boolean) as Record<string, unknown>[]
    : [];
  const currentMap = new Map(currentBouts.map((bout) => [
    canonicalFightPair(
      String(bout.red_fighter_name ?? ""),
      String(bout.blue_fighter_name ?? ""),
    ),
    bout,
  ]));
  const sourceMap = new Map(event.bouts.map((bout) => [
    canonicalFightPair(bout.red_fighter_name, bout.blue_fighter_name),
    bout,
  ]));

  for (const [key, bout] of sourceMap) {
    const existing = currentMap.get(key);
    if (!existing) {
      changes.push(`Added ${cardSectionLabel(sectionFromBoutId(bout.bout_id))}: ${bout.red_fighter_name} vs. ${bout.blue_fighter_name}.`);
      continue;
    }
    const oldSection = sectionFromBoutId(String(existing.bout_id ?? ""));
    const newSection = sectionFromBoutId(bout.bout_id);
    if (oldSection !== newSection) {
      changes.push(`Moved ${bout.red_fighter_name} vs. ${bout.blue_fighter_name} from ${cardSectionLabel(oldSection)} to ${cardSectionLabel(newSection)}.`);
    }
    if (clean(existing.weight_class) !== clean(bout.weight_class)) {
      changes.push(`Weight class changed for ${bout.red_fighter_name} vs. ${bout.blue_fighter_name}.`);
    }
  }

  for (const [key, bout] of currentMap) {
    if (sourceMap.has(key)) continue;
    changes.push(`Removed ${cardSectionLabel(sectionFromBoutId(String(bout.bout_id ?? "")))}: ${String(bout.red_fighter_name ?? "")} vs. ${String(bout.blue_fighter_name ?? "")}.`);
  }

  const oldOrder = currentBouts
    .map((bout) => canonicalFightPair(
      String(bout.red_fighter_name ?? ""),
      String(bout.blue_fighter_name ?? ""),
    ))
    .filter((key) => sourceMap.has(key));
  const newOrder = event.bouts
    .map((bout) => canonicalFightPair(bout.red_fighter_name, bout.blue_fighter_name))
    .filter((key) => currentMap.has(key));
  if (oldOrder.length === newOrder.length && oldOrder.some((key, index) => key !== newOrder[index])) {
    changes.push("Fight order changed.");
  }

  return Array.from(new Set(changes));
}
