import { footballGmPlayerById, footballGmProjectedGradeForPlayer, FOOTBALL_GM_TEAMS, type FootballGmPlayoffFinish } from "./footballGmEngine";
import { footballGmSimulateLeagueSeason, type FootballGmLongLeagueTimeline } from "./footballGmLeagueSimulation";
import { NFL_GM_LONG_NEUTRAL_GRADE, NFL_GM_LONG_POSITION_WEIGHTS, nflGmLongValidRoster, type NflGmLongPick } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID, type NflGmLongPlayer } from "./footballGmLongCatalog";
import { NFL_GM_LONG_COACHES, nflGmLongCoachEffects } from "./footballGmLongCoaches";
import { nflGmLongActivePicks, nflGmLongPlayerHalftimeDelta, type NflGmLongMidseason, type NflGmLongPlayerChange } from "./footballGmLongMidseason";

export type NflGmLongYearOneStage = "regular" | "standings" | "playoffs" | "results";
export interface NflGmLongYearOne {
  stage: NflGmLongYearOneStage;
  revealedGames: number;
  revealedRounds: number;
  games: FootballGmLongLeagueTimeline["games"];
  postseason: FootballGmLongLeagueTimeline["postseason"];
  development: NflGmLongPlayerChange[];
  wins: number;
  losses: number;
  playoffSeed: number | null;
  finish: FootballGmPlayoffFinish;
  secondHalfStartGrade: number;
  finalGrade: number;
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15; h = Math.imul(h, 0x846ca68b);
  return (h ^ (h >>> 16)) >>> 0;
}
function roll(input: string) { return hash("nfl-long-half-v1:" + input) / 4294967296; }
function clamp(value: number, low: number, high: number) { return Math.max(low, Math.min(high, value)); }
function round(value: number) { return Math.round(value * 10) / 10; }

/** Use the same researched NFL development projection and OL probability data
 * already used at halftime. Provisional signals aren't erased by the trade. */
function yearEndDelta(player: NflGmLongPlayer, runId: string, half: number): number {
  const old = footballGmPlayerById(player.id);
  let full = 0;
  if (old) {
    full = footballGmProjectedGradeForPlayer(old, 2, "long-mid:" + runId) - player.currentGrade;
  } else if (player.development) {
    const d = player.development;
    const n = roll(runId + ":development:" + player.id) * 100;
    if (n < d.breakoutPct) full = Math.ceil(d.maxAnnualGain);
    else if (n < d.breakoutPct + d.improvePct) full = Math.max(1, Math.ceil(d.maxAnnualGain * .5));
    else if (n >= 100 - d.declinePct) full = -Math.max(1, Math.ceil(d.maxAnnualLoss * .7));
  }
  // A half-season provisional signal may hold, but it cannot be silently
  // discarded by a separate annual roll. Never display raw changes.
  if (half !== 0 && Math.sign(full) !== Math.sign(half)) full = half;
  else if (Math.abs(half) > Math.abs(full)) full = half;
  return Math.round(clamp(full, 70 - player.currentGrade, 99 - player.currentGrade));
}
function weightedGrade(picks: readonly NflGmLongPick[], development: ReadonlyMap<string, number>): number {
  return round(NFL_GM_LONG_NEUTRAL_GRADE + picks.reduce((sum, pick) => {
    const player = NFL_GM_LONG_BY_ID.get(pick.playerId)!;
    return sum + NFL_GM_LONG_POSITION_WEIGHTS[pick.slot] * (player.currentGrade
      + (development.get(player.id) ?? 0) - NFL_GM_LONG_NEUTRAL_GRADE);
  }, 0));
}

/** Resolve all Year 1 outcomes once. Visibility controls are stored separately
 * so refreshes cannot redraw games or reroll the saved playoff bracket. */
export function nflGmLongCreateYearOne(
  runId: string, picks: readonly NflGmLongPick[], coachName: string, mid: NflGmLongMidseason,
): NflGmLongYearOne {
  if (mid.stage !== "complete" || mid.games.length !== 8
    || picks.length !== 9 || !nflGmLongValidRoster(picks, NFL_GM_LONG_BY_ID)) {
    throw new Error("Finish the saved eight games and trade deadline first.");
  }
  const coach = NFL_GM_LONG_COACHES.find(row => row.name === coachName);
  if (!coach) throw new Error("Year 1 needs the previously hired coach.");
  const active = nflGmLongActivePicks(picks, mid.trade);
  if (!nflGmLongValidRoster(active, NFL_GM_LONG_BY_ID) || active.length !== 9) {
    throw new Error("Year 1 requires the valid nine-player post-deadline roster.");
  }
  const half = new Map(mid.development.map(row => [row.playerId, row.delta]));
  const startDeltas = new Map(active.map(pick => {
    const player = NFL_GM_LONG_BY_ID.get(pick.playerId)!;
    return [player.id, half.get(player.id) ?? nflGmLongPlayerHalftimeDelta(player, runId, coach)] as const;
  }));
  const development = active.map(pick => {
    const player = NFL_GM_LONG_BY_ID.get(pick.playerId)!;
    return { playerId: player.id, delta: yearEndDelta(player, runId, startDeltas.get(player.id)!) };
  });
  const endDeltas = new Map(development.map(row => [row.playerId, row.delta]));
  const secondHalfStartGrade = weightedGrade(active, startDeltas);
  const finalGrade = weightedGrade(active, endDeltas);
  const rosterForCoach = active.map(pick => {
    const player = NFL_GM_LONG_BY_ID.get(pick.playerId)!;
    return { slot: pick.slot, grade: player.currentGrade + startDeltas.get(player.id)!, age: player.age, role: player.role };
  });
  const effects = nflGmLongCoachEffects(coach, rosterForCoach);
  const matchupBonus = [effects.passingMatchupPct, effects.rushingMatchupPct, effects.pressurePct, effects.coveragePct];
  const chemistry = effects.chemistryResiliencePct / 200;
  const remainingTeams = FOOTBALL_GM_TEAMS.filter(team => !mid.games.some(game => game.opponent === team))
    .sort((a, b) => hash(runId + ":remaining:" + a) - hash(runId + ":remaining:" + b));
  const remaining = remainingTeams.slice(0, 9).map((opponent, i) => ({
    opponent, grade: round(84.5 + 12 * roll(runId + ":playoff-schedule:" + (i + 8))),
  }));
  const fillers = remainingTeams.slice(9, 23).map((opponent, i) => ({
    opponent, grade: round(82.5 + 10 * roll(runId + ":extra-opponent:" + i)),
  }));
  const plan = {
    firstEight: mid.games.map(game => ({ ...game })),
    remaining,
    fillers,
    gradesByWeek: Array.from({ length: 9 }, (_, i) =>
      round(secondHalfStartGrade + (finalGrade - secondHalfStartGrade) * (i + 1) / 9)),
    oddsAdjustments: Array.from({ length: 9 }, (_, i) =>
      matchupBonus[(i + 8) % 4]! / 100 + chemistry
      - (mid.trade && i < 4 ? Math.max(0, 0.025 - effects.chemistryResiliencePct / 300) * (4 - i) / 4 : 0)),
    playoffOddsAdjustments: Array.from({ length: 4 }, (_, i) => matchupBonus[i]! / 100 + chemistry),
  };
  const resolved = footballGmSimulateLeagueSeason({
    seed: runId + ":long-year1", year: 1, franchises: [{ key: "long", grade: finalGrade }], long: plan,
  });
  const club = resolved.franchises.long!;
  const timeline = resolved.timeline!;
  if (timeline.games.length !== 17 || club.wins + club.losses !== 17
    || timeline.games.some((game, i) => i < 8 && (game.won !== mid.games[i]!.won || game.opponent !== mid.games[i]!.opponent))) {
    throw new Error("The immutable first eight games did not reconcile to Year 1.");
  }
  return {
    stage: "regular", revealedGames: 0, revealedRounds: 0,
    games: timeline.games, postseason: timeline.postseason,
    development, wins: club.wins, losses: club.losses,
    playoffSeed: club.playoffSeed, finish: club.finish,
    secondHalfStartGrade, finalGrade,
  };
}

/** Parse existing browser state without accepting malformed or inconsistent
 * Year 1 totals. Older Phase 1/2 saves simply have no Year 1 property. */
export function nflGmLongValidYearOne(
  value: unknown, original: readonly NflGmLongPick[], mid: NflGmLongMidseason,
): value is NflGmLongYearOne {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as NflGmLongYearOne;
  if (!["regular", "standings", "playoffs", "results"].includes(v.stage)
    || !Number.isInteger(v.revealedGames) || v.revealedGames < 0 || v.revealedGames > 9
    || !Number.isInteger(v.revealedRounds) || v.revealedRounds < 0
    || !Array.isArray(v.games) || v.games.length !== 17
    || v.games.some(game => !game || !FOOTBALL_GM_TEAMS.includes(game.opponent)
      || !Number.isFinite(game.grade) || game.grade < 70 || game.grade > 100 || typeof game.won !== "boolean")
    || new Set(v.games.map(game => game.opponent)).size !== 17
    || !mid.games.every((game, i) => v.games[i]!.won === game.won
      && v.games[i]!.opponent === game.opponent && v.games[i]!.grade === game.grade)
    || !Number.isInteger(v.wins) || v.wins !== v.games.filter(game => game.won).length
    || v.losses !== 17 - v.wins
    || !Number.isFinite(v.secondHalfStartGrade) || !Number.isFinite(v.finalGrade)
    || v.secondHalfStartGrade < 70 || v.secondHalfStartGrade > 100
    || v.finalGrade < 70 || v.finalGrade > 100
    || !Array.isArray(v.development) || v.development.length !== 9
    || !Array.isArray(v.postseason) || v.postseason.length > 4
    || v.revealedRounds > v.postseason.length
    || !["Missed Playoffs", "Wild Card", "Divisional", "Conference Championship", "Super Bowl Loss", "Champion"].includes(v.finish)
    || (v.playoffSeed !== null && (!Number.isInteger(v.playoffSeed) || v.playoffSeed < 1 || v.playoffSeed > 7))
    || (v.playoffSeed === null) !== (v.finish === "Missed Playoffs")) return false;
  const active = nflGmLongActivePicks(original, mid.trade);
  if (!active.every(pick => v.development.some(d => d.playerId === pick.playerId))
    || new Set(v.development.map(d => d.playerId)).size !== 9
    || v.development.some(d => !Number.isInteger(d.delta) || d.delta < -29 || d.delta > 29)) return false;
  const allowed = ["Wild Card", "Divisional", "Conference Championship", "Super Bowl"];
  if (v.postseason.some((game, i) => !game || !allowed.includes(game.round)
    || !FOOTBALL_GM_TEAMS.includes(game.opponent) || typeof game.won !== "boolean"
    || (i > 0 && allowed.indexOf(game.round) <= allowed.indexOf(v.postseason[i - 1]!.round))))
    return false;
  if (v.finish === "Missed Playoffs" && v.postseason.length > 0) return false;
  if ((v.stage === "standings" || v.stage === "playoffs" || v.stage === "results") && v.revealedGames !== 9) return false;
  if (v.stage === "results" && v.revealedRounds !== v.postseason.length) return false;
  return true;
}
