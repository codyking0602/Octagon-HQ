import { describe, expect, it } from "vitest";
import type { PickEvent } from "./picksModel";
import { APPROVED_MMA_MANIA_POSTERS, MMA_MANIA_EDMONTON_POSTER, reviewedMmaManiaPoster } from "./ufcMmaManiaPoster";

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
  it("keeps publisher posters event-bound and never leaks the old one", () => {
    expect(APPROVED_MMA_MANIA_POSTERS).toHaveLength(1);
    expect(APPROVED_MMA_MANIA_POSTERS[0]?.fighterNames).toEqual(["buckley", "malott"]);
    expect(reviewedMmaManiaPoster(null, new Date("2026-10-18T05:00:01Z"))).toBeNull();
    expect(reviewedMmaManiaPoster({ ...event, subtitle: "Other vs Other" }, onFightWeek)).toBeNull();
  });

  it("uses only vetted MMA Mania publisher hosts", () => {
    expect(new URL(MMA_MANIA_EDMONTON_POSTER.src).hostname).toBe("platform.mmamania.com");
    expect(new URL(MMA_MANIA_EDMONTON_POSTER.source).hostname).toBe("www.mmamania.com");
  });
});
