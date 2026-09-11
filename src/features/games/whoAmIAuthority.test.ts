import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createFootballWhoAmIRound,
  createUfcWhoAmIRound,
  getFootballWhoAmIUniverse,
  getUfcWhoAmIUniverse,
} from "./whoAmIAuthority";

function eligible(universe: ReturnType<typeof getUfcWhoAmIUniverse> | ReturnType<typeof getFootballWhoAmIUniverse>) {
  return universe.candidates.filter((candidate) => candidate.clues.length >= 10);
}

describe("Who Am I canonical clue authority", () => {
  it("keeps the full player-season affiliation corpus out of the lazy game runtime", () => {
    const authoritySource = readFileSync("src/features/games/whoAmIAuthority.ts", "utf8");
    const coachProjectionSource = readFileSync("src/features/back-room/footballCoachCareerAffiliationProjection.ts", "utf8");
    expect(authoritySource).not.toContain("footballCareerAffiliationProjection");
    expect(coachProjectionSource).not.toContain("player-seasons-");
  });

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

  it("keeps Antonio Gates above the completed 12-clue floor without the heavyweight player-season corpus", () => {
    const gates = getFootballWhoAmIUniverse("NFL").candidates.find((candidate) => candidate.id === "antonio-gates");
    expect(gates).toBeDefined();
    expect(gates!.clues.length).toBeGreaterThanOrEqual(12);
    expect(gates!.clues.some((entry) => entry.id === "undrafted")).toBe(true);
  });

  it("locks and discloses NFL or CFB before the first Football clue", () => {
    expect(createFootballWhoAmIRound(() => 0).league).toBe("NFL");
    expect(createFootballWhoAmIRound(() => 0.99).league).toBe("CFB");
  });

  it("keeps internal data-source language out of UFC clues", () => {
    const texts = getUfcWhoAmIUniverse().candidates.flatMap((candidate) => candidate.clues.map((entry) => entry.text));
    expect(texts.some((text) => /HQ factual ledger|recorded data/i.test(text))).toBe(false);
  });

  it.each(["NFL", "CFB"] as const)("uses fan-facing %s clue language instead of raw total labels", (league) => {
    const texts = getFootballWhoAmIUniverse(league).candidates.flatMap((candidate) => candidate.clues.map((entry) => entry.text));
    expect(texts.some((text) => /total is/i.test(text))).toBe(false);
  });
});
