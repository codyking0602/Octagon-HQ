import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse } from "./whoAmIAuthority";
import { whoAmIProgressiveClues } from "./whoAmIEngine";
import { whoAmIRevealProfile } from "./whoAmIRevealArchitecture";

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

        const profiles = board.map(whoAmIRevealProfile);
        if (!profiles.slice(0, 2).some(({ category }) => category === "role" || category === "era")) {
          problems.push(`${candidate.id} seed ${seed}: clues 1-2 lack role/era orientation`);
        }

        const personalCount = profiles.filter(({ category }) => category === "personal-biography").length;
        if (personalCount > 1) {
          problems.push(`${candidate.id} seed ${seed}: ${personalCount} personal-biography clues`);
        }

        const productionCount = profiles.filter(({ category }) => category === "production").length;
        if (productionCount > 2) {
          problems.push(`${candidate.id} seed ${seed}: ${productionCount} production clues create stat soup`);
        }

        const jerseyCount = profiles.filter(({ category }) => category === "jersey-number").length;
        const nicknameCount = profiles.filter(({ category }) => category === "nickname-persona").length;
        if (jerseyCount > 1) problems.push(`${candidate.id} seed ${seed}: ${jerseyCount} jersey-number clues`);
        if (nicknameCount > 1) problems.push(`${candidate.id} seed ${seed}: ${nicknameCount} nickname/persona clues`);

        const firstFourFoundation = profiles.slice(0, 4).filter(({ category }) => (
          category === "role"
          || category === "era"
          || category === "school"
          || category === "sports-biography"
          || category === "team-path"
          || category === "style"
        )).length;
        if (firstFourFoundation < 2) {
          problems.push(`${candidate.id} seed ${seed}: first four lack enough orientation/foundation clues`);
        }

        for (let index = 0; index < profiles.length; index += 1) {
          const category = profiles[index]!.category;
          if (index < 7 && (category === "jersey-number" || category === "personal-biography")) {
            problems.push(`${candidate.id} seed ${seed}: ${category} surfaced before clue 8`);
          }
          if (index < 8 && category === "nickname-persona") {
            problems.push(`${candidate.id} seed ${seed}: nickname/persona surfaced before clue 9`);
          }
        }

        const late = board.slice(6);
        const lateAnchorCount = late.filter((clue) => (
          LATE_ANCHOR_CATEGORIES.has(whoAmIRevealProfile(clue).category)
          && (clue.band === "strong" || clue.band === "giveaway")
        )).length;
        if (lateAnchorCount < 2) {
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
