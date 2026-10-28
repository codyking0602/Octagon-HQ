import { useState } from "react";
import { footballGmMoney } from "./footballGmEngine";
import { GmFootballWheel } from "./FootballGmModePage";
import { NFL_GM_LONG_CAP, nflGmLongSpend, type NflGmLongPick } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID } from "./footballGmLongCatalog";
import { LongPlayerPortrait, LongPlayerTags, longSlotLabel } from "./FootballGmLongDraftPresentation";
import { nflGmLongCoachPointerRotation } from "./footballGmLongPresentation";
import {
  nflGmLongActiveGrade, nflGmLongActivePicks, nflGmLongPlayoffOutlook,
  nflGmLongRecord, nflGmLongTradePartners, nflGmLongTradeTargets, nflGmLongDevelopmentOutcome,
  type NflGmLongMidseason,
} from "./footballGmLongMidseason";
import { wheelFootballTeam, type WheelFootballTeam } from "./wheelFootballModel";

export function FootballGmLongMidseasonPage({
  runId, picks, coachName, midseason, onExplore, onShop, onSpin, onOffer, onSkip, onStartYearOne,
}: {
  runId: string;
  picks: readonly NflGmLongPick[];
  coachName: string;
  midseason: NflGmLongMidseason;
  onExplore: () => void;
  onShop: (playerId: string) => void;
  onSpin: () => string;
  onOffer: (incomingId: string) => void;
  onSkip: () => void;
  onStartYearOne?: () => void;
}) {
  const { wins, losses } = nflGmLongRecord(midseason);
  const outlook = nflGmLongPlayoffOutlook(runId, picks, coachName, midseason);
  const activePicks = nflGmLongActivePicks(picks, midseason.trade);
  const activeSalary = nflGmLongSpend(activePicks, NFL_GM_LONG_BY_ID);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const roster = picks.map(pick => ({ pick, player: NFL_GM_LONG_BY_ID.get(pick.playerId)! }));
  const outgoing = midseason.shoppedPlayerId ? NFL_GM_LONG_BY_ID.get(midseason.shoppedPlayerId) : null;
  const partner = midseason.partnerTeam ? wheelFootballTeam(midseason.partnerTeam) : null;
  const partnerTeams = outgoing
    ? nflGmLongTradePartners(outgoing.id)
      .map(wheelFootballTeam).filter((team): team is WheelFootballTeam => team != null)
    : [];
  const targets = midseason.partnerTeam && outgoing
    ? nflGmLongTradeTargets(picks, outgoing.id, midseason.partnerTeam)
    : [];
  const status = midseason.stage;
  const trendCounts = midseason.development.reduce((acc, change) => {
    const result = nflGmLongDevelopmentOutcome(change.delta);
    if (result === "HELD STEADY") acc.steady++;
    else if (change.delta > 0) acc.improving++;
    else acc.regressing++;
    return acc;
  }, { improving: 0, steady: 0, regressing: 0 });


  function spinPartner() {
    if (spinning || status !== "spin") return;
    const result = onSpin();
    const index = partnerTeams.findIndex(t => t.code === result);
    if (index < 0) return;
    setSpinning(true);
    setWheelRotation(current => nflGmLongCoachPointerRotation(current, index, partnerTeams.length, 3));
    window.setTimeout(() => setSpinning(false), 1550);
  }

  return <section className="surface-card gm-long__midseason" aria-label="NFL GM Long Year 1 midseason checkpoint">
    <header className="gm-long__midseason-top">
      <p className="eyebrow">NFL GM LONG · YEAR 1 · GAME 8 OF 17</p>
      <h2>HALFWAY THROUGH THE SEASON</h2>
      <div className="gm-long__midseason-score">
        <strong>{wins}–{losses}</strong>
        <span><b>YOUR FIRST EIGHT GAMES</b><small>Coach: {coachName}</small></span>
      </div>
      <div className="gm-long__midseason-games" aria-label="Your eight simulated results">
        {midseason.games.map((game, i) => <span className={game.won ? "is-win" : "is-loss"}
          key={i} title={"Game " + (i + 1) + " vs " + game.opponent}>
          <b>{game.won ? "W" : "L"}</b><small>{game.opponent}</small>
        </span>)}
      </div>
      <small className="gm-long__midseason-disclaimer">8 games complete · Results locked</small>
    </header>

    <div className="gm-long__midseason-outlook">
      <div><small>PLAYOFF OUTLOOK</small><strong>{outlook.percent}%</strong><em>{outlook.label}</em></div>
      <div><small>CURRENT CORE</small><strong>{nflGmLongActiveGrade(picks, midseason, runId, coachName).toFixed(1)}</strong>
        <em>{footballGmMoney(NFL_GM_LONG_CAP - activeSalary)} cap room</em>
      </div>
    </div>

    <section className="gm-long__midseason-growth" aria-label="Provisional player development">
      <div className="gm-long__midseason-section-header">
        <h3>HALFTIME DEVELOPMENT</h3><span>PROVISIONAL</span>
      </div>
      <div className="gm-long__midseason-trend-counts" aria-label="Midseason development summary">
        <span className="is-up">{trendCounts.improving} Improving</span>
        <span className="is-steady">{trendCounts.steady} Steady</span>
        <span className="is-down">{trendCounts.regressing} Regressing</span>
      </div>
      <div className="gm-long__midseason-growth-grid">
        {roster.map(({ pick, player }) => {
          const delta = midseason.development.find(d => d.playerId === player.id)?.delta ?? 0;
          const result = nflGmLongDevelopmentOutcome(delta);
          const tone = delta > 0 ? "up" : delta < 0 ? "down" : "steady";
          return <div key={player.id}>
            <span className="gm-long__midseason-slot">{longSlotLabel(pick.slot)}</span>
            <strong>{player.name}</strong>
            <span className={`gm-long__midseason-outcome football-gm__development-note is-${tone}`}>
              {result}
            </span>
          </div>;
        })}
      </div>
    </section>

    <section className="gm-long__deadline" aria-label="Optional trade deadline">
      <div className="gm-long__midseason-section-header"><h3>THE TRADE DEADLINE</h3>
        <span>{status === "complete" ? "CLOSED" : "ONE WINDOW"}</span></div>

      {status === "decision" && <>
        <p>You have a real midseason record. Take one chance in the trade market—or trust the nine players who got you here.</p>
        <div className="gm-long__deadline-actions">
          <button type="button" className="gm-long__primary" onClick={onExplore}>EXPLORE A TRADE →</button>
          <button type="button" className="gm-long__secondary" onClick={onSkip}>KEEP MY ROSTER</button>
        </div>
      </>}

      {status === "shop" && <>
        <p>Shop one starter, spin a trading partner, or keep your team.</p>
        <div className="gm-long__deadline-roster">
          {roster.map(({ pick, player }) => <button key={pick.slot} type="button"
            onClick={() => onShop(player.id)}>
            <span>{longSlotLabel(pick.slot)}</span><LongPlayerPortrait player={player} />
            <strong>{player.name}</strong><span className="gm-long__deadline-shop-action"><small>{footballGmMoney(player.salaryWindow[0])}</small><b>SHOP →</b></span>
          </button>)}
        </div>
        <button type="button" className="gm-long__secondary" onClick={onSkip}>KEEP MY ROSTER</button>
      </>}

      {(status === "spin" || (status === "offers" && spinning)) && outgoing && <>
        <p>Shopping <b>{outgoing.name}</b>. Spin for one NFL trading partner. You cannot reroll the partner.</p>
        <GmFootballWheel teams={partnerTeams} rotation={wheelRotation} spinning={spinning}
          pendingTeam={null} canSpin={!spinning && status === "spin"}
          onSpin={spinPartner} />
        {!spinning && <button type="button" className="gm-long__secondary" onClick={onSkip}>CANCEL · KEEP MY ROSTER</button>}
      </>}

      {status === "offers" && !spinning && outgoing && partner && <>
        <div className="gm-long__deadline-partner">
          {partner.logoSrc && <span className="gm-long__deadline-partner-logo">
            <img src={partner.logoSrc} alt="" />
          </span>}
          <span><small>YOUR WHEEL PARTNER</small><strong>{partner.name}</strong></span>
        </div>
        <p>You are offering <b>{outgoing.name}</b>. Choose a replacement from {partner.name}.
          Your nine starters stay intact. <b>{2 - midseason.rejectedOfferIds.length} offers left.</b></p>
        <div className="gm-long__deadline-offers">
          {targets.filter(p => !midseason.rejectedOfferIds.includes(p.id)).map(player => {
            const difference = player.salaryWindow[0] - outgoing.salaryWindow[0];
            const capChange = difference < 0 ? `+${footballGmMoney(-difference)} room`
              : difference > 0 ? `−${footballGmMoney(difference)} room` : "No cap change";
            return <button className="gm-long__deadline-offer-card"
              key={player.id} type="button" onClick={() => onOffer(player.id)}
              aria-label={`Offer ${player.name} for ${outgoing.name}`}>
              <span className="gm-long__deadline-offer-profile">
                <LongPlayerPortrait player={player} />
                <span className="gm-long__deadline-offer-identity">
                  <strong>{player.name}</strong>
                  <small>{player.team} · {player.position} · {footballGmMoney(player.salaryWindow[0])}</small>
                  <LongPlayerTags player={player} />
                </span>
              </span>
              <span className="gm-long__deadline-offer-footer">
                <small>CAP IMPACT · {capChange}</small><b>OFFER →</b>
              </span>
            </button>;
          })}
        </div>
        {targets.every(player => midseason.rejectedOfferIds.includes(player.id)) && <p className="gm-long__deadline-rejected">
          No available player-for-player offers remain with this team. Keep your original roster.
        </p>}
        {midseason.rejectedOfferIds.length > 0 && <p className="gm-long__deadline-rejected" role="status">
          {midseason.rejectedOfferIds.length} offer rejected. You can still walk away with your original lineup.
        </p>}
        <button type="button" className="gm-long__secondary" onClick={onSkip}>KEEP MY ROSTER · END TALKS</button>
      </>}

      {status === "complete" && <div className="gm-long__deadline-complete" role="status">
        <strong>{midseason.trade ? "TRADE AGREED" : "DEADLINE CLOSED · ROSTER RETAINED"}</strong>
        {midseason.trade ? <>
          <p>{NFL_GM_LONG_BY_ID.get(midseason.trade.outgoingId)?.name} traded to {midseason.trade.partnerTeam}.
            Incoming: {NFL_GM_LONG_BY_ID.get(midseason.trade.incomingId)?.name}. Your starting core remains nine players.</p>
          <small>Completed games stay locked. Updated roster and cap affect the remaining-season outlook only.</small>
        </> : <p>{midseason.retiredDraftPickTrade
          ? "The earlier future-pick trade option was retired. Your original starter has been restored, and your first eight games remain unchanged."
          : "Your original nine starters remain together for the second half."}</p>}
      </div>}
    </section>

    <footer className="gm-long__midseason-next">
      <small>UP NEXT · YEAR 1 SECOND HALF</small>
      <p>{status === "complete" ? "The trade deadline is locked. Finish the 17-game season and chase the postseason." : "Settle the trade deadline to continue into Games 9–17."}</p>
      {status === "complete" && onStartYearOne
        ? <button type="button" className="gm-long__primary" onClick={onStartYearOne}>PLAY GAMES 9–17 →</button> : null}
    </footer>
  </section>;
}
