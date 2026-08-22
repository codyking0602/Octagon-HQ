import type { FootballRankFivePackId } from "./footballRankFiveModel";

export type FootballContentClass = "factual" | "comparative" | "subjective";

export const FOOTBALL_CONTENT_CLASS_RULES = {
  factual: {
    truthSource: "canonical-factual-owner",
    hardCorrectAnswer: true,
    description: "Objective football facts and derived metrics answer what happened.",
  },
  comparative: {
    truthSource: "canonical-comparison-owner",
    hardCorrectAnswer: true,
    description: "Versioned, category-specific rating contracts answer how great comparable subjects were.",
  },
  subjective: {
    truthSource: "calibrated-opinion",
    hardCorrectAnswer: false,
    description: "Calibrated opinion powers subjective prompts such as uniforms, atmosphere, aura, or fanbase insanity.",
  },
} as const satisfies Record<FootballContentClass, {
  truthSource: string;
  hardCorrectAnswer: boolean;
  description: string;
}>;

export type FootballRatingBand =
  | "elite"
  | "great"
  | "good"
  | "average"
  | "below-average"
  | "bad";

export const FOOTBALL_RATING_BANDS = [
  { id: "elite", min: 92 },
  { id: "great", min: 82 },
  { id: "good", min: 70 },
  { id: "average", min: 55 },
  { id: "below-average", min: 35 },
  { id: "bad", min: 0 },
] as const satisfies readonly { id: FootballRatingBand; min: number }[];

export function getFootballRatingBand(rating: number): FootballRatingBand {
  if (!Number.isFinite(rating) || rating < 0 || rating > 100) {
    throw new Error(`Football comparison ratings must be finite values from 0 through 100. Received: ${rating}`);
  }

  const band = FOOTBALL_RATING_BANDS.find(({ min }) => rating >= min);
  if (!band) throw new Error(`Football comparison rating has no configured band: ${rating}`);
  return band.id;
}

export type FootballComparisonEvidenceStatus =
  | "legacy-authored-pending-review"
  | "reviewed";

export interface FootballComparisonContract {
  packId: FootballRankFivePackId;
  contentClass: "comparative";
  methodologyVersion: string;
  question: string;
  scope: string;
  evidenceStatus: FootballComparisonEvidenceStatus;
  evidenceRequirements: readonly [
    "factual-resume",
    "era-and-context",
    "whole-pool-calibration",
    "pairwise-sanity-check",
  ];
}

const PENDING_EVIDENCE_REQUIREMENTS = [
  "factual-resume",
  "era-and-context",
  "whole-pool-calibration",
  "pairwise-sanity-check",
] as const;

export const footballComparisonContracts = {
  "nfl-quarterbacks": {
    packId: "nfl-quarterbacks",
    contentClass: "comparative",
    methodologyVersion: "nfl-qb-career-v1",
    question: "How great was this player's NFL quarterback career?",
    scope: "NFL quarterback careers only; era-adjust production and separate individual greatness from team success.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: PENDING_EVIDENCE_REQUIREMENTS,
  },
  "nfl-running-backs": {
    packId: "nfl-running-backs",
    contentClass: "comparative",
    methodologyVersion: "nfl-rb-career-v1",
    question: "How great was this player's NFL running back career?",
    scope: "NFL running back careers only; weigh peak, era-adjusted production and efficiency, sustained elite play, recognition, and postseason value.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: PENDING_EVIDENCE_REQUIREMENTS,
  },
  "nfl-head-coaches": {
    packId: "nfl-head-coaches",
    contentClass: "comparative",
    methodologyVersion: "nfl-head-coach-career-v1",
    question: "How great was this NFL head coaching career?",
    scope: "NFL head coaching careers only; weigh championships, sustained contention, peak teams, longevity, and performance across roster cycles.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: PENDING_EVIDENCE_REQUIREMENTS,
  },
  "college-quarterbacks": {
    packId: "college-quarterbacks",
    contentClass: "comparative",
    methodologyVersion: "cfb-qb-career-v1",
    question: "How great was this quarterback's college football career?",
    scope: "College performance only; do not use NFL outcomes. Separate this career contract from future single-season quarterback contracts.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: PENDING_EVIDENCE_REQUIREMENTS,
  },
  "college-programs": {
    packId: "college-programs",
    contentClass: "comparative",
    methodologyVersion: "cfb-program-since-2000-v1",
    question: "How great has this college football program been since 2000?",
    scope: "Program achievement from the 2000 season forward; weigh championships, sustained contention, conference success, peak seasons, talent production, and resilience across eras.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: PENDING_EVIDENCE_REQUIREMENTS,
  },
  "college-team-seasons": {
    packId: "college-team-seasons",
    contentClass: "comparative",
    methodologyVersion: "cfb-team-season-v1",
    question: "How great was this specific college football team in this specific season?",
    scope: "Judge only the named team-season; weigh dominance, competition, championship accomplishment, peak/postseason form, underlying team quality, and weaknesses or losses.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: PENDING_EVIDENCE_REQUIREMENTS,
  },
} as const satisfies Record<FootballRankFivePackId, FootballComparisonContract>;

export function getFootballComparisonContract(packId: FootballRankFivePackId): FootballComparisonContract {
  return footballComparisonContracts[packId];
}
