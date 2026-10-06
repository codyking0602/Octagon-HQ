import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  FOOTBALL_GM_TEAMS,
  footballGmCandidatesForTeam,
  footballGmPlayerById,
  footballGmProjectedGradeForPlayer,
  footballGmSpinTeam,
  type FootballGmPlayer,
  type FootballGmPlayoffFinish,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
} from "./footballGmEngine";
import historicalFinalFour from "../../../data/generated/football/gm-historical-final-four-2021-2025.json";

export const FOOTBALL_GM_VERSION = "football-gm-v7-playtest";
export const FOOTBALL_GM_MAX_TRADE_PLAYERS = 2;

export const FOOTBALL_GM_POSITION_WEIGHTS: Readonly<Record<FootballGmRosterSlot, number>> = {
  QB: 0.26,
  RB: 0.10,
  WR: 0.15,
  FLEX: 0.09,
  DL: 0.15,
  LB: 0.10,
  DB: 0.15,
};

/**
 * Real recent contender calibration derived from Pro Football Reference AV.
 * The generated data file documents the source, percentile mapping and the
 * seven-slot core selected for every conference finalist from 2021-2025.
 */
export const FOOTBALL_GM_HISTORICAL_FINAL_FOUR = historicalFinalFour.teams;
export const FOOTBALL_GM_HISTORICAL_ANCHORS = historicalFinalFour.anchors;


export interface FootballGmContinuity {
  retained: number;
  changes: number;
  qbRetained: boolean;
  meter: number;
  label: "ELITE" | "STRONG" | "MIXED" | "LOW" | "RESET";
  adjustment: number;
}

export interface FootballGmSeasonResultV2 {
  year: 1 | 2 | 3;
  rawTeamGrade: number;
  weakLinkPenalty: number;
  continuityAdjustment: number;
  teamGrade: number;
  finish: FootballGmPlayoffFinish;
  postseasonBonus: number;
  titleOdds: number;
}

export interface FootballGmFinalResultV2 {
  score: number;
  coreScore: number;
  postseasonBonus: number;
  seasons: readonly FootballGmSeasonResultV2[];
  continuity: {
    year2: FootballGmContinuity;
    year3: FootballGmContinuity;
  };
  roster: readonly {
    slot: FootballGmRosterSlot;
    playerId: string;
    name: string;
    team: string;
  }[];
}

export interface FootballGmTradeProposal {
  outgoingPlayerIds: readonly string[];
  incomingPlayerIds: readonly string[];
}

export interface FootballGmTradeEvaluation {
  accepted: boolean;
  reason: "accepted" | "value" | "roster" | "invalid";
  partnerReceivesValue: number;
  partnerSendsValue: number;
  threshold: number;
  postTradePlayerIds: readonly string[];
  requiresCuts: number;
  nextRoster: readonly FootballGmRosterEntry[] | null;
}

export interface FootballGmTargetTradeOffer {
  proposal: FootballGmTradeProposal;
  evaluation: FootballGmTradeEvaluation;
  shape: "1-for-1" | "2-for-1" | "1-for-2" | "2-for-2";
}

export type FootballGmNegotiationConsequences = Readonly<Record<string, number>>;

type OutcomeRow = Readonly<Record<FootballGmPlayoffFinish, number>> & { grade: number };

/**
 * Live-grade outcome calibration.
 *
 * These anchors intentionally use the manually audited Wheel/GM scale rather
 * than the historical AV-percentile artifact. On the live scale, a low-90s
 * roster is already a real contender and a 92-94 roster is elite, while
 * seeded variance still leaves room for misses and surprise runs.
 */
const OUTCOME_CURVE: readonly OutcomeRow[] = [
  { grade: 80, "Missed Playoffs": 0.68, "Wild Card": 0.20, Divisional: 0.08, "Conference Championship": 0.03, "Super Bowl Loss": 0.008, Champion: 0.002 },
  { grade: 84, "Missed Playoffs": 0.48, "Wild Card": 0.27, Divisional: 0.14, "Conference Championship": 0.07, "Super Bowl Loss": 0.025, Champion: 0.015 },
  { grade: 87, "Missed Playoffs": 0.34, "Wild Card": 0.27, Divisional: 0.18, "Conference Championship": 0.11, "Super Bowl Loss": 0.06, Champion: 0.04 },
  { grade: 88, "Missed Playoffs": 0.29, "Wild Card": 0.26, Divisional: 0.19, "Conference Championship": 0.12, "Super Bowl Loss": 0.085, Champion: 0.055 },
  { grade: 90, "Missed Playoffs": 0.20, "Wild Card": 0.23, Divisional: 0.20, "Conference Championship": 0.16, "Super Bowl Loss": 0.12, Champion: 0.09 },
  { grade: 91, "Missed Playoffs": 0.16, "Wild Card": 0.21, Divisional: 0.20, "Conference Championship": 0.18, "Super Bowl Loss": 0.13, Champion: 0.12 },
  { grade: 92, "Missed Playoffs": 0.12, "Wild Card": 0.18, Divisional: 0.19, "Conference Championship": 0.19, "Super Bowl Loss": 0.16, Champion: 0.16 },
  { grade: 93, "Missed Playoffs": 0.09, "Wild Card": 0.15, Divisional: 0.18, "Conference Championship": 0.20, "Super Bowl Loss": 0.17, Champion: 0.21 },
  { grade: 94, "Missed Playoffs": 0.065, "Wild Card": 0.12, Divisional: 0.165, "Conference Championship": 0.19, "Super Bowl Loss": 0.19, Champion: 0.27 },
  { grade: 96, "Missed Playoffs": 0.04, "Wild Card": 0.08, Divisional: 0.13, "Conference Championship": 0.17, "Super Bowl Loss": 0.22, Champion: 0.36 },
  { grade: 98, "Missed Playoffs": 0.02, "Wild Card": 0.05, Divisional: 0.09, "Conference Championship": 0.14, "Super Bowl Loss": 0.23, Champion: 0.47 },
];

const FINISH_ORDER: readonly FootballGmPlayoffFinish[] = [
  "Missed Playoffs",
  "Wild Card",
  "Divisional",
  "Conference Championship",
  "Super Bowl Loss",
  "Champion",
];

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function roundHalfMillion(value: number) {
  return Math.max(500_000, Math.round(value / 500_000) * 500_000);
}

function rosterPlayerIds(roster: readonly FootballGmRosterEntry[]) {
  return new Set(roster.map((entry) => entry.playerId));
}

function preferredSlotForPlayer(player: FootballGmPlayer) {
  if (player.eligibleSlots.includes("QB")) return "QB";
  if (player.eligibleSlots.includes("RB")) return "RB";
  if (player.eligibleSlots.includes("WR")) return "WR";
  if (player.eligibleSlots.includes("DL")) return "DL";
  if (player.eligibleSlots.includes("LB")) return "LB";
  if (player.eligibleSlots.includes("DB")) return "DB";
  return "FLEX";
}

function rawWeightedGrade(roster: readonly FootballGmRosterEntry[], year: 1 | 2 | 3) {
  if (roster.length !== FOOTBALL_GM_ROSTER_SLOTS.length) return 0;
  const score = roster.reduce((sum, entry) => {
    const player = footballGmPlayerById(entry.playerId);
    return player
      ? sum + (footballGmProjectedGradeForPlayer(player, year) * FOOTBALL_GM_POSITION_WEIGHTS[entry.slot])
      : sum;
  }, 0);
  return Math.round(score * 10) / 10;
}

export function footballGmWeakLinkPenalty(
  roster: readonly FootballGmRosterEntry[],
  year: 1 | 2 | 3,
) {
  if (roster.length !== FOOTBALL_GM_ROSTER_SLOTS.length) return 0;
  const grades = roster
    .map((entry) => {
      const player = footballGmPlayerById(entry.playerId);
      return player ? footballGmProjectedGradeForPlayer(player, year) : 70;
    })
    .sort((a, b) => a - b);
  const lowest = grades[0] ?? 80;
  const second = grades[1] ?? 78;
  const penalty = Math.max(0, 80 - lowest) * 0.10 + Math.max(0, 78 - second) * 0.04;
  return Math.round(Math.min(0.8, penalty) * 10) / 10;
}

export function footballGmContinuity(
  yearOneRoster: readonly FootballGmRosterEntry[],
  currentRoster: readonly FootballGmRosterEntry[],
  year: 2 | 3,
): FootballGmContinuity {
  const original = rosterPlayerIds(yearOneRoster);
  const retained = currentRoster.filter((entry) => original.has(entry.playerId)).length;
  const changes = Math.max(0, FOOTBALL_GM_ROSTER_SLOTS.length - retained);
  const originalQb = yearOneRoster.find((entry) => entry.slot === "QB")?.playerId ?? null;
  const currentQb = currentRoster.find((entry) => entry.slot === "QB")?.playerId ?? null;
  const qbRetained = Boolean(originalQb && currentQb && originalQb === currentQb);

  const yearTwoByRetained = [ -2.0, -1.75, -1.5, -1.15, -0.75, -0.35, 0, 0.35 ] as const;
  const yearThreeByRetained = [ -1.0, -0.9, -0.75, -0.55, -0.3, 0, 0.2, 0.55 ] as const;
  let adjustment = (year === 2 ? yearTwoByRetained : yearThreeByRetained)[clamp(retained, 0, 7)] ?? 0;
  if (!qbRetained) adjustment -= year === 2 ? 0.25 : 0.10;

  const meter = clamp(Math.round(16 + retained * 12 - (qbRetained ? 0 : 5)), 0, 100);
  const label: FootballGmContinuity["label"] = meter >= 88
    ? "ELITE"
    : meter >= 72
      ? "STRONG"
      : meter >= 52
        ? "MIXED"
        : meter >= 32
          ? "LOW"
          : "RESET";

  return {
    retained,
    changes,
    qbRetained,
    meter,
    label,
    adjustment: Math.round(adjustment * 10) / 10,
  };
}

export function footballGmEffectiveTeamGrade(
  yearOneRoster: readonly FootballGmRosterEntry[],
  roster: readonly FootballGmRosterEntry[],
  year: 1 | 2 | 3,
) {
  const rawTeamGrade = rawWeightedGrade(roster, year);
  const weakLinkPenalty = footballGmWeakLinkPenalty(roster, year);
  const continuity = year === 1 ? null : footballGmContinuity(yearOneRoster, roster, year);
  const continuityAdjustment = continuity?.adjustment ?? 0;
  const teamGrade = Math.round((rawTeamGrade - weakLinkPenalty + continuityAdjustment) * 10) / 10;
  return { rawTeamGrade, weakLinkPenalty, continuityAdjustment, teamGrade, continuity };
}

function outcomeProbabilities(teamGrade: number) {
  const bounded = clamp(teamGrade, OUTCOME_CURVE[0]!.grade, OUTCOME_CURVE[OUTCOME_CURVE.length - 1]!.grade);
  let low = OUTCOME_CURVE[0]!;
  let high = OUTCOME_CURVE[OUTCOME_CURVE.length - 1]!;
  for (let index = 1; index < OUTCOME_CURVE.length; index += 1) {
    if (bounded <= OUTCOME_CURVE[index]!.grade) {
      low = OUTCOME_CURVE[index - 1]!;
      high = OUTCOME_CURVE[index]!;
      break;
    }
  }
  const span = Math.max(1, high.grade - low.grade);
  const pct = clamp((bounded - low.grade) / span, 0, 1);
  return Object.fromEntries(FINISH_ORDER.map((finish) => [
    finish,
    low[finish] + ((high[finish] - low[finish]) * pct),
  ])) as Record<FootballGmPlayoffFinish, number>;
}

export function footballGmTitleOdds(teamGrade: number) {
  return outcomeProbabilities(teamGrade).Champion;
}

export function footballGmPostseasonBonus(finish: FootballGmPlayoffFinish) {
  if (finish === "Champion") return 7;
  if (finish === "Super Bowl Loss") return 5;
  if (finish === "Conference Championship") return 3.5;
  if (finish === "Divisional") return 2;
  if (finish === "Wild Card") return 1;
  return 0;
}

function avalancheHash(value: string) {
  let hash = hashString(value);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

export function footballGmSeasonRoll(seed: string, year: 1 | 2 | 3) {
  const salts = ["blue-17", "silver-43", "gold-89"] as const;
  return avalancheHash(`gm-season-v3:${salts[year - 1]}:${seed}`) / 0x1_0000_0000;
}

function deterministicFinish(seed: string, year: 1 | 2 | 3, teamGrade: number) {
  const probabilities = outcomeProbabilities(teamGrade);
  const roll = footballGmSeasonRoll(seed, year);
  let running = 0;
  for (const finish of FINISH_ORDER) {
    running += probabilities[finish];
    if (roll <= running) return finish;
  }
  return "Champion" as const;
}

export function footballGmNegotiationPremiumPct(
  seed: string,
  playerId: string,
  failedPartnerCount: number,
) {
  if (failedPartnerCount <= 0) return 0;
  const seedPremium = (hashString(`${seed}:camp:${playerId}`) % 11) / 1000;
  return Math.min(0.08, 0.04 + seedPremium + Math.max(0, failedPartnerCount - 1) * 0.01);
}

export function footballGmAdjustedSalaryForPlayer(
  player: FootballGmPlayer,
  year: 1 | 2 | 3,
  seed: string,
  consequences: FootballGmNegotiationConsequences,
) {
  const base = player.salaryWindow[year - 1];
  if (year === 1 || player.gameContract === "3YR") return base;
  const failedCount = consequences[player.id] ?? 0;
  const premium = footballGmNegotiationPremiumPct(seed, player.id, failedCount);
  return premium ? roundHalfMillion(base * (1 + premium)) : base;
}

export function footballGmAdjustedRosterCap(
  roster: readonly FootballGmRosterEntry[],
  year: 1 | 2 | 3,
  seed: string,
  consequences: FootballGmNegotiationConsequences,
) {
  return roster.reduce((sum, entry) => {
    const player = footballGmPlayerById(entry.playerId);
    return player ? sum + footballGmAdjustedSalaryForPlayer(player, year, seed, consequences) : sum;
  }, 0);
}

export function footballGmAdjustedAssetCap(
  roster: readonly FootballGmRosterEntry[],
  tradeChipPlayerIds: readonly string[],
  year: 1 | 2 | 3,
  seed: string,
  consequences: FootballGmNegotiationConsequences,
) {
  const activeIds = rosterPlayerIds(roster);
  return tradeChipPlayerIds.reduce((sum, playerId) => {
    if (activeIds.has(playerId)) return sum;
    const player = footballGmPlayerById(playerId);
    return player ? sum + footballGmAdjustedSalaryForPlayer(player, year, seed, consequences) : sum;
  }, footballGmAdjustedRosterCap(roster, year, seed, consequences));
}

export function footballGmIsOffseasonCompliantV2(
  roster: readonly FootballGmRosterEntry[],
  seed: string,
  consequences: FootballGmNegotiationConsequences,
  tradeChipPlayerIds: readonly string[] = [],
) {
  return roster.length === FOOTBALL_GM_ROSTER_SLOTS.length
    && tradeChipPlayerIds.length === 0
    && footballGmAdjustedAssetCap(roster, tradeChipPlayerIds, 2, seed, consequences) <= FOOTBALL_GM_CAP
    && footballGmAdjustedAssetCap(roster, tradeChipPlayerIds, 3, seed, consequences) <= FOOTBALL_GM_CAP;
}

export interface FootballGmFreeAgencySigningOption {
  slot: FootballGmRosterSlot;
  displacedPlayerId: string | null;
}

export interface FootballGmFreeAgencyCandidate {
  player: FootballGmPlayer;
  salary: number;
  legalSlots: readonly FootballGmRosterSlot[];
  signingOptions: readonly FootballGmFreeAgencySigningOption[];
}

export function footballGmFreeAgencyCandidatesForTeam(input: {
  team: string;
  roster: readonly FootballGmRosterEntry[];
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  tradeChipPlayerIds?: readonly string[];
  excludedPlayerIds?: readonly string[];
}): FootballGmFreeAgencyCandidate[] {
  if (input.roster.length > FOOTBALL_GM_ROSTER_SLOTS.length) return [];
  const tradeChipPlayerIds = input.tradeChipPlayerIds ?? [];
  const excluded = new Set(input.excludedPlayerIds ?? []);
  const owned = new Set([...input.roster.map((entry) => entry.playerId), ...tradeChipPlayerIds]);
  const ownedNames = new Set(
    [...owned].flatMap((playerId) => {
      const player = footballGmPlayerById(playerId);
      return player ? [player.name] : [];
    }),
  );
  const yearTwoBase = footballGmAdjustedAssetCap(
    input.roster,
    tradeChipPlayerIds,
    2,
    input.seed,
    input.consequences,
  );
  const yearThreeBase = footballGmAdjustedAssetCap(
    input.roster,
    tradeChipPlayerIds,
    3,
    input.seed,
    input.consequences,
  );

  return FOOTBALL_GM_PLAYER_POOL
    .filter((player) => player.team === input.team)
    .filter((player) => player.gameContract === "1YR")
    .filter((player) => !owned.has(player.id) && !ownedNames.has(player.name) && !excluded.has(player.id))
    .flatMap<FootballGmFreeAgencyCandidate>((player) => {
      const yearTwoSalary = player.salaryWindow[1];
      const yearThreeSalary = player.salaryWindow[2];
      if (
        yearTwoBase + yearTwoSalary > FOOTBALL_GM_CAP
        || yearThreeBase + yearThreeSalary > FOOTBALL_GM_CAP
      ) return [];

      const signingOptions = player.eligibleSlots.flatMap<FootballGmFreeAgencySigningOption>((slot) => {
        const incumbent = input.roster.find((entry) => entry.slot === slot) ?? null;
        if (!incumbent && input.roster.length >= FOOTBALL_GM_ROSTER_SLOTS.length) return [];
        return [{ slot, displacedPlayerId: incumbent?.playerId ?? null }];
      });
      if (!signingOptions.length) return [];
      return [{
        player,
        salary: yearTwoSalary,
        legalSlots: signingOptions.map((option) => option.slot),
        signingOptions,
      }];
    })
    .sort((left, right) => (
      right.player.currentGrade - left.player.currentGrade
      || left.salary - right.salary
      || left.player.name.localeCompare(right.player.name)
    ));
}

export function footballGmApplyFreeAgencySigning(input: {
  roster: readonly FootballGmRosterEntry[];
  tradeChipPlayerIds?: readonly string[];
  playerId: string;
  slot: FootballGmRosterSlot;
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  excludedPlayerIds?: readonly string[];
}) {
  const player = footballGmPlayerById(input.playerId);
  if (!player || player.gameContract !== "1YR") return null;
  const candidate = footballGmFreeAgencyCandidatesForTeam({
    team: player.team,
    roster: input.roster,
    seed: input.seed,
    consequences: input.consequences,
    tradeChipPlayerIds: input.tradeChipPlayerIds,
    excludedPlayerIds: input.excludedPlayerIds,
  }).find((row) => row.player.id === player.id);
  const option = candidate?.signingOptions.find((row) => row.slot === input.slot) ?? null;
  if (!candidate || !option) return null;

  const nextRoster = input.roster.filter((entry) => entry.slot !== option.slot);
  nextRoster.push({ slot: option.slot, playerId: player.id, acquired: "replacement" });
  const nextTradeChips = [...new Set([
    ...(input.tradeChipPlayerIds ?? []),
    ...(option.displacedPlayerId ? [option.displacedPlayerId] : []),
  ])];
  if (new Set(nextRoster.map((entry) => entry.slot)).size !== nextRoster.length) return null;
  if (new Set(nextRoster.map((entry) => entry.playerId)).size !== nextRoster.length) return null;
  return {
    roster: nextRoster,
    tradeChipPlayerIds: nextTradeChips,
    displacedPlayerId: option.displacedPlayerId,
  };
}

export function footballGmEligibleFreeAgencyTeams(input: {
  roster: readonly FootballGmRosterEntry[];
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  tradeChipPlayerIds?: readonly string[];
  previousTeam?: string | null;
  excludedPlayerIds?: readonly string[];
}) {
  let teams = FOOTBALL_GM_TEAMS.filter((team) => footballGmFreeAgencyCandidatesForTeam({
    team,
    roster: input.roster,
    seed: input.seed,
    consequences: input.consequences,
    tradeChipPlayerIds: input.tradeChipPlayerIds,
    excludedPlayerIds: input.excludedPlayerIds,
  }).length > 0);
  if (input.previousTeam && teams.length > 1) {
    const withoutRepeat = teams.filter((team) => team !== input.previousTeam);
    if (withoutRepeat.length) teams = withoutRepeat;
  }
  return teams;
}

export function footballGmSeasonResultV2(input: {
  seed: string;
  yearOneRoster: readonly FootballGmRosterEntry[];
  roster: readonly FootballGmRosterEntry[];
  year: 1 | 2 | 3;
}) {
  const grade = footballGmEffectiveTeamGrade(input.yearOneRoster, input.roster, input.year);
  const finish = deterministicFinish(input.seed, input.year, grade.teamGrade);
  return {
    year: input.year,
    rawTeamGrade: grade.rawTeamGrade,
    weakLinkPenalty: grade.weakLinkPenalty,
    continuityAdjustment: grade.continuityAdjustment,
    teamGrade: grade.teamGrade,
    finish,
    postseasonBonus: footballGmPostseasonBonus(finish),
    titleOdds: Math.round(footballGmTitleOdds(grade.teamGrade) * 1000) / 10,
  } satisfies FootballGmSeasonResultV2;
}

function teamNeedFactor(team: string, player: FootballGmPlayer) {
  const eligible = player.eligibleSlots;
  let weakestBest = 99;
  for (const slot of eligible) {
    const best = FOOTBALL_GM_PLAYER_POOL
      .filter((candidate) => candidate.team === team && candidate.id !== player.id && candidate.eligibleSlots.includes(slot))
      .reduce((value, candidate) => Math.max(value, candidate.currentGrade), 70);
    weakestBest = Math.min(weakestBest, best);
  }
  if (weakestBest < 80) return 1.12;
  if (weakestBest < 84) return 1.07;
  if (weakestBest < 88) return 1.03;
  if (weakestBest > 94) return 0.94;
  return 1;
}

function tradePositionFactor(player: FootballGmPlayer) {
  const slot = preferredSlotForPlayer(player);
  if (slot === "QB") return 1.45;
  if (slot === "RB") return 0.90;
  if (slot === "WR") return 1.12;
  if (slot === "DL") return 1.12;
  if (slot === "DB") return 1.08;
  return 1;
}

function tradeAgeFactor(player: FootballGmPlayer) {
  if (preferredSlotForPlayer(player) === "QB") {
    if (player.age <= 30) return 1.08;
    if (player.age <= 34) return 1;
    if (player.age <= 36) return 0.92;
    return 0.82;
  }
  if (player.age <= 24) return 1.15;
  if (player.age <= 27) return 1.08;
  if (player.age <= 30) return 1;
  if (player.age <= 32) return 0.92;
  return 0.82;
}

function tradeControlFactor(player: FootballGmPlayer) {
  if (player.gameContract === "1YR") return 0.92;
  const market = Math.max(1, player.projectedExtensionApy);
  const locked = player.salaryWindow[1];
  const surplus = clamp((market - locked) / market, -0.25, 0.6);
  return 1.08 + Math.max(-0.08, surplus * 0.18);
}

export function footballGmTradeAssetValue(player: FootballGmPlayer, acquiringTeam: string) {
  const grade = footballGmProjectedGradeForPlayer(player, 2);
  const talent = Math.pow(Math.max(5, grade - 64), 1.45);
  return talent
    * tradePositionFactor(player)
    * tradeAgeFactor(player)
    * tradeControlFactor(player)
    * teamNeedFactor(acquiringTeam, player);
}

function assignRoster(
  players: readonly { player: FootballGmPlayer; acquired: FootballGmRosterEntry["acquired"]; preferredSlot?: FootballGmRosterSlot }[],
) {
  if (players.length > FOOTBALL_GM_ROSTER_SLOTS.length) return null;
  const ordered = [...players].sort((left, right) => {
    const leftSlots = left.player.eligibleSlots.length;
    const rightSlots = right.player.eligibleSlots.length;
    return leftSlots - rightSlots || left.player.name.localeCompare(right.player.name);
  });
  const used = new Set<FootballGmRosterSlot>();
  const result: FootballGmRosterEntry[] = [];

  function place(index: number): boolean {
    if (index >= ordered.length) return true;
    const row = ordered[index]!;
    const slots = [...row.player.eligibleSlots].sort((a, b) => {
      if (a === row.preferredSlot) return -1;
      if (b === row.preferredSlot) return 1;
      return FOOTBALL_GM_ROSTER_SLOTS.indexOf(a) - FOOTBALL_GM_ROSTER_SLOTS.indexOf(b);
    });
    for (const slot of slots) {
      if (used.has(slot)) continue;
      used.add(slot);
      result.push({ slot, playerId: row.player.id, acquired: row.acquired });
      if (place(index + 1)) return true;
      result.pop();
      used.delete(slot);
    }
    return false;
  }

  return place(0) ? result : null;
}

function normalizeProposal(proposal: FootballGmTradeProposal) {
  return {
    outgoingPlayerIds: [...new Set(proposal.outgoingPlayerIds)],
    incomingPlayerIds: [...new Set(proposal.incomingPlayerIds)],
  };
}

export function footballGmTradePartnerPlayers(
  partnerTeam: string,
  roster: readonly FootballGmRosterEntry[],
  tradeChipPlayerIds: readonly string[] = [],
) {
  const used = new Set([...rosterPlayerIds(roster), ...tradeChipPlayerIds]);
  return FOOTBALL_GM_PLAYER_POOL
    .filter((player) => player.team === partnerTeam && !used.has(player.id))
    .sort((left, right) => (
      right.currentGrade - left.currentGrade
      || left.salaryWindow[1] - right.salaryWindow[1]
      || left.name.localeCompare(right.name)
    ));
}

export function footballGmEligibleTradeTeams(anchorPlayerId: string) {
  const anchor = footballGmPlayerById(anchorPlayerId);
  if (!anchor) return [];
  return FOOTBALL_GM_TEAMS.filter((team) => team !== anchor.team);
}

export function footballGmSpinTradePartner(
  seed: string,
  spinIndex: number,
  anchorPlayerId: string,
) {
  const teams = footballGmEligibleTradeTeams(anchorPlayerId);
  return footballGmSpinTeam(seed, 500 + spinIndex, teams);
}

export function footballGmResolveTradeRoster(input: {
  roster: readonly FootballGmRosterEntry[];
  proposal: FootballGmTradeProposal;
  cutPlayerIds?: readonly string[];
}) {
  const proposal = normalizeProposal(input.proposal);
  const outgoing = new Set(proposal.outgoingPlayerIds);
  const cuts = new Set(input.cutPlayerIds ?? []);
  const retained = input.roster
    .filter((entry) => !outgoing.has(entry.playerId) && !cuts.has(entry.playerId))
    .flatMap((entry) => {
      const player = footballGmPlayerById(entry.playerId);
      return player ? [{ player, acquired: entry.acquired, preferredSlot: entry.slot }] : [];
    });
  const incoming = proposal.incomingPlayerIds
    .filter((playerId) => !cuts.has(playerId))
    .flatMap((playerId) => {
      const player = footballGmPlayerById(playerId);
      return player ? [{ player, acquired: "trade" as const }] : [];
    });
  const players = [...retained, ...incoming];
  if (players.length > FOOTBALL_GM_ROSTER_SLOTS.length) return null;
  return assignRoster(players);
}

function cutCombinations(ids: readonly string[], count: number): string[][] {
  if (count === 0) return [[]];
  if (count > ids.length) return [];
  const result: string[][] = [];
  function visit(start: number, picked: string[]) {
    if (picked.length === count) {
      result.push([...picked]);
      return;
    }
    for (let index = start; index < ids.length; index += 1) {
      picked.push(ids[index]!);
      visit(index + 1, picked);
      picked.pop();
    }
  }
  visit(0, []);
  return result;
}

export function footballGmTradeHasLegalResolution(input: {
  roster: readonly FootballGmRosterEntry[];
  proposal: FootballGmTradeProposal;
  requiredCuts: number;
  postTradePlayerIds: readonly string[];
}) {
  return cutCombinations(input.postTradePlayerIds, input.requiredCuts).some((cutPlayerIds) => (
    footballGmResolveTradeRoster({
      roster: input.roster,
      proposal: input.proposal,
      cutPlayerIds,
    }) !== null
  ));
}

export function footballGmEvaluateTradeProposal(input: {
  seed: string;
  partnerTeam: string;
  roster: readonly FootballGmRosterEntry[];
  tradeChipPlayerIds?: readonly string[];
  proposal: FootballGmTradeProposal;
  priority: 1 | 2;
}) : FootballGmTradeEvaluation {
  const proposal = normalizeProposal(input.proposal);
  const invalidResult = (): FootballGmTradeEvaluation => ({
    accepted: false,
    reason: "invalid",
    partnerReceivesValue: 0,
    partnerSendsValue: 0,
    threshold: 1,
    postTradePlayerIds: [],
    requiresCuts: 0,
    nextRoster: null,
  });
  if (
    proposal.outgoingPlayerIds.length < 1
    || proposal.incomingPlayerIds.length < 1
    || proposal.outgoingPlayerIds.length > FOOTBALL_GM_MAX_TRADE_PLAYERS
    || proposal.incomingPlayerIds.length > FOOTBALL_GM_MAX_TRADE_PLAYERS
  ) return invalidResult();

  const rosterById = new Map(input.roster.map((entry) => [entry.playerId, entry]));
  const tradeChipIds = new Set(input.tradeChipPlayerIds ?? []);
  const ownedIds = new Set([...rosterById.keys(), ...tradeChipIds]);
  const outgoing = proposal.outgoingPlayerIds.map((id) => footballGmPlayerById(id));
  const incoming = proposal.incomingPlayerIds.map((id) => footballGmPlayerById(id));
  if (
    outgoing.some((player) => !player || !ownedIds.has(player.id))
    || incoming.some((player) => !player || player.team !== input.partnerTeam || ownedIds.has(player.id))
  ) return invalidResult();

  const outgoingPlayers = outgoing as FootballGmPlayer[];
  const incomingPlayers = incoming as FootballGmPlayer[];
  const postTradePlayerIds = [
    ...input.roster.filter((entry) => !proposal.outgoingPlayerIds.includes(entry.playerId)).map((entry) => entry.playerId),
    ...proposal.incomingPlayerIds,
  ];
  const requiresCuts = Math.max(0, postTradePlayerIds.length - FOOTBALL_GM_ROSTER_SLOTS.length);
  const nextRoster = requiresCuts === 0
    ? footballGmResolveTradeRoster({ roster: input.roster, proposal })
    : null;
  const hasLegalResolution = requiresCuts === 0
    ? nextRoster !== null
    : footballGmTradeHasLegalResolution({
        roster: input.roster,
        proposal,
        requiredCuts: requiresCuts,
        postTradePlayerIds,
      });
  if (!hasLegalResolution) {
    return {
      accepted: false,
      reason: "roster",
      partnerReceivesValue: 0,
      partnerSendsValue: 0,
      threshold: 1,
      postTradePlayerIds,
      requiresCuts,
      nextRoster: null,
    };
  }

  const partnerReceivesValue = outgoingPlayers.reduce(
    (sum, player) => sum + footballGmTradeAssetValue(player, input.partnerTeam),
    0,
  );
  const partnerSendsValue = incomingPlayers.reduce(
    (sum, player) => sum + footballGmTradeAssetValue(player, input.partnerTeam),
    0,
  );
  const packageKey = [
    ...proposal.outgoingPlayerIds.slice().sort(),
    "for",
    ...proposal.incomingPlayerIds.slice().sort(),
  ].join(":");
  const threshold = 1 + ((hashString(`${input.seed}:trade-threshold:${input.partnerTeam}:${packageKey}`) % 6) * 0.005);
  const accepted = partnerReceivesValue >= partnerSendsValue * threshold;
  return {
    accepted,
    reason: accepted ? "accepted" : "value",
    partnerReceivesValue,
    partnerSendsValue,
    threshold,
    postTradePlayerIds,
    requiresCuts,
    nextRoster,
  };
}

function footballGmTradeOfferShape(proposal: FootballGmTradeProposal): FootballGmTargetTradeOffer["shape"] {
  return `${proposal.outgoingPlayerIds.length}-for-${proposal.incomingPlayerIds.length}` as FootballGmTargetTradeOffer["shape"];
}

function footballGmTradeOfferKey(proposal: FootballGmTradeProposal) {
  return [
    ...proposal.outgoingPlayerIds.slice().sort(),
    "for",
    ...proposal.incomingPlayerIds.slice().sort(),
  ].join(":");
}

export function footballGmTradeAcceptanceMargin(offer: FootballGmTargetTradeOffer) {
  const required = Math.max(0.0001, offer.evaluation.partnerSendsValue * offer.evaluation.threshold);
  return (offer.evaluation.partnerReceivesValue / required) - 1;
}

export function footballGmTradeOfferDominates(
  left: FootballGmTargetTradeOffer,
  right: FootballGmTargetTradeOffer,
) {
  const leftOutgoing = new Set(left.proposal.outgoingPlayerIds);
  const leftIncoming = new Set(left.proposal.incomingPlayerIds);
  const rightOutgoing = new Set(right.proposal.outgoingPlayerIds);
  const sendsNoMore = [...leftOutgoing].every((playerId) => rightOutgoing.has(playerId));
  const getsNoLess = right.proposal.incomingPlayerIds.every((playerId) => leftIncoming.has(playerId));
  const noMoreCuts = left.evaluation.requiresCuts <= right.evaluation.requiresCuts;
  const strictlyBetter = leftOutgoing.size < right.proposal.outgoingPlayerIds.length
    || leftIncoming.size > right.proposal.incomingPlayerIds.length
    || left.evaluation.requiresCuts < right.evaluation.requiresCuts;
  return sendsNoMore && getsNoLess && noMoreCuts && strictlyBetter;
}

export function footballGmCurateAcceptedTargetTradeOffers(input: {
  seed: string;
  partnerTeam: string;
  targetPlayerId: string;
  accepted: readonly FootballGmTargetTradeOffer[];
  maxOffers?: number;
}) {
  const accepted = input.accepted.filter((offer) => offer.evaluation.accepted);
  if (!accepted.length) return [];

  const undominated = accepted.filter((candidate, index) => (
    !accepted.some((other, otherIndex) => (
      otherIndex !== index && footballGmTradeOfferDominates(other, candidate)
    ))
  ));
  const deterministicTieBreak = (offer: FootballGmTargetTradeOffer) => (
    hashString(`${input.seed}:target-offer:${input.partnerTeam}:${input.targetPlayerId}:${footballGmTradeOfferKey(offer.proposal)}`) % 1_000_000
  );
  const compareOffers = (left: FootballGmTargetTradeOffer, right: FootballGmTargetTradeOffer) => (
    footballGmTradeAcceptanceMargin(left) - footballGmTradeAcceptanceMargin(right)
    || left.evaluation.requiresCuts - right.evaluation.requiresCuts
    || deterministicTieBreak(left) - deterministicTieBreak(right)
  );

  const shapeOrder: FootballGmTargetTradeOffer["shape"][] = ["1-for-1", "2-for-1", "1-for-2", "2-for-2"];
  const buckets = new Map(shapeOrder.map((shape) => [
    shape,
    undominated.filter((offer) => offer.shape === shape).sort(compareOffers),
  ] as const));
  const selected: FootballGmTargetTradeOffer[] = [];
  const maxOffers = Math.max(1, Math.min(5, input.maxOffers ?? 5));

  for (const shape of shapeOrder) {
    const best = buckets.get(shape)?.[0];
    if (best && selected.length < maxOffers) selected.push(best);
  }

  if (selected.length < maxOffers) {
    const chosen = new Set(selected.map((offer) => footballGmTradeOfferKey(offer.proposal)));
    for (const offer of [...undominated].sort(compareOffers)) {
      if (chosen.has(footballGmTradeOfferKey(offer.proposal))) continue;
      selected.push(offer);
      chosen.add(footballGmTradeOfferKey(offer.proposal));
      if (selected.length >= maxOffers) break;
    }
  }

  return selected.sort(compareOffers);
}

export function footballGmAcceptedTargetTradeOffers(input: {
  seed: string;
  partnerTeam: string;
  roster: readonly FootballGmRosterEntry[];
  tradeChipPlayerIds?: readonly string[];
  anchorPlayerId: string;
  targetPlayerId: string;
  shoppedPlayerIds?: readonly string[];
  maxOffers?: number;
}): FootballGmTargetTradeOffer[] {
  const anchor = footballGmPlayerById(input.anchorPlayerId);
  const target = footballGmPlayerById(input.targetPlayerId);
  const tradeChipIds = new Set(input.tradeChipPlayerIds ?? []);
  const rosterIds = rosterPlayerIds(input.roster);
  const ownedIds = new Set([...rosterIds, ...tradeChipIds]);
  if (
    !anchor
    || !target
    || !ownedIds.has(anchor.id)
    || target.team !== input.partnerTeam
    || ownedIds.has(target.id)
  ) return [];

  const anchorId = anchor.id;
  const targetId = target.id;
  const blockedOutgoing = new Set(input.shoppedPlayerIds ?? []);
  blockedOutgoing.delete(anchorId);
  const secondaryOutgoing = [...new Set([
    ...input.roster.map((entry) => entry.playerId),
    ...tradeChipIds,
  ])].filter((playerId) => playerId !== anchorId && !blockedOutgoing.has(playerId));
  const secondaryIncoming = footballGmTradePartnerPlayers(
    input.partnerTeam,
    input.roster,
    input.tradeChipPlayerIds,
  )
    .map((player) => player.id)
    .filter((playerId) => playerId !== targetId);

  const proposals: FootballGmTradeProposal[] = [
    { outgoingPlayerIds: [anchorId], incomingPlayerIds: [targetId] },
    ...secondaryOutgoing.map((playerId) => ({
      outgoingPlayerIds: [anchorId, playerId],
      incomingPlayerIds: [targetId],
    })),
    ...secondaryIncoming.map((playerId) => ({
      outgoingPlayerIds: [anchorId],
      incomingPlayerIds: [targetId, playerId],
    })),
    ...secondaryOutgoing.flatMap((outgoingPlayerId) => (
      secondaryIncoming.map((incomingPlayerId) => ({
        outgoingPlayerIds: [anchorId, outgoingPlayerId],
        incomingPlayerIds: [targetId, incomingPlayerId],
      }))
    )),
  ];

  const accepted = proposals.flatMap((proposal) => {
    const evaluation = footballGmEvaluateTradeProposal({
      seed: input.seed,
      partnerTeam: input.partnerTeam,
      roster: input.roster,
      tradeChipPlayerIds: input.tradeChipPlayerIds,
      proposal,
      priority: 1,
    });
    if (!evaluation.accepted) return [];
    if (evaluation.requiresCuts > 0) {
      const legalTargetPreservingCut = cutCombinations(
        evaluation.postTradePlayerIds.filter((playerId) => playerId !== target.id),
        evaluation.requiresCuts,
      ).some((cutPlayerIds) => (
        footballGmResolveTradeRoster({
          roster: input.roster,
          proposal,
          cutPlayerIds,
        }) !== null
      ));
      if (!legalTargetPreservingCut) return [];
    }
    return [{
      proposal,
      evaluation,
      shape: footballGmTradeOfferShape(proposal),
    }];
  });

  if (!accepted.length) return [];

  return footballGmCurateAcceptedTargetTradeOffers({
    seed: input.seed,
    partnerTeam: input.partnerTeam,
    targetPlayerId: input.targetPlayerId,
    accepted,
    maxOffers: input.maxOffers,
  });
}

export function footballGmFinalResultV2(input: {
  seed: string;
  yearOneRoster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
}) : FootballGmFinalResultV2 {
  const seasons = [
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.yearOneRoster, year: 1 }),
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 2 }),
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 3 }),
  ] as const;
  const coreScore = seasons.reduce((sum, season) => sum + season.teamGrade, 0) / seasons.length;
  const postseasonBonus = seasons.reduce((sum, season) => sum + season.postseasonBonus, 0) / seasons.length;
  const score = Math.round((coreScore + postseasonBonus) * 10) / 10;
  return {
    score,
    coreScore: Math.round(coreScore * 10) / 10,
    postseasonBonus: Math.round(postseasonBonus * 10) / 10,
    seasons,
    continuity: {
      year2: footballGmContinuity(input.yearOneRoster, input.finalRoster, 2),
      year3: footballGmContinuity(input.yearOneRoster, input.finalRoster, 3),
    },
    roster: input.finalRoster.map((entry) => {
      const player = footballGmPlayerById(entry.playerId);
      return {
        slot: entry.slot,
        playerId: entry.playerId,
        name: player?.name ?? entry.playerId,
        team: player?.team ?? "",
      };
    }),
  };
}
