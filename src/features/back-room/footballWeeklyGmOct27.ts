import { footballGmPlayerById, type FootballGmPlayer } from "./footballGmEngine";
import { footballGmScoutingSnapshot } from "./footballGmScouting";
import type { WeeklyGmScenario } from "./footballWeeklyGmRepository";

/**
 * October 27–November 2, 2026: owner-approved opening selections.
 * Keep the existing two scenario storage keys for standings and historical scores.
 * "elite" is the WR run; "young" is the RB run for this week only.
 */
export const OCT27_WEEKLY_GM_START = "2026-10-27";

export const OCT27_WEEKLY_GM_PLAYER_IDS: Readonly<Record<WeeklyGmScenario, readonly string[]>> = {
  elite: [
    "CIN|WR|jamarrchase",
    "SEA|WR|jaxonsmithnjigba",
    "LAR|WR|pukanacua",
    "MIN|WR|justinjefferson",
    "DET|WR|amonrastbrown",
    "DAL|WR|ceedeelamb",
    "DAL|WR|georgepickens",
    "HOU|WR|nicocollins",
    "NO|WR|chrisolave",
    "KC|WR|rasheerice",
    "CAR|WR|tetairoamcmillan",
    "NYG|WR|maliknabers",
  ],
  young: [
    "ATL|RB|bijanrobinson",
    "DET|RB|jahmyrgibbs",
    "BUF|RB|jamescook",
    "KC|RB|kennethwalker",
    "SF|RB|christianmccaffrey",
  ],
};

export function oct27WeeklyGmCandidates(scenario: WeeklyGmScenario): FootballGmPlayer[] {
  return OCT27_WEEKLY_GM_PLAYER_IDS[scenario].map((id) => {
    const player = footballGmPlayerById(id);
    if (!player) throw new Error(`Missing approved Weekly GM player: ${id}`);
    return player;
  });
}

export function oct27WeeklyGmAllows(scenario: WeeklyGmScenario, playerId: string) {
  return OCT27_WEEKLY_GM_PLAYER_IDS[scenario].includes(playerId);
}

/** Display the existing year-one scouting pills, not fixed future outcomes. */
export function oct27WeeklyGmScouting(player: FootballGmPlayer) {
  return footballGmScoutingSnapshot(player, 1);
}
