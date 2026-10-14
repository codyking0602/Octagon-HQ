import { footballGmProjectedGradeForPlayer, footballGmSpinTeam, footballGmPlayerById, FOOTBALL_GM_TEAMS } from "./footballGmEngine";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_NEUTRAL_GRADE, NFL_GM_LONG_POSITION_WEIGHTS, nflGmLongValidRoster, type NflGmLongPick, type NflGmLongSlot } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID, NFL_GM_LONG_PLAYER_POOL, type NflGmLongPlayer } from "./footballGmLongCatalog";
import { NFL_GM_LONG_COACHES, nflGmLongCoachEffects, type NflGmLongCoach } from "./footballGmLongCoaches";
import { nflGmLongCalibratedOlDevelopment } from "./footballGmLongOlCalibration";

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
  /** Existing pick-only trades are retired and their original starter restored. */
  retiredDraftPickTrade?: boolean;
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

/** The same qualitative development language as the established GM report.
 * Preserve numeric changes internally for playoff and roster calculations only. */
export type NflGmLongDevelopmentOutcome =
  "MAJOR IMPROVEMENT" | "IMPROVED" | "HELD STEADY" | "REGRESSED" | "MAJOR REGRESSION";
export function nflGmLongDevelopmentOutcome(delta: number): NflGmLongDevelopmentOutcome {
  if (delta >= 3) return "MAJOR IMPROVEMENT";
  if (delta >= 1) return "IMPROVED";
  if (delta <= -3) return "MAJOR REGRESSION";
  if (delta <= -1) return "REGRESSED";
  return "HELD STEADY";
}

export function nflGmLongPlayerHalftimeDelta(player: NflGmLongPlayer, runId: string, coach: NflGmLongCoach): number {
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
  const development = nflGmLongCalibratedOlDevelopment(player);
  if (!development) return 0;
  const n = roll(runId + ":development:" + player.id) * 100;
  // The researched OL odds are for an entire YEAR. At the eight-game mark
  // only a portion of that season's development and regression risk should
  // have materialized. Keep the remainder as HELD STEADY, never invent an
  // injury or alter the underlying research/grade authority.
  const coachLift = player.age !== null && player.age <= 26 ? coach.focus[4] * 2 : 0;
  const breakoutChance = development.breakoutPct * .5 + coachLift * .25;
  const improveChance = development.improvePct * .5 + coachLift * .75;
  const declineChance = development.declinePct * .45;
  const positive = n < breakoutChance
    ? Math.max(1, Math.ceil(development.maxAnnualGain * .55))
    : n < breakoutChance + improveChance
      ? Math.max(1, Math.ceil(development.maxAnnualGain * .30)) : 0;
  const negative = n >= 100 - declineChance
    ? -Math.max(1, Math.ceil(development.maxAnnualLoss * .30)) : 0;
  // The midseason signal for an elite OL starter is provisional; a harsh
  // full-year regression must not be booked after eight games.
  const change = player.family === "OL" && baseline >= 91
    ? Math.max(-1, positive + negative) : positive + negative;
  return clamp(change, -Math.min(4, baseline - 70), Math.min(4, 99 - baseline));
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
      delta: nflGmLongPlayerHalftimeDelta(NFL_GM_LONG_BY_ID.get(pick.playerId)!, runId, coach),
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
    && nflGmLongValidRoster(
      [...others, { slot: outgoingPick.slot, playerId: player.id }], NFL_GM_LONG_BY_ID)
  ).sort((a, b) => Math.abs(a.currentGrade - outgoing.currentGrade) - Math.abs(b.currentGrade - outgoing.currentGrade)
    || a.salaryWindow[0] - b.salaryWindow[0]).slice(0, 5);
}

/** One deterministic offer per target. Up to two tries, no infinite shopping. */
export function nflGmLongTryTrade(
  runId: string, picks: readonly NflGmLongPick[], mid: NflGmLongMidseason,
  incomingId: string,
): { accepted: boolean; midseason: NflGmLongMidseason } {
  if (mid.stage !== "offers" || !mid.shoppedPlayerId || !mid.partnerTeam
    || mid.rejectedOfferIds.length >= 2 || mid.trade) throw new Error("Deadline trading is closed.");
  const outgoingId = mid.shoppedPlayerId;
  const outgoing = NFL_GM_LONG_BY_ID.get(outgoingId)!;
  const candidates = nflGmLongTradeTargets(picks, outgoingId, mid.partnerTeam);
  if (typeof incomingId !== "string" || !candidates.some(p => p.id === incomingId)) {
    throw new Error("Only an eligible starter-for-starter trade is permitted.");
  }
  if (mid.rejectedOfferIds.includes(incomingId)) throw new Error("Already proposed this deal.");
  const incoming = NFL_GM_LONG_BY_ID.get(incomingId)!;
  const difference = incoming.currentGrade - outgoing.currentGrade;
  const salaryDifference = (incoming.salaryWindow[0] - outgoing.salaryWindow[0]) / 1_000_000;
  const chance = clamp(0.68 - 0.075 * difference + 0.008 * salaryDifference, 0.12, 0.92);
  const accepted = roll(runId + ":trade:" + outgoingId + ":" + mid.partnerTeam + ":" + incomingId) < chance;
  const rejectedOfferIds = accepted ? mid.rejectedOfferIds : [...mid.rejectedOfferIds, incomingId];
  const trade = accepted ? { outgoingId, incomingId, partnerTeam: mid.partnerTeam } : null;
  return {
    accepted,
    midseason: {
      ...mid, trade, rejectedOfferIds,
      stage: accepted || rejectedOfferIds.length >= 2 ? "complete" : "offers",
    },
  };
}

export function nflGmLongActivePicks(picks: readonly NflGmLongPick[], trade: NflGmLongTrade | null) {
  if (!trade) return [...picks];
  return picks.map(p => p.playerId === trade.outgoingId
    ? { slot: p.slot, playerId: trade.incomingId } : { ...p });
}

/** Every accepted trade retains the complete nine-player starting core. */
export function nflGmLongActiveGrade(
  picks: readonly NflGmLongPick[], mid: NflGmLongMidseason, runId?: string, coachName?: string,
): number {
  const changes = new Map(mid.development.map(d => [d.playerId, d.delta]));
  const active = new Map(nflGmLongActivePicks(picks, mid.trade).map(p => [p.slot, p.playerId]));
  const grade = NFL_GM_LONG_NEUTRAL_GRADE + Object.entries(NFL_GM_LONG_POSITION_WEIGHTS)
    .reduce((sum, [slot, weight]) => {
      const id = active.get(slot as NflGmLongSlot);
      const value = id ? NFL_GM_LONG_BY_ID.get(id)!.currentGrade + (changes.get(id) ?? (runId && coachName ? nflGmLongPlayerHalftimeDelta(NFL_GM_LONG_BY_ID.get(id)!, runId, coachFor(coachName)) : 0)) : NFL_GM_LONG_NEUTRAL_GRADE;
      return sum + weight * (value - NFL_GM_LONG_NEUTRAL_GRADE);
    }, 0);
  return round(grade);
}

/**
 * Exactly model remaining wins as a Poisson-binomial distribution rather than
 * trusting 256 optimistic Monte Carlo draws that round a 5–3 contender to 100%.
 * The second-half schedule is not played yet: use a plausible spread of
 * opponent strengths (including playoff-caliber teams), not nine soft draws.
 * Nothing below changes the eight completed and saved games.
 */
export function nflGmLongPlayoffOutlook(
  runId: string, picks: readonly NflGmLongPick[], coachName: string, mid: NflGmLongMidseason,
): { percent: number; label: string } {
  const coach = coachFor(coachName);
  const effects = coachBonuses(nflGmLongActivePicks(picks, mid.trade), coach);
  const grade = nflGmLongActiveGrade(picks, mid, runId, coachName);
  const wins = nflGmLongRecord(mid).wins;
  // distribution[k] = probability of winning exactly k MORE games.
  let distribution = [1];
  for (let week = 8; week < 17; week++) {
    // A conservative, league-wide opponent-strength envelope accounts for
    // elite opponents and unknown schedule difficulty in the remaining games.
    const opponentGrade = 84.5 + 12 * roll(runId + ":playoff-schedule:" + week);
    const chance = nflGmLongGameProbability(grade, opponentGrade, effects, week);
    const next = new Array<number>(distribution.length + 1).fill(0);
    for (let k = 0; k < distribution.length; k++) {
      next[k] = (next[k] ?? 0) + distribution[k]! * (1 - chance);
      next[k + 1] = (next[k + 1] ?? 0) + distribution[k]! * chance;
    }
    distribution = next;
  }
  let made = 0;
  for (let extra = 0; extra < distribution.length; extra++) {
    const totalWins = wins + extra;
    if (totalWins >= 10) made += distribution[extra]!;
    else if (totalWins === 9) made += .38 * distribution[extra]!;
  }
  // A team cannot have clinched a spot after only eight games. Preserve
  // sub-percent uncertainty instead of displaying a false guaranteed 100%.
  const percent = Math.max(0, Math.min(99.9, Math.round(made * 1000) / 10));
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
    || state.rejectedOfferIds.some(id => typeof id !== "string" || id === "future")
    || new Set(state.rejectedOfferIds).size !== state.rejectedOfferIds.length) return false;
  if (state.shoppedPlayerId !== null && !picks.some(p => p.playerId === state.shoppedPlayerId)) return false;
  if (state.partnerTeam !== null
    && (!state.shoppedPlayerId || !nflGmLongTradePartners(state.shoppedPlayerId).includes(state.partnerTeam))) return false;
  if ((state.stage === "spin" || state.stage === "offers") && !state.shoppedPlayerId) return false;
  if (state.stage === "offers" && !state.partnerTeam) return false;
  if (state.retiredDraftPickTrade !== undefined
    && (state.retiredDraftPickTrade !== true || state.trade !== null || state.stage !== "complete")) return false;
  if (state.trade) {
    const t = state.trade;
    if (state.stage !== "complete" || t.outgoingId !== state.shoppedPlayerId
      || t.partnerTeam !== state.partnerTeam || typeof t.incomingId !== "string"
      || "futurePickRound" in t
      || !nflGmLongTradeTargets(picks, t.outgoingId, t.partnerTeam).some(p => p.id === t.incomingId)) return false;
    if (!nflGmLongValidRoster(nflGmLongActivePicks(picks, t), NFL_GM_LONG_BY_ID)) return false;
  }
  return true;
}

/**
 * Previously saved owner-only runs may contain a pick-only deadline trade.
 * Preserve their games, development, coach and original nine picks; retire that
 * unfulfillable compensation and restore the starter without resetting a run.
 * A rejected future-pick offer is removed so it no longer consumes a trade try.
 * Old accepted player-for-player trades retain their replacement unchanged.
 */
export function nflGmLongNormalizeLegacyDeadline(mid: unknown): unknown {
  if (!mid || typeof mid !== "object" || Array.isArray(mid)) return mid;
  const raw = mid as Record<string, unknown>;
  const rejections = raw.rejectedOfferIds;
  const rejectedOfferIds = Array.isArray(rejections)
    ? rejections.filter(id => id !== "future") : rejections;
  const trade = raw.trade;
  if (trade && typeof trade === "object" && !Array.isArray(trade)) {
    const legacy = trade as Record<string, unknown>;
    if (legacy.incomingId === null && [1, 2, 3].includes(Number(legacy.futurePickRound))
      && raw.stage === "complete") {
      return { ...raw, rejectedOfferIds, trade: null, retiredDraftPickTrade: true };
    }
    if (typeof legacy.incomingId === "string" && legacy.futurePickRound === null) {
      const { futurePickRound: _retired, ...replacement } = legacy;
      return { ...raw, rejectedOfferIds, trade: replacement };
    }
  }
  if (Array.isArray(rejections) && Array.isArray(rejectedOfferIds)
    && rejections.length !== rejectedOfferIds.length) {
    return { ...raw, rejectedOfferIds };
  }
  return mid;
}
