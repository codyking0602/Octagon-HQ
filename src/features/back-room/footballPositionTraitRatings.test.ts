import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BUILD_QB_TRAITS } from "../play/draftRoomContract";
import { sampleBuildQbRoom } from "../play/buildQbRoom";
import { generatedBuildQbCatalog } from "../play/generated/buildQbCatalog";
import { FOOTBALL_POSITION_TRAIT_MODEL_VERSION, buildFootballBuildQbTraitProfiles } from "./footballPositionTraitRatings";

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

describe("canonical Football Build a QB competitive model", () => {
  it("owns exactly 60 complete, unique, bounded profiles and generates the deployment catalog", () => {
    const profiles = buildFootballBuildQbTraitProfiles();
    expect(FOOTBALL_POSITION_TRAIT_MODEL_VERSION).toBe("build-qb-v2-audited");
    expect(profiles).toHaveLength(60);
    expect(new Set(profiles.map((row) => row.subjectId))).toHaveProperty("size", 60);
    for (const profile of profiles) {
      expect(Object.keys(profile.traits).sort()).toEqual([...BUILD_QB_TRAITS].sort());
      for (const trait of BUILD_QB_TRAITS) expect(profile.traits[trait]).toBeGreaterThanOrEqual(35);
      for (const trait of BUILD_QB_TRAITS) expect(profile.traits[trait]).toBeLessThanOrEqual(99);
    }
    expect(generatedBuildQbCatalog).toEqual(profiles.map(({ subjectId, name: displayName, rarityBand, overall, traits }) => ({ subjectId, displayName, rarityBand, overall, traits })));
  });

  it("keeps rarity independent from trait ceilings and supplies distinct specialists", () => {
    const profiles = buildFootballBuildQbTraitProfiles();
    const nonPremium = profiles.filter((row) => row.rarityBand <= 2);
    expect(nonPremium.some((row) => Math.max(...Object.values(row.traits)) >= 97)).toBe(true);
    expect(nonPremium.every((row) => Math.max(...Object.values(row.traits)) >= 78)).toBe(true);
    const leaderGroups = BUILD_QB_TRAITS.map((trait) => profiles.filter((row) => row.traits[trait] >= 97).map((row) => row.subjectId).sort().join(","));
    expect(new Set(leaderGroups).size).toBeGreaterThanOrEqual(4);
    expect(profiles.find((row) => row.name === "Jay Cutler")?.traits.Arm).toBeGreaterThanOrEqual(97);
    expect(new Set(profiles.map((row) => row.rarityBand))).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it("simulates 5,000 constrained rooms with exact mix, uniqueness, specialists, and diversity", () => {
    const random = seeded(120260913);
    const fingerprints = new Set<string>();
    let specialistRooms = 0;
    for (let run = 0; run < 5_000; run += 1) {
      const room = sampleBuildQbRoom(generatedBuildQbCatalog, random);
      expect(room).toHaveLength(10);
      expect(new Set(room.map((row) => row.subjectId))).toHaveProperty("size", 10);
      expect(room.filter((row) => row.rarityBand === 5)).toHaveLength(1);
      expect(room.filter((row) => row.rarityBand === 4)).toHaveLength(2);
      expect(room.filter((row) => row.rarityBand === 3)).toHaveLength(4);
      expect(room.filter((row) => row.rarityBand <= 2)).toHaveLength(3);
      if (room.some((row) => row.rarityBand <= 2 && Math.max(...Object.values(row.traits)) >= 94)) specialistRooms += 1;
      fingerprints.add(room.map((row) => row.subjectId).sort().join("|"));
    }
    expect(fingerprints.size).toBeGreaterThan(4_500);
    expect(specialistRooms / 5_000).toBeGreaterThan(0.7);
  });

  it("simulates legal five-QB builds with meaningful score separation", () => {
    const random = seeded(91250);
    const scores: number[] = [];
    const differentials: number[] = [];
    let ties = 0;
    for (let run = 0; run < 10_000; run += 1) {
      const room = sampleBuildQbRoom(generatedBuildQbCatalog, random);
      const sides = [room.filter((_, index) => index % 2 === 0), room.filter((_, index) => index % 2 === 1)];
      const pair = sides.map((side) => {
        // A legal build uses each category once and five different won QBs. Rotation
        // models imperfect auction/category planning rather than impossible free picks.
        const offset = Math.floor(random() * BUILD_QB_TRAITS.length);
        return Math.round(side.reduce((sum, qb, index) => sum + qb.traits[BUILD_QB_TRAITS[(index + offset) % 5]!], 0) / 5);
      });
      scores.push(...pair);
      differentials.push(Math.abs(pair[0]! - pair[1]!));
      if (pair[0] === pair[1]) ties += 1;
    }
    const sorted = [...scores].sort((a, b) => a - b);
    const frequency = (minimum: number, maximum: number) => scores.filter((score) => score >= minimum && score <= maximum).length / scores.length;
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    expect(mean).toBeGreaterThan(82);
    expect(mean).toBeLessThan(91);
    expect(sorted[Math.floor(sorted.length / 2)]).toBeGreaterThanOrEqual(83);
    expect(sorted[Math.floor(sorted.length * 0.1)]).toBeLessThan(84);
    expect(sorted[Math.floor(sorted.length * 0.9)]).toBeGreaterThan(90);
    expect(frequency(70, 79)).toBeGreaterThan(0);
    expect(frequency(80, 89)).toBeGreaterThan(0.45);
    expect(frequency(90, 96)).toBeGreaterThan(0.08);
    expect(frequency(97, 99)).toBeLessThan(0.01);
    expect(differentials.reduce((sum, value) => sum + value, 0) / differentials.length).toBeGreaterThan(4);
    expect(ties / differentials.length).toBeLessThan(0.1);
  });

  it("keeps the append-only backend catalog synchronized and the public gate off", () => {
    const migration = readFileSync("supabase/migrations/202612310102_stage12_build_qb_competitive_model.sql", "utf8");
    expect(migration).toContain("football-draft-room-2026-09-v2");
    expect(migration).toContain("football-build-qb-traits-2026-09-v2");
    expect(migration).toMatch(/draft_room_public_release_enabled[\s\S]*select false/);
    expect(migration).toContain("p_mode_id = 'build-qb'");
    for (const row of generatedBuildQbCatalog) {
      expect(migration).toContain(`'${row.subjectId}','${row.displayName}',${row.rarityBand}`);
      for (const trait of BUILD_QB_TRAITS) expect(migration).toContain(`'${trait}',${row.traits[trait]}`);
    }
  });
});
