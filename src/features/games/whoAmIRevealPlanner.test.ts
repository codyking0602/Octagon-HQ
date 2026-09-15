import { describe, expect, it } from "vitest";
import { assembleWhoAmIRevealClues } from "./whoAmIRevealPlanner";
import type { WhoAmIClue } from "./whoAmIEngine";

function healthyPool(): WhoAmIClue[] {
  return [
    { id: "b-role", text: "I was a professional fighter.", band: "broad", facet: "role" },
    { id: "b-era", text: "I competed in the 2010s.", band: "broad", facet: "era" },
    { id: "h-style", text: "I was known for an aggressive style.", band: "helpful", facet: "style" },
    { id: "h-path", text: "I spent years near the top of my division.", band: "helpful", facet: "career-path" },
    { id: "h-background", text: "I entered from another combat-sports background.", band: "helpful", facet: "background" },
    { id: "s-title", text: "I won a major championship.", band: "strong", facet: "accomplishments" },
    { id: "s-rival", text: "I defeated a former champion.", band: "strong", facet: "relationships" },
    { id: "s-path", text: "I became a centerpiece of my division.", band: "strong", facet: "career-path" },
    { id: "s-style", text: "I became known for a signature fighting style.", band: "strong", facet: "style" },
    { id: "s-record", text: "I set a major divisional record.", band: "strong", facet: "accomplishments" },
    { id: "s-identity", text: "I became one of the defining names of my era.", band: "strong", facet: "identity" },
    { id: "g-stat", text: "I recorded 18 wins.", band: "giveaway", facet: "production" },
    { id: "g-fights", text: "I appeared in 25 fights.", band: "giveaway", facet: "production" },
  ];
}

describe("Who Am I reveal planner", () => {
  it("uses the preferred 2/2/4/2 shape when the clue pool supports it without forcing giveaways", () => {
    const sequence = assembleWhoAmIRevealClues(healthyPool(), 10, () => 0.5);

    expect(sequence).toHaveLength(10);
    expect(sequence.slice(0, 2).every((clue) => clue.band === "broad")).toBe(true);
    expect(sequence.slice(2, 4).every((clue) => clue.band === "helpful")).toBe(true);
    expect(sequence.slice(4, 8).every((clue) => clue.band === "strong")).toBe(true);
    expect(sequence.slice(8).every((clue) => clue.band === "strong" || clue.band === "giveaway")).toBe(true);
    expect(sequence.filter((clue) => clue.band === "giveaway")).toHaveLength(0);
  });

  it("lets a genuine signature giveaway earn a final slot without requiring two giveaway clues", () => {
    const clues = [
      ...healthyPool().filter((clue) => clue.id !== "g-fights"),
      { id: "g-nickname", text: "I was known by the nickname The Spider.", band: "giveaway", facet: "nickname" } satisfies WhoAmIClue,
    ];
    const sequence = assembleWhoAmIRevealClues(clues, 10, () => 0.5);

    expect(sequence).toHaveLength(10);
    expect(sequence.slice(-2).map((clue) => clue.id)).toContain("g-nickname");
    expect(sequence.filter((clue) => clue.band === "giveaway")).toHaveLength(1);
  });
});
