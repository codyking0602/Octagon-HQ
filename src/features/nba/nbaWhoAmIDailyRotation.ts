import { nbaWhoAmIAuthoredIdentities } from "../games/nbaWhoAmIAuthoredScripts";
import { seededLineupRandom, shuffleLineup } from "../play/lineupModel";
import { buildNbaWhoAmIAuthoredRound } from "../play/nbaWhoAmIAuthoredRound";
import type { WhoAmITwoRoundDailyRound } from "../play/whoAmITwoRoundDailyRuntime";

/**
 * 200 distinct NBA identities, two games per appearance, both authored scripts.
 * The canonical order is independent of Casual play and browser history.
 */
export const NBA_WHO_AM_I_UNIQUE_APPEARANCES = 100;

export function buildNbaWhoAmIOfficialRounds(
  appearanceIndex: number,
): readonly [WhoAmITwoRoundDailyRound, WhoAmITwoRoundDailyRound] {
  if (!Number.isSafeInteger(appearanceIndex) || appearanceIndex < 0) {
    throw new Error("NBA Who Am I ordinal must be nonnegative.");
  }
  const cycle = Math.floor(appearanceIndex / NBA_WHO_AM_I_UNIQUE_APPEARANCES);
  const index = appearanceIndex % NBA_WHO_AM_I_UNIQUE_APPEARANCES;
  const identities = shuffleLineup(
    nbaWhoAmIAuthoredIdentities,
    seededLineupRandom("nba-who-am-i-official-v1", String(cycle)),
  );
  if (identities.length < NBA_WHO_AM_I_UNIQUE_APPEARANCES * 2) {
    throw new Error("NBA Who Am I requires its approved 200-player authored population.");
  }
  const first = identities[index * 2]!;
  const second = identities[index * 2 + 1]!;
  const scriptId = (subjectId: string) => seededLineupRandom(
    "nba-who-am-i-official-script-v1", String(cycle), subjectId,
  )() < .5 ? "A" as const : "B" as const;
  return [
    { round: buildNbaWhoAmIAuthoredRound({ subjectId: first.subjectId, scriptId: scriptId(first.subjectId) }), scriptId: scriptId(first.subjectId) },
    { round: buildNbaWhoAmIAuthoredRound({ subjectId: second.subjectId, scriptId: scriptId(second.subjectId) }), scriptId: scriptId(second.subjectId) },
  ];
}
