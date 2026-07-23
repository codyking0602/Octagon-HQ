import { round2, clamp } from "./math";
import type { RankingBoard } from "./schemas";

export interface BaseCategoryScores {
  championship: number;
  opponentQuality: number;
  primeDominance: number;
  longevity: number;
}

export interface RankingModifiers {
  apex: number;
  penalty: number;
  eraDepth: number;
}

export interface RankingWeights extends BaseCategoryScores {}

export interface OvrContract {
  floor: number;
  ceiling: number;
  curve: number;
  leaderOnly99: boolean;
  anchors: Record<RankingBoard, { floorScore: number; ceilingScore: number }>;
}

export interface RankingContract {
  categoryMax: number;
  weights: RankingWeights;
  ovr: OvrContract;
}

export interface RankingSeed<TMetadata = unknown> {
  fighter: string;
  board: RankingBoard;
  categories: BaseCategoryScores;
  modifiers: RankingModifiers;
  metadata?: TMetadata;
}

export interface WeightedScoreBreakdown extends RankingWeights {
  baseScore: number;
  apex: number;
  penalty: number;
  eraDepth: number;
  preEraDepthTotalScore: number;
  modifierScore: number;
  totalScore: number;
}

export interface RankingProjectionRow<TMetadata = unknown> extends RankingSeed<TMetadata> {
  weighted: RankingWeights;
  totals: {
    baseScore: number;
    preEraDepthTotalScore: number;
    modifierScore: number;
    totalScore: number;
  };
  tieBreakers: {
    totalScore: number;
    championship: number;
    opponentQuality: number;
    fighter: string;
  };
  rank: number;
  ovr: number;
}

export function calculateWeightedScore(
  categories: BaseCategoryScores,
  modifiers: RankingModifiers,
  contract: Pick<RankingContract, "categoryMax" | "weights">,
): WeightedScoreBreakdown {
  const weighted = {
    championship: round2(
      (Number(categories.championship || 0) / contract.categoryMax) *
        contract.weights.championship,
    ),
    opponentQuality: round2(
      (Number(categories.opponentQuality || 0) / contract.categoryMax) *
        contract.weights.opponentQuality,
    ),
    primeDominance: round2(
      (Number(categories.primeDominance || 0) / contract.categoryMax) *
        contract.weights.primeDominance,
    ),
    longevity: round2(
      (Number(categories.longevity || 0) / contract.categoryMax) *
        contract.weights.longevity,
    ),
  };
  const baseScore = round2(
    weighted.championship +
      weighted.opponentQuality +
      weighted.primeDominance +
      weighted.longevity,
  );
  const apex = round2(modifiers.apex);
  const penalty = round2(modifiers.penalty);
  const eraDepth = round2(modifiers.eraDepth);
  const preEraDepthTotalScore = round2(baseScore + apex + penalty);
  const modifierScore = round2(apex + penalty + eraDepth);
  const totalScore = round2(baseScore + modifierScore);

  return {
    ...weighted,
    baseScore,
    apex,
    penalty,
    eraDepth,
    preEraDepthTotalScore,
    modifierScore,
    totalScore,
  };
}

export function calculateOvr(
  totalScore: number,
  board: RankingBoard,
  rank: number,
  contract: OvrContract,
) {
  const anchors = contract.anchors[board] ?? contract.anchors.men;
  const range = anchors.ceilingScore - anchors.floorScore;
  if (range <= 0) return contract.floor;

  const normalized = clamp((totalScore - anchors.floorScore) / range, 0, 1);
  const curved = Math.pow(normalized, contract.curve);
  let ovr = clamp(
    Math.round(contract.floor + curved * (contract.ceiling - contract.floor)),
    contract.floor,
    contract.ceiling,
  );

  if (contract.leaderOnly99 && rank > 1 && ovr === contract.ceiling) {
    ovr = contract.ceiling - 1;
  }

  return ovr;
}

function compareRows<TMetadata>(
  left: Omit<RankingProjectionRow<TMetadata>, "rank" | "ovr">,
  right: Omit<RankingProjectionRow<TMetadata>, "rank" | "ovr">,
) {
  return (
    right.totals.totalScore - left.totals.totalScore ||
    right.categories.championship - left.categories.championship ||
    right.categories.opponentQuality - left.categories.opponentQuality ||
    left.fighter.localeCompare(right.fighter)
  );
}

export function buildRankingProjection<TMetadata>(
  seeds: readonly RankingSeed<TMetadata>[],
  contract: RankingContract,
) {
  const prepared = seeds.map((seed) => {
    const weighted = calculateWeightedScore(seed.categories, seed.modifiers, contract);
    return {
      ...seed,
      weighted: {
        championship: weighted.championship,
        opponentQuality: weighted.opponentQuality,
        primeDominance: weighted.primeDominance,
        longevity: weighted.longevity,
      },
      totals: {
        baseScore: weighted.baseScore,
        preEraDepthTotalScore: weighted.preEraDepthTotalScore,
        modifierScore: weighted.modifierScore,
        totalScore: weighted.totalScore,
      },
      tieBreakers: {
        totalScore: weighted.totalScore,
        championship: seed.categories.championship,
        opponentQuality: seed.categories.opponentQuality,
        fighter: seed.fighter,
      },
    };
  });

  function rankBoard(board: RankingBoard): RankingProjectionRow<TMetadata>[] {
    return prepared
      .filter((row) => row.board === board)
      .slice()
      .sort(compareRows)
      .map((row, index) => {
        const rank = index + 1;
        return {
          ...row,
          rank,
          ovr: calculateOvr(row.totals.totalScore, board, rank, contract.ovr),
        };
      });
  }

  const men = rankBoard("men");
  const women = rankBoard("women");

  return {
    rows: [...men, ...women],
    men,
    women,
  };
}
