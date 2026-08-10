import { describe, expect, it } from "vitest";
import { buildPickSpotlightContent, type SpotlightStatsFighter } from "./spotlightContent";

const red: SpotlightStatsFighter = {
  fighterSlug: "red-fighter",
  name: "Red Fighter",
  record: "12-2-0",
  dob: "1995-04-10",
  height: "6' 0\"",
  reach: "75\"",
  stance: "Orthodox",
  slpm: 5.2,
  strikingAccuracy: 52,
  sapm: 2.9,
  strikingDefense: 61,
  takedownAverage: 1.1,
  takedownAccuracy: 44,
  takedownDefense: 82,
  submissionAverage: 0.2,
};

const blue: SpotlightStatsFighter = {
  fighterSlug: "blue-fighter",
  name: "Blue Fighter",
  record: "10-3-0",
  dob: "1991-09-20",
  height: "5' 10\"",
  reach: "71\"",
  stance: "Southpaw",
  slpm: 3.8,
  strikingAccuracy: 43,
  sapm: 4.1,
  strikingDefense: 49,
  takedownAverage: 3.4,
  takedownAccuracy: 51,
  takedownDefense: 65,
  submissionAverage: 1.0,
};

describe("fight Spotlight content", () => {
  it("builds a complete factual package from the two UFCStats profiles", () => {
    const spotlight = buildPickSpotlightContent({
      boutId: "main-event-red-fighter-blue-fighter",
      eventStartsAt: "2026-08-15T23:00:00.000Z",
      red,
      blue,
      generatedAt: "2026-08-10T00:00:00.000Z",
    });

    expect(spotlight.boutId).toBe("main-event-red-fighter-blue-fighter");
    expect(spotlight.source).toBe("UFCStats");
    expect(spotlight.generatedAt).toBe("2026-08-10T00:00:00.000Z");
    expect(spotlight.watchSpotlights).toEqual([]);
    expect(spotlight.preview).toContain("Red Fighter");
    expect(spotlight.preview).toContain("Blue Fighter");
    expect(spotlight.preview).toContain("5.2 significant strikes landed per minute");
    expect(spotlight.preview).toContain("3.4-takedown-per-15 wrestling pace");
    expect(spotlight.red).toMatchObject({
      fighterSlug: "red-fighter",
      record: "12-2-0",
      age: "31",
      height: "6' 0\"",
      reach: "75\"",
      stance: "Orthodox",
    });
    expect(spotlight.blue.age).toBe("34");
    expect(spotlight.red.edges).toContain('4\" reach advantage');
    expect(spotlight.red.edges).toContain("82% takedown defense");
    expect(spotlight.blue.edges).toContain("3.4 takedowns per 15 min");
    expect(spotlight.red.edges.length).toBeGreaterThanOrEqual(1);
    expect(spotlight.blue.edges.length).toBeGreaterThanOrEqual(1);
  });

  it("uses placeholders only when UFCStats does not publish a tale field", () => {
    const sparse = buildPickSpotlightContent({
      boutId: "sparse-fight",
      eventStartsAt: "2026-08-15T23:00:00.000Z",
      red: { ...red, dob: null, reach: "--" },
      blue: { ...blue, dob: null, height: "--" },
      generatedAt: "2026-08-10T00:00:00.000Z",
    });

    expect(sparse.red.age).toBe("--");
    expect(sparse.red.reach).toBe("--");
    expect(sparse.blue.age).toBe("--");
    expect(sparse.blue.height).toBe("--");
    expect(sparse.red.edges.length).toBeGreaterThanOrEqual(1);
    expect(sparse.blue.edges.length).toBeGreaterThanOrEqual(1);
  });
});
