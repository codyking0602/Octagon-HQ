import { describe, expect, it } from "vitest";
import {
  createWhoAmIRound,
  whoAmIProgressiveClues,
  whoAmIScore,
  type WhoAmICandidate,
  type WhoAmIClueBand,
} from "./whoAmIEngine";

function candidate(id: string, clueCount = 10): WhoAmICandidate {
  const bands: WhoAmIClueBand[] = [
    "broad", "broad",
    "helpful", "helpful", "helpful",
    "strong", "strong", "strong",
    "giveaway", "giveaway",
  ];
  return {
    id,
    name: id,
    kind: "fighter",
    clues: Array.from({ length: clueCount }, (_value, index) => ({
      id: `${id}:${index}`,
      text: `${id} clue ${index}`,
      band: bands[index % bands.length]!,
    })),
  };
}

describe("Who Am I engine", () => {
  it("keeps clue progression broad before stronger and giveaway clues", () => {
    const clues = whoAmIProgressiveClues(candidate("alpha").clues, () => 0);
    expect(clues).toHaveLength(10);
    expect(clues.map((entry) => entry.band)).toEqual([
      "broad", "broad",
      "helpful", "helpful", "helpful",
      "strong", "strong", "strong",
      "giveaway", "giveaway",
    ]);
  });

  it("uses the five-window score ladder and meaningful wrong-guess penalty", () => {
    expect(whoAmIScore(2, 0)).toBe(100);
    expect(whoAmIScore(4, 0)).toBe(90);
    expect(whoAmIScore(6, 0)).toBe(80);
    expect(whoAmIScore(8, 0)).toBe(70);
    expect(whoAmIScore(10, 0)).toBe(60);
    expect(whoAmIScore(4, 1)).toBe(75);
    expect(whoAmIScore(10, 4)).toBe(0);
  });

  it("excludes subjects that cannot support a complete ten-clue round", () => {
    const round = createWhoAmIRound({
      sport: "ufc",
      league: "UFC",
      candidates: [candidate("eligible"), candidate("thin", 8)],
    }, () => 0);

    expect(round.hiddenSubject.id).toBe("eligible");
    expect(round.subjects.map((subject) => subject.id)).toEqual(["eligible"]);
    expect(round.clues).toHaveLength(10);
  });
});
