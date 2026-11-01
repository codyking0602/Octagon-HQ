/**
 * The countdown is NOT a published Picks card. Its artwork is allowed only
 * when the source is associated with the exact upcoming numbered event.
 *
 * Official UFC event imagery is preferred when returned by the calendar.
 * The small reviewed ledger supplies a narrowly-scoped event-specific visual
 * when UFC.com's event page cannot be read by Cloudflare. Never reuse a poster
 * for a different card, date, or headliner.
 */
export interface CountdownArtworkEvent {
  name: string;
  matchup: string;
  startsAt: string;
  imageUrl: string | null;
}

const REVIEWED_COUNTDOWN_ART = [
  {
    name: "UFC 334",
    firstName: "gane",
    secondName: "hokit",
    date: "2026-11-15",
    // UFC 334 promotional fight poster, reproduced in this reporting source.
    source: "https://fighttime.ru/news/item/44052-v-boyu-sirila-gana-i-dzhosha-khokita-opredelilsya-favorit.html",
    src: [
      "https://fighttime.ru/media/k2/items/webp/cache/b765efadf64015917965f8e88b571871_XL.webp?v=4",
      // Independent second publication of the same UFC 334 promotional poster.
      "https://ringside24.com/media/post/b034e2ed7b228c0041519c9da5e5721exl_slug.jpg",
    ],
  },
] as const;

function validatedHttpsArtwork(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    // Allow only the UFC's official media origins from the backend, or
    // the narrowly reviewed promotional source listed above.
    if (url.protocol !== "https:") return null;
    if (["ufc.com", "www.ufc.com", "dmxg5wxfqgb4u.cloudfront.net", "fighttime.ru", "ringside24.com"].includes(url.hostname)) {
      return url.toString();
    }
  } catch { /* Fallback below. */ }
  return null;
}

export function numberedUfcCountdownArtworkCandidates(event: CountdownArtworkEvent | null): string[] {
  if (!event || !/^UFC \d{3,4}$/.test(event.name)) return [];

  const official = validatedHttpsArtwork(event.imageUrl);
  const eventDate = event.startsAt.slice(0, 10);
  const matchup = event.matchup.toLowerCase();
  const reviewed = REVIEWED_COUNTDOWN_ART.find((poster) => (
    poster.name === event.name &&
    poster.date === eventDate &&
    matchup.includes(poster.firstName) &&
    matchup.includes(poster.secondName)
  ));

  const sources = [official, ...(reviewed?.src ?? [])]
    .map(validatedHttpsArtwork)
    .filter((url): url is string => Boolean(url));
  return [...new Set(sources)];
}

export function numberedUfcCountdownArtwork(event: CountdownArtworkEvent | null) {
  return numberedUfcCountdownArtworkCandidates(event)[0] ?? null;
}
