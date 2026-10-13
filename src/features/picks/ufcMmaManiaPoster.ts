import type { PickEvent } from "./picksModel";
import weeklyPosters from "./ufcMmaManiaWeeklyPosters.json";

// Approved horizontal event art from MMA Mania's UFC Posters archive.
// Link to the publisher; do not generate a replacement fighter image.
export const MMA_MANIA_EDMONTON_POSTER = {
  title: "Buckley vs Malott",
  source: "https://www.mmamania.com/ufc-strikeforce-posters/476183/ufc-edmonton-poster-slaps-buckley-vs-malott-oct-17-canada",
  src: "https://platform.mmamania.com/wp-content/uploads/sites/110/2026/10/HTgg68BWAAAl9gb.jpeg?quality=90&strip=all&crop=0%2C3.4613147178592%2C100%2C93.077370564282&w=1200",
  aspectRatio: "1200 / 628",
} as const;

export function reviewedMmaManiaPoster(event: PickEvent | null, now = new Date()) {
  const weekly = scheduledMmaManiaPosters(event, now);
  if (weekly) return weekly;
  const timestamp = now.getTime();
  if (!Number.isFinite(timestamp)
    || timestamp < Date.parse("2026-10-12T00:00:00-05:00")
    || timestamp >= Date.parse("2026-10-18T00:00:00-05:00")) return null;
  if (event) {
    if (event.sport === "football") return null;
    const title = `${event.name} ${event.subtitle}`.toLowerCase();
    if (!title.includes("buckley") || !title.includes("malott")) return null;
    const start = Date.parse(event.startsAt);
    if (!Number.isFinite(start)
      || Math.abs(start - Date.parse("2026-10-17T19:00:00-05:00")) > 24 * 60 * 60 * 1000) return null;
  }
  return MMA_MANIA_EDMONTON_POSTER;
}

/**
 * Editorial monitor stages source-verified MMA Mania graphics in the weekly JSON
 * ledger. The client will not expose them until Tuesday at midnight in Chicago.
 * Keep the already approved Edmonton poster above as a one-week legacy record.
 */
export interface WeeklyMmaManiaPoster {
  eventTitleContains: [string, string];
  eventStartsAt: string;
  releaseAt: string;
  expiresAt: string;
  source: string;
  src: string;
  aspectRatio: string;
}

function chicagoMidnightTuesday(iso: string): boolean {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return false;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", weekday: "short", hour: "2-digit",
    minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(time));
  const part = (name: string) => parts.find((item) => item.type === name)?.value;
  return part("weekday") === "Tue" && part("hour") === "00" && part("minute") === "00";
}

export function verifiedWeeklyMmaManiaPoster(
  entry: WeeklyMmaManiaPoster, event: PickEvent | null, now: Date,
) {
  const { eventTitleContains: names, eventStartsAt, releaseAt, expiresAt, source, src, aspectRatio } = entry;
  const release = Date.parse(releaseAt);
  const expiry = Date.parse(expiresAt);
  const starts = Date.parse(eventStartsAt);
  const current = now.getTime();
  if (!Array.isArray(names) || names.length !== 2
    || names.some((name) => !name || name.trim().length < 3)
    || !chicagoMidnightTuesday(releaseAt)
    || ![release, expiry, starts, current].every(Number.isFinite)
    || !(release < expiry && release < starts && expiry > starts)
    || current < release || current >= expiry) return null;
  try {
    const image = new URL(src);
    const page = new URL(source);
    if (image.protocol !== "https:" || image.hostname !== "platform.mmamania.com"
      || page.protocol !== "https:" || page.hostname !== "www.mmamania.com"
      || !/^\d{2,4}\s*\/\s*\d{2,4}$/.test(aspectRatio)) return null;
  } catch { return null; }
  if (event) {
    if (event.sport === "football") return null;
    const title = `${event.name} ${event.subtitle}`.toLowerCase();
    if (!names.every((name) => title.includes(name.trim().toLowerCase()))) return null;
    const eventStart = Date.parse(event.startsAt);
    if (!Number.isFinite(eventStart) || Math.abs(eventStart - starts) > 24 * 60 * 60 * 1000) return null;
  }
  return { source, src, aspectRatio };
}

// Standalone source review can be tested before publishing a JSON record.
export function scheduledMmaManiaPosters(
  event: PickEvent | null, now = new Date(),
  records: readonly WeeklyMmaManiaPoster[] = weeklyPosters as WeeklyMmaManiaPoster[],
) {
  return records.map((record) => verifiedWeeklyMmaManiaPoster(record, event, now))
    .find((poster) => poster !== null) ?? null;
}
