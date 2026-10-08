/**
 * Solo and multiplayer use the same deterministic 32-club, 17-game season.
 * Both players compete in opposite conferences against a single shared league.
 * Regular-season records and every postseason matchup are immutable once locked.
 */
import type { FootballGmPlayoffFinish, FootballGmRosterEntry } from "./footballGmEngine";
import {
  footballGmEffectiveTeamGrade,
  footballGmPostseasonBonus,
  footballGmTitleOdds,
  type FootballGmSeasonResultV2,
} from "./footballGmStrategy";
import { footballGmSimulateLeagueSeason } from "./footballGmLeagueSimulation";
import { FOOTBALL_GM_DEVELOPMENT_SEED_TAG } from "./wheelFootballGmEconomy";

export interface FootballGmSharedSide {
  key: string;
  yearOneRoster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
  /** Preserves historical untagged runs while giving new matches per-GM development. */
  developmentSeed?: string;
}

export function footballGmMatchDevelopmentSeed(
  matchSeed: string,
  profileId: string,
  enabled: boolean,
) {
  return `${matchSeed}:${profileId}${enabled ? FOOTBALL_GM_DEVELOPMENT_SEED_TAG : ""}`;
}

/** Legacy matches must not have their already-active offseason changed on release. */
export function footballGmMatchUsesSeededDevelopment(participants: readonly {
  run_state: Record<string, unknown>;
  year1_result: unknown;
}[]) {
  const versions = participants.map((participant) => String(participant.run_state.version ?? ""));
  if (versions.some((version) => /football-gm-v(?:8|9|10)-/.test(version))) return false;
  if (versions.some((version) => version === "football-gm-v11-seeded-development")) return true;
  // Fresh, untouched matches can safely adopt the new model. Active unknown
  // historical matches do not get a different offseason retroactively.
  return participants.every((participant) => (
    !participant.year1_result
    && (!Array.isArray(participant.run_state.roster) || participant.run_state.roster.length === 0)
  ));
}

export function footballGmSharedPlayoffOutcomes(input: {
  matchSeed: string;
  year: 1 | 2 | 3;
  players: readonly [{ key: string; grade: number }, { key: string; grade: number }];
}): Record<string, FootballGmPlayoffFinish> {
  const season = footballGmSimulateLeagueSeason({
    seed: input.matchSeed,
    year: input.year,
    franchises: input.players,
  });
  return Object.fromEntries(input.players.map((side) => [
    side.key, season.franchises[side.key]!.finish,
  ]));
}

export function footballGmSharedSeason(input: {
  matchSeed: string;
  year: 1 | 2 | 3;
  sides: readonly [FootballGmSharedSide, FootballGmSharedSide];
}): Record<string, FootballGmSeasonResultV2> {
  const grades = input.sides.map((side) => footballGmEffectiveTeamGrade(
    side.yearOneRoster,
    input.year === 1 ? side.yearOneRoster : side.finalRoster,
    input.year,
    side.developmentSeed,
  )) as [ReturnType<typeof footballGmEffectiveTeamGrade>, ReturnType<typeof footballGmEffectiveTeamGrade>];
  const outcomes = footballGmSimulateLeagueSeason({
    seed: input.matchSeed,
    year: input.year,
    franchises: [
      { key: input.sides[0].key, grade: grades[0].teamGrade },
      { key: input.sides[1].key, grade: grades[1].teamGrade },
    ],
  }).franchises;
  return Object.fromEntries(input.sides.map((side, i) => {
    const grade = grades[i]!;
    const season = outcomes[side.key]!;
    const finish = season.finish;
    return [side.key, {
      year: input.year,
      rawTeamGrade: grade.rawTeamGrade,
      weakLinkPenalty: grade.weakLinkPenalty,
      continuityAdjustment: grade.continuityAdjustment,
      teamGrade: grade.teamGrade,
      finish,
      wins: season.wins,
      losses: season.losses,
      playoffSeed: season.playoffSeed,
      postseasonBonus: footballGmPostseasonBonus(finish),
      titleOdds: Math.round(footballGmTitleOdds(grade.teamGrade) * 1000) / 10,
    } satisfies FootballGmSeasonResultV2];
  }));
}

export function footballGmSharedThreeYears(matchSeed: string, sides: readonly [FootballGmSharedSide, FootballGmSharedSide]) {
  const results = sides.map((side) => ({ key: side.key, seasons: [] as FootballGmSeasonResultV2[] }));
  for (const year of [1, 2, 3] as const) {
    const season = footballGmSharedSeason({ matchSeed, sides, year });
    for (const side of results) side.seasons.push(season[side.key]!);
  }
  return Object.fromEntries(results.map(({ key, seasons }) => [key, seasons]));
}

/** Existing saved matches can contain an impossible Year 1 double-finalist.
 * Preserve the already-assigned offseason priority while repairing that
 * historical reveal; new matches always use the shared league bracket.
 */
export function footballGmRepairLegacyYearOne(
  left: FootballGmSeasonResultV2,
  right: FootballGmSeasonResultV2,
  firstOffseasonKey: string | null,
  leftKey: string,
  rightKey: string,
): [FootballGmSeasonResultV2, FootballGmSeasonResultV2] | null {
  if (!firstOffseasonKey || !["Champion", "Super Bowl Loss"].includes(left.finish) || left.finish !== right.finish) return null;
  const withFinish = (original: FootballGmSeasonResultV2, finish: FootballGmPlayoffFinish) => ({
    ...original,
    finish,
    postseasonBonus: footballGmPostseasonBonus(finish),
  });
  return firstOffseasonKey === leftKey
    ? [withFinish(left, "Super Bowl Loss"), withFinish(right, "Champion")]
    : firstOffseasonKey === rightKey
      ? [withFinish(left, "Champion"), withFinish(right, "Super Bowl Loss")]
      : null;
}
