import { canonicalRankingInputs } from "./data/rankingInputs";

const presentationBySlug = new Map(
  canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, fighter.presentation]),
);

const pinnedV1ProfileMetadata: Partial<Record<string, { nickname?: string; signatureFightUrl?: string }>> = {
  "jon-jones": { nickname: "Bones", signatureFightUrl: "https://www.youtube.com/watch?v=QF9R3K87L04" },
};

export function watchMomentFor(slug: string) {
  const presentation = presentationBySlug.get(slug);
  if (!presentation) throw new Error(`Missing ranking presentation metadata for ${slug}.`);
  return presentation.watchUrl;
}

export function nicknameFor(slug: string) {
  return pinnedV1ProfileMetadata[slug]?.nickname ?? null;
}

export function signatureFightFor(slug: string) {
  return pinnedV1ProfileMetadata[slug]?.signatureFightUrl ?? null;
}
