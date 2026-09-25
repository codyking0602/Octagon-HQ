import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { MLB_ROUND_LABELS } from "./mlbPlayoffsConfig";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import { MlbPlayerSpotlight } from "./MlbPlayerSpotlight";
import { mlbTeamAssetByName, mlbTeamColor, mlbTeamLogoUrl } from "./mlbTeamAssets";
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

function MlbSeriesTeam({ name }: { name: string }) {
  const asset = mlbTeamAssetByName(name);
  const color = mlbTeamColor(asset?.abbreviation, name);
  const logo = mlbTeamLogoUrl(asset?.abbreviation, name);

  return (
    <div className="mlb-home-series__team" style={{ "--series-team-color": color } as CSSProperties}>
      <span>{logo ? <img src={logo} alt="" loading="lazy" /> : null}</span>
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
  const nextSeriesLock = roundSeries
    .map((series) => series.starts_at)
    .filter((value): value is string => Boolean(value) && Date.parse(value!) > Date.now())
    .sort()[0] ?? null;
  const bracketCompleted = hub?.ownBracket ? Object.keys(hub.ownBracket).length : 0;
  const bracketTotal = hub?.bracketTemplate.nodes.length ?? 0;
  const bracketPercent = bracketTotal ? Math.round((bracketCompleted / bracketTotal) * 100) : 0;
  const spotlightSeries = hub?.spotlight?.series_id
    ? roundSeries.find((series) => series.series_id === hub.spotlight?.series_id) ?? null
    : roundSeries[0] ?? null;
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
          <section className="surface-card mlb-home-primary" aria-label="MLB Picks and bracket standing">
            <div className="mlb-home-primary__topline">
              <span>MLB PICKS</span>
              <small>{previewActive ? "OWNER PREVIEW" : hub.bracketLocked ? "LIVE" : "ACTIVE"}</small>
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

            <Link className="mlb-home-round-picks" to="/mlb/picks#mlb-round-picks">
              <div>
                <small>{MLB_ROUND_LABELS[hub.currentRound]} PICKS</small>
                <strong>{roundSeries.length ? `${completedRoundPicks} OF ${roundSeries.length} READY` : "MATCHUPS PENDING"}</strong>
              </div>
              <b>{nextSeriesLock ? `LOCKS ${nextLockLabel(nextSeriesLock)}` : "VIEW →"}</b>
            </Link>

            <Link className="secondary-action" to="/mlb/picks">OPEN PICKS →</Link>
          </section>

          <Link className="surface-card mlb-hq-card mlb-hq-card--challenge" to={hub.featuredChallenge?.route ?? "/mlb"}>
            <div className="mlb-hq-card__topline">
              <span>FEATURED CHALLENGE</span>
              <small>{hub.featuredChallenge?.kicker ?? "PLAYOFF GAME"}</small>
            </div>
            <h3>{hub.featuredChallenge?.title ?? "Coming with the postseason"}</h3>
            <p>{hub.featuredChallenge?.description ?? "Handcrafted MLB playoff challenges live here."}</p>
            <b className="mlb-hq-card__cta">PLAY →</b>
          </Link>

          <MlbPlayerSpotlight />

          <section className="mlb-home-series" aria-label="MLB Series Spotlight">
            <header>
              <span>SPOTLIGHT SERIES</span>
              <small>{hub.spotlight?.round ?? MLB_ROUND_LABELS[hub.currentRound]}</small>
            </header>
            {spotlightSeries ? (
              <Link
                className="mlb-home-series__row"
                to={`/mlb/series/${spotlightSeries.series_id}`}
                aria-label={`Open series breakdown for ${spotlightSeries.team_a_name} vs. ${spotlightSeries.team_b_name}`}
              >
                <div className="mlb-home-series__matchup">
                  <MlbSeriesTeam name={spotlightSeries.team_a_name} />
                  <b>VS</b>
                  <MlbSeriesTeam name={spotlightSeries.team_b_name} />
                </div>
                <div className="mlb-home-series__meta">
                  <strong>{hub.spotlight?.status ?? spotlightSeries.label}</strong>
                  <b>OPEN BREAKDOWN →</b>
                </div>
              </Link>
            ) : (
              <div className="mlb-home-series__pending">
                <strong>Series matchup pending</strong>
                <span>The featured series will publish when the bracket is set.</span>
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
