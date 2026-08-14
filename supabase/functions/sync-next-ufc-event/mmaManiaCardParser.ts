import { canonicalFightPair, canonicalFighterDisplay } from "./normalization.ts";
import { isMmaManiaFightListRow, type CardSection } from "./importPolicy.ts";

export interface ParsedMmaManiaBout {
  section: CardSection;
  weight_class: string;
  red_fighter_name: string;
  blue_fighter_name: string;
}

export interface MmaManiaCard {
  sourceUrl: string;
  bouts: ParsedMmaManiaBout[];
  usedSectionHeadings: boolean;
}

const clean = (value: string) => value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

function classifySection(value: string): CardSection | null {
  const heading = clean(value).toLowerCase().replace(/[‘’'"“”]/g, "");
  // Section labels may contain event numbers, platform names, and start times,
  // but a weighted matchup row must never become a heading just because a
  // fighter name happens to contain a word such as "Prelim" or "Main".
  if (/^\d{3}\s*(?:lbs?\.?|pounds?)\s*:/i.test(heading)
    || /\s+(?:vs\.?|v\.?|versus)\s+/i.test(heading)) return null;
  if (/\bearly\s+prelims?\b/.test(heading)) return "early-prelim";
  if (/\b(?:late\s+)?prelims?\b/.test(heading)) return "prelim";
  if (/\bmain\s+event\b/.test(heading)) return "main-event";
  if (/\bmain\s+card\b/.test(heading)) return "main";
  return null;
}

function weightClassFromPounds(value: number | null) {
  const classes: Record<number, string> = { 115: "Strawweight", 125: "Flyweight", 135: "Bantamweight", 145: "Featherweight", 155: "Lightweight", 170: "Welterweight", 185: "Middleweight", 205: "Light Heavyweight", 265: "Heavyweight" };
  return value === null ? "" : classes[value] ?? `${value} lb. Catchweight`;
}

function cleanFighterName(value: string) {
  return canonicalFighterDisplay(clean(value)
    .replace(/^#?\d+\s+/, "")
    .replace(/\s+(?:[-–—|]\s*)?(?:odds|prediction|preview|live stream)\b.*$/i, "")
    .replace(/\s*\([^)]*(?:cancelled|canceled|scrapped|replacement|odds)[^)]*\)\s*$/i, ""));
}

function parseFightLine(value: string, section: CardSection): ParsedMmaManiaBout | null {
  const line = clean(value);
  if (!isMmaManiaFightListRow(line) || /cancelled|canceled|scrapped|postponed/i.test(line)) return null;
  const markers = [...line.matchAll(/\s+(?:vs\.?|v\.)\s+/gi)];
  if (markers.length !== 1 || markers[0]!.index === undefined) return null;
  const marker = markers[0]!;
  let left = line.slice(0, marker.index).trim();
  let right = line.slice(marker.index! + marker[0].length).trim();
  const weightMatch = left.match(/^(\d{3})\s*(?:lbs?\.?|pounds?)\s*:\s*/i);
  if (!weightMatch) return null;
  left = left.slice(weightMatch[0].length);
  right = right.split(/\s+[–—|]\s+/)[0] ?? right;
  const red = cleanFighterName(left);
  const blue = cleanFighterName(right);
  if (red.length < 2 || blue.length < 2 || red.length > 70 || blue.length > 70 || !/[a-z]/i.test(red) || !/[a-z]/i.test(blue)) return null;
  return { section, weight_class: weightClassFromPounds(Number(weightMatch[1])), red_fighter_name: red, blue_fighter_name: blue };
}

function decodeHtml(value: string) {
  const named: Record<string, string> = { amp: "&", apos: "'", quot: '"', nbsp: " ", ndash: "–", mdash: "—" };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity: string) => {
    if (entity[0] !== "#") return named[entity.toLowerCase()] ?? `&${entity};`;
    const value = Number.parseInt(entity.slice(entity[1]?.toLowerCase() === "x" ? 2 : 1), entity[1]?.toLowerCase() === "x" ? 16 : 10);
    return Number.isFinite(value) ? String.fromCodePoint(value) : "";
  });
}

interface Candidate { tag: string; text: string; hasBold: boolean; nestedInRow: boolean }

function candidatesFromHtml(html: string) {
  const candidates: Candidate[] = [];
  const stack: Array<Candidate & { deleted: boolean }> = [];
  const tokens = html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) ?? [];
  for (const token of tokens) {
    if (token.startsWith("<!--")) continue;
    const tag = token.match(/^<\/?\s*([a-z0-9]+)/i)?.[1]?.toLowerCase();
    if (tag) {
      const closing = /^<\//.test(token);
      if (!closing && /^(?:h[1-6]|p|li|td)$/.test(tag)) {
        stack.push({ tag, text: "", hasBold: false, nestedInRow: stack.some((item) => item.tag === "p" || item.tag === "li"), deleted: false });
      } else if (closing && /^(?:h[1-6]|p|li|td)$/.test(tag)) {
        const index = stack.map((item) => item.tag).lastIndexOf(tag);
        if (index >= 0) candidates.push(...stack.splice(index).map(({ deleted: _deleted, ...item }) => item));
      }
      if (/^(?:strong|b)$/.test(tag)) stack.forEach((item) => { item.hasBold = true; });
      if (/^(?:s|del)$/.test(tag)) stack.forEach((item) => { item.deleted = !closing; });
      if (!closing && tag === "br") stack.forEach((item) => { if (!item.deleted) item.text += "\n"; });
      continue;
    }
    const text = decodeHtml(token);
    stack.forEach((item) => { if (!item.deleted) item.text += text; });
  }
  return candidates;
}

function balancedElementHtml(html: string, tagName: "article" | "main" | "body") {
  const tagPattern = new RegExp(`<\\/?\\s*${tagName}\\b[^>]*>`, "gi");
  let start = -1;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html))) {
    const token = match[0];
    const closing = /^<\//.test(token);
    const selfClosing = /\/\s*>$/.test(token);

    if (start < 0) {
      if (closing) continue;
      start = match.index;
      depth = selfClosing ? 0 : 1;
      if (depth === 0) return token;
      continue;
    }

    if (closing) depth -= 1;
    else if (!selfClosing) depth += 1;

    if (depth === 0) return html.slice(start, tagPattern.lastIndex);
  }

  return start >= 0 ? html.slice(start) : null;
}

function articleHtml(html: string) {
  return balancedElementHtml(html, "article")
    ?? balancedElementHtml(html, "main")
    ?? balancedElementHtml(html, "body")
    ?? html;
}

/** The sole MMA Mania card parser used by both the Edge Function and fixtures. */
export function parseMmaManiaCard(html: string, sourceUrl: string): MmaManiaCard {
  const bouts: ParsedMmaManiaBout[] = [];
  const seen = new Set<string>();
  let section: CardSection | null = null;
  let usedSectionHeadings = false;
  for (const candidate of candidatesFromHtml(articleHtml(html))) {
    const firstLine = clean(candidate.text.split(/\n+/)[0] ?? "");
    const headingSection = classifySection(firstLine);
    const semanticHeading = /^h[1-6]$/.test(candidate.tag)
      || (!/\s(?:vs\.?|v\.?|versus)\s/i.test(firstLine) && firstLine.length < 140 && candidate.hasBold && Boolean(headingSection));
    if (semanticHeading) {
      if (headingSection) { section = headingSection; usedSectionHeadings = true; }
      // Real MMA Mania pages sometimes put the section label and the first row
      // in one bold paragraph. Preserve the remaining line instead of dropping it.
      if (!headingSection || !candidate.text.includes("\n")) continue;
    }
    if (!section || candidate.nestedInRow) continue;
    for (const line of candidate.text.split(/\n+/).map(clean).filter(Boolean)) {
      if (classifySection(line)) continue;
      const parsed = parseFightLine(line, section);
      if (!parsed) continue;
      const key = canonicalFightPair(parsed.red_fighter_name, parsed.blue_fighter_name);
      if (!seen.has(key)) { seen.add(key); bouts.push(parsed); }
    }
  }
  return { sourceUrl, bouts, usedSectionHeadings };
}
