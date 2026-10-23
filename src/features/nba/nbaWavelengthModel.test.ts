import { describe, expect, it } from "vitest";
import {
  NBA_WAVELENGTH_CATEGORY_ANCHORS,
  NBA_WAVELENGTH_BANDS,
  nbaWavelengthClues,
} from "./nbaWavelengthCatalog";
import {
  NBA_WAVELENGTH_GAME_ID,
  NBA_WAVELENGTH_VERSIONS,
  auditNbaWavelengthCatalog,
  createNbaWavelengthDailyPreview,
  createNbaWavelengthRound,
  nextNbaWavelengthClue,
  nbaWavelengthDay,
} from "./nbaWavelengthModel";
import { clampWavelength, wavelengthScore } from "../play/wavelengthEngine";

describe("NBA Wavelength editorial rating and adaptive game contracts", () => {
  it("uses distinct bounded editorial ratings, explicit traits and multiple NBA eras", () => {
    const audit = auditNbaWavelengthCatalog();
    expect(audit.failures).toEqual([]);
    expect(audit.entries).toBe(192);
    expect(audit.distinctSubjects).toBeGreaterThan(95);
    expect(audit.categories).toBe(14);
    expect(audit.eras).toBe(4);
    expect(NBA_WAVELENGTH_CATEGORY_ANCHORS).toHaveLength(14);
    expect(new Set(NBA_WAVELENGTH_CATEGORY_ANCHORS.map(row => row.category)).size).toBe(14);
    expect(NBA_WAVELENGTH_BANDS[0].min).toBe(1);
    expect(NBA_WAVELENGTH_BANDS.at(-1)?.max).toBe(100);
    expect(new Set(nbaWavelengthClues.map(row => row.id)).size).toBe(nbaWavelengthClues.length);
    expect(new Set(nbaWavelengthClues.map(row => row.category)).size).toBe(14);
    const subjectCategory = new Set(nbaWavelengthClues.map(row => row.subject + "|" + row.category));
    expect(subjectCategory.size).toBe(nbaWavelengthClues.length);
    expect(nbaWavelengthClues.filter(row => row.rating <= 30).length).toBeGreaterThan(20);
    expect(nbaWavelengthClues.filter(row => row.rating >= 90).length).toBeGreaterThan(40);
  });

  it("includes a meaningful share of clearly named NBA culture and rivalry references", () => {
    const cultural = new Set(["SHOWMANSHIP", "VILLAIN REPUTATION", "CULTURAL INFLUENCE", "HOME-COURT HEAT", "RIVALRY HEAT"]);
    const culture = nbaWavelengthClues.filter(clue => cultural.has(clue.category));
    expect(culture).toHaveLength(56);
    expect(culture.length / nbaWavelengthClues.length).toBeGreaterThan(.25);
    expect(culture.length / nbaWavelengthClues.length).toBeLessThan(.35);
    for (const category of cultural) {
      const rows = culture.filter(clue => clue.category === category);
      expect(rows.length).toBeGreaterThanOrEqual(11);
      expect(new Set(rows.map(row => row.subject)).size).toBe(rows.length);
      expect(rows.every(row => row.text.includes(" — "))).toBe(true);
    }
    const byCategory = new Map<string, number[]>();
    for (const clue of nbaWavelengthClues) {
      byCategory.set(clue.category, [...(byCategory.get(clue.category) ?? []), clue.rating]);
    }
    expect(byCategory.size).toBe(14);
    for (const values of byCategory.values()) {
      expect(Math.min(...values)).toBeLessThanOrEqual(50);
      expect(Math.max(...values)).toBeGreaterThanOrEqual(90);
    }
  });

  it("does not conflate overall greatness with shooting, defense or playmaking", () => {
    function rating(subject: string, category: string) {
      const row = nbaWavelengthClues.find(clue => clue.subject === subject && clue.category === category);
      expect(row).toBeDefined();
      return row!.rating;
    }
    expect(rating("Shaquille O'Neal", "PEAK DOMINANCE")).toBe(100);
    expect(rating("Shaquille O'Neal", "OUTSIDE SHOOTING")).toBe(3);
    expect(rating("Stephen Curry", "OUTSIDE SHOOTING")).toBe(100);
    expect(rating("Nikola Jokić", "PLAYMAKING")).toBe(100);
    expect(rating("Nikola Jokić", "EXPLOSIVE ATHLETICISM")).toBe(22);
    expect(rating("Ben Wallace", "DEFENSIVE IMPACT")).toBe(97);
    expect(rating("Ben Wallace", "SCORING THREAT")).toBe(7);
    expect(rating("Trae Young", "DEFENSIVE IMPACT")).toBeLessThan(20);
    expect(rating("Michael Jordan", "CAREER LEGACY")).toBe(100);
    expect(rating("Michael Jordan", "CLUTCH SHOTMAKING")).toBe(100);
  });

  it("generates a deterministic two-game Chicago Daily preview with no shared opening and no official identifiers", () => {
    expect(NBA_WAVELENGTH_GAME_ID).toBe("nba-wavelength");
    expect(NBA_WAVELENGTH_VERSIONS.targetPolicy).toBe("wavelength-target-policy-v2");
    expect(nbaWavelengthDay(new Date("2026-10-24T04:30:00Z"))).toBe("2026-10-23");
    expect(nbaWavelengthDay(new Date("2026-10-24T06:30:00Z"))).toBe("2026-10-24");
    const day = "2026-10-23";
    const first = createNbaWavelengthDailyPreview(day);
    const again = createNbaWavelengthDailyPreview(day);
    expect(again).toEqual(first);
    expect(first.identity.type).toBe("daily");
    expect(first.rounds).toHaveLength(2);
    expect(first.rounds[0].target).not.toBe(first.rounds[1].target);
    expect(Math.abs(first.rounds[0].target - first.rounds[1].target)).toBeGreaterThanOrEqual(12);
    expect(first.rounds[0].clues[0].category).not.toBe(first.rounds[1].clues[0].category);
    expect(first.rounds[0].clues[0].subject).not.toBe(first.rounds[1].clues[0].subject);
    expect(createNbaWavelengthDailyPreview("2026-10-24").seed).not.toBe(first.seed);
    expect(() => createNbaWavelengthDailyPreview("2026/10/23")).toThrow();
  });

  it("preserves all 100 hidden target values and hard category/person uniqueness across simulated runs", () => {
    const targets: number[] = [];
    const categoryCounts = new Map<string, number>();
    for (let n = 0; n < 400; n += 1) {
      const seed = "nba-calibration-simulation-" + n;
      let round = createNbaWavelengthRound(seed);
      targets.push(round.target);
      const inputGuesses = [
        clampWavelength(round.target - 19),
        clampWavelength(round.target + 14),
        clampWavelength(round.target - 6),
      ];
      for (let step = 1; step <= 3; step += 1) {
        const first = nextNbaWavelengthClue(round, inputGuesses[step - 1]!, step, seed, inputGuesses.slice(0, step - 1));
        const second = nextNbaWavelengthClue(round, inputGuesses[step - 1]!, step, seed, inputGuesses.slice(0, step - 1));
        expect(second).toEqual(first); // path-deterministic adaptive clue
        round = { ...round, clues: [...round.clues, first] };
      }
      expect(round.clues).toHaveLength(4);
      expect(new Set(round.clues.map(row => row.category)).size).toBe(4);
      expect(new Set(round.clues.map(row => row.subject)).size).toBe(4);
      expect(new Set(round.clues.map(row => row.id)).size).toBe(4);
      for (const clue of round.clues) categoryCounts.set(clue.category, (categoryCounts.get(clue.category) ?? 0) + 1);
    }
    expect(Math.min(...targets)).toBeLessThanOrEqual(3);
    expect(Math.max(...targets)).toBeGreaterThanOrEqual(98);
    expect(new Set(targets).size).toBeGreaterThan(92);
    expect(categoryCounts.size).toBe(14);
    for (const count of categoryCounts.values()) expect(count).toBeGreaterThan(10);
  });

  it("calibrates corrections toward the prior miss without changing the target", () => {
    for (const target of [5, 17, 34, 50, 73, 94]) {
      let round = createNbaWavelengthRound("adapt-" + target);
      round = { ...round, target };
      const low = nextNbaWavelengthClue(round, clampWavelength(target - 22), 1, "adapt-" + target, []);
      const high = nextNbaWavelengthClue(round, clampWavelength(target + 22), 1, "adapt-" + target, []);
      expect(low.rating).toBeGreaterThanOrEqual(target);
      expect(high.rating).toBeLessThanOrEqual(target);
      expect(round.target).toBe(target);
    }
    expect(() => nextNbaWavelengthClue(createNbaWavelengthRound("sequence"), 50, 3, "seed", [])).toThrow();
  });

  it("only the fourth guess scores, identically to UFC and Football", () => {
    const hidden = 74;
    const resultFromFour = [1, 100, 2, 72].at(-1)!;
    const alternativePath = [99, 1, 99, 72].at(-1)!;
    expect(wavelengthScore(resultFromFour, hidden)).toBe(96);
    expect(wavelengthScore(resultFromFour, hidden)).toBe(wavelengthScore(alternativePath, hidden));
    expect(wavelengthScore(74, 74)).toBe(100);
    expect(wavelengthScore(1, 100)).toBe(0);
  });
});
