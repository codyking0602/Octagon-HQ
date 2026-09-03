import { describe, expect, it } from "vitest";
import { WAVELENGTH_TARGET_POLICY_VERSION } from "../play/wavelengthEngine";
import { FOOTBALL_WAVELENGTH_EXPANSION_CLUE_COUNT } from "./footballWavelengthExpansionCatalog";
import {
  FOOTBALL_WAVELENGTH_CALIBRATION_VERSION,
  FOOTBALL_WAVELENGTH_CATALOG_VERSION,
  FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS,
  FOOTBALL_WAVELENGTH_RATING_BANDS,
  FOOTBALL_WAVELENGTH_TARGET_POLICY_VERSION,
  createFootballWavelengthRound,
  footballWavelengthClues,
  nextFootballWavelengthClue,
  type FootballWavelengthRound,
} from "./footballWavelengthModel";

function clampGuess(value: number) {
  return Math.max(1, Math.min(100, value));
}

function playDeterministicRound(seed: string) {
  let round = createFootballWavelengthRound(seed);
  const originalTarget = round.target;
  const guesses = [
    clampGuess(originalTarget - 18),
    clampGuess(originalTarget + 18),
    clampGuess(originalTarget - 8),
  ];

  guesses.forEach((guess, index) => {
    const clue = nextFootballWavelengthClue(round, guess, index + 1, seed, guesses.slice(0, index));
    round = { ...round, clues: [...round.clues, clue] } satisfies FootballWavelengthRound;
  });

  return round;
}

const approvedNewCategories = [
  "COACHING GENIUS",
  "HOME-FIELD ADVANTAGE",
  "FOOTBALL VILLAINY",
  "FRANCHISE DYSFUNCTION",
  "OFFENSIVE FIREPOWER",
  "BIG ARM TALENT",
  "ATHLETIC FREAK",
] as const;

describe("Football Wavelength maturity", () => {
  it("owns one calibrated 540-item catalog across 27 distinct football categories", () => {
    expect(FOOTBALL_WAVELENGTH_CATALOG_VERSION).toBe("football-wavelength-catalog-v3");
    expect(FOOTBALL_WAVELENGTH_CALIBRATION_VERSION).toBe("football-wavelength-calibration-v2");
    expect(FOOTBALL_WAVELENGTH_TARGET_POLICY_VERSION).toBe(WAVELENGTH_TARGET_POLICY_VERSION);
    expect(FOOTBALL_WAVELENGTH_EXPANSION_CLUE_COUNT).toBe(240);
    expect(footballWavelengthClues).toHaveLength(540);
    expect(FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS).toHaveLength(27);

    expect(new Set(footballWavelengthClues.map((clue) => clue.id)).size).toBe(footballWavelengthClues.length);
    const anchorCategories = new Set(FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS.map((anchor) => anchor.category));
    const clueCategories = new Set(footballWavelengthClues.map((clue) => clue.category));
    expect(clueCategories).toEqual(anchorCategories);
    expect(approvedNewCategories.every((category) => clueCategories.has(category))).toBe(true);

    for (const anchor of FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS) {
      expect(anchor.ratingQuestion.trim()).not.toBe("");
      expect(anchor.bottomTier.trim()).not.toBe("");
      expect(anchor.average.trim()).not.toBe("");
      expect(anchor.exceptional.trim()).not.toBe("");
      expect(footballWavelengthClues.filter((clue) => clue.category === anchor.category), anchor.category).toHaveLength(20);
    }
  });

  it("uses the complete 1-100 opinion scale instead of collapsing into top-heavy answers", () => {
    expect(FOOTBALL_WAVELENGTH_RATING_BANDS.map((band) => band.label)).toEqual([
      "bottom-tier",
      "poor",
      "below-average",
      "average",
      "strong",
      "elite",
      "exceptional",
    ]);

    const ratings = footballWavelengthClues.map((clue) => clue.rating);
    expect(ratings.every((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 100)).toBe(true);
    expect(ratings.filter((rating) => rating <= 20).length).toBeGreaterThanOrEqual(50);
    expect(ratings.filter((rating) => rating >= 21 && rating <= 40).length).toBeGreaterThanOrEqual(30);
    expect(ratings.filter((rating) => rating >= 41 && rating <= 60).length).toBeGreaterThanOrEqual(35);
    expect(ratings.filter((rating) => rating >= 61 && rating <= 79).length).toBeGreaterThanOrEqual(40);
    expect(ratings.filter((rating) => rating >= 80 && rating <= 89).length).toBeGreaterThanOrEqual(40);
    expect(ratings.some((rating) => rating === 1)).toBe(true);
    expect(ratings.some((rating) => rating === 100)).toBe(true);
    expect(ratings.filter((rating) => rating >= 90).length / ratings.length).toBeLessThan(0.45);

    for (const category of approvedNewCategories) {
      const categoryRatings = footballWavelengthClues.filter((clue) => clue.category === category).map((clue) => clue.rating);
      expect(Math.min(...categoryRatings), category).toBeLessThanOrEqual(20);
      expect(categoryRatings.some((rating) => rating >= 41 && rating <= 79), category).toBe(true);
      expect(Math.max(...categoryRatings), category).toBeGreaterThanOrEqual(90);
    }
  });

  it("preserves one hidden target while every four-clue sequence avoids clue and category repeats", () => {
    for (let index = 0; index < 500; index += 1) {
      const seed = `football-wavelength-maturity-${index}`;
      const first = playDeterministicRound(seed);
      const second = playDeterministicRound(seed);

      expect(second).toEqual(first);
      expect(first.target).toBeGreaterThanOrEqual(1);
      expect(first.target).toBeLessThanOrEqual(100);
      expect(first.clues).toHaveLength(4);
      expect(new Set(first.clues.map((clue) => clue.id)).size).toBe(4);
      expect(new Set(first.clues.map((clue) => clue.category)).size).toBe(4);
    }
  });

  it("keeps adaptive corrections directional and exercises broad catalog/category/target exposure", () => {
    const seenClues = new Set<string>();
    const seenCategories = new Set<string>();
    const targets = new Set<number>();

    for (let index = 0; index < 1000; index += 1) {
      const seed = `football-wavelength-exposure-${index}`;
      const opening = createFootballWavelengthRound(seed);
      targets.add(opening.target);

      const lowGuess = clampGuess(opening.target - 18);
      const highGuess = clampGuess(opening.target + 18);
      const lowCorrection = nextFootballWavelengthClue(opening, lowGuess, 1, seed, []);
      const roundAfterLow = { ...opening, clues: [...opening.clues, lowCorrection] };
      const highCorrection = nextFootballWavelengthClue(roundAfterLow, highGuess, 2, seed, [lowGuess]);

      if (lowGuess < opening.target) expect(lowCorrection.rating).toBeGreaterThan(opening.target);
      if (highGuess > opening.target) expect(highCorrection.rating).toBeLessThan(opening.target);

      for (const clue of [...opening.clues, lowCorrection, highCorrection]) {
        seenClues.add(clue.id);
        seenCategories.add(clue.category);
      }
    }

    expect(targets.size).toBeGreaterThanOrEqual(90);
    expect([...targets].some((target) => target <= 10)).toBe(true);
    expect([...targets].some((target) => target >= 91)).toBe(true);
    expect(seenCategories.size).toBeGreaterThanOrEqual(24);
    expect(seenClues.size).toBeGreaterThanOrEqual(180);
  });
});
