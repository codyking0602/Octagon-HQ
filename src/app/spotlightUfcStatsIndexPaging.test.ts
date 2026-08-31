import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getUfcStatsSnapshotFighter } from "../../supabase/functions/build-pick-spotlight/ufcStatsSnapshot.ts";
import { buildPickSpotlightContent } from "../features/picks/spotlightContent";

const builder = readFileSync("supabase/functions/build-pick-spotlight/index.ts", "utf8");

function expectCompleteSpotlightFighter(name: string) {
  const fighter = getUfcStatsSnapshotFighter(name);
  expect(fighter?.name).toBe(name);
  expect(fighter?.record).toMatch(/^\d+-\d+-\d+/);
  expect(fighter?.height).not.toBe("--");
  expect(fighter?.reach).not.toBe("--");
  expect(fighter?.slpm).toBeTypeOf("number");
  expect(fighter?.takedownDefense).toBeTypeOf("number");
}

function expectNewcomerSpotlightFighter(name: string, record: string) {
  const fighter = getUfcStatsSnapshotFighter(name);
  expect(fighter?.name).toBe(name);
  expect(fighter?.record).toBe(record);
  expect(fighter?.height).not.toBe("--");
  expect(fighter?.slpm).toBeNull();
  expect(fighter?.takedownDefense).toBeNull();
}

describe("UFCStats Spotlight snapshot", () => {
  it("does not make a live UFCStats request while the owner is building a Spotlight", () => {
    expect(builder).toContain("getUfcStatsSnapshotFighter");
    expect(builder).not.toContain("fetchUfcStatsHtml");
    expect(builder).not.toContain("ufcstats.com/statistics/fighters");
    expect(builder).not.toContain("fighter-details");
  });

  it("does not hard-fail a future card because a fighter has not been seeded into the snapshot yet", () => {
    expect(builder).not.toContain("UFCSTATS_SNAPSHOT_FIGHTER_NOT_FOUND");
    expect(builder).toContain('record: "--"');
    expect(builder).toContain("strikingAccuracy: null");
    expect(builder).toContain("takedownDefense: null");

    const noSample = {
      name: "Future UFC Fighter",
      fighterSlug: "future-ufc-fighter",
      record: "--",
      dob: null,
      height: "--",
      reach: "--",
      stance: "--",
      slpm: null,
      strikingAccuracy: null,
      sapm: null,
      strikingDefense: null,
      takedownAverage: null,
      takedownAccuracy: null,
      takedownDefense: null,
      submissionAverage: null,
    };
    const opponent = {
      ...noSample,
      name: "Future UFC Opponent",
      fighterSlug: "future-ufc-opponent",
    };
    const spotlight = buildPickSpotlightContent({
      boutId: "main-future-ufc-fighter-future-ufc-opponent",
      eventStartsAt: "2026-09-12T23:00:00.000Z",
      red: noSample,
      blue: opponent,
      generatedAt: "2026-08-31T20:00:00.000Z",
    });

    expect(spotlight.red.edges).toEqual(["No UFCStats sample yet"]);
    expect(spotlight.blue.edges).toEqual(["No UFCStats sample yet"]);
    expect(spotlight.source).toBe("UFCStats");
  });

  it("keeps the UFC 330 Spotlight fighters in the canonical snapshot", () => {
    for (const name of ["Islam Makhachev", "Ian Machado Garry", "Mackenzie Dern", "Gillian Robertson"]) {
      expectCompleteSpotlightFighter(name);
    }
  });

  it("covers the UFC Sacramento main event from the canonical UFCStats snapshot", () => {
    for (const name of ["Anthony Hernandez", "Gregory Rodrigues"]) {
      expectCompleteSpotlightFighter(name);
    }
  });

  it("covers the UFC Shanghai main event from the canonical UFCStats snapshot", () => {
    for (const name of ["Umar Nurmagomedov", "Song Yadong"]) {
      expectCompleteSpotlightFighter(name);
    }
  });

  it("covers Hasan vs Rojas with newcomer-safe snapshot data", () => {
    expectNewcomerSpotlightFighter("Bilal Hasan", "9-0-0");
    expectNewcomerSpotlightFighter("Nilson Rojas", "9-0-0");
  });

  it("covers both requested UFC Paris Fight Spotlights", () => {
    for (const name of ["Dan Hooker", "Daniil Donchenko", "Punahele Soriano"]) {
      expectCompleteSpotlightFighter(name);
    }
    expectNewcomerSpotlightFighter("Salahdine Parnasse", "23-2-0");
  });

  it("keeps a UFC newcomer's rate stats empty while allowing matchup-specific editorial edges", () => {
    const hooker = getUfcStatsSnapshotFighter("Dan Hooker");
    const parnasse = getUfcStatsSnapshotFighter("Salahdine Parnasse");
    expect(hooker).not.toBeNull();
    expect(parnasse).not.toBeNull();
    expect(parnasse?.slpm).toBeNull();
    expect(parnasse?.takedownDefense).toBeNull();

    const spotlight = buildPickSpotlightContent({
      boutId: "main-event-dan-hooker-salahdine-parnasse",
      eventStartsAt: "2026-09-05T19:00:00.000Z",
      red: { ...hooker!, fighterSlug: "dan-hooker" },
      blue: { ...parnasse!, fighterSlug: "salahdine-parnasse" },
      generatedAt: "2026-08-31T18:30:00.000Z",
    });

    expect(spotlight.red.edges).toHaveLength(3);
    expect(spotlight.blue.edges).toEqual([
      "Dynamic southpaw offense",
      "Seamless phase changes",
      "Wrestling and submission threat",
    ]);
    expect(spotlight.source).toBe("UFCStats");
  });
});
