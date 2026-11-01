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
