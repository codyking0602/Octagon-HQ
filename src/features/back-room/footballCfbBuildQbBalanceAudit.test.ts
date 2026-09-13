import { describe, expect, it } from "vitest";
import { BUILD_QB_TRAITS } from "../play/draftRoomContract";
import { buildFootballCfbBuildQbTraitProfiles } from "./footballCfbBuildQbTraitRatings";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function sharedAuctionStyleRoom(
  profiles: ReturnType<typeof buildFootballCfbBuildQbTraitProfiles>,
  random: () => number,
) {
  const weighted = profiles.map((profile) => ({
    profile,
    weightedKey: -Math.log(Math.max(0.0000001, Math.min(0.9999999, random()))) / profile.generationWeight,
  }));
  const highEnd = [...weighted]
    .filter(({ profile }) => profile.qualityBand >= 4)
    .sort((left, right) =>
      left.weightedKey - right.weightedKey || left.profile.catalogId.localeCompare(right.profile.catalogId),
    )
    .slice(0, 4);
  return [
    ...highEnd,
    ...weighted.filter(({ profile }) => profile.qualityBand < 4),
  ]
    .sort((left, right) =>
      left.weightedKey - right.weightedKey || left.profile.catalogId.localeCompare(right.profile.catalogId),
    )
    .slice(0, 10)
    .map(({ profile }) => profile);
}

function shuffle<T>(values: readonly T[], random: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap]!, result[index]!];
  }
  return result;
}

function randomBuildScore(
  room: ReturnType<typeof sharedAuctionStyleRoom>,
  random: () => number,
) {
  const selected = shuffle(room, random).slice(0, 5);
  const traits = shuffle(BUILD_QB_TRAITS, random);
  return Math.round(
    selected.reduce((sum, profile, index) => sum + profile.traits[traits[index]!], 0)
      / BUILD_QB_TRAITS.length,
  );
}

describe("CFB Build a QB competitive balance audit", () => {
  const profiles = buildFootballCfbBuildQbTraitProfiles();

  it("keeps trait leadership independent and preserves lower-band elite specialists", () => {
    const leaderSignatures = new Set(
      BUILD_QB_TRAITS.map((trait) => {
        const maximum = Math.max(...profiles.map((profile) => profile.traits[trait]));
        return profiles
          .filter((profile) => profile.traits[trait] === maximum)
          .map((profile) => profile.catalogId)
          .sort()
          .join("|");
      }),
    );
    expect(leaderSignatures.size).toBeGreaterThanOrEqual(3);
    expect(profiles.some((profile) =>
      BUILD_QB_TRAITS.every((trait) =>
        profile.traits[trait] === Math.max(...profiles.map((candidate) => candidate.traits[trait])),
      ),
    )).toBe(false);

    const lowerSpecialists = profiles.filter((profile) =>
      profile.qualityBand <= 2
      && BUILD_QB_TRAITS.some((trait) => profile.traits[trait] === 99),
    );
    expect(lowerSpecialists.length).toBeGreaterThanOrEqual(8);
    expect(profiles.find((profile) => profile.name === "Josh Allen")?.traits.Arm).toBe(99);
    expect(profiles.find((profile) => profile.name === "Malik Willis")?.traits.Mobility).toBe(99);
  });

  it("simulates 5,000 rooms with unique QBs, restrained marquee frequency and full-pool reach", () => {
    const random = seededRandom(9132026);
    const signatures = new Set<string>();
    const appearances = new Map(profiles.map((profile) => [profile.catalogId, 0]));
    const marqueeCounts: number[] = [];
    const highEndCounts: number[] = [];
    let specialistRooms = 0;

    for (let iteration = 0; iteration < 5_000; iteration += 1) {
      const room = sharedAuctionStyleRoom(profiles, random);
      expect(room).toHaveLength(10);
      expect(new Set(room.map((profile) => profile.catalogId)).size).toBe(10);
      signatures.add(room.map((profile) => profile.catalogId).sort().join("|"));

      const marquee = room.filter((profile) => profile.qualityBand === 5).length;
      const highEnd = room.filter((profile) => profile.qualityBand >= 4).length;
      marqueeCounts.push(marquee);
      highEndCounts.push(highEnd);
      if (room.some((profile) =>
        profile.qualityBand <= 2
        && BUILD_QB_TRAITS.some((trait) => profile.traits[trait] === 99),
      )) {
        specialistRooms += 1;
      }
      for (const profile of room) {
        appearances.set(profile.catalogId, (appearances.get(profile.catalogId) ?? 0) + 1);
      }
    }

    const averageMarquee = marqueeCounts.reduce((sum, value) => sum + value, 0) / marqueeCounts.length;
    const averageHighEnd = highEndCounts.reduce((sum, value) => sum + value, 0) / highEndCounts.length;
    expect(averageMarquee).toBeGreaterThan(0.15);
    expect(averageMarquee).toBeLessThan(0.8);
    expect(marqueeCounts.filter((count) => count <= 1).length / marqueeCounts.length).toBeGreaterThan(0.85);
    expect(Math.max(...highEndCounts)).toBeLessThanOrEqual(4);
    expect(averageHighEnd).toBeGreaterThan(1.4);
    expect(averageHighEnd).toBeLessThan(3.2);
    expect(signatures.size).toBeGreaterThan(4_000);
    expect(Math.min(...appearances.values())).toBeGreaterThan(50);
    expect(specialistRooms / 5_000).toBeGreaterThan(0.8);
  });

  it("makes 80 feel good, 90 strong, and near-perfect builds genuinely rare", () => {
    const random = seededRandom(12092026);
    const scores: number[] = [];
    const differentials: number[] = [];
    let ties = 0;

    for (let iteration = 0; iteration < 10_000; iteration += 1) {
      const room = sharedAuctionStyleRoom(profiles, random);
      const challenger = randomBuildScore(room, random);
      const recipient = randomBuildScore(room, random);
      scores.push(challenger, recipient);
      differentials.push(Math.abs(challenger - recipient));
      if (challenger === recipient) ties += 1;
    }

    const sorted = [...scores].sort((left, right) => left - right);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const median = sorted[Math.floor(sorted.length / 2)]!;
    const lowerTail = sorted[Math.floor(sorted.length * 0.10)]!;
    const upperTail = sorted[Math.floor(sorted.length * 0.90)]!;
    const share = (minimum: number, maximum: number) =>
      scores.filter((score) => score >= minimum && score <= maximum).length / scores.length;
    const averageDifferential =
      differentials.reduce((sum, value) => sum + value, 0) / differentials.length;

    expect(mean).toBeGreaterThan(80);
    expect(mean).toBeLessThan(84);
    expect(median).toBeGreaterThanOrEqual(80);
    expect(median).toBeLessThanOrEqual(84);
    expect(lowerTail).toBeLessThanOrEqual(78);
    expect(upperTail).toBeGreaterThanOrEqual(87);
    expect(share(70, 79)).toBeGreaterThan(0.20);
    expect(share(80, 89)).toBeGreaterThan(0.45);
    expect(share(90, 99)).toBeGreaterThan(0.03);
    expect(share(90, 99)).toBeLessThan(0.18);
    expect(share(97, 99)).toBeLessThan(0.01);
    expect(averageDifferential).toBeGreaterThan(4);
    expect(averageDifferential).toBeLessThan(8);
    expect(ties / differentials.length).toBeLessThan(0.10);
  });
});
