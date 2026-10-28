import { describe, expect, it } from "vitest";
import { NFL_GM_LONG_SLOTS, type NflGmLongPlayerFit } from "./footballGmLongFoundation";
import { nflGmLongSpinCoach } from "./footballGmLongCoaches";
import {
  nflGmLongClearSave, nflGmLongInitialSave, nflGmLongLoadSave,
  nflGmLongParseSave, nflGmLongStorageKey, nflGmLongWriteSave,
} from "./footballGmLongPersistence";

const profileId = "95bc116c-2277-4585-bc7d-3352aaf1ed60";
const otherProfileId = "83339d99-3783-487e-a5a6-e6864fc938a9";
const catalog = new Map<string, NflGmLongPlayerFit>(
  NFL_GM_LONG_SLOTS.map((slot, index) =>
    [String(index), { id: String(index), eligibleSlots: [slot], currentGrade: 88,
      salaryWindow: [10_000_000, 12_000_000, 12_000_000] }]),
);

describe("NFL GM Long persistence isolation", () => {
  it("uses a never-shared storage namespace and fails closed on Short saves", () => {
    const initial = nflGmLongInitialSave(profileId, "long-test-run-one");
    expect(nflGmLongStorageKey(profileId)).not.toContain("octagon:football-gm:");
    expect(nflGmLongParseSave({ ...initial, version: "football-gm-v11-seeded-development" }, profileId, catalog)).toBeNull();
    expect(nflGmLongParseSave(initial, otherProfileId, catalog)).toBeNull();
    expect(nflGmLongParseSave(initial, profileId, catalog)).toEqual(initial);
  });

  it("preserves a single wheel result, nine selections and coach through reload", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    const initial = nflGmLongInitialSave(profileId, "long-test-run-two");
    const picks = NFL_GM_LONG_SLOTS.map((slot, index) => ({ slot, playerId: String(index) }));
    const coach = nflGmLongSpinCoach("offensive", 0.45);
    const finished = {
      ...initial, phase: "outlook" as const, picks,
      teamWheelSpinCount: 9, previousTeam: "BUF",
      selectedCoachBucket: "offensive" as const,
      selectedCoach: coach.name, coachWheelDraw: 0.45,
    };
    nflGmLongWriteSave(storage, finished, catalog);
    expect(nflGmLongLoadSave(storage, profileId, catalog)).toEqual(finished);
    expect(nflGmLongLoadSave(storage, otherProfileId, catalog)).toBeNull();
    nflGmLongClearSave(storage, profileId);
    expect(nflGmLongLoadSave(storage, profileId, catalog)).toBeNull();
  });

  it("rejects empty budgets and malformed finished states", () => {
    const initial = nflGmLongInitialSave(profileId, "long-test-run-three");
    expect(nflGmLongParseSave({ ...initial, phase: "outlook" }, profileId, catalog)).toBeNull();
    expect(nflGmLongParseSave({ ...initial, picks: [{ slot: "QB", playerId: "unverified" }] }, profileId, catalog)).toBeNull();
  });
});
