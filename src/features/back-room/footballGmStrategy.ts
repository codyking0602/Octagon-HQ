import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  FOOTBALL_GM_TEAMS,
  footballGmPlayerById,
  footballGmProjectedGradeForPlayer,
  footballGmSpinTeam,
  type FootballGmPlayer,
  type FootballGmPlayoffFinish,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
} from "./footballGmEngine";
import historicalFinalFour from "../../../data/generated/football/gm-historical-final-four-2021-2025.json";

export const FOOTBALL_GM_VERSION = "football-gm-v3-playtest";
export const FOOTBALL_GM_MAX_TRADE_PLAYERS = 3;

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

export type FootballGmNegotiationConsequences = Readonly<Record<string, number>>;

type OutcomeRow = Readonly<Record<FootballGmPlayoffFinish, number>> & { grade: number };

const OUTCOME_CURVE: readonly OutcomeRow[] = [
  { grade: 80, "Missed Playoffs": 0.65, "Wild Card": 0.22, Divisional: 0.08, "Conference Championship": 0.035, "Super Bowl Loss": 0.012, Champion: 0.003 },
  { grade: 84, "Missed Playoffs": 0.46, "Wild Card": 0.27, Divisional: 0.15, "Conference Championship": 0.075, "Super Bowl Loss": 0.03, Champion: 0.015 },
  { grade: 88, "Missed Playoffs": 0.28, "Wild Card": 0.25, Divisional: 0.21, "Conference Championship": 0.13, "Super Bowl Loss": 0.07, Champion: 0.06 },
  { grade: 90, "Missed Playoffs": 0.20, "Wild Card": 0.22, Divisional: 0.21, "Conference Championship": 0.17, "Super Bowl Loss": 0.11, Champion: 0.09 },
  { grade: 92, "Missed Playoffs": 0.13, "Wild Card": 0.18, Divisional: 0.20, "Conference Championship": 0.20, "Super Bowl Loss": 0.15, Champion: 0.14 },
  { grade: 94, "Missed Playoffs": 0.08, "Wild Card": 0.13, Divisional: 0.18, "Conference Championship": 0.20, "Super Bowl Loss": 0.19, Champion: 0.22 },
  { grade: 95.1, "Missed Playoffs": 0.06, "Wild Card": 0.10, Divisional: 0.16, "Conference Championship": 0.19, "Super Bowl Loss": 0.23, Champion: 0.26 },
  { grade: 96, "Missed Playoffs": 0.05, "Wild Card": 0.09, Divisional: 0.15, "Conference Championship": 0.18, "Super Bowl Loss": 0.23, Champion: 0.30 },
  { grade: 98, "Missed Playoffs": 0.03, "Wild Card": 0.05, Divisional: 0.11, "Conference Championship": 0.15, "Super Bowl Loss": 0.24, Champion: 0.42 },
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
  const lowest = grades[0] ?? 82;
  const second = grades[1] ?? 80;
  const penalty = Math.max(0, 82 - lowest) * 0.16 + Math.max(0, 80 - second) * 0.08;
  return Math.round(Math.min(1.5, penalty) * 10) / 10;
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

export function footballGmIsOffseasonCompliantV2(
  roster: readonly FootballGmRosterEntry[],
  seed: string,
  consequences: FootballGmNegotiationConsequences,
) {
  return roster.length === FOOTBALL_GM_ROSTER_SLOTS.length
    && footballGmAdjustedRosterCap(roster, 2, seed, consequences) <= FOOTBALL_GM_CAP
    && footballGmAdjustedRosterCap(roster, 3, seed, consequences) <= FOOTBALL_GM_CAP;
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
) {
  const used = rosterPlayerIds(roster);
  return FOOTBALL_GM_PLAYER_POOL
    .filter((player) => player.team === partnerTeam && !used.has(player.id))
    .sort((left, right) => (
      right.currentGrade - left.currentGrade
      || left.salaryWindow[1] - right.salaryWindow[1]
      || left.name.localeCompare(right.name)
    ));
}

export function footballGmEligibleTradeTeams(
  anchorPlayerId: string,
  previousPartnerTeam?: string | null,
) {
  const anchor = footballGmPlayerById(anchorPlayerId);
  if (!anchor) return [];
  const teams = FOOTBALL_GM_TEAMS.filter((team) => team !== anchor.team);
  if (previousPartnerTeam && teams.length > 1) {
    const withoutRepeat = teams.filter((team) => team !== previousPartnerTeam);
    if (withoutRepeat.length) return withoutRepeat;
  }
  return teams;
}

export function footballGmSpinTradePartner(
  seed: string,
  spinIndex: number,
  anchorPlayerId: string,
  previousPartnerTeam?: string | null,
) {
  const teams = footballGmEligibleTradeTeams(anchorPlayerId, previousPartnerTeam);
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
  const outgoing = proposal.outgoingPlayerIds.map((id) => footballGmPlayerById(id));
  const incoming = proposal.incomingPlayerIds.map((id) => footballGmPlayerById(id));
  if (
    outgoing.some((player) => !player || !rosterById.has(player.id))
    || incoming.some((player) => !player || player.team !== input.partnerTeam || rosterById.has(player.id))
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
  const threshold = 1.02 + ((hashString(`${input.seed}:trade-threshold:${input.partnerTeam}:${packageKey}`) % 7) / 100);
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
