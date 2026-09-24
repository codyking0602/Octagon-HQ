import { Link } from "react-router-dom";
import { MLB_ROUND_LABELS } from "./mlbPlayoffsConfig";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import "../../styles/mlb-playoffs.css";

function nextLockLabel(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "LOCK TBD";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value)).toUpperCase();
}

export function MlbHomeHq({ enabled, signedIn }: { enabled: boolean; signedIn: boolean }) {
  const { hub, loading, error } = useMlbPlayoffs(enabled && signedIn);
  if (!enabled) return null;

  const ownEntry = hub?.brackets.find((entry) => entry.is_current_user) ?? null;
  const ownRank = ownEntry ? hub!.brackets.findIndex((entry) => entry.profile_id === ownEntry.profile_id) + 1 : null;
  const leader = hub?.brackets[0] ?? null;
  const roundSeries = hub?.series.filter((series) => series.round === hub.currentRound) ?? [];
  const submittedSeries = new Set(hub?.ownRoundPicks.map((pick) => pick.series_id) ?? []);
  const remaining = roundSeries.filter((series) => !submittedSeries.has(series.series_id)).length;
  const nextSeriesLock = roundSeries
    .map((series) => series.starts_at)
    .filter((value): value is string => Boolean(value) && Date.parse(value!) > Date.now())
    .sort()[0] ?? null;

  return (
    <section className="home-section mlb-hq" data-home-section="mlb-playoffs" aria-label="MLB Playoffs">
      <header className="mlb-hq__heading">
        <div>
          <p className="eyebrow">MLB PLAYOFFS</p>
          <h2>{hub ? MLB_ROUND_LABELS[hub.currentRound] : "POSTSEASON"}</h2>
        </div>
        <small>2026</small>
      </header>

      {!signedIn ? (
        <section className="surface-card mlb-state-card">
          <strong>Sign in for MLB Playoffs</strong>
          <p>Your bracket and round picks stay tied to your HQ profile.</p>
        </section>
      ) : loading && !hub ? (
        <section className="surface-card mlb-state-card"><strong>Loading MLB Playoffs…</strong></section>
      ) : error && !hub ? (
        <section className="surface-card mlb-state-card"><strong>MLB Playoffs is being prepared.</strong><p>{error}</p></section>
      ) : hub ? (
        <div className="mlb-hq__grid">
          <Link className="surface-card mlb-hq-card mlb-hq-card--race" to="/mlb/picks#mlb-bracket-race">
            <div className="mlb-hq-card__topline"><span>BRACKET RACE</span><small>{hub.bracketLocked ? "LIVE" : "PRESEASON"}</small></div>
            <div className="mlb-hq-card__metric">
              <strong>{ownRank ? `#${ownRank}` : "—"}</strong>
              <span>{hub.ownBracketScore} PTS</span>
            </div>
            <p>{leader ? `Leader: ${leader.display_name} · ${leader.score} pts` : hub.fieldReady ? "Submit your bracket before first pitch." : "Field locks when the postseason bracket is final."}</p>
          </Link>

          <Link className="surface-card mlb-hq-card" to="/mlb/picks#mlb-round-picks">
            <div className="mlb-hq-card__topline"><span>YOUR PICKS</span><small>{MLB_ROUND_LABELS[hub.currentRound]}</small></div>
            <div className="mlb-hq-card__metric">
              <strong>{roundSeries.length ? `${roundSeries.length - remaining}/${roundSeries.length}` : "—"}</strong>
              <span>{roundSeries.length ? "SUBMITTED" : "FIELD PENDING"}</span>
            </div>
            <p>{nextSeriesLock ? `Next lock · ${nextLockLabel(nextSeriesLock)}` : "Series picks appear as matchups are set."}</p>
          </Link>

          <Link className="surface-card mlb-hq-card mlb-hq-card--challenge" to={hub.featuredChallenge?.route ?? "/mlb"}>
            <div className="mlb-hq-card__topline"><span>FEATURED CHALLENGE</span><small>{hub.featuredChallenge?.kicker ?? "PLAYOFF GAME"}</small></div>
            <h3>{hub.featuredChallenge?.title ?? "Coming with the postseason"}</h3>
            <p>{hub.featuredChallenge?.description ?? "Handcrafted MLB playoff challenges live here."}</p>
          </Link>

          <section className="surface-card mlb-hq-card mlb-hq-card--spotlight">
            <div className="mlb-hq-card__topline"><span>SERIES SPOTLIGHT</span><small>{hub.spotlight?.round ?? MLB_ROUND_LABELS[hub.currentRound]}</small></div>
            {hub.spotlight ? (
              <>
                <h3>{hub.spotlight.title}</h3>
                <p>{hub.spotlight.status}</p>
                <p>{hub.spotlight.overview}</p>
                {hub.spotlight.keys.length ? (
                  <div className="mlb-spotlight__keys" aria-label="Keys to the series">
                    {hub.spotlight.keys.slice(0, 2).map((key) => <span key={key}>{key}</span>)}
                  </div>
                ) : null}
                <div className="mlb-spotlight__watch">
                  <span>PLAYER TO WATCH</span>
                  <strong>{hub.spotlight.player_to_watch}</strong>
                  <small>{hub.spotlight.player_context}</small>
                  {hub.spotlight.stats[0] ? <small>{hub.spotlight.stats[0]}</small> : null}
                </div>
              </>
            ) : (
              <>
                <h3>Series matchup pending</h3>
                <p>The featured series will publish when the bracket is set.</p>
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
