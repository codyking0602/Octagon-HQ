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

const NFL_REVIEW_SUMMARY = "Reviewed through the completed 2025 NFL season using career/season production and efficiency, awards, postseason results, longevity, era/context, whole-pool calibration, and pairwise checks. Pro Football Reference/NFL historical records and current 2025 NFL award/championship results are evidence inputs, not substitutes for each category rubric.";
const CFB_REVIEW_SUMMARY = "Reviewed through the completed 2025 college football season using NCAA/CFP/AP and Sports Reference-style historical results, awards, production, championships, schedule/context, whole-pool calibration, and pairwise checks. The 2025 Indiana championship is included where the selected contract reaches that season.";

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

const NFL_TE_CAREER_RUBRIC = [
  { id: "peak", label: "Peak receiving / two-way dominance", weight: 25 },
  { id: "production", label: "Era-adjusted receiving production", weight: 20 },
  { id: "sustained-elite", label: "Sustained elite seasons", weight: 20 },
  { id: "awards", label: "All-Pro / Pro Bowl / major recognition", weight: 15 },
  { id: "postseason", label: "Postseason and championship value", weight: 10 },
  { id: "longevity", label: "Longevity and complete positional value", weight: 10 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const NFL_DEFENSIVE_CAREER_RUBRIC = [
  { id: "peak", label: "Peak defensive dominance", weight: 25 },
  { id: "awards", label: "DPOY / first-team All-Pro / major recognition", weight: 20 },
  { id: "sustained-elite", label: "Sustained elite seasons", weight: 20 },
  { id: "production", label: "Era- and position-adjusted measurable production", weight: 15 },
  { id: "postseason", label: "Postseason and championship impact", weight: 10 },
  { id: "positional-impact", label: "Positional impact and historical standing", weight: 10 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const NFL_HEAD_COACH_CAREER_RUBRIC = [
  { id: "championships", label: "Championship and postseason success", weight: 25 },
  { id: "sustained-contention", label: "Sustained contention", weight: 25 },
  { id: "peak-teams", label: "Peak team quality", weight: 20 },
  { id: "regular-season", label: "Regular-season performance", weight: 10 },
  { id: "longevity", label: "Longevity and adaptability", weight: 10 },
  { id: "roster-cycles", label: "Success across roster / quarterback cycles", weight: 10 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const PLAYER_SEASON_RUBRIC = [
  { id: "dominance", label: "Individual dominance", weight: 30 },
  { id: "production", label: "Era-adjusted production", weight: 20 },
  { id: "efficiency", label: "Efficiency", weight: 15 },
  { id: "team", label: "Team accomplishment", weight: 15 },
  { id: "postseason", label: "Championship / postseason performance", weight: 10 },
  { id: "awards", label: "Awards / consensus recognition", weight: 5 },
  { id: "context", label: "Difficulty and context", weight: 5 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const TEAM_SEASON_RUBRIC = [
  { id: "dominance", label: "Dominance", weight: 30 },
  { id: "competition", label: "Quality of competition", weight: 20 },
  { id: "championship", label: "Championship accomplishment", weight: 20 },
  { id: "postseason", label: "Peak performance / postseason", weight: 15 },
  { id: "underlying-quality", label: "Underlying team quality", weight: 10 },
  { id: "weaknesses", label: "Weaknesses, close calls or losses", weight: 5 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const CFB_QB_CAREER_RUBRIC = [
  { id: "peak", label: "Peak college dominance", weight: 25 },
  { id: "production-efficiency", label: "Era-adjusted production and efficiency", weight: 20 },
  { id: "team", label: "Team accomplishment", weight: 20 },
  { id: "awards", label: "Heisman / All-America / major recognition", weight: 15 },
  { id: "postseason", label: "Championship / postseason performance", weight: 10 },
  { id: "longevity-context", label: "Longevity, consistency and context", weight: 10 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const CFB_HEAD_COACH_CAREER_RUBRIC = [
  { id: "championships", label: "Championship accomplishment", weight: 25 },
  { id: "sustained-contention", label: "Sustained winning and contention", weight: 25 },
  { id: "peak-teams", label: "Peak team quality", weight: 20 },
  { id: "program-building", label: "Program building / inherited-context value", weight: 10 },
  { id: "longevity", label: "Longevity and adaptability", weight: 10 },
  { id: "influence", label: "Development / strategic influence", weight: 10 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const CFB_PROGRAM_RUBRIC = [
  { id: "championships", label: "National championships", weight: 25 },
  { id: "sustained-contention", label: "Sustained top-level contention", weight: 25 },
  { id: "wins-conference", label: "Win performance and conference success", weight: 15 },
  { id: "peak-seasons", label: "Peak seasons", weight: 15 },
  { id: "talent", label: "NFL / elite-talent production", weight: 10 },
  { id: "resilience", label: "Longevity and resilience across coaches / eras", weight: 10 },
] as const satisfies readonly FootballComparisonRubricComponent[];

const CFB_PROGRAM_ERA_RUBRIC = [
  { id: "championships", label: "National championships", weight: 25 },
  { id: "title-appearances", label: "Title-game / CFP appearances", weight: 15 },
  { id: "sustained-dominance", label: "Sustained dominance", weight: 20 },
  { id: "peak-teams", label: "Quality of peak teams", weight: 15 },
  { id: "conference-control", label: "Conference control", weight: 10 },
  { id: "duration", label: "Duration", weight: 10 },
  { id: "consistency", label: "Week-to-week consistency", weight: 5 },
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
  "nfl-tight-ends": {
    packId: "nfl-tight-ends",
    contentClass: "comparative",
    methodologyVersion: "nfl-te-career-v1",
    question: "How great was this player's NFL tight end career?",
    scope: "NFL tight end careers only; balance receiving, two-way positional value, peak, awards, postseason impact, and longevity.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: NFL_REVIEW_SUMMARY,
    rubric: NFL_TE_CAREER_RUBRIC,
  },
  "nfl-defensive-players": {
    packId: "nfl-defensive-players",
    contentClass: "comparative",
    methodologyVersion: "nfl-defensive-career-v1",
    question: "How great was this player's NFL defensive career?",
    scope: "Cross-position defensive careers; compare impact relative to position and era rather than directly equating sacks, interceptions, tackles, or other position-specific counting stats.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: NFL_REVIEW_SUMMARY,
    rubric: NFL_DEFENSIVE_CAREER_RUBRIC,
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
  "nfl-qb-seasons": {
    packId: "nfl-qb-seasons",
    contentClass: "comparative",
    methodologyVersion: "nfl-qb-season-v1",
    question: "How great was this quarterback's specific NFL season?",
    scope: "Judge only the named NFL season; era-adjust production and efficiency, and do not let career reputation change the season grade.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: NFL_REVIEW_SUMMARY,
    rubric: PLAYER_SEASON_RUBRIC,
  },
  "nfl-team-seasons": {
    packId: "nfl-team-seasons",
    contentClass: "comparative",
    methodologyVersion: "nfl-team-season-v1",
    question: "How great was this specific NFL team in this specific season?",
    scope: "Judge only the named NFL team-season; record alone does not decide the grade, and dominant non-champions may outrank weaker champions.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: NFL_REVIEW_SUMMARY,
    rubric: TEAM_SEASON_RUBRIC,
  },
  "college-quarterbacks": {
    packId: "college-quarterbacks",
    contentClass: "comparative",
    methodologyVersion: "cfb-qb-career-v1",
    question: "How great was this quarterback's college football career?",
    scope: "College performance only; do not use NFL outcomes. One-year college careers may still rate at the top if the college peak and accomplishment justify it.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: CFB_REVIEW_SUMMARY,
    rubric: CFB_QB_CAREER_RUBRIC,
  },
  "college-head-coaches": {
    packId: "college-head-coaches",
    contentClass: "comparative",
    methodologyVersion: "cfb-head-coach-career-v1",
    question: "How great was this coach's college football head-coaching career?",
    scope: "FBS/major-college head-coaching careers; championships and actual results lead, with program-building and inherited context used as bounded adjustments rather than excuses.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: CFB_REVIEW_SUMMARY,
    rubric: CFB_HEAD_COACH_CAREER_RUBRIC,
  },
  "college-programs": {
    packId: "college-programs",
    contentClass: "comparative",
    methodologyVersion: "cfb-program-since-2000-v1",
    question: "How great has this college football program been since 2000?",
    scope: "Program achievement from the 2000 season through the completed 2025 season; weigh championships, sustained contention, conference success, peak seasons, talent production, and resilience across eras.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: CFB_REVIEW_SUMMARY,
    rubric: CFB_PROGRAM_RUBRIC,
  },
  "college-program-eras": {
    packId: "college-program-eras",
    contentClass: "comparative",
    methodologyVersion: "cfb-program-era-v1",
    question: "How great was this explicitly bounded college football program era?",
    scope: "Judge only the seasons named in the era label; a dynasty, stable contender run, or famous down era is graded as that bounded run rather than the program's full history.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: CFB_REVIEW_SUMMARY,
    rubric: CFB_PROGRAM_ERA_RUBRIC,
  },
  "college-team-seasons": {
    packId: "college-team-seasons",
    contentClass: "comparative",
    methodologyVersion: "cfb-team-season-v1",
    question: "How great was this specific college football team in this specific season?",
    scope: "Judge only the named team-season; weigh dominance, competition, championship accomplishment, peak/postseason form, underlying team quality, and weaknesses or losses.",
    evidenceStatus: "reviewed",
    evidenceRequirements: EVIDENCE_REQUIREMENTS,
    evidenceCutoff: "through-2025-season",
    evidenceSummary: CFB_REVIEW_SUMMARY,
    rubric: TEAM_SEASON_RUBRIC,
  },
} as const satisfies Record<FootballRankFivePackId, FootballComparisonContract>;

export function getFootballComparisonContract(packId: FootballRankFivePackId): FootballComparisonContract {
  return footballComparisonContracts[packId];
}
