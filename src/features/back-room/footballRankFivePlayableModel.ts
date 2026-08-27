import {
  createReplaySeed,
  seededLineupRandom,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import { buildFootballComparisonCandidatePool } from "./footballComparisonAuthority";
import { buildFootballBlindRankBoard } from "./footballComparisonGeneration";
import {
  FOOTBALL_RANK_FIVE_GAME_ID,
  footballRankFivePacks as footballReviewedRankFivePacks,
  type FootballRankFiveItem,
  type FootballRankFivePack,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";

export {
  FOOTBALL_RANK_FIVE_GAME_ID,
  type FootballLeague,
  type FootballRankFiveItem,
  type FootballRankFivePack,
  type FootballRankFivePackId,
  type FootballRankFiveRun,
} from "./footballRankFiveModel";

/**
 * Runtime Blind Rank packs. The legacy Rank Five catalog is calibration/editorial input only;
 * actual membership starts from the deep canonical comparison authority.
 */
export const footballRankFivePacks: readonly FootballRankFivePack[] = footballReviewedRankFivePacks.map((pack) => ({
  ...pack,
  items: buildFootballComparisonCandidatePool(pack.id, pack.items),
}));

export function getFootballReviewedRankFivePack(packId: FootballRankFivePackId) {
  const pack = footballReviewedRankFivePacks.find((row) => row.id === packId);
  if (!pack) throw new Error(`Unsupported Football Rank 5 calibration pack: ${packId}`);
  return pack;
}

export function getFootballRankFivePack(packId: FootballRankFivePackId) {
  const pack = footballRankFivePacks.find((row) => row.id === packId);
  if (!pack) throw new Error(`Unsupported Football Rank 5 pack: ${packId}`);
  return pack;
}

export function footballRankFivePackForSeed(
  seed: string,
  exclude?: FootballRankFivePackId,
) {
  const candidates = exclude && footballRankFivePacks.length > 1
    ? footballRankFivePacks.filter((pack) => pack.id !== exclude)
    : [...footballRankFivePacks];
  const random = seededLineupRandom(FOOTBALL_RANK_FIVE_GAME_ID, "pack", seed);
  return candidates[Math.floor(random() * candidates.length)]!;
}

export function buildFootballRankFiveLineup(
  packId: FootballRankFivePackId,
  seed: string,
) {
  const pack = getFootballRankFivePack(packId);
  return buildFootballBlindRankBoard(pack.items, packId, seed).items;
}

export interface FootballPlayableRankFiveRun {
  pack: FootballRankFivePack;
  lineup: FootballRankFiveItem[];
  identity: PlayLineupIdentity;
}

export function createFootballRankFiveRun(packId: FootballRankFivePackId): FootballPlayableRankFiveRun {
  const pack = getFootballRankFivePack(packId);
  const validItemIds = new Set(pack.items.map((item) => item.id));
  const selected = selectReplayLineup({
    gameId: FOOTBALL_RANK_FIVE_GAME_ID,
    scopeId: packId,
    lineupSize: 5,
    attempts: 12,
    validItemIds,
    build: (seed) => {
      const lineup = buildFootballRankFiveLineup(packId, seed);
      return { value: lineup, itemIds: lineup.map((item) => item.id) };
    },
  });
  return { pack, lineup: selected.value, identity: selected.identity };
}

export function createRandomFootballRankFiveRun(exclude?: FootballRankFivePackId) {
  const packSeed = createReplaySeed(`${FOOTBALL_RANK_FIVE_GAME_ID}-pack`);
  const pack = footballRankFivePackForSeed(packSeed, exclude);
  return createFootballRankFiveRun(pack.id);
}
