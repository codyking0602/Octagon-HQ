import { describe, expect, it } from "vitest";
import { allTime } from "../rankings/rankingModel";
import { KEEP_CUT_PACKS, keepCutPool } from "./keepCutEngine";
import { blindRankPacks, blindRankTier } from "./blindRankEngine";
import {
  blindRankPool,
  blindRankRating,
  playFighters,
  rankedPlayFighters,
  PLAY_FIGHTER_PLAY_ONLY_METHODOLOGY_VERSION,
  PLAY_FIGHTER_RATING_OWNER_VERSION,
  type BlindRankPackId,
} from "./playFighterPool";
import {
  playOnlyFighterRatings,
  PLAY_ONLY_MATERIAL_DISAGREEMENT_THRESHOLD,
  PLAY_ONLY_RATING_AUDIT,
  PLAY_ONLY_RATING_METHODOLOGY_VERSION,
  PLAY_ONLY_RATING_REVIEW_EVIDENCE,
  PLAY_ONLY_SUPPORTED_CATEGORY_IDS,
  projectRankedPlayRatings,
  validatePlayOnlyRatingAudit,
  validatePlayOnlyRatingDecision,
} from "./playFighterRatings";

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .toLowerCase();
}

function identitySlug(value: string) {
  return normalized(value)
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const rankedIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));
const playOnly = playFighters.filter((fighter) => !rankedIds.has(fighter.id));

describe("canonical Play fighter pool", () => {
  it("projects every ranked fighter directly from the calculated ranking owner", () => {
    expect(PLAY_FIGHTER_RATING_OWNER_VERSION).toBe("play-fighter-rating-owner-v1");
    expect(rankedPlayFighters).toHaveLength(allTime.length);
    expect(rankedPlayFighters.map((fighter) => fighter.id)).toEqual(allTime.map((fighter) => fighter.slug));

    for (const fighter of rankedPlayFighters) {
      const model = allTime.find((row) => row.slug === fighter.id);
      expect(fighter.model).toBe(model);
      expect(model).toBeDefined();
      expect(fighter.ratings).toEqual(projectRankedPlayRatings(model!));
      expect(fighter.ratings.career).toBe(model!.ovr);
    }
  });

  it("keeps Play-only evidence isolated from the canonical GOAT ranking dataset", () => {
    const rankingSlugs = new Set(allTime.map((fighter) => fighter.slug));
    const rankingNames = new Set(allTime.map((fighter) => normalized(fighter.name)));

    for (const fighter of playOnlyFighterRatings) {
      expect(rankingSlugs.has(fighter.id), `${fighter.id} must not be a ranked duplicate`).toBe(false);
      expect(rankingNames.has(normalized(fighter.name)), `${fighter.name} must not be a ranked duplicate`).toBe(false);
    }

    expect(playOnly.length).toBe(playOnlyFighterRatings.length);
  });

  it("has one stable identity per Play fighter with canonical Play-only slugs", () => {
    expect(new Set(playFighters.map((fighter) => fighter.id)).size).toBe(playFighters.length);
    expect(new Set(playFighters.map((fighter) => normalized(fighter.name))).size).toBe(playFighters.length);

    for (const fighter of playFighters) {
      expect(fighter.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(fighter.name.trim()).toBe(fighter.name);
      expect(fighter.divisions.length).toBeGreaterThan(0);
    }

    for (const fighter of playOnlyFighterRatings) {
      expect(fighter.id).toBe(identitySlug(fighter.name));
    }
  });

  it("contains auditable UFC-only review and disagreement evidence", () => {
    expect(PLAY_FIGHTER_PLAY_ONLY_METHODOLOGY_VERSION).toBe(PLAY_ONLY_RATING_METHODOLOGY_VERSION);
    expect(PLAY_ONLY_RATING_AUDIT.reviewedRecordCount).toBe(playOnlyFighterRatings.length);
    expect(PLAY_ONLY_RATING_AUDIT.materialDisagreementThreshold).toBe(
      PLAY_ONLY_MATERIAL_DISAGREEMENT_THRESHOLD,
    );
    expect(validatePlayOnlyRatingAudit()).toBe(true);

    const forbiddenPromotions = /\b(Pride|Strikeforce|WEC|ONE Championship|Bellator|EliteXC|boxing|regional)\b/i;
    for (const fighter of playOnlyFighterRatings) {
      expect(fighter.ufcEvidence.scope).toBe("ufc-only");
      expect(fighter.ufcEvidence.summary).toMatch(/\bUFC\b/i);
      expect(fighter.ufcEvidence.summary).not.toMatch(forbiddenPromotions);
      expect(fighter.review.status).toBe("approved");
      expect(Object.keys(fighter.ratings).sort()).toEqual([...PLAY_ONLY_SUPPORTED_CATEGORY_IDS].sort());
      for (const category of PLAY_ONLY_SUPPORTED_CATEGORY_IDS) {
        expect(fighter.ratings[category]).toBeGreaterThanOrEqual(0);
        expect(fighter.ratings[category]).toBeLessThanOrEqual(100);
      }
    }

    const reviewedBands = PLAY_ONLY_RATING_REVIEW_EVIDENCE.map((decision) => decision.resolvedRating);
    expect(reviewedBands.some((rating) => rating >= 70)).toBe(true);
    expect(reviewedBands.some((rating) => rating >= 55 && rating < 70)).toBe(true);
    expect(reviewedBands.some((rating) => rating >= 35 && rating < 55)).toBe(true);
    expect(reviewedBands.some((rating) => rating < 35)).toBe(true);

    const materialDecision = PLAY_ONLY_RATING_REVIEW_EVIDENCE.find(
      (decision) => Math.abs(decision.initialRating - decision.secondPassRating)
        >= PLAY_ONLY_MATERIAL_DISAGREEMENT_THRESHOLD,
    );
    expect(materialDecision?.resolution).toBe("rerated");
    expect(materialDecision?.resolvedRating).not.toBe(
      Math.round((materialDecision!.initialRating + materialDecision!.secondPassRating) / 2),
    );
    expect(validatePlayOnlyRatingDecision({
      ...materialDecision!,
      resolvedRating: Math.round(
        (materialDecision!.initialRating + materialDecision!.secondPassRating) / 2,
      ),
    })).toBe(false);
  });

  it("supports every current category and rejects unsupported Blind Rank access", () => {
    for (const pack of blindRankPacks) {
      const rows = blindRankPool(pack.id);
      expect(rows.length).toBeGreaterThanOrEqual(8);
      for (const fighter of rows) {
        expect(Number.isFinite(blindRankRating(fighter, pack.id))).toBe(true);
      }
    }

    for (const pack of KEEP_CUT_PACKS) {
      expect(keepCutPool(pack.id).length).toBeGreaterThanOrEqual(8);
    }

    expect(() => blindRankRating(
      playFighters[0]!,
      "unsupported-category" as BlindRankPackId,
    )).toThrow("Unsupported Blind Rank category");
  });

  it("has broad depth across ownership, gender, divisions, eras, and rating bands", () => {
    expect(playFighters.length).toBeGreaterThanOrEqual(150);
    expect(playFighters.length).toBeLessThanOrEqual(220);
    expect(rankedPlayFighters.length).toBeGreaterThanOrEqual(80);
    expect(playOnly.length).toBeGreaterThanOrEqual(60);
    expect(playFighters.filter((fighter) => fighter.gender === "women").length).toBeGreaterThanOrEqual(20);
    expect(new Set(playFighters.flatMap((fighter) => fighter.divisions)).size).toBeGreaterThanOrEqual(9);
    expect(new Set(playFighters.map((fighter) => fighter.mainEra)).size).toBeGreaterThanOrEqual(4);

    const playOnlyCareer = playOnly.map((fighter) => fighter.ratings.career);
    expect(playOnlyCareer.filter((rating) => rating >= 70).length).toBeGreaterThanOrEqual(10);
    expect(playOnlyCareer.filter((rating) => rating >= 55 && rating < 70).length).toBeGreaterThanOrEqual(25);
    expect(playOnlyCareer.filter((rating) => rating >= 35 && rating < 55).length).toBeGreaterThanOrEqual(20);
    expect(playOnlyCareer.filter((rating) => rating < 35).length).toBeGreaterThanOrEqual(8);

    const careerTiers = playFighters.map((fighter) => blindRankTier(fighter.ratings.career));
    expect(careerTiers.filter((tier) => tier === "elite" || tier === "great").length).toBeGreaterThanOrEqual(20);
    expect(careerTiers.filter((tier) => tier === "average" || tier === "good").length).toBeGreaterThanOrEqual(45);
    expect(careerTiers.filter((tier) => tier === "below-average").length).toBeGreaterThanOrEqual(20);
    expect(careerTiers.filter((tier) => tier === "bad").length).toBeGreaterThanOrEqual(8);
  });
});
