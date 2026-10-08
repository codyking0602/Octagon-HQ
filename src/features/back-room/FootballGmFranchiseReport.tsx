import { useState } from "react";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmMoney,
  footballGmPlayoffFinishLabel,
  footballGmPlayerById,
  footballGmProjectedGradeForPlayer,
  type FootballGmPlayer,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
} from "./footballGmEngine";
import {
  footballGmAdjustedRosterCap,
  footballGmAdjustedSalaryForPlayer,
  footballGmFinalResultV2,
  footballGmSeasonRecordLabel,
  type FootballGmNegotiationConsequences,
  type FootballGmSeasonResultV2,
} from "./footballGmStrategy";

export interface FootballGmReportRun {
  seed: string;
  roster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
  negotiationConsequences: FootballGmNegotiationConsequences;
  resolvedSeasons?: readonly FootballGmSeasonResultV2[];
}

function tier(grade: number) {
  if (grade >= 94) return "ELITE";
  if (grade >= 89) return "IMPACT";
  if (grade >= 83) return "STARTER";
  return "DEPTH";
}

function outlook(player: FootballGmPlayer) {
  return player.outlook === "ELITE UPSIDE" ? "RISING" : player.outlook;
}

function finalRoster(run: FootballGmReportRun) {
  return run.finalRoster.length ? run.finalRoster : run.roster;
}

function slotEntry(roster: readonly FootballGmRosterEntry[], slot: FootballGmRosterSlot) {
  return roster.find((entry) => entry.slot === slot) ?? null;
}

function snapshot(run: FootballGmReportRun) {
  const end = finalRoster(run);
  const result = footballGmFinalResultV2({
    seed: run.seed,
    yearOneRoster: run.roster,
    finalRoster: end,
    resolvedSeasons: run.resolvedSeasons,
  });
  let retained = 0;
  let tradeAdds = 0;
  let freeAgentAdds = 0;
  for (const slot of FOOTBALL_GM_ROSTER_SLOTS) {
    const start = slotEntry(run.roster, slot);
    const finish = slotEntry(end, slot);
    if (start?.playerId === finish?.playerId) retained += 1;
    else if (finish?.acquired === "trade") tradeAdds += 1;
    else if (finish) freeAgentAdds += 1;
  }
  return {
    result,
    end,
    retained,
    changed: FOOTBALL_GM_ROSTER_SLOTS.length - retained,
    tradeAdds,
    freeAgentAdds,
    year3Payroll: footballGmAdjustedRosterCap(end, 3, run.seed, run.negotiationConsequences),
  };
}

function tierPill(player: FootballGmPlayer, year: 1 | 3) {
  const value = tier(footballGmProjectedGradeForPlayer(player, year));
  return <span className={"football-gm__quality-pill quality-" + value.toLowerCase()}>{value}</span>;
}

function outlookPill(player: FootballGmPlayer) {
  const value = outlook(player);
  const tone = value === "RISING" ? "rising" : value === "DECLINE RISK" ? "decline" : "stable";
  return <span className={"football-gm__outlook-pill outlook-" + tone}>{value}</span>;
}

function contractPill(player: FootballGmPlayer) {
  const value = player.gameContract === "3YR"
    ? "SALARY LOCKED"
    : player.extensionRisk === "LOCKED"
      ? "1YR"
      : player.extensionRisk + " RISK";
  return <span className={"football-gm-report__contract-pill risk-" + player.extensionRisk.toLowerCase()}>{value}</span>;
}

function EvolutionRow({ slot, run }: { slot: FootballGmRosterSlot; run: FootballGmReportRun }) {
  const end = finalRoster(run);
  const startEntry = slotEntry(run.roster, slot);
  const endEntry = slotEntry(end, slot);
  const startPlayer = startEntry ? footballGmPlayerById(startEntry.playerId) : null;
  const endPlayer = endEntry ? footballGmPlayerById(endEntry.playerId) : null;
  if (!startPlayer || !endPlayer) return null;
  const changed = startPlayer.id !== endPlayer.id;
  const move = !changed ? "RETAINED" : endEntry?.acquired === "trade" ? "TRADE" : "FREE AGENCY";
  const endSalary = footballGmAdjustedSalaryForPlayer(endPlayer, 3, run.seed, run.negotiationConsequences);

  return (
    <article className="football-gm-report__evolution-row">
      <b>{slot}</b>
      <div>
        <small>YEAR 1</small>
        <strong>{startPlayer.name}</strong>
        <em>{startPlayer.team} · {footballGmMoney(startPlayer.salaryWindow[0])}</em>
        <span className="football-gm-report__pills">{tierPill(startPlayer, 1)}{outlookPill(startPlayer)}{contractPill(startPlayer)}</span>
      </div>
      <span className={"football-gm-report__move" + (changed ? " is-change" : "")}>{move}<i>→</i></span>
      <div className="is-final">
        <small>YEAR 3</small>
        <strong>{endPlayer.name}</strong>
        <em>{endPlayer.team} · {footballGmMoney(endSalary)}</em>
        <span className="football-gm-report__pills">{tierPill(endPlayer, 3)}{outlookPill(endPlayer)}{contractPill(endPlayer)}</span>
      </div>
    </article>
  );
}

function CoreReport({ name, run }: { name: string; run: FootballGmReportRun }) {
  const snap = snapshot(run);
  const moves = FOOTBALL_GM_ROSTER_SLOTS.flatMap((slot) => {
    const before = slotEntry(run.roster, slot);
    const after = slotEntry(snap.end, slot);
    const left = before ? footballGmPlayerById(before.playerId) : null;
    const right = after ? footballGmPlayerById(after.playerId) : null;
    if (!left || !right || left.id === right.id) return [];
    return [{ slot, left, right, acquired: after?.acquired }];
  });

  return (
    <section className="gm-result__front-office" aria-label={name + " front office"}>
      <div className="gm-result__front-office-heading">
        <div><small>FRANCHISE ARC · YEAR 3 CORE</small><h2>{name.toUpperCase()}</h2></div>
        <strong>{snap.retained}/7 <small>Original core</small></strong>
      </div>
      <div className="gm-result__final-roster" aria-label={name + " Year 3 roster"}>
        {FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
          const entry = slotEntry(snap.end, slot);
          const player = entry ? footballGmPlayerById(entry.playerId) : null;
          if (!player) return null;
          const salary = footballGmAdjustedSalaryForPlayer(player, 3, run.seed, run.negotiationConsequences);
          const changed = slotEntry(run.roster, slot)?.playerId !== entry?.playerId;
          return (
            <div className="gm-result__player" key={slot}>
              <b>{slot}</b>
              <span><strong>{player.name}</strong><small>{player.team} · {footballGmMoney(salary)}</small></span>
              <span className="gm-result__player-meta">{tierPill(player, 3)}{changed ? <small className="gm-result__changed">NEW</small> : null}</span>
            </div>
          );
        })}
      </div>
      <div className="gm-result__moves">
        <div className="gm-result__section-heading"><strong>OFFSEASON TRANSACTIONS</strong><small>{snap.changed} position{snap.changed === 1 ? "" : "s"} changed · {snap.tradeAdds} trades · {snap.freeAgentAdds} FA</small></div>
        {moves.length ? moves.map((move) => (
          <div className="gm-result__move" key={move.slot}>
            <b>{move.slot}</b>
            <span><small>{move.acquired === "trade" ? "TRADE" : "FREE AGENCY"}</small><strong>{move.left.name} → {move.right.name}</strong></span>
          </div>
        )) : <p className="gm-result__quiet">All seven original players retained.</p>}
      </div>
      <details className="gm-result__expander football-gm-report__evolution">
        <summary>VIEW FULL ROSTER EVOLUTION <span>Y1 → Y3</span></summary>
        <div className="football-gm-report__evolution-rows">
          <h3>ROSTER EVOLUTION</h3>
          {FOOTBALL_GM_ROSTER_SLOTS.map((slot) => <EvolutionRow key={slot} slot={slot} run={run} />)}
        </div>
      </details>
    </section>
  );
}

function RecordLabel({ season }: { season: FootballGmSeasonResultV2 }) {
  const record = footballGmSeasonRecordLabel(season);
  return record
    ? <strong className="gm-result__record">{record} <small>W–L</small></strong>
    : <span className="gm-result__legacy-record">Record unavailable</span>;
}

export function FootballGmFranchiseReport({
  name,
  run,
  opponentName,
  opponentRun,
}: {
  name: string;
  run: FootballGmReportRun;
  opponentName?: string | null;
  opponentRun?: FootballGmReportRun | null;
}) {
  const [selectedFrontOffice, setSelectedFrontOffice] = useState<"mine" | "opponent">("mine");
  const own = snapshot(run);
  const opp = opponentRun ? snapshot(opponentRun) : null;
  const otherName = opponentName ?? "Opponent";
  const winner = opp
    ? own.result.score === opp.result.score ? "DEAD EVEN"
      : own.result.score > opp.result.score ? name.toUpperCase() + " WINS"
      : otherName.toUpperCase() + " WINS"
    : "YOUR THREE-YEAR GM RESULT";
  const displayedName = selectedFrontOffice === "opponent" && opponentRun ? otherName : name;
  const displayedRun = selectedFrontOffice === "opponent" && opponentRun ? opponentRun : run;

  return (
    <div className="football-gm-report gm-result">
      <section className="gm-result__summary surface-card" aria-label="Final GM score and comparison">
        <header className="gm-result__headline">
          <small>THE GM · THREE-YEAR FINAL</small>
          <h1>{winner}</h1>
        </header>
        <div className={"gm-result__scores" + (opp ? " is-versus" : "")}>
          <div className={opp && own.result.score >= opp.result.score ? "is-winner" : ""}>
            <small>{name.toUpperCase()}</small><strong>{own.result.score.toFixed(1)}</strong><em>GM SCORE</em>
          </div>
          {opp ? (
            <>
              <span className="gm-result__versus">VS</span>
              <div className={opp.result.score > own.result.score ? "is-winner" : ""}>
                <small>{otherName.toUpperCase()}</small><strong>{opp.result.score.toFixed(1)}</strong><em>GM SCORE</em>
              </div>
            </>
          ) : null}
        </div>
        <div className="gm-result__season-comparison">
          <div className="gm-result__section-heading">
            <strong>{opp ? "THREE-YEAR COMPARISON" : "YOUR THREE SEASONS"}</strong>
            <small>OVR · REGULAR SEASON · PLAYOFF FINISH</small>
          </div>
          {own.result.seasons.map((season, index) => (
            <article className={"gm-result__season" + (opp ? " is-versus" : "")} key={season.year}>
              <small className="gm-result__season-number">YEAR {season.year}</small>
              <div className="gm-result__season-side">
                {opp ? <small className="gm-result__season-owner">{name.toUpperCase()}</small> : null}
                <strong className="gm-result__overall">{own.result.teamOveralls[index]} <span>OVR</span></strong>
                <RecordLabel season={season} />
                <span className="gm-result__finish">{footballGmPlayoffFinishLabel(season.finish)}</span>
              </div>
              {opp ? (
                <div className="gm-result__season-side">
                  <small className="gm-result__season-owner">{otherName.toUpperCase()}</small>
                  <strong className="gm-result__overall">{opp.result.teamOveralls[index]} <span>OVR</span></strong>
                  <RecordLabel season={opp.result.seasons[index]!} />
                  <span className="gm-result__finish">{footballGmPlayoffFinishLabel(opp.result.seasons[index]!.finish)}</span>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        <details className="gm-result__expander gm-result__scoring">
          <summary>HOW YOUR GM SCORE IS CALCULATED <span>55% ROSTER · 45% PLAYOFFS</span></summary>
          <p>OVR measures team strength. Final GM score combines 55% average team OVR and 45% three-year playoff résumé. Payroll is context, not extra points.</p>
          <div className="gm-result__math-row"><span>AVERAGE TEAM OVR · 55%</span><b>{own.result.rosterManagementScore.toFixed(1)}</b>{opp ? <b>{opp.result.rosterManagementScore.toFixed(1)}</b> : null}</div>
          <div className="gm-result__math-row"><span>PLAYOFF RÉSUMÉ · 45%</span><b>{own.result.resumeScore.toFixed(1)}</b>{opp ? <b>{opp.result.resumeScore.toFixed(1)}</b> : null}</div>
          <div className="gm-result__math-row"><span>Final GM score</span><b>{own.result.score.toFixed(1)}</b>{opp ? <b>{opp.result.score.toFixed(1)}</b> : null}</div>
          <div className="gm-result__math-row"><span>Year 3 payroll</span><b>{footballGmMoney(own.year3Payroll)}</b>{opp ? <b>{footballGmMoney(opp.year3Payroll)}</b> : null}</div>
          <div className="gm-result__math-row"><span>CAP REMAINING</span><b>{footballGmMoney(FOOTBALL_GM_CAP - own.year3Payroll)}</b>{opp ? <b>{footballGmMoney(FOOTBALL_GM_CAP - opp.year3Payroll)}</b> : null}</div>
        </details>
      </section>

      <section className="gm-result__roster-card surface-card" aria-label="Franchise roster breakdown">
        <div className="gm-result__section-heading">
          <strong>WHAT YOU BUILT</strong>
          <small>YOUR FRONT OFFICE</small>
        </div>
        {opp && opponentRun ? (
          <div className="gm-result__franchise-tabs" role="group" aria-label="Choose franchise">
            <button type="button" aria-pressed={selectedFrontOffice === "mine"} className={selectedFrontOffice === "mine" ? "is-active" : ""} onClick={() => setSelectedFrontOffice("mine")}>{name.toUpperCase()}</button>
            <button type="button" aria-pressed={selectedFrontOffice === "opponent"} className={selectedFrontOffice === "opponent" ? "is-active" : ""} onClick={() => setSelectedFrontOffice("opponent")}>{otherName.toUpperCase()}</button>
          </div>
        ) : null}
        <CoreReport name={displayedName} run={displayedRun} />
      </section>
    </div>
  );
}
