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

export interface FootballComparisonRubricComponent {
  id: string;
  label: string;
  weight: number;
}

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
  evidenceCutoff: string;
  evidenceSummary: string;
  rubric: readonly FootballComparisonRubricComponent[] | null;
}

const EVIDENCE_REQUIREMENTS = [
  "factual-resume",
  "era-and-context",
  "whole-pool-calibration",
  "pairwise-sanity-check",
] as const;

const NFL_REVIEW_SUMMARY = "Reviewed through the completed 2025 NFL season using career production/efficiency, awards, postseason results, longevity, era/context, whole-pool calibration, and pairwise checks. Pro Football Reference career leaderboards and Hall of Fame Monitor were used as evidence inputs, not as a substitute for the category rubric.";

const NFL_QB_CAREER_RUBRIC = [
  { id: "peak", label: "Peak / best-season dominance", weight: 25 },
  { id: "sustained-elite", label: "Sustained elite play", weight: 20 },
  { id: "production-efficiency", label: "Era-adjusted production and efficiency", weight: 20 },
  { id: "postseason", label: "Postseason performance and success", weight: 15 },
  { id: "awards", label: "MVP / All-Pro / major recognition", weight: 10 },
  { id: "longevity", label: "Longevity / durability / sustained relevance", weight: 10 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const NFL_RB_CAREER_RUBRIC = [
  { id: "peak", label: "Peak rushing / scrimmage dominance", weight: 25 },
  { id: "production-efficiency", label: "Era-adjusted production and efficiency", weight: 25 },
  { id: "sustained-elite", label: "Sustained elite seasons", weight: 20 },
  { id: "awards", label: "MVP / All-Pro / major recognition", weight: 15 },
  { id: "longevity", label: "Longevity and durable career value", weight: 10 },
  { id: "postseason", label: "Postseason and championship value", weight: 5 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const NFL_WR_CAREER_RUBRIC = [
  { id: "peak", label: "Peak receiving dominance", weight: 25 },
  { id: "production", label: "Era-adjusted receiving production", weight: 25 },
  { id: "sustained-elite", label: "Sustained elite seasons", weight: 20 },
  { id: "awards", label: "All-Pro / Pro Bowl / major recognition", weight: 15 },
  { id: "longevity", label: "Longevity, records and sustained relevance", weight: 10 },
  { id: "postseason", label: "Postseason and championship value", weight: 5 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const NFL_HEAD_COACH_CAREER_RUBRIC = [
  { id: "championships", label: "Championship and postseason success", weight: 25 },
  { id: "sustained-contention", label: "Sustained contention", weight: 25 },
  { id: "peak-teams", label: "Peak team quality", weight: 20 },
  { id: "regular-season", label: "Regular-season performance", weight: 10 },
  { id: "longevity", label: "Longevity and adaptability", weight: 10 },
  { id: "roster-cycles", label: "Success across roster / quarterback cycles", weight: 10 },
] as const satisfies readonly FootballComparisonRubricComponent[];

export const footballComparisonContracts = {
  "nfl-quarterbacks": {
    packId: "nfl-quarterbacks",
    contentClass: "comparative",
    methodologyVersion: "nfl-qb-career-v1",
    question: "How great was this player's NFL quarterback career?",
    scope: "NFL quarterback careers only; era-adjust production and separate individual greatness from team success.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: NFL_REVIEW_SUMMARY,
    rubric: NFL_QB_CAREER_RUBRIC,
  },
  "nfl-running-backs": {
    packId: "nfl-running-backs",
    contentClass: "comparative",
    methodologyVersion: "nfl-rb-career-v1",
    question: "How great was this player's NFL running back career?",
    scope: "NFL running back careers only; weigh peak, era-adjusted production and efficiency, sustained elite play, recognition, and postseason value.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: NFL_REVIEW_SUMMARY,
    rubric: NFL_RB_CAREER_RUBRIC,
  },
  "nfl-wide-receivers": {
    packId: "nfl-wide-receivers",
    contentClass: "comparative",
    methodologyVersion: "nfl-wr-career-v1",
    question: "How great was this player's NFL wide receiver career?",
    scope: "NFL wide receiver careers only; weigh peak, era-adjusted production, sustained elite play, recognition, longevity, and postseason value.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: NFL_REVIEW_SUMMARY,
    rubric: NFL_WR_CAREER_RUBRIC,
  },
  "nfl-head-coaches": {
    packId: "nfl-head-coaches",
    contentClass: "comparative",
    methodologyVersion: "nfl-head-coach-career-v1",
    question: "How great was this NFL head coaching career?",
    scope: "NFL head coaching careers only; weigh championships, sustained contention, peak teams, longevity, and performance across roster cycles.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: NFL_REVIEW_SUMMARY,
    rubric: NFL_HEAD_COACH_CAREER_RUBRIC,
  },
  "college-quarterbacks": {
    packId: "college-quarterbacks",
    contentClass: "comparative",
    methodologyVersion: "cfb-qb-career-v1",
    question: "How great was this quarterback's college football career?",
    scope: "College performance only; do not use NFL outcomes. Separate this career contract from future single-season quarterback contracts.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "legacy-authored",
    evidenceSummary: "Awaiting the dedicated CFB comparison-depth review before these legacy ratings are treated as mature.",
    rubric: null,
  },
  "college-programs": {
    packId: "college-programs",
    contentClass: "comparative",
    methodologyVersion: "cfb-program-since-2000-v1",
    question: "How great has this college football program been since 2000?",
    scope: "Program achievement from the 2000 season forward; weigh championships, sustained contention, conference success, peak seasons, talent production, and resilience across eras.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "legacy-authored",
    evidenceSummary: "Awaiting the dedicated CFB comparison-depth review before these legacy ratings are treated as mature.",
    rubric: null,
  },
  "college-team-seasons": {
    packId: "college-team-seasons",
    contentClass: "comparative",
    methodologyVersion: "cfb-team-season-v1",
    question: "How great was this specific college football team in this specific season?",
    scope: "Judge only the named team-season; weigh dominance, competition, championship accomplishment, peak/postseason form, underlying team quality, and weaknesses or losses.",
    evidenceStatus: "legacy-authored-pending-review",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "legacy-authored",
    evidenceSummary: "Awaiting the dedicated CFB comparison-depth review before these legacy ratings are treated as mature.",
    rubric: null,
  },
} as const satisfies Record<FootballRankFivePackId, FootballComparisonContract>;

export function getFootballComparisonContract(packId: FootballRankFivePackId): FootballComparisonContract {
  return footballComparisonContracts[packId];
}
