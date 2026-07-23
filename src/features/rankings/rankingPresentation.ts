import { canonicalRankingInputs } from "./data/rankingInputs";

const presentationBySlug = new Map(
  canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, fighter.presentation]),
);

export function watchMomentFor(slug: string) {
  const presentation = presentationBySlug.get(slug);
  if (!presentation) throw new Error(`Missing ranking presentation metadata for ${slug}.`);
  return presentation.watchUrl;
}
