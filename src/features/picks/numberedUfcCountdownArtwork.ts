import numberedPublisherPosters from "./ufcNumberedCountdownPosters.json";

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
  {
    name: "UFC 335",
    firstName: "oliveira",
    secondName: "lopes",
    // The main-card start is Dec 12 in Las Vegas, Dec 13 in UTC.
    date: "2026-12-13",
    // Official UFC 335 promotional poster featuring Oliveira/Lopes and
    // Pavlovich/Pereira, reproduced by this independent publisher.
    source: "https://www.info7.mx/deportes/confirman-los-primeros-combates-para-ufc-335-en-las-vegas/2692211111",
    src: [
      "https://d6isf1yxni2j5.cloudfront.net/large_INFO_7_DOS_FOTOS_70_c0cb9dd7bc.jpg",
      // Second independently published crop of the official Oliveira/Lopes promo.
      "https://s.yimg.com/lo/mysterio/api/d86b92104cdac02cd640b46e33bc0f6cf4f632d5d66d17cf5f7886253407f4b0/lightyear_networkapi/resizefill_w1080_h1350%3Bquality_80%3Bformat_webp/https%3A/media.zenfs.com/en/sb_nation_articles_115/db0a2fd4d9ae8e37d73518befd341cea.jpg",
    ],
  },
] as const;

interface PublisherNumberedPoster {
  name: string;
  firstName: string;
  secondName: string;
  date: string;
  source: string;
  src: string;
}

function centralEventDate(iso: string) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(time));
  const part = (name: string) => parts.find((p) => p.type === name)?.value ?? "";
  return [part("year"), part("month"), part("day")].join("-");
}

function verifiedPublisherNumberedPoster(
  event: CountdownArtworkEvent,
  records: readonly PublisherNumberedPoster[],
) {
  const matchup = event.matchup.toLowerCase().split(/\s+vs\.?\s+/);
  if (matchup.length !== 2) return null;
  const surnames = matchup.map((part) => part.trim().split(/\s+/).at(-1) ?? "");
  const date = centralEventDate(event.startsAt);
  for (const record of records) {
    if (record.name !== event.name || record.date !== date
      || !/^[a-z'-]{3,}$/i.test(record.firstName)
      || !/^[a-z'-]{3,}$/i.test(record.secondName)
      || surnames[0] !== record.firstName && surnames[1] !== record.firstName
      || surnames[0] !== record.secondName && surnames[1] !== record.secondName) continue;
    try {
      const source = new URL(record.source);
      const image = new URL(record.src);
      const number = event.name.match(/^UFC (\d{3})$/)?.[1];
      if (!number || source.protocol !== "https:" || source.hostname !== "www.mmamania.com"
        || !new RegExp("^/ufc-strikeforce-posters/\\d+/.*\\bufc-" + number + "\\b", "i").test(source.pathname)
        || image.protocol !== "https:" || image.hostname !== "platform.mmamania.com"
        || !/\.(?:jpe?g|png|webp)$/i.test(image.pathname)) continue;
      return image.href;
    } catch { /* Invalid or untrusted generated source: ignore it. */ }
  }
  return null;
}

function validatedHttpsArtwork(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    // Allow only the UFC's official media origins from the backend, or
    // the narrowly reviewed promotional source listed above.
    if (url.protocol !== "https:") return null;
    if (["ufc.com", "www.ufc.com", "dmxg5wxfqgb4u.cloudfront.net", "fighttime.ru", "ringside24.com", "d6isf1yxni2j5.cloudfront.net", "s.yimg.com, "platform.mmamania.com""].includes(url.hostname)) {
      return url.toString();
    }
  } catch { /* Fallback below. */ }
  return null;
}

export function numberedUfcCountdownArtworkCandidates(
  event: CountdownArtworkEvent | null,
  published: readonly PublisherNumberedPoster[] = numberedPublisherPosters as PublisherNumberedPoster[],
): string[] {
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

  const publisher = verifiedPublisherNumberedPoster(event, published);
  const sources = [official, ...(reviewed?.src ?? []), publisher]
    .map(validatedHttpsArtwork)
    .filter((url): url is string => Boolean(url));
  return [...new Set(sources)];
}

export function numberedUfcCountdownArtwork(event: CountdownArtworkEvent | null) {
  return numberedUfcCountdownArtworkCandidates(event)[0] ?? null;
}
