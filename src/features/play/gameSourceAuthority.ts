export type HqGameSport = "ufc" | "football";

export type HqGameMechanic =
  | "find-the-leader"
  | "wavelength"
  | "blind-resume"
  | "hit-the-number"
  | "blind-rank-five"
  | "keep-four-cut-four"
  | "twenty-questions"
  | "who-am-i"
  | "auction"
  | "draft-room";

export type HqGameSourceClass =
  | "factual"
  | "subjective-calibration"
  | "comparison"
  | "hybrid"
  | "server-strategic";

export type HqGameEligibilityRule =
  | "metric-fact-required"
  | "catalog-entry-required"
  | "comparison-rating-required"
  | "comparison-and-reveal-evidence-required"
  | "predicate-depth-required"
  | "clue-depth-required"
  | "server-nomination-required"
  | "mode-grade-required";

export interface HqGameSourceContract {
  sport: HqGameSport;
  mechanic: HqGameMechanic;
  status: "live" | "future";
  sourceClass: HqGameSourceClass;
  factualOwner: string | null;
  comparisonOwner: string | null;
  calibrationOwner: string | null;
  runtimeOwner: string;
  eligibility: HqGameEligibilityRule;
  missingEvidence: "exclude";
}

const contract = (
  value: Omit<HqGameSourceContract, "missingEvidence">,
): HqGameSourceContract => ({ ...value, missingEvidence: "exclude" });

/**
 * Canonical Games source/eligibility contract.
 *
 * This is an ownership map, not a data provider. Games continue to read their
 * existing factual, comparison, calibration and server owners directly. The
 * contract exists so a mechanic cannot silently add a fallback dataset or a
 * second rating path when canonical evidence is incomplete.
 */
export const HQ_GAME_SOURCE_CONTRACTS: readonly HqGameSourceContract[] = [
  contract({
    sport: "ufc",
    mechanic: "find-the-leader",
    status: "live",
    sourceClass: "factual",
    factualOwner: "src/features/rankings/data/rankingInputs.ts + src/features/play/ufcCareerStats.ts",
    comparisonOwner: null,
    calibrationOwner: null,
    runtimeOwner: "src/features/play/findLeaderEngine.ts",
    eligibility: "metric-fact-required",
  }),
  contract({
    sport: "ufc",
    mechanic: "wavelength",
    status: "live",
    sourceClass: "subjective-calibration",
    factualOwner: null,
    comparisonOwner: null,
    calibrationOwner: "src/features/play/wavelengthCatalog.ts",
    runtimeOwner: "src/features/play/wavelengthEngine.ts",
    eligibility: "catalog-entry-required",
  }),
  contract({
    sport: "ufc",
    mechanic: "blind-resume",
    status: "live",
    sourceClass: "hybrid",
    factualOwner: "src/features/rankings/data/rankingInputs.ts",
    comparisonOwner: "src/features/rankings/rankingModel.ts via src/features/play/playFighterPool.ts",
    calibrationOwner: null,
    runtimeOwner: "src/features/play/blindResumeEngine.ts + src/features/play/blindResumeV3.ts",
    eligibility: "comparison-and-reveal-evidence-required",
  }),
  contract({
    sport: "ufc",
    mechanic: "hit-the-number",
    status: "live",
    sourceClass: "factual",
    factualOwner: "src/features/rankings/data/rankingInputs.ts + src/features/play/ufcCareerStats.ts",
    comparisonOwner: null,
    calibrationOwner: null,
    runtimeOwner: "src/features/play/hitTheNumberEngine.ts",
    eligibility: "metric-fact-required",
  }),
  contract({
    sport: "ufc",
    mechanic: "blind-rank-five",
    status: "live",
    sourceClass: "comparison",
    factualOwner: null,
    comparisonOwner: "src/features/play/playFighterPool.ts",
    calibrationOwner: "src/features/play/playFighterRatings.ts for approved Play-only ratings",
    runtimeOwner: "src/features/play/blindRankEngine.ts",
    eligibility: "comparison-rating-required",
  }),
  contract({
    sport: "ufc",
    mechanic: "keep-four-cut-four",
    status: "live",
    sourceClass: "comparison",
    factualOwner: null,
    comparisonOwner: "src/features/play/playFighterPool.ts",
    calibrationOwner: "src/features/play/playFighterRatings.ts for approved Play-only ratings",
    runtimeOwner: "src/features/play/keepCutEngine.ts",
    eligibility: "comparison-rating-required",
  }),
  contract({
    sport: "ufc",
    mechanic: "twenty-questions",
    status: "future",
    sourceClass: "factual",
    factualOwner: "src/features/rankings/data/rankingInputs.ts + src/features/play/ufcCareerStats.ts",
    comparisonOwner: null,
    calibrationOwner: null,
    runtimeOwner: "future 20 Questions UFC adapter",
    eligibility: "predicate-depth-required",
  }),
  contract({
    sport: "ufc",
    mechanic: "who-am-i",
    status: "future",
    sourceClass: "factual",
    factualOwner: "src/features/rankings/data/rankingInputs.ts + src/features/play/ufcCareerStats.ts",
    comparisonOwner: null,
    calibrationOwner: null,
    runtimeOwner: "future Who Am I UFC adapter",
    eligibility: "clue-depth-required",
  }),
  contract({
    sport: "ufc",
    mechanic: "auction",
    status: "live",
    sourceClass: "server-strategic",
    factualOwner: null,
    comparisonOwner: "existing canonical Auction backend grading owner",
    calibrationOwner: null,
    runtimeOwner: "src/features/play/auctionRepository.ts + canonical Supabase Auction RPCs",
    eligibility: "server-nomination-required",
  }),

  contract({
    sport: "football",
    mechanic: "find-the-leader",
    status: "live",
    sourceClass: "factual",
    factualOwner: "src/features/back-room/footballFactualStats.ts",
    comparisonOwner: null,
    calibrationOwner: null,
    runtimeOwner: "src/features/back-room/footballFindLeaderModel.ts",
    eligibility: "metric-fact-required",
  }),
  contract({
    sport: "football",
    mechanic: "wavelength",
    status: "live",
    sourceClass: "subjective-calibration",
    factualOwner: null,
    comparisonOwner: null,
    calibrationOwner: "src/features/back-room/footballWavelengthModel.ts",
    runtimeOwner: "src/features/back-room/footballWavelengthModel.ts + src/features/back-room/footballWavelengthSubjectAuthority.ts",
    eligibility: "catalog-entry-required",
  }),
  contract({
    sport: "football",
    mechanic: "blind-resume",
    status: "live",
    sourceClass: "hybrid",
    factualOwner: "src/features/back-room/footballFactualStats.ts",
    comparisonOwner: "src/features/back-room/footballComparisonAuthority.ts",
    calibrationOwner: null,
    runtimeOwner: "src/features/back-room/footballBlindResumeModel.ts",
    eligibility: "comparison-and-reveal-evidence-required",
  }),
  contract({
    sport: "football",
    mechanic: "hit-the-number",
    status: "live",
    sourceClass: "factual",
    factualOwner: "src/features/back-room/footballFactualStats.ts",
    comparisonOwner: null,
    calibrationOwner: null,
    runtimeOwner: "src/features/back-room/footballHitTheNumberModel.ts",
    eligibility: "metric-fact-required",
  }),
  contract({
    sport: "football",
    mechanic: "blind-rank-five",
    status: "live",
    sourceClass: "comparison",
    factualOwner: null,
    comparisonOwner: "src/features/back-room/footballComparisonAuthority.ts",
    calibrationOwner: "src/features/back-room/footballRankFiveModel.ts as authority-consumed reviewed calibration only",
    runtimeOwner: "src/features/back-room/footballRankFivePlayableModel.ts",
    eligibility: "comparison-rating-required",
  }),
  contract({
    sport: "football",
    mechanic: "keep-four-cut-four",
    status: "live",
    sourceClass: "comparison",
    factualOwner: null,
    comparisonOwner: "src/features/back-room/footballComparisonAuthority.ts",
    calibrationOwner: "src/features/back-room/footballRankFiveModel.ts as authority-consumed reviewed calibration only",
    runtimeOwner: "src/features/back-room/footballKeepCutModel.ts",
    eligibility: "comparison-rating-required",
  }),
  contract({
    sport: "football",
    mechanic: "twenty-questions",
    status: "future",
    sourceClass: "factual",
    factualOwner: "src/features/back-room/footballFactualStats.ts",
    comparisonOwner: null,
    calibrationOwner: null,
    runtimeOwner: "future 20 Questions Football adapter",
    eligibility: "predicate-depth-required",
  }),
  contract({
    sport: "football",
    mechanic: "who-am-i",
    status: "future",
    sourceClass: "factual",
    factualOwner: "src/features/back-room/footballFactualStats.ts",
    comparisonOwner: null,
    calibrationOwner: null,
    runtimeOwner: "future Who Am I Football adapter",
    eligibility: "clue-depth-required",
  }),
  contract({
    sport: "football",
    mechanic: "draft-room",
    status: "future",
    sourceClass: "server-strategic",
    factualOwner: "src/features/back-room/footballFactualStats.ts for objective mode facts",
    comparisonOwner: "src/features/back-room/footballComparisonAuthority.ts for greatness/category grading",
    calibrationOwner: null,
    runtimeOwner: "future Draft Room adapter over canonical Auction/challenge backend ownership",
    eligibility: "mode-grade-required",
  }),
] as const;

export function hqGameSourceContract(sport: HqGameSport, mechanic: HqGameMechanic) {
  return HQ_GAME_SOURCE_CONTRACTS.find((row) => row.sport === sport && row.mechanic === mechanic) ?? null;
}
