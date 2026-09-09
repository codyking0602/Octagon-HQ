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
    "helpful", "helpful",
    "strong", "strong",
    "near-giveaway", "near-giveaway",
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
      family: `family:${index}`,
    })),
  };
}

describe("Who Am I engine", () => {
  it("uses five two-clue stages from broad through giveaway", () => {
    const clues = whoAmIProgressiveClues(candidate("alpha").clues, () => 0);
    expect(clues).toHaveLength(10);
    expect(clues.map((entry) => entry.band)).toEqual([
      "broad", "broad",
      "helpful", "helpful",
      "strong", "strong",
      "near-giveaway", "near-giveaway",
      "giveaway", "giveaway",
    ]);
  });

  it("prefers different fact families before repeating a clue family", () => {
    const clues = whoAmIProgressiveClues([
      { id: "era-1", text: "Era one", band: "broad", family: "era" },
      { id: "era-2", text: "Era two", band: "broad", family: "era" },
      { id: "position", text: "Position", band: "broad", family: "position" },
      ...candidate("depth").clues.slice(2),
    ], () => 0);

    expect(clues.slice(0, 2).map((entry) => entry.family)).toEqual(expect.arrayContaining(["era", "position"]));
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
