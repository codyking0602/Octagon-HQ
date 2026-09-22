import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse } from "./whoAmIAuthority";
import { whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { whoAmIProgressiveClues } from "./whoAmIEngine";
import { whoAmIRevealProfile } from "./whoAmIRevealArchitecture";
import { whoAmICluesShareInformation } from "./whoAmISemanticQuality";

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

describe("Who Am I PR4 NFL population quality", () => {
  it("keeps all 200 NFL boards sports-first, progressive, and strongly anchored late", () => {
    const universe = getFootballWhoAmIUniverse("NFL");
    expect(universe.candidates).toHaveLength(200);

    const problems: string[] = [];

    for (const candidate of universe.candidates) {
      for (let seed = 1; seed <= 8; seed += 1) {
        const board = whoAmIProgressiveClues(candidate.clues, seededRandom(seed));
        if (board.length !== 10) {
          problems.push(`${candidate.id} seed ${seed}: only ${board.length} clues from pool ${candidate.clues.length}`);
          continue;
        }

        const profiles = board.map(whoAmIRevealProfile);
        const selectionClasses = board.map(whoAmIClueSelectionClass);

        if (!profiles.slice(0, 2).some(({ category }) => category === "role" || category === "era")) {
          problems.push(`${candidate.id} seed ${seed}: clues 1-2 lack role/era orientation`);
        }

        if (selectionClasses.filter((selectionClass) => selectionClass === "sports-identity").length < 7) {
          problems.push(`${candidate.id} seed ${seed}: board is not sufficiently sports-first`);
        }

        const personalCount = profiles.filter(({ category }) => category === "personal-biography").length;
        if (personalCount > 1) {
          problems.push(`${candidate.id} seed ${seed}: ${personalCount} personal-biography clues`);
        }

        const productionCount = profiles.filter(({ category }) => category === "production").length;
        if (productionCount > 2) {
          problems.push(`${candidate.id} seed ${seed}: ${productionCount} production clues create stat soup [${board.filter((clue) => whoAmIRevealProfile(clue).category === "production").map((clue) => clue.id).join(", ")}] pool=[${candidate.clues.filter((clue) => whoAmIRevealProfile(clue).category === "production").map((clue) => clue.id).join(", ")}]`);
        }

        const genericCareerVolumeCount = board.filter((clue) => (
          /\b(?:career|across \d+ seasons?|for my career)\b.*\b\d[\d,]*(?:\.\d+)?\b/i.test(clue.text)
          && !/\b(?:record|leader|most|first|only|nfl|all-time)\b/i.test(clue.text)
        )).length;
        if (genericCareerVolumeCount > 2) {
          problems.push(`${candidate.id} seed ${seed}: ${genericCareerVolumeCount} generic career-volume clues`);
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
          || category === "draft-entry"
          || category === "team-path"
          || category === "style"
        )).length;
        if (firstFourFoundation < 2) {
          problems.push(`${candidate.id} seed ${seed}: first four lack enough orientation/foundation clues`);
        }

        for (let index = 0; index < profiles.length; index += 1) {
          const category = profiles[index]!.category;
          if (index < 7 && (category === "jersey-number" || category === "personal-biography")) {
            problems.push(`${candidate.id} seed ${seed}: ${category} surfaced before clue 8 (${board[index]!.id})`);
          }
          if (index < 8 && category === "nickname-persona") {
            problems.push(`${candidate.id} seed ${seed}: nickname/persona surfaced before clue 9 (${board[index]!.id})`);
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

        const hasNearGiveaway = board.slice(8).some((clue) => {
          const profile = whoAmIRevealProfile(clue);
          return clue.band === "giveaway"
            || profile.identifyingPower === "signature"
            || profile.category === "signature-moment"
            || profile.category === "jersey-number"
            || profile.category === "nickname-persona";
        });
        if (!hasNearGiveaway) {
          problems.push(`${candidate.id} seed ${seed}: clues 9-10 lack a near-giveaway anchor`);
        }

        for (let left = 0; left < board.length; left += 1) {
          for (let right = left + 1; right < board.length; right += 1) {
            if (whoAmICluesShareInformation(board[left]!, board[right]!)) {
              problems.push(`${candidate.id} seed ${seed}: clues ${left + 1} and ${right + 1} repeat the same information (${board[left]!.id} <> ${board[right]!.id})`);
            }
          }
        }

        for (const clue of board) {
          const profile = whoAmIRevealProfile(clue);
          if (
            profile.category === "production"
            && clue.band === "giveaway"
            && /\b(?:career|across \d+ seasons?|for my career)\b.*\b\d[\d,]*(?:\.\d+)?\b/i.test(clue.text)
            && !/\b(?:record|leader|most|first|only|nfl|all-time)\b/i.test(clue.text)
          ) {
            problems.push(`${candidate.id} seed ${seed}: generic volume is still a giveaway — ${clue.text}`);
          }
        }
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
  }, 150_000);
});
