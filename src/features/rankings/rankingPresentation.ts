import { canonicalRankingInputs } from "./data/rankingInputs";

const presentationBySlug = new Map(
  canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, fighter.presentation]),
);

export type ProfileWatchAction = {
  label: "Watch Signature Fight" | "Watch Moment";
  source: "signature" | "watchMoment";
  url: string;
};

export function resolveProfileWatchAction(slug: string): ProfileWatchAction | null {
  const presentation = presentationBySlug.get(slug);
  if (!presentation) throw new Error(`Missing ranking presentation metadata for ${slug}.`);

  if (presentation.signatureFightUrl) {
    return { label: "Watch Signature Fight", source: "signature", url: presentation.signatureFightUrl };
  }

  if (presentation.watchUrl) {
    return { label: "Watch Moment", source: "watchMoment", url: presentation.watchUrl };
  }

  return null;
}

export function watchMomentFor(slug: string) {
  const action = resolveProfileWatchAction(slug);
  if (!action) throw new Error(`Missing ranking watch metadata for ${slug}.`);
  return action.url;
}
