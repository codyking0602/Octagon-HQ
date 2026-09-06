import { describe, expect, it } from "vitest";
import { footballGreatnessTierForItem } from "./footballGreatnessTier";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";

function tierFor(packId: Parameters<typeof getFootballRankFivePack>[0], name: string) {
  const pack = getFootballRankFivePack(packId);
  const item = pack.items.find((candidate) => candidate.name === name);
  expect(item, `${pack.name}: ${name}`).toBeDefined();
  return footballGreatnessTierForItem(item!);
}

function tierCounts(packId: Parameters<typeof getFootballRankFivePack>[0]) {
  const counts = new Map<string, number>();
  for (const item of getFootballRankFivePack(packId).items) {
    const tier = footballGreatnessTierForItem(item);
    counts.set(tier, (counts.get(tier) ?? 0) + 1);
  }
  return counts;
}

describe("football comparison pool finishing pass", () => {
  it("keeps the CFB running-back pool deep while fixing the obvious middle-tier compression", () => {
    const pack = getFootballRankFivePack("college-running-backs");
    expect(pack.items.length).toBeGreaterThanOrEqual(54);
    expect(tierFor("college-running-backs", "Ezekiel Elliott")).toBe("great");
    expect(tierFor("college-running-backs", "Dalvin Cook")).toBe("great");
    expect(tierFor("college-running-backs", "Leonard Fournette")).toBe("good");
  });

  it("gives CFB coaches recognizable lower-half variety without leaving obvious legends below it", () => {
    const pack = getFootballRankFivePack("college-head-coaches");
    const counts = tierCounts("college-head-coaches");

    expect(pack.items.length).toBeGreaterThanOrEqual(46);
    expect(tierFor("college-head-coaches", "Bobby Bowden")).toBe("elite");
    expect(tierFor("college-head-coaches", "Steve Spurrier")).toBe("elite");
    expect(tierFor("college-head-coaches", "Lou Holtz")).toBe("great");
    expect(tierFor("college-head-coaches", "Scott Frost")).toBe("below-average");
    expect(tierFor("college-head-coaches", "Willie Taggart")).toBe("below-average");
    expect(tierFor("college-head-coaches", "Derek Dooley")).toBe("bad");
    expect(tierFor("college-head-coaches", "Charlie Weis")).toBe("bad");
    expect(counts.get("average") ?? 0).toBeLessThanOrEqual(12);
    expect((counts.get("below-average") ?? 0) + (counts.get("bad") ?? 0)).toBeGreaterThanOrEqual(7);
  });

  it("makes the existing canonical NFL era universe playable across the middle and lower tiers", () => {
    const pack = getFootballRankFivePack("nfl-team-eras");
    const counts = tierCounts("nfl-team-eras");

    expect(pack.items).toHaveLength(28);
    expect(counts.get("good") ?? 0).toBeGreaterThanOrEqual(7);
    expect(counts.get("average") ?? 0).toBeGreaterThanOrEqual(4);
    expect(counts.get("below-average") ?? 0).toBeGreaterThanOrEqual(1);
    expect(tierFor("nfl-team-eras", "New Orleans Saints — Brees/Payton era")).toBe("good");
    expect(tierFor("nfl-team-eras", "Buffalo Bills — Allen/McDermott contender era")).toBe("below-average");
  });
});
