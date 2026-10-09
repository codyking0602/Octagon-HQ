import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BASE_SPOTLIGHT_PAIR_ID,
  FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES,
  FOOTBALL_PLAYER_SPOTLIGHT_PAIRS,
  footballSpotlightKindAt,
  footballDitkaMemorialIsActive,
  FOOTBALL_DITKA_MEMORIAL_SPOTLIGHT,
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
  [FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[3].id]: {
    cfb: "https://example.com/jamal.webp",
    nfl: "https://example.com/tet.webp",
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

  it("does not activate the Sep. 29 pair unless both new photos are available", () => {
    const incompletePhotos: FootballSpotlightPhotoSources = {
      ...completePhotos,
      "2026-09-29-jeremiah-bijan": {
        cfb: "https://example.com/jeremiah.webp",
        nfl: null,
      },
    };

    expect(footballSpotlightPairHasPhotos(
      FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[2],
      incompletePhotos,
    )).toBe(false);
    expect(footballSpotlightPairAt(
      new Date("2026-09-29T05:00:00.000Z"),
      incompletePhotos,
    ).id).toBe("2026-09-22-trinidad-dak");
  });

  it("honors Ditka for precisely the Oct 10 Central day, then resumes scheduled players", () => {
    expect(footballDitkaMemorialIsActive(new Date("2026-10-10T04:59:59.999Z"))).toBe(false);
    expect(footballDitkaMemorialIsActive(new Date("2026-10-10T05:00:00.000Z"))).toBe(true);
    expect(footballDitkaMemorialIsActive(new Date("2026-10-11T04:59:59.999Z"))).toBe(true);
    expect(footballDitkaMemorialIsActive(new Date("2026-10-11T05:00:00.000Z"))).toBe(false);
    expect(FOOTBALL_DITKA_MEMORIAL_SPOTLIGHT).toMatchObject({
      name: "Mike Ditka", team: "Chicago Bears", position: "TE · HEAD COACH",
    });
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

  it("activates Jamal/Tet immediately from the deployment-era timestamp instead of waiting for Tuesday midnight CT", () => {
    expect(footballSpotlightPairAt(
      new Date("2026-10-06T03:30:59.999Z"),
      completePhotos,
    ).id).toBe("2026-09-29-jeremiah-bijan");

    expect(footballSpotlightPairAt(
      new Date("2026-10-06T03:31:00.000Z"),
      completePhotos,
    ).id).toBe("2026-10-06-jamal-tet");
  });

  it("requires both Jamal/Tet photos before the early activation can roll atomically", () => {
    const incompletePhotos: FootballSpotlightPhotoSources = {
      ...completePhotos,
      "2026-10-06-jamal-tet": {
        cfb: "https://example.com/jamal.webp",
        nfl: null,
      },
    };

    expect(footballSpotlightPairHasPhotos(
      FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[3],
      incompletePhotos,
    )).toBe(false);
    expect(footballSpotlightPairAt(
      new Date("2026-10-06T03:31:00.000Z"),
      incompletePhotos,
    ).id).toBe("2026-09-29-jeremiah-bijan");
  });

  it("ships both canonical Jamal/Tet photos as the atomic repo fallback", () => {
    expect(FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES["2026-10-06-jamal-tet"]).toEqual({
      cfb: "/assets/football/player-spotlight/2026-10-06-jamal-tet/cfb.webp",
      nfl: "/assets/football/player-spotlight/2026-10-06-jamal-tet/nfl.webp",
    });
    expect(footballSpotlightPairAt(
      new Date("2026-10-06T03:31:00.000Z"),
      FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES,
    ).id).toBe("2026-10-06-jamal-tet");
  });

  it("preserves the established Central Time CFB/NFL daily rotation after Jamal/Tet activates", () => {
    expect(footballSpotlightKindAt(new Date("2026-10-06T03:31:00Z"))).toBe("nfl");
    expect(footballSpotlightKindAt(new Date("2026-10-06T05:00:00Z"))).toBe("cfb");
    expect(footballSpotlightKindAt(new Date("2026-10-06T19:59:59Z"))).toBe("cfb");
    expect(footballSpotlightKindAt(new Date("2026-10-06T20:00:00Z"))).toBe("nfl");
    expect(footballSpotlightKindAt(new Date("2026-10-10T18:00:00Z"))).toBe("cfb");
    expect(footballSpotlightKindAt(new Date("2026-10-11T18:00:00Z"))).toBe("nfl");
    expect(footballSpotlightKindAt(new Date("2026-10-12T18:00:00Z"))).toBe("nfl");
  });

  it("locks the approved Jamal and Tet copy, stats, measurements, branding, and exact highlight URLs", () => {
    const pair = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[3];

    expect(pair.activatesAt).toBe("2026-10-06T03:31:00.000Z");
    expect(pair.spotlights.cfb).toMatchObject({
      name: "Jamal Roberts",
      team: "Missouri",
      position: "RB",
      teamColor: "#FDB719",
      highlightUrl: "https://youtu.be/k341BuX48kQ?is=_CrwryCS8Hs6iWqs",
      result: "VS FLORIDA · W 45–17",
      measurements: "6'0\" · 216 LB",
      stats: [
        { value: "211", label: "RUSH YDS" },
        { value: "3", label: "RUSH TD" },
        { value: "8.8", label: "YPC" },
        { value: "80", label: "LONG" },
      ],
    });
    expect(pair.spotlights.nfl).toMatchObject({
      name: "Tetairoa McMillan",
      team: "Carolina Panthers",
      position: "WR",
      teamColor: "#0085CA",
      highlightUrl: "https://youtu.be/DIFNn8n7Skc?is=kArg-AWazCQ0f9iE",
      result: "VS DETROIT · W 32–26",
      measurements: "6'4\" · 220 LB",
      stats: [
        { value: "14", label: "REC" },
        { value: "192", label: "REC YDS" },
        { value: "2", label: "REC TD" },
        { value: "13.7", label: "YDS/REC" },
      ],
    });
  });

});
