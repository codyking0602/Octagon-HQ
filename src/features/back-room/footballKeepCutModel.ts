import {
  OFFICIAL_COMPARISON_GRADING_RULES,
} from "../play/officialScoreContract";
import {
  createReplaySeed,
  seededLineupRandom,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  buildFootballKeepCutBoard,
  footballKeepCutBoardIsCompetitive,
  footballKeepCutBoardStyleForSeed,
  FOOTBALL_KEEP_CUT_BOARD_STYLES,
} from "./footballComparisonGeneration";
import {
  footballComparisonCategorySpecs,
  footballComparisonEligibilityQuery,
} from "./footballComparisonAuthority";
import {
  footballRankFivePacks,
  getFootballRankFivePack,
  type FootballRankFiveItem,
  type FootballRankFivePackId,
} from "./footballRankFivePlayableModel";
import type { FootballSubjectQuery } from "./footballSubjectRegistry";

export const FOOTBALL_KEEP_CUT_GAME_ID = "football-keep-cut";

export type FootballKeepCutPackId = FootballRankFivePackId;

export interface FootballKeepCutPack {
  id: FootballKeepCutPackId;
  name: string;
  prompt: string;
  intro: string;
  items: readonly FootballRankFiveItem[];
}

export interface FootballKeepCutRun {
  pack: FootballKeepCutPack;
  lineup: FootballRankFiveItem[];
  identity: PlayLineupIdentity;
}

export interface FootballKeepCutResult {
  kept: FootballRankFiveItem[];
  cut: FootballRankFiveItem[];
  topFour: FootballRankFiveItem[];
  correctComparisons: number;
  topFourKept: number;
  score: number;
  label: string;
}

const BOARD_SIZE = 8;
const KEEP_COUNT = 4;

export {
  footballKeepCutBoardIsCompetitive,
  footballKeepCutBoardStyleForSeed,
  FOOTBALL_KEEP_CUT_BOARD_STYLES,
};

/** Keep/Cut exposes the shared comparison category without owning a second category map. */
export function footballKeepCutCategoryQuery(packId: FootballKeepCutPackId): FootballSubjectQuery {
  const {
    recognizabilityTiers: _recognizabilityTiers,
    casualEligible: _casualEligible,
    includeProjectedSourceSubjects: _includeProjectedSourceSubjects,
    includeProjectedCanonicalRecognition: _includeProjectedCanonicalRecognition,
    ...categoryQuery
  } = footballComparisonCategorySpecs[packId].query;
  return categoryQuery;
}

/** The canonical comparison authority owns recognizability and projected-depth eligibility. */
export function footballKeepCutEligibilityQuery(packId: FootballKeepCutPackId): FootballSubjectQuery {
  return footballComparisonEligibilityQuery(packId);
}

function keepCutItemsFromCanonicalLedger(packId: FootballKeepCutPackId) {
  const items = getFootballRankFivePack(packId).items;
  if (items.length < BOARD_SIZE) {
    throw new Error(`Football Keep 4, Cut 4 pack ${packId} has only ${items.length} deep canonical comparison subjects.`);
  }
  return items;
}

/**
 * Live Keep/Cut packs consume the same deep canonical comparison pool as Blind Rank.
 * The reviewed Rank Five catalog is calibration only and is not the membership source.
 */
export const footballKeepCutPacks: readonly FootballKeepCutPack[] = footballRankFivePacks.map((pack) => ({
  id: pack.id,
  name: pack.name,
  prompt: `Keep four from ${pack.name}. Cut four.`,
  intro: "Eight names arrive one at a time. Every Keep/Cut call locks before the next reveal.",
  items: keepCutItemsFromCanonicalLedger(pack.id),
}));

export function getFootballKeepCutPack(packId: FootballKeepCutPackId) {
  const pack = footballKeepCutPacks.find((row) => row.id === packId);
  if (!pack) throw new Error(`Unsupported Football Keep 4, Cut 4 pack: ${packId}`);
  return pack;
}

export function buildFootballKeepCutLineup(packId: FootballKeepCutPackId, seed: string) {
  return buildFootballKeepCutBoard(getFootballKeepCutPack(packId).items, packId, seed).items;
}

export function footballKeepCutPackForSeed(seed: string, exclude?: FootballKeepCutPackId) {
  const candidates = exclude && footballKeepCutPacks.length > 1
    ? footballKeepCutPacks.filter((pack) => pack.id !== exclude)
    : [...footballKeepCutPacks];
  const random = seededLineupRandom(FOOTBALL_KEEP_CUT_GAME_ID, "pack", seed);
  return candidates[Math.floor(random() * candidates.length)]!;
}

export function createFootballKeepCutRun(packId: FootballKeepCutPackId): FootballKeepCutRun {
  const pack = getFootballKeepCutPack(packId);
  const validItemIds = new Set(pack.items.map((item) => item.id));
  const selected = selectReplayLineup({
    gameId: FOOTBALL_KEEP_CUT_GAME_ID,
    scopeId: packId,
    lineupSize: BOARD_SIZE,
    attempts: 12,
    validItemIds,
    build: (seed) => {
      const lineup = buildFootballKeepCutLineup(packId, seed);
      return { value: lineup, itemIds: lineup.map((item) => item.id) };
    },
  });
  return { pack, lineup: selected.value, identity: selected.identity };
}

export function createRandomFootballKeepCutRun(exclude?: FootballKeepCutPackId) {
  const seed = createReplaySeed(`${FOOTBALL_KEEP_CUT_GAME_ID}-pack`);
  const pack = footballKeepCutPackForSeed(seed, exclude);
  return createFootballKeepCutRun(pack.id);
}

export function footballKeepCutScoreLabel(score: number) {
  if (score >= 90) return "FRANCHISE MODE";
  if (score >= 78) return "STRONG FRONT OFFICE";
  if (score >= 62) return "DEFENSIBLE";
  if (score >= 45) return "TOUGH ROOM";
  return "BACK TO THE FILM";
}

export function scoreFootballKeepCutSelection(
  board: readonly FootballRankFiveItem[],
  keptIds: readonly string[],
): FootballKeepCutResult {
  if (board.length !== BOARD_SIZE || new Set(board.map((item) => item.id)).size !== BOARD_SIZE) {
    throw new Error("Football Keep/Cut scoring requires one unique eight-item board.");
  }
  if (keptIds.length !== KEEP_COUNT || new Set(keptIds).size !== KEEP_COUNT) {
    throw new Error("Football Keep/Cut scoring requires exactly four kept items.");
  }
  const boardIds = new Set(board.map((item) => item.id));
  if (keptIds.some((id) => !boardIds.has(id))) {
    throw new Error("Football Keep/Cut selections must come from the active board.");
  }

  const keptSet = new Set(keptIds);
  const kept = board.filter((item) => keptSet.has(item.id));
  const cut = board.filter((item) => !keptSet.has(item.id));
  const rules = OFFICIAL_COMPARISON_GRADING_RULES["keep-cut"];
  let correctComparisons = 0;

  for (const keptItem of kept) {
    for (const cutItem of cut) {
      if (keptItem.rating >= cutItem.rating - rules.ratingTieTolerance) correctComparisons += 1;
    }
  }

  const score = Math.max(0, Math.min(100, Math.round(
    correctComparisons * rules.normalizedPointsPerComparison,
  )));
  const topFour = [...board]
    .sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id))
    .slice(0, KEEP_COUNT);
  const topFourIds = new Set(topFour.map((item) => item.id));

  return {
    kept,
    cut,
    topFour,
    correctComparisons,
    topFourKept: kept.filter((item) => topFourIds.has(item.id)).length,
    score,
    label: footballKeepCutScoreLabel(score),
  };
}
