import gmContractsJson from "../../../data/generated/football/nfl-gm-contracts-2026-10-05.json";
import { normalizedWheelFootballNflBaseName } from "./wheelFootballNflPriority";

export const FOOTBALL_GM_CAP = 155_000_000;
export const FOOTBALL_GM_GAME_YEARS = [2026, 2027, 2028] as const;
export const FOOTBALL_GM_ROSTER_SLOTS = ["QB", "RB", "WR", "Flex", "DL", "LB", "DB"] as const;

export type FootballGmGameContract = "1YR" | "3YR";
export type FootballGmMarketPosition = "QB" | "RB" | "WR" | "TE" | "EDGE" | "IDL" | "LB" | "DB";
export type FootballGmRosterSlot = (typeof FOOTBALL_GM_ROSTER_SLOTS)[number];

export interface FootballGmContract {
  teamCode: string;
  family: "QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary";
  player: string;
  currentApy: number;
  gameContract: FootballGmGameContract;
  marketPosition: FootballGmMarketPosition;
  age?: number;
  freeAgencyYear?: number;
  sourceKind: "contract-history" | "2027-fa-snapshot" | "current-reconciliation";
}

interface FootballGmContractArtifact {
  version: string;
  effectiveDate: string;
  populationCount: number;
  gmCap: number;
  gameWindow: readonly number[];
  players: FootballGmContract[];
}

const artifact = gmContractsJson as FootballGmContractArtifact;

if (artifact.gmCap !== FOOTBALL_GM_CAP) {
  throw new Error("NFL GM contract authority cap does not match the locked GM cap.");
}

export const footballGmContractAuthority = artifact;
export const FOOTBALL_GM_CONTRACT_VERSION = artifact.version;
export const FOOTBALL_GM_CONTRACT_EFFECTIVE_DATE = artifact.effectiveDate;

function contractKey(teamCode: string, family: string, player: string) {
  return `${teamCode.trim().toUpperCase()}|${family}|${normalizedWheelFootballNflBaseName(player)}`;
}

const contractByIdentity = new Map(
  artifact.players.map((contract) => [
    contractKey(contract.teamCode, contract.family, contract.player),
    contract,
  ]),
);

export function footballGmContractForPlayer(
  teamCode: string,
  family: FootballGmContract["family"],
  player: string,
) {
  return contractByIdentity.get(contractKey(teamCode, family, player)) ?? null;
}

const MARKET_CEILINGS: Readonly<Record<FootballGmMarketPosition, number>> = {
  QB: 64_000_000,
  RB: 22_500_000,
  WR: 42_150_000,
  TE: 19_100_000,
  EDGE: 50_000_000,
  IDL: 38_000_000,
  LB: 25_000_000,
  DB: 33_750_000,
};

const MARKET_FLOORS: Readonly<Record<FootballGmMarketPosition, number>> = {
  QB: 5_000_000,
  RB: 2_000_000,
  WR: 3_000_000,
  TE: 2_000_000,
  EDGE: 3_000_000,
  IDL: 3_000_000,
  LB: 2_500_000,
  DB: 3_000_000,
};

const GRADE_MARKET_POINTS = [
  [70, 0.12],
  [75, 0.18],
  [80, 0.28],
  [85, 0.43],
  [90, 0.62],
  [93, 0.75],
  [95, 0.85],
  [97, 0.93],
  [99, 0.98],
  [100, 1],
] as const;

function gradeMarketMultiplier(grade: number) {
  const bounded = Math.max(70, Math.min(100, grade));
  for (let index = 1; index < GRADE_MARKET_POINTS.length; index += 1) {
    const [upperGrade, upperValue] = GRADE_MARKET_POINTS[index]!;
    const [lowerGrade, lowerValue] = GRADE_MARKET_POINTS[index - 1]!;
    if (bounded <= upperGrade) {
      const progress = (bounded - lowerGrade) / (upperGrade - lowerGrade);
      return lowerValue + ((upperValue - lowerValue) * progress);
    }
  }
  return 1;
}

function ageMarketMultiplier(position: FootballGmMarketPosition, age: number) {
  const bounded = Math.max(20, Math.min(45, age));

  if (position === "QB") {
    if (bounded <= 34) return 1;
    if (bounded === 35) return 0.95;
    if (bounded === 36) return 0.89;
    if (bounded === 37) return 0.82;
    if (bounded === 38) return 0.73;
    if (bounded === 39) return 0.62;
    return 0.5;
  }

  if (position === "RB") {
    if (bounded <= 24) return 1.03;
    if (bounded === 25) return 1;
    if (bounded === 26) return 0.95;
    if (bounded === 27) return 0.88;
    if (bounded === 28) return 0.78;
    if (bounded === 29) return 0.66;
    if (bounded === 30) return 0.53;
    return 0.4;
  }

  if (position === "WR") {
    if (bounded <= 25) return 1.03;
    if (bounded <= 28) return 1;
    if (bounded === 29) return 0.95;
    if (bounded === 30) return 0.88;
    if (bounded === 31) return 0.79;
    if (bounded === 32) return 0.68;
    return 0.55;
  }

  if (position === "TE") {
    if (bounded <= 27) return 1;
    if (bounded <= 29) return 0.96;
    if (bounded === 30) return 0.9;
    if (bounded === 31) return 0.82;
    if (bounded === 32) return 0.72;
    return 0.58;
  }

  if (position === "EDGE" || position === "IDL") {
    if (bounded <= 28) return 1;
    if (bounded === 29) return 0.96;
    if (bounded === 30) return 0.9;
    if (bounded === 31) return 0.83;
    if (bounded === 32) return 0.74;
    if (bounded === 33) return 0.64;
    return 0.52;
  }

  if (position === "LB") {
    if (bounded <= 27) return 1;
    if (bounded === 28) return 0.96;
    if (bounded === 29) return 0.9;
    if (bounded === 30) return 0.82;
    if (bounded === 31) return 0.72;
    if (bounded === 32) return 0.61;
    return 0.5;
  }

  if (bounded <= 27) return 1;
  if (bounded === 28) return 0.96;
  if (bounded === 29) return 0.9;
  if (bounded === 30) return 0.81;
  if (bounded === 31) return 0.7;
  if (bounded === 32) return 0.58;
  return 0.46;
}

function roundToQuarterMillion(value: number) {
  return Math.round(value / 250_000) * 250_000;
}

/**
 * Projects the new APY for a 1YR GM contract when the single offseason opens.
 *
 * This intentionally uses a small, explainable market model instead of NFL cap
 * accounting: position market ceiling x projected ability x age curve. Values
 * are stated in today's dollars and rounded to $250k for game readability.
 */
export function projectFootballGmExtensionApy(input: {
  marketPosition: FootballGmMarketPosition;
  projectedGrade: number;
  ageAtExtension: number;
}) {
  const ceiling = MARKET_CEILINGS[input.marketPosition];
  const floor = MARKET_FLOORS[input.marketPosition];
  const raw = ceiling
    * gradeMarketMultiplier(input.projectedGrade)
    * ageMarketMultiplier(input.marketPosition, input.ageAtExtension);
  return roundToQuarterMillion(Math.max(floor, Math.min(ceiling, raw)));
}

export function footballGmSalarySchedule(
  contract: FootballGmContract,
  projectedExtensionApy: number | null,
) {
  if (contract.gameContract === "3YR") {
    return [contract.currentApy, contract.currentApy, contract.currentApy] as const;
  }
  if (projectedExtensionApy == null || projectedExtensionApy <= 0) {
    throw new Error("A 1YR GM contract requires a positive projected extension APY.");
  }
  return [contract.currentApy, projectedExtensionApy, projectedExtensionApy] as const;
}

export function footballGmMarketCeiling(position: FootballGmMarketPosition) {
  return MARKET_CEILINGS[position];
}
