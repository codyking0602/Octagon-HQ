import { useEffect } from "react";
import { footballGmMoney, footballGmPlayoffFinishLabel } from "./footballGmEngine";
import { NFL_GM_LONG_CAP, nflGmLongSpend, type NflGmLongPick } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID } from "./footballGmLongCatalog";
import { LongPlayerPortrait, LongPlayerTags, longSlotLabel } from "./FootballGmLongDraftPresentation";
import { nflGmLongActivePicks, nflGmLongDevelopmentOutcome, type NflGmLongMidseason } from "./footballGmLongMidseason";
import type { NflGmLongYearOne, NflGmLongYearOneStage } from "./footballGmLongYearOne";
import { wheelFootballTeam } from "./wheelFootballModel";

export function FootballGmLongYearOnePage({ picks, coachName, midseason, yearOne, onRevealGame, onRevealRound, onAdvance }: {
  picks: readonly NflGmLongPick[]; coachName: string; midseason: NflGmLongMidseason;
  yearOne: NflGmLongYearOne; onRevealGame: () => void; onRevealRound: () => void;
  onAdvance: (stage: NflGmLongYearOneStage) => void;
}) {
  useEffect(() => {
    if (yearOne.stage !== "regular" || yearOne.revealedGames >= 9) return;
    const timer = window.setTimeout(onRevealGame, 650);
    return () => window.clearTimeout(timer);
  }, [yearOne.stage, yearOne.revealedGames, onRevealGame]);
  const visible = yearOne.stage === "regular" ? yearOne.revealedGames : 9;
  const firstWins = midseason.games.filter(g => g.won).length;
  const wins = firstWins + yearOne.games.slice(8, 8 + visible).filter(g => g.won).length;
  const active = nflGmLongActivePicks(picks, midseason.trade);
  const next = yearOne.postseason[yearOne.revealedRounds];
  const qualified = yearOne.playoffSeed !== null;
  const finished = yearOne.stage === "results";
  const nextCap = NFL_GM_LONG_CAP - nflGmLongSpend(active, NFL_GM_LONG_BY_ID, 2);
  const teamLogo = (team: string) => {
    const info = wheelFootballTeam(team);
    return info?.logoSrc ? <img src={info.logoSrc} alt="" loading="lazy" /> : <b>{team}</b>;
  };
  return <section className="gm-long-y1" aria-label="NFL GM Long Year 1">
    <header className="surface-card gm-long-y1__hero">
      <p className="eyebrow">THE GM · LONG · YEAR 1</p>
      <h2>{finished && yearOne.finish === "Champion" ? "SUPER BOWL CHAMPIONS" : finished ? "YEAR ONE · IN THE BOOKS" : yearOne.stage === "regular" ? "THE STRETCH RUN"
        : yearOne.stage === "standings" ? "REGULAR SEASON COMPLETE" : "THE POSTSEASON"}</h2>
      <div className="gm-long-y1__score"><strong>{wins}–{8 + visible - wins}</strong><span>
        <b>{finished ? footballGmPlayoffFinishLabel(yearOne.finish).toUpperCase()
          : yearOne.stage === "regular" ? `WEEK ${8 + visible} OF 17` : "FINAL REGULAR-SEASON RECORD"}</b>
        <small>{coachName} · Nine-player core</small></span></div>
      {(yearOne.stage === "regular" || yearOne.stage === "standings") ? <>
        <div className="gm-long-y1__schedule-title"><span>FIRST EIGHT · LOCKED</span><span>SECOND HALF · {visible}/9</span></div>
        <div className="gm-long-y1__games" aria-label="Seventeen game results">
          {yearOne.games.map((game, i) => <div key={i} className={i < 8 + visible ? game.won ? "is-win" : "is-loss" : "is-pending"}
            title={`Week ${i + 1} against ${game.opponent}`}>
            <small>{i + 1}</small><b>{i < 8 + visible ? game.won ? "W" : "L" : "—"}</b>
            <em>{i < 8 + visible ? game.opponent : "NFL"}</em>
          </div>)}
        </div>
      </> : <details className="gm-long-y1__schedule-collapse">
        <summary>17-GAME SEASON <b>{yearOne.wins}–{yearOne.losses}</b><span>VIEW GAME LOG</span></summary>
        <div className="gm-long-y1__games" aria-label="Seventeen saved game results">
          {yearOne.games.map((game, i) => <div key={i} className={game.won ? "is-win" : "is-loss"}>
            <small>{i + 1}</small><b>{game.won ? "W" : "L"}</b><em>{game.opponent}</em>
          </div>)}
        </div>
      </details>}
    </header>

    {yearOne.stage === "regular" && <section className="surface-card gm-long-y1__panel">
      <strong>{visible < 9 ? "PLAYING GAMES 9–17…" : "THE REGULAR SEASON IS COMPLETE"}</strong>
      <p>{visible < 9 ? "Results reveal automatically from your saved season. No rerolls."
        : "All 17 games are locked, including your deadline decision and coaching effects."}</p>
      {visible === 9 && <button className="gm-long__primary" type="button" onClick={() => onAdvance("standings")}>VIEW FINAL STANDINGS →</button>}
    </section>}

    {yearOne.stage === "standings" && <section className="surface-card gm-long-y1__panel">
      <p className="eyebrow">FINAL STANDINGS · YEAR 1</p>
      <h3>{qualified ? `PLAYOFFS CLINCHED · #${yearOne.playoffSeed} SEED` : "MISSED THE PLAYOFFS"}</h3>
      <div className="gm-long-y1__stats">
        <div><b>{yearOne.wins}–{yearOne.losses}</b><small>RECORD</small></div>
        <div><b>{yearOne.games.slice(8).filter(g => g.won).length}–{yearOne.games.slice(8).filter(g => !g.won).length}</b><small>LAST NINE</small></div>
        <div><b>{qualified ? `#${yearOne.playoffSeed}` : "—"}</b><small>SEED</small></div>
      </div>
      <p>{qualified ? yearOne.playoffSeed === 1 ? "Top conference seed. Your Wild Card bye is earned."
        : "Your team earned its place in the playoffs. Win and advance." : "The postseason was determined by your complete 17-game season."}</p>
      <button className="gm-long__primary" type="button" onClick={() => onAdvance(qualified ? "playoffs" : "results")}>
        {qualified ? "ENTER PLAYOFFS →" : "VIEW YEAR 1 RESULTS →"}</button>
    </section>}

    {yearOne.stage === "playoffs" && <section className="surface-card gm-long-y1__panel">
      <p className="eyebrow">NFL PLAYOFFS · SEED #{yearOne.playoffSeed}</p><h3>WIN AND ADVANCE</h3>
      {yearOne.playoffSeed === 1 && <p className="gm-long-y1__bye">WILD CARD · FIRST-ROUND BYE</p>}
      <div className="gm-long-y1__rounds">
        {yearOne.postseason.slice(0, yearOne.revealedRounds).map((round, i) =>
          <div className={round.won ? "is-win" : "is-loss"} key={i}>
            <span><small>{round.round.toUpperCase()}</small><strong>{round.won ? "WIN" : "LOSS"} vs {round.opponent}</strong></span>
            {teamLogo(round.opponent)}
          </div>)}
      </div>
      {next ? <>
        <div className="gm-long-y1__next">{teamLogo(next.opponent)}<span>
          <small>NEXT UP · {next.round.toUpperCase()}</small>
          <strong>VS {wheelFootballTeam(next.opponent)?.name ?? next.opponent}</strong></span></div>
        <button className="gm-long__primary" type="button" onClick={onRevealRound}>PLAY {next.round.toUpperCase()} →</button>
      </> : <>
        {yearOne.finish === "Champion" ? <div className="gm-long-y1__title-banner">
          <span aria-hidden="true">🏆</span><strong>SUPER BOWL CHAMPIONS</strong>
          <small>{yearOne.wins}–{yearOne.losses} · FOUR PLAYOFF WINS · {coachName}</small>
        </div> : <h3>{footballGmPlayoffFinishLabel(yearOne.finish).toUpperCase()}</h3>}
        <button className="gm-long__primary" type="button" onClick={() => onAdvance("results")}>VIEW YEAR 1 RESULTS →</button>
      </>}
    </section>}

    {finished && <>
      {yearOne.finish === "Champion" && <section className="surface-card gm-long-y1__championship" aria-label="Super Bowl championship celebration">
        <div className="gm-long-y1__trophy" aria-hidden="true">🏆</div>
        <p className="eyebrow">YEAR 1 · NFL CHAMPIONS</p>
        <h3>SUPER BOWL CHAMPIONS</h3>
        <strong>{yearOne.wins}–{yearOne.losses} <span>REGULAR SEASON</span></strong>
        <p>{coachName} led your nine-player franchise through the postseason to the title.</p>
        <div className="gm-long-y1__champion-road" aria-label="Winning playoff path">
          {yearOne.postseason.map(round => <span key={round.round}><b>{round.round}</b><small>W vs {round.opponent}</small></span>)}
        </div>
      </section>}
      <section className="surface-card gm-long-y1__panel">
        <p className="eyebrow">FINAL YEAR 1 REPORT</p><h3>{footballGmPlayoffFinishLabel(yearOne.finish).toUpperCase()}</h3>
        <div className="gm-long-y1__stats"><div><b>{yearOne.wins}–{yearOne.losses}</b><small>RECORD</small></div>
          <div><b>{yearOne.finalGrade.toFixed(1)}</b><small>FINAL CORE</small></div>
          <div><b>{qualified ? `#${yearOne.playoffSeed}` : "—"}</b><small>PLAYOFF SEED</small></div></div>
        <p>{midseason.trade ? `TRADE · ${NFL_GM_LONG_BY_ID.get(midseason.trade.outgoingId)?.name} → ${NFL_GM_LONG_BY_ID.get(midseason.trade.incomingId)?.name}.`
          : "TRADE DEADLINE · Original nine retained."} Coach {coachName} influenced matchup execution, development and chemistry.</p>
      </section>
      <section className="surface-card gm-long-y1__panel">
        <h3>YOUR FINAL NINE</h3><small className="gm-long-y1__subhead">FINAL DEVELOPMENT · SCOUTING · CONTRACTS</small>
        <div className="gm-long-y1__roster">{active.map(pick => {
          const player = NFL_GM_LONG_BY_ID.get(pick.playerId)!;
          const delta = yearOne.development.find(row => row.playerId === player.id)?.delta ?? 0;
          return <article key={pick.slot}>
            <b className="gm-long-y1__slot">{longSlotLabel(pick.slot)}</b><LongPlayerPortrait player={player} />
            <span className="gm-long-y1__player-info"><strong>{player.name}</strong>
              <small>{player.team} · {footballGmMoney(player.salaryWindow[0])}
                {midseason.trade?.incomingId === player.id ? " · TRADE" : ""}</small>
              <span className="gm-long-y1__player-bottom"><LongPlayerTags player={player} />
                <em className={delta > 0 ? "is-up" : delta < 0 ? "is-down" : "is-steady"}>{nflGmLongDevelopmentOutcome(delta)}</em>
              </span>
            </span>
          </article>;
        })}</div>
      </section>
      <section className="surface-card gm-long-y1__panel">
        <p className="eyebrow">YEAR 2 · CONTRACT WATCH</p>
        <h3>{nextCap < 0 ? `${footballGmMoney(-nextCap)} PROJECTED OVER CAP` : `${footballGmMoney(nextCap)} PROJECTED ROOM`}</h3>
        <p>Projected Year 2 payroll includes estimated repricing of 1YR contracts; 3YR salaries stay locked. Those estimates are not signed deals. No offseason moves have occurred.</p>
        <b className="gm-long-y1__end">YEAR 1 COMPLETE · OFFSEASON COMING NEXT</b>
      </section>
    </>}
  </section>;
}
