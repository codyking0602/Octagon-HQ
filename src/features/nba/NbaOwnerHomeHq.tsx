import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NBA_GAMES_LAUNCH_DAY, NBA_OFFICIAL_GAMES_RELEASE_READY, nbaCentralDay,
  nbaOwnerPreviewDaily, nbaRegularSeasonDaily, NBA_DAILY_GAME_LABELS } from "./nbaDailySchedule";
import { NBA_FUTURES_SELECTIONS, emptyNbaFutures, nbaFuturesProgress } from "./nbaFutures";
import { loadNbaFutures } from "./nbaFuturesRepository";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { nbaSpotlightWeekLabel, readVerifiedNbaWeekly, type NbaWeeklySpotlight } from "./nbaWeeklySpotlight";
import "../../styles/nba-owner-home.css";

export function NbaOwnerHomeHq({ profileId, allowOwnerDailyPreview = false, hideChampionship = false }: { profileId: string; allowOwnerDailyPreview?: boolean; hideChampionship?: boolean }) {
  const [futures, setFutures] = useState<{ count: number; locked: boolean } | null>(null);
  const [weekly, setWeekly] = useState<NbaWeeklySpotlight | null>(null);
  const day = nbaCentralDay();
  const publishedDaily = NBA_OFFICIAL_GAMES_RELEASE_READY && day >= NBA_GAMES_LAUNCH_DAY;
  const ownerSlot = allowOwnerDailyPreview && !publishedDaily && day < NBA_GAMES_LAUNCH_DAY ? nbaOwnerPreviewDaily(day) : null;
  const officialSlot = publishedDaily ? nbaRegularSeasonDaily(day) : null;
  const dailyType = publishedDaily ? officialSlot?.gameType : ownerSlot;
  const dailyEnabled = Boolean(dailyType);
  const daily = useTodayChallengeRuntime({
    profileId, enabled: dailyEnabled,
    sport: publishedDaily ? "nba" : "nba_preview",
  });

  useEffect(() => {
    let live = true;
    void loadNbaFutures().then(snapshot => {
      if (!live) return;
      setFutures({
        count: snapshot.own ? nbaFuturesProgress({ ...emptyNbaFutures(), ...snapshot.own }) : 0,
        locked: snapshot.locked,
      });
    }).catch(() => { if (live) setFutures(null); });
    return () => { live = false; };
  }, []);
  useEffect(() => {
    let live = true;
    void fetch("/nba-weekly/active.json", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(raw => { if (live) setWeekly(readVerifiedNbaWeekly(raw)); })
      .catch(() => { if (live) setWeekly(null); });
    return () => { live = false; };
  }, []);

  const count = futures?.count;
  const hasCompleted = Boolean(daily.projection?.officialAttempt);
  const score = daily.projection?.officialAttempt?.normalizedScore;
  const hasSaved = !hasCompleted && Boolean(daily.projection?.progressRevision);
  const dailyLink = publishedDaily ? "/nba/today" : ownerSlot ? "/nba/today?mode=owner-test" : "/nba/play";
  const dailyLabel = dailyType ? NBA_DAILY_GAME_LABELS[dailyType] : "Basketball Daily";
  const dailyState = !dailyEnabled ? "RELEASE PENDING" : publishedDaily
    ? hasCompleted ? "COMPLETED" : hasSaved ? "IN PROGRESS" : "AVAILABLE"
    : "OWNER PREVIEW";

  return (
    <>
      <section className="home-section home-sport-hq home-sport-hq--nba nba-hq--owner-preview" data-home-section="nba-hq" aria-label="Basketball HQ">
        <header className="nba-hq-owner__heading">
          <h2>BASKETBALL HQ</h2>
          <small>2026–27 NBA</small>
        </header>

        <section className="nba-hq-owner__picks" aria-label="Basketball Picks">
          <h3>BASKETBALL PICKS</h3>
          <div className="nba-hq-owner__picks-grid">
            <div><small>YOUR PICKS</small><strong>{count == null ? "—" : `${count} OF ${NBA_FUTURES_SELECTIONS}`}</strong></div>
            <div><small>2026–27 RECORD</small><strong>—</strong><span>AWAITING RESULTS</span></div>
            <Link to="/nba/picks">VIEW PICKS →</Link>
          </div>
          <span className="nba-hq-owner__picks-note">{futures?.locked ? "FUTURES LOCKED" : "FUTURES OPEN"} · CUP AND PLAYOFF PICKS WILL APPEAR WHEN RELEASED</span>
        </section>

        <Link to={dailyLink} className="nba-hq-owner__daily" aria-label="Open Basketball Daily Challenge">
          <div>
            <span>NBA DAILY CHALLENGE <small>{dailyState}</small></span>
            <strong>{dailyLabel}</strong>
            <small>{publishedDaily && hasCompleted ? "Official result saved"
              : ownerSlot ? "Practice · Unranked"
              : dailyEnabled ? "Ready when you are" : "Official launch pending"}</small>
          </div>
          <div className="nba-hq-owner__daily-result">
            {hasCompleted && score != null ? <strong>{score}<small>/100</small></strong> : <strong>{dailyEnabled ? "PLAY" : "VIEW"}</strong>}
            <span>OPEN →</span>
          </div>
        </Link>

        <section className="nba-hq-owner__player" aria-label="NBA Player Spotlight">
          {weekly ? (
            <>
              <a href={weekly.player.profileUrl} className="nba-hq-owner__photo" target="_blank" rel="noreferrer" aria-label={`Open ${weekly.player.name} player profile`}>
                <img src={weekly.player.headshotUrl} alt={weekly.player.name} loading="lazy" />
              </a>
              <div className="nba-hq-owner__player-copy">
                <span>PLAYER SPOTLIGHT</span>
                <h3><a href={weekly.player.profileUrl} target="_blank" rel="noreferrer">{weekly.player.name}</a></h3>
                <strong>{weekly.player.team} · {weekly.player.position}</strong>
                <small className="nba-hq-owner__week-context">{nbaSpotlightWeekLabel(weekly.weekStart, weekly.weekEnd)} · {weekly.player.gamesPlayed} GAMES · WEEKLY AVG</small>
                <div className="nba-hq-owner__stats">
                  {weekly.player.stats.map(item => <div key={item.label}><b>{item.value}</b><small>{item.label}</small></div>)}
                </div>
                <a href={weekly.player.highlightUrl ?? "https://www.youtube.com/@NBA"} className="nba-hq-owner__watch" target="_blank" rel="noreferrer">{weekly.player.highlightUrl ? "WATCH HIGHLIGHT ↗" : "NBA CHANNEL ↗"}</a>
              </div>
            </>
          ) : (
            <div className="nba-hq-owner__weekly-pending">
              <span>PLAYER SPOTLIGHT</span><h3>First weekly selection in progress</h3>
            </div>
          )}
        </section>

        <section className="nba-hq-owner__team" aria-label="NBA Team of the Week">
          <header><h3>TEAM OF THE WEEK</h3>{weekly ? <small>{nbaSpotlightWeekLabel(weekly.weekStart, weekly.weekEnd)}</small> : null}</header>
          {weekly ? (
            <a href={weekly.team.profileUrl} target="_blank" rel="noreferrer" className="nba-hq-owner__team-link" aria-label={`View ${weekly.team.name} 2026–27 season on Basketball Reference`}>
              <img src={weekly.team.logoUrl} alt="" loading="lazy"/>
              <div className="nba-hq-owner__team-copy">
                <strong>{weekly.team.name}</strong><small>{weekly.team.record} THIS WEEK</small>
                <div className="nba-hq-owner__team-stats">
                  <span><b>{weekly.team.ppg}</b><small>PPG</small></span>
                  <span><b>{weekly.team.oppPpg}</b><small>OPP PPG</small></span>
                  <span><b>{weekly.team.netMargin}</b><small>AVG MARGIN</small></span>
                </div>
              </div>
            </a>
          ) : <p className="nba-hq-owner__team-pending">The week's best team will appear here after verified final games are collected.</p>}
        </section>
      </section>

      {!hideChampionship ? (
      <section className="home-section nba-hq-owner__championship" aria-label="NBA Championship standings">
        <h2>Championship standings</h2>
        <div className="nba-hq-owner__championship-kicker">BASKETBALL CHAMPIONSHIP · 2026–27</div>
        <div className="nba-hq-owner__championship-hero">
          <div className="nba-hq-owner__championship-honor"><span aria-hidden="true">🏆</span> SCORING PENDING</div>
          <div className="nba-hq-owner__championship-rank">
            <strong>—</strong><span>RANK UNAVAILABLE</span>
          </div>
          <div className="nba-hq-owner__championship-score">
            <strong>—</strong><span>SEASON SCORE</span>
          </div>
        </div>
        <div className="nba-hq-owner__championship-foot">
          <small>Futures results have not settled</small>
          <Link to="/championship/nba">VIEW ALL ↗</Link>
        </div>
      </section>
      ) : null}
    </>
  );
}
