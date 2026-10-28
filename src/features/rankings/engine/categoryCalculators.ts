import {
  apexInputSchema,
  championshipInputSchema,
  eraDepthInputSchema,
  longevityInputSchema,
  lossContextInputSchema,
  opponentQualityInputSchema,
  primeDominanceInputSchema,
  type CanonicalFight,
  type FighterEraWindow,
} from "./schemas";
import { clamp, round1, round2, round6 } from "./math";

export const CATEGORY_MAX = 30;
export const LONGEVITY_FULL_CREDIT_MONTHS = 144;
export const LONGEVITY_GAP_CAP_MONTHS = 18;

const DAYS_PER_MONTH = 365.25 / 12;
const ELITE_TIERS = new Set(["champion-level", "top-five"]);
const FINISH_METHODS = new Set(["ko-tko", "submission", "doctor-stoppage"]);
const SCORED_DISPOSITIONS = new Set(["count-win", "count-loss", "count-draw"]);
const OPPONENT_QUALITY_RETURNS = [
  [1, 6, 1],
  [7, 12, 0.75],
  [13, 18, 0.5],
  [19, Number.POSITIVE_INFINITY, 0.25],
] as const;
const PRIME_COMPONENT_MAX = {
  primeRecord: 9,
  roundControl: 9,
  finishPressure: 5,
  eliteLevelValidation: 7,
} as const;
const ELITE_VALIDATION_MAX = {
  volume: 3,
  performance: 4,
  result: 2,
  roundControl: 1.5,
  finishPressure: 0.5,
} as const;
const ELITE_VOLUME_FULL_SAMPLE = 8;
const PRIME_SAMPLE_MIN = 0.7;
const PRIME_SAMPLE_STEP = 0.05;
const ELITE_DENSITY_MIN_SAMPLES = 4;
const ELITE_DENSITY_SAMPLE_FLOOR = 0.9;
const FINISH_SCALE = [
  { min: 0.9, score: 5 },
  { min: 0.75, score: 4.5 },
  { min: 0.6, score: 4 },
  { min: 0.45, score: 3 },
  { min: 0.3, score: 2 },
  { min: 0.15, score: 1 },
  { min: 0, score: 0.5 },
] as const;

export const LOSS_RULES = Object.freeze({
  prePrimeElite: -0.75,
  prePrimeNonElite: -1.25,
  primeElite: -1.5,
  primeNonElite: -4,
  finishedExtra: -0.75,
  postPrime: 0,
  primeUpwardElite: -0.75,
  finishedUpwardEliteExtra: -0.5,
  severityLossCount: 2,
  severityMax: 3.5,
  frequencyMax: 2.5,
  frequencyScale: 3,
  primeLossFloorPerLoss: 0.75,
  primeFinishFloorExtra: 0.25,
  primeVolumeFloorMax: 5.25,
  totalMax: 6,
  divisionDiscountScale: 1.5,
  divisionDiscountMax: 0.15,
  divisionDiscountFloor: 1,
});

function opponentQualityRate(slot: number) {
  return OPPONENT_QUALITY_RETURNS.find(([from, to]) => slot >= from && slot <= to)?.[2] ?? 0.25;
}

export function calculateChampionship(rawInput: unknown) {
  const input = championshipInputSchema.parse(rawInput);
  const adjustedTitleCredit = input.inputs.reduce(
    (sum, row) => sum + Number(row.finalAdjustedCredit || 0),
    0,
  );
  const score = round2(
    clamp((adjustedTitleCredit / input.benchmarkCredit) * CATEGORY_MAX, 0, CATEGORY_MAX),
  );

  return {
    fighter: input.fighter,
    score,
    adjustedTitleCredit: round6(adjustedTitleCredit),
    benchmarkCredit: input.benchmarkCredit,
    inputs: input.inputs,
  };
}

export function calculateOpponentQuality(rawInput: unknown) {
  const input = opponentQualityInputSchema.parse(rawInput);
  const rows = input.inputs
    .slice()
    .sort(
      (left, right) =>
        Number(right.finalCredit || 0) - Number(left.finalCredit || 0) ||
        String(left.date || "").localeCompare(String(right.date || "")) ||
        left.opponent.localeCompare(right.opponent),
    )
    .map((row, index) => {
      const slot = index + 1;
      const countedRate = opponentQualityRate(slot);
      return {
        ...row,
        slot,
        countedRate: round6(countedRate),
        countedCredit: round6(Number(row.finalCredit || 0) * countedRate),
      };
    });
  const rawCredit = rows.reduce((sum, row) => sum + Number(row.finalCredit || 0), 0);
  const preAdjustmentDiminishedCredit = rows.reduce(
    (sum, row) => sum + Number(row.countedCredit || 0),
    0,
  );
  const fighterAdjustment = Number(input.fighterAdjustment || 0);
  const diminishedCredit = Math.max(0, preAdjustmentDiminishedCredit + fighterAdjustment);
  const score = round2(
    clamp((diminishedCredit / input.benchmarkCredit) * CATEGORY_MAX, 0, CATEGORY_MAX),
  );

  return {
    fighter: input.fighter,
    score,
    rawCredit: round6(rawCredit),
    preAdjustmentDiminishedCredit: round6(preAdjustmentDiminishedCredit),
    fighterAdjustment: round6(fighterAdjustment),
    diminishedCredit: round6(diminishedCredit),
    benchmarkCredit: input.benchmarkCredit,
    inputs: rows,
  };
}

export function calculateApex(rawInput: unknown) {
  const input = apexInputSchema.parse(rawInput);
  const ratingsAverage =
    input.performances.reduce((sum, performance) => sum + performance.rating, 0) / 2;
  const formulaTwoPerformanceStrength = round2((ratingsAverage / 10) * 2);
  const score = round2(
    clamp(
      input.components.twoPerformanceStrength +
        input.components.proof +
        input.components.bestFighterClaim +
        input.components.aura,
      0,
      6,
    ),
  );

  return {
    fighter: input.fighter,
    score,
    performances: input.performances,
    components: input.components,
    ratingsAverage: round2(ratingsAverage),
    formulaTwoPerformanceStrength,
    twoPerformanceDifference: round2(
      input.components.twoPerformanceStrength - formulaTwoPerformanceStrength,
    ),
    notes: input.notes ?? null,
  };
}

function findWindowBounds(
  fights: readonly CanonicalFight[],
  window: FighterEraWindow,
  asOfDate?: string,
) {
  const start = fights.findIndex((fight) => fight.date === window.start);
  let end = -1;

  if (window.end) {
    end = fights.findIndex((fight) => fight.date === window.end);
  } else if (asOfDate) {
    for (let index = fights.length - 1; index >= 0; index -= 1) {
      if (fights[index].date <= asOfDate) {
        end = index;
        break;
      }
    }
  } else {
    end = fights.length - 1;
  }

  if (start < 0 || end < start) {
    throw new Error(`Invalid era window ${window.start} through ${window.end ?? "open"}.`);
  }

  return { start, end };
}

function finishPressureScore(rate: number) {
  const normalized = clamp(rate, 0, 1);
  return round2((FINISH_SCALE.find((row) => normalized >= row.min) ?? FINISH_SCALE.at(-1)!).score);
}

function primeSampleMultiplier(effectiveSampleCount: number) {
  if (effectiveSampleCount <= 0) return 0;
  return round2(
    clamp(
      PRIME_SAMPLE_MIN + (effectiveSampleCount - 1) * PRIME_SAMPLE_STEP,
      PRIME_SAMPLE_MIN,
      1,
    ),
  );
}

function opponentIsElite(fight: CanonicalFight) {
  return ELITE_TIERS.has(fight.qualityTier);
}

function isEliteStageFight(fight: CanonicalFight) {
  return fight.championshipType !== "none" || opponentIsElite(fight);
}

function isTournamentFight(fight: CanonicalFight) {
  return fight.championshipType === "tournament";
}

function densityEliteFight(fight: CanonicalFight) {
  return (
    (fight.championshipType !== "none" && fight.championshipType !== "tournament") ||
    opponentIsElite(fight)
  );
}

interface PrimeSample {
  date: string;
  type: "single-fight" | "tournament-event";
  tournament: boolean;
  fights: CanonicalFight[];
  densityElite?: boolean;
}

function effectivePrimeSamples(fights: readonly CanonicalFight[]) {
  const groups: Array<{ date: string; fights: CanonicalFight[] }> = [];
  const groupsByDate = new Map<string, { date: string; fights: CanonicalFight[] }>();

  fights.forEach((fight) => {
    let group = groupsByDate.get(fight.date);
    if (!group) {
      group = { date: fight.date, fights: [] };
      groupsByDate.set(fight.date, group);
      groups.push(group);
    }
    group.fights.push(fight);
  });

  const samples: PrimeSample[] = [];
  groups.forEach((group) => {
    if (group.fights.some(isTournamentFight)) {
      samples.push({
        date: group.date,
        type: "tournament-event",
        tournament: true,
        fights: group.fights,
      });
      return;
    }

    group.fights.forEach((fight) => {
      samples.push({
        date: fight.date,
        type: "single-fight",
        tournament: false,
        fights: [fight],
      });
    });
  });

  return samples;
}

function sampleProfile(fights: readonly CanonicalFight[]) {
  const samples = effectivePrimeSamples(fights).map((sample) => ({
    ...sample,
    densityElite: !sample.tournament && sample.fights.some(densityEliteFight),
  }));
  let currentEliteRun = 0;
  let longestEliteRun = 0;

  samples.forEach((sample) => {
    currentEliteRun = sample.densityElite ? currentEliteRun + 1 : 0;
    longestEliteRun = Math.max(longestEliteRun, currentEliteRun);
  });

  const baseMultiplier = primeSampleMultiplier(samples.length);
  const densityFloorEligible = longestEliteRun >= ELITE_DENSITY_MIN_SAMPLES;
  const multiplier = round2(
    densityFloorEligible
      ? Math.max(baseMultiplier, ELITE_DENSITY_SAMPLE_FLOOR)
      : baseMultiplier,
  );

  return {
    samples,
    effectiveSampleCount: samples.length,
    tournamentEventCount: samples.filter((sample) => sample.tournament).length,
    tournamentBoutCount: samples
      .filter((sample) => sample.tournament)
      .reduce((sum, sample) => sum + sample.fights.length, 0),
    compressedTournamentBoutCount: samples
      .filter((sample) => sample.tournament)
      .reduce((sum, sample) => sum + Math.max(0, sample.fights.length - 1), 0),
    longestConsecutiveEliteSamples: longestEliteRun,
    densityFloorEligible,
    densityFloorApplied: multiplier > baseMultiplier + 0.001,
    baseMultiplier,
    multiplier,
  };
}

function roundTotalsFor(fights: readonly CanonicalFight[]) {
  return fights.reduce(
    (totals, fight) => {
      if (fight.rounds.status !== "audited") {
        totals.missing.push({ fightId: fight.id, opponent: fight.opponent });
        return totals;
      }
      totals.won += fight.rounds.won;
      totals.lost += fight.rounds.lost;
      totals.drawn += fight.rounds.drawn;
      return totals;
    },
    {
      won: 0,
      lost: 0,
      drawn: 0,
      missing: [] as Array<{ fightId: string; opponent: string }>,
    },
  );
}

interface ValidationEntry {
  fight: CanonicalFight;
  credit: number;
  stage: string;
  sampleDate: string;
}

function weightedRoundTotals(entries: readonly ValidationEntry[]) {
  return entries.reduce(
    (totals, entry) => {
      if (entry.fight.rounds.status !== "audited") {
        totals.missing.push({ fightId: entry.fight.id, opponent: entry.fight.opponent });
        return totals;
      }
      totals.won += entry.fight.rounds.won * entry.credit;
      totals.lost += entry.fight.rounds.lost * entry.credit;
      totals.drawn += entry.fight.rounds.drawn * entry.credit;
      return totals;
    },
    {
      won: 0,
      lost: 0,
      drawn: 0,
      missing: [] as Array<{ fightId: string; opponent: string }>,
    },
  );
}

function roundControlRate(totals: { won: number; lost: number; drawn: number }) {
  const counted = totals.won + totals.lost + totals.drawn;
  return counted ? (totals.won + totals.drawn * 0.5) / counted : 0;
}

function tournamentValidationEntries(sample: PrimeSample): ValidationEntry[] {
  if (sample.fights.length < 2) {
    const fight = sample.fights[0];
    return fight && opponentIsElite(fight)
      ? [
          {
            fight,
            credit: 1,
            stage: "elite-single-tournament-bout",
            sampleDate: sample.date,
          },
        ]
      : [];
  }

  return [
    {
      fight: sample.fights.at(-1)!,
      credit: 1,
      stage: "tournament-final",
      sampleDate: sample.date,
    },
    {
      fight: sample.fights.at(-2)!,
      credit: 0.5,
      stage: "tournament-semifinal",
      sampleDate: sample.date,
    },
  ];
}

function eliteValidation(fights: readonly CanonicalFight[], profile: ReturnType<typeof sampleProfile>) {
  const entries: ValidationEntry[] = [];

  profile.samples.forEach((sample) => {
    if (sample.tournament) {
      entries.push(...tournamentValidationEntries(sample));
      return;
    }

    sample.fights.filter(isEliteStageFight).forEach((fight) => {
      entries.push({
        fight,
        credit: 1,
        stage: "standard-elite-stage",
        sampleDate: sample.date,
      });
    });
  });

  const volumeUnits = entries.reduce((sum, entry) => sum + entry.credit, 0);
  const weightedWins = entries
    .filter((entry) => entry.fight.scoringDisposition === "count-win")
    .reduce((sum, entry) => sum + entry.credit, 0);
  const weightedDraws = entries
    .filter((entry) => entry.fight.scoringDisposition === "count-draw")
    .reduce((sum, entry) => sum + entry.credit, 0);
  const resultRate = volumeUnits ? (weightedWins + weightedDraws * 0.5) / volumeUnits : 0;
  const rounds = weightedRoundTotals(entries);
  const roundRate = roundControlRate(rounds);
  const finishUnits = entries
    .filter(
      (entry) =>
        entry.fight.scoringDisposition === "count-win" &&
        FINISH_METHODS.has(entry.fight.methodCategory),
    )
    .reduce((sum, entry) => sum + entry.credit, 0);
  const finishRate = volumeUnits ? finishUnits / volumeUnits : 0;
  const volume = round2(
    clamp(
      (volumeUnits / ELITE_VOLUME_FULL_SAMPLE) * ELITE_VALIDATION_MAX.volume,
      0,
      ELITE_VALIDATION_MAX.volume,
    ),
  );
  const resultScore = round2(resultRate * ELITE_VALIDATION_MAX.result);
  const roundScore = round2(roundRate * ELITE_VALIDATION_MAX.roundControl);
  const finishScore = round2(finishRate * ELITE_VALIDATION_MAX.finishPressure);
  const performance = round2(
    clamp(
      resultScore + roundScore + finishScore,
      0,
      ELITE_VALIDATION_MAX.performance,
    ),
  );
  const score = round2(
    clamp(volume + performance, 0, PRIME_COMPONENT_MAX.eliteLevelValidation),
  );

  return {
    fightCount: entries.length,
    eventCount: new Set(entries.map((entry) => entry.sampleDate)).size,
    volumeUnits: round2(volumeUnits),
    wins: entries.filter((entry) => entry.fight.scoringDisposition === "count-win").length,
    losses: entries.filter((entry) => entry.fight.scoringDisposition === "count-loss").length,
    draws: entries.filter((entry) => entry.fight.scoringDisposition === "count-draw").length,
    weightedWins: round2(weightedWins),
    weightedDraws: round2(weightedDraws),
    resultRate: round2(resultRate * 100),
    roundsWon: round2(rounds.won),
    roundsLost: round2(rounds.lost),
    roundsDrawn: round2(rounds.drawn),
    roundControlRate: round2(roundRate * 100),
    finishUnits: round2(finishUnits),
    finishRate: round2(finishRate * 100),
    missingRoundRows: rounds.missing,
    volumeScore: volume,
    performanceScore: performance,
    performanceBreakdown: {
      result: resultScore,
      roundControl: roundScore,
      finishPressure: finishScore,
    },
    score,
    fights: entries.map((entry) => ({
      fightId: entry.fight.id,
      date: entry.fight.date,
      opponent: entry.fight.opponent,
      result: entry.fight.scoringDisposition,
      qualityTier: entry.fight.qualityTier,
      championshipType: entry.fight.championshipType,
      validationCredit: entry.credit,
      validationStage: entry.stage,
    })),
  };
}

export function calculatePrimeDominance(rawInput: unknown) {
  const input = primeDominanceInputSchema.parse(rawInput);
  const { start, end } = findWindowBounds(input.fights, input.window);
  const primeFights = input.fights.slice(start, end + 1);
  const scoredFights = primeFights.filter((fight) =>
    SCORED_DISPOSITIONS.has(fight.scoringDisposition),
  );
  const wins = scoredFights.filter((fight) => fight.scoringDisposition === "count-win");
  const losses = scoredFights.filter((fight) => fight.scoringDisposition === "count-loss");
  const draws = scoredFights.filter((fight) => fight.scoringDisposition === "count-draw");
  const scoredFightCount = scoredFights.length;
  const recordRate = scoredFightCount
    ? (wins.length + draws.length * 0.5) / scoredFightCount
    : 0;
  const roundTotals = roundTotalsFor(scoredFights);
  const roundControlRateValue = roundControlRate(roundTotals);
  const finishWins = wins.filter((fight) => FINISH_METHODS.has(fight.methodCategory)).length;
  const finishPressureRate = scoredFightCount ? finishWins / scoredFightCount : 0;
  const sample = sampleProfile(scoredFights);
  const elite = eliteValidation(scoredFights, sample);
  const components = {
    primeRecord: round2(recordRate * PRIME_COMPONENT_MAX.primeRecord),
    roundControl: round2(roundControlRateValue * PRIME_COMPONENT_MAX.roundControl),
    finishPressure: finishPressureScore(finishPressureRate),
    eliteLevelValidation: elite.score,
  };
  const rawScore = round2(
    clamp(
      Object.values(components).reduce((sum, value) => sum + value, 0),
      0,
      CATEGORY_MAX,
    ),
  );
  const score = round2(clamp(rawScore * sample.multiplier, 0, CATEGORY_MAX));

  return {
    fighter: input.fighter,
    score,
    stats: {
      eraStartDate: input.window.start,
      eraEndDate: input.window.end,
      open: !input.window.end,
      primeFightCount: primeFights.length,
      scoredFightCount,
      effectivePrimeSampleCount: sample.effectiveSampleCount,
      tournamentEventCount: sample.tournamentEventCount,
      tournamentBoutCount: sample.tournamentBoutCount,
      compressedTournamentBoutCount: sample.compressedTournamentBoutCount,
      wins: wins.length,
      losses: losses.length,
      draws: draws.length,
      noContests: primeFights.filter(
        (fight) => fight.scoringDisposition === "excluded-no-contest",
      ).length,
      technicalExceptions: primeFights.filter(
        (fight) => fight.scoringDisposition === "technical-exception",
      ).length,
      recordPct: round2(recordRate * 100),
      roundsWon: round2(roundTotals.won),
      roundsLost: round2(roundTotals.lost),
      roundsDrawn: round2(roundTotals.drawn),
      roundControlPct: round2(roundControlRateValue * 100),
      missingRoundRows: roundTotals.missing,
      finishWins,
      finishPressurePct: round2(finishPressureRate * 100),
      eliteLevelValidation: elite,
      components,
      rawScore,
      baseSampleMultiplier: sample.baseMultiplier,
      sampleMultiplier: sample.multiplier,
      samplePercent: round2(sample.multiplier * 100),
      longestConsecutiveEliteSamples: sample.longestConsecutiveEliteSamples,
      eliteDensityFloorApplied: sample.densityFloorApplied,
    },
  };
}

function intervalAudit(fights: readonly CanonicalFight[], open: boolean, asOfDate: string) {
  const intervals: Array<{
    type: "between-ufc-fights" | "open-window-tail";
    fromFightId: string;
    toFightId: string | null;
    fromDate: string;
    toDate: string;
    rawMonths: number;
    countedMonths: number;
    capped: boolean;
  }> = [];
  let countedDays = 0;
  let rawDays = 0;
  const capDays = LONGEVITY_GAP_CAP_MONTHS * DAYS_PER_MONTH;

  for (let index = 1; index < fights.length; index += 1) {
    const from = fights[index - 1];
    const to = fights[index];
    const days = Math.max(
      0,
      (Date.parse(`${to.date}T00:00:00Z`) - Date.parse(`${from.date}T00:00:00Z`)) /
        86_400_000,
    );
    const creditedDays = Math.min(days, capDays);
    rawDays += days;
    countedDays += creditedDays;
    intervals.push({
      type: "between-ufc-fights",
      fromFightId: from.id,
      toFightId: to.id,
      fromDate: from.date,
      toDate: to.date,
      rawMonths: round2(days / DAYS_PER_MONTH),
      countedMonths: round2(creditedDays / DAYS_PER_MONTH),
      capped: days > capDays + 0.0001,
    });
  }

  if (open && fights.length > 0) {
    const from = fights.at(-1)!;
    if (from.date < asOfDate) {
      const days = Math.max(
        0,
        (Date.parse(`${asOfDate}T00:00:00Z`) - Date.parse(`${from.date}T00:00:00Z`)) /
          86_400_000,
      );
      const creditedDays = Math.min(days, capDays);
      rawDays += days;
      countedDays += creditedDays;
      intervals.push({
        type: "open-window-tail",
        fromFightId: from.id,
        toFightId: null,
        fromDate: from.date,
        toDate: asOfDate,
        rawMonths: round2(days / DAYS_PER_MONTH),
        countedMonths: round2(creditedDays / DAYS_PER_MONTH),
        capped: days > capDays + 0.0001,
      });
    }
  }

  return {
    intervals,
    rawCalendarMonths: round1(rawDays / DAYS_PER_MONTH),
    gapAdjustedMonths: round1(countedDays / DAYS_PER_MONTH),
    cappedGapCount: intervals.filter((interval) => interval.capped).length,
    openTailMonths: round2(
      intervals
        .filter((interval) => interval.type === "open-window-tail")
        .reduce((sum, interval) => sum + interval.countedMonths, 0),
    ),
  };
}

export function calculateLongevity(rawInput: unknown) {
  const input = longevityInputSchema.parse(rawInput);
  const { start, end } = findWindowBounds(input.fights, input.window, input.modelAsOfDate);
  const windowFights = input.fights
    .slice(start, end + 1)
    .filter((fight) => fight.date <= input.modelAsOfDate);
  const open = !input.window.end;
  const time = intervalAudit(windowFights, open, input.modelAsOfDate);
  const countedEliteMonths = round2(
    time.gapAdjustedMonths * input.statusMultiplier * input.divisionMultiplier,
  );
  const score = round2(
    clamp(
      (countedEliteMonths / LONGEVITY_FULL_CREDIT_MONTHS) * CATEGORY_MAX,
      0,
      CATEGORY_MAX,
    ),
  );

  return {
    fighter: input.fighter,
    score,
    stats: {
      eraStartDate: input.window.start,
      eraEndDate: input.window.end,
      open,
      modelAsOfDate: input.modelAsOfDate,
      fightCount: windowFights.length,
      activityAnchorCount: windowFights.length,
      activityIncludesNoContestAnchors: true,
      gapCapMonths: LONGEVITY_GAP_CAP_MONTHS,
      rawCalendarMonths: time.rawCalendarMonths,
      gapAdjustedMonths: time.gapAdjustedMonths,
      activeEliteYears: round2(time.gapAdjustedMonths / 12),
      cappedGapCount: time.cappedGapCount,
      openTailMonths: time.openTailMonths,
      intervals: time.intervals,
      statusMultiplier: round2(input.statusMultiplier),
      divisionMultiplier: round2(input.divisionMultiplier),
      countedEliteMonths,
    },
  };
}

export type LossPhase = "pre-prime" | "prime" | "post-prime";

export interface RawLossPenaltyEvent {
  phase: LossPhase;
  elite: boolean;
  finished: boolean;
  upwardDivision: boolean;
  penaltyEligible: boolean;
}

export function calculateRawLossPenalty(event: RawLossPenaltyEvent) {
  if (!event.penaltyEligible || event.phase === "post-prime") {
    return { base: 0, finishExtra: 0, rawPenalty: 0 };
  }

  let base = 0;
  if (event.phase === "pre-prime") {
    base = event.elite ? LOSS_RULES.prePrimeElite : LOSS_RULES.prePrimeNonElite;
  } else if (event.upwardDivision && event.elite) {
    base = LOSS_RULES.primeUpwardElite;
  } else {
    base = event.elite ? LOSS_RULES.primeElite : LOSS_RULES.primeNonElite;
  }

  const finishExtra = event.finished
    ? event.phase === "prime" && event.upwardDivision && event.elite
      ? LOSS_RULES.finishedUpwardEliteExtra
      : LOSS_RULES.finishedExtra
    : 0;

  return {
    base: round2(base),
    finishExtra: round2(finishExtra),
    rawPenalty: round2(base + finishExtra),
  };
}

function lossPhase(window: FighterEraWindow, fight: CanonicalFight): LossPhase {
  if (fight.date < window.start) return "pre-prime";
  if (window.end && fight.date > window.end) return "post-prime";
  return "prime";
}

export function calculateLossContext(rawInput: unknown) {
  const input = lossContextInputSchema.parse(rawInput);
  const events = input.fights
    .filter(
      (fight) =>
        fight.officialResult === "loss" || fight.scoringDisposition === "technical-exception",
    )
    .map((fight) => {
      const classification = fight.lossClassification;
      const competitive = classification?.competitive !== false;
      const technicalException =
        fight.scoringDisposition === "technical-exception" || fight.methodCategory === "dq";
      const event = {
        fightId: fight.id,
        date: fight.date,
        opponent: fight.opponent,
        phase: lossPhase(input.window, fight),
        qualityTier: fight.qualityTier,
        elite: ELITE_TIERS.has(fight.qualityTier),
        finished: FINISH_METHODS.has(fight.methodCategory),
        upwardDivision: classification?.divisionContext === "upward",
        competitive,
        technicalException,
        penaltyEligible:
          fight.officialResult === "loss" && competitive && !technicalException,
        methodCategory: fight.methodCategory,
        divisionContext: classification?.divisionContext ?? "home",
        overrideRule: classification?.overrideRule ?? null,
      };

      return {
        ...event,
        ...calculateRawLossPenalty(event),
      };
    });
  const countedEvents = events.filter((event) => event.rawPenalty < 0);
  const worstEvents = countedEvents
    .slice()
    .sort(
      (left, right) =>
        Math.abs(right.rawPenalty) - Math.abs(left.rawPenalty) ||
        left.date.localeCompare(right.date),
    )
    .slice(0, LOSS_RULES.severityLossCount);
  const severityRaw = worstEvents.length
    ? worstEvents.reduce((sum, event) => sum + Math.abs(event.rawPenalty), 0) /
      worstEvents.length
    : 0;
  const severity = round2(Math.min(LOSS_RULES.severityMax, severityRaw));
  const rawLossBurden = round2(
    countedEvents.reduce((sum, event) => sum + Math.abs(event.rawPenalty), 0),
  );
  const open = !input.window.end;
  const exposure = input.fights.filter(
    (fight) =>
      fight.officialResult !== "no-contest" && (open || fight.date <= input.window.end!),
  ).length;
  const frequency = round2(
    Math.min(
      LOSS_RULES.frequencyMax,
      (rawLossBurden / Math.max(1, exposure)) * LOSS_RULES.frequencyScale,
    ),
  );
  const hybridBase = round2(severity + frequency);
  const primeLosses = countedEvents.filter((event) => event.phase === "prime");
  const primeFinishes = primeLosses.filter((event) => event.finished);
  const primeVolumeFloor = round2(
    Math.min(
      LOSS_RULES.primeVolumeFloorMax,
      primeLosses.length * LOSS_RULES.primeLossFloorPerLoss +
        primeFinishes.length * LOSS_RULES.primeFinishFloorExtra,
    ),
  );
  const preDivision = round2(
    Math.min(LOSS_RULES.totalMax, Math.max(hybridBase, primeVolumeFloor)),
  );
  const divisionDiscountPct = round2(
    clamp(
      (input.divisionMultiplier - LOSS_RULES.divisionDiscountFloor) *
        LOSS_RULES.divisionDiscountScale,
      0,
      LOSS_RULES.divisionDiscountMax,
    ),
  );
  const finalMagnitude = round2(preDivision * (1 - divisionDiscountPct));

  return {
    fighter: input.fighter,
    penalty: round2(-finalMagnitude),
    events,
    exposure,
    severity,
    frequency,
    primeVolumeFloor,
    preDivision,
    divisionMultiplier: round2(input.divisionMultiplier),
    divisionDiscountPct,
  };
}

export function calculateEraDepthCurve(depthIndex: number) {
  if (depthIndex >= 1) return round2(Math.min((depthIndex - 1) * 20, 0.75));
  return round2(Math.max(-3, -3 * Math.pow((1 - depthIndex) / 0.25, 1.5)));
}

export function calculateEraDepth(rawInput: unknown) {
  const input = eraDepthInputSchema.parse(rawInput);
  const recomputedAdjustment =
    input.depthIndex === null ? null : calculateEraDepthCurve(input.depthIndex);
  const adjustment = input.approvedAdjustment ?? recomputedAdjustment;

  if (adjustment === null) {
    throw new Error(`Era-depth input is incomplete for ${input.fighter}.`);
  }

  return {
    fighter: input.fighter,
    adjustment: round2(adjustment),
    depthIndex: input.depthIndex === null ? null : round2(input.depthIndex),
    recomputedAdjustment,
    resolutionApplied: input.approvedAdjustment !== null && input.approvedAdjustment !== undefined,
  };
}
