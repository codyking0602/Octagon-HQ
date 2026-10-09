import { useState } from "react";
import {
  CFB_GM_BUDGETS, CFB_GM_VERSION, cfbGmEffectiveGrade, cfbGmMoney,
  cfbGmPlayer, cfbGmSeason, cfbGmSpent, cfbGmTeamGrade,
  type CfbGmRun,
} from "./footballCfbGmEngine";
import { cfbGmDevelop } from "./footballCfbGmDevelopment";
import { cfbGmSimulateCollegeSeason } from "./footballCfbGmSimulation";

/** Deliberately mounted only *after* the owner-control route guard.
 * This can reveal authority grades, seeds, outcomes and game economy decisions.
 * Never mount this in public NFL/CFB gameplay or shared result screens.
 */
export function FootballCfbGmDiagnostics({run}: {run:CfbGmRun}) {
  const [open,setOpen]=useState(false);
  const first=run.roster.length===7?cfbGmSeason(run,1):null;
  const second=run.finalRoster.length===7?cfbGmSeason(run,2):null;
  const rows=[...run.roster,...run.finalRoster].map(row=>{
    const player=cfbGmPlayer(row.playerId);
    return player?{row,player}:null;
  }).filter((r):r is NonNullable<typeof r>=>Boolean(r));
  // Heavy scenario audit is calculated only when the owner expands the panel.
  const scenarios=open?[82,86,90,94].map(strength=>{
    let wins=0,cfp=0,titles=0;
    for(let index=0;index<64;index++) {
      const season=cfbGmSimulateCollegeSeason("owner-cfp-audit-"+index,1,strength);
      wins+=season.wins;
      cfp+=Number(season.cfpSeed!==null);
      titles+=Number(season.finish==="National Champion");
    }
    return {strength,meanWins:wins/64,cfp:cfp/64,titles:titles/64};
  }):[];

  return <details className="football-gm__cfb-diagnostics surface-card" open={open}
    onToggle={(event)=>setOpen(event.currentTarget.open)} data-owner-diagnostics="cfb">
    <summary>OWNER DIAGNOSTICS <small>PRIVATE · SOURCE GRADES VISIBLE</small></summary>
    {open?<div>
      <p>Only the authorized owner sees this trace. These are game calculations, not published NIL agreements, real transfers or actual CFP predictions.</p>
      <dl>
        <div><dt>Preview build</dt><dd>{CFB_GM_VERSION}</dd></div>
        <div><dt>Seed</dt><dd>{run.seed}</dd></div>
        <div><dt>Phase / Budget</dt><dd>{run.phase} · {run.budget} ({cfbGmMoney(CFB_GM_BUDGETS[run.budget])})</dd></div>
        <div><dt>Original draft</dt><dd>{run.roster.length}/7 · {cfbGmMoney(cfbGmSpent(run.roster,1))} spent</dd></div>
        <div><dt>Current team-grade</dt><dd>{cfbGmTeamGrade(run.roster,1,run.seed).toFixed(1)} Y1
          {run.finalRoster.length? " / " + cfbGmTeamGrade(run.finalRoster,2,run.seed).toFixed(1)+" Y2":""}</dd></div>
        <div><dt>CFP outcomes</dt><dd>{first?first.finish+" ("+first.wins+"-"+first.losses+")":"Draft incomplete"}
          {second? " → "+second.finish+" ("+second.wins+"-"+second.losses+")":""}</dd></div>
      </dl>
      <div className="football-gm__cfb-diagnostics-table" role="region" aria-label="Individual source grades and development audit" tabIndex={0}>
        <table><thead><tr><th>Year / Slot</th><th>Player</th><th>Family</th><th>HQ</th><th>2027</th><th>Y1 NIL</th><th>2027 base</th></tr></thead>
          <tbody>{rows.map(({row,player},index)=><tr key={index}>
            <td>{index<run.roster.length?"2026":"2027"} / {row.slot}</td>
            <td>{player.name} · {player.school}</td><td>{player.family}</td>
            <td>{player.currentGrade}</td>
            <td>{cfbGmEffectiveGrade(player,2,run.seed)}
              <small> ({cfbGmDevelop(player.id,player.currentGrade,player.classification,run.seed).delta>=0?"+":""}{cfbGmDevelop(player.id,player.currentGrade,player.classification,run.seed).delta})</small></td>
            <td>{cfbGmMoney(player.nilYear1)}</td><td>{cfbGmMoney(player.nilYear2)}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <h3>CFP calibration · 64 seasons per strength</h3>
      <div className="football-gm__cfb-diagnostics-table" role="region" aria-label="Seeded CFP calibration results" tabIndex={0}>
        <table><thead><tr><th>Strength</th><th>Avg wins</th><th>CFP rate</th><th>Title rate</th></tr></thead>
          <tbody>{scenarios.map(s=><tr key={s.strength}><td>{s.strength}</td><td>{s.meanWins.toFixed(1)}</td>
            <td>{(s.cfp*100).toFixed(1)}%</td><td>{(s.titles*100).toFixed(1)}%</td></tr>)}</tbody>
        </table>
      </div>
      <p>Never promote this diagnostic panel to non-owner routes. Development is simulated; 2026 Wheel grades are immutable authority.</p>
    </div>:null}
  </details>;
}
