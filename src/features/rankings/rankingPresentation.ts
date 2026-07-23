import { canonicalRankingInputs } from "./data/rankingInputs";

// Profile-only links and labels stay in pinned presentation metadata, never in the score model.
const presentationBySlug = new Map(
  canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, fighter.presentation]),
);

function presentationFor(slug: string) {
  const presentation = presentationBySlug.get(slug);
  if (!presentation) throw new Error(`Missing ranking presentation metadata for ${slug}.`);
  return presentation;
}

export function watchMomentFor(slug: string) {
  return presentationFor(slug).watchUrl;
}

export function signatureFightFor(slug: string) {
  return presentationFor(slug).signatureFightUrl;
}

export function nicknameFor(slug: string) {
  return presentationFor(slug).nickname;
}
