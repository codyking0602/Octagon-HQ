import { footballGmProjectedGradeForPlayer, footballGmSpinTeam, footballGmPlayerById, FOOTBALL_GM_TEAMS } from "./footballGmEngine";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_NEUTRAL_GRADE, NFL_GM_LONG_POSITION_WEIGHTS, nflGmLongValidRoster, type NflGmLongPick, type NflGmLongSlot } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID, NFL_GM_LONG_PLAYER_POOL, type NflGmLongPlayer } from "./footballGmLongCatalog";
import { NFL_GM_LONG_COACHES, nflGmLongCoachEffects, type NflGmLongCoach } from "./footballGmLongCoaches";

export const NFL_GM_LONG_MIDSEASON_GAMES = 8;
export type NflGmLongDeadlineStage = "decision" | "shop" | "spin" | "offers" | "complete";
export type NflGmLongGame = { opponent: string; grade: number; won: boolean };
export type NflGmLongPlayerChange = { playerId: string; delta: number };
export type NflGmLongTrade = {
  outgoingId: string;
  incomingId: string;
  partnerTeam: string;
};
export interface NflGmLongMidseason {
  games: NflGmLongGame[];
  development: NflGmLongPlayerChange[];
  stage: NflGmLongDeadlineStage;
  shoppedPlayerId: string | null;
  partnerTeam: string | null;
  rejectedOfferIds: string[];
  trade: NflGmLongTrade | null;
}

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  return (h ^ (h >>> 16)) >>> 0;
}
function roll(seed: string) { return hash("nfl-long-half-v1:" + seed) / 4294967296; }
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function round(n: number) { return Math.round(n * 10) / 10; }

function coachFor(name: string): NflGmLongCoach {
  const coach = NFL_GM_LONG_COACHES.find(c => c.name === name);
  if (!coach) throw new Error("Long GM requires a hired coach before midseason.");
  return coach;
}
function rosterEntries(picks: readonly NflGmLongPick[]) {
  return picks.map(pick => {
    const player = NFL_GM_LONG_BY_ID.get(pick.playerId);
    if (!player) throw new Error("Unknown signed player.");
    return { slot: pick.slot, grade: player.currentGrade, age: player.age, role: player.role };
  });
}
function coachBonuses(picks: readonly NflGmLongPick[], coach: NflGmLongCoach) {
  return nflGmLongCoachEffects(coach, rosterEntries(picks));
}

/** Matchup-specific coach effects adjust game odds only, never player OVR. */
export function nflGmLongGameProbability(
  grade: number,
  opponentGrade: number,
  effects: ReturnType<typeof nflGmLongCoachEffects>,
  matchup: number,
): number {
  const specialty = [effects.passingMatchupPct, effects.rushingMatchupPct,
    effects.pressurePct, effects.coveragePct][matchup % 4] ?? 0;
  // Existing GM league uses 6.5 points of win probability per raw grade.
  // Coach specialty contributes up to a few pp in its actual matchup only.
  return clamp(0.5 + 0.065 * (clamp(grade, 74, 92.5) - clamp(opponentGrade, 74, 92.5))
    + specialty / 100 + effects.chemistryResiliencePct / 200, 0.08, 0.92);
}

function playerDelta(player: NflGmLongPlayer, runId: string, coach: NflGmLongCoach): number {
  const baseline = player.currentGrade;
  const short = footballGmPlayerById(player.id);
  if (short) {
    // Halfway toward Short's seeded, researched Year 2 grade, not a permanent
    // annual progression and never beyond the existing ceiling or floor.
    const next = footballGmProjectedGradeForPlayer(short, 2, "long-mid:" + runId);
    let change = Math.sign(next - baseline) * Math.ceil(Math.abs(next - baseline) / 2);
    if (player.age != null && player.age <= 26 && change === 0
      && roll(runId + ":developer:" + player.id) < coach.focus[4] * 0.12) {
      change = 1;
    }
    return clamp(change, -Math.min(4, baseline - 70), Math.min(4, 99 - baseline));
  }
  const development = player.development;
  if (!development) return 0;
  const n = roll(runId + ":development:" + player.id) * 100;
  const bonus = player.age !== null && player.age <= 26 ? coach.focus[4] * 5 : 0;
  const breakout = development.breakoutPct + bonus * 0.3;
  const improve = breakout + development.improvePct + bonus * 0.7;
  const steady = improve + Math.max(0, development.steadyPct - bonus);
  const positive = n < breakout
    ? Math.max(1, Math.ceil(development.maxAnnualGain * .55))
    : n < improve ? Math.max(1, Math.ceil(development.maxAnnualGain * .30)) : 0;
  const decline = n >= steady ? -Math.max(1, Math.ceil(development.maxAnnualLoss * .40)) : 0;
  return clamp(positive + decline, -Math.min(4, baseline - 70), Math.min(4, 99 - baseline));
}

/** A deterministic eight-game snapshot, saved once and never rerolled on refresh. */
export function nflGmLongCreateMidseason(
  runId: string,
  picks: readonly NflGmLongPick[],
  coachName: string,
): NflGmLongMidseason {
  if (!nflGmLongValidRoster(picks, NFL_GM_LONG_BY_ID) || picks.length !== 9) {
    throw new Error("Nine valid Long GM starters required.");
  }
  const coach = coachFor(coachName);
  const effects = coachBonuses(picks, coach);
  const grade = NFL_GM_LONG_NEUTRAL_GRADE + picks.reduce((sum, pick) =>
    sum + NFL_GM_LONG_POSITION_WEIGHTS[pick.slot] * (NFL_GM_LONG_BY_ID.get(pick.playerId)!.currentGrade - NFL_GM_LONG_NEUTRAL_GRADE), 0);
  // Eight distinct opponents from the same 32-club authority as the GM wheel.
  // A locked snapshot will remain unchanged by later deadline decisions.
  const opponentOrder = [...FOOTBALL_GM_TEAMS].sort((a, b) =>
    hash(runId + ":opponent:" + a) - hash(runId + ":opponent:" + b));
  const games = Array.from({ length: NFL_GM_LONG_MIDSEASON_GAMES }, (_, i): NflGmLongGame => {
    const opponent = opponentOrder[i]!;
    const otherGrade = round(82.5 + roll(runId + ":npc-grade:" + i) * 7);
    return {
      opponent, grade: otherGrade,
      won: roll(runId + ":week:" + i) < nflGmLongGameProbability(grade, otherGrade, effects, i),
    };
  });
  return {
    games,
    development: picks.map(pick => ({
      playerId: pick.playerId,
      delta: playerDelta(NFL_GM_LONG_BY_ID.get(pick.playerId)!, runId, coach),
    })),
    stage: "decision", shoppedPlayerId: null, partnerTeam: null,
    rejectedOfferIds: [], trade: null,
  };
}

export function nflGmLongRecord(mid: NflGmLongMidseason) {
  const wins = mid.games.filter(g => g.won).length;
  return { wins, losses: mid.games.length - wins };
}

/** Owner picks a valuable player to shop; 32-club wheel remains unrestricted. */
export function nflGmLongTradePartners(outgoingId: string): string[] {
  const outgoing = NFL_GM_LONG_BY_ID.get(outgoingId);
  if (!outgoing) return [];
  return FOOTBALL_GM_TEAMS.filter(code => code !== outgoing.team);
}
export function nflGmLongSpinTradePartner(runId: string, outgoingId: string) {
  const teams = nflGmLongTradePartners(outgoingId);
  if (!teams.length) throw new Error("No trading partner.");
  const selected = footballGmSpinTeam("nfl-long-deadline:" + runId + ":" + outgoingId, 0, teams);
  if (!selected) throw new Error("No eligible NFL trade partner.");
  return selected;
}

/** Show competitive 1-for-1 deals from the spun partner, not arbitrary upgrades. */
export function nflGmLongTradeTargets(
  picks: readonly NflGmLongPick[], outgoingId: string, partnerTeam: string,
): NflGmLongPlayer[] {
  const outgoingPick = picks.find(p => p.playerId === outgoingId);
  const outgoing = NFL_GM_LONG_BY_ID.get(outgoingId);
  if (!outgoingPick || !outgoing || !nflGmLongTradePartners(outgoingId).includes(partnerTeam)) return [];
  const names = new Set(picks.map(p => NFL_GM_LONG_BY_ID.get(p.playerId)?.name.toLowerCase()));
  const others = picks.filter(p => p.playerId !== outgoingId);
  const otherSpend = others.reduce((a, p) => a + NFL_GM_LONG_BY_ID.get(p.playerId)!.salaryWindow[0], 0);
  return NFL_GM_LONG_PLAYER_POOL.filter(player =>
    player.team === partnerTeam && player.eligibleSlots.includes(outgoingPick.slot)
    && !names.has(player.name.toLowerCase()) && player.currentGrade <= outgoing.currentGrade + 4
    && player.currentGrade >= outgoing.currentGrade - 9
    && otherSpend + player.salaryWindow[0] <= NFL_GM_LONG_CAP
    && nflGmLongValidRoster([
      ...others, { slot: outgoingPick.slot, playerId: player.id },
    ], NFL_GM_LONG_BY_ID)
  ).sort((a, b) => Math.abs(a.currentGrade - outgoing.currentGrade) - Math.abs(b.currentGrade - outgoing.currentGrade)
    || a.salaryWindow[0] - b.salaryWindow[0]).slice(0, 5);
}

/** One legal starter-for-starter offer per target. Maximum two refusals. */
export function nflGmLongTryTrade(
  runId: string, picks: readonly NflGmLongPick[], mid: NflGmLongMidseason,
  incomingId: string,
): { accepted: boolean; midseason: NflGmLongMidseason } {
  if (mid.stage !== "offers" || !mid.shoppedPlayerId || !mid.partnerTeam
    || mid.rejectedOfferIds.length >= 2 || mid.trade) throw new Error("Deadline trading is closed.");
  const outgoingId = mid.shoppedPlayerId;
  const outgoing = NFL_GM_LONG_BY_ID.get(outgoingId)!;
  const incoming = nflGmLongTradeTargets(picks, outgoingId, mid.partnerTeam)
    .find(p => p.id === incomingId);
  if (!incoming) throw new Error("A trade must replace the outgoing starter with a legal NFL player.");
  if (mid.rejectedOfferIds.includes(incomingId)) throw new Error("Already proposed this deal.");
  const difference = incoming.currentGrade - outgoing.currentGrade;
  const saving = (incoming.salaryWindow[0] - outgoing.salaryWindow[0]) / 1_000_000;
  const chance = clamp(0.68 - 0.075 * difference + 0.008 * saving, 0.12, 0.92);
  const accepted = roll(runId + ":trade:" + outgoingId + ":" + mid.partnerTeam + ":" + incomingId) < chance;
  const rejectedOfferIds = accepted ? mid.rejectedOfferIds : [...mid.rejectedOfferIds, incomingId];
  const trade: NflGmLongTrade | null = accepted
    ? { outgoingId, incomingId, partnerTeam: mid.partnerTeam } : null;
  return {
    accepted,
    midseason: {
      ...mid, trade, rejectedOfferIds,
      stage: accepted || rejectedOfferIds.length >= 2 ? "complete" : "offers",
    },
  };
}

/** A completed deadline trade changes only one slot; the nine starters stay intact. */
export function nflGmLongActivePicks(picks: readonly NflGmLongPick[], trade: NflGmLongTrade | null) {
  if (!trade) return [...picks];
  return picks.map(p => p.playerId === trade.outgoingId
    ? { slot: p.slot, playerId: trade.incomingId }
    : p);
}

/** Development-adjusted core grade retains all nine starting positions. */
export function nflGmLongActiveGrade(
  picks: readonly NflGmLongPick[], mid: NflGmLongMidseason,
): number {
  const changes = new Map(mid.development.map(d => [d.playerId, d.delta]));
  const active = new Map(nflGmLongActivePicks(picks, mid.trade).map(p => [p.slot, p.playerId]));
  const grade = NFL_GM_LONG_NEUTRAL_GRADE + Object.entries(NFL_GM_LONG_POSITION_WEIGHTS)
    .reduce((sum, [slot, weight]) => {
      const id = active.get(slot as NflGmLongSlot);
      const value = id ? NFL_GM_LONG_BY_ID.get(id)!.currentGrade + (changes.get(id) ?? 0) : NFL_GM_LONG_NEUTRAL_GRADE;
      return sum + weight * (value - NFL_GM_LONG_NEUTRAL_GRADE);
    }, 0);
  return round(grade);
}

/**
 * Monte Carlo remaining nine regular-season games from recorded 8-game results.
 * The benchmark uses a 10-win berth with partial 9-win wildcard qualification,
 * not a guaranteed postseason finish or future-result prediction.
 */
export function nflGmLongPlayoffOutlook(
  runId: string, picks: readonly NflGmLongPick[], coachName: string, mid: NflGmLongMidseason,
): { percent: number; label: string } {
  const coach = coachFor(coachName);
  const effects = coachBonuses(nflGmLongActivePicks(picks, mid.trade), coach);
  const grade = nflGmLongActiveGrade(picks, mid);
  const wins = nflGmLongRecord(mid).wins;
  let made = 0;
  const trials = 256;
  for (let i = 0; i < trials; i++) {
    let projectedWins = wins;
    for (let week = 8; week < 17; week++) {
      const otherGrade = round(82.5 + roll(runId + ":npc-grade:" + week) * 7);
      const probability = nflGmLongGameProbability(grade, otherGrade, effects, week);
      if (roll(runId + ":playoff-outlook:" + i + ":" + week) < probability) projectedWins++;
    }
    if (projectedWins >= 10 || (projectedWins === 9 && roll(runId + ":wildcard:" + i) < .38)) made++;
  }
  const percent = Math.round(made / trials * 100);
  return {
    percent,
    label: percent >= 85 ? "Strong playoff position" : percent >= 55 ? "In the playoff race"
      : percent >= 25 ? "Work to do" : "Long-shot playoff path",
  };
}

/** Verify imported saves rather than allowing a stale or malformed trade to persist. */
export function nflGmLongValidMidseason(
  mid: unknown, picks: readonly NflGmLongPick[],
): mid is NflGmLongMidseason {
  if (!mid || typeof mid !== "object" || Array.isArray(mid)) return false;
  const state = mid as NflGmLongMidseason;
  if (!Array.isArray(state.games) || state.games.length !== 8 || state.games.some(g =>
    !g || !FOOTBALL_GM_TEAMS.includes(g.opponent) || typeof g.won !== "boolean"
    || !Number.isFinite(g.grade) || g.grade < 80 || g.grade > 95)) return false;
  if (!Array.isArray(state.development) || state.development.length !== 9
    || state.development.some(p => !p || typeof p.playerId !== "string"
      || !picks.some(row => row.playerId === p.playerId) || !Number.isInteger(p.delta)
      || p.delta < -4 || p.delta > 4)
    || new Set(state.development.map(p => p.playerId)).size !== 9) return false;
  if (!["decision", "shop", "spin", "offers", "complete"].includes(state.stage)
    || !Array.isArray(state.rejectedOfferIds) || state.rejectedOfferIds.length > 2
    || state.rejectedOfferIds.some(id => typeof id !== "string")
    || new Set(state.rejectedOfferIds).size !== state.rejectedOfferIds.length) return false;
  if (state.shoppedPlayerId !== null && !picks.some(p => p.playerId === state.shoppedPlayerId)) return false;
  if (state.partnerTeam !== null
    && (!state.shoppedPlayerId || !nflGmLongTradePartners(state.shoppedPlayerId).includes(state.partnerTeam))) return false;
  if ((state.stage === "spin" || state.stage === "offers") && !state.shoppedPlayerId) return false;
  if (state.stage === "offers" && !state.partnerTeam) return false;
  if (state.rejectedOfferIds.includes("future")) return false;
  if (state.trade) {
    const t = state.trade;
    if (state.stage !== "complete" || t.outgoingId !== state.shoppedPlayerId
      || t.partnerTeam !== state.partnerTeam
      || typeof t.incomingId !== "string"
      || !nflGmLongTradeTargets(picks, t.outgoingId, t.partnerTeam)
        .some(player => player.id === t.incomingId)) return false;
    // No partial teams or future compensation can be loaded as a valid trade.
    if (!nflGmLongValidRoster(nflGmLongActivePicks(picks, t), NFL_GM_LONG_BY_ID)
      || nflGmLongActivePicks(picks, t).length !== 9) return false;
  }
  return true;
}
