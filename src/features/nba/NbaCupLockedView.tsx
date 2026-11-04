import type {CSSProperties} from "react";
import {NBA_TEAM_BY_ID} from "./nbaFutures";
import {NbaTeamMark,nbaTeamColor} from "./nbaTeamBranding";
import {CUP_GROUPS,cupPickCount,type CupGroupPicks} from "./nbaCup2026";
import type {CupStandingMember} from "./nbaCupRepository";

type Props={
  picks:CupGroupPicks;
  members:CupStandingMember[];
  loading:boolean;
  error:string;
};

/** Read-only 2026 group-pick presentation after the server's manual lock. */
export function NbaCupLockedView({picks,members,loading,error}:Props){
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
              <strong>{NBA_TEAM_BY_ID.get(member.picks[group.id]??"")?.name??"No pick"}</strong>
            </div>)}
          </div>
        </details>)}
      </div>
    </details>
    <div className="nba-cup__locked-section-heading">
      <h2>YOUR CUP PICKS</h2><small>6 PENDING</small>
    </div>
    <div className="nba-cup__locked-cards">
      {CUP_GROUPS.map(group=>{
        const teamId=picks[group.id]??"";
        const team=NBA_TEAM_BY_ID.get(teamId);
        return <section key={group.id} className="nba-cup__locked-card" aria-label={group.name}
          style={{"--team-accent":nbaTeamColor(teamId)} as CSSProperties}>
          <header><strong>{group.name.toUpperCase()}</strong><span>PENDING</span></header>
          <div className="nba-cup__locked-selection">
            {team?<NbaTeamMark team={team}/>:null}
            <div><strong>{team?.name??"No pick saved"}</strong><small>{team?"✓ YOUR PICK":"NO PICK"}</small></div>
          </div>
        </section>;
      })}
    </div>
  </div>;
}
