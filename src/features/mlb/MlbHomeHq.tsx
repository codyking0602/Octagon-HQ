import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { MLB_ROUND_LABELS } from "./mlbPlayoffsConfig";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import { MlbPlayerSpotlight } from "./MlbPlayerSpotlight";
import { mlbTeamAssetByName, mlbTeamColor, mlbTeamLogoUrl } from "./mlbTeamAssets";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import "../../styles/mlb-playoffs.css";

function nextLockLabel(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "SCHEDULE TBD";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value)).toUpperCase();
}

function MlbSeriesTeam({ name }: { name: string }) {
  const asset = mlbTeamAssetByName(name);
  const color = mlbTeamColor(asset?.abbreviation, name);
  const logo = mlbTeamLogoUrl(asset?.abbreviation, name);

  return (
    <div style={{ "--team-color": color } as CSSProperties}>
      <span className="football-hq-team-mark" aria-hidden="true">
        {logo ? <img src={logo} alt="" loading="lazy" /> : <b>{asset?.abbreviation ?? "MLB"}</b>}
      </span>
      <strong>{name}</strong>
    </div>
  );
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
  const roundPicksPercent = roundSeries.length
    ? Math.round((completedRoundPicks / roundSeries.length) * 100)
    : 0;
  const roundPicksRemaining = Math.max(0, roundSeries.length - completedRoundPicks);
  const bracketCompleted = hub?.ownBracket ? Object.keys(hub.ownBracket).length : 0;
  const bracketTotal = hub?.bracketTemplate.nodes.length ?? 0;
  const spotlightSeries = hub?.spotlight?.series_id
    ? roundSeries.find((series) => series.series_id === hub.spotlight?.series_id) ?? null
    : roundSeries[0] ?? null;
  const roundTitle = hub ? ({
    wild_card: "Wild Card",
    division_series: "Division Series",
    championship_series: "League Championship",
    world_series: "World Series",
  } as const)[hub.currentRound] : "October";
  const roundLabel = hub ? MLB_ROUND_LABELS[hub.currentRound] : "PLAYOFF";
  const picksStatus = roundSeries.length === 0
    ? "WAITING FOR MATCHUPS"
    : roundPicksRemaining === 0
      ? "PICKS READY"
      : `${roundPicksRemaining} PICK${roundPicksRemaining === 1 ? "" : "S"} LEFT`;
  const bracketSummary = bracketTotal
    ? `${bracketCompleted === bracketTotal ? "Bracket ready" : "Bracket in progress"} · ${bracketCompleted} of ${bracketTotal}`
    : "Bracket pending";

  return (
    <section
      className="home-section home-sport-hq home-sport-hq--mlb home-section--mlb-hq mlb-hq"
      data-home-section="mlb-playoffs"
      aria-label="MLB Playoffs"
    >
      <header className="home-sport-hq__heading">
        <div>
          <p className="eyebrow">MLB PLAYOFFS</p>
          <h2>{roundTitle}</h2>
        </div>
        <small>PICKS · BRACKET · SERIES</small>
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
          <section className="surface-card home-event-card home-event-card--compact" aria-label="MLB Picks and standing">
            <div className="home-event-card__topline">
              <p className="eyebrow">{roundLabel} PICKS</p>
              <span>{previewActive ? "OWNER PREVIEW" : hub.bracketLocked ? "LOCKED" : "ACTIVE"}</span>
            </div>
            <div className="home-event-card__picks-grid">
              <div className="picks-progress" aria-label={`${completedRoundPicks} of ${roundSeries.length} MLB series picks completed`}>
                <div>
                  <span>YOUR PICKS</span>
                  <b>{roundSeries.length ? `${completedRoundPicks} OF ${roundSeries.length}` : "—"}</b>
                </div>
                <div className="picks-progress__track" aria-hidden="true">
                  <span style={{ width: `${roundPicksPercent}%` }} />
                </div>
                <small className="home-event-card__picks-status">{picksStatus}</small>
              </div>
              <Link
                className="home-event-card__standing"
                to="/mlb/picks#mlb-bracket-race"
                aria-label="Open MLB Playoffs standings"
              >
                <span>2026 PLAYOFFS STANDING</span>
                <b>{ownRank ? `#${ownRank} OF ${hub.brackets.length}` : "—"}</b>
                <small>{hub.ownBracketScore} PTS</small>
              </Link>
            </div>
            <Link className="secondary-action" to="/mlb/picks#mlb-round-picks">OPEN PICKS →</Link>
          </section>

          <Link
            className="home-weekly-games-row"
            to="/mlb/picks#mlb-bracket"
            aria-label="View MLB Playoff Bracket"
          >
            <span className="home-weekly-games-row__copy">
              <small>PLAYOFF BRACKET</small>
              <strong>{bracketSummary}</strong>
            </span>
            <b>VIEW →</b>
          </Link>

          <Link
            className="home-challenge-card"
            data-sport="mlb"
            to={hub.featuredChallenge?.route ?? "/mlb"}
            aria-label="Open MLB Featured Challenge"
          >
            <div className="home-challenge-card__copy">
              <div className="home-challenge-card__topline">
                <span>FEATURED CHALLENGE</span>
                <small>READY</small>
              </div>
              <h3>{hub.featuredChallenge?.title ?? "October Challenge"}</h3>
              <p>{hub.featuredChallenge?.description ?? "One handcrafted postseason game."}</p>
            </div>
            <div className="home-challenge-card__result">
              <strong>PLAY NOW</strong>
              <span><b aria-hidden="true">→</b></span>
            </div>
          </Link>

          <MlbPlayerSpotlight />

          <section className="football-hq-games" aria-label="MLB Spotlight Series">
            <header>
              <span>SPOTLIGHT SERIES</span>
              <small>{hub.spotlight?.round ?? roundLabel}</small>
            </header>
            {spotlightSeries ? (
              <div className="football-hq-games__list">
                <Link
                  className="football-hq-game-row"
                  to={`/mlb/series/${spotlightSeries.series_id}`}
                  aria-label={`Open series breakdown for ${spotlightSeries.team_a_name} vs. ${spotlightSeries.team_b_name}`}
                >
                  <div className="football-hq-game-row__main">
                    <span>{roundLabel} SERIES</span>
                    <div className="football-hq-game-row__teams">
                      <MlbSeriesTeam name={spotlightSeries.team_a_name} />
                      <b>VS</b>
                      <MlbSeriesTeam name={spotlightSeries.team_b_name} />
                    </div>
                  </div>
                  <div className="football-hq-game-row__meta">
                    <strong>{nextLockLabel(spotlightSeries.starts_at)}</strong>
                    <b>OPEN BREAKDOWN →</b>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="mlb-home-series__pending">
                <strong>Series matchup pending</strong>
                <span>The featured series will publish when the bracket is set.</span>
              </div>
            )}
            <Link className="football-hq-games__schedule" to="/mlb/picks#mlb-round-picks">
              VIEW ALL SERIES →
            </Link>
          </section>
        </>
      ) : null}
    </section>
  );
}
