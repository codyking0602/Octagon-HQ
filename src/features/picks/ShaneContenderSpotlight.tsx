import { shanesWatchlist, type ShaneWatchFighter } from "../home/shanesWatchlist";
import type { PickBout } from "./picksModel";
import "../../styles/picks-shane-contender.css";

// The UFC importer uses "abdulrakhman"; Shane's existing prospect and
// canonical fighter assets use "abdul-rakhman". Preserve that identity.
export function shaneContenderForSlug(slug: string): ShaneWatchFighter | null {
  const canonical = slug === "abdulrakhman-yakhyaev" ? "abdul-rakhman-yakhyaev" : slug;
  return shanesWatchlist.fighters.find((fighter) => fighter.id === canonical) ?? null;
}

export function shaneContendersForBout(bout: PickBout): ShaneWatchFighter[] {
  const fighterSlugs = new Set([bout.redFighterSlug, bout.blueFighterSlug]);
  return shanesWatchlist.fighters.filter((fighter) => fighterSlugs.has(fighter.id)
    || (fighter.id === "abdul-rakhman-yakhyaev" && fighterSlugs.has("abdulrakhman-yakhyaev")));
}

export function ShaneContenderBadge({ fighters }: { fighters: ShaneWatchFighter[] }) {
  if (!fighters.length) return null;

  return (
    <span className="shane-contender-badges" aria-label="Shane King’s Contender Series fighters">
      {fighters.map((fighter) => (
        <em className="shane-contender-badge" key={fighter.id}>
          SHANE’S CONTENDER SERIES · #{fighter.rank}
        </em>
      ))}
    </span>
  );
}

export function ShaneContenderSpotlightSection({ fighters }: { fighters: ShaneWatchFighter[] }) {
  if (!fighters.length) return null;

  return (
    <section className="main-event-spotlight__shane" aria-label="Shane King’s Contender Series">
      {fighters.map((fighter) => (
        <article className="main-event-spotlight__shane-fighter" key={fighter.id}>
          <span>SHANE’S CONTENDER SERIES · #{fighter.rank}</span>
          <h3>{fighter.name}</h3>
          <p>{fighter.whyOnBoard}</p>
          <a href={`/fighters-to-watch#${fighter.id}`}>VIEW SHANE’S SCOUTING PROFILE →</a>
        </article>
      ))}
    </section>
  );
}
