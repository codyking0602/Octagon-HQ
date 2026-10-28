import { Link } from "react-router-dom";
import { getFighter } from "../rankings/rankingModel";
import { shaneContenderForSlug } from "./ShaneContenderSpotlight";

/** Same canonical identity for the Picks board, HQ Rankings, and Shane's board.
 * Links deliberately live OUTSIDE the pick button so tapping never makes a pick. */
export function UfcFighterIdentityBadges({ slug }: { slug: string }) {
  const hq = getFighter(slug);
  const skcs = shaneContenderForSlug(slug);
  if (!hq && !skcs) return null;
  return (
    <span className="pick-fighter-identity" aria-label="Fighter profile links">
      {hq ? <Link className="pick-fighter-identity__hq" to={`/fighters/${encodeURIComponent(hq.slug)}`}
        aria-label={`Open ${hq.displayName} HQ Rankings profile, rank ${hq.rank}`}>HQ #{hq.rank}<span aria-hidden="true" className="pick-fighter-identity__chevron">›</span></Link> : null}
      {skcs ? <Link className="pick-fighter-identity__skcs" to={`/fighters-to-watch#${skcs.id}`}
        aria-label={`Open ${skcs.name} SKCS scouting profile, rank ${skcs.rank}`}>SKCS #{skcs.rank}<span aria-hidden="true" className="pick-fighter-identity__chevron">›</span></Link> : null}
    </span>
  );
}
