/**
 * The GM head-to-head: one deterministic NFL season for BOTH franchises.
 * Two user-built teams occupy opposite conferences in a 32-team league;
 * 30 seeded virtual clubs fill out the real 7-per-conference postseason.
 * Unlike solo's grade-to-finish lottery, no playoff finish is rolled twice
 * independently. Exactly one club wins the Super Bowl and one loses it.
 */
import type { FootballGmPlayoffFinish, FootballGmRosterEntry } from "./footballGmEngine";
import {
  footballGmEffectiveTeamGrade,
  footballGmPostseasonBonus,
  footballGmTitleOdds,
  type FootballGmSeasonResultV2,
} from "./footballGmStrategy";

export interface FootballGmSharedSide {
  key: string;
  yearOneRoster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
}

interface Contender {
  id: string;
  grade: number;
  regularSeasonStrength: number;
}

function hash(input: string) {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  return (value ^ (value >>> 16)) >>> 0;
}

function roll(seed: string) {
  return hash(seed) / 0x100000000;
}

function bounded(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function game(
  a: Contender,
  b: Contender,
  seed: string,
  round: string,
  aSeed: number,
  bSeed: number,
): [Contender, Contender] {
  // Ratings influence each game, but even heavy favorites can lose.
  const winChance = bounded(
    0.5 + 0.055 * (a.grade - b.grade) + 0.012 * (bSeed - aSeed),
    0.10,
    0.90,
  );
  const key = [a.id, b.id].sort().join(":");
  return roll(`gm-bracket-v1:${seed}:${round}:${key}`) < winChance ? [a, b] : [b, a];
}

export function footballGmSharedPlayoffOutcomes(input: {
  matchSeed: string;
  year: 1 | 2 | 3;
  players: readonly [{ key: string; grade: number }, { key: string; grade: number }];
}): Record<string, FootballGmPlayoffFinish> {
  const sides = [...input.players].sort((a, b) => a.key.localeCompare(b.key));
  if (!sides[0].key || !sides[1].key || sides[0].key === sides[1].key) {
    throw new Error("Shared GM postseason needs two distinct participants.");
  }
  const seed = `${input.matchSeed}:year:${input.year}`;
  const finished: Record<string, FootballGmPlayoffFinish> = {};
  const finalists: Contender[] = [];

  for (let conference = 0; conference < 2; conference += 1) {
    const participant = sides[conference]!;
    const contenders: Contender[] = [];
    const participantId = `gm:${participant.key}`;
    for (let i = 0; i < 16; i += 1) {
      const id = i === 0 ? participantId : `npc:${conference}:${i}`;
      const grade = i === 0
        ? participant.grade
        : 79 + 11 * roll(`${seed}:opponent:${id}`);
      contenders.push({
        id,
        grade,
        regularSeasonStrength: grade + (roll(`${seed}:regular:${id}`) - 0.5) * 7,
      });
    }

    contenders.sort((a, b) => b.regularSeasonStrength - a.regularSeasonStrength || a.id.localeCompare(b.id));
    const postseason = contenders.slice(0, 7);
    for (const team of contenders.slice(7)) finished[team.id] = "Missed Playoffs";
    const rankings = new Map(postseason.map((team, i) => [team.id, i + 1]));
    const playoffGame = (a: Contender, b: Contender, round: string, loss: FootballGmPlayoffFinish) => {
      const [winner, loser] = game(a, b, seed, `${conference}:${round}`, rankings.get(a.id)!, rankings.get(b.id)!);
      finished[loser.id] = loss;
      return winner;
    };

    const wildCards = [
      playoffGame(postseason[1]!, postseason[6]!, "wild:2-7", "Wild Card"),
      playoffGame(postseason[2]!, postseason[5]!, "wild:3-6", "Wild Card"),
      playoffGame(postseason[3]!, postseason[4]!, "wild:4-5", "Wild Card"),
    ];
    // NFL reseeding: highest remaining seed faces the lowest remaining seed.
    const divisionTeams = [postseason[0]!, ...wildCards]
      .sort((a, b) => rankings.get(a.id)! - rankings.get(b.id)!);
    const first = playoffGame(divisionTeams[0]!, divisionTeams[3]!, "div:1", "Divisional");
    const second = playoffGame(divisionTeams[1]!, divisionTeams[2]!, "div:2", "Divisional");
    finalists.push(playoffGame(first, second, "conference", "Conference Championship"));
  }

  const [champion, runnerUp] = game(finalists[0]!, finalists[1]!, seed, "super-bowl", 1, 1);
  finished[runnerUp.id] = "Super Bowl Loss";
  finished[champion.id] = "Champion";
  return Object.fromEntries(sides.map((side) => [
    side.key,
    finished[`gm:${side.key}`] ?? "Missed Playoffs",
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
  )) as [ReturnType<typeof footballGmEffectiveTeamGrade>, ReturnType<typeof footballGmEffectiveTeamGrade>];
  const outcomes = footballGmSharedPlayoffOutcomes({
    matchSeed: input.matchSeed,
    year: input.year,
    players: [
      { key: input.sides[0].key, grade: grades[0].teamGrade },
      { key: input.sides[1].key, grade: grades[1].teamGrade },
    ],
  });
  return Object.fromEntries(input.sides.map((side, i) => {
    const grade = grades[i]!;
    const finish = outcomes[side.key]!;
    return [side.key, {
      year: input.year,
      rawTeamGrade: grade.rawTeamGrade,
      weakLinkPenalty: grade.weakLinkPenalty,
      continuityAdjustment: grade.continuityAdjustment,
      teamGrade: grade.teamGrade,
      finish,
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
