import { useState } from "react";
import { footballGmMoney } from "./footballGmEngine";
import { GmFootballWheel } from "./FootballGmModePage";
import { NFL_GM_LONG_CAP, nflGmLongSpend, type NflGmLongPick } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID } from "./footballGmLongCatalog";
import { LongPlayerPortrait, LongPlayerTier, longSlotLabel } from "./FootballGmLongDraftPresentation";
import { nflGmLongCoachPointerRotation } from "./footballGmLongPresentation";
import {
  nflGmLongActiveGrade, nflGmLongActivePicks, nflGmLongPlayoffOutlook,
  nflGmLongRecord, nflGmLongTradePartners, nflGmLongTradeTargets,
  type NflGmLongMidseason,
} from "./footballGmLongMidseason";
import { wheelFootballTeam, type WheelFootballTeam } from "./wheelFootballModel";

export function FootballGmLongMidseasonPage({
  runId, picks, coachName, midseason, onExplore, onShop, onSpin, onOffer, onSkip,
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
      <small className="gm-long__midseason-disclaimer">
        Simulated on your franchise seed. These are completed games—not a preseason forecast.
        Your record stays locked when you reach the trade deadline.
      </small>
    </header>

    <div className="gm-long__midseason-outlook">
      <div><small>PLAYOFF OUTLOOK</small><strong>{outlook.percent}%</strong><em>{outlook.label}</em></div>
      <div><small>CURRENT CORE</small><strong>{nflGmLongActiveGrade(picks, midseason).toFixed(1)}</strong>
        <em>{footballGmMoney(NFL_GM_LONG_CAP - activeSalary)} cap room</em>
      </div>
    </div>

    <section className="gm-long__midseason-growth" aria-label="Provisional player development">
      <div className="gm-long__midseason-section-header">
        <h3>HALFTIME DEVELOPMENT</h3><span>PROVISIONAL</span>
      </div>
      <p>These are midseason trends, not finalized end-of-year ratings. Your coach creates development opportunities without changing talent ceilings.</p>
      <div className="gm-long__midseason-growth-grid">
        {roster.map(({ pick, player }) => {
          const delta = midseason.development.find(d => d.playerId === player.id)?.delta ?? 0;
          return <div key={player.id}>
            <span className="gm-long__midseason-slot">{longSlotLabel(pick.slot)}</span>
            <strong>{player.name}</strong>
            <b className={delta > 0 ? "is-positive" : delta < 0 ? "is-negative" : ""}>{delta > 0 ? "+" + delta : delta < 0 ? String(delta) : "—"}</b>
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
        <p>Choose one of your starters to shop. Then spin an independent 31-team wheel for a partner. You can walk away with your roster intact.</p>
        <div className="gm-long__deadline-roster">
          {roster.map(({ pick, player }) => <button key={pick.slot} type="button"
            onClick={() => onShop(player.id)}>
            <span>{longSlotLabel(pick.slot)}</span><LongPlayerPortrait player={player} />
            <strong>{player.name}</strong><small>{footballGmMoney(player.salaryWindow[0])}</small><b>SHOP →</b>
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
          {partner.logoSrc && <img src={partner.logoSrc} alt="" />}
          <span><small>YOUR WHEEL PARTNER</small><strong>{partner.name}</strong></span>
        </div>
        <p>You are offering <b>{outgoing.name}</b>. Choose a replacement from {partner.name}.
          Your nine-player starting core stays intact, and the $205M cap still applies.
          You have <b>{2 - midseason.rejectedOfferIds.length} offer attempt(s)</b> left.</p>
        <div className="gm-long__deadline-offers">
          {targets.filter(p => !midseason.rejectedOfferIds.includes(p.id)).map(player => <button
            key={player.id} type="button" onClick={() => onOffer(player.id)}>
            <LongPlayerPortrait player={player} />
            <span><strong>{player.name}</strong><small>{player.team} · {player.position} · {footballGmMoney(player.salaryWindow[0])}</small></span>
            <LongPlayerTier player={player} /><b>OFFER →</b>
          </button>)}
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
      <p>The remaining games, season finish and eventual offseason will follow in the next release. Your midseason decisions are saved.</p>
    </footer>
  </section>;
}
