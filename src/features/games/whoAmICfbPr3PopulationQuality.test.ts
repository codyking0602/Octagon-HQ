import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse } from "./whoAmIAuthority";
import { whoAmIProgressiveClues } from "./whoAmIEngine";
import {
  whoAmIRevealArchitectureSatisfied,
  whoAmIRevealProfile,
} from "./whoAmIRevealArchitecture";

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

const LATE_ANCHOR_CATEGORIES = new Set([
  "school",
  "sports-biography",
  "draft-entry",
  "team-path",
  "accomplishments",
  "championships",
  "records",
  "style",
  "signature-moment",
  "jersey-number",
  "nickname-persona",
  "identity",
]);

describe("Who Am I PR3 CFB population quality", () => {
  it("keeps all 200 CFB boards sports-first and naturally progressive", () => {
    const universe = getFootballWhoAmIUniverse("CFB");
    expect(universe.candidates).toHaveLength(200);

    const problems: string[] = [];

    for (const candidate of universe.candidates) {
      for (let seed = 1; seed <= 6; seed += 1) {
        const board = whoAmIProgressiveClues(candidate.clues, seededRandom(seed));
        if (board.length !== 10) {
          problems.push(`${candidate.id} seed ${seed}: only ${board.length} clues`);
          continue;
        }

        if (!whoAmIRevealArchitectureSatisfied(board)) {
          problems.push(`${candidate.id} seed ${seed}: PR2 reveal architecture not satisfied`);
        }

        const profiles = board.map(whoAmIRevealProfile);
        if (!profiles.slice(0, 2).some(({ category }) => category === "role" || category === "era")) {
          problems.push(`${candidate.id} seed ${seed}: clues 1-2 lack role/era orientation`);
        }

        const personalCount = profiles.filter(({ category }) => category === "personal-biography").length;
        if (personalCount > 1) {
          problems.push(`${candidate.id} seed ${seed}: ${personalCount} personal-biography clues`);
        }

        const late = board.slice(6);
        const lateAnchorCount = late.filter((clue) => (
          LATE_ANCHOR_CATEGORIES.has(whoAmIRevealProfile(clue).category)
          && (clue.band === "strong" || clue.band === "giveaway")
        )).length;
        if (lateAnchorCount < 3) {
          problems.push(`${candidate.id} seed ${seed}: only ${lateAnchorCount} strong identity anchors in clues 7-10`);
        }

        for (let index = 0; index < board.length; index += 1) {
          const clue = board[index]!;
          const profile = profiles[index]!;
          if (
            profile.category === "production"
            && clue.band === "giveaway"
            && /\b(?:career|across \d+ seasons?|for my career)\b.*\b\d[\d,]*(?:\.\d+)?\b/i.test(clue.text)
            && !/\b(?:record|leader|most|first|only|ncaa|nation|nationally)\b/i.test(clue.text)
          ) {
            problems.push(`${candidate.id} seed ${seed}: generic volume is still a giveaway — ${clue.text}`);
          }
        }
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
  }, 150_000);
});
