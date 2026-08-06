function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizedText(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function monitoringValuesEquivalent(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (typeof left === "string" && typeof right === "string") {
    return normalizedText(left) === normalizedText(right);
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    return left.every((value, index) => monitoringValuesEquivalent(value, right[index]));
  }
  if (isRecord(left) || isRecord(right)) {
    if (!isRecord(left) || !isRecord(right)) return false;
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length
      && leftKeys.every((key, index) => (
        key === rightKeys[index]
        && monitoringValuesEquivalent(left[key], right[key])
      ));
  }
  return false;
}

function humanize(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactObject(value: Record<string, unknown>) {
  const red = typeof value.red_fighter_name === "string" ? value.red_fighter_name.trim() : "";
  const blue = typeof value.blue_fighter_name === "string" ? value.blue_fighter_name.trim() : "";
  if (red && blue) return `${red} vs. ${blue}`;

  if (typeof value.included_in_picks === "boolean") {
    return value.included_in_picks ? "Included in Picks" : "Removed from Picks";
  }
  if (typeof value.position === "number") return String(value.position);

  const fighterIdentity = typeof value.fighter_identity === "string" ? value.fighter_identity : "";
  const americanOdds = typeof value.american_odds === "number" ? value.american_odds : null;
  if (fighterIdentity && americanOdds !== null) {
    return `${humanize(fighterIdentity)} ${americanOdds > 0 ? "+" : ""}${americanOdds}`;
  }

  return Object.entries(value)
    .map(([key, item]) => `${humanize(key)}: ${compactMonitoringValue(item)}`)
    .join(" · ");
}

export function compactMonitoringValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))) {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value));
    }
    return value;
  }
  if (typeof value === "number") return value > 0 ? `+${value}` : String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(compactMonitoringValue).join(" · ");
  if (isRecord(value)) return compactObject(value);
  return String(value);
}
