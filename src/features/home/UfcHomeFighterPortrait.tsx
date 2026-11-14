import { useState } from "react";
import { FighterPhoto } from "../rankings/FighterPhoto";
import type { RankingFighter } from "../rankings/rankingModel";
import { UFC_HOME_PORTRAIT_SLUGS } from "./ufcHomePortraitSlugs";

/** Independently sourced Home-only ESPN headshots; never replace canonical ranked thumbnails. */
export const UFC_HOME_PORTRAIT_PROOFS: ReadonlySet<string> = new Set(UFC_HOME_PORTRAIT_SLUGS);

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
