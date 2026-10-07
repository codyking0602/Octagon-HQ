export const WHEEL_FOOTBALL_GM_CAP = 150_000_000;

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

const MARKET_CURVES: Readonly<Record<WheelFootballGmMarketPosition, readonly MarketPoint[]>> = {
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
  LB: [
    [75, 2_500_000],
    [80, 5_000_000],
    [84, 8_000_000],
    [88, 12_000_000],
    [92, 16_000_000],
    [96, 20_000_000],
    [99, 23_000_000],
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

function recentDraftPedigreeBoost(input: {
  draftYear: number | null;
  draftOverall: number | null;
  currentGrade: number;
  projectionStep: 0 | 1;
  projectionAdjustment: number;
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
}) {
  let grade = input.currentGrade;
  for (let year = 0; year < input.yearsAhead; year += 1) {
    grade += annualGradeDelta({
      position: input.position,
      age: input.age + year,
      currentGrade: grade,
      draftYear: input.draftYear ?? null,
      draftOverall: input.draftOverall ?? null,
      projectionStep: year as 0 | 1,
      projectionAdjustment: input.projectionAdjustment ?? 0,
    });
  }
  return Math.round(clamp(grade, 70, 99) * 10) / 10;
}

function interpolateMarketApy(position: WheelFootballGmMarketPosition, grade: number) {
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
  draftYear?: number | null;
  draftOverall?: number | null;
  projectionAdjustment?: number;
}) {
  const yearTwoGrade = projectWheelFootballGmGrade({
    ...input,
    yearsAhead: 1,
  });
  const market = interpolateMarketApy(input.position, yearTwoGrade);
  return roundToHalfMillion(market * veteranMarketFactor(input.position, input.age + 1));
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
