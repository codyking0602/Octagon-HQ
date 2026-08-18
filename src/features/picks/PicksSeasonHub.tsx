import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  groupRankLabel,
  pickWinPercentage,
  type PickHistory,
  type PickSeasonStanding,
} from "./picksModel";
import { LatestEventRecap } from "./LatestEventRecap";
import { resolvePicksDestination } from "./picksDestination";

function winPercentageLabel(correct: number, incorrect: number) {
  return `${pickWinPercentage(correct, incorrect).toFixed(1)}%`;
}

function aggregateFallbackStandings(history: PickHistory): PickSeasonStanding[] {
  const totals = new Map<string, Omit<PickSeasonStanding, "rank">>();

  history.events.forEach((event) => {
    event.groupResults.forEach((result) => {
      const key = result.profileId ?? `name:${result.displayName.trim().toLowerCase()}`;
      const current = totals.get(key) ?? {
        profileId: result.profileId ?? null,
        displayName: result.displayName,
        isCurrentUser: result.isCurrentUser,
        eventsEntered: 0,
        correct: 0,
        incorrect: 0,
        missing: 0,
        excluded: 0,
        basePoints: 0,
        lockBonus: 0,
        totalPoints: 0,
      };

      totals.set(key, {
        ...current,
        profileId: result.profileId ?? current.profileId,
        displayName: result.displayName,
        isCurrentUser: current.isCurrentUser || result.isCurrentUser,
        eventsEntered: current.eventsEntered + 1,
        correct: current.correct + result.correct,
        incorrect: current.incorrect + result.incorrect,
        missing: current.missing + result.missing,
        excluded: current.excluded + result.excluded,
        basePoints: current.basePoints + result.basePoints,
        lockBonus: current.lockBonus + result.lockBonus,
        totalPoints: current.totalPoints + result.totalPoints,
      });
    });
  });

  const ordered = Array.from(totals.values()).sort((left, right) => (
    right.totalPoints - left.totalPoints
    || left.displayName.localeCompare(right.displayName)
  ));

  let previousPoints: number | null = null;
  let previousRank = 0;
  return ordered.map((standing, index) => {
    const rank = previousPoints === standing.totalPoints ? previousRank : index + 1;
    previousPoints = standing.totalPoints;
    previousRank = rank;
    return { ...standing, rank };
  });
}

export function PicksSeasonHub({ history, loading }: { history: PickHistory; loading: boolean }) {
  const [searchParams] = useSearchParams();
  const archivedEventIds = useMemo(
    () => history.events.map((event) => event.eventId),
    [history.events],
  );
  const destination = useMemo(
    () => resolvePicksDestination(searchParams, archivedEventIds),
    [archivedEventIds, searchParams],
  );
  const targetEventId = destination.kind === "archived-event" ? destination.eventId : "";
  const recapRequested = destination.kind === "archived-event" && destination.recapRequested;
  const targetEvent = useMemo(
    () => history.events.find((event) => event.eventId === targetEventId) ?? null,
    [history.events, targetEventId],
  );
  const [activeTab, setActiveTab] = useState<"standings" | "events">(
    targetEventId ? "events" : "standings",
  );
  const [hubOpen, setHubOpen] = useState(Boolean(targetEventId));
  const hubRef = useRef<HTMLElement | null>(null);
  const standings = useMemo(() => {
    const canonicalStandings = history.seasonStandings ?? [];
    return canonicalStandings.length ? canonicalStandings : aggregateFallbackStandings(history);
  }, [history]);
  const currentStanding = standings.find((standing) => standing.isCurrentUser) ?? null;
  const season = history.season ?? new Date().getFullYear();
  const finish = currentStanding
    ? `${groupRankLabel(currentStanding.rank, standings)} OF ${standings.length}`
    : standings.length ? `— OF ${standings.length}` : "NO RESULTS";
  const record = currentStanding ?? history.summary;
  const latestEvent = history.events[0];
  const olderEvents = history.events.slice(1);
  const targetIsLatest = Boolean(latestEvent && latestEvent.eventId === targetEventId);

  useEffect(() => {
    if (!targetEventId) return;
    setActiveTab("events");
    setHubOpen(true);
  }, [targetEventId]);

  useEffect(() => {
    if (!targetEvent || !hubOpen || activeTab !== "events") return undefined;
    const frame = requestAnimationFrame(() => {
      hubRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      hubRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeTab, hubOpen, targetEvent]);

  if (loading && !history.events.length) {
    return (
      <section className="surface-card picks-state-card" aria-live="polite">
        <strong>Loading season standings…</strong>
      </section>
    );
  }

  if (!history.events.length) {
    return (
      <section className="surface-card picks-history-empty">
        <strong>No completed Picks events yet.</strong>
        <p>The group table and event archive will appear after the first scored card.</p>
      </section>
    );
  }

  return (
    <section
      ref={hubRef}
      className="picks-history picks-season-section"
      aria-labelledby="picks-season-title"
      aria-current={targetEvent ? "true" : undefined}
      tabIndex={targetEvent ? -1 : undefined}
    >
      <details
        className="surface-card picks-season-hub"
        open={hubOpen}
        onToggle={(toggleEvent) => setHubOpen(toggleEvent.currentTarget.open)}
      >
        <summary className="picks-season-hub__summary">
          <div className="picks-season-hub__identity">
            <span>{season} SEASON</span>
            <strong id="picks-season-title">{finish}</strong>
            <small>{record.correct}-{record.incorrect} · {winPercentageLabel(record.correct, record.incorrect)} WIN · {record.totalPoints} PTS</small>
          </div>
          <div className="picks-season-hub__meta">
            <span>{standings.length} {standings.length === 1 ? "PLAYER" : "PLAYERS"}</span>
            <em>STANDINGS &amp; EVENTS</em>
          </div>
        </summary>

        <div className="picks-season-hub__body">
          <div className="picks-season-tabs" role="tablist" aria-label="Picks season views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "standings"}
              className={activeTab === "standings" ? "is-active" : ""}
              onClick={() => setActiveTab("standings")}
            >
              STANDINGS
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "events"}
              className={activeTab === "events" ? "is-active" : ""}
              onClick={() => setActiveTab("events")}
            >
              EVENTS
            </button>
          </div>

          {activeTab === "standings" ? (
            <section className="picks-season-standings" role="tabpanel" aria-label="Group season standings">
              <div className="picks-season-panel-heading">
                <div>
                  <span>GROUP STANDINGS</span>
                  <strong>Season leaderboard</strong>
                </div>
                <small>{standings.length} PLAYERS · {history.events.length} EVENTS</small>
              </div>
              <div className="picks-season-standing-list">
                {standings.map((standing) => (
                  <article
                    className={standing.isCurrentUser ? "picks-season-standing is-current-user" : "picks-season-standing"}
                    key={standing.profileId ?? standing.displayName}
                  >
                    <span>{groupRankLabel(standing.rank, standings)}</span>
                    <div>
                      <strong>{standing.displayName}</strong>
                      <small>
                        {standing.correct}-{standing.incorrect} · {winPercentageLabel(standing.correct, standing.incorrect)} WIN
                        {standing.missing ? ` · ${standing.missing} MISSED` : ""}
                      </small>
                    </div>
                    <div>
                      <b>{standing.totalPoints} PTS</b>
                      <small>+{standing.lockBonus} LOCK · {standing.eventsEntered} {standing.eventsEntered === 1 ? "EVENT" : "EVENTS"}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="picks-season-events" role="tabpanel" aria-label="Completed event archive">
              <div className="picks-season-panel-heading">
                <div>
                  <span>EVENT ARCHIVE</span>
                  <strong>{history.events.length} COMPLETED {history.events.length === 1 ? "EVENT" : "EVENTS"}</strong>
                </div>
                <small>NEWEST FIRST</small>
              </div>
              {targetIsLatest && recapRequested ? (
                <LatestEventRecap event={latestEvent} requestedOpen />
              ) : (
                <LatestEventRecap event={latestEvent} />
              )}
              {olderEvents.length ? (
                <div className="picks-recap-list">
                  {olderEvents.map((event) => (
                    <LatestEventRecap
                      event={event}
                      requestedOpen={recapRequested && event.eventId === targetEventId}
                      key={event.eventId}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          )}
        </div>
      </details>
    </section>
  );
}
