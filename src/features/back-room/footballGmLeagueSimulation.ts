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
import { NFL_GM_LONG_ALL_TEAMS, nflGmLongTeamGeography } from "./footballGmLongConference";

export interface FootballGmLeagueClub {
  id: string;
  /** NFL club identity for Long-only opponent displays. */
  code?: string;
  conference: 0 | 1;
  division: number;
  grade: number;
  winChancePenalty: number;
  wins: number;
  losses: number;
  playoffSeed: number | null;
  finish: FootballGmPlayoffFinish;
}

export interface FootballGmLeagueFranchise {
  key: string;
  grade: number;
  winChancePenalty?: number;
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
  return clamp(0.5 + 0.065 * (strength(a.grade) - strength(b.grade)) + seedBonus
    - a.winChancePenalty + b.winChancePenalty, 0.08, 0.92);
}

function compareStandings(a: FootballGmLeagueClub, b: FootballGmLeagueClub): number {
  return b.wins - a.wins || b.grade - a.grade || a.id.localeCompare(b.id);
}

/**
 * Long-only checkpoint adapter. Ordinary Short, Weekly and H2H calls provide
 * no plan and retain their original 17-game league outcomes byte-for-byte.
 */
export interface FootballGmLongLeaguePlan {
  firstEight: readonly { opponent: string; grade: number; won: boolean }[];
  remaining: readonly { opponent: string; grade: number }[];
  fillers: readonly { opponent: string; grade: number }[];
  gradesByWeek: readonly number[];
  oddsAdjustments: readonly number[];
  playoffOddsAdjustments: readonly number[];
}
export interface FootballGmLongLeagueTimeline {
  games: { opponent: string; grade: number; won: boolean }[];
  postseason: {
    round: "Wild Card" | "Divisional" | "Conference Championship" | "Super Bowl";
    opponent: string;
    won: boolean;
  }[];
}

export function footballGmSimulateLeagueSeason(input: {
  seed: string;
  year: 1 | 2 | 3;
  franchises: readonly FootballGmLeagueFranchise[];
  long?: FootballGmLongLeaguePlan;
}): {
  franchises: Record<string, FootballGmLeagueClub>;
  clubs: FootballGmLeagueClub[];
  timeline?: FootballGmLongLeagueTimeline;
} {
  const franchises = [...input.franchises].sort((a, b) => a.key.localeCompare(b.key));
  if (franchises.length < 1 || franchises.length > 2
    || franchises.some((side) => !side.key || !Number.isFinite(side.grade))
    || (franchises.length === 2 && franchises[0]!.key === franchises[1]!.key)) {
    throw new Error("A GM season requires one or two distinct, graded franchises.");
  }

  const seed = `gm-league-v10:${input.seed}:year:${input.year}`;
  const long = input.long;
  const longTeams = long ? [...long.firstEight, ...long.remaining, ...long.fillers].map(row => row.opponent) : [];
  const missing = long ? NFL_GM_LONG_ALL_TEAMS.filter(code => !longTeams.includes(code)) : [];
  const ownerGeography = missing.length === 1 ? nflGmLongTeamGeography(missing[0]!) : null;
  if (long && (missing.length !== 1 || ownerGeography?.conference !== 0
    || longTeams.some(code => !nflGmLongTeamGeography(code))
    || franchises.length !== 1 || long.firstEight.length !== 8
    || long.remaining.length !== 9 || long.fillers.length !== 14
    || long.gradesByWeek.length !== 9 || long.oddsAdjustments.length !== 9
    || long.playoffOddsAdjustments.length !== 4
    || [...long.firstEight, ...long.remaining, ...long.fillers].some(row =>
      !row.opponent || !Number.isFinite(row.grade))
    || new Set([...long.firstEight, ...long.remaining, ...long.fillers].map(row => row.opponent)).size !== 31
    || [...long.gradesByWeek, ...long.oddsAdjustments, ...long.playoffOddsAdjustments]
      .some(value => !Number.isFinite(value)))) {
    throw new Error("Long GM requires 31 unique clubs and a valid locked 8 + 9 season.");
  }
  // The Short engine's circle schedule pairs slot zero with 17 distinct clubs.
  // Bind saved weeks 1-8 to those exact slots, then the nine remaining games.
  const clubIdentity = new Map<number, { opponent: string; grade: number }>();
  if (long) {
    let schedule = Array.from({ length: 32 }, (_, i) => i);
    const ownerOpponents: number[] = [];
    for (let week = 0; week < 17; week++) {
      ownerOpponents.push(schedule[31]!);
      schedule = [schedule[0]!, schedule[31]!, ...schedule.slice(1, 31)];
    }
    const spareSlots = Array.from({ length: 31 }, (_, i) => i + 1)
      .filter(index => !ownerOpponents.includes(index));
    [...ownerOpponents, ...spareSlots].forEach((slot, index) => {
      const row = [...long.firstEight, ...long.remaining, ...long.fillers][index]!;
      clubIdentity.set(slot, row);
    });
  }
  const timeline: FootballGmLongLeagueTimeline = { games: [], postseason: [] };
  const ownerSlots = new Map<number, FootballGmLeagueFranchise>([
    [0, franchises[0]!],
    ...(franchises[1] ? [[16, franchises[1]!] as const] : []),
  ]);
  const clubs: FootballGmLeagueClub[] = Array.from({ length: 32 }, (_, index) => {
    const owned = ownerSlots.get(index);
    return {
      id: owned ? `gm:${owned.key}` : `npc:${index}`,
      ...(long && !owned ? { code: clubIdentity.get(index)?.opponent } : {}),
      // Real NFL conference/division identity for Long-only opponents.
      // The fantasy franchise replaces the missing AFC club, without
      // altering a single saved first-half opponent or result.
      conference: long ? (owned ? ownerGeography!.conference
        : nflGmLongTeamGeography(clubIdentity.get(index)!.opponent)!.conference)
        : (index < 16 ? 0 : 1) as 0 | 1,
      division: long ? (owned ? ownerGeography!.division
        : nflGmLongTeamGeography(clubIdentity.get(index)!.opponent)!.division)
        : index % 4,
      grade: owned ? owned.grade : clubIdentity.get(index)?.grade ?? (82.5 + 7 * roll(`${seed}:npc-grade:${index}`)),
      winChancePenalty: owned?.winChancePenalty ?? 0,
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
      let winning: FootballGmLeagueClub;
      if (long && (leftId === 0 || rightId === 0)) {
        const owner = clubs[0]!;
        const opponent = leftId === 0 ? right : left;
        if (week < 8) {
          // Never reroll or reinterpret the completed Phase 2 games.
          winning = long.firstEight[week]!.won ? owner : opponent;
        } else {
          owner.grade = long.gradesByWeek[week - 8]!;
          const chance = clamp(winChance(owner, opponent) + long.oddsAdjustments[week - 8]!, 0.08, 0.92);
          winning = roll(`${seed}:week:${week}:${leftId}:${rightId}`) < chance ? owner : opponent;
        }
        timeline.games.push({ opponent: opponent.code!, grade: opponent.grade, won: winning === owner });
      } else {
        winning = roll(`${seed}:week:${week}:${leftId}:${rightId}`) < winChance(left, right) ? left : right;
      }
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
    let probability = clamp(winChance(a, b, seedBonus), 0.10, 0.90);
    const owner = clubs[0]!;
    const ownerInMatch = Boolean(long && (a === owner || b === owner));
    if (ownerInMatch) {
      const roundIndex = round === "super-bowl" ? 3
        : round.includes(":wc:") ? 0 : round.includes(":div:") ? 1 : 2;
      const adjustment = long!.playoffOddsAdjustments[roundIndex]!;
      probability = clamp(probability + (a === owner ? adjustment : -adjustment), 0.10, 0.90);
    }
    const matchup = [a.id, b.id].sort().join(":");
    const winning = roll(`${seed}:playoff:${round}:${matchup}`) < probability ? a : b;
    (winning === a ? b : a).finish = exit;
    if (ownerInMatch) {
      const roundName = round === "super-bowl" ? "Super Bowl"
        : round.includes(":wc:") ? "Wild Card"
          : round.includes(":div:") ? "Divisional" : "Conference Championship";
      timeline.postseason.push({
        round: roundName, opponent: (a === owner ? b : a).code!, won: winning === owner,
      });
    }
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
    ...(long ? { timeline } : {}),
  };
}
