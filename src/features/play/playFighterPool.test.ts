import { describe, expect, it } from "vitest";
import { allTime } from "../rankings/rankingModel";
import { keepCutRating, KEEP_CUT_PACKS } from "./keepCutEngine";
import { blindRankPacks, blindRankTier } from "./blindRankEngine";
import {
  blindRankPool,
  blindRankRating,
  playFighters,
  rankedPlayFighters,
  PLAY_FIGHTER_RATING_OWNER_VERSION,
} from "./playFighterPool";
import {
  playOnlyFighterRatings,
  PLAY_ONLY_RATING_METHODOLOGY_VERSION,
  PLAY_ONLY_SUPPORTED_CATEGORY_IDS,
} from "./playFighterRatings";

function normalized(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘`]/g, "'").toLowerCase();
}

const rankedIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));
const playOnly = playFighters.filter((fighter) => !rankedIds.has(fighter.id));

describe("canonical Play fighter pool", () => {
  it("projects ranked fighters from the calculated ranking owner without a copied ranked snapshot", () => {
    expect(rankedPlayFighters).toHaveLength(allTime.length);
    expect(rankedPlayFighters.map((fighter) => fighter.id)).toEqual(allTime.map((fighter) => fighter.slug));
    for (const fighter of rankedPlayFighters) {
      const model = allTime.find((row) => row.slug === fighter.id);
      expect(fighter.model).toBe(model);
      expect(fighter.ratings.career).toBe(model?.ovr);
    }
  });

  it("keeps Play-only fighters out of the canonical GOAT ranking dataset", () => {
    const rankingSlugs = new Set(allTime.map((fighter) => fighter.slug));
    for (const fighter of playOnlyFighterRatings) {
      expect(rankingSlugs.has(fighter.id), `${fighter.id} must not be duplicated as Play-only`).toBe(false);
    }
    expect(playOnly.length).toBe(playOnlyFighterRatings.length);
  });

  it("has one stable identity per Play fighter with no duplicate names or ranked/play-only records", () => {
    expect(new Set(playFighters.map((fighter) => fighter.id)).size).toBe(playFighters.length);
    expect(new Set(playFighters.map((fighter) => normalized(fighter.name))).size).toBe(playFighters.length);
    expect(new Set(playFighters.map((fighter) => fighter.id)).size).toBe(playFighters.length);
    for (const fighter of playFighters) {
      expect(fighter.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(fighter.name.trim()).toBe(fighter.name);
      expect(fighter.divisions.length).toBeGreaterThan(0);
    }
  });

  it("version-controls reviewed UFC-only Play extension evidence for every supported category", () => {
    expect(PLAY_FIGHTER_RATING_OWNER_VERSION).toBe(PLAY_ONLY_RATING_METHODOLOGY_VERSION);
    for (const fighter of playOnlyFighterRatings) {
      expect(fighter.ufcFightHistory.toLowerCase()).toContain("ufc");
      expect(fighter.review.status).toBe("approved");
      expect(fighter.review.materialDisagreementThreshold).toBe(12);
      expect(fighter.review.initialPlacement.length).toBeGreaterThan(20);
      expect(fighter.review.reconciliation.length).toBeGreaterThan(20);
      expect(Object.keys(fighter.ratings).sort()).toEqual([...PLAY_ONLY_SUPPORTED_CATEGORY_IDS].sort());
      for (const category of PLAY_ONLY_SUPPORTED_CATEGORY_IDS) {
        expect(fighter.ratings[category]).toBeGreaterThanOrEqual(0);
        expect(fighter.ratings[category]).toBeLessThanOrEqual(100);
      }
    }
  });

  it("supports every current Blind Rank and Keep/Cut category without generic fallback holes", () => {
    for (const pack of blindRankPacks) {
      const rows = blindRankPool(pack.id);
      expect(rows.length).toBeGreaterThanOrEqual(8);
      for (const fighter of rows) expect(Number.isFinite(blindRankRating(fighter, pack.id))).toBe(true);
    }
    for (const pack of KEEP_CUT_PACKS) {
      const rows = playFighters.filter((fighter) => Number.isFinite(keepCutRating(pack.id, fighter)));
      expect(rows.length).toBeGreaterThanOrEqual(8);
    }
  });

  it("has broad ranked, Play-only, gender, division, and evidence-band distribution for future generators", () => {
    expect(playFighters.length).toBeGreaterThanOrEqual(150);
    expect(playFighters.length).toBeLessThanOrEqual(200);
    expect(rankedPlayFighters.length).toBeGreaterThanOrEqual(80);
    expect(playOnly.length).toBeGreaterThanOrEqual(60);
    expect(playFighters.filter((fighter) => fighter.gender === "women").length).toBeGreaterThanOrEqual(20);
    expect(new Set(playFighters.flatMap((fighter) => fighter.divisions)).size).toBeGreaterThanOrEqual(9);

    const careerTiers = playFighters.map((fighter) => blindRankTier(fighter.ratings.career));
    expect(careerTiers.filter((tier) => tier === "elite" || tier === "great").length).toBeGreaterThanOrEqual(20);
    expect(careerTiers.filter((tier) => tier === "average" || tier === "good").length).toBeGreaterThanOrEqual(45);
    expect(careerTiers.filter((tier) => tier === "below-average").length).toBeGreaterThanOrEqual(20);
    expect(careerTiers.filter((tier) => tier === "bad").length).toBeGreaterThanOrEqual(8);
  });
});
