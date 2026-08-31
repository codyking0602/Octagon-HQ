import { describe, expect, it, vi } from "vitest";
import type { PickEvent } from "./picksModel";
import { PICK_EVENT_HEADER_BUCKET, PICK_EVENT_HEADER_MAX_IMAGES, pickEventPoster, pickEventPosters } from "./picksEventAssets";

vi.mock("../../lib/supabase", () => ({
  getSupabaseClient: () => ({
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://storage.test/${bucket}/${path}` },
        }),
      }),
    },
  }),
}));

const event: PickEvent = {
  eventId: "ufc-test-event",
  name: "UFC Fight Night",
  subtitle: "Red Fighter vs. Blue Fighter",
  venue: "Test Arena",
  location: "Dallas, Texas",
  startsAt: "2099-08-01T17:00:00.000Z",
  locksAt: "2099-08-01T17:00:00.000Z",
  season: 2026,
  status: "upcoming",
  headerStoragePath: "ufc-test-event/event-header",
  headerNaturalWidth: 2400,
  headerNaturalHeight: 1200,
  bouts: [{
    boutId: "red-blue",
    position: 1,
    weightClass: "Welterweight",
    redFighterSlug: "red-fighter",
    redFighterName: "Red Fighter",
    blueFighterSlug: "blue-fighter",
    blueFighterName: "Blue Fighter",
    redAmericanOdds: -150,
    blueAmericanOdds: 130,
    winnerFighterSlug: null,
  }],
};

describe("Picks persisted event header", () => {
  it("renders the persisted storage object at its stored native ratio", () => {
    expect(PICK_EVENT_HEADER_BUCKET).toBe("pick-event-headers");
    expect(PICK_EVENT_HEADER_MAX_IMAGES).toBe(4);
    expect(pickEventPoster(event)).toEqual({
      src: "https://storage.test/pick-event-headers/ufc-test-event/event-header",
      aspectRatio: "2400 / 1200",
    });
  });

  it("derives every image in a persisted gallery from the one canonical header pointer", () => {
    const galleryEvent = {
      ...event,
      sport: "football" as const,
      headerStoragePath: "football-week-1/event-header-gallery-3-1",
    };

    expect(pickEventPosters(galleryEvent)).toEqual([
      { src: "https://storage.test/pick-event-headers/football-week-1/event-header-gallery-3-1", aspectRatio: "2400 / 1200" },
      { src: "https://storage.test/pick-event-headers/football-week-1/event-header-gallery-3-2", aspectRatio: "2400 / 1200" },
      { src: "https://storage.test/pick-event-headers/football-week-1/event-header-gallery-3-3", aspectRatio: "2400 / 1200" },
    ]);
  });

  it("has no static or inferred poster fallback when header metadata is absent", () => {
    expect(pickEventPoster({
      ...event,
      headerStoragePath: null,
      headerNaturalWidth: null,
      headerNaturalHeight: null,
    })).toBeNull();
  });

  it("does not choose artwork from main-event fighter identity", () => {
    expect(pickEventPoster({
      ...event,
      bouts: [{
        ...event.bouts[0],
        redFighterSlug: "different-red",
        blueFighterSlug: "different-blue",
      }],
    })).toEqual(pickEventPoster(event));
  });
});
