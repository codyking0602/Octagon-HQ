import { monitoringValuesEquivalent } from "../../../src/features/picks-monitoring/monitoringChangeValues.ts";
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
  prelims_starts_at?: string;
  locks_at: string;
  source_url: string;
  bouts: SourceBout[];
}

export interface SourceChangeDetail {
  summary: string;
  beforeValue: unknown;
  afterValue: unknown;
}

function clean(value: unknown) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function displayValue(value: unknown) {
  const result = clean(value);
  return result || null;
}

function timestampsMatch(leftValue: unknown, rightValue: unknown) {
  const left = clean(leftValue);
  const right = clean(rightValue);
  const leftTimestamp = Date.parse(left);
  const rightTimestamp = Date.parse(right);

  if (!Number.isNaN(leftTimestamp) && !Number.isNaN(rightTimestamp)) {
    return leftTimestamp === rightTimestamp;
  }

  return left === right;
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

function boutLabel(bout: Pick<SourceBout, "red_fighter_name" | "blue_fighter_name">) {
  return `${bout.red_fighter_name} vs. ${bout.blue_fighter_name}`;
}

function discoveredOrChanged(label: string, beforeValue: unknown) {
  return `${label} ${beforeValue === null ? "found" : "changed"}.`;
}

function uniqueDetails(changes: SourceChangeDetail[]) {
  const seen = new Set<string>();
  return changes.filter((change) => {
    const key = JSON.stringify([change.summary, change.beforeValue, change.afterValue]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sourceChangeDetails(currentValue: unknown, event: SourceEvent, effectiveScope: EffectiveScope) {
  const current = asRecord(currentValue);
  if (!current) {
    return [{
      summary: `Stage a new ${effectiveScope === "full" ? "full" : "main"} card with ${event.bouts.length} fights.`,
      beforeValue: null,
      afterValue: `${event.bouts.length} fights`,
    }];
  }

  const changes: SourceChangeDetail[] = [];
  const metadataFields: Array<[string, unknown, unknown, "semantic" | "exact"]> = [
    ["Event name", current.name, event.name, "semantic"],
    ["Main event", current.subtitle, event.subtitle, "semantic"],
    ["Venue", current.venue, event.venue, "semantic"],
    ["Location", current.location, event.location, "semantic"],
    ["Card source", current.source_url, event.source_url, "exact"],
  ];
  for (const [label, oldValue, newValue, comparison] of metadataFields) {
    const beforeValue = displayValue(oldValue);
    const afterValue = displayValue(newValue);
    const matches = comparison === "semantic"
      ? monitoringValuesEquivalent(beforeValue, afterValue)
      : beforeValue === afterValue;
    if (!matches) changes.push({
      summary: discoveredOrChanged(label, beforeValue),
      beforeValue,
      afterValue,
    });
  }

  const timestampFields: Array<[string, unknown, unknown]> = [
    ["Main-card time", current.starts_at, event.starts_at],
    ["Prelims time", current.prelims_starts_at, event.prelims_starts_at],
    ["Picks lock", current.locks_at, event.locks_at],
  ];
  for (const [label, oldValue, newValue] of timestampFields) {
    if (!timestampsMatch(oldValue, newValue)) {
      const beforeValue = displayValue(oldValue);
      changes.push({
        summary: discoveredOrChanged(label, beforeValue),
        beforeValue,
        afterValue: displayValue(newValue),
      });
    }
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
      changes.push({
        summary: `Added ${cardSectionLabel(sectionFromBoutId(bout.bout_id))}: ${boutLabel(bout)}.`,
        beforeValue: null,
        afterValue: boutLabel(bout),
      });
      continue;
    }
    const oldSection = sectionFromBoutId(String(existing.bout_id ?? ""));
    const newSection = sectionFromBoutId(bout.bout_id);
    if (oldSection !== newSection) {
      changes.push({
        summary: `Moved ${boutLabel(bout)} from ${cardSectionLabel(oldSection)} to ${cardSectionLabel(newSection)}.`,
        beforeValue: cardSectionLabel(oldSection),
        afterValue: cardSectionLabel(newSection),
      });
    }
    const beforeWeight = displayValue(existing.weight_class);
    const afterWeight = displayValue(bout.weight_class);
    if (!monitoringValuesEquivalent(beforeWeight, afterWeight)) {
      changes.push({
        summary: beforeWeight === null
          ? `Weight class found for ${boutLabel(bout)}.`
          : `Weight class changed for ${boutLabel(bout)}.`,
        beforeValue: beforeWeight,
        afterValue: afterWeight,
      });
    }
  }

  for (const [key, bout] of currentMap) {
    if (sourceMap.has(key)) continue;
    const label = `${String(bout.red_fighter_name ?? "")} vs. ${String(bout.blue_fighter_name ?? "")}`;
    changes.push({
      summary: `Removed ${cardSectionLabel(sectionFromBoutId(String(bout.bout_id ?? "")))}: ${label}.`,
      beforeValue: label,
      afterValue: null,
    });
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
    const labels = new Map<string, string>();
    currentBouts.forEach((bout) => labels.set(
      canonicalFightPair(String(bout.red_fighter_name ?? ""), String(bout.blue_fighter_name ?? "")),
      `${String(bout.red_fighter_name ?? "")} vs. ${String(bout.blue_fighter_name ?? "")}`,
    ));
    event.bouts.forEach((bout) => labels.set(canonicalFightPair(bout.red_fighter_name, bout.blue_fighter_name), boutLabel(bout)));
    changes.push({
      summary: "Fight order changed.",
      beforeValue: oldOrder.map((key) => labels.get(key) ?? key),
      afterValue: newOrder.map((key) => labels.get(key) ?? key),
    });
  }

  return uniqueDetails(changes);
}

export function sourceChanges(currentValue: unknown, event: SourceEvent, effectiveScope: EffectiveScope) {
  return Array.from(new Set(
    sourceChangeDetails(currentValue, event, effectiveScope).map((change) => change.summary),
  ));
}
