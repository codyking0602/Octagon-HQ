import { describe, expect, it } from "vitest";
import { chooseFootballPicksHeroImages } from "./footballPicksHeroSelection";

const gallery = [
  { src: "https://storage.test/pick-event-headers/football-picks-2026-10-20/event-header-gallery-2-1", aspectRatio: "1672 / 941" },
  { src: "https://storage.test/pick-event-headers/football-picks-2026-10-20/event-header-gallery-2-2", aspectRatio: "1672 / 941" },
];
const published = [
  "/assets/football/weekly/2026-10-20/nfl/game-header.webp",
  "/assets/football/weekly/2026-10-20/cfb/game-header.webp",
];

describe("Football Picks finished Game of the Week graphics", () => {
  it("displays both uploaded owner images rather than the published SeatGeek fallback", () => {
    expect(chooseFootballPicksHeroImages(gallery, published, [])).toEqual({
      images: gallery,
      fromGallery: true,
    });
  });
  it("keeps the remaining owner's poster when just one fails", () => {
    expect(chooseFootballPicksHeroImages(gallery, published, [gallery[0]!.src])).toEqual({
      images: [gallery[1]],
      fromGallery: true,
    });
  });
  it("falls back to verified weekly images when there is no gallery or all owner images fail", () => {
    const fallback = { images: published.map((src) => ({ src, aspectRatio: "16 / 9" })), fromGallery: false };
    expect(chooseFootballPicksHeroImages([], published, [])).toEqual(fallback);
    expect(chooseFootballPicksHeroImages(gallery, published, gallery.map((image) => image.src))).toEqual(fallback);
  });
  it("does not duplicate fallback pictures or create fake placeholders", () => {
    expect(chooseFootballPicksHeroImages([], [published[0]!, published[0]!], []).images).toHaveLength(1);
    expect(chooseFootballPicksHeroImages([], [], [])).toEqual({ images: [], fromGallery: false });
  });
});
