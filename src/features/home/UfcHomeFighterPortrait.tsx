import { useState } from "react";
import { FighterPhoto } from "../rankings/FighterPhoto";
import type { RankingFighter } from "../rankings/rankingModel";

/** Owner-approved Home-only portrait proofs; never replace the canonical thumbs. */
export const UFC_HOME_PORTRAIT_PROOFS = new Set([
  "ciryl-gane",
  "kayla-harrison",
  "amanda-nunes",
]);

export function UfcHomeFighterPortrait({ fighter }: { fighter: RankingFighter }) {
  const [failedSlug, setFailedSlug] = useState<string | null>(null);
  const homePath = UFC_HOME_PORTRAIT_PROOFS.has(fighter.slug)
    ? "/assets/fighters/" + fighter.slug + ".home.webp"
    : null;

  if (homePath && failedSlug !== fighter.slug) {
    return (
      <img
        className="fighter-photo ufc-fighter-spotlight__photo"
        src={homePath}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailedSlug(fighter.slug)}
      />
    );
  }

  return (
    <FighterPhoto
      key={fighter.slug}
      className="ufc-fighter-spotlight__photo"
      name={fighter.displayName}
      src={fighter.thumbUrl}
    />
  );
}
