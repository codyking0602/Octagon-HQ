import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";

/**
 * Existing UFC question families identified as eligible for FUTURE-ONLY re-authoring.
 * This staging module preserves one original top-eight ranking + off-board list
 * for substantive fact, difficulty and nickname review. It is NOT production,
 * and none of these rows is approved merely because it is moved to Main.
 * One-at-a-time edits to the full answer universes are still required.
 */
const CANDIDATES = [
  {
    "sourceId": "ufc-fast1-02-1",
    "lane": "Main",
    "group": "division-champions-lightweight",
    "prompt": "Name a fighter who has held the undisputed UFC lightweight title."
  },
  {
    "sourceId": "ufc-fast1-03-1",
    "lane": "Main",
    "group": "division-champions-welterweight",
    "prompt": "Name a fighter who has held the undisputed UFC welterweight title."
  },
  {
    "sourceId": "ufc-fast1-04-1",
    "lane": "Main",
    "group": "division-champions-middleweight",
    "prompt": "Name a fighter who has held the undisputed UFC middleweight title."
  },
  {
    "sourceId": "ufc-fast1-05-1",
    "lane": "Main",
    "group": "division-champions-heavyweight",
    "prompt": "Name a fighter who has held the undisputed UFC heavyweight title."
  },
  {
    "sourceId": "ufc-fast1-06-1",
    "lane": "Main",
    "group": "two-division-title-holders",
    "prompt": "Name a UFC fighter who won undisputed titles in two different divisions."
  },
  {
    "sourceId": "ufc-fast2-01-1",
    "lane": "Main",
    "group": "gyms-att",
    "prompt": "Name a UFC fighter who has trained with American Top Team."
  },
  {
    "sourceId": "ufc-fast2-02-1",
    "lane": "Main",
    "group": "gyms-aka",
    "prompt": "Name a UFC fighter who has trained at American Kickboxing Academy."
  },
  {
    "sourceId": "ufc-fast2-03-1",
    "lane": "Main",
    "group": "gyms-citykick",
    "prompt": "Name a UFC fighter who has trained at City Kickboxing in New Zealand."
  },
  {
    "sourceId": "ufc-fast2-04-1",
    "lane": "Main",
    "group": "gyms-alpha",
    "prompt": "Name a UFC fighter who has trained with Team Alpha Male."
  },
  {
    "sourceId": "ufc-fast2-05-1",
    "lane": "Main",
    "group": "gyms-jacksonwink",
    "prompt": "Name a UFC fighter who has trained at Jackson Wink MMA Academy."
  },
  {
    "sourceId": "ufc-fast2-08-1",
    "lane": "Main",
    "group": "dagestan-fighters",
    "prompt": "Name a UFC fighter from the Russian republic of Dagestan."
  },
  {
    "sourceId": "ufc-fast3-06-1",
    "lane": "Main",
    "group": "pride-to-ufc-fighters",
    "prompt": "Name a PRIDE FC fighter who later fought in the UFC."
  },
  {
    "sourceId": "ufc-fast3-07-1",
    "lane": "Main",
    "group": "ufc-hall-of-fame-career",
    "prompt": "Name a UFC fighter inducted into the UFC Hall of Fame for their career, rather than only a specific fight."
  },
  {
    "sourceId": "ufc-fast3-09-1",
    "lane": "Main",
    "group": "ufc-recognized-referees",
    "prompt": "Name a referee who has officiated a UFC fight."
  },
  {
    "sourceId": "ufc-main-07-1",
    "lane": "Main",
    "group": "ufc-title-defense-five-plus",
    "prompt": "Name a fighter who successfully defended an undisputed UFC championship at least five times."
  }
] as const;
const bank = [...UFC_SPORTS_FEUD_MAIN, ...UFC_SPORTS_FEUD_FAST_1,
  ...UFC_SPORTS_FEUD_FAST_2, ...UFC_SPORTS_FEUD_FAST_3,
  ...UFC_SPORTS_FEUD_FAST_4, ...UFC_SPORTS_FEUD_FAST_5];

export interface UfcFeudLegacyRewriteCandidate extends SportsFeudAuthoredQuestion {
  sourceId: string;
  proposedRound: "Main";
  /** Manually review rankings, extra answers, historical affiliations, and overlaps. */
  needsAnswerReview: true;
  semanticFamily: string;
}
export const UFC_SPORTS_FEUD_V2_LEGACY_REWRITE_CANDIDATES: readonly UfcFeudLegacyRewriteCandidate[] =
  CANDIDATES.map(spec => {
    const original = bank.find(q => q.id === spec.sourceId);
    if (!original) throw new Error("Legacy Sports Feud rewrite source ID missing: " + spec.sourceId);
    return {
      ...original, id: "ufc-v2-rewrite-" + original.id,
      prompt: spec.prompt, category: "ufc-v2-rewrite-" + spec.group,
      collisionGroup: spec.group,
      sourceId: spec.sourceId, proposedRound: spec.lane,
      needsAnswerReview: true, semanticFamily: spec.group.startsWith("gyms-")
        ? "named-mma-gyms" : spec.group.startsWith("division-champions-")
          ? "division-titleholders" : spec.group,
    };
  });
