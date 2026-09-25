import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import { MlbPlayerSpotlight } from "./MlbPlayerSpotlight";
import { mlbTeamAssetByName, mlbTeamColor, mlbTeamLogoUrl } from "./mlbTeamAssets";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import "../../styles/mlb-playoffs.css";

function TeamPanel({ name }: { name: string }) {
  const asset = mlbTeamAssetByName(name);
  const color = mlbTeamColor(asset?.abbreviation, name);
  const logo = mlbTeamLogoUrl(asset?.abbreviation, name);

  return (
    <div className="mlb-series-breakdown__team" style={{ "--series-team-color": color } as CSSProperties}>
      <span className="mlb-series-breakdown__team-logo">
        {logo ? <img src={logo} alt="" loading="eager" /> : null}
      </span>
      <strong>{name}</strong>
      <small>{asset?.abbreviation ?? "MLB"}</small>
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

  return (
    <div className="page mlb-series-breakdown-page">
      <section className="page-heading mlb-series-breakdown-page__heading">
        <p className="eyebrow">MLB PLAYOFFS · SERIES BREAKDOWN</p>
        <h1>{spotlight?.title ?? `${series.team_a_name} vs. ${series.team_b_name}`}</h1>
        <p>{spotlight?.status ?? series.label}</p>
      </section>

      {previewMode ? (
        <div className="mlb-preview-banner" role="note">
          <strong>OWNER PREVIEW</strong>
          <span>Visual preview only. Official postseason matchups will replace this content when the field is final.</span>
        </div>
      ) : null}

      <section className="surface-card mlb-series-breakdown">
        <div className="mlb-series-breakdown__matchup">
          <TeamPanel name={series.team_a_name} />
          <b>VS</b>
          <TeamPanel name={series.team_b_name} />
        </div>

        <div className="mlb-series-breakdown__schedule">
          <span>SERIES SCHEDULE</span>
          <div>
            {series.schedule.length
              ? series.schedule.map((item) => <strong key={item}>{item}</strong>)
              : <strong>Schedule pending</strong>}
          </div>
        </div>

        {spotlight ? (
          <>
            <div className="mlb-series-breakdown__overview">
              <span>THE SERIES</span>
              <p>{spotlight.overview}</p>
            </div>
            <div className="mlb-series-breakdown__keys">
              <span>KEYS TO THE SERIES</span>
              {spotlight.keys.map((key) => <strong key={key}>{key}</strong>)}
            </div>
          </>
        ) : null}
      </section>

      <MlbPlayerSpotlight />

      <Link className="secondary-action mlb-series-breakdown-page__back" to="/">BACK TO HOME →</Link>
    </div>
  );
}
