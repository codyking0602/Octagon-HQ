import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getUfcStatsSnapshotFighter } from "../../supabase/functions/build-pick-spotlight/ufcStatsSnapshot.ts";

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
    expect(builder).toContain('getUfcStatsSnapshotFighter');
    expect(builder).not.toContain('fetchUfcStatsHtml');
    expect(builder).not.toContain('ufcstats.com/statistics/fighters');
    expect(builder).not.toContain('fighter-details');
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
});
