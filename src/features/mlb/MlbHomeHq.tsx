import { Link } from "react-router-dom";
import { MLB_ROUND_LABELS } from "./mlbPlayoffsConfig";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
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

export function MlbHomeHq({
  enabled,
  signedIn,
  previewMode = false,
}: {
  enabled: boolean;
  signedIn: boolean;
  previewMode?: boolean;
}) {
  const { hub: liveHub, loading, error } = useMlbPlayoffs(enabled && signedIn);
  if (!enabled) return null;

  const previewActive = previewMode && (!liveHub || !liveHub.fieldReady);
  const hub = previewActive ? MLB_OWNER_PREVIEW_HUB : liveHub;

  const ownEntry = hub?.brackets.find((entry) => entry.is_current_user) ?? null;
  const ownRank = ownEntry && hub
    ? hub.brackets.findIndex((entry) => entry.profile_id === ownEntry.profile_id) + 1
    : null;
  const roundSeries = hub?.series.filter((series) => series.round === hub.currentRound) ?? [];
  const submittedSeries = new Set(hub?.ownRoundPicks.map((pick) => pick.series_id) ?? []);
  const completedRoundPicks = roundSeries.filter((series) => submittedSeries.has(series.series_id)).length;
  const nextSeriesLock = roundSeries
    .map((series) => series.starts_at)
    .filter((value): value is string => Boolean(value) && Date.parse(value!) > Date.now())
    .sort()[0] ?? null;
  const bracketCompleted = hub?.ownBracket ? Object.keys(hub.ownBracket).length : 0;
  const bracketTotal = hub?.bracketTemplate.nodes.length ?? 0;
  const bracketPercent = bracketTotal ? Math.round((bracketCompleted / bracketTotal) * 100) : 0;
  const roundTitle = hub ? ({
    wild_card: "Wild Card",
    division_series: "Division Series",
    championship_series: "League Championship",
    world_series: "World Series",
  } as const)[hub.currentRound] : "October";

  return (
    <section
      className="home-section home-sport-hq home-sport-hq--mlb home-section--mlb-hq mlb-hq"
      data-home-section="mlb-playoffs"
      aria-label="MLB Playoffs"
    >
      <header className="home-sport-hq__heading mlb-hq__heading">
        <div>
          <p className="eyebrow">MLB PLAYOFFS</p>
          <h2>{roundTitle}</h2>
        </div>
        <small>BRACKET · PICKS · SERIES</small>
      </header>

      {!signedIn ? (
        <section className="surface-card mlb-state-card">
          <strong>Sign in for MLB Playoffs</strong>
          <p>Your bracket and round picks stay tied to your HQ profile.</p>
        </section>
      ) : loading && !hub ? (
        <section className="surface-card mlb-state-card"><strong>Loading MLB Playoffs…</strong></section>
      ) : error && !hub ? (
        <section className="surface-card mlb-state-card">
          <strong>MLB Playoffs is being prepared.</strong>
          <p>{error}</p>
        </section>
      ) : hub ? (
        <>
          <section className="surface-card mlb-home-primary" aria-label="MLB playoff bracket status">
            <div className="mlb-home-primary__topline">
              <span>PLAYOFF BRACKET</span>
              <small>{previewActive ? "OWNER PREVIEW" : hub.bracketLocked ? "LIVE" : "OPEN"}</small>
            </div>
            <div className="mlb-home-primary__grid">
              <div className="mlb-home-progress">
                <div>
                  <span>YOUR BRACKET</span>
                  <b>{bracketTotal ? `${bracketCompleted} OF ${bracketTotal}` : "—"}</b>
                </div>
                <div className="mlb-home-progress__track" aria-hidden="true">
                  <span style={{ width: `${bracketPercent}%` }} />
                </div>
                <small>{bracketTotal && bracketCompleted === bracketTotal ? "BRACKET READY" : "BUILD YOUR PATH"}</small>
              </div>
              <Link className="mlb-home-standing" to="/mlb/picks#mlb-bracket-race">
                <span>BRACKET RACE</span>
                <b>{ownRank ? `#${ownRank} OF ${hub.brackets.length}` : "—"}</b>
                <small>{hub.ownBracketScore} PTS</small>
              </Link>
            </div>
            <Link className="secondary-action" to="/mlb/picks">OPEN BRACKET →</Link>
          </section>

          <Link className="mlb-home-row" to="/mlb/picks#mlb-round-picks">
            <div>
              <small>{MLB_ROUND_LABELS[hub.currentRound]} PICKS</small>
              <strong>{roundSeries.length ? `${completedRoundPicks} OF ${roundSeries.length} READY` : "MATCHUPS PENDING"}</strong>
            </div>
            <b>{nextSeriesLock ? `LOCKS ${nextLockLabel(nextSeriesLock)}` : "VIEW →"}</b>
          </Link>

          <Link className="surface-card mlb-hq-card mlb-hq-card--challenge" to={hub.featuredChallenge?.route ?? "/mlb"}>
            <div className="mlb-hq-card__topline">
              <span>FEATURED CHALLENGE</span>
              <small>{hub.featuredChallenge?.kicker ?? "PLAYOFF GAME"}</small>
            </div>
            <h3>{hub.featuredChallenge?.title ?? "Coming with the postseason"}</h3>
            <p>{hub.featuredChallenge?.description ?? "Handcrafted MLB playoff challenges live here."}</p>
          </Link>

          <section className="surface-card mlb-hq-card mlb-hq-card--spotlight">
            <div className="mlb-hq-card__topline">
              <span>SERIES SPOTLIGHT</span>
              <small>{hub.spotlight?.round ?? MLB_ROUND_LABELS[hub.currentRound]}</small>
            </div>
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
        </>
      ) : null}
    </section>
  );
}
