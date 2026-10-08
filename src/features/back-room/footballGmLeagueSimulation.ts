/**
 * Shared NFL GM league simulation (solo and head-to-head).
 *
 * Every club plays exactly 17 real, opposing league games. Division winners
 * plus three wild cards per conference make an NFL-style seven-team bracket.
 * All 32 records and all playoff rounds are resolved once from the same seed.
 *
 * Grading remains on the locked Wheel/GM raw scale; championship chances are
 * an emergent property of games and opponents, never an awarded finish.
 */
import type { FootballGmPlayoffFinish } from "./footballGmEngine";

export interface FootballGmLeagueClub {
  id: string;
  conference: 0 | 1;
  division: number;
  grade: number;
  wins: number;
  losses: number;
  playoffSeed: number | null;
  finish: FootballGmPlayoffFinish;
}

export interface FootballGmLeagueFranchise {
  key: string;
  grade: number;
}

function hash(input: string): number {
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

function roll(key: string): number {
  return hash(key) / 0x1_0000_0000;
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

// A displayed 98 OVR (raw 92) remains a historically great team.
// Diminishing returns above that keep the rare 99 OVR from becoming automatic.
function strength(grade: number): number {
  return clamp(grade, 74, 92.5);
}

function winChance(a: FootballGmLeagueClub, b: FootballGmLeagueClub, seedBonus = 0): number {
  return clamp(0.5 + 0.065 * (strength(a.grade) - strength(b.grade)) + seedBonus, 0.08, 0.92);
}

function compareStandings(a: FootballGmLeagueClub, b: FootballGmLeagueClub): number {
  return b.wins - a.wins || b.grade - a.grade || a.id.localeCompare(b.id);
}

export function footballGmSimulateLeagueSeason(input: {
  seed: string;
  year: 1 | 2 | 3;
  franchises: readonly FootballGmLeagueFranchise[];
}): {
  franchises: Record<string, FootballGmLeagueClub>;
  clubs: FootballGmLeagueClub[];
} {
  const franchises = [...input.franchises].sort((a, b) => a.key.localeCompare(b.key));
  if (franchises.length < 1 || franchises.length > 2
    || franchises.some((side) => !side.key || !Number.isFinite(side.grade))
    || (franchises.length === 2 && franchises[0]!.key === franchises[1]!.key)) {
    throw new Error("A GM season requires one or two distinct, graded franchises.");
  }

  const seed = `gm-league-v10:${input.seed}:year:${input.year}`;
  const ownerSlots = new Map<number, FootballGmLeagueFranchise>([
    [0, franchises[0]!],
    ...(franchises[1] ? [[16, franchises[1]!] as const] : []),
  ]);
  const clubs: FootballGmLeagueClub[] = Array.from({ length: 32 }, (_, index) => {
    const owned = ownerSlots.get(index);
    return {
      id: owned ? `gm:${owned.key}` : `npc:${index}`,
      conference: (index < 16 ? 0 : 1) as 0 | 1,
      division: index % 4,
      grade: owned ? owned.grade : 82.5 + 7 * roll(`${seed}:npc-grade:${index}`),
      wins: 0,
      losses: 0,
      playoffSeed: null,
      finish: "Missed Playoffs",
    };
  });

  // Circle-pairing creates one opposing game per club per week without any
  // duplicate opponents. Each club's 17 games really affect both records.
  let order = Array.from({ length: 32 }, (_, index) => index);
  for (let week = 0; week < 17; week += 1) {
    for (let pair = 0; pair < 16; pair += 1) {
      const leftId = order[pair]!;
      const rightId = order[31 - pair]!;
      const left = clubs[leftId]!;
      const right = clubs[rightId]!;
      const winning = roll(`${seed}:week:${week}:${leftId}:${rightId}`) < winChance(left, right)
        ? left : right;
      winning.wins += 1;
      (winning === left ? right : left).losses += 1;
    }
    order = [order[0]!, order[31]!, ...order.slice(1, 31)];
  }

  const play = (
    a: FootballGmLeagueClub,
    b: FootballGmLeagueClub,
    round: string,
    exit: FootballGmPlayoffFinish,
  ): FootballGmLeagueClub => {
    // Better seeds earn a modest home/bye advantage; upsets remain possible.
    const seedBonus = 0.012 * ((b.playoffSeed ?? 1) - (a.playoffSeed ?? 1));
    const probability = clamp(winChance(a, b, seedBonus), 0.10, 0.90);
    const matchup = [a.id, b.id].sort().join(":");
    const winning = roll(`${seed}:playoff:${round}:${matchup}`) < probability ? a : b;
    (winning === a ? b : a).finish = exit;
    return winning;
  };

  const finalists: FootballGmLeagueClub[] = [];
  for (const conference of [0, 1] as const) {
    const teams = clubs.filter((club) => club.conference === conference);
    const divisionWinners: FootballGmLeagueClub[] = [];
    for (let division = 0; division < 4; division += 1) {
      const winner = teams.filter((team) => team.division === division).sort(compareStandings)[0]!;
      divisionWinners.push(winner);
    }
    const seeds = [
      ...divisionWinners.sort(compareStandings),
      ...teams.filter((team) => !divisionWinners.includes(team)).sort(compareStandings),
    ].slice(0, 7);
    seeds.forEach((team, index) => { team.playoffSeed = index + 1; });
    const wild = [
      play(seeds[1]!, seeds[6]!, `${conference}:wc:2-7`, "Wild Card"),
      play(seeds[2]!, seeds[5]!, `${conference}:wc:3-6`, "Wild Card"),
      play(seeds[3]!, seeds[4]!, `${conference}:wc:4-5`, "Wild Card"),
    ];
    const divisional = [seeds[0]!, ...wild].sort(
      (a, b) => a.playoffSeed! - b.playoffSeed!,
    );
    const first = play(divisional[0]!, divisional[3]!, `${conference}:div:1`, "Divisional");
    const second = play(divisional[1]!, divisional[2]!, `${conference}:div:2`, "Divisional");
    finalists.push(play(first, second, `${conference}:title`, "Conference Championship"));
  }

  const champion = play(finalists[0]!, finalists[1]!, "super-bowl", "Super Bowl Loss");
  champion.finish = "Champion";
  return {
    franchises: Object.fromEntries(franchises.map((franchise) => {
      const club = clubs.find((team) => team.id === `gm:${franchise.key}`)!;
      return [franchise.key, club];
    })),
    clubs,
  };
}
