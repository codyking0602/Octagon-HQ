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

export const FOOTBALL_GM_VERSION = "football-gm-v2-playtest";

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
 * Retrospective seven-player-core calibration for the last five NFL final fours.
 * These are internal GM-model grades, not third-party published ratings. They anchor
 * the probability curve to the quality range recent real title contenders occupied.
 */
export const FOOTBALL_GM_HISTORICAL_FINAL_FOUR = [
  { season: 2021, team: "LAR", finish: "Champion", coreGrade: 95.4 },
  { season: 2021, team: "CIN", finish: "Super Bowl Loss", coreGrade: 90.8 },
  { season: 2021, team: "KC", finish: "Conference Championship", coreGrade: 94.2 },
  { season: 2021, team: "SF", finish: "Conference Championship", coreGrade: 92.4 },
  { season: 2022, team: "KC", finish: "Champion", coreGrade: 94.0 },
  { season: 2022, team: "PHI", finish: "Super Bowl Loss", coreGrade: 95.0 },
  { season: 2022, team: "CIN", finish: "Conference Championship", coreGrade: 92.1 },
  { season: 2022, team: "SF", finish: "Conference Championship", coreGrade: 93.0 },
  { season: 2023, team: "KC", finish: "Champion", coreGrade: 94.1 },
  { season: 2023, team: "SF", finish: "Super Bowl Loss", coreGrade: 94.4 },
  { season: 2023, team: "BAL", finish: "Conference Championship", coreGrade: 93.6 },
  { season: 2023, team: "DET", finish: "Conference Championship", coreGrade: 91.2 },
  { season: 2024, team: "PHI", finish: "Champion", coreGrade: 95.3 },
  { season: 2024, team: "KC", finish: "Super Bowl Loss", coreGrade: 93.1 },
  { season: 2024, team: "BUF", finish: "Conference Championship", coreGrade: 92.9 },
  { season: 2024, team: "WAS", finish: "Conference Championship", coreGrade: 89.4 },
  { season: 2025, team: "SEA", finish: "Champion", coreGrade: 93.4 },
  { season: 2025, team: "NE", finish: "Super Bowl Loss", coreGrade: 90.7 },
  { season: 2025, team: "DEN", finish: "Conference Championship", coreGrade: 90.9 },
  { season: 2025, team: "LAR", finish: "Conference Championship", coreGrade: 92.0 },
] as const;

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
  nextRoster: readonly FootballGmRosterEntry[] | null;
}

export type FootballGmNegotiationConsequences = Readonly<Record<string, number>>;

type OutcomeRow = Readonly<Record<FootballGmPlayoffFinish, number>> & { grade: number };

const OUTCOME_CURVE: readonly OutcomeRow[] = [
  { grade: 80, "Missed Playoffs": 0.62, "Wild Card": 0.22, Divisional: 0.10, "Conference Championship": 0.04, "Super Bowl Loss": 0.015, Champion: 0.005 },
  { grade: 84, "Missed Playoffs": 0.40, "Wild Card": 0.27, Divisional: 0.18, "Conference Championship": 0.09, "Super Bowl Loss": 0.04, Champion: 0.02 },
  { grade: 88, "Missed Playoffs": 0.20, "Wild Card": 0.23, Divisional: 0.23, "Conference Championship": 0.17, "Super Bowl Loss": 0.10, Champion: 0.07 },
  { grade: 90, "Missed Playoffs": 0.13, "Wild Card": 0.19, Divisional: 0.22, "Conference Championship": 0.20, "Super Bowl Loss": 0.14, Champion: 0.12 },
  { grade: 92, "Missed Playoffs": 0.08, "Wild Card": 0.14, Divisional: 0.20, "Conference Championship": 0.21, "Super Bowl Loss": 0.18, Champion: 0.19 },
  { grade: 94, "Missed Playoffs": 0.05, "Wild Card": 0.10, Divisional: 0.17, "Conference Championship": 0.20, "Super Bowl Loss": 0.21, Champion: 0.27 },
  { grade: 96, "Missed Playoffs": 0.03, "Wild Card": 0.07, Divisional: 0.13, "Conference Championship": 0.18, "Super Bowl Loss": 0.23, Champion: 0.36 },
  { grade: 98, "Missed Playoffs": 0.02, "Wild Card": 0.04, Divisional: 0.10, "Conference Championship": 0.16, "Super Bowl Loss": 0.24, Champion: 0.44 },
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

function deterministicFinish(seed: string, year: 1 | 2 | 3, teamGrade: number) {
  const probabilities = outcomeProbabilities(teamGrade);
  const roll = hashString(`${seed}:season:${year}`) / 0x1_0000_0000;
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
    outgoingPlayerIds: [...new Set(proposal.outgoingPlayerIds)].slice(0, 3),
    incomingPlayerIds: [...new Set(proposal.incomingPlayerIds)].slice(0, 3),
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

export function footballGmEvaluateTradeProposal(input: {
  seed: string;
  partnerTeam: string;
  roster: readonly FootballGmRosterEntry[];
  proposal: FootballGmTradeProposal;
  priority: 1 | 2;
}) : FootballGmTradeEvaluation {
  const proposal = normalizeProposal(input.proposal);
  if (
    proposal.outgoingPlayerIds.length < 1
    || proposal.incomingPlayerIds.length < 1
    || proposal.outgoingPlayerIds.length > 3
    || proposal.incomingPlayerIds.length > 3
  ) {
    return { accepted: false, reason: "invalid", partnerReceivesValue: 0, partnerSendsValue: 0, threshold: 1, nextRoster: null };
  }

  const rosterById = new Map(input.roster.map((entry) => [entry.playerId, entry]));
  const outgoing = proposal.outgoingPlayerIds.map((id) => footballGmPlayerById(id));
  const incoming = proposal.incomingPlayerIds.map((id) => footballGmPlayerById(id));
  if (
    outgoing.some((player) => !player || !rosterById.has(player.id))
    || incoming.some((player) => !player || player.team !== input.partnerTeam || rosterById.has(player.id))
  ) {
    return { accepted: false, reason: "invalid", partnerReceivesValue: 0, partnerSendsValue: 0, threshold: 1, nextRoster: null };
  }

  const outgoingPlayers = outgoing as FootballGmPlayer[];
  const incomingPlayers = incoming as FootballGmPlayer[];
  const retained = input.roster
    .filter((entry) => !proposal.outgoingPlayerIds.includes(entry.playerId))
    .flatMap((entry) => {
      const player = footballGmPlayerById(entry.playerId);
      return player ? [{ player, acquired: entry.acquired, preferredSlot: entry.slot }] : [];
    });
  const rosterPlayers = [
    ...retained,
    ...incomingPlayers.map((player) => ({ player, acquired: "trade" as const })),
  ];
  const nextRoster = assignRoster(rosterPlayers);
  if (!nextRoster) {
    return { accepted: false, reason: "roster", partnerReceivesValue: 0, partnerSendsValue: 0, threshold: 1, nextRoster: null };
  }

  const partnerReceivesValue = outgoingPlayers.reduce(
    (sum, player) => sum + footballGmTradeAssetValue(player, input.partnerTeam),
    0,
  );
  const partnerSendsValue = incomingPlayers.reduce(
    (sum, player) => sum + footballGmTradeAssetValue(player, input.partnerTeam),
    0,
  );
  const threshold = 1.02 + ((hashString(`${input.seed}:trade-threshold:${input.partnerTeam}:${input.priority}`) % 7) / 100);
  const accepted = partnerReceivesValue >= partnerSendsValue * threshold;
  return {
    accepted,
    reason: accepted ? "accepted" : "value",
    partnerReceivesValue,
    partnerSendsValue,
    threshold,
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
