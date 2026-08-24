const suffixes = new Set(["jr", "sr", "ii", "iii", "iv"]);
const canonicalDisplayNames = new Map([
  ["uros medic", "Uroš Medić"],
  ["aleksandar rakic", "Aleksandar Rakić"],
  ["jan blachowicz", "Jan Błachowicz"],
  ["sergey spivak", "Serghei Spivac"],
  ["ce liu", "Liu Ce"],
]);

const sourceRankingPrefix = /^(?:(?:no\.?|number)\s*#?\s*\d{1,2}|#\s*\d{1,2})\s+/i;
const ufcChampionPrefix = /^UFC\s+(?:(?:interim|undisputed)\s+)?(?:women(?:['’]s)?\s+)?(?:strawweight|flyweight|bantamweight|featherweight|lightweight|welterweight|middleweight|light\s+heavyweight|heavyweight)\s+champion\s+/i;

export function normalizeText(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'").replace(/[‐‑‒–—]/g, "-")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function canonicalFighterDisplay(value: string) {
  const cleaned = value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\s*\(\s*not\s+[^)]+\)\s*$/i, "")
    .replace(sourceRankingPrefix, "")
    .replace(ufcChampionPrefix, "")
    .replace(/\s*\((?:rematch\s*)?#?2\)\s*$/i, "")
    .replace(/\s+(?:rematch\s*)?#?2\s*$/i, "")
    .replace(/[.,;:]+$/, "")
    .trim();
  return canonicalDisplayNames.get(normalizeText(cleaned)) ?? cleaned;
}

export function normalizeFighter(value: string) {
  return normalizeText(canonicalFighterDisplay(value))
    .replace(/\b(?:interim|undisputed|former|current|champion|champ|titleholder)\b/g, " ")
    .replace(/\b(?:no|number)?\s*#?\d{1,2}\b/g, " ")
    .replace(/\s+/g, " ").trim()
    .split(" ").filter((token) => !suffixes.has(token)).join(" ");
}

export function splitVersus(value: string) {
  return value.split(/\s+(?:vs\.?|v\.?|versus)\s+/i).map((part) => part.trim()).filter(Boolean);
}

export function canonicalFightPair(red: string, blue: string) {
  return [normalizeFighter(red), normalizeFighter(blue)].sort().join("|");
}

export function sameVersusLabel(left: string, right: string) {
  const leftFighters = splitVersus(left);
  const rightFighters = splitVersus(right);
  if (leftFighters.length === 2 && rightFighters.length === 2) {
    return canonicalFightPair(leftFighters[0], leftFighters[1])
      === canonicalFightPair(rightFighters[0], rightFighters[1]);
  }
  return normalizeText(left) === normalizeText(right);
}

export function fighterMatch(expected: string, actual: string, surnameOnly = false) {
  const normalizedExpected = normalizeFighter(expected);
  const normalizedActual = normalizeFighter(actual);
  const left = normalizedExpected.split(" ").filter(Boolean);
  const right = normalizedActual.split(" ").filter(Boolean);
  if (!left.length || !right.length) return false;
  const rightTokens = new Set(right);
  if (surnameOnly) return rightTokens.has(left.at(-1)!);
  if (normalizedExpected.replace(/\s+/g, "") === normalizedActual.replace(/\s+/g, "")) return true;
  // Initials are deliberately weak. Require every durable token from either complete
  // name variant to be present in the other so inserted nicknames, compound given
  // names, and omitted middle names can resolve without surname-only matching.
  const meaningful = (tokens: string[]) => tokens.filter((token, index) => token.length > 1 || index === tokens.length - 1);
  const leftTokens = new Set(left);
  return meaningful(left).every((token) => rightTokens.has(token))
    || meaningful(right).every((token) => leftTokens.has(token));
}

export function eventNumber(value: string) {
  return normalizeText(value).match(/\bufc\s+(\d{3,4})\b/)?.[1] ?? "";
}

export function explicitIsoDates(value: string) {
  const dates = new Set<string>();
  for (const match of value.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) dates.add(`${match[1]}-${match[2]}-${match[3]}`);
  const months: Record<string, number> = { jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12 };
  for (const match of value.matchAll(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(20\d{2})\b/gi)) {
    const month = months[match[1].toLowerCase()];
    if (month) dates.add(`${match[3]}-${String(month).padStart(2,"0")}-${match[2].padStart(2,"0")}`);
  }
  return [...dates];
}

export function withinCalendarBoundary(left: string, right: string) {
  const a = Date.parse(`${left}T00:00:00Z`), b = Date.parse(`${right}T00:00:00Z`);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 86400000;
}
