import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import {
  resolveMlbSeriesBreakdownContent,
  type MlbSeriesBreakdownRichTextPart,
} from "./mlbSeriesBreakdownContent";
import { mlbTeamAssetByName, mlbTeamColor, mlbTeamLogoUrl } from "./mlbTeamAssets";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import "../../styles/mlb-playoffs.css";

function BreakdownRichText({ parts }: { parts: readonly MlbSeriesBreakdownRichTextPart[] }) {
  return (
    <>
      {parts.map((part, index) => {
        const copy = part.emphasis ? <strong>{part.text}</strong> : part.text;
        return part.href ? (
          <a
            className="mlb-series-inline-link"
            href={part.href}
            key={`${part.text}-${index}`}
            target="_blank"
            rel="noreferrer"
          >
            {copy}
          </a>
        ) : <span key={`${part.text}-${index}`}>{copy}</span>;
      })}
    </>
  );
}

function TeamPanel({
  name,
  seed,
  side,
}: {
  name: string;
  seed: number | null | undefined;
  side: "away" | "home";
}) {
  const asset = mlbTeamAssetByName(name);
  const color = mlbTeamColor(asset?.abbreviation, name);
  const logo = mlbTeamLogoUrl(asset?.abbreviation, name);

  return (
    <div
      className={`mlb-series-breakdown__team is-${side}`}
      style={{ "--series-team-color": color } as CSSProperties}
    >
      <span className={`mlb-series-breakdown__team-logo${asset?.abbreviation === "NYY" ? " mlb-yankees-light" : ""}`}>
        {logo ? <img src={logo} alt="" loading="eager" /> : null}
      </span>
      <div className="mlb-series-breakdown__team-copy">
        <strong>{name}</strong>
        <small>{seed ? "NO. " + seed + " SEED · " : ""}{asset?.abbreviation ?? "MLB"}</small>
      </div>
    </div>
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
  const teamAColor = mlbTeamColor(teamA?.abbreviation, series.team_a_name);
  const teamBColor = mlbTeamColor(teamB?.abbreviation, series.team_b_name);

  return (
    <div className="page mlb-series-breakdown-page">
      <section
        className="surface-card mlb-series-breakdown-hero is-compact"
        style={{
          "--series-away-color": teamAColor,
          "--series-home-color": teamBColor,
        } as CSSProperties}
      >
        <div className="mlb-series-breakdown-hero__topline">
          <span>THE HQ'S MLB SPOTLIGHT SERIES</span>
          <b>{spotlight?.status ?? series.label}</b>
        </div>

        <div className="mlb-series-breakdown__matchup">
          <TeamPanel name={series.team_a_name} seed={teamA?.seed} side="away" />
          <b>VS</b>
          <TeamPanel name={series.team_b_name} seed={teamB?.seed} side="home" />
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
              <span>3 THINGS THAT MATTER</span>
            </div>
            <div className="mlb-series-decisions">
              {breakdown.decisions.map((decision, index) => (
                <article key={decision.title}>
                  <b>{index + 1}</b>
                  <div>
                    <strong>{decision.title}</strong>
                    <p><BreakdownRichText parts={decision.body} /></p>
                  </div>
                </article>
              ))}
            </div>
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
