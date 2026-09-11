import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse } from "./whoAmIAuthority";
import {
  assembleWhoAmIClues,
  whoAmIClueFacet,
  whoAmIIdentityKnowledgeClue,
} from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues, type WhoAmIClue } from "./whoAmIEngine";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

describe("Who Am I clue-quality intelligence", () => {
  it("removes family surname answer leaks while preserving a useful clue", () => {
    const clue = whoAmIIdentityKnowledgeClue({
      subjectId: "cfb-bryce-young",
      subjectName: "Bryce Young",
      subjectKind: "player",
      league: "CFB",
      factId: "father",
      conceptId: "father-craig-quarterback-tutor",
      value: "His father, Craig Young, closely tutored and trained him as a quarterback during his youth.",
      tags: ["family"],
    });

    expect(clue.text).toMatch(/^My father/i);
    expect(clue.text).not.toMatch(/\bBryce\b/i);
    expect(clue.text).not.toMatch(/\bYoung\b/i);
    expect(clue.text.split(/\s+/).length).toBeLessThanOrEqual(14);
  });

  it("prefers concise playable identity clues over research-note prose", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played quarterback.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2010s.", band: "broad", facet: "era" },
      { id: "h-style", text: "I was known for extending plays outside the pocket.", band: "helpful", facet: "style" },
      { id: "h-career", text: "I transferred before my final college season.", band: "helpful", facet: "career-path" },
      { id: "h-background", text: "I was a major high-school recruit.", band: "helpful", facet: "background" },
      {
        id: "h-research-note",
        text: "This player has described a complicated developmental journey that included several formative experiences and relationships, reflecting a competitive environment that continued to influence his approach long after he reached college football.",
        band: "helpful",
        facet: "off-field",
        identityKnowledge: true,
      },
      { id: "s-award", text: "I won a major national award.", band: "strong", facet: "accomplishments" },
      { id: "s-team", text: "I starred for a national-title contender.", band: "strong", facet: "career-path" },
      { id: "s-identity", text: "I became one of the faces of my program.", band: "strong", facet: "identity" },
      { id: "g-draft", text: "I was a first-round NFL draft pick.", band: "giveaway", facet: "career-path" },
      { id: "g-award", text: "I won the Heisman Trophy.", band: "giveaway", facet: "accomplishments" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.some((clue) => clue.id === "h-research-note")).toBe(false);
  });

  it("does not spend multiple clue slots on the same family-story facet", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played defensive back.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2010s.", band: "broad", facet: "era" },
      { id: "h-school", text: "I played in the Big Ten.", band: "helpful", facet: "background" },
      { id: "h-span", text: "My pro career lasted more than a decade.", band: "helpful", facet: "era" },
      { id: "h-production", text: "I started more than 100 NFL games.", band: "helpful", facet: "production" },
      { id: "s-family-1", conceptId: "twin-brother-critic", text: "My twin brother was also an NFL player.", band: "strong", facet: "relationships" },
      { id: "s-family-2", conceptId: "twin-brother-charity", text: "My twin brother and I founded a charity.", band: "strong", facet: "relationships" },
      { id: "s-award", text: "I earned multiple championship rings.", band: "strong", facet: "accomplishments" },
      { id: "s-path", text: "I changed positions during my NFL career.", band: "strong", facet: "career-path" },
      { id: "g-team", text: "I spent most of my career with New England.", band: "giveaway", facet: "career-path" },
      { id: "g-title", text: "I was a captain on multiple Super Bowl champions.", band: "giveaway", facet: "accomplishments" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships")).toHaveLength(1);
  });

  it("puts the most recognizable giveaway at clue ten instead of a raw stat", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I was a fighter.", band: "broad", facet: "role" },
      { id: "b-era", text: "I fought in the 2010s.", band: "broad", facet: "era" },
      { id: "h-style", text: "I was primarily a striker.", band: "helpful", facet: "style" },
      { id: "h-span", text: "My UFC run lasted several years.", band: "helpful", facet: "era" },
      { id: "h-background", text: "I entered MMA from another combat sport.", band: "helpful", facet: "background" },
      { id: "s-title", text: "I fought for a UFC title.", band: "strong", facet: "accomplishments" },
      { id: "s-opponent", text: "I shared the Octagon with a former champion.", band: "strong", facet: "relationships" },
      { id: "s-style", text: "I became known for knockout power.", band: "strong", facet: "style" },
      { id: "g-stat", text: "I recorded 11 career knockdowns.", band: "giveaway", facet: "production" },
      { id: "g-name", text: "I was known by the nickname Rampage.", band: "giveaway", facet: "nickname" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence.at(-1)?.id).toBe("g-name");
  });

  it("repairs the live C.J. Stroud CFB identity and removes the implausible one-game clue", () => {
    const candidate = getFootballWhoAmIUniverse("CFB").candidates.find((entry) => entry.name === "C.J. Stroud");
    expect(candidate).toBeTruthy();
    expect(candidate!.clues.some((clue) => /Ohio State/i.test(clue.text))).toBe(true);
    expect(candidate!.clues.some((clue) => /played college football at Michigan/i.test(clue.text))).toBe(false);
    expect(candidate!.clues.some((clue) => /played in 1 college games/i.test(clue.text))).toBe(false);

    for (const seed of [1, 7, 19]) {
      const sequence = whoAmIProgressiveClues(candidate!.clues, seededRandom(seed));
      expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
      expect(whoAmIClueFacet(sequence.at(-1)!)).not.toBe("production");
    }
  });

  it("keeps Bryce Young family research playable without leaking Young through his father", () => {
    const candidate = getFootballWhoAmIUniverse("CFB").candidates.find((entry) => entry.name === "Bryce Young");
    expect(candidate).toBeTruthy();
    const father = candidate!.clues.find((clue) => clue.sourceFactId?.includes("father-craig-quarterback-tutor"));
    expect(father).toBeTruthy();
    expect(father!.text).not.toMatch(/Craig Young|Bryce Young/i);
    expect(father!.text).not.toMatch(/\bYoung\b/i);
  });
});
