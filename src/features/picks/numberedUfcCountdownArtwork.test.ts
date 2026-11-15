import { describe, expect, it } from "vitest";
import { numberedUfcCountdownArtwork, numberedUfcCountdownArtworkCandidates } from "./numberedUfcCountdownArtwork";

const current = {
  name: "UFC 334", matchup: "Ciryl Gane vs. Josh Hokit",
  startsAt: "2026-11-15T02:00:00.000Z", imageUrl: null,
};

describe("next numbered UFC Picks artwork", () => {
  it("shows only the reviewed, identity-bound event poster", () => {
    expect(numberedUfcCountdownArtwork(current)).toContain("fighttime.ru/media/");
    expect(numberedUfcCountdownArtworkCandidates(current)).toHaveLength(2);
    expect(numberedUfcCountdownArtwork({ ...current, matchup: "Ciryl Gane vs. Alex Pereira" })).toBeNull();
    expect(numberedUfcCountdownArtwork({ ...current, name: "UFC 335" })).toBeNull();
    expect(numberedUfcCountdownArtwork({ ...current, startsAt: "2026-12-15T02:00:00Z" })).toBeNull();
    expect(numberedUfcCountdownArtwork({ ...current, name: "UFC Fight Night" })).toBeNull();
  });

  it("shows the reviewed UFC 335 promotional photo only for the exact Dec 12 Oliveira-Lopes card", () => {
    const upcoming = {
      name: "UFC 335",
      matchup: "Oliveira vs. Lopes",
      // Dec 12 at 8 PM CST is Dec 13 at 02:00 UTC.
      startsAt: "2026-12-13T02:00:00.000Z",
      imageUrl: null,
    };
    expect(numberedUfcCountdownArtwork(upcoming))
      .toBe("https://d6isf1yxni2j5.cloudfront.net/large_INFO_7_DOS_FOTOS_70_c0cb9dd7bc.jpg");
    expect(numberedUfcCountdownArtworkCandidates(upcoming)).toHaveLength(2);
    expect(numberedUfcCountdownArtwork({ ...upcoming, matchup: "Oliveira vs. Someone Else" })).toBeNull();
    expect(numberedUfcCountdownArtwork({ ...upcoming, name: "UFC 336" })).toBeNull();
    expect(numberedUfcCountdownArtwork({ ...upcoming, startsAt: "2026-12-20T02:00:00.000Z" })).toBeNull();
    const official = "https://www.ufc.com/sites/default/files/event/ufc-335-poster.jpg";
    expect(numberedUfcCountdownArtwork({ ...upcoming, imageUrl: official })).toBe(official);
    expect(numberedUfcCountdownArtworkCandidates({ ...upcoming, imageUrl: official })).toHaveLength(3);
  });

  it("prefers event-specific official UFC assets over the reviewed poster", () => {
    const official = "https://www.ufc.com/sites/default/files/event/ufc-334-poster.jpg";
    expect(numberedUfcCountdownArtwork({ ...current, imageUrl: official })).toBe(official);
    expect(numberedUfcCountdownArtworkCandidates({ ...current, imageUrl: official })).toHaveLength(3);
  });

  it("never renders arbitrary event artwork or insecure image URLs", () => {
    expect(numberedUfcCountdownArtwork({
      ...current,
      name: "UFC 335", imageUrl: "https://evil.example/ufc-335.jpg",
    })).toBeNull();
    expect(numberedUfcCountdownArtwork({
      ...current,
      name: "UFC 335", imageUrl: "http://www.ufc.com/ufc-335.jpg",
    })).toBeNull();
  });
});
