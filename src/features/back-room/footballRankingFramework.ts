export const FOOTBALL_RANKING_FRAMEWORK_VERSION = "stage14-v1" as const;

export type FootballRankingSemantic =
  | "career-greatness"
  | "single-season-greatness"
  | "coach-greatness"
  | "program-franchise-greatness"
  | "bounded-era-greatness"
  | "team-season-greatness";

export type FootballRankingDimension =
  | "peak"
  | "sustained-excellence"
  | "longevity-tail"
  | "honors"
  | "postseason-team-accomplishment"
  | "contextual-strength";

export type FootballRankingDirection = "higher" | "lower";

export interface FootballRankingSemanticContract {
  semantic: FootballRankingSemantic;
  dimensionWeights: Readonly<Partial<Record<FootballRankingDimension, number>>>;
  minimumCoverage: number;
}

export interface FootballRankingEvidence {
  dimension: FootballRankingDimension;
  score: number;
  signalId?: string;
  weight?: number;
  confidence?: number;
}

export interface FootballRankingScoreSignal {
  signalId: string;
  dimension: FootballRankingDimension;
  weight: number;
}

export interface FootballRankingResult {
  version: typeof FOOTBALL_RANKING_FRAMEWORK_VERSION;
  semantic: FootballRankingSemantic;
  score: number;
  rating: number;
  coverage: number;
  confidence: number;
  status: "rated" | "low-confidence";
  dimensionScores: Readonly<Partial<Record<FootballRankingDimension, number>>>;
}

const contracts: Readonly<Record<FootballRankingSemantic, FootballRankingSemanticContract>> = {
  "career-greatness": { semantic: "career-greatness", dimensionWeights: { peak: 0.30, "sustained-excellence": 0.25, "longevity-tail": 0.15, honors: 0.15, "postseason-team-accomplishment": 0.05, "contextual-strength": 0.10 }, minimumCoverage: 0.50 },
  "single-season-greatness": { semantic: "single-season-greatness", dimensionWeights: { peak: 0.45, "sustained-excellence": 0.15, honors: 0.15, "postseason-team-accomplishment": 0.15, "contextual-strength": 0.10 }, minimumCoverage: 0.55 },
  "coach-greatness": { semantic: "coach-greatness", dimensionWeights: { peak: 0.20, "sustained-excellence": 0.25, "longevity-tail": 0.10, honors: 0.10, "postseason-team-accomplishment": 0.25, "contextual-strength": 0.10 }, minimumCoverage: 0.50 },
  "program-franchise-greatness": { semantic: "program-franchise-greatness", dimensionWeights: { peak: 0.15, "sustained-excellence": 0.25, "longevity-tail": 0.15, honors: 0.10, "postseason-team-accomplishment": 0.20, "contextual-strength": 0.15 }, minimumCoverage: 0.50 },
  "bounded-era-greatness": { semantic: "bounded-era-greatness", dimensionWeights: { peak: 0.20, "sustained-excellence": 0.30, "longevity-tail": 0.05, honors: 0.10, "postseason-team-accomplishment": 0.25, "contextual-strength": 0.10 }, minimumCoverage: 0.50 },
  "team-season-greatness": { semantic: "team-season-greatness", dimensionWeights: { peak: 0.35, "sustained-excellence": 0.20, honors: 0.10, "postseason-team-accomplishment": 0.25, "contextual-strength": 0.10 }, minimumCoverage: 0.55 },
} as const;

export const footballRankingSemanticContracts = contracts;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function scoreFootballAnchoredValue(value: number, anchorValues: readonly number[], direction: FootballRankingDirection = "higher") {
  if (anchorValues.length === 0) return 0.5;
  if (anchorValues.length === 1) {
    const equal = value === anchorValues[0] ? 0.5 : value > anchorValues[0] ? 1 : 0;
    return direction === "lower" ? 1 - equal : equal;
  }
  const sorted = [...anchorValues].sort((a, b) => a - b);
  const below = sorted.filter((candidate) => candidate < value).length;
  const equal = sorted.filter((candidate) => candidate === value).length;
  const rank = clamp01((below + Math.max(0, equal - 1) / 2) / (sorted.length - 1));
  return direction === "lower" ? 1 - rank : rank;
}

export function applyFootballRankingContextAdjustment(score: number, adjustment = 0) {
  return clamp01(score + Math.max(-0.15, Math.min(0.15, adjustment)));
}

function scoreFromProfile(
  evidence: readonly FootballRankingEvidence[],
  scoreSignals: readonly FootballRankingScoreSignal[],
) {
  const totalWeight = scoreSignals.reduce((sum, signal) => sum + Math.max(0, signal.weight), 0);
  if (totalWeight <= 0) return 0.5;

  const weightedScore = scoreSignals.reduce((sum, signal) => {
    const row = evidence.find((candidate) => candidate.signalId === signal.signalId);
    return sum + (row ? clamp01(row.score) : 0.5) * Math.max(0, signal.weight);
  }, 0);
  return weightedScore / totalWeight;
}

export function rateFootballRankingEvidence(
  semantic: FootballRankingSemantic,
  evidence: readonly FootballRankingEvidence[],
  scoreSignals: readonly FootballRankingScoreSignal[] = [],
): FootballRankingResult {
  const contract = contracts[semantic];
  const dimensionScores: Partial<Record<FootballRankingDimension, number>> = {};
  const dimensionConfidences: Partial<Record<FootballRankingDimension, number>> = {};

  for (const dimension of Object.keys(contract.dimensionWeights) as FootballRankingDimension[]) {
    const rows = evidence.filter((row) => row.dimension === dimension);
    if (rows.length === 0) continue;
    const signalWeight = rows.reduce((sum, row) => sum + Math.max(0, row.weight ?? 1), 0);
    if (signalWeight <= 0) continue;
    dimensionScores[dimension] = rows.reduce((sum, row) => sum + clamp01(row.score) * Math.max(0, row.weight ?? 1), 0) / signalWeight;
    dimensionConfidences[dimension] = rows.reduce((sum, row) => sum + clamp01(row.confidence ?? 1) * Math.max(0, row.weight ?? 1), 0) / signalWeight;
  }

  const contractRows = Object.entries(contract.dimensionWeights).flatMap(([dimension, weight]) => weight == null ? [] : [{ dimension: dimension as FootballRankingDimension, weight }]);
  const totalSemanticWeight = contractRows.reduce((sum, row) => sum + row.weight, 0);
  let coveredWeight = 0;
  let semanticWeightedScore = 0;
  let weightedConfidence = 0;

  for (const { dimension, weight } of contractRows) {
    const dimensionScore = dimensionScores[dimension];
    if (dimensionScore == null) {
      semanticWeightedScore += 0.5 * weight;
      continue;
    }
    coveredWeight += weight;
    semanticWeightedScore += dimensionScore * weight;
    weightedConfidence += (dimensionConfidences[dimension] ?? 1) * weight;
  }

  const coverage = totalSemanticWeight > 0 ? coveredWeight / totalSemanticWeight : 0;
  const semanticScore = totalSemanticWeight > 0 ? semanticWeightedScore / totalSemanticWeight : 0.5;
  const score = scoreSignals.length > 0 ? scoreFromProfile(evidence, scoreSignals) : semanticScore;
  const evidenceConfidence = coveredWeight > 0 ? weightedConfidence / coveredWeight : 0;
  const confidence = clamp01(coverage * evidenceConfidence);
  const rating = Math.max(35, Math.min(99, Math.round(35 + score * 64)));

  return { version: FOOTBALL_RANKING_FRAMEWORK_VERSION, semantic, score, rating, coverage, confidence, status: coverage >= contract.minimumCoverage ? "rated" : "low-confidence", dimensionScores };
}
