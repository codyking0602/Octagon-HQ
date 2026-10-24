import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";
import { NFL_SPORTS_FEUD_MAIN } from "./nflSportsFeudMain";
import { CFB_SPORTS_FEUD_MAIN } from "./cfbSportsFeudMain";
import { NFL_SPORTS_FEUD_FAST_1 } from "./nflSportsFeudFast1";
import { NFL_SPORTS_FEUD_FAST_2 } from "./nflSportsFeudFast2";
import { NFL_SPORTS_FEUD_FAST_3 } from "./nflSportsFeudFast3";
import { NFL_SPORTS_FEUD_FAST_4 } from "./nflSportsFeudFast4";
import { NFL_SPORTS_FEUD_FAST_5 } from "./nflSportsFeudFast5";
import { CFB_SPORTS_FEUD_FAST_1 } from "./cfbSportsFeudFast1";
import { CFB_SPORTS_FEUD_FAST_2 } from "./cfbSportsFeudFast2";
import { CFB_SPORTS_FEUD_FAST_3 } from "./cfbSportsFeudFast3";
import { CFB_SPORTS_FEUD_FAST_4 } from "./cfbSportsFeudFast4";
import { CFB_SPORTS_FEUD_FAST_5 } from "./cfbSportsFeudFast5";
import { NFL_FEUD_REBUILD_MAIN } from "./footballSportsFeudRebuildNflMain";
import { NFL_FEUD_REBUILD_FAST } from "./footballSportsFeudRebuildNflFast";
import { CFB_FEUD_REBUILD_MAIN } from "./footballSportsFeudRebuildCfbMain";
import { CFB_FEUD_REBUILD_FAST } from "./footballSportsFeudRebuildCfbFast";
import { NFL_FEUD_REBUILD_MAIN_BATCH2, CFB_FEUD_REBUILD_MAIN_BATCH2 } from "./footballSportsFeudRebuildMainBatch2";

/**
 * Staging only. KEEP means retain ONE original concept, not all five old wordings.
 * History-sensitive original question IDs remain in the old immutable bank.
 * This editorial shortlist is NOT included by any production publisher.
 */
const NFL_MAIN_KEEP = ["nfl-main-10-1", "nfl-main-11-1", "nfl-main-13-1", "nfl-main-15-1"];
const NFL_FAST_KEEP = [
  "nfl-fast1-01-1", "nfl-fast1-02-1", "nfl-fast1-05-1", "nfl-fast1-06-1",
  "nfl-fast1-07-1", "nfl-fast2-08-1", "nfl-fast3-01-1", "nfl-fast3-08-1",
  "nfl-fast3-09-1", "nfl-fast3-10-1", "nfl-fast4-03-1", "nfl-fast4-04-1",
  "nfl-fast4-05-1", "nfl-fast4-08-1", "nfl-fast4-09-1", "nfl-fast4-10-1",
  "nfl-fast5-04-1",
];
const CFB_MAIN_KEEP = ["cfb-main-05-1", "cfb-main-09-1", "cfb-main-10-1", "cfb-main-11-1", "cfb-main-16-1"];
const CFB_FAST_KEEP = [
  "cfb-fast1-01-1", "cfb-fast1-02-1", "cfb-fast1-03-1",
  "cfb-fast1-05-1", "cfb-fast1-06-1", "cfb-fast1-07-1",
  "cfb-fast3-01-1", "cfb-fast3-06-1", "cfb-fast3-07-1",
  "cfb-fast3-08-1", "cfb-fast3-09-1", "cfb-fast4-01-1",
  "cfb-fast4-03-1", "cfb-fast4-04-1", "cfb-fast4-05-1",
  "cfb-fast4-08-1", "cfb-fast4-10-1", "cfb-fast5-04-1",
];

function retained(ids: readonly string[], bank: readonly SportsFeudAuthoredQuestion[]) {
  const byId = new Map(bank.map((question) => [question.id, question]));
  return ids.map((id) => {
    const question = byId.get(id);
    if (!question) throw new Error("Missing preserved Football Sports Feud question " + id);
    return question;
  });
}

const NFL_OLD_FAST = [
  ...NFL_SPORTS_FEUD_FAST_1, ...NFL_SPORTS_FEUD_FAST_2, ...NFL_SPORTS_FEUD_FAST_3,
  ...NFL_SPORTS_FEUD_FAST_4, ...NFL_SPORTS_FEUD_FAST_5,
];
const CFB_OLD_FAST = [
  ...CFB_SPORTS_FEUD_FAST_1, ...CFB_SPORTS_FEUD_FAST_2, ...CFB_SPORTS_FEUD_FAST_3,
  ...CFB_SPORTS_FEUD_FAST_4, ...CFB_SPORTS_FEUD_FAST_5,
];

export const NFL_FEUD_REBUILD_CANDIDATES = {
  main: [...retained(NFL_MAIN_KEEP, NFL_SPORTS_FEUD_MAIN), ...NFL_FEUD_REBUILD_MAIN, ...NFL_FEUD_REBUILD_MAIN_BATCH2],
  fast: [...retained(NFL_FAST_KEEP, NFL_OLD_FAST), ...NFL_FEUD_REBUILD_FAST],
} as const;

export const CFB_FEUD_REBUILD_CANDIDATES = {
  main: [...retained(CFB_MAIN_KEEP, CFB_SPORTS_FEUD_MAIN), ...CFB_FEUD_REBUILD_MAIN, ...CFB_FEUD_REBUILD_MAIN_BATCH2],
  fast: [...retained(CFB_FAST_KEEP, CFB_OLD_FAST), ...CFB_FEUD_REBUILD_FAST],
} as const;
