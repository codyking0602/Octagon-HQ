import type {CSSProperties} from "react";
import {NBA_TEAM_BY_ID} from "./nbaFutures";
import {NbaTeamMark,nbaTeamColor} from "./nbaTeamBranding";
import {CUP_GROUPS,cupPickCount,type CupGroupPicks} from "./nbaCup2026";
import {
  CUP_GAMES,cupGameDateLabel,cupGameScore,cupGameStatus,cupGamesForTeam,
  cupGroupRecords,nextCupGame,nextCupNight,
  type CupGame,type CupScoreFeed,
} from "./nbaCupTracker";
import type {CupStandingMember} from "./nbaCupRepository";

type Props={
  picks:CupGroupPicks;
  members:CupStandingMember[];
  loading:boolean;
  error:string;
  scoreFeed?:CupScoreFeed|null;
  scoresLoading?:boolean;
};

function shortName(teamId:string){
  return NBA_TEAM_BY_ID.get(teamId)?.name??teamId;
}
function dateLabel(date:string){
  return new Intl.DateTimeFormat("en-US",{
    timeZone:"America/Chicago",weekday:"short",month:"short",day:"numeric",
  }).format(new Date(date+"T18:00:00Z"));
}
function gameProgress(game:CupGame,feed:CupScoreFeed|null){
  const score=cupGameScore(game,feed);
  if(score&&score.status==="final")return "FINAL · "+score.awayScore+"–"+score.homeScore;
  if(score&&score.status==="live")return "LIVE · "+score.awayScore+"–"+score.homeScore+(score.detail?" · "+score.detail:"");
  return cupGameDateLabel(game);
}
function GameLine({game,feed,chosen,featuredPick}:{
  game:CupGame;feed:CupScoreFeed|null;chosen?:string;featuredPick?:string;
}){
  const opponent=chosen?(chosen===game.away?game.home:game.away):null;
  const label=opponent
    ?(chosen===game.away?"at ":"vs ")+shortName(opponent)
    :shortName(game.away)+" @ "+shortName(game.home);
  const status=cupGameStatus(game,feed);
  const score=cupGameScore(game,feed);
  if(chosen&&score&&score.status==="final"&&score.homeScore!==null&&score.awayScore!==null){
    const pickedScore=chosen===game.away?score.awayScore:score.homeScore;
    const opponentScore=chosen===game.away?score.homeScore:score.awayScore;
    const won=pickedScore>opponentScore;
    return <div className="nba-cup__game-final" data-status="final">
      <div className="nba-cup__game-final-main">
        <strong className="nba-cup__game-name">{label}</strong>
        <strong className="nba-cup__game-final-score">{pickedScore}–{opponentScore}</strong>
      </div>
      <div className="nba-cup__game-final-meta">
        <span>{new Intl.DateTimeFormat("en-US",{timeZone:"America/Chicago",month:"short",day:"numeric"}).format(new Date(game.startAt))} · FINAL</span>
        <strong className={won?"is-win":"is-loss"}>{won?"WIN":"LOSS"}</strong>
      </div>
    </div>;
  }
  return <div className={"nba-cup__game-line"+(chosen?" is-chosen":"")+(featuredPick?" is-featured":"")} data-status={status}>
    {featuredPick&&NBA_TEAM_BY_ID.get(featuredPick)?<span className="nba-cup__game-pick-mark"><NbaTeamMark team={NBA_TEAM_BY_ID.get(featuredPick)!}/></span>:null}
    <span className="nba-cup__game-label-stack">
      <span className="nba-cup__game-name">{label}</span>
      {featuredPick?<small>✓ YOUR PICK</small>:null}
    </span>
    <span className={"nba-cup__game-date"+(status==="live"?" is-live":"")}>{gameProgress(game,feed)}</span>
  </div>;
}

/** Post-lock follow-along UI; standings are provisional and never grade group winners. */
export function NbaCupLockedView({picks,members,loading,error,scoreFeed=null,scoresLoading=false}:Props){
  const now=Date.now();
  const nextDate=nextCupNight(scoreFeed,now);
  const pickedTeams=new Set(Object.values(picks).filter(Boolean));
  const nightGames=nextDate?CUP_GAMES.filter(game=>game.date===nextDate):[];
  const followed=nightGames.filter(game=>pickedTeams.has(game.away)||pickedTeams.has(game.home));
  const otherGames=nightGames.filter(game=>!followed.some(pickGame=>pickGame.id===game.id));
  const preview=followed;
  const anyScoresMissing=(scoreFeed?.failedDates.length??0)>0;

  return <div className="nba-cup__locked" data-testid="nba-cup-locked-view">
    <details className="nba-cup__locked-hub">
      <summary>
        <div className="nba-cup__locked-heading">
          <strong>PICKS &amp; STANDINGS</strong>
          <small>0 FINAL · 6 REMAINING</small>
        </div>
        <div className="nba-cup__locked-scorecard">
          <div><strong>—</strong><small>CORRECT PICKS</small></div>
          <div><strong>—</strong><small>GROUP RANK</small></div>
          <div><strong>{cupPickCount(picks)}/6</strong><small>PICKS MADE</small></div>
        </div>
        <div className="nba-cup__locked-foot">
          <small>⌁ PICKS LOCKED · {loading?"…":members.length} MEMBERS</small>
          <span>VIEW STANDINGS</span>
        </div>
      </summary>
      <div className="nba-cup__locked-member-list">
        {error?<p role="alert">{error}</p>:null}
        {loading?<p role="status">Loading Cup standings…</p>:null}
        {!loading&&!error&&members.length===0?<p>No group entries available.</p>:null}
        {members.map(member=><details key={member.profile_id} className="nba-cup__locked-member">
          <summary><strong>{member.display_name}</strong><span>{cupPickCount(member.picks)}/6 PICKS</span></summary>
          <div className="nba-cup__locked-member-picks">
            {CUP_GROUPS.map(group=><div key={group.id}>
              <span>{group.name.replace(" Group "," ")}</span>
              <strong>{shortName(member.picks[group.id]??"")||"No pick"}</strong>
            </div>)}
          </div>
        </details>)}
      </div>
    </details>

    {nextDate?<section className="nba-cup__next-night" aria-label="Next NBA Cup night">
      <header><strong>NEXT CUP NIGHT</strong><span>{dateLabel(nextDate)} · {nightGames.length} GAMES</span></header>
      <div className="nba-cup__next-night-games">
        {preview.length?<p className="nba-cup__night-pick-count">{preview.length} OF YOUR PICKS PLAYING</p>:null}
        {preview.map(game=><GameLine key={game.id} game={game} feed={scoreFeed} featuredPick={pickedTeams.has(game.away)?game.away:game.home}/>) }
        {!preview.length?<p>See all NBA Cup group games below.</p>:null}
      </div>
      {otherGames.length>0?<details className="nba-cup__night-more">
        <summary>{preview.length?"OTHER ":"ALL "}{otherGames.length} CUP MATCHUPS <span aria-hidden="true">⌄</span></summary>
        <div>{otherGames.map(game=><GameLine key={game.id} game={game} feed={scoreFeed}/>)}</div>
      </details>:null}
    </section>:null}

    <div className="nba-cup__locked-section-heading">
      <h2>YOUR CUP PICKS</h2><small>{scoresLoading?"UPDATING SCORES":"6 GROUPS"}</small>
    </div>
    {anyScoresMissing?<p className="nba-cup__scores-note" role="status">Some NBA game results are temporarily unavailable. Group records may be incomplete.</p>:null}
    <div className="nba-cup__locked-cards">
      {CUP_GROUPS.map(group=>{
        const teamId=picks[group.id]??"";
        const team=NBA_TEAM_BY_ID.get(teamId);
        const nextGame=teamId?nextCupGame(teamId,scoreFeed,now):null;
        const games=teamId?cupGamesForTeam(teamId):[];
        const groupGames=CUP_GAMES.filter(game=>game.groupId===group.id);
        const records=cupGroupRecords(group.id,scoreFeed);
        const live=groupGames.some(game=>cupGameStatus(game,scoreFeed)==="live");
        const teamRecord=records.find(record=>record.teamId===teamId);
        const missingGroupResults=groupGames.some(game=>scoreFeed?.failedDates.includes(game.date));
        const recordLabel=scoreFeed&&teamRecord&&!missingGroupResults
          ?teamRecord.wins+"–"+teamRecord.losses+" · "+(teamRecord.differential>0?"+":"")+teamRecord.differential
          :"—";
        return <details key={group.id} className="nba-cup__locked-card" aria-label={group.name}
          style={{"--team-accent":nbaTeamColor(teamId)} as CSSProperties}>
          <summary>
            <header><strong>{group.name.toUpperCase()}</strong><span className={live?"is-live":""} aria-label={"Cup record: "+recordLabel}>{recordLabel}</span></header>
            <div className="nba-cup__locked-selection">
              {team?<NbaTeamMark team={team}/>:null}
              <div><strong>{team?.name??"No pick saved"}</strong><small>{team?"✓ YOUR PICK":"NO PICK"}</small></div>
            </div>
            <div className="nba-cup__locked-next">
              <span>{nextGame
                ?"NEXT CUP GAME · "+(teamId===nextGame.away?"at ":"vs ")+shortName(teamId===nextGame.away?nextGame.home:nextGame.away)
                :games.length?"GROUP PLAY COMPLETE":"NO PICK SAVED"}</span>
              <strong>{nextGame?cupGameStatus(nextGame,scoreFeed)==="live"?"LIVE":cupGameDateLabel(nextGame):"⌄"}</strong>
              <span className="nba-cup__locked-chevron" aria-hidden="true">⌄</span>
            </div>
          </summary>
          <div className="nba-cup__group-expanded">
            <div className="nba-cup__group-subheading"><strong>GROUP STANDINGS</strong><small>W–L · POINT DIFF</small></div>
            <div className="nba-cup__group-table">
              {records.map(record=><div key={record.teamId} className={record.teamId===teamId?"is-my-pick":""}>
                <span>{record.teamId===teamId?"✓ ":""}{shortName(record.teamId)}</span>
                <strong>{scoreFeed?record.wins+"–"+record.losses:"—"}</strong>
                <small>{scoreFeed?(record.differential>0?"+":"")+record.differential:"—"}</small>
              </div>)}
            </div>
            <p className="nba-cup__standings-note">Provisional Cup-only records. Official NBA tiebreakers decide group winners; picks are not graded yet.</p>
            <div className="nba-cup__group-subheading"><strong>YOUR TEAM'S CUP GAMES</strong><small>{games.length} TOTAL</small></div>
            <div className="nba-cup__group-games">
              {games.map(game=><GameLine key={game.id} game={game} feed={scoreFeed} chosen={teamId}/>)}
            </div>
            <details className="nba-cup__group-more">
              <summary>ALL {groupGames.length} GROUP MATCHUPS <span aria-hidden="true">⌄</span></summary>
              <div>{groupGames.map(game=><GameLine key={game.id} game={game} feed={scoreFeed}/>)}</div>
            </details>
          </div>
        </details>;
      })}
    </div>
    <div className="nba-cup__tracker-source">
      Official NBA Cup group schedule · Scores via ESPN
      <a href="https://www.nba.com/news/emirates-nba-cup-key-dates-schedule" target="_blank" rel="noreferrer">View NBA schedule ↗</a>
    </div>
  </div>;
}
