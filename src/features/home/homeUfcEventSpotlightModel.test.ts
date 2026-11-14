import { describe, expect, it } from "vitest";
import type { PickEvent, PickHistory } from "../picks/picksModel";
import type { RankingFighter } from "../rankings/rankingModel";
import { centralCalendarDay, rankedUfcEventDaySpotlights } from "./homeUfcEventSpotlightModel";

const ranked = [
  { slug: "ciryl-gane", displayName: "Ciryl Gane", rank: 54 },
  { slug: "amanda-nunes", displayName: "Amanda Nunes", rank: 1 },
  { slug: "kayla-harrison", displayName: "Kayla Harrison", rank: 13 },
] as RankingFighter[];

const event: PickEvent = {
  eventId: "ufc-334",
  sport: "mma",
  name: "UFC 334",
  subtitle: "Gane vs Hokit",
  venue: "",
  location: "",
  startsAt: "2026-11-15T02:00:00Z",
  locksAt: "2026-11-14T23:00:00Z",
  season: 2026,
  status: "upcoming",
  bouts: [
    {
      boutId: "gane-hokit", position: 1, weightClass: "Heavyweight Title",
      redFighterSlug: "ciryl-gane", redFighterName: "Ciryl Gane",
      blueFighterSlug: "josh-hokit", blueFighterName: "Josh Hokit",
      redAmericanOdds: null, blueAmericanOdds: null, winnerFighterSlug: null,
    },
    {
      boutId: "harrison-nunes", position: 2, weightClass: "Women's Bantamweight Title",
      redFighterSlug: "kayla-harrison", redFighterName: "Kayla Harrison",
      blueFighterSlug: "amanda-nunes", blueFighterName: "Amanda Nunes",
      redAmericanOdds: null, blueAmericanOdds: null, winnerFighterSlug: null,
    },
  ],
};

describe("UFC event-day HQ spotlight rotation selection", () => {
  it("uses Central time, including UFC main cards stored on the next UTC calendar day", () => {
    expect(centralCalendarDay(new Date("2026-11-15T02:00:00Z"))).toBe("2026-11-14");
    expect(centralCalendarDay(new Date("2026-11-15T08:00:00Z"))).toBe("2026-11-15");
    expect(rankedUfcEventDaySpotlights(event, null, ranked, "2026-11-14")
      .map(({ fighter }) => fighter.slug)).toEqual(["ciryl-gane", "kayla-harrison", "amanda-nunes"]);
  });

  it("shows only canonical HQ-ranked card fighters, with their real opponent and bout weight", () => {
    const selected = rankedUfcEventDaySpotlights(event, null, ranked, "2026-11-14");
    expect(selected[0]).toMatchObject({ fighter: { rank: 54 }, opponentName: "Josh Hokit", weightClass: "Heavyweight Title" });
    expect(selected[1]).toMatchObject({ opponentName: "Amanda Nunes", weightClass: "Women's Bantamweight Title" });
    expect(selected[2]).toMatchObject({ opponentName: "Kayla Harrison" });
    expect(selected).toHaveLength(3);
  });

  it("preserves the all-time fallback off event day and never shows a future card early", () => {
    expect(rankedUfcEventDaySpotlights(event, null, ranked, "2026-11-13")).toEqual([]);
    expect(rankedUfcEventDaySpotlights(event, null, ranked, "2026-11-15")).toEqual([]);
    expect(rankedUfcEventDaySpotlights(null, null, ranked, "2026-11-14")).toEqual([]);
  });

  it("keeps a completed fight-day rotation available from history if active Picks advances", () => {
    const history = {
      events: [{
        ...event,
        completedAt: "2026-11-15T05:00:00Z",
        record: {}, underdogLock: null, groupResults: [],
      }],
    } as unknown as PickHistory;
    const nextEvent = { ...event, eventId: "next", startsAt: "2026-11-22T02:00:00Z" };
    expect(rankedUfcEventDaySpotlights(nextEvent, history, ranked, "2026-11-14"))
      .toHaveLength(3);
  });

  it("skips cancelled fights and avoids duplicates", () => {
    const modified = {
      ...event,
      bouts: [
        { ...event.bouts[0]!, resultStatus: "cancelled" as const },
        event.bouts[1]!,
        { ...event.bouts[1]!, boutId: "duplicate", position: 3 },
      ],
    };
    expect(rankedUfcEventDaySpotlights(modified, null, ranked, "2026-11-14")
      .map(({ fighter }) => fighter.slug)).toEqual(["kayla-harrison", "amanda-nunes"]);
  });
});
