import { describe, expect, it } from "vitest";
import {
  MLB_WAVELENGTH_OWNER_EXCLUSIONS,
  MLB_WAVELENGTH_OWNER_ROUNDS,
  createMlbWavelengthRound,
  nextMlbWavelengthClue,
} from "./mlbWavelength";

describe("MLB Wavelength authored rounds", () => {
  it("locks two games with four distinct clue stages each", () => {
    expect(MLB_WAVELENGTH_OWNER_ROUNDS).toHaveLength(2);
    for (const definition of MLB_WAVELENGTH_OWNER_ROUNDS) {
      expect(definition.stages).toHaveLength(4);
      expect(new Set(definition.stages.map((stage) => stage.category)).size).toBe(4);
      const round = createMlbWavelengthRound(definition);
      expect(round.clues).toHaveLength(1);
      expect(round.clues[0]?.category).toBe(definition.stages[0].category);
    }
  });

  it("uses each later clue to push in the direction of the hidden target", () => {
    for (const definition of MLB_WAVELENGTH_OWNER_ROUNDS) {
      const lowGuess = Math.max(1, definition.target - 20);
      const highGuess = Math.min(100, definition.target + 20);

      for (let clueIndex = 1; clueIndex < 4; clueIndex += 1) {
        const upward = nextMlbWavelengthClue(definition, lowGuess, clueIndex);
        const downward = nextMlbWavelengthClue(definition, highGuess, clueIndex);

        expect(upward.rating).toBeGreaterThan(definition.target);
        expect(downward.rating).toBeLessThan(definition.target);
      }
    }
  });

  it("marks every review subject and scale as excluded from scheduled challenge content", () => {
    const subjects = MLB_WAVELENGTH_OWNER_ROUNDS.flatMap((round) => (
      round.stages.flatMap((stage) => stage.clues.map((clue) => clue.text))
    ));
    const categories = MLB_WAVELENGTH_OWNER_ROUNDS.flatMap((round) => (
      round.stages.map((stage) => stage.category)
    ));

    expect(MLB_WAVELENGTH_OWNER_EXCLUSIONS.subjects).toEqual([...new Set(subjects)]);
    expect(MLB_WAVELENGTH_OWNER_EXCLUSIONS.categories).toEqual([...new Set(categories)]);
  });
});
