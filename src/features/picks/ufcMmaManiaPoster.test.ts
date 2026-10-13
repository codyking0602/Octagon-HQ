import { describe, expect, it } from "vitest";
import type { PickEvent } from "./picksModel";
import { MMA_MANIA_EDMONTON_POSTER, reviewedMmaManiaPoster, verifiedWeeklyMmaManiaPoster } from "./ufcMmaManiaPoster";

const onFightWeek = new Date("2026-10-13T03:00:00Z");
const event = {
  name: "UFC Fight Night",
  subtitle: "Buckley vs Malott",
  startsAt: "2026-10-17T19:00:00-05:00",
  sport: "mma",
} as PickEvent;

describe("publisher-sourced UFC poster", () => {
  it("surfaces the reviewed horizontal MMA Mania art during fight week before Picks is staged", () => {
    expect(reviewedMmaManiaPoster(null, onFightWeek)).toMatchObject({
      src: MMA_MANIA_EDMONTON_POSTER.src,
      aspectRatio: "1200 / 628",
      source: MMA_MANIA_EDMONTON_POSTER.source,
    });
  });
  it("matches only the actual Buckley–Malott UFC event", () => {
    expect(reviewedMmaManiaPoster(event, onFightWeek)).not.toBeNull();
    expect(reviewedMmaManiaPoster({ ...event, subtitle: "Fighter A vs Fighter B" }, onFightWeek)).toBeNull();
    expect(reviewedMmaManiaPoster({ ...event, sport: "football" }, onFightWeek)).toBeNull();
    expect(reviewedMmaManiaPoster({ ...event, startsAt: "2026-11-10T19:00:00-05:00" }, onFightWeek)).toBeNull();
  });
  it("expires rather than retaining an unrelated event poster", () => {
    expect(reviewedMmaManiaPoster(null, new Date("2026-10-19T01:00:00Z"))).toBeNull();
    expect(reviewedMmaManiaPoster(null, new Date("2026-10-10T01:00:00Z"))).toBeNull();
  });
  it("holds future verified MMA Mania posters until Tuesday midnight Central and binds the exact fight", () => {
    const candidate = {
      eventTitleContains: ["Example", "Opponent"] as [string, string],
      eventStartsAt: "2026-10-24T19:00:00-05:00",
      releaseAt: "2026-10-20T00:00:00-05:00",
      expiresAt: "2026-10-26T00:00:00-05:00",
      source: "https://www.mmamania.com/ufc-poster/example",
      src: "https://platform.mmamania.com/wp-content/uploads/valid-horizontal.jpeg",
      aspectRatio: "1200 / 628",
    };
    const fight = { ...event, subtitle: "Example vs Opponent", startsAt: candidate.eventStartsAt };
    expect(verifiedWeeklyMmaManiaPoster(candidate, fight, new Date("2026-10-20T04:59:59Z"))).toBeNull();
    expect(verifiedWeeklyMmaManiaPoster(candidate, fight, new Date("2026-10-20T05:00:00Z"))).toMatchObject({
      src: candidate.src,
    });
    expect(verifiedWeeklyMmaManiaPoster(candidate, { ...fight, subtitle: "Different vs Opponent" }, new Date("2026-10-20T05:00:00Z"))).toBeNull();
    expect(verifiedWeeklyMmaManiaPoster({ ...candidate, src: "https://fake.example/photo.jpg" }, fight, new Date("2026-10-20T05:00:00Z"))).toBeNull();
    expect(verifiedWeeklyMmaManiaPoster({ ...candidate, releaseAt: "2026-10-19T00:00:00-05:00" }, fight, new Date("2026-10-20T05:00:00Z"))).toBeNull();
  });

  it("uses only vetted MMA Mania publisher hosts", () => {
    expect(new URL(MMA_MANIA_EDMONTON_POSTER.src).hostname).toBe("platform.mmamania.com");
    expect(new URL(MMA_MANIA_EDMONTON_POSTER.source).hostname).toBe("www.mmamania.com");
  });
});
