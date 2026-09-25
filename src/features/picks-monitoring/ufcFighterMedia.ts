import { fighterMatch, normalizeFighter } from "../../../supabase/functions/sync-next-ufc-event/normalization.ts";
import type { MonitoringEvent } from "./manualMonitoringRunner.ts";

export interface UfcFighterMediaCandidate {
  fighter_slug: string;
  display_name: string;
  photo_url: string;
  source: "espn" | "ufc";
  source_page_url: string;
  source_fighter_id?: string;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null => (
  value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null
);
const asArray = (value: unknown) => Array.isArray(value) ? value : [];
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

function canonicalFighters(event: MonitoringEvent) {
  return event.bouts.flatMap((bout) => [
    { slug: bout.red_fighter_slug, name: bout.red_fighter_name },
    { slug: bout.blue_fighter_slug, name: bout.blue_fighter_name },
  ]);
}

const mediaNameAliases = new Map([
  ["mehemmedeli osmanli", "mahammadali osmanli"],
  ["valesca machado", "tina black"],
]);

function canonicalMediaName(value: string) {
  const normalized = normalizeFighter(value);
  return mediaNameAliases.get(normalized) ?? normalized;
}

function mediaNameMatch(expected: string, actual: string) {
  return fighterMatch(expected, actual)
    || canonicalMediaName(expected) === canonicalMediaName(actual);
}

function canonicalFighterForName(event: MonitoringEvent, sourceName: string) {
  const matches = canonicalFighters(event).filter((fighter) => mediaNameMatch(fighter.name, sourceName));
  return matches.length === 1 ? matches[0] : null;
}

function eventDateKey(event: MonitoringEvent) {
  const idDate = event.event_id.match(/(20\d{2})-(\d{2})-(\d{2})$/);
  if (idDate) return `${idDate[1]}${idDate[2]}${idDate[3]}`;

  const parsed = Date.parse(event.starts_at);
  if (!Number.isFinite(parsed)) return "";
  return new Date(parsed).toISOString().slice(0, 10).replace(/-/g, "");
}

export function espnUfcMediaScoreboardUrl(event: MonitoringEvent) {
  const dateKey = eventDateKey(event);
  return `https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard${dateKey ? `?dates=${dateKey}` : ""}`;
}

function espnAthleteName(competitor: UnknownRecord) {
  const athlete = asRecord(competitor.athlete);
  return text(athlete?.fullName) || text(athlete?.displayName);
}

function espnAthleteId(competitor: UnknownRecord) {
  const athlete = asRecord(competitor.athlete);
  return text(athlete?.id) || text(competitor.id);
}

function espnHeadshotUrl(competitor: UnknownRecord, athleteId: string) {
  const athlete = asRecord(competitor.athlete);
  const headshot = asRecord(athlete?.headshot);
  const embedded = text(headshot?.href);
  if (/^https:\/\/a\.espncdn\.com\//i.test(embedded)) return embedded;
  return /^\d+$/.test(athleteId)
    ? `https://a.espncdn.com/i/headshots/mma/players/full/${athleteId}.png`
    : "";
}

function eventStartMs(event: UnknownRecord) {
  const parsed = Date.parse(text(event.date));
  return Number.isFinite(parsed) ? parsed : null;
}

export function adaptEspnUfcFighterMedia(input: {
  body: unknown;
  event: MonitoringEvent;
}): UfcFighterMediaCandidate[] {
  const root = asRecord(input.body);
  const canonicalStart = Date.parse(input.event.starts_at);
  if (!root || !Number.isFinite(canonicalStart)) return [];

  const candidates = asArray(root.events)
    .map(asRecord)
    .filter((event): event is UnknownRecord => Boolean(event))
    .map((sourceEvent) => {
      const sourceStart = eventStartMs(sourceEvent);
      if (sourceStart === null || Math.abs(sourceStart - canonicalStart) > 18 * 60 * 60 * 1000) {
        return { sourceEvent, matchedNames: 0 };
      }

      const matchedNames = asArray(sourceEvent.competitions)
        .map(asRecord)
        .filter((competition): competition is UnknownRecord => Boolean(competition))
        .flatMap((competition) => asArray(competition.competitors))
        .map(asRecord)
        .filter((competitor): competitor is UnknownRecord => Boolean(competitor))
        .filter((competitor) => Boolean(canonicalFighterForName(input.event, espnAthleteName(competitor))))
        .length;
      return { sourceEvent, matchedNames };
    })
    .filter((candidate) => candidate.matchedNames > 0);

  if (!candidates.length) return [];
  const maxMatches = Math.max(...candidates.map((candidate) => candidate.matchedNames));
  const best = candidates.filter((candidate) => candidate.matchedNames === maxMatches);
  if (best.length !== 1) return [];

  const mediaBySlug = new Map<string, UfcFighterMediaCandidate>();
  const selected = best[0]!.sourceEvent;
  for (const competition of asArray(selected.competitions).map(asRecord).filter((item): item is UnknownRecord => Boolean(item))) {
    for (const competitor of asArray(competition.competitors).map(asRecord).filter((item): item is UnknownRecord => Boolean(item))) {
      const sourceName = espnAthleteName(competitor);
      const canonical = canonicalFighterForName(input.event, sourceName);
      const athleteId = espnAthleteId(competitor);
      const photoUrl = espnHeadshotUrl(competitor, athleteId);
      if (!canonical || !/^\d+$/.test(athleteId)) continue;
      if (!/^https:\/\/a\.espncdn\.com\//i.test(photoUrl)) continue;
      if (/(silhouette|placeholder|default[-_]?avatar)/i.test(photoUrl)) continue;

      mediaBySlug.set(canonical.slug, {
        fighter_slug: canonical.slug,
        display_name: canonical.name,
        photo_url: photoUrl,
        source: "espn",
        source_page_url: `https://www.espn.com/mma/fighter/_/id/${athleteId}`,
        source_fighter_id: athleteId,
      });
    }
  }

  return [...mediaBySlug.values()];
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function attrValue(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  return decodeHtml(match?.[2] ?? "").trim();
}

function metaImage(html: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const identity = (attrValue(tag, "property") || attrValue(tag, "name")).toLowerCase();
    if (identity !== "og:image" && identity !== "twitter:image") continue;
    const content = attrValue(tag, "content");
    if (content) return content;
  }
  return "";
}

const ufcAthleteSlugAliases = new Map([
  ["tina-black", "valesca-machado"],
  ["mahammadali-osmanli", "mehemmedeli-osmanli"],
]);

export function ufcAthletePageUrl(fighterSlug: string) {
  const sourceSlug = ufcAthleteSlugAliases.get(fighterSlug) ?? fighterSlug;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sourceSlug)
    ? `https://www.ufc.com/athlete/${sourceSlug}`
    : null;
}

export function parseUfcAthletePhoto(input: {
  html: string;
  fighterSlug: string;
  displayName: string;
  sourcePageUrl: string;
}): UfcFighterMediaCandidate | null {
  if (!/^https:\/\/www\.ufc\.com\/athlete\/[a-z0-9-]+$/i.test(input.sourcePageUrl)) return null;
  const photoUrl = metaImage(input.html);
  if (!/^https:\/\//i.test(photoUrl)) return null;
  if (/(silhouette|placeholder|default[-_]?avatar|ufc[-_]?logo)/i.test(photoUrl)) return null;

  return {
    fighter_slug: input.fighterSlug,
    display_name: input.displayName,
    photo_url: photoUrl,
    source: "ufc",
    source_page_url: input.sourcePageUrl,
  };
}
