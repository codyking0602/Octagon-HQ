import { Link } from "react-router-dom";
import { getFighter } from "../rankings/rankingModel";
import { shaneContenderForSlug } from "./ShaneContenderSpotlight";

/** Links are siblings of the pick buttons, never nested click targets. */
export function UfcFighterIdentityBadges({ slug }: { slug: string }) {
  const ranked = getFighter(slug);
  const contender = shaneContenderForSlug(slug);
  if (!ranked && !contender) return null;
  return (
    <nav className="pick-choice__identity-links" aria-label="Fighter profile links">
      {ranked ? <Link className="pick-choice__identity is-hq" to={`/fighters/${ranked.slug}`}
        aria-label={`Open ${ranked.name} HQ Rankings profile, ranked number ${ranked.rank}`}
        onClick={(event) => event.stopPropagation()}>HQ #{ranked.rank}</Link> : null}
      {contender ? <Link className="pick-choice__identity is-skcs"
        to={`/fighters-to-watch#${contender.id}`}
        aria-label={`Open ${contender.name} SKCS scouting profile, ranked number ${contender.rank}`}
        onClick={(event) => event.stopPropagation()}>SKCS #{contender.rank}</Link> : null}
    </nav>
  );
}
