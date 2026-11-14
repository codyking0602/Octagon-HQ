import { useEffect, useState } from "react";
import type { PickEvent, PickHistory } from "../picks/picksModel";
import type { RankingFighter } from "../rankings/rankingModel";
import { RankingSpotlightCard } from "./RankingSpotlightCard";
import { centralCalendarDay, rankedUfcEventDaySpotlights } from "./homeUfcEventSpotlightModel";

const ROTATION_MS = 9_000;

/** Show ranked fighters from today's published card; otherwise preserve the daily all-time spotlight. */
export function UfcEventDaySpotlight({
  event,
  history,
  fighters,
  fallback,
}: {
  event: PickEvent | null;
  history: PickHistory | null;
  fighters: readonly RankingFighter[];
  fallback: RankingFighter | null;
}) {
  const [centralDay, setCentralDay] = useState(() => centralCalendarDay(new Date()));
  const [activeIndex, setActiveIndex] = useState(0);

  // An open Home screen switches at midnight Central without needing a manual reload.
  useEffect(() => {
    const timer = window.setInterval(() => setCentralDay(centralCalendarDay(new Date())), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const featured = rankedUfcEventDaySpotlights(event, history, fighters, centralDay);
  const rotationKey = centralDay + "|" + featured.map((entry) => entry.fighter.slug).join("|");

  useEffect(() => setActiveIndex(0), [rotationKey]);
  useEffect(() => {
    if (featured.length <= 1) return undefined;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % featured.length), ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [rotationKey, featured.length]);

  const selected = featured.length ? featured[activeIndex % featured.length] : null;
  const fighter = selected?.fighter ?? fallback;
  if (!fighter) return null;

  return (
    <div className="ufc-event-day-spotlight" data-event-day={selected ? "true" : "false"}>
      <RankingSpotlightCard
        fighter={fighter}
        compact
        eventOpponent={selected?.opponentName}
        eventWeightClass={selected?.weightClass}
      />
      {featured.length > 1 ? (
        <div className="ufc-event-day-spotlight__pagination" role="group" aria-label="Event-day fighter spotlight rotation">
          {featured.map((entry, index) => (
            <button
              key={entry.fighter.slug}
              type="button"
              aria-label={"Show " + entry.fighter.displayName + " spotlight"}
              aria-pressed={index === activeIndex % featured.length}
              onClick={() => setActiveIndex(index)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
