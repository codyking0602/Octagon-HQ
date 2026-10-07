import {
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmMoney,
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
    year3Cap: footballGmAdjustedRosterCap(end, 3, run.seed, run.negotiationConsequences),
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
  const changedRows = FOOTBALL_GM_ROSTER_SLOTS.flatMap((slot) => {
    const startEntry = slotEntry(run.roster, slot);
    const endEntry = slotEntry(snap.end, slot);
    const startPlayer = startEntry ? footballGmPlayerById(startEntry.playerId) : null;
    const endPlayer = endEntry ? footballGmPlayerById(endEntry.playerId) : null;
    if (!startPlayer || !endPlayer || startPlayer.id === endPlayer.id) return [];
    return [{ slot, startPlayer, endPlayer, endEntry }];
  });

  return (
    <div className="football-gm-report__core">
      <section className="football-gm-report__timeline surface-card">
        <header><span><small>FRANCHISE ARC</small><strong>{name.toUpperCase()}</strong></span></header>
        <div className="football-gm-report__years">
          {snap.result.seasons.map((season, index) => (
            <article key={season.year}>
              <small>YEAR {season.year}</small>
              <strong>{snap.result.teamOveralls[index]} OVR</strong>
              <span>{season.finish}</span>
            </article>
          ))}
        </div>
        <div className="football-gm-report__offseason-marker">
          <small>THE OFFSEASON</small>
          <strong>{snap.changed} POSITION{snap.changed === 1 ? "" : "S"} CHANGED</strong>
          <span>{snap.tradeAdds} trade addition{snap.tradeAdds === 1 ? "" : "s"} · {snap.freeAgentAdds} free-agent addition{snap.freeAgentAdds === 1 ? "" : "s"} · {snap.retained}/7 original core retained</span>
        </div>
      </section>

      <section className="football-gm-report__evolution surface-card">
        <header><span><small>ROSTER EVOLUTION</small><strong>WHAT YOU BUILT</strong></span><b>Y1 → Y3</b></header>
        <div>{FOOTBALL_GM_ROSTER_SLOTS.map((slot) => <EvolutionRow key={slot} slot={slot} run={run} />)}</div>
      </section>

      <section className="football-gm-report__ledger surface-card">
        <header><small>OFFSEASON TRANSACTIONS</small><strong>HOW THE CORE CHANGED</strong></header>
        <div>
          {changedRows.length ? changedRows.map((row) => {
            const action = row.endEntry?.acquired === "trade" ? "TRADE" : "FREE AGENCY";
            return (
              <article key={row.slot}>
                <b>{action}</b>
                <span><small>{row.slot}</small><strong>{row.startPlayer.name} → {row.endPlayer.name}</strong></span>
              </article>
            );
          }) : (
            <article><b>RETAINED</b><span><small>ALL 7</small><strong>No offseason starter changes</strong></span></article>
          )}
        </div>
      </section>
    </div>
  );
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
  const own = snapshot(run);
  const opp = opponentRun ? snapshot(opponentRun) : null;
  const winner = opp
    ? own.result.score === opp.result.score
      ? "DEAD EVEN"
      : own.result.score > opp.result.score
        ? name.toUpperCase() + " WINS"
        : (opponentName ?? "OPPONENT").toUpperCase() + " WINS"
    : null;

  return (
    <div className="football-gm-report">
      <section className="football-gm-report__hero surface-card">
        <p className="eyebrow">THE GM · 3-YEAR RESULT</p>
        <h1>{winner ?? own.result.score.toFixed(1)}</h1>
        {opp ? (
          <div className="football-gm-report__scoreboard">
            <article><small>{name} · GM SCORE</small><strong>{own.result.score.toFixed(1)}</strong></article>
            <span>VS</span>
            <article><small>{opponentName ?? "Opponent"} · GM SCORE</small><strong>{opp.result.score.toFixed(1)}</strong></article>
          </div>
        ) : <strong className="football-gm-report__score-label">GM SCORE · TEAM BUILD + 3-YEAR RÉSUMÉ</strong>}
      </section>

      <CoreReport name={name} run={run} />

      {opp && opponentRun ? (
        <>
          <section className="football-gm-report__comparison surface-card">
            <header><small>WHERE THE MATCH WAS WON</small><strong>FRANCHISE COMPARISON</strong></header>
            <div className="football-gm-report__comparison-head"><span>{name}</span><b>VS</b><span>{opponentName ?? "Opponent"}</span></div>
            {own.result.seasons.map((season, index) => (
              <div key={season.year} className="football-gm-report__comparison-row">
                <span><b>{own.result.teamOveralls[index]} OVR</b><small>{season.finish}</small></span>
                <strong>Y{season.year}</strong>
                <span><b>{opp.result.teamOveralls[index]} OVR</b><small>{opp.result.seasons[index]!.finish}</small></span>
              </div>
            ))}
            <div className="football-gm-report__comparison-row">
              <span><b>{own.retained}/7</b><small>Original core</small></span><strong>CORE</strong><span><b>{opp.retained}/7</b><small>Original core</small></span>
            </div>
            <div className="football-gm-report__comparison-row">
              <span><b>{footballGmMoney(own.year3Cap)}</b><small>Year 3 cap</small></span><strong>CAP</strong><span><b>{footballGmMoney(opp.year3Cap)}</b><small>Year 3 cap</small></span>
            </div>
            <div className="football-gm-report__comparison-row is-score">
              <span><b>{own.result.score.toFixed(1)}</b><small>GM Score</small></span><strong>FINAL</strong><span><b>{opp.result.score.toFixed(1)}</b><small>GM Score</small></span>
            </div>
          </section>

          <details className="football-gm-report__opponent surface-card">
            <summary>VIEW {(opponentName ?? "OPPONENT").toUpperCase()}'S FRONT OFFICE</summary>
            <CoreReport name={opponentName ?? "Opponent"} run={opponentRun} />
          </details>
        </>
      ) : null}
    </div>
  );
}
