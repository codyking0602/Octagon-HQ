import profileAuthority from "../../../data/curated/football/gm-nfl-development-profiles-2026-10-07.json";
import type { FootballGmActualRole } from "./footballGmPositionalValue";

export const WHEEL_FOOTBALL_GM_CAP = 150_000_000;

export type FootballGmDevelopmentProfile = (typeof profileAuthority.profiles)[number];
const developmentProfiles = new Map(profileAuthority.profiles.map((profile) => [profile.id, profile]));
export const FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT = profileAuthority.profileCount;

/** Identity-bound authored calibration; synthetic grade tests retain the old fallback. */
export function footballGmDevelopmentProfile(playerId: string): FootballGmDevelopmentProfile | null {
  return developmentProfiles.get(playerId) ?? null;
}

export const WHEEL_FOOTBALL_GM_ROSTER_SLOTS = [
  "QB",
  "RB",
  "WR",
  "FLEX",
  "DL",
  "LB",
  "DB",
] as const;

export type WheelFootballGmRosterSlot = (typeof WHEEL_FOOTBALL_GM_ROSTER_SLOTS)[number];
export type WheelFootballGmMarketPosition = WheelFootballGmRosterSlot;
export type WheelFootballGmContractTerm = "1YR" | "3YR";

export type WheelFootballGmContractRow = {
  team: string;
  family: "QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary";
  player: string;
  normalizedName: string;
  position: string;
  gmEligibleSlots: readonly WheelFootballGmRosterSlot[];
  age: number;
  salaryApy: number;
  realContractEndSeason: number;
  gameContract: WheelFootballGmContractTerm;
  draftYear: number | null;
  draftRound: number | null;
  draftOverall: number | null;
  projectionAdjustment?: number;
};

type MarketPoint = readonly [grade: number, apy: number];

const MARKET_CURVES: Readonly<Record<WheelFootballGmMarketPosition | Exclude<FootballGmActualRole, "TE">, readonly MarketPoint[]>> = {
  QB: [
    [75, 5_000_000],
    [80, 15_000_000],
    [84, 28_000_000],
    [88, 42_000_000],
    [92, 55_000_000],
    [96, 63_000_000],
    [99, 68_000_000],
  ],
  RB: [
    [75, 2_500_000],
    [80, 4_000_000],
    [84, 7_000_000],
    [88, 11_000_000],
    [92, 15_000_000],
    [96, 19_000_000],
    [99, 22_500_000],
  ],
  WR: [
    [75, 3_000_000],
    [80, 7_000_000],
    [84, 14_000_000],
    [88, 22_000_000],
    [92, 30_000_000],
    [96, 37_000_000],
    [99, 42_000_000],
  ],
  FLEX: [
    [75, 2_500_000],
    [80, 5_000_000],
    [84, 8_000_000],
    [88, 12_000_000],
    [92, 16_000_000],
    [96, 20_000_000],
    [99, 23_000_000],
  ],
  DL: [
    [75, 3_000_000],
    [80, 7_000_000],
    [84, 13_000_000],
    [88, 21_000_000],
    [92, 30_000_000],
    [96, 40_000_000],
    [99, 50_000_000],
  ],
  EDGE: [
    [75, 3_000_000],
    [80, 7_000_000],
    [84, 13_000_000],
    [88, 21_000_000],
    [92, 30_000_000],
    [96, 40_000_000],
    [99, 50_000_000],
  ],
  IDL: [
    [75, 3_000_000],
    [80, 6_000_000],
    [84, 11_000_000],
    [88, 18_000_000],
    [92, 25_000_000],
    [96, 33_000_000],
    [99, 38_000_000],
  ],
  LB: [
    [75, 2_500_000],
    [80, 5_000_000],
    [84, 8_000_000],
    [88, 12_000_000],
    [92, 16_000_000],
    [96, 20_000_000],
    [99, 23_000_000],
  ],
  CB: [
    [75, 3_000_000],
    [80, 6_000_000],
    [84, 11_000_000],
    [88, 17_000_000],
    [92, 23_000_000],
    [96, 30_000_000],
    [99, 35_000_000],
  ],
  S: [
    [75, 2_500_000],
    [80, 5_000_000],
    [84, 8_500_000],
    [88, 13_000_000],
    [92, 18_000_000],
    [96, 23_000_000],
    [99, 26_000_000],
  ],
  DB: [
    [75, 3_000_000],
    [80, 6_000_000],
    [84, 11_000_000],
    [88, 17_000_000],
    [92, 23_000_000],
    [96, 30_000_000],
    [99, 35_000_000],
  ],
};

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}

/**
 * Only newly created GM run seeds opt into the stochastic model. Existing saved
 * games (and historical challenges) keep their original fixed projections.
 */
export const FOOTBALL_GM_DEVELOPMENT_SEED_TAG = ":gmdev1";

function developmentRoll(seed: string, playerId: string, step: number, salt: string) {
  const value = `${seed}:${playerId}:${step}:${salt}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  return ((hash ^ (hash >>> 16)) >>> 0) / 0x1_0000_0000;
}

/**
 * Y1 -> Y2 uses the authored player odds unchanged. Y2 -> Y3 uses the same
 * identity profile, adjusted for realized Y2 improvement, available rating
 * headroom, and age. The residual outcome is steady.
 */
export function footballGmDevelopmentOdds(input: {
  playerId: string;
  step: 0 | 1;
  grade: number;
  originalGrade: number;
  age: number;
  position: WheelFootballGmMarketPosition;
}) {
  const profile = footballGmDevelopmentProfile(input.playerId);
  if (!profile) return null;
  if (input.step === 0) {
    return {
      breakoutPct: profile.breakoutPct,
      improvePct: profile.improvePct,
      declinePct: profile.declinePct,
      steadyPct: 100 - profile.breakoutPct - profile.improvePct - profile.declinePct,
    };
  }

  const headroom = Math.max(0, 99 - clamp(input.grade, 70, 99));
  const priorGain = input.grade - input.originalGrade;
  // A year-two 87 -> 93 breakout shouldn't repeat at original odds.
  // A disappointing year still permits a comeback, not a guaranteed bust.
  const repeatBreakoutFactor = clamp(1 - Math.max(0, priorGain - 2) / 9, 0.35, 1);
  const breakoutPct = profile.breakoutPct * clamp(headroom / 10, 0.08, 1) * repeatBreakoutFactor;
  const improvePct = profile.improvePct * clamp(headroom / 7, 0.2, 1)
    + (priorGain <= -3 ? 3 : 0);

  const agingThreshold = input.position === "QB" ? 34
    : input.position === "RB" ? 28
      : input.position === "WR" ? 30
        : input.position === "FLEX" || input.position === "DL" ? 31 : 30;
  const agingPressure = input.age >= agingThreshold + 3 ? 10
    : input.age >= agingThreshold ? 6 : 0;
  const declinePct = clamp(
    profile.declinePct + agingPressure + (priorGain <= -4 ? 2 : 0),
    0,
    Math.max(0, 100 - breakoutPct - improvePct),
  );
  return {
    breakoutPct,
    improvePct,
    declinePct,
    steadyPct: Math.max(0, 100 - breakoutPct - improvePct - declinePct),
  };
}

function developmentDelta(input: {
  seed: string;
  playerId: string;
  step: 0 | 1;
  age: number;
  grade: number;
  position: WheelFootballGmMarketPosition;
  draftYear: number | null;
  draftOverall: number | null;
  expectedDelta: number;
  originalGrade: number;
}) {
  const { age, grade, seed, playerId, step } = input;
  const profile = footballGmDevelopmentProfile(playerId);
  const sharedIdentity = profile?.name === "Travis Hunter"
    ? `${profile.team}:travishunter` : playerId;
  const surprise = developmentRoll(seed, sharedIdentity, step, "outcome");
  const magnitude = developmentRoll(seed, sharedIdentity, step, "magnitude");

  if (profile) {
    // Each year's separate seeded roll is weighted by its resolved odds.
    const odds = footballGmDevelopmentOdds({
      playerId, step, grade, originalGrade: input.originalGrade,
      age, position: input.position,
    })!;
    const breakout = odds.breakoutPct / 100;
    const improve = odds.improvePct / 100;
    const decline = odds.declinePct / 100;
    const up = profile.maxAnnualGain;
    const down = profile.maxAnnualLoss;
    let delta: number;
    if (surprise < breakout) {
      delta = Math.min(up, Math.max(0, input.expectedDelta * 0.4) + up * (0.55 + magnitude * 0.45));
    } else if (surprise < breakout + improve) {
      delta = Math.min(up * 0.6, Math.max(-0.1, input.expectedDelta * 0.2) + 0.35 + magnitude * Math.min(2.4, up * 0.48));
    } else if (surprise < 1 - decline) {
      delta = input.expectedDelta * 0.22 + (magnitude - 0.5) * Math.min(1.3, up * 0.35);
    } else {
      delta = Math.max(-down, Math.min(0, input.expectedDelta * 0.2) - (0.35 + magnitude * (down - 0.35)));
    }
    return Math.round(clamp(delta, -down, up) * 100) / 100;
  }

  // Compatibility only for synthetic fixtures not present in the audited
  // player pool. Every live player is required to have a profile by tests.
  const recentProspect = age <= 25
    && (input.draftYear ?? 0) >= 2023
    && (input.draftOverall ?? 999) <= 64;
  const primeYoung = age <= 26 && grade < 92;
  const establishedElite = grade >= 93 && age < (input.position === "QB" ? 35 : 31);
  const aging = age >= (input.position === "QB" ? 34 : input.position === "RB" ? 28 : 31);
  const breakoutChance = establishedElite ? 0.02 : recentProspect ? 0.22 : primeYoung ? 0.11 : 0.04;
  const improvingChance = establishedElite ? 0.15 : primeYoung ? 0.37 : aging ? 0.09 : 0.21;
  const declineChance = establishedElite ? 0.08 : recentProspect ? 0.18 : aging ? 0.43 : 0.27;
  let delta: number;
  if (surprise < breakoutChance) {
    delta = Math.max(0, input.expectedDelta) + (primeYoung ? 3 : 1.5) + magnitude * (primeYoung ? 4 : 1.6);
  } else if (surprise < breakoutChance + improvingChance) {
    delta = Math.max(-0.25, input.expectedDelta * 0.6) + 0.6 + magnitude * 1.6;
  } else if (surprise < 1 - declineChance) {
    delta = input.expectedDelta * 0.25 + (magnitude - 0.5) * 1.1;
  } else {
    delta = Math.min(0, input.expectedDelta * 0.4) - (0.9 + magnitude * (aging ? 3.2 : 3.5));
  }
  if (establishedElite) delta = clamp(delta, -1.4, 2);
  if (grade >= 95 && delta > 0) delta *= 0.5;
  if (step === 1 && grade >= 92 && delta > 2) delta = 2 + (delta - 2) * 0.3;
  return clamp(delta, -5.5, 8);
}

function recentDraftPedigreeBoost(input: {
  draftYear: number | null;
  draftOverall: number | null;
  currentGrade: number;
  projectionStep: 0 | 1;
}) {
  if (input.draftYear == null || input.draftOverall == null) return 0;
  const recency = input.draftYear >= 2026
    ? 1
    : input.draftYear === 2025
      ? 0.75
      : input.draftYear === 2024
        ? 0.5
        : 0;
  if (!recency) return 0;

  const first = input.projectionStep === 0;
  let base = input.draftOverall <= 10
    ? (first ? 2.2 : 1.4)
    : input.draftOverall <= 32
      ? (first ? 1.5 : 1)
      : input.draftOverall <= 64
        ? (first ? 0.9 : 0.6)
        : input.draftOverall <= 100
          ? (first ? 0.5 : 0.3)
          : 0;

  // A very recent blue-chip player with a low current grade can still have
  // meaningful projection headroom without treating that upside as present ability.
  if (input.draftOverall <= 10 && input.currentGrade < 82) {
    base += first ? 0.75 : 0.5;
  }
  return base * recency;
}

function annualGradeDelta(input: {
  position: WheelFootballGmMarketPosition;
  age: number;
  currentGrade: number;
  draftYear: number | null;
  draftOverall: number | null;
  projectionStep: 0 | 1;
  projectionAdjustment: number;
}) {
  const { position, age, currentGrade } = input;

  // Youth alone is not a progression trigger. A young player's upside must be
  // supported by demonstrated current quality and/or recent draft pedigree.
  if (age <= 25) {
    const demonstrated = currentGrade >= 94
      ? 0.25
      : currentGrade >= 88
        ? 0.5
        : currentGrade >= 82
          ? 0.25
          : 0;
    return clamp(
      demonstrated + recentDraftPedigreeBoost(input) + input.projectionAdjustment,
      -2.75,
      2.75,
    );
  }

  let delta: number;
  if (position === "QB") {
    if (age <= 31) delta = 0.2;
    else if (age <= 34) delta = -0.75;
    else if (age <= 36) delta = -1.5;
    else delta = -2.5;
  } else if (position === "RB") {
    if (age === 26) delta = -0.4;
    else if (age === 27) delta = -1;
    else if (age <= 29) delta = -1.8;
    else delta = -3;
  } else if (position === "WR") {
    if (age <= 28) delta = 0.1;
    else if (age <= 30) delta = -0.6;
    else if (age <= 32) delta = -1.25;
    else delta = -2.25;
  } else if (position === "FLEX") {
    if (age <= 27) delta = 0.15;
    else if (age <= 30) delta = -0.4;
    else if (age <= 32) delta = -1;
    else delta = -2;
  } else if (position === "DL") {
    if (age <= 27) delta = 0.15;
    else if (age <= 30) delta = -0.4;
    else if (age <= 32) delta = -1;
    else delta = -2;
  } else if (position === "LB") {
    if (age <= 27) delta = 0.1;
    else if (age <= 29) delta = -0.4;
    else if (age <= 31) delta = -1;
    else delta = -2;
  } else {
    if (age <= 27) delta = 0.1;
    else if (age <= 29) delta = -0.4;
    else if (age <= 31) delta = -1;
    else delta = -2;
  }

  // Elite veterans can age without automatically falling off a cliff.
  if (delta < 0 && currentGrade >= 94) delta *= 0.7;
  else if (delta < 0 && currentGrade >= 88) delta *= 0.85;
  return clamp(delta + input.projectionAdjustment, -3, 3);
}

export function projectWheelFootballGmGrade(input: {
  currentGrade: number;
  age: number;
  position: WheelFootballGmMarketPosition;
  yearsAhead: 0 | 1 | 2;
  draftYear?: number | null;
  draftOverall?: number | null;
  projectionAdjustment?: number;
  seed?: string;
  playerId?: string;
}) {
  let grade = input.currentGrade;
  for (let year = 0; year < input.yearsAhead; year += 1) {
    const expectedDelta = annualGradeDelta({
      position: input.position,
      age: input.age + year,
      currentGrade: grade,
      draftYear: input.draftYear ?? null,
      draftOverall: input.draftOverall ?? null,
      projectionStep: year as 0 | 1,
      projectionAdjustment: input.projectionAdjustment ?? 0,
    });
    grade += input.seed?.endsWith(FOOTBALL_GM_DEVELOPMENT_SEED_TAG) && input.playerId
      ? developmentDelta({
        seed: input.seed,
        playerId: input.playerId,
        step: year as 0 | 1,
        age: input.age + year,
        grade,
        position: input.position,
        draftYear: input.draftYear ?? null,
        draftOverall: input.draftOverall ?? null,
        expectedDelta,
        originalGrade: input.currentGrade,
      })
      : expectedDelta;
  }
  return Math.round(clamp(grade, 70, 99) * 10) / 10;
}

function interpolateMarketApy(position: WheelFootballGmMarketPosition | FootballGmActualRole, grade: number) {
  const curve = MARKET_CURVES[position];
  const boundedGrade = clamp(grade, curve[0]![0], curve[curve.length - 1]![0]);
  for (let index = 1; index < curve.length; index += 1) {
    const previous = curve[index - 1]!;
    const next = curve[index]!;
    if (boundedGrade > next[0]) continue;
    const pct = (boundedGrade - previous[0]) / (next[0] - previous[0]);
    return previous[1] + (pct * (next[1] - previous[1]));
  }
  return curve[curve.length - 1]![1];
}

function veteranMarketFactor(position: WheelFootballGmMarketPosition, age: number) {
  if (position === "QB") {
    if (age >= 38) return 0.65;
    if (age >= 36) return 0.8;
    if (age >= 34) return 0.92;
    return 1;
  }
  if (position === "RB") {
    if (age >= 30) return 0.7;
    if (age === 29) return 0.82;
    if (age === 28) return 0.9;
    return 1;
  }
  if (position === "WR") {
    if (age >= 33) return 0.75;
    if (age >= 31) return 0.88;
    if (age === 30) return 0.94;
    return 1;
  }
  if (position === "FLEX" || position === "DL") {
    if (age >= 34) return 0.78;
    if (age >= 32) return 0.88;
    if (age === 31) return 0.94;
    return 1;
  }
  if (age >= 32) return 0.8;
  if (age >= 30) return 0.9;
  return 1;
}

function roundToHalfMillion(value: number) {
  return Math.max(1_000_000, Math.round(value / 500_000) * 500_000);
}

export function projectWheelFootballGmExtensionApy(input: {
  currentGrade: number;
  age: number;
  position: WheelFootballGmMarketPosition;
  marketRole?: FootballGmActualRole;
  draftYear?: number | null;
  draftOverall?: number | null;
  projectionAdjustment?: number;
  seed?: string;
  playerId?: string;
}) {
  const yearTwoGrade = projectWheelFootballGmGrade({
    ...input,
    yearsAhead: 1,
  });
  const role = input.marketRole === "TE" ? "FLEX" : (input.marketRole ?? input.position);
  const market = interpolateMarketApy(role, yearTwoGrade);
  // Market interest varies independently from development, but remains tied to
  // the player's realized grade and is fixed across the two future seasons.
  const profile = input.playerId ? footballGmDevelopmentProfile(input.playerId) : null;
  const spread = (profile?.marketVariancePct ?? 8) / 100;
  const marketVariance = input.seed?.endsWith(FOOTBALL_GM_DEVELOPMENT_SEED_TAG) && input.playerId
    ? 1 - spread + developmentRoll(input.seed, input.playerId, 0, "market") * spread * 2
    : 1;
  return roundToHalfMillion(market * veteranMarketFactor(input.position, input.age + 1) * marketVariance);
}

export function wheelFootballGmSalaryWindow(input: {
  gameContract: WheelFootballGmContractTerm;
  salaryApy: number;
  projectedExtensionApy: number;
}) {
  return input.gameContract === "3YR"
    ? [input.salaryApy, input.salaryApy, input.salaryApy] as const
    : [input.salaryApy, input.projectedExtensionApy, input.projectedExtensionApy] as const;
}

export function wheelFootballGmOutlook(input: {
  currentGrade: number;
  age: number;
  position: WheelFootballGmMarketPosition;
  draftYear?: number | null;
  draftOverall?: number | null;
  projectionAdjustment?: number;
}) {
  const yearThree = projectWheelFootballGmGrade({ ...input, yearsAhead: 2 });
  const change = yearThree - input.currentGrade;
  if (input.currentGrade >= 92 && change >= 0.5) return "ELITE UPSIDE" as const;
  if (change >= 2) return "RISING" as const;
  if (change <= -3) return "DECLINE RISK" as const;
  return "STABLE" as const;
}

export function wheelFootballGmMarketPositionForContract(
  contract: Pick<WheelFootballGmContractRow, "family" | "position" | "gmEligibleSlots">,
): WheelFootballGmMarketPosition {
  if (contract.family === "QB") return "QB";
  if (contract.family === "RB") return "RB";
  if (contract.family === "WR") return "WR";
  if (contract.family === "TE") return "FLEX";
  if (contract.family === "Secondary") return "DB";
  return contract.gmEligibleSlots.includes("LB") ? "LB" : "DL";
}
