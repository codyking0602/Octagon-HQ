import type { PickEventPoster } from "./picksEventAssets";

export interface FootballPicksHeroSelection {
  images: PickEventPoster[];
  fromGallery: boolean;
}

/** The owner-uploaded Picks gallery wins the whole carousel. If every upload
 * fails to load, the verified published weekly art takes over automatically.
 * Never place HTML text or team pills on top of these finished graphics. */
export function chooseFootballPicksHeroImages(
  ownerGallery: readonly PickEventPoster[],
  weeklyFallbacks: readonly string[],
  failedGallerySources: readonly string[],
): FootballPicksHeroSelection {
  const availableOwner = ownerGallery.filter((image) => !failedGallerySources.includes(image.src));
  if (availableOwner.length) return { images: [...availableOwner], fromGallery: true };
  return {
    images: [...new Set(weeklyFallbacks)].map((src) => ({ src, aspectRatio: "16 / 9" })),
    fromGallery: false,
  };
}
