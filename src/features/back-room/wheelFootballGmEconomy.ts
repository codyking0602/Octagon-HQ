export const WHEEL_FOOTBALL_GM_CAP = 155_000_000;

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

function annualGradeDelta(position: WheelFootballGmMarketPosition, age: number) {
  if (position === "QB") {
    if (age <= 25) return 1.5;
    if (age <= 31) return 0.25;
    if (age <= 34) return -1;
    if (age <= 36) return -2;
    return -3.5;
  }
  if (position === "RB") {
    if (age <= 23) return 1.5;
    if (age <= 25) return 0.5;
    if (age === 26) return -0.5;
    if (age === 27) return -1.5;
    if (age <= 29) return -2.5;
    return -4;
  }
  if (position === "WR") {
    if (age <= 23) return 1.5;
    if (age <= 25) return 0.75;
    if (age <= 28) return 0.2;
    if (age <= 30) return -0.75;
    if (age <= 32) return -1.75;
    return -3;
  }
  if (position === "FLEX") {
    if (age <= 24) return 1.25;
    if (age <= 27) return 0.5;
    if (age <= 30) return -0.4;
    if (age <= 32) return -1.25;
    return -2.5;
  }
  if (position === "DL") {
    if (age <= 24) return 1.25;
    if (age <= 27) return 0.5;
    if (age <= 30) return -0.5;
    if (age <= 32) return -1.25;
    return -2.5;
  }
  if (position === "LB") {
    if (age <= 24) return 1;
    if (age <= 27) return 0.3;
    if (age <= 29) return -0.5;
    if (age <= 31) return -1.25;
    return -2.5;
  }
  if (age <= 24) return 1.25;
  if (age <= 27) return 0.4;
  if (age <= 29) return -0.5;
  if (age <= 31) return -1.3;
  return -2.5;
}

export function projectWheelFootballGmGrade(input: {
  currentGrade: number;
  age: number;
  position: WheelFootballGmMarketPosition;
  yearsAhead: 0 | 1 | 2;
}) {
  let grade = input.currentGrade;
  for (let year = 0; year < input.yearsAhead; year += 1) {
    grade += annualGradeDelta(input.position, input.age + year);
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
