import { nbaWhoAmIAuthoredIdentities } from "../games/nbaWhoAmIAuthoredScripts";
import { WHO_AM_I_MODERN_ERA_SHARE, type WhoAmIRound } from "../games/whoAmIEngine";
import { seededLineupRandom } from "./lineupModel";
import { buildNbaWhoAmIAuthoredRound } from "./nbaWhoAmIAuthoredRound";

/** Owner's two deterministic basketball rehearsals. Never writes official results. */
export function nbaWhoAmIDailyPreviewRounds(day: string): readonly [WhoAmIRound, WhoAmIRound] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)
    || new Date(day + "T12:00:00Z").toISOString().slice(0, 10) !== day) {
    throw new Error("NBA Who Am I preview date must be valid.");
  }
  const random = seededLineupRandom("nba-who-am-i-owner-daily-v1", day);
  const remaining = [...nbaWhoAmIAuthoredIdentities];
  const pick = (): WhoAmIRound => {
    const modern = remaining.filter(row => row.eraBand === "modern");
    const legacy = remaining.filter(row => row.eraBand === "legacy");
    const pool = modern.length && legacy.length
      ? random() < WHO_AM_I_MODERN_ERA_SHARE ? modern : legacy
      : remaining;
    const identity = pool[Math.floor(random() * pool.length)]!;
    remaining.splice(remaining.indexOf(identity), 1);
    return buildNbaWhoAmIAuthoredRound({
      subjectId: identity.subjectId, scriptId: random() < .5 ? "A" : "B",
    });
  };
  if (remaining.length < 2) throw new Error("NBA Who Am I daily pool is incomplete.");
  return [pick(), pick()];
}
