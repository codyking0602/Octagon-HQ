import { describe, expect, it } from "vitest";
import {
  createFootballWavelengthRound,
  footballWavelengthThemeFamilyForCategory,
  nextFootballWavelengthClue,
  type FootballWavelengthRound,
} from "./footballWavelengthModel";
import { footballWavelengthCanonicalSubjectForClue } from "./footballWavelengthSubjectAuthority";

function completedRound(seed: string): FootballWavelengthRound {
  const initial = createFootballWavelengthRound(seed);
  const round: FootballWavelengthRound = { target: initial.target, clues: [...initial.clues] };
  const guesses = [44, 61, 37];
  for (let index = 1; index < 4; index += 1) {
    const clue = nextFootballWavelengthClue(round, guesses[index - 1]!, index, seed, guesses.slice(0, index));
    round.clues.push(clue);
  }
  return round;
}

describe("Football Wavelength canonical generation", () => {
  it("never repeats the same canonical subject inside a four-clue round", () => {
    for (let index = 0; index < 300; index += 1) {
      const round = completedRound(`canonical-wavelength-${index}`);
      const subjectIds = round.clues
        .map((clue) => footballWavelengthCanonicalSubjectForClue(clue)?.id)
        .filter((id): id is string => Boolean(id));
      expect(new Set(subjectIds).size, `seed ${index}: ${subjectIds.join(",")}`).toBe(subjectIds.length);
    }
  });

  it("keeps the existing four-category variety while spreading rounds across theme families", () => {
    for (let index = 0; index < 200; index += 1) {
      const round = completedRound(`theme-wavelength-${index}`);
      expect(new Set(round.clues.map((clue) => clue.category)).size).toBe(4);
      const families = new Set(round.clues.map((clue) => footballWavelengthThemeFamilyForCategory(clue.category)));
      expect(families.size, `seed ${index}: ${round.clues.map((clue) => clue.category).join(" | ")}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("groups obviously related category labels under the same generation family", () => {
    expect(footballWavelengthThemeFamilyForCategory("GUNSLINGER")).toBe(footballWavelengthThemeFamilyForCategory("BIG ARM TALENT"));
    expect(footballWavelengthThemeFamilyForCategory("QB CARRY JOB")).toBe(footballWavelengthThemeFamilyForCategory("SYSTEM QB PERCEPTION"));
    expect(footballWavelengthThemeFamilyForCategory("OFFENSIVE CHAOS")).toBe(footballWavelengthThemeFamilyForCategory("OFFENSIVE INNOVATION"));
    expect(footballWavelengthThemeFamilyForCategory("PROGRAM TRADITION")).not.toBe(footballWavelengthThemeFamilyForCategory("GUNSLINGER"));
  });
});
