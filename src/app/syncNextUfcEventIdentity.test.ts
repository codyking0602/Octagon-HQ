import { describe, expect, it } from "vitest";
import {
  chooseEventArticle,
  matchEventIdentity,
  rankDiscoveryCandidates,
  type ArticleIdentity,
  type EventIdentity,
} from "../../supabase/functions/sync-next-ufc-event/eventIdentity";

const event: EventIdentity = {
  name: "UFC Fight Night",
  subtitle: "Aleksandar Rakic vs. Johnny Walker",
  venue: "Belgrade Arena",
  location: "Belgrade, Serbia",
  starts_at: "2026-08-01T19:00:00.000Z",
};

function article(overrides: Partial<ArticleIdentity> = {}): ArticleIdentity {
  return {
    url: "https://www.mmamania.com/2026/7/26/ufc-fight-night-fight-card-start-time-and-lineup",
    title: "UFC Fight Night fight card",
    metadata: "MMA Mania event preview",
    body: "Aleksandar Rakic vs Johnny Walker headlines on August 1, 2026 in Belgrade, Serbia.",
    cardDateText: "The UFC event takes place August 1, 2026.",
    publishedAt: "2026-07-26T10:00:00Z",
    usedSectionHeadings: true,
    boutCount: 12,
    ...overrides,
  };
}

describe("sync-next-ufc-event multi-signal identity matching", () => {
  it("accepts a numbered event only when its exact number has a section-aware card", () => {
    const numbered = { ...event, name: "UFC 330", subtitle: "Fighter One vs. Fighter Two" };
    const result = matchEventIdentity(numbered, article({ title: "UFC 330 complete fight card", body: "", cardDateText: "" }));

    expect(result.accepted).toBe(true);
    expect(result.signals).toContain("exact-event-number");
  });

  it("identifies a headliner-named Fight Night", () => {
    const result = matchEventIdentity(event, article());

    expect(result.accepted).toBe(true);
    expect(result.signals).toEqual(expect.arrayContaining(["event-date", "both-headliners"]));
  });

  it("identifies a location-branded Fight Night from date, city, and country", () => {
    const result = matchEventIdentity(event, article({
      title: "UFC Fight Night Belgrade",
      body: "The card is staged in Belgrade, Serbia.",
    }));

    expect(result.accepted).toBe(true);
    expect(result.signals).toContain("location:2");
  });

  it("matches the two headliners in reversed order", () => {
    const result = matchEventIdentity(event, article({ body: "Johnny Walker vs Aleksandar Rakic on August 1, 2026." }));

    expect(result.accepted).toBe(true);
    expect(result.signals).toContain("both-headliners");
  });

  it("uses article body identity when the URL is only a generic dated path", () => {
    const result = matchEventIdentity(event, article({
      url: "https://www.mmamania.com/2026/7/26/123456/generic-ufc-fight-card",
      title: "UFC fight card, start time and lineup",
    }));

    expect(result.accepted).toBe(true);
  });

  it("ranks the matching location article into a bounded fetch set", () => {
    const generic = Array.from({ length: 12 }, (_, index) => ({
      url: `https://www.mmamania.com/ufc-fight-cards/${index}/generic-card-${index}`,
      discoveryText: `Latest UFC fight card ${index}`,
      order: index,
    }));
    const belgrade = {
      url: "https://www.mmamania.com/ufc-fight-cards/446488/latest-ufc-belgrade-fight-card",
      discoveryText: "Latest UFC Belgrade Fight Card, Paramount+ Lineup",
      order: 12,
    };

    const ranked = rankDiscoveryCandidates(event, [...generic, belgrade], 8);

    expect(ranked).toHaveLength(8);
    expect(ranked[0].url).toBe(belgrade.url);
    expect(ranked[0].discoveryScore).toBeGreaterThan(ranked[1].discoveryScore);
  });

  it("parses MMA Mania's labeled abbreviated event date without using an update date", () => {
    const medicEvent: EventIdentity = {
      name: "UFC Fight Night",
      subtitle: "Uros Medic vs. Daniel Rodriguez",
      venue: "Belgrade Arena",
      location: "Belgrade, Serbia",
      starts_at: "2026-08-01T19:00:00.000Z",
    };
    const result = matchEventIdentity(medicEvent, article({
      title: "Latest UFC Belgrade fight card | Medic vs. Rodriguez",
      metadata: "Updated Jul. 29, 2026",
      body: "Updated Jul. 29, 2026. Event: UFC Belgrade: Medic vs. Rodriguez Date: Sat., Aug. 1, 2026 Location: Belgrade Arena in Belgrade, Serbia Uros Medic vs Daniel Rodriguez",
      cardDateText: "",
      publishedAt: "2026-07-29T10:00:00Z",
    }));

    expect(result.accepted).toBe(true);
    expect(result.date).toBe("match");
    expect(result.signals).toEqual(expect.arrayContaining(["event-date", "both-headliners"]));
  });

  it("does not treat an advance article publication timestamp as a conflicting event date", () => {
    const publishedAt = "2026-07-26T10:00:00Z";
    const result = matchEventIdentity(event, article({
      body: "Aleksandar Rakic vs Johnny Walker preview in Belgrade, Serbia.",
      cardDateText: `UFC Fight Night preview ${publishedAt}`,
      publishedAt,
    }));

    expect(result.accepted).toBe(false);
    expect(result.date).toBe("unknown");
    expect(result.reason).not.toContain("date conflicts");
  });

  it("rejects competing candidates with similar confidence as ambiguous", () => {
    const first = { id: "first", match: matchEventIdentity(event, article()) };
    const second = { id: "second", match: matchEventIdentity(event, article({ url: "https://www.mmamania.com/second" })) };

    expect(chooseEventArticle([first, second])).toMatchObject({ candidate: null });
    expect(chooseEventArticle([first, second]).error).toMatch(/^ambiguity:/);
  });

  it("rejects a candidate whose stated card date conflicts", () => {
    const result = matchEventIdentity(event, article({
      body: "Aleksandar Rakic vs Johnny Walker preview in Belgrade, Serbia.",
      cardDateText: "The UFC event takes place August 8, 2026.",
    }));

    expect(result.accepted).toBe(false);
    expect(result.date).toBe("conflict");
    expect(result.reason).toContain("date conflicts");
  });

  it("does not accept generic terms or an unsectioned card", () => {
    const generic = article({ body: "UFC fight card main card prelims", cardDateText: "", usedSectionHeadings: false });

    expect(matchEventIdentity(event, generic).reason).toMatch(/^card parsing:/);
  });
});
