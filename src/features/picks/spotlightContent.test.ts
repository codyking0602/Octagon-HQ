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
  it("builds an editorial matchup package instead of repeating UFCStats rows", () => {
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
    expect(spotlight.preview).toContain("The fight hinges on whether");
    expect(spotlight.preview).not.toContain("significant strikes landed per minute");
    expect(spotlight.preview).not.toContain("per 15");
    expect(spotlight.preview).not.toContain("%");
    expect(spotlight.red).toMatchObject({
      fighterSlug: "red-fighter",
      record: "12-2-0",
      age: "31",
      height: "6' 0\"",
      reach: "75\"",
      stance: "Orthodox",
    });
    expect(spotlight.blue.age).toBe("34");
    expect(spotlight.red.edges).toContain("Range and length");
    expect(spotlight.red.edges).toContain("High-volume striking");
    expect(spotlight.red.edges).toContain("Takedown resistance");
    expect(spotlight.blue.edges).toContain("Wrestling pressure");
    expect(spotlight.red.edges.every((edge) => !/\d/.test(edge))).toBe(true);
    expect(spotlight.blue.edges.every((edge) => !/\d/.test(edge))).toBe(true);
  });

  it("frames a wrestler-versus-striker matchup around game plans and the swing point", () => {
    const spotlight = buildPickSpotlightContent({
      boutId: "anthony-hernandez-gregory-rodrigues",
      eventStartsAt: "2026-08-22T23:00:00.000Z",
      red: {
        ...red,
        fighterSlug: "anthony-hernandez",
        name: "Anthony Hernandez",
        slpm: 4.8,
        strikingAccuracy: 60,
        sapm: 3.1,
        strikingDefense: 46,
        takedownAverage: 5.9,
        takedownAccuracy: 49,
        takedownDefense: 63,
        submissionAverage: 1.6,
      },
      blue: {
        ...blue,
        fighterSlug: "gregory-rodrigues",
        name: "Gregory Rodrigues",
        reach: "75\"",
        slpm: 5.5,
        strikingAccuracy: 52,
        sapm: 5.0,
        strikingDefense: 50,
        takedownAverage: 2.2,
        takedownAccuracy: 40,
        takedownDefense: 75,
        submissionAverage: 0.5,
      },
      generatedAt: "2026-08-18T17:00:00.000Z",
    });

    expect(spotlight.preview).toBe(
      "Anthony Hernandez wants to turn this into a grinding grappling fight, using relentless takedown pressure to create long scrambles and submission threats. "
      + "Gregory Rodrigues counters by trying to keep the fight in open space, build a high-output striking pace, and make the takedown defense hold up. "
      + "The fight hinges on whether Anthony Hernandez can keep forcing grappling exchanges or Gregory Rodrigues can keep enough separation to make the fight happen at range.",
    );
    expect(spotlight.red.edges).toContain("Relentless takedown pressure");
    expect(spotlight.red.edges).toContain("Submission threat");
    expect(spotlight.blue.edges).toContain("High-volume striking");
    expect(spotlight.blue.edges).toContain("Takedown resistance");
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
