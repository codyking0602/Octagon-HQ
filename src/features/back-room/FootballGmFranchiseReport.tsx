import {
  FOOTBALL_GM_CAP,
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
} from "./footballGmStrategy";

export interface FootballGmReportRun {
  seed: string;
  roster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
  negotiationConsequences: FootballGmNegotiationConsequences;
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

function finishRank(finish: string) {
  if (finish === "Champion") return 5;
  if (finish === "Super Bowl Loss") return 4;
  if (finish === "Conference Championship") return 3;
  if (finish === "Divisional") return 2;
  if (finish === "Wild Card") return 1;
  return 0;
}

function Snapshot(run: FootballGmReportRun) {
  const end = finalRoster(run);
  const result = footballGmFinalResultV2({
    seed: run.seed,
    yearOneRoster: run.roster,
    finalRoster: end,
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
  const changed = FOOTBALL_GM_ROSTER_SLOTS.length - retained;
  const year3Cap = footballGmAdjustedRosterCap(end, 3, run.seed, run.negotiationConsequences);
  const eliteCount = end.reduce((count, entry) => {
    const player = footballGmPlayerById(entry.playerId);
    return count + (player && tier(footballGmProjectedGradeForPlayer(player, 3)) === "ELITE" ? 1 : 0);
  }, 0);

  let identity = "BALANCED BUILDER";
  let identityCopy = "You mixed continuity with selective roster changes.";
  if (tradeAdds >= 2 || changed >= 5) {
    identity = "WHEELER-DEALER";
    identityCopy = "You reshaped the roster aggressively instead of standing pat.";
  } else if (retained >= 6) {
    identity = "BUILDER";
    identityCopy = "You trusted the core and let continuity do most of the work.";
  } else if (eliteCount >= 3 && year3Cap >= FOOTBALL_GM_CAP * .95) {
    identity = "STAR CHASER";
    identityCopy = "You spent near the ceiling to keep elite talent on the field.";
  } else if (year3Cap <= FOOTBALL_GM_CAP * .9 && result.seasons[2].teamGrade >= 89) {
    identity = "VALUE HUNTER";
    identityCopy = "You created a strong Year 3 roster without living at the cap ceiling.";
  } else if (changed >= 3) {
    identity = "RETOOLER";
    identityCopy = "You changed the weak spots while preserving a meaningful part of the original core.";
  }

  return { result, end, retained, changed, tradeAdds, freeAgentAdds, year3Cap, eliteCount, identity, identityCopy };
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

function CoreReport({ name, run, compact = false }: { name: string; run: FootballGmReportRun; compact?: boolean }) {
  const snap = Snapshot(run);
  const y1 = snap.result.seasons[0];
  const y3 = snap.result.seasons[2];
  const rows = FOOTBALL_GM_ROSTER_SLOTS.flatMap((slot) => {
    const startEntry = slotEntry(run.roster, slot);
    const endEntry = slotEntry(snap.end, slot);
    const startPlayer = startEntry ? footballGmPlayerById(startEntry.playerId) : null;
    const endPlayer = endEntry ? footballGmPlayerById(endEntry.playerId) : null;
    if (!startPlayer || !endPlayer) return [];
    return [{
      slot,
      startPlayer,
      endPlayer,
      changed: startPlayer.id !== endPlayer.id,
      delta: Math.round((footballGmProjectedGradeForPlayer(endPlayer, 3) - footballGmProjectedGradeForPlayer(startPlayer, 1)) * 10) / 10,
    }];
  });
  const changedRows = rows.filter((row) => row.changed);
  const best = [...(changedRows.length ? changedRows : rows)].sort((a, b) => b.delta - a.delta)[0] ?? null;
  const worst = [...rows].sort((a, b) => a.delta - b.delta)[0] ?? null;
  const gradeDelta = Math.round((y3.teamGrade - y1.teamGrade) * 10) / 10;
  const finishDelta = finishRank(y3.finish) - finishRank(y1.finish);
  const movement = gradeDelta > 0
    ? "improved " + gradeDelta.toFixed(1) + " points"
    : gradeDelta < 0
      ? "fell " + Math.abs(gradeDelta).toFixed(1) + " points"
      : "finished at the same grade";
  const finishCopy = finishDelta > 0
    ? "and advanced farther in the postseason"
    : finishDelta < 0
      ? "but finished with a worse postseason result"
      : "with the same postseason level";
  const bestCopy = best
    ? best.changed
      ? best.slot + ": " + best.startPlayer.name + " → " + best.endPlayer.name + " moved the slot " + (best.delta >= 0 ? "+" : "") + best.delta.toFixed(1) + " projected points by Year 3."
      : best.slot + ": keeping " + best.endPlayer.name + " produced your strongest three-year position arc (" + (best.delta >= 0 ? "+" : "") + best.delta.toFixed(1) + ")."
    : "Your roster finished without a measurable standout move.";
  const costCopy = worst
    ? worst.delta < 0
      ? worst.slot + " was the biggest drag: " + worst.startPlayer.name + " → " + worst.endPlayer.name + " finished " + Math.abs(worst.delta).toFixed(1) + " projected points lower by Year 3."
      : "No position finished below its Year 1 projected level."
    : "No material roster regression was detected.";

  return (
    <div className={"football-gm-report__core" + (compact ? " is-compact" : "")}>
      <section className="football-gm-report__timeline surface-card">
        <header><span><small>FRANCHISE ARC</small><strong>{name.toUpperCase()}</strong></span><b>{snap.identity}</b></header>
        <div className="football-gm-report__years">
          {snap.result.seasons.map((season) => (
            <article key={season.year}><small>YEAR {season.year}</small><strong>{season.teamGrade.toFixed(1)}</strong><span>{season.finish}</span></article>
          ))}
        </div>
        <p>{snap.identityCopy}</p>
        <div className="football-gm-report__offseason-marker">
          <small>THE OFFSEASON</small>
          <strong>{snap.changed} POSITION{snap.changed === 1 ? "" : "S"} CHANGED</strong>
          <span>{snap.tradeAdds} trade addition{snap.tradeAdds === 1 ? "" : "s"} · {snap.freeAgentAdds} free-agent addition{snap.freeAgentAdds === 1 ? "" : "s"} · {snap.retained}/7 retained</span>
        </div>
      </section>

      {!compact ? (
        <>
          <section className="football-gm-report__evolution surface-card">
            <header><span><small>ROSTER EVOLUTION</small><strong>WHAT YOU BUILT</strong></span><b>Y1 → Y3</b></header>
            <div>{FOOTBALL_GM_ROSTER_SLOTS.map((slot) => <EvolutionRow key={slot} slot={slot} run={run} />)}</div>
          </section>

          <section className="football-gm-report__ledger surface-card">
            <header><small>OFFSEASON TRANSACTIONS</small><strong>HOW THE CORE CHANGED</strong></header>
            <div>
              {rows.filter((row) => row.changed).length ? rows.filter((row) => row.changed).map((row) => {
                const finishEntry = slotEntry(snap.end, row.slot);
                const action = finishEntry?.acquired === "trade" ? "TRADE" : "FREE AGENCY";
                return (
                  <article key={row.slot}>
                    <b>{action}</b>
                    <span><small>{row.slot}</small><strong>{row.startPlayer.name} → {row.endPlayer.name}</strong></span>
                    <em>{row.delta >= 0 ? "+" : ""}{row.delta.toFixed(1)}</em>
                  </article>
                );
              }) : (
                <article><b>RETAINED</b><span><small>ALL 7</small><strong>No offseason starter changes</strong></span><em>CORE</em></article>
              )}
            </div>
          </section>

          <section className="football-gm-report__decisions surface-card">
            <article><small>BEST ROSTER DECISION</small><strong>{bestCopy}</strong></article>
            <article className={worst && worst.delta < 0 ? "is-warning" : ""}><small>WHAT COST YOU</small><strong>{costCopy}</strong></article>
            <article><small>CAP + CONTINUITY</small><strong>{footballGmMoney(snap.year3Cap)} Year 3 cap · {snap.result.continuity.year3.meter}/100 continuity · {snap.eliteCount} elite Year 3 player{snap.eliteCount === 1 ? "" : "s"}</strong></article>
          </section>

          <section className="football-gm-report__verdict surface-card">
            <small>THE OWNER'S VERDICT</small>
            <strong>{snap.identity}</strong>
            <p>You opened at {y1.teamGrade.toFixed(1)} and {y1.finish}, changed {snap.changed} of seven positions, then finished Year 3 at {y3.teamGrade.toFixed(1)} and {y3.finish}. The roster {movement} {finishCopy}. You ended with {footballGmMoney(Math.max(0, FOOTBALL_GM_CAP - snap.year3Cap))} of Year 3 cap room.</p>
          </section>
        </>
      ) : null}
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
  const own = Snapshot(run);
  const opp = opponentRun ? Snapshot(opponentRun) : null;
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
            <article><small>{name}</small><strong>{own.result.score.toFixed(1)}</strong></article>
            <span>VS</span>
            <article><small>{opponentName ?? "Opponent"}</small><strong>{opp.result.score.toFixed(1)}</strong></article>
          </div>
        ) : <strong className="football-gm-report__score-label">3-YEAR GM SCORE</strong>}
      </section>

      <CoreReport name={name} run={run} />

      {opp && opponentRun ? (
        <>
          <section className="football-gm-report__comparison surface-card">
            <header><small>WHERE THE MATCH WAS WON</small><strong>FRANCHISE COMPARISON</strong></header>
            <div className="football-gm-report__comparison-head"><span>{name}</span><b>VS</b><span>{opponentName ?? "Opponent"}</span></div>
            {own.result.seasons.map((season, index) => (
              <div key={season.year} className="football-gm-report__comparison-row">
                <span><b>{season.teamGrade.toFixed(1)}</b><small>{season.finish}</small></span>
                <strong>Y{season.year}</strong>
                <span><b>{opp.result.seasons[index]!.teamGrade.toFixed(1)}</b><small>{opp.result.seasons[index]!.finish}</small></span>
              </div>
            ))}
            <div className="football-gm-report__comparison-row">
              <span><b>{own.result.continuity.year3.meter}</b><small>Continuity</small></span><strong>CORE</strong><span><b>{opp.result.continuity.year3.meter}</b><small>Continuity</small></span>
            </div>
            <div className="football-gm-report__comparison-row">
              <span><b>{footballGmMoney(own.year3Cap)}</b><small>Year 3 cap</small></span><strong>CAP</strong><span><b>{footballGmMoney(opp.year3Cap)}</b><small>Year 3 cap</small></span>
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
