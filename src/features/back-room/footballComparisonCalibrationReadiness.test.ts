import { describe, expect, it } from "vitest";
import { footballGreatnessTierForItem } from "./footballGreatnessTier";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";

function item(packId: Parameters<typeof getFootballRankFivePack>[0], name: string) {
  const row = getFootballRankFivePack(packId).items.find((candidate) => candidate.name === name);
  expect(row, `${packId}:${name}`).toBeDefined();
  return row!;
}

function largestGreatnessTierShare(packId: Parameters<typeof getFootballRankFivePack>[0]) {
  const pack = getFootballRankFivePack(packId);
  const counts = new Map<string, number>();
  for (const row of pack.items) {
    const tier = footballGreatnessTierForItem(row);
    counts.set(tier, (counts.get(tier) ?? 0) + 1);
  }
  return Math.max(...counts.values()) / pack.items.length;
}

describe("Football reviewed-profile calibration readiness", () => {
  it("preserves the established QB historical floor while QB gets its dedicated audit", () => {
    expect(item("nfl-quarterbacks", "Steve McNair").rating).toBeGreaterThanOrEqual(70);
    expect(item("nfl-quarterbacks", "Joe Namath").rating).toBeGreaterThanOrEqual(70);
    expect(item("nfl-quarterbacks", "Andy Dalton").rating).toBe(62);
  });

  it("preserves the approved RB and WR tier judgments", () => {
    expect(footballGreatnessTierForItem(item("nfl-running-backs", "Frank Gore"))).toBe("good");
    expect(footballGreatnessTierForItem(item("nfl-wide-receivers", "Antonio Brown"))).toBe("elite");
    expect(footballGreatnessTierForItem(item("nfl-wide-receivers", "Julio Jones"))).toBe("elite");
  });

  it("keeps generated tight ends below the reviewed historical anchors they were eclipsing", () => {
    const ditka = item("nfl-tight-ends", "Mike Ditka");
    const kittle = item("nfl-tight-ends", "George Kittle");
    expect(item("nfl-tight-ends", "Benjamin Watson").rating).toBeLessThan(ditka.rating);
    expect(item("nfl-tight-ends", "Jared Cook").rating).toBeLessThan(ditka.rating);
    expect(item("nfl-tight-ends", "Hunter Henry").rating).toBeLessThan(kittle.rating);
    item("nfl-tight-ends", "Dave Casper");
  });

  it("keeps generated front-seven careers below the reviewed historical anchors they were eclipsing", () => {
    expect(item("nfl-front-seven", "Morgan Fox").rating).toBeLessThan(item("nfl-front-seven", "Michael Strahan").rating);
    expect(item("nfl-front-seven", "Vonnie Holliday").rating).toBeLessThan(item("nfl-front-seven", "Von Miller").rating);
    expect(item("nfl-front-seven", "Manny Lawson").rating).toBeLessThan(item("nfl-front-seven", "Luke Kuechly").rating);
    expect(largestGreatnessTierShare("nfl-front-seven")).toBeLessThan(0.75);
  });

  it("keeps generated secondary careers below the reviewed historical anchors they were eclipsing", () => {
    expect(item("nfl-secondary", "Brandon Carr").rating).toBeLessThan(item("nfl-secondary", "Champ Bailey").rating);
    expect(item("nfl-secondary", "Darnell Savage").rating).toBeLessThan(item("nfl-secondary", "Darrelle Revis").rating);
    expect(largestGreatnessTierShare("nfl-secondary")).toBeLessThan(0.75);
  });
});
