import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";

/** Keep/consolidate one recognizable question concept from each approved historical
 * UFC family. Editorial draft only; existing source IDs, 350-v1 bank and old
 * published Daily packs are NOT modified. This is NOT final answer QA.
 */
const RETAINED_MAIN_IDS = [
  "ufc-main-02-1",
  "ufc-main-03-1",
  "ufc-main-04-1",
  "ufc-main-05-1",
  "ufc-main-12-1",
  "ufc-main-13-1",
  "ufc-main-14-1",
  "ufc-main-20-1"
] as const;
const RETAINED_FAST_IDS = [
  "ufc-fast1-01-1",
  "ufc-fast2-06-1",
  "ufc-fast2-07-1",
  "ufc-fast2-09-1",
  "ufc-fast2-10-1",
  "ufc-fast3-08-1",
  "ufc-fast4-02-1",
  "ufc-fast4-03-1",
  "ufc-fast4-04-1",
  "ufc-fast4-08-1",
  "ufc-fast4-10-1",
  "ufc-fast5-05-1"
] as const;
const ALL_MAIN = UFC_SPORTS_FEUD_MAIN;
const ALL_FAST = [...UFC_SPORTS_FEUD_FAST_1, ...UFC_SPORTS_FEUD_FAST_2,
  ...UFC_SPORTS_FEUD_FAST_3, ...UFC_SPORTS_FEUD_FAST_4, ...UFC_SPORTS_FEUD_FAST_5];
function retain(
  source: readonly SportsFeudAuthoredQuestion[],
  ids: readonly string[],
): readonly SportsFeudAuthoredQuestion[] {
  return ids.map(id => {
    const q = source.find(item => item.id === id);
    if (!q) throw new Error("UFC Feud retained question absent from historic bank: " + id);
    return { ...q, id: "ufc-v2-retained-" + id };
  });
}
export const UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT = retain(ALL_MAIN, RETAINED_MAIN_IDS);
export const UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT = retain(ALL_FAST, RETAINED_FAST_IDS);
