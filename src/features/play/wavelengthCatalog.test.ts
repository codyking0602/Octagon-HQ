import { describe, expect, it } from "vitest";
import {
  WAVELENGTH_CALIBRATION_RUBRIC,
  WAVELENGTH_CALIBRATION_VERSION,
  WAVELENGTH_CATALOG_VERSION,
  WAVELENGTH_CATEGORY_ANCHORS,
  WAVELENGTH_GENERATOR_VERSION,
  WAVELENGTH_HISTORICAL_VERSION_IDS,
  WAVELENGTH_RATING_BANDS,
  WAVELENGTH_REVEAL_CONTRACT_VERSION,
  approvedWavelengthCatalog,
  wavelengthCatalog,
  type WavelengthCategory,
} from "./wavelengthCatalog";
import {
  createWavelengthRound,
  nextWavelengthClue,
  wavelengthClues,
  wavelengthScore,
  wavelengthSequenceKey,
  type WavelengthRecentHistory,
} from "./wavelengthEngine";
import {
  materializeWavelengthOfficialSetup,
  projectWavelengthPreReveal,
  projectWavelengthReveal,
} from "./wavelengthOfficialPrivacy";
import { playGameDefinition, playGames } from "./playRegistry";
import { adaptWavelengthOfficialScore } from "./officialScoreContract";

function seeded(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
}

describe("canonical Wavelength catalog", () => {
  it("meets approved size, uniqueness, rating, copy, and category-quality gates", () => {
    expect(approvedWavelengthCatalog).toHaveLength(500);
    expect(new Set(approvedWavelengthCatalog.map((item) => item.id)).size).toBe(approvedWavelengthCatalog.length);
    expect(new Set(approvedWavelengthCatalog.map((item) => item.text.toLowerCase())).size).toBe(approvedWavelengthCatalog.length);

    const categories = new Map<WavelengthCategory, number>();
    for (const item of approvedWavelengthCatalog) {
      expect(item.id.trim()).not.toBe("");
      expect(item.text.trim()).not.toBe("");
      expect(Number.isInteger(item.rating)).toBe(true);
      expect(item.rating).toBeGreaterThanOrEqual(1);
      expect(item.rating).toBeLessThanOrEqual(100);
      categories.set(item.category, (categories.get(item.category) ?? 0) + 1);
    }

    expect(categories.size).toBe(WAVELENGTH_CATEGORY_ANCHORS.length);
    expect(categories.size).toBe(16);
    expect(Math.max(...categories.values())).toBeLessThanOrEqual(45);
    expect(Math.min(...categories.values())).toBeGreaterThanOrEqual(25);
  });

  it("broadens UFC subject matter beyond fighter-centric anchors", () => {
    const copy = approvedWavelengthCatalog.map((item) => item.text).join("\n");
    for (const subject of [
      "Ariel Helwani",
      "Brendan Schaub",
      "Theo Von",
      "Donald Trump",
      "White House",
      "Kimbo Slice",
      "The Ultimate Fighter Season 33",
      "The Ultimate Fighter Season 34",
      "Big John McCarthy",
      "Keith Peterson",
    ]) {
      expect(copy).toContain(subject);
    }

    for (const category of ["MMA MEDIA", "TUF & REALITY", "COACHES & CAMPS", "CROSSOVER & CELEBRITY"] as const) {
      expect(approvedWavelengthCatalog.filter((item) => item.category === category)).toHaveLength(25);
    }
  });

  it("reduces the top-heavy score clustering while preserving the full scale", () => {
    const eightyPlus = approvedWavelengthCatalog.filter((item) => item.rating >= 80).length;
    const belowSeventy = approvedWavelengthCatalog.filter((item) => item.rating < 70).length;

    expect(eightyPlus / approvedWavelengthCatalog.length).toBeLessThan(0.5);
    expect(belowSeventy / approvedWavelengthCatalog.length).toBeGreaterThan(0.35);
    expect(approvedWavelengthCatalog.some((item) => item.rating <= 10)).toBe(true);
    expect(approvedWavelengthCatalog.some((item) => item.rating >= 40 && item.rating <= 60)).toBe(true);
    expect(approvedWavelengthCatalog.some((item) => item.rating >= 75 && item.rating <= 89)).toBe(true);
    expect(approvedWavelengthCatalog.some((item) => item.rating >= 90)).toBe(true);
    expect(wavelengthCatalog.some((item) => item.status === "quarantined")).toBe(true);
    expect(wavelengthClues.some((item) => item.id.includes("quarantine"))).toBe(false);
  });

  it("documents explicit calibration and historical version identifiers", () => {
    expect(WAVELENGTH_CATALOG_VERSION).toBe("wavelength-catalog-v2");
    expect(WAVELENGTH_CALIBRATION_VERSION).toBe("wavelength-calibration-v1");
    expect(WAVELENGTH_GENERATOR_VERSION).toBe("wavelength-generator-v3");
    expect(WAVELENGTH_REVEAL_CONTRACT_VERSION).toBe("wavelength-reveal-privacy-v1");
    expect(WAVELENGTH_HISTORICAL_VERSION_IDS).toContain("wavelength-catalog-v1");
    expect(WAVELENGTH_HISTORICAL_VERSION_IDS).toContain("wavelength-generator-v2");
    expect(WAVELENGTH_HISTORICAL_VERSION_IDS).toContain(WAVELENGTH_CATALOG_VERSION);
    expect(WAVELENGTH_HISTORICAL_VERSION_IDS).toContain(WAVELENGTH_GENERATOR_VERSION);
    expect(WAVELENGTH_RATING_BANDS.map((band) => band.label)).toEqual([
      "bottom-tier", "poor", "below average", "average", "strong", "elite", "exceptional",
    ]);
    expect(WAVELENGTH_CATEGORY_ANCHORS.every((anchor) => anchor.ratingQuestion && anchor.average && anchor.exceptional)).toBe(true);
    expect(WAVELENGTH_CALIBRATION_RUBRIC.passes).toHaveLength(2);
    expect(WAVELENGTH_CALIBRATION_RUBRIC.versioningRule).toContain("new version");
  });
});

describe("Wavelength generator protections", () => {
  it("is deterministic for seeded random inputs and varies across different seeds", () => {
    const first = createWavelengthRound({ random: seeded([0.12, 0.9, 0.1]) });
    const second = createWavelengthRound({ random: seeded([0.12, 0.9, 0.1]) });
    const different = createWavelengthRound({ random: seeded([0.72, 0.1, 0.8]) });
    expect(second).toEqual(first);
    expect(wavelengthSequenceKey(different)).not.toBe(wavelengthSequenceKey(first));
  });

  it("respects recent item and target exclusions when alternatives exist", () => {
    const blocked = createWavelengthRound({ random: seeded([0, 0, 0]) });
    const next = createWavelengthRound({
      recent: { targets: [blocked.target], clueIds: [blocked.clues[0].id] },
      random: seeded([0, 0, 0]),
    });
    expect(next.target).not.toBe(blocked.target);
    expect(next.clues[0].id).not.toBe(blocked.clues[0].id);
  });

  it("penalizes category repetition and relaxes explicitly when exclusions are exhaustive", () => {
    const usedCategory = wavelengthClues[0].category;
    const chosen = nextWavelengthClue({ target: 70, clues: [wavelengthClues[0]] }, 20, 1, () => 0);
    expect(chosen.category).not.toBe(usedCategory);

    const nearlyExhaustive: WavelengthRecentHistory = {
      targets: Array.from({ length: 100 }, (_, index) => index + 1),
      clueIds: wavelengthClues.slice(0, -1).map((clue) => clue.id),
      categories: wavelengthClues.map((clue) => clue.category),
    };
    const relaxed = createWavelengthRound({ previousTarget: 18, recent: nearlyExhaustive, random: () => 0 });
    expect(relaxed.clues).toHaveLength(1);
    let round = relaxed;
    for (let index = 1; index < 4; index += 1) {
      const clue = nextWavelengthClue(round, index === 1 ? 1 : 100, index, () => 0, nearlyExhaustive);
      round = { ...round, clues: [...round.clues, clue] };
    }
    expect(round.clues).toHaveLength(4);
    expect(new Set(round.clues.map((clue) => clue.id)).size).toBe(4);
  });

  it("adapts clue direction to the previous guess", () => {
    const lowGuessClue = nextWavelengthClue({ target: 80, clues: [wavelengthClues[0]] }, 20, 1, () => 0);
    const highGuessClue = nextWavelengthClue({ target: 20, clues: [wavelengthClues[299]] }, 90, 1, () => 0);
    expect(lowGuessClue.rating).toBeGreaterThan(80);
    expect(highGuessClue.rating).toBeLessThan(20);
  });
});

describe("Wavelength official privacy projection", () => {
  it("omits hidden target, unused clues, private ratings, and grading evidence before reveal", () => {
    const round = { target: 77, clues: wavelengthClues.slice(0, 4) };
    const setup = materializeWavelengthOfficialSetup(round);
    const projection = projectWavelengthPreReveal(setup, 1);
    expect(JSON.stringify(projection)).not.toContain("77");
    expect(JSON.stringify(projection)).not.toContain("rating");
    expect(JSON.stringify(projection)).not.toContain(round.clues[0].text);
    expect(projection.currentClue.text).toBe(round.clues[1].text);
  });

  it("reveals only allowed answer-stage data and preserves casual/challenge-compatible score behavior", () => {
    const round = { target: 75, clues: wavelengthClues.slice(0, 4) };
    const reveal = projectWavelengthReveal(materializeWavelengthOfficialSetup(round), 68);
    expect(reveal.target).toBe(75);
    expect(reveal.finalScore).toBe(86);
    expect(JSON.stringify(reveal)).not.toContain("rating");
    expect(wavelengthScore(0, 75)).toBe(0);
    expect(wavelengthScore(68, 75)).toBe(adaptWavelengthOfficialScore(86).score);
  });

  it("preserves Wavelength privacy while joining the six-game official daily lineup", () => {
    expect(playGames.filter((game) => game.lineup.dailyEligible).map((game) => game.id)).toEqual([
      "hit-the-number",
      "find-leader",
      "wavelength",
      "blind-resume",
      "blind-rank",
      "keep-cut",
    ]);
    expect(playGameDefinition("wavelength").lineup).toMatchObject({
      defaultType: "replayable",
      supportedTypes: ["daily", "replayable", "curated"],
      historyRecording: "official-daily-and-casual",
      dailyEligible: true,
      streakEligible: true,
      reminderEligible: true,
    });
  });
});
