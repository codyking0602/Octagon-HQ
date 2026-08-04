import type { PlayGameId } from "./playRegistry";

export const OFFICIAL_SCORE_CONTRACT_VERSION = "play-official-score-v1" as const;

export type OfficialDailyGameId = Extract<
  PlayGameId,
  "find-leader" | "wavelength" | "blind-resume" | "blind-rank" | "keep-cut"
>;

export type ExistingOfficialScoreGameId = Extract<
  OfficialDailyGameId,
  "find-leader" | "wavelength" | "blind-resume"
>;

interface NativeScoreBase {
  value: number;
  max: number;
  display: string;
}

export interface OfficialNativeScoreByGame {
  "find-leader": NativeScoreBase & {
    kind: "find-leader-round";
    max: 10;
  };
  wavelength: NativeScoreBase & {
    kind: "wavelength-distance";
    max: 100;
  };
  "blind-resume": NativeScoreBase & {
    kind: "blind-resume-correct-picks";
    max: 5;
  };
}

export interface OfficialScoreResult<GameId extends ExistingOfficialScoreGameId> {
  contractVersion: typeof OFFICIAL_SCORE_CONTRACT_VERSION;
  gameId: GameId;
  score: number;
  native: OfficialNativeScoreByGame[GameId];
}

export type ExistingOfficialScoreResult = {
  [GameId in ExistingOfficialScoreGameId]: OfficialScoreResult<GameId>;
}[ExistingOfficialScoreGameId];

export type OfficialScoreRounding = "none" | "nearest-whole";

export const OFFICIAL_COMPARISON_GRADING_RULES = {
  "blind-rank": {
    comparisonCount: 10,
    ratingTieTolerance: 1,
    normalizedPointsPerComparison: 10,
    rounding: "none",
  },
  "keep-cut": {
    comparisonCount: 16,
    ratingTieTolerance: 1,
    normalizedPointsPerComparison: 6.25,
    rounding: "nearest-whole",
  },
} as const satisfies Record<
  Extract<OfficialDailyGameId, "blind-rank" | "keep-cut">,
  {
    comparisonCount: number;
    ratingTieTolerance: number;
    normalizedPointsPerComparison: number;
    rounding: OfficialScoreRounding;
  }
>;

function requireIntegerInRange(value: number, min: number, max: number, label: string) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${label} must be an integer from ${min} to ${max}.`);
  }

  return value;
}

export function adaptFindLeaderOfficialScore(nativeScore: number): OfficialScoreResult<"find-leader"> {
  const value = requireIntegerInRange(nativeScore, 1, 10, "Find the Leader score");

  return {
    contractVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    gameId: "find-leader",
    score: value * 10,
    native: {
      kind: "find-leader-round",
      value,
      max: 10,
      display: `${value}/10`,
    },
  };
}

export function adaptWavelengthOfficialScore(nativeScore: number): OfficialScoreResult<"wavelength"> {
  const value = requireIntegerInRange(nativeScore, 0, 100, "Wavelength score");

  return {
    contractVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    gameId: "wavelength",
    score: value,
    native: {
      kind: "wavelength-distance",
      value,
      max: 100,
      display: `${value}/100`,
    },
  };
}

export function adaptBlindResumeOfficialScore(nativeScore: number): OfficialScoreResult<"blind-resume"> {
  const value = requireIntegerInRange(nativeScore, 0, 5, "Blind Resume score");

  return {
    contractVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    gameId: "blind-resume",
    score: value * 20,
    native: {
      kind: "blind-resume-correct-picks",
      value,
      max: 5,
      display: `${value}/5`,
    },
  };
}

export const existingOfficialScoreAdapters = {
  "find-leader": adaptFindLeaderOfficialScore,
  wavelength: adaptWavelengthOfficialScore,
  "blind-resume": adaptBlindResumeOfficialScore,
} as const satisfies Record<ExistingOfficialScoreGameId, (nativeScore: number) => ExistingOfficialScoreResult>;
