import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BUILD_QB_TRAITS, draftRoomModeDefinition } from "../play/draftRoomContract";
import {
  CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY,
  CFB_BUILD_QB_MATURE_POOL_SIZE,
  CFB_BUILD_QB_RESEARCH_SOURCES,
  CFB_BUILD_QB_TRAIT_MODEL_VERSION,
  buildFootballCfbBuildQbTraitProfiles,
  cfbBuildQbProfileForItemReference,
} from "./footballCfbBuildQbTraitRatings";
import { generatedCfbBuildQbCatalog } from "../play/generated/cfbBuildQbCatalog";

describe("CFB Build a QB peak-season model", () => {
  const profiles = buildFootballCfbBuildQbTraitProfiles();

  it("locks an 80-QB pool to one exact peak college season and school per player", () => {
    expect(profiles).toHaveLength(CFB_BUILD_QB_MATURE_POOL_SIZE);
    expect(new Set(profiles.map((profile) => profile.canonicalPlayerId)).size).toBe(80);
    expect(new Set(profiles.map((profile) => profile.peakSeasonIdentityId)).size).toBe(80);
    expect(profiles.every((profile) => Number.isInteger(profile.peakSeason) && profile.school.length > 0)).toBe(true);
  });

  it("uses the approved modernized 80-QB membership and exact peak seasons", () => {
    expect(CFB_BUILD_QB_TRAIT_MODEL_VERSION).toBe("cfb-build-qb-peak-season-v3");
    const expected = new Map([
      ["Andrew Luck", [2011, "Stanford"]],
      ["Russell Wilson", [2011, "Wisconsin"]],
      ["Aaron Rodgers", [2004, "California"]],
      ["Matt Ryan", [2007, "Boston College"]],
      ["Michael Vick", [1999, "Virginia Tech"]],
      ["Marcus Vick", [2005, "Virginia Tech"]],
      ["Jimmy Clausen", [2009, "Notre Dame"]],
      ["Sam Ehlinger", [2018, "Texas"]],
      ["Teddy Bridgewater", [2013, "Louisville"]],
    ] as const);
    for (const [name, [peakSeason, school]] of expected) {
      expect(profiles.find((profile) => profile.name === name)).toMatchObject({ peakSeason, school });
    }
    for (const name of [
      "Danny Wuerffel",
      "Jim Plunkett",
      "Hendon Hooker",
      "Vinny Testaverde",
      "Ty Detmer",
      "Gino Torretta",
      "Andre Ware",
      "Eric Crouch",
      "Chris Weinke",
    ]) {
      expect(profiles.some((profile) => profile.name === name), `retired CFB roster cut still present: ${name}`).toBe(false);
    }
  });

  it("retains player-by-player exact-season evidence for every audited trait profile", () => {
    for (const profile of profiles) {
      expect(profile.evidenceSourceIds.length).toBeGreaterThanOrEqual(4);
      expect(new Set(profile.evidenceSourceIds).size).toBe(profile.evidenceSourceIds.length);
      expect(profile.auditSummary.length).toBeGreaterThan(120);
      for (const trait of BUILD_QB_TRAITS) {
        expect(profile.auditSummary).toContain(`${trait}:`);
      }
    }
  });

  it("uses the same five traits and a calculated overall", () => {
    expect(draftRoomModeDefinition("build-qb-cfb").categories).toEqual(BUILD_QB_TRAITS);
    for (const profile of profiles) {
      expect(Object.keys(profile.traits)).toEqual(BUILD_QB_TRAITS);
      expect(profile.overall).toBe(Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + profile.traits[trait], 0) / 5));
    }
  });

  it("projects every audited CFB trait packet to the append-only v5 backend catalog", () => {
    const migration = readFileSync(
      "supabase/migrations/202612310109_stage12_cfb_build_qb_grading_audit.sql",
      "utf8",
    );

    expect(migration).toContain("football-draft-room-2026-09-v5");
    expect(migration).toContain("football-draft-room-rarity-2026-09-v4");
    expect(migration).toContain("where source.content_version = 'football-draft-room-2026-09-v4'");
    expect(migration).not.toContain("update private.auction_catalog\n");

    const auditedLines = migration
      .split("\n")
      .filter((line) => line.includes("when 'cfb-build-qb-") && line.includes("jsonb_build_object"));
    expect(auditedLines).toHaveLength(80);

    for (const row of generatedCfbBuildQbCatalog) {
      const line = auditedLines.find((candidate) => candidate.includes(`when '${row.itemReference}'`));
      expect(line, `missing v5 grading packet for ${row.displayLabel}`).toBeDefined();
      for (const trait of BUILD_QB_TRAITS) {
        expect(line).toContain(`'${trait}',${row.gradingInputs[trait]}`);
      }
      expect(line).toContain(`'overall',${row.gradingInputs.overall}`);
    }
  });

  it("keeps every row's evidence references inside the canonical source registry", () => {
    const sourceIds = new Set<string>(CFB_BUILD_QB_RESEARCH_SOURCES.map((source) => source.id));
    for (const profile of profiles) {
      for (const sourceId of profile.evidenceSourceIds) {
        expect(sourceIds.has(sourceId), `unknown evidence source ${sourceId} for ${profile.name}`).toBe(true);
      }
    }
  });

  it("pins transfer identities to the selected peak-season school", () => {
    const hurts = profiles.find((profile) => profile.name === "Jalen Hurts");
    expect(hurts).toMatchObject({
      peakSeason: 2019,
      school: "Oklahoma",
      canonicalPlayerId: "cfbfast-r-player-4040715-jalen-hurts",
    });
    expect(hurts?.peakSeasonIdentityId).toContain("@2019:oklahoma");
  });

  it("keeps item identity exact instead of inferring from rendered player names", () => {
    const burrow = profiles.find((profile) => profile.name === "Joe Burrow")!;
    expect(cfbBuildQbProfileForItemReference(burrow.catalogId)?.school).toBe("LSU");
    expect(cfbBuildQbProfileForItemReference("Joe Burrow")).toBeNull();
  });

  it("keeps rarity separate from trait ceilings so lower and wildcard specialists matter", () => {
    const lowSpecialists = profiles.filter((profile) => profile.qualityBand <= 2 && BUILD_QB_TRAITS.some((trait) => profile.traits[trait] === 99));
    expect(lowSpecialists.length).toBeGreaterThanOrEqual(8);
    expect(profiles.find((profile) => profile.name === "Josh Allen")?.traits.Arm).toBe(99);
    expect(profiles.find((profile) => profile.name === "Malik Willis")?.traits.Mobility).toBe(99);
    expect(profiles.some((profile) => BUILD_QB_TRAITS.every((trait) => profile.traits[trait] === 99))).toBe(false);
  });

  it("matches the audited rarity mix and keeps marquee generation genuinely uncommon", () => {
    const counts = Object.fromEntries([1,2,3,4,5].map((band) => [band, profiles.filter((profile) => profile.qualityBand === band).length]));
    expect(counts).toEqual({1:11,2:13,3:24,4:19,5:13});

    const weighted = profiles.reduce((sum, profile) => sum + profile.generationWeight, 0);
    const marqueeShare = profiles.filter((profile) => profile.qualityBand === 5)
      .reduce((sum, profile) => sum + profile.generationWeight, 0) / weighted;
    expect(marqueeShare).toBeLessThan(0.04);
    expect(CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY[5]).toBeLessThan(CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY[3]);
  });
  it("produces diverse competitive rooms with specialists, good 80s, rarer 90s and very rare near-perfect builds", () => {
    function randomForSeed(seed: number) {
      let value = seed >>> 0;
      return () => {
        value += 0x6d2b79f5;
        let mixed = value;
        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
      };
    }

    function weightedRoom(random: () => number) {
      const pool = profiles.map((profile) => ({ profile, weight: profile.generationWeight }));
      const room = [];
      while (room.length < 10) {
        const total = pool.reduce((sum, item) => sum + item.weight, 0);
        let ticket = random() * total;
        let index = 0;
        for (; index < pool.length; index += 1) {
          ticket -= pool[index]!.weight;
          if (ticket <= 0) break;
        }
        const [selected] = pool.splice(Math.min(index, pool.length - 1), 1);
        room.push(selected!.profile);
      }
      return room;
    }

    function shuffle<T>(values: readonly T[], random: () => number) {
      const result = [...values];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(random() * (index + 1));
        [result[index], result[swap]] = [result[swap]!, result[index]!];
      }
      return result;
    }

    const appearances = new Map(profiles.map((profile) => [profile.catalogId, 0]));
    const scores: number[] = [];
    let marqueeAppearances = 0;
    let ties = 0;
    const roomCount = 5_000;

    for (let seed = 1; seed <= roomCount; seed += 1) {
      const random = randomForSeed(seed);
      const room = weightedRoom(random);
      expect(new Set(room.map((profile) => profile.catalogId)).size).toBe(10);
      for (const profile of room) {
        appearances.set(profile.catalogId, appearances.get(profile.catalogId)! + 1);
        if (profile.qualityBand === 5) marqueeAppearances += 1;
      }

      const sides = shuffle(room, random);
      const left = sides.slice(0, 5);
      const right = sides.slice(5);
      const score = (side: typeof left) => {
        const assignment = shuffle(BUILD_QB_TRAITS, random);
        return Math.round(side.reduce((sum, profile, index) => sum + profile.traits[assignment[index]!], 0) / 5);
      };
      const leftScore = score(left);
      const rightScore = score(right);
      scores.push(leftScore, rightScore);
      if (leftScore === rightScore) ties += 1;
    }

    expect(Math.min(...appearances.values())).toBeGreaterThan(0);
    expect(marqueeAppearances / roomCount).toBeLessThan(0.5);

    const seventies = scores.filter((score) => score >= 70 && score < 80).length;
    const eighties = scores.filter((score) => score >= 80 && score < 90).length;
    const nineties = scores.filter((score) => score >= 90 && score < 97).length;
    const nearPerfect = scores.filter((score) => score >= 97).length;

    expect(seventies).toBeGreaterThan(0);
    expect(eighties).toBeGreaterThan(nineties);
    expect(nineties).toBeGreaterThan(0);
    expect(nearPerfect / scores.length).toBeLessThan(0.02);
    expect(ties / roomCount).toBeLessThan(0.15);
  });

});
