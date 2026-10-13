import type { PickEvent } from "./picksModel";

// Approved horizontal event art from MMA Mania's UFC Posters archive.
// Link to the publisher; do not generate a replacement fighter image.
export const MMA_MANIA_EDMONTON_POSTER = {
  title: "Buckley vs Malott",
  source: "https://www.mmamania.com/ufc-strikeforce-posters/476183/ufc-edmonton-poster-slaps-buckley-vs-malott-oct-17-canada",
  src: "https://platform.mmamania.com/wp-content/uploads/sites/110/2026/10/HTgg68BWAAAl9gb.jpeg?quality=90&strip=all&crop=0%2C3.4613147178592%2C100%2C93.077370564282&w=1200",
  aspectRatio: "1200 / 628",
} as const;

export function reviewedMmaManiaPoster(event: PickEvent | null, now = new Date()) {
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
