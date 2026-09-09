import { describe, expect, it } from "vitest";
import {
  createFootballWhoAmIRound,
  createUfcWhoAmIRound,
  getFootballWhoAmIUniverse,
  getUfcWhoAmIUniverse,
} from "./whoAmIAuthority";
import { whoAmIProgressiveClues } from "./whoAmIEngine";

function eligible(universe: ReturnType<typeof getUfcWhoAmIUniverse> | ReturnType<typeof getFootballWhoAmIUniverse>) {
  return universe.candidates.filter((candidate) => candidate.clues.length >= 10);
}

function candidateNamed(universe: ReturnType<typeof getUfcWhoAmIUniverse> | ReturnType<typeof getFootballWhoAmIUniverse>, name: string) {
  const candidate = universe.candidates.find((entry) => entry.name === name);
  expect(candidate, `${name} should be in the Who Am I universe`).toBeDefined();
  return candidate!;
}

describe("Who Am I canonical clue authority", () => {
  it("builds UFC rounds only from the canonical factual-ledger universe", () => {
    const universe = getUfcWhoAmIUniverse();
    expect(universe.league).toBe("UFC");
    expect(eligible(universe).length).toBeGreaterThan(0);
    const round = createUfcWhoAmIRound(() => 0);
    expect(round.league).toBe("UFC");
    expect(round.hiddenSubject.kind).toBe("fighter");
    expect(round.clues).toHaveLength(10);
  });

  it.each(["NFL", "CFB"] as const)("builds a playable %s player/head-coach universe from canonical Football facts", (league) => {
    const universe = getFootballWhoAmIUniverse(league);
    const playable = eligible(universe);
    expect(playable.length).toBeGreaterThan(0);
    expect(playable.some((candidate) => candidate.kind === "player")).toBe(true);
    expect(playable.some((candidate) => candidate.kind === "coach")).toBe(true);
  });

  it("locks and discloses NFL or CFB before the first Football clue", () => {
    expect(createFootballWhoAmIRound(() => 0).league).toBe("NFL");
    expect(createFootballWhoAmIRound(() => 0.99).league).toBe("CFB");
  });

  it("never exposes internal ledger or database phrasing to players", () => {
    const allClues = [
      ...getUfcWhoAmIUniverse().candidates,
      ...getFootballWhoAmIUniverse("NFL").candidates,
      ...getFootballWhoAmIUniverse("CFB").candidates,
    ].flatMap((candidate) => candidate.clues.map((entry) => entry.text));

    expect(allClues.some((text) => /HQ factual ledger|recorded data|total is/i.test(text))).toBe(false);
  });

  it("starts Chuck Liddell with division and era instead of ledger counts", () => {
    const chuck = candidateNamed(getUfcWhoAmIUniverse(), "Chuck Liddell");
    const clues = whoAmIProgressiveClues(chuck.clues, () => 0.5);
    expect(clues.slice(0, 2).map((entry) => entry.family)).toEqual(expect.arrayContaining(["division", "era"]));
    expect(clues.some((entry) => /HQ factual ledger|recorded data/i.test(entry.text))).toBe(false);
  });

  it("starts Doak Walker with position and era and does not repeat SMU as two clue families", () => {
    const doak = candidateNamed(getFootballWhoAmIUniverse("CFB"), "Doak Walker");
    const clues = whoAmIProgressiveClues(doak.clues, () => 0.5);
    expect(clues.slice(0, 2).map((entry) => entry.family)).toEqual(expect.arrayContaining(["position", "era"]));
    expect(clues.filter((entry) => entry.text.includes("SMU"))).toHaveLength(1);
    expect(doak.clues.some((entry) => entry.text === "I won the Heisman Trophy.")).toBe(true);
  });

  it("uses the full Minnesota Vikings name and useful opening identity for Harrison Smith", () => {
    const harrison = candidateNamed(getFootballWhoAmIUniverse("NFL"), "Harrison Smith");
    const clues = whoAmIProgressiveClues(harrison.clues, () => 0.5);
    expect(clues.slice(0, 2).map((entry) => entry.family)).toEqual(expect.arrayContaining(["position", "era"]));
    expect(harrison.clues.some((entry) => entry.text.includes("Minnesota Vikings"))).toBe(true);
    expect(harrison.clues.some((entry) => /\bMIN\b/.test(entry.text))).toBe(false);
  });
});
