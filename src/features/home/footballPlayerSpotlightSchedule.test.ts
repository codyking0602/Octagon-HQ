import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BASE_SPOTLIGHT_PAIR_ID,
  FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES,
  FOOTBALL_PLAYER_SPOTLIGHT_PAIRS,
  footballSpotlightKindAt,
  footballSpotlightPairAt,
  footballSpotlightPairHasPhotos,
  type FootballSpotlightPhotoSources,
} from "./footballPlayerSpotlightSchedule";

const completePhotos: FootballSpotlightPhotoSources = {
  [FOOTBALL_BASE_SPOTLIGHT_PAIR_ID]: {
    cfb: "https://example.com/drew.webp",
    nfl: "https://example.com/josh.webp",
  },
  [FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[1].id]: {
    cfb: "https://example.com/trinidad.webp",
    nfl: "https://example.com/dak.webp",
  },
  [FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[2].id]: {
    cfb: "https://example.com/jeremiah.webp",
    nfl: "https://example.com/bijan.webp",
  },
};

describe("Football Player Spotlight weekly schedule", () => {
  it("keeps Drew/Josh active until the exact Tuesday midnight CT activation", () => {
    expect(footballSpotlightPairAt(
      new Date("2026-09-22T04:59:59.999Z"),
      completePhotos,
    ).id).toBe(FOOTBALL_BASE_SPOTLIGHT_PAIR_ID);

    expect(footballSpotlightPairAt(
      new Date("2026-09-22T05:00:00.000Z"),
      completePhotos,
    ).id).toBe("2026-09-22-trinidad-dak");
  });


  it("keeps Trinidad/Dak active until the exact Sep. 29 Tuesday midnight CT activation", () => {
    expect(footballSpotlightPairAt(
      new Date("2026-09-29T04:59:59.999Z"),
      completePhotos,
    ).id).toBe("2026-09-22-trinidad-dak");

    expect(footballSpotlightPairAt(
      new Date("2026-09-29T05:00:00.000Z"),
      completePhotos,
    ).id).toBe("2026-09-29-jeremiah-bijan");
  });

  it("uses the repo-preloaded Trinidad/Dak photos as the scheduled fallback", () => {
    expect(FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES["2026-09-22-trinidad-dak"]).toEqual({
      cfb: "/assets/football/player-spotlight/2026-09-22-trinidad-dak/cfb.webp",
      nfl: "/assets/football/player-spotlight/2026-09-22-trinidad-dak/nfl.webp",
    });
    expect(footballSpotlightPairAt(
      new Date("2026-09-22T05:00:00.000Z"),
      FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES,
    ).id).toBe("2026-09-22-trinidad-dak");
    expect(FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES["2026-09-29-jeremiah-bijan"]).toEqual({
      cfb: "/assets/football/player-spotlight/2026-09-29-jeremiah-bijan/cfb.webp",
      nfl: "/assets/football/player-spotlight/2026-09-29-jeremiah-bijan/nfl.webp",
    });
    expect(footballSpotlightPairAt(
      new Date("2026-09-29T05:00:00.000Z"),
      FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES,
    ).id).toBe("2026-09-29-jeremiah-bijan");
  });

  it("does not activate a partially configured future pair", () => {
    const incompletePhotos: FootballSpotlightPhotoSources = {
      ...completePhotos,
      "2026-09-22-trinidad-dak": {
        cfb: "https://example.com/trinidad.webp",
        nfl: null,
      },
    };

    expect(footballSpotlightPairHasPhotos(
      FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[1],
      incompletePhotos,
    )).toBe(false);
    expect(footballSpotlightPairAt(
      new Date("2026-09-22T05:00:00.000Z"),
      incompletePhotos,
    ).id).toBe(FOOTBALL_BASE_SPOTLIGHT_PAIR_ID);
  });

  it("keeps the Central Time daily CFB/NFL rotation across the new pair", () => {
    expect(footballSpotlightKindAt(new Date("2026-09-22T05:00:00Z"))).toBe("cfb");
    expect(footballSpotlightKindAt(new Date("2026-09-22T19:59:59Z"))).toBe("cfb");
    expect(footballSpotlightKindAt(new Date("2026-09-22T20:00:00Z"))).toBe("nfl");
    expect(footballSpotlightKindAt(new Date("2026-09-26T18:00:00Z"))).toBe("cfb");
    expect(footballSpotlightKindAt(new Date("2026-09-27T18:00:00Z"))).toBe("nfl");
    expect(footballSpotlightKindAt(new Date("2026-09-28T18:00:00Z"))).toBe("nfl");
  });

  it("locks the approved Trinidad and Dak copy, stats, branding, and highlight URLs", () => {
    const pair = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[1];

    expect(pair.activatesAt).toBe("2026-09-22T05:00:00.000Z");
    expect(pair.spotlights.cfb).toMatchObject({
      name: "Trinidad Chambliss",
      team: "Ole Miss",
      position: "QB",
      teamColor: "#14213D",
      highlightUrl: "https://youtu.be/3j6ijizvXmg?is=VJY4f509RYu8TC0p",
      stats: [
        { value: "363", label: "PYDS" },
        { value: "68.8", label: "CMP%" },
        { value: "2", label: "PASS TD" },
        { value: "1", label: "RUSH TD" },
      ],
    });
    expect(pair.spotlights.nfl).toMatchObject({
      name: "Dak Prescott",
      team: "Dallas Cowboys",
      position: "QB",
      teamColor: "#041E42",
      highlightUrl: "https://youtu.be/7KEkO4RFFLM?is=0eBE2IagbqAG1SzX",
      stats: [
        { value: "279", label: "PYDS" },
        { value: "4", label: "PASS TD" },
        { value: "143.8", label: "QB RTG" },
        { value: "83.9%", label: "CMP" },
      ],
    });
  });
  it("locks the approved Jeremiah and Bijan copy, stats, branding, and highlight URLs", () => {
    const pair = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[2];

    expect(pair.activatesAt).toBe("2026-09-29T05:00:00.000Z");
    expect(pair.spotlights.cfb).toMatchObject({
      name: "Jeremiah Smith",
      team: "Ohio State",
      position: "WR",
      teamColor: "#BB0000",
      highlightUrl: "https://youtu.be/B26hQ2uCcnM?is=Y9LxDiKnKq3beGYS",
      result: "VS ILLINOIS · W 42–19",
      measurements: "6'4\" · 222 LB",
      stats: [
        { value: "12", label: "REC" },
        { value: "217", label: "REC YDS" },
        { value: "4", label: "REC TD" },
        { value: "72", label: "LONG" },
      ],
    });
    expect(pair.spotlights.nfl).toMatchObject({
      name: "Bijan Robinson",
      team: "Atlanta Falcons",
      position: "RB",
      teamColor: "#A71930",
      highlightUrl: "https://youtu.be/WqGyNkVhg6M?is=5p5DEmsrDRhSbfTR",
      result: "AT GREEN BAY · W 35–14",
      measurements: "5'11\" · 215 LB",
      stats: [
        { value: "194", label: "RUSH YDS" },
        { value: "213", label: "SCRIM YDS" },
        { value: "2", label: "RUSH TD" },
        { value: "6.7", label: "YPC" },
      ],
    });
  });

});
