import { useMemo, useState } from "react";
import {
  groupRankLabel,
  mainCardFightLabel,
  pickWinPercentage,
  type PickHistory,
  type PickHistoryBout,
  type PickHistoryEvent,
  type PickHistoryRecord,
  type PickSeasonStanding,
} from "./picksModel";
import { GroupPickReveal } from "./GroupPickReveal";

interface BoutResultView {
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  resultStatus?: PickHistoryBout["resultStatus"];
  winnerFighterSlug: string | null;
  includedInPicks?: boolean;
}

function completedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function fighterName(bout: BoutResultView, slug: string | null) {
  if (!slug) return "No pick";
  if (slug === bout.redFighterSlug) return bout.redFighterName;
  if (slug === bout.blueFighterSlug) return bout.blueFighterName;
  return "Unknown fighter";
}

function officialResult(bout: BoutResultView) {
  if (bout.includedInPicks === false) return "Removed from Picks";
  if (bout.resultStatus === "red_win" || bout.resultStatus === "blue_win") {
    return fighterName(bout, bout.winnerFighterSlug);
  }
  if (bout.resultStatus === "draw") return "Draw";
  if (bout.resultStatus === "no_contest") return "No contest";
  if (bout.resultStatus === "cancelled") return "Cancelled";
  return "Pending";
}

function verdictLabel(verdict: PickHistoryBout["verdict"]) {
  if (verdict === "correct") return "Correct";
  if (verdict === "incorrect") return "Incorrect";
  if (verdict === "missing") return "No pick";
  if (verdict === "excluded") return "Excluded";
  return "Pending";
}

function recordNote(record: PickHistoryRecord) {
  const details = [];
  if (record.missing) details.push(`${record.missing} missing`);
  if (record.excluded) details.push(`${record.excluded} excluded`);
  return details.length ? details.join(" · ") : null;
}

function winPercentageLabel(correct: number, incorrect: number) {
  return `${pickWinPercentage(correct, incorrect).toFixed(1)}%`;
}

function aggregateFallbackStandings(history: PickHistory): PickSeasonStanding[] {
  const totals = new Map<string, Omit<PickSeasonStanding, "rank">>();

  history.events.forEach((event) => {
    event.groupResults.forEach((result) => {
      const key = result.profileId ?? `name:${result.displayName.trim().toLowerCase()}`;
      const current = totals.get(key) ?? {
        profileId: result.profileId,
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

function EventRecap({ event, latest }: { event: PickHistoryEvent; latest: boolean }) {
  const orderedBouts = event.bouts.slice().sort((left, right) => left.position - right.position);
  const currentResult = event.groupResults.find((result) => result.isCurrentUser) ?? null;
  const finish = currentResult
    ? `${groupRankLabel(currentResult.rank, event.groupResults)} OF ${event.groupResults.length}`
    : null;
  const note = recordNote(event.record);

  return (
    <details className="surface-card picks-recap-card">
      <summary className="picks-recap-card__summary">
        <div>
          <div className="picks-recap-card__date">
            {latest ? <span className="picks-recap-card__latest">LATEST</span> : null}
            <time dateTime={event.completedAt}>{completedDate(event.completedAt)}</time>
          </div>
          <h3>{event.name}</h3>
          <p>{event.subtitle}</p>
        </div>
        <div
          className="picks-recap-card__record"
          aria-label={finish
            ? `Your event finish ${finish}. ${event.record.correct} wins and ${event.record.incorrect} losses.`
            : `${event.record.correct} wins and ${event.record.incorrect} losses`}
        >
          <strong>{finish ?? `${event.record.correct}-${event.record.incorrect}`}</strong>
          <small>{event.record.correct}-{event.record.incorrect} · {winPercentageLabel(event.record.correct, event.record.incorrect)} WIN · {event.record.totalPoints} PTS</small>
          {note ? <em>{note}</em> : null}
        </div>
      </summary>

      <div className="picks-recap-card__body">
        <section className="picks-recap-group" aria-labelledby={`group-results-${event.eventId}`}>
          <div className="picks-recap-section-heading">
            <div>
              <span>GROUP RESULTS</span>
              <h4 id={`group-results-${event.eventId}`}>How everyone did</h4>
            </div>
            <small>{event.groupResults.length} ENTERED</small>
          </div>
          <div className="picks-group-results">
            {event.groupResults.map((result) => (
              <div
                className={result.isCurrentUser ? "picks-group-result is-current-user" : "picks-group-result"}
                key={result.profileId ?? result.displayName}
              >
                <span>{groupRankLabel(result.rank, event.groupResults)}</span>
                <strong>{result.displayName}</strong>
                <div>
                  <b>{result.totalPoints} PTS</b>
                  <small>{result.correct}-{result.incorrect} · {winPercentageLabel(result.correct, result.incorrect)} · +{result.lockBonus} lock</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="picks-recap-points" aria-label="Your scoring totals">
          <div><span>RECORD</span><strong>{event.record.correct}-{event.record.incorrect}</strong></div>
          <div><span>WIN %</span><strong>{winPercentageLabel(event.record.correct, event.record.incorrect)}</strong></div>
          <div><span>LOCK</span><strong>+{event.record.lockBonus}</strong></div>
          <div><span>TOTAL</span><strong>{event.record.totalPoints}</strong></div>
        </section>

        <details className="picks-recap-fights">
          <summary>
            <span>VIEW FIGHT-BY-FIGHT RESULTS</span>
            <small>{orderedBouts.length} FIGHTS · {completedDate(event.completedAt)}</small>
          </summary>
          <div className="picks-recap-fight-list">
            {orderedBouts.map((bout, index) => {
              const removed = bout.includedInPicks === false;
              return (
                <article className="picks-recap-fight" key={bout.boutId}>
                  <div className="picks-recap-fight__topline">
                    <span>{mainCardFightLabel(index)}</span>
                    <small>{bout.weightClass}</small>
                  </div>
                  <div className="picks-recap-fight__matchup">
                    <strong>{bout.redFighterName}</strong>
                    <span>VS</span>
                    <strong>{bout.blueFighterName}</strong>
                  </div>
                  <div className="picks-recap-fight__result">
                    <div><span>{removed ? "PICKS STATUS" : "OFFICIAL"}</span><b>{officialResult(bout)}</b></div>
                    <div><span>YOUR PICK</span><b>{fighterName(bout, bout.pickedFighterSlug)}</b></div>
                    <em className={`picks-verdict picks-verdict--${bout.verdict}`}>
                      {removed ? "Excluded from scoring" : verdictLabel(bout.verdict)}
                    </em>
                  </div>
                  <GroupPickReveal
                    redFighterSlug={bout.redFighterSlug}
                    redFighterName={bout.redFighterName}
                    blueFighterSlug={bout.blueFighterSlug}
                    blueFighterName={bout.blueFighterName}
                    picks={bout.groupPicks ?? []}
                  />
                </article>
              );
            })}
          </div>
        </details>
      </div>
    </details>
  );
}

export function PicksSeasonHub({ history, loading }: { history: PickHistory; loading: boolean }) {
  const [activeTab, setActiveTab] = useState<"standings" | "events">("standings");
  const standings = useMemo(
    () => history.seasonStandings.length ? history.seasonStandings : aggregateFallbackStandings(history),
    [history],
  );
  const currentStanding = standings.find((standing) => standing.isCurrentUser) ?? null;
  const season = history.season ?? new Date().getFullYear();
  const finish = currentStanding
    ? `${groupRankLabel(currentStanding.rank, standings)} OF ${standings.length}`
    : standings.length ? `— OF ${standings.length}` : "NO RESULTS";
  const record = currentStanding ?? history.summary;

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
    <section className="picks-history picks-season-section" aria-labelledby="picks-season-title">
      <details className="surface-card picks-season-hub">
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
              <div className="picks-recap-list">
                {history.events.map((event, index) => (
                  <EventRecap event={event} latest={index === 0} key={event.eventId} />
                ))}
              </div>
            </section>
          )}
        </div>
      </details>
    </section>
  );
}
