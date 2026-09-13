import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BUILD_QB_TRAITS } from "../play/draftRoomContract";
import { generatedBuildQbCatalog } from "../play/generated/buildQbCatalog";
import {
  FOOTBALL_POSITION_TRAIT_MODEL_VERSION,
  buildFootballBuildQbTraitProfiles,
} from "./footballPositionTraitRatings";

describe("canonical Football Build a QB trait model", () => {
  it("derives every playable profile from canonical Football owners and stays synchronized with deployment output", () => {
    const profiles = buildFootballBuildQbTraitProfiles();
    expect(FOOTBALL_POSITION_TRAIT_MODEL_VERSION).toBe("build-qb-v1");
    expect(profiles.length).toBeGreaterThanOrEqual(10);

    const actual = profiles.map((profile) => ({
      subjectId: profile.subjectId,
      displayName: profile.name,
      rarityBand: profile.rarityBand,
      overall: profile.overall,
      traits: profile.traits,
    }));

    expect(actual).toEqual(generatedBuildQbCatalog);
  });

  it("keeps all five trait grades bounded and evidence-backed", () => {
    for (const profile of buildFootballBuildQbTraitProfiles()) {
      expect(profile.evidenceMetricIds.length).toBeGreaterThanOrEqual(9);
      for (const trait of BUILD_QB_TRAITS) {
        expect(profile.traits[trait]).toBeGreaterThanOrEqual(35);
        expect(profile.traits[trait]).toBeLessThanOrEqual(99);
      }
    }
  });

  it("keeps the generated catalog synchronized into the Stage 12 backend migration", () => {
    const migration = readFileSync(
      "supabase/migrations/202612310100_stage12_draft_room_build_qb.sql",
      "utf8",
    );
    expect(migration).toContain("football-draft-room-2026-09-v1");
    expect(migration).toContain("football-build-qb-traits-2026-09-v1");

    for (const row of generatedBuildQbCatalog) {
      expect(migration).toContain(row.subjectId);
      expect(migration).toContain(row.displayName);
      for (const trait of BUILD_QB_TRAITS) {
        expect(migration).toContain(`'${trait}',${row.traits[trait]}`);
      }
    }
  });
});
