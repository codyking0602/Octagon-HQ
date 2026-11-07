import { useEffect, useState } from "react";
import "../../styles/nba-gm-match-recap.css";
import { nbaTeamLogoSrc } from "../nba/nbaTeamBranding";
import {
  nbaGmChallengeInsights,
  nbaGmDevelopmentLabel,
  type NbaGmChallengePlayer,
  type NbaGmChallengeRecap,
  type NbaGmChallengeSide,
} from "../nba/nbaGmChallengeRecap";

const slotLabels: Record<NbaGmChallengePlayer["slot"], string> = {
  PG: "PG", SG: "SG", SF: "SF", PF: "PF", C: "C", GUARD: "G", BIG: "BIG",
};

function PlayerImage({ player }: { player: NbaGmChallengePlayer }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [player.nbaPlayerId]);
  const logo = nbaTeamLogoSrc(player.teamCode);
  return <span className="nba-gm-match__portrait" aria-hidden="true">
    {player.nbaPlayerId && /^\d+$/.test(player.nbaPlayerId) && !failed
      ? <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.nbaPlayerId}.png`}
          loading="lazy" alt="" onError={() => setFailed(true)} />
      : logo ? <img className="is-team-logo" src={logo} loading="lazy" alt="" /> : <b>{player.teamCode}</b>}
  </span>;
}

function Roster({ name, side }: { name: string; side: NbaGmChallengeSide }) {
  const insights = nbaGmChallengeInsights(side);
  const newIds = new Set(insights.acquired.map(player => player.playerId));
  return <article className="nba-gm-match__roster-card">
    <header>
      <div><small>YEAR 3 · FINAL SEVEN</small><h4>{name}</h4></div>
      <span>{insights.retained}/7 RETAINED</span>
    </header>
    <div className="nba-gm-match__players">
      {side.finalRoster.map(player => {
        const movement = nbaGmDevelopmentLabel(player.developmentDelta);
        return <div key={player.playerId} className="nba-gm-match__player">
          <b className="nba-gm-match__slot">{slotLabels[player.slot]}</b>
          <PlayerImage player={player} />
          <div className="nba-gm-match__player-name">
            <strong>{player.name}</strong>
            <small>{player.teamCode} <span aria-hidden="true">·</span> <span className={movement === "BREAKOUT" || movement === "IMPROVED" ? "is-up" : movement.includes("REGRESS") ? "is-down" : ""}>{movement}</span></small>
          </div>
          {newIds.has(player.playerId) && <em>NEW</em>}
        </div>;
      })}
    </div>
    <details className="nba-gm-match__opening">
      <summary>VIEW ORIGINAL DRAFT <span>YEAR 1</span></summary>
      <div>{side.openingRoster.map(player => <div key={player.playerId}>
        <b>{slotLabels[player.slot]}</b><span>{player.name}</span><small>{player.teamCode}</small>
      </div>)}</div>
    </details>
  </article>;
}

function Finish({ label }: { label: string }) {
  const title = label === "Champion";
  return <em className={title ? "is-champion" : label === "Finals" ? "is-finals" : ""}>{label}</em>;
}

function SeasonCard({ side, index }: { side: NbaGmChallengeSide; index: number }) {
  const season = side.seasons[index];
  if (!season) return null;
  return <article className="nba-gm-match__year-team">
    <div><strong>{season.overall ?? "—"} <small>OVR</small></strong><b>{season.wins}–{season.losses}</b></div>
    <Finish label={season.finish} />
    {season.titleOdds != null && <small>{season.titleOdds.toFixed(1)}% TITLE ODDS</small>}
  </article>;
}

function FranchiseNote({ side, name }: { side: NbaGmChallengeSide; name: string }) {
  const info = nbaGmChallengeInsights(side);
  return <div className="nba-gm-match__note">
    <strong>{name}</strong>
    <div>
      {info.acquired.length
        ? <p><span>OFFSEASON CHANGE</span><b>{info.outgoing.map(p => p.name).join(", ") || "Original roster"} <i aria-hidden="true">→</i> {info.acquired.map(p => p.name).join(", ")}</b></p>
        : <p><span>ROSTER CONTINUITY</span><b>Retained all seven original picks</b></p>}
      <p><span>BIGGEST LEAP</span><b>{info.biggestLeap
        ? `${info.biggestLeap.name} · ${nbaGmDevelopmentLabel(info.biggestLeap.developmentDelta)}`
        : "No major development increase"}</b></p>
    </div>
  </div>;
}

export function NbaGmMatchReport({
  report, creatorName, responderName,
}: {
  report: NbaGmChallengeRecap;
  creatorName: string;
  responderName: string;
}) {
  const sides = [report.creator, report.responder];
  const names = [creatorName, responderName];
  const summary = sides.map(nbaGmChallengeInsights);
  const breakdown = [
    { key: "rosterGrade" as const, label: "ROSTER", weight: report.creator.weights[0] },
    { key: "recordGrade" as const, label: "RECORD", weight: report.creator.weights[1] },
    { key: "playoffGrade" as const, label: "PLAYOFFS", weight: report.creator.weights[2] },
  ];

  return <div className="nba-gm-match" aria-label="Complete NBA GM franchise comparison">
    <section className="nba-gm-match__quick" aria-label="Three-season records and titles">
      {sides.map((side, index) => <article key={index}>
        <small>{names[index]}</small>
        <strong>{summary[index]!.titles} {summary[index]!.titles === 1 ? "TITLE" : "TITLES"}</strong>
        <span>{summary[index]!.wins}–{summary[index]!.losses} OVER 3 YEARS</span>
      </article>)}
    </section>

    <section className="nba-gm-match__section" aria-label="Year by year team results">
      <header><h3>HOW THE SEASONS PLAYED OUT</h3><small>RECORD · OVERALL · PLAYOFFS</small></header>
      <div className="nba-gm-match__season-head"><span>YEAR</span><b>{creatorName}</b><b>{responderName}</b></div>
      {[0, 1, 2].map(index => <div className="nba-gm-match__season-row" key={index}>
        <strong>Y{index + 1}</strong>
        <SeasonCard side={report.creator} index={index} />
        <SeasonCard side={report.responder} index={index} />
      </div>)}
    </section>

    <section className="nba-gm-match__section" aria-label="What determined the GM scores">
      <header><h3>WHY THE SCORES DIFFER</h3><small>WEIGHTED GM COMPONENTS</small></header>
      <div className="nba-gm-match__grade-head"><span>COMPONENT</span><b>{creatorName}</b><b>{responderName}</b></div>
      {breakdown.map(item => {
        const a = report.creator[item.key], b = report.responder[item.key];
        return <div className="nba-gm-match__grade-row" key={item.key}>
          <span><b>{item.label}</b><small>{Math.round(item.weight * 100)}% OF SCORE</small></span>
          <strong className={a > b ? "is-leading" : ""}>{a.toFixed(1)}</strong>
          <strong className={b > a ? "is-leading" : ""}>{b.toFixed(1)}</strong>
        </div>;
      })}
    </section>

    <section className="nba-gm-match__section" aria-label="Both seven-player final rosters">
      <header><h3>THE FRANCHISES</h3><small>FINAL SEVEN · DEVELOPMENT</small></header>
      <div className="nba-gm-match__rosters">
        <Roster name={creatorName} side={report.creator} />
        <Roster name={responderName} side={report.responder} />
      </div>
    </section>

    <section className="nba-gm-match__section" aria-label="Roster moves and player development highlights">
      <header><h3>RUN HIGHLIGHTS</h3><small>OFFSEASON · PROGRESSION</small></header>
      <div className="nba-gm-match__notes">
        <FranchiseNote name={creatorName} side={report.creator} />
        <FranchiseNote name={responderName} side={report.responder} />
      </div>
    </section>
  </div>;
}
