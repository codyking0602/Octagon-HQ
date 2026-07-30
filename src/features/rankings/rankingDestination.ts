import { getFighter, type RankingFighter } from "./rankingModel";

export type RankingDestination =
  | { kind: "none" }
  | { kind: "fighter"; fighter: RankingFighter }
  | { kind: "comparison"; path: string };

function requestedFighter(value: string | null) {
  const slug = value?.trim();
  return slug ? getFighter(slug) : undefined;
}

/**
 * Lets the existing Rankings and Intelligence owners consume canonical links.
 * Invalid or incomplete targets remain on the normal Rankings screen.
 */
export function resolveRankingDestination(searchParams: URLSearchParams): RankingDestination {
  const left = requestedFighter(searchParams.get("compareLeft"));
  const right = requestedFighter(searchParams.get("compareRight"));

  if (left && right && left.slug !== right.slug) {
    const next = new URLSearchParams({
      mode: "compare",
      fighter: left.slug,
      opponent: right.slug,
    });
    return { kind: "comparison", path: `/intelligence?${next.toString()}` };
  }

  const fighter = requestedFighter(searchParams.get("fighter"));
  return fighter ? { kind: "fighter", fighter } : { kind: "none" };
}
