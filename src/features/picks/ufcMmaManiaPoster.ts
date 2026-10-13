import type { PickEvent } from "./picksModel";

// Only authentic, individually verified horizontal artwork from MMA Mania's UFC
// poster archive. The weekly research task adds an approved catalog entry;
// neither the frontend nor its publisher fabricates fighter imagery.
export const MMA_MANIA_EDMONTON_POSTER = {
  title: "Buckley vs Malott",
  source: "https://www.mmamania.com/ufc-strikeforce-posters/476183/ufc-edmonton-poster-slaps-buckley-vs-malott-oct-17-canada",
  src: "https://platform.mmamania.com/wp-content/uploads/sites/110/2026/10/HTgg68BWAAAl9gb.jpeg?quality=90&strip=all&crop=0%2C3.4613147178592%2C100%2C93.077370564282&w=1200",
  aspectRatio: "1200 / 628",
} as const;

interface ApprovedUfcPoster {
  title: string;
  source: string;
  src: string;
  aspectRatio: string;
  /** Exact Central Tuesday cutover, already resolved to offset-aware ISO time. */
  activeAt: string;
  expiresAt: string;
  eventStartsAt: string;
  fighterNames: readonly [string, string];
}

/** Append verified next-event MMA Mania posters here, never replacing another event. */
export const APPROVED_MMA_MANIA_POSTERS: readonly ApprovedUfcPoster[] = [
  {
    ...MMA_MANIA_EDMONTON_POSTER,
    activeAt: "2026-10-12T00:00:00-05:00", // Existing owner-approved fight-week exception.
    expiresAt: "2026-10-18T00:00:00-05:00",
    eventStartsAt: "2026-10-17T19:00:00-05:00",
    fighterNames: ["buckley", "malott"],
  },
];

function verifiedPublisherSource(item: ApprovedUfcPoster): boolean {
  try {
    const page = new URL(item.source);
    const image = new URL(item.src);
    return page.protocol === "https:" && page.hostname === "www.mmamania.com"
      && image.protocol === "https:" && image.hostname === "platform.mmamania.com"
      && image.pathname.includes("/wp-content/uploads/")
      && /^[0-9]+ \/ [0-9]+$/.test(item.aspectRatio);
  } catch {
    return false;
  }
}

export function reviewedMmaManiaPoster(event: PickEvent | null, now = new Date()) {
  const timestamp = now.getTime();
  if (!Number.isFinite(timestamp) || event?.sport === "football") return null;
  return APPROVED_MMA_MANIA_POSTERS
    .filter((item) => timestamp >= Date.parse(item.activeAt)
      && timestamp < Date.parse(item.expiresAt)
      && verifiedPublisherSource(item))
    .sort((a, b) => Date.parse(b.activeAt) - Date.parse(a.activeAt))
    .find((item) => {
      if (!event) return true;
      const title = `${event.name} ${event.subtitle}`.toLowerCase();
      if (!item.fighterNames.every((name) => title.includes(name))) return false;
      const start = Date.parse(event.startsAt);
      return Number.isFinite(start)
        && Math.abs(start - Date.parse(item.eventStartsAt)) <= 24 * 60 * 60 * 1000;
    }) ?? null;
}
