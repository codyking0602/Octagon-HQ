import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { allTime, type RankingFighter } from "../rankings/rankingModel";
import {
  playOnlyFighterRatings,
  PLAY_ONLY_RATING_METHODOLOGY_VERSION,
  projectRankedPlayRatings,
  type PlayGender,
} from "./playFighterRatings";

export type { PlayGender } from "./playFighterRatings";

export type BlindRankPackId =
  | "ufc-careers"
  | "all-careers"
  | "womens-careers"
  | "lightweight"
  | "welterweight"
  | "heavyweight"
  | "striking"
  | "wrestling-grappling";

export interface PlayFighter {
  id: string;
  name: string;
  gender: PlayGender;
  divisions: string[];
  mainEra: string;
  thumbUrl: string;
  profileUrl: string;
  model: RankingFighter | null;
  ratings: {
    career: number;
    striking: number;
    grappling: number;
  };
}

export interface RankedPlayFighter extends PlayFighter {
  model: RankingFighter;
}

export const PLAY_FIGHTER_RATING_OWNER_VERSION = "play-fighter-rating-owner-v1";
export const PLAY_FIGHTER_PLAY_ONLY_METHODOLOGY_VERSION = PLAY_ONLY_RATING_METHODOLOGY_VERSION;

const playOnlyFighters: readonly PlayFighter[] = playOnlyFighterRatings
  .filter((fighter) => fighter.review.status === "approved")
  .map((fighter) => ({
    id: fighter.id,
    name: fighter.name,
    gender: fighter.gender,
    divisions: [...fighter.divisions],
    mainEra: fighter.mainEra,
    thumbUrl: `/assets/fighters/${fighter.id}-thumb.webp`,
    profileUrl: "",
    model: null,
    ratings: { ...fighter.ratings },
  }));

const eraNameById = new Map(
  canonicalRankingInputs.filters.eras.map((era) => [era.id, era.name]),
);

function mainEraFor(name: string) {
  const membership = canonicalRankingInputs.filters.eraMembership[name];
  return membership ? eraNameById.get(membership.primary) ?? "—" : "—";
}

function divisionsFor(fighter: RankingFighter) {
  return [fighter.primaryDivision, ...fighter.secondaryDivision.split("/")]
    .map((division) => division.trim())
    .filter(Boolean);
}

export const rankedPlayFighters: readonly RankedPlayFighter[] = allTime.map((fighter) => ({
  id: fighter.slug,
  name: fighter.name,
  gender: fighter.board,
  divisions: divisionsFor(fighter),
  mainEra: mainEraFor(fighter.name),
  thumbUrl: fighter.thumbUrl,
  profileUrl: fighter.profileUrl,
  model: fighter,
  ratings: projectRankedPlayRatings(fighter),
}));

const rankedIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));

export const playFighters: readonly PlayFighter[] = [
  ...rankedPlayFighters,
  ...playOnlyFighters.filter((fighter) => !rankedIds.has(fighter.id)),
];

const byId = new Map(playFighters.map((fighter) => [fighter.id, fighter]));

export function getPlayFighter(id: string) {
  return byId.get(id);
}

export function blindRankRating(fighter: PlayFighter, packId: BlindRankPackId) {
  switch (packId) {
    case "striking":
      return fighter.ratings.striking;
    case "wrestling-grappling":
      return fighter.ratings.grappling;
    case "ufc-careers":
    case "all-careers":
    case "womens-careers":
    case "lightweight":
    case "welterweight":
    case "heavyweight":
      return fighter.ratings.career;
    default:
      throw new Error(`Unsupported Blind Rank category: ${String(packId)}`);
  }
}

export function blindRankPool(packId: BlindRankPackId) {
  return playFighters.filter((fighter) => {
    if (packId === "ufc-careers") return fighter.gender === "men";
    if (packId === "womens-careers") return fighter.gender === "women";
    if (packId === "lightweight") return fighter.gender === "men" && fighter.divisions.includes("Lightweight");
    if (packId === "welterweight") return fighter.gender === "men" && fighter.divisions.includes("Welterweight");
    if (packId === "heavyweight") return fighter.gender === "men" && fighter.divisions.includes("Heavyweight");
    return true;
  });
}
