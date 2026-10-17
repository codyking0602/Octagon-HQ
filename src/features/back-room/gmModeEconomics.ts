export const GM_MODE_GAME_SEASONS = [2026, 2027, 2028] as const;
export const GM_MODE_FULL_WINDOW_FREE_AGENCY_YEAR = 2029;

export const GM_MODE_ROSTER_SLOTS = [
  "QB",
  "RB",
  "WR",
  "FLEX",
  "DL",
  "LB",
  "DB",
] as const;

export type GmModeRosterSlot = (typeof GM_MODE_ROSTER_SLOTS)[number];
export type GmModeContractTerm = "1YR" | "3YR";
export type GmModeSalaryPosition = "QB" | "RB" | "WR" | "TE" | "DL" | "LB" | "DB";

type SalaryAnchor = readonly [grade: number, apy: number];

const GM_MODE_EXTENSION_APY_ANCHORS: Readonly<Record<GmModeSalaryPosition, readonly SalaryAnchor[]>> = {
  QB: [[70, 6], [75, 14], [80, 26], [85, 40], [90, 52], [95, 60], [99, 64], [100, 65]],
  RB: [[70, 2], [75, 4], [80, 7], [85, 10], [90, 14], [95, 18], [99, 22], [100, 23]],
  WR: [[70, 3], [75, 7], [80, 12], [85, 20], [90, 28], [95, 36], [99, 42], [100, 43]],
  TE: [[70, 2], [75, 5], [80, 8], [85, 12], [90, 16], [95, 18], [99, 19.5], [100, 20]],
  DL: [[70, 3], [75, 7], [80, 12], [85, 19], [90, 27], [95, 37], [99, 49], [100, 50]],
  LB: [[70, 2], [75, 4], [80, 7], [85, 11], [90, 15], [95, 19], [99, 25], [100, 25.5]],
  DB: [[70, 3], [75, 6], [80, 10], [85, 15], [90, 21], [95, 28], [99, 34], [100, 35]],
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function interpolateAnchors(anchors: readonly SalaryAnchor[], grade: number) {
  const normalizedGrade = clamp(grade, anchors[0]![0], anchors.at(-1)![0]);
  for (let index = 1; index < anchors.length; index += 1) {
    const left = anchors[index - 1]!;
    const right = anchors[index]!;
    if (normalizedGrade > right[0]) continue;
    const progress = (normalizedGrade - left[0]) / (right[0] - left[0]);
    return left[1] + ((right[1] - left[1]) * progress);
  }
  return anchors.at(-1)![1];
}

function ageMarketModifier(position: GmModeSalaryPosition, age: number) {
  const normalizedAge = Math.max(20, Math.floor(age));
  if (position === "QB") {
    if (normalizedAge >= 38) return 0.72;
    if (normalizedAge >= 35) return 0.84;
    if (normalizedAge >= 33) return 0.93;
    return 1;
  }
  if (position === "RB") {
    if (normalizedAge >= 31) return 0.58;
    if (normalizedAge >= 29) return 0.74;
    if (normalizedAge >= 28) return 0.86;
    if (normalizedAge >= 27) return 0.94;
    return 1;
  }
  if (position === "WR") {
    if (normalizedAge >= 33) return 0.76;
    if (normalizedAge >= 31) return 0.87;
    if (normalizedAge >= 30) return 0.94;
    return 1;
  }
  if (position === "TE") {
    if (normalizedAge >= 34) return 0.76;
    if (normalizedAge >= 32) return 0.87;
    if (normalizedAge >= 31) return 0.94;
    return 1;
  }
  if (position === "DL") {
    if (normalizedAge >= 34) return 0.76;
    if (normalizedAge >= 32) return 0.87;
    if (normalizedAge >= 31) return 0.94;
    return 1;
  }
  if (position === "LB") {
    if (normalizedAge >= 33) return 0.72;
    if (normalizedAge >= 31) return 0.84;
    if (normalizedAge >= 30) return 0.92;
    return 1;
  }
  if (normalizedAge >= 33) return 0.74;
  if (normalizedAge >= 31) return 0.86;
  if (normalizedAge >= 30) return 0.93;
  return 1;
}

export function gmModeContractTermForFreeAgencyYear(freeAgencyYear: number): GmModeContractTerm {
  return freeAgencyYear >= GM_MODE_FULL_WINDOW_FREE_AGENCY_YEAR ? "3YR" : "1YR";
}

export function roundGmModeSalary(apy: number) {
  return Math.round(Math.max(0, apy) * 2) / 2;
}

export function projectGmModeExtensionApy(input: {
  position: GmModeSalaryPosition;
  projectedGrade: number;
  ageAtExtension: number;
}) {
  const base = interpolateAnchors(
    GM_MODE_EXTENSION_APY_ANCHORS[input.position],
    input.projectedGrade,
  );
  return roundGmModeSalary(base * ageMarketModifier(input.position, input.ageAtExtension));
}

export function gmModeThreeYearSalaryWindow(input: {
  currentApy: number;
  term: GmModeContractTerm;
  projectedExtensionApy: number;
}) {
  const current = roundGmModeSalary(input.currentApy);
  if (input.term === "3YR") {
    return [current, current, current] as const;
  }
  const extension = roundGmModeSalary(input.projectedExtensionApy);
  return [current, extension, extension] as const;
}

export function gmModeSalaryFitsCap(
  salaries: readonly number[],
  cap: number,
) {
  return salaries.every((salary) => salary <= cap + 1e-9);
}
