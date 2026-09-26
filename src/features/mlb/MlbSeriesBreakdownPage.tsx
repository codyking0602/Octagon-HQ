import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import {
  resolveMlbSeriesBreakdownContent,
  type MlbSeriesBreakdownPlayer,
} from "./mlbSeriesBreakdownContent";
import { mlbTeamAssetByName, mlbTeamColor, mlbTeamLogoUrl } from "./mlbTeamAssets";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import "../../styles/mlb-playoffs.css";

function TeamPanel({ name, seed }: { name: string; seed: number | null | undefined }) {
  const asset = mlbTeamAssetByName(name);
  const color = mlbTeamColor(asset?.abbreviation, name);
  const logo = mlbTeamLogoUrl(asset?.abbreviation, name);

  return (
    <div className="mlb-series-breakdown__team" style={{ "--series-team-color": color } as CSSProperties}>
      <span className="mlb-series-breakdown__team-logo">
        {logo ? <img src={logo} alt="" loading="eager" /> : null}
      </span>
      <strong>{name}</strong>
      <small>{seed ? "NO. " + seed + " SEED · " : ""}{asset?.abbreviation ?? "MLB"}</small>
    </div>
  );
}

function PlayerCard({
  player,
  teamName,
}: {
  player: MlbSeriesBreakdownPlayer;
  teamName: string;
}) {
  const asset = mlbTeamAssetByName(teamName);
  const color = mlbTeamColor(asset?.abbreviation, teamName);
  const logo = mlbTeamLogoUrl(asset?.abbreviation, teamName);

  return (
    <article
      className="mlb-series-player"
      style={{ "--series-team-color": color } as CSSProperties}
    >
      <header>
        <span className="mlb-series-player__logo">
          {logo ? <img src={logo} alt="" loading="lazy" /> : null}
        </span>
        <div>
          <small>{player.role}</small>
          <strong>{player.name}</strong>
        </div>
      </header>
      <p>{player.body}</p>
    </article>
  );
}

export default function MlbSeriesBreakdownPage() {
  const { seriesId = "" } = useParams();
  const identity = useIdentity();
  const signedIn = Boolean(identity.profile);
  const { hub: liveHub, loading, error } = useMlbPlayoffs(signedIn);
  const previewMode = identity.profile?.canControlPicks === true && (!liveHub || !liveHub.fieldReady);
  const hub = previewMode ? MLB_OWNER_PREVIEW_HUB : liveHub;
  const series = hub?.series.find((item) => item.series_id === seriesId) ?? null;
  const spotlight = hub?.spotlight?.series_id === seriesId ? hub.spotlight : null;
  const breakdown = resolveMlbSeriesBreakdownContent(seriesId, previewMode);

  if (loading && !hub) {
    return <div className="page"><section className="surface-card mlb-state-card"><strong>Loading series…</strong></section></div>;
  }

  if (!series) {
    return (
      <div className="page mlb-series-breakdown-page">
        <section className="page-heading">
          <p className="eyebrow">MLB PLAYOFFS · SERIES BREAKDOWN</p>
          <h1>Series unavailable</h1>
          <p>{error || "This matchup has not been published yet."}</p>
        </section>
        <Link className="secondary-action" to="/">BACK TO HOME →</Link>
      </div>
    );
  }

  const teamA = hub?.bracketTemplate.teams.find((team) => team.id === series.team_a_id);
  const teamB = hub?.bracketTemplate.teams.find((team) => team.id === series.team_b_id);
  const playerTeamName = (teamId: string) => (
    teamId === series.team_a_id ? series.team_a_name : series.team_b_name
  );
  const winPathsA = breakdown?.winPaths[series.team_a_id] ?? [];
  const winPathsB = breakdown?.winPaths[series.team_b_id] ?? [];

  return (
    <div className="page mlb-series-breakdown-page">
      <section className="surface-card mlb-series-breakdown-hero">
        <div className="mlb-series-breakdown-hero__topline">
          <span>MLB PLAYOFFS · SERIES BREAKDOWN</span>
          <b>{spotlight?.status ?? series.label}</b>
        </div>

        <div className="mlb-series-breakdown-hero__title">
          <h1>{spotlight?.title ?? (series.team_a_name + " vs. " + series.team_b_name)}</h1>
          {breakdown ? <small>{breakdown.eyebrow}</small> : null}
        </div>

        <div className="mlb-series-breakdown__matchup">
          <TeamPanel name={series.team_a_name} seed={teamA?.seed} />
          <b>VS</b>
          <TeamPanel name={series.team_b_name} seed={teamB?.seed} />
        </div>

        <div className="mlb-series-breakdown__schedule">
          <span>SERIES SCHEDULE</span>
          <div>
            {series.schedule.length
              ? series.schedule.map((item) => <strong key={item}>{item}</strong>)
              : <strong>Schedule pending</strong>}
          </div>
        </div>
      </section>

      {breakdown ? (
        <div className="mlb-series-breakdown__analysis">
          <section className="surface-card mlb-series-analysis-card mlb-series-analysis-card--series">
            <span>THE SERIES</span>
            <p>{breakdown.series}</p>
          </section>

          <section className="surface-card mlb-series-analysis-card">
            <div className="mlb-series-analysis-card__heading">
              <span>3 THINGS THAT DECIDE IT</span>
            </div>
            <div className="mlb-series-decisions">
              {breakdown.decisions.map((decision, index) => (
                <article key={decision.title}>
                  <b>{index + 1}</b>
                  <div>
                    <strong>{decision.title}</strong>
                    <p>{decision.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="surface-card mlb-series-analysis-card">
            <div className="mlb-series-analysis-card__heading">
              <span>PLAYERS TO WATCH</span>
              <small>ONE PER TEAM</small>
            </div>
            <div className="mlb-series-players">
              {breakdown.players.map((player) => (
                <PlayerCard
                  key={player.teamId}
                  player={player}
                  teamName={playerTeamName(player.teamId)}
                />
              ))}
            </div>
          </section>

          <section className="mlb-series-win-paths">
            {[
              {
                id: series.team_a_id,
                name: series.team_a_name,
                items: winPathsA,
              },
              {
                id: series.team_b_id,
                name: series.team_b_name,
                items: winPathsB,
              },
            ].map((team) => {
              const asset = mlbTeamAssetByName(team.name);
              const color = mlbTeamColor(asset?.abbreviation, team.name);
              return (
                <article
                  className="surface-card mlb-series-win-path"
                  key={team.id}
                  style={{ "--series-team-color": color } as CSSProperties}
                >
                  <span>HOW {asset?.abbreviation ?? team.name.toUpperCase()} WINS</span>
                  <ul>
                    {team.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              );
            })}
          </section>

          <section className="surface-card mlb-series-hq-read">
            <span>THE HQ READ</span>
            <p>{breakdown.hqRead}</p>
          </section>
        </div>
      ) : spotlight ? (
        <section className="surface-card mlb-series-analysis-card mlb-series-analysis-card--pending">
          <span>THE SERIES</span>
          <p>{spotlight.overview}</p>
          <div>
            {spotlight.keys.map((key) => <strong key={key}>{key}</strong>)}
          </div>
          <small>Full breakdown publishes with the finalized matchup analysis.</small>
        </section>
      ) : (
        <section className="surface-card mlb-series-analysis-card mlb-series-analysis-card--pending">
          <span>SERIES ANALYSIS</span>
          <p>The full matchup breakdown will publish when this series is finalized.</p>
        </section>
      )}

      <Link className="secondary-action mlb-series-breakdown-page__back" to="/">BACK TO HOME →</Link>
    </div>
  );
}
