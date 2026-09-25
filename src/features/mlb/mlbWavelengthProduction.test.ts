import { describe, expect, it } from "vitest";
import { MLB_FIND_LEADER_BURNED_CONTENT } from "./mlbFindLeaderProduction";
import {
  MLB_WAVELENGTH_OWNER_EXCLUSIONS,
  MLB_WAVELENGTH_OWNER_ROUNDS,
} from "./mlbWavelength";
import {
  MLB_WAVELENGTH_PRODUCTION_BANK,
  MLB_WAVELENGTH_PRODUCTION_GAMES,
  createMlbProductionWavelengthRound,
  mlbProductionWavelengthGamesForDate,
  nextMlbProductionWavelengthClue,
} from "./mlbWavelengthProduction";

describe("MLB Wavelength production bank", () => {
  it("contains exactly 100 unique production clues with valid ratings", () => {
    expect(MLB_WAVELENGTH_PRODUCTION_BANK).toHaveLength(100);
    expect(new Set(MLB_WAVELENGTH_PRODUCTION_BANK.map((clue) => clue.id)).size).toBe(100);
    expect(new Set(MLB_WAVELENGTH_PRODUCTION_BANK.map((clue) => clue.text)).size).toBe(100);
    expect(MLB_WAVELENGTH_PRODUCTION_BANK.every((clue) => (
      Number.isInteger(clue.rating) && clue.rating >= 1 && clue.rating <= 100
    ))).toBe(true);
  });

  it("keeps every owner-review subject, scale, target, and Find the Leader subject burned", () => {
    const burnedSubjects = new Set<string>([
      ...MLB_WAVELENGTH_OWNER_EXCLUSIONS.subjects,
      ...MLB_FIND_LEADER_BURNED_CONTENT.candidateNames,
    ]);
    const burnedCategories = new Set<string>(MLB_WAVELENGTH_OWNER_EXCLUSIONS.categories);
    const burnedTargets = new Set(MLB_WAVELENGTH_OWNER_ROUNDS.map((round) => round.target));

    expect(MLB_WAVELENGTH_PRODUCTION_BANK.every((clue) => !burnedSubjects.has(clue.text))).toBe(true);
    expect(MLB_WAVELENGTH_PRODUCTION_BANK.every((clue) => !burnedCategories.has(clue.category))).toBe(true);
    expect(MLB_WAVELENGTH_PRODUCTION_GAMES.every((game) => !burnedTargets.has(game.target))).toBe(true);
  });

  it("locks two games on each Wavelength date with four distinct opening clues", () => {
    expect(MLB_WAVELENGTH_PRODUCTION_GAMES).toHaveLength(4);
    expect(mlbProductionWavelengthGamesForDate("2026-10-01")).toHaveLength(2);
    expect(mlbProductionWavelengthGamesForDate("2026-10-27")).toHaveLength(2);

    const openings = MLB_WAVELENGTH_PRODUCTION_GAMES.map((game) => game.openingClueId);
    expect(new Set(openings).size).toBe(4);
    for (const game of MLB_WAVELENGTH_PRODUCTION_GAMES) {
      const round = createMlbProductionWavelengthRound(game);
      expect(round.clues).toHaveLength(1);
      expect(round.clues[0]?.id).toBe(game.openingClueId);
    }
  });

  it("draws adaptive follow-up clues from the shared bank in the correction direction", () => {
    for (const game of MLB_WAVELENGTH_PRODUCTION_GAMES) {
      const initial = createMlbProductionWavelengthRound(game);
      const used = [initial.clues[0]!.id];

      const upward = nextMlbProductionWavelengthClue(
        game,
        Math.max(1, game.target - 20),
        1,
        used,
      );
      expect(upward.rating).toBeGreaterThan(game.target);

      const downward = nextMlbProductionWavelengthClue(
        game,
        Math.min(100, game.target + 20),
        1,
        used,
      );
      expect(downward.rating).toBeLessThan(game.target);
      expect(MLB_WAVELENGTH_PRODUCTION_BANK).toContain(upward);
      expect(MLB_WAVELENGTH_PRODUCTION_BANK).toContain(downward);
    }
  });

  it("can run both games on each date without repeating a clue", () => {
    for (const date of ["2026-10-01", "2026-10-27"] as const) {
      const unavailable: string[] = [];
      for (const game of mlbProductionWavelengthGamesForDate(date)) {
        const round = createMlbProductionWavelengthRound(game);
        const used = [round.clues[0]!.id];
        expect(unavailable).not.toContain(used[0]);

        for (let clueIndex = 1; clueIndex < 4; clueIndex += 1) {
          const guess = clueIndex % 2 === 1
            ? Math.max(1, game.target - 15)
            : Math.min(100, game.target + 15);
          const next = nextMlbProductionWavelengthClue(
            game,
            guess,
            clueIndex,
            used,
            unavailable,
          );
          expect(used).not.toContain(next.id);
          expect(unavailable).not.toContain(next.id);
          used.push(next.id);
        }

        expect(new Set(used).size).toBe(4);
        unavailable.push(...used);
      }

      expect(new Set(unavailable).size).toBe(8);
    }
  });
});
