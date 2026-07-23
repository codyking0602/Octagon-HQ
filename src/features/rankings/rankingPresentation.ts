import { canonicalRankingInputs } from "./data/rankingInputs";

const presentationBySlug = new Map(
  canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, fighter.presentation]),
);

export interface ProfileWatchAction {
  label: string;
  url: string;
  source: "signature" | "watch-moment";
}

export function resolveProfileWatchAction(slug: string): ProfileWatchAction | null {
  const presentation = presentationBySlug.get(slug);
  if (!presentation) throw new Error(`Missing ranking presentation metadata for ${slug}.`);
  const signatureFightUrl = "signatureFightUrl" in presentation ? presentation.signatureFightUrl : null;
  if (signatureFightUrl) return { label: "Watch Signature Fight", url: signatureFightUrl, source: "signature" };
  if (presentation.watchUrl) return { label: presentation.watchLabel ?? "Watch Moment", url: presentation.watchUrl, source: "watch-moment" };
  return null;
}

export function watchMomentFor(slug: string) {
  const presentation = presentationBySlug.get(slug);
  if (!presentation) throw new Error(`Missing ranking presentation metadata for ${slug}.`);
  if (!presentation.watchUrl) throw new Error(`Missing watch URL for ${slug}.`);
  return presentation.watchUrl;
}
