import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { canPreviewNbaWhoAmI } from "./NbaWhoAmIOwnerGate";
import { NBA_TEAM_BY_ID } from "./nbaFutures";
import { NbaTeamMark, nbaTeamColor } from "./nbaTeamBranding";
import { NBA_GM_ROSTER_SLOTS, NBA_GM_SKILL_KEYS, type NbaGmSlot } from "./nbaGmFoundation";
import { createNbaGmDevelopmentRepository } from "./nbaGmDevelopmentRepository";
import { nbaGmDevCatalogIssues, nbaGmDevSpend, nbaGmDevTeamCandidates,
  type NbaGmDevPlayer, type NbaGmDevSnapshot } from "./nbaGmDevModel";
import "../../styles/nba-gm-dev.css";

const money = (amount: number) => "$" + (amount / 1_000_000).toFixed(1) + "M";
const skills: Record<string,string> = {
  scoring:"SCORING", shooting:"SHOOTING", playmaking:"PLAYMAKING",
  perimeterDefense:"PERIMETER D", interiorDefense:"INTERIOR D", rebounding:"REBOUNDING",
};
const slotLabel = (slot: NbaGmSlot) => slot === "SIXTH" ? "6TH MAN" : slot;
const teamName = (code: string) => NBA_TEAM_BY_ID.get(code)?.name ?? code;

function PlayerCard({ player, onSelect, disabled, legalSlots }: {
  player: NbaGmDevPlayer;
  onSelect: (slot: NbaGmSlot) => void;
  disabled: boolean;
  legalSlots: NbaGmSlot[];
}) {
  const team = NBA_TEAM_BY_ID.get(player.teamCode);
  return <article className="nba-gm__player" style={{ "--nba-gm-accent": nbaTeamColor(player.teamCode) } as CSSProperties}>
    <div className="nba-gm__player-head">
      <div className="nba-gm__player-ident">
        {team && <NbaTeamMark team={team} />}
        <div><strong>{player.name}</strong><small>{player.teamCode} · {player.positions.join("/")} · POSITION PROVISIONAL</small></div>
      </div>
      <span className="nba-gm__overall"><strong>{player.overall}</strong><small>OVR</small></span>
    </div>
    <div className="nba-gm__skills">
      {NBA_GM_SKILL_KEYS.map(key => <div key={key}><small>{skills[key]}</small><strong>{player.skills[key]}</strong></div>)}
    </div>
    <div className="nba-gm__player-foot">
      <span>DEV SALARY <strong>{money(player.salaries[0])}</strong><small>Y2 {money(player.salaries[1])} · Y3 {money(player.salaries[2])}</small></span>
      {legalSlots.length > 0 && <div className="nba-gm__choose">
        {legalSlots.map(slot => <button key={slot} type="button" disabled={disabled} onClick={() => onSelect(slot)}>
          {slotLabel(slot)}
        </button>)}
      </div>}
    </div>
  </article>;
}

export default function NbaGmDevelopmentPage() {
  const { ready, profile } = useIdentity();
  const owner = canPreviewNbaWhoAmI(profile);
  const repository = useMemo(createNbaGmDevelopmentRepository, []);
  const [snapshot, setSnapshot] = useState<NbaGmDevSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!ready || !owner) { setLoading(false); return; }
    if (!repository) { setError("Private GM persistence is unavailable."); setLoading(false); return; }
    let live = true;
    repository.load().then(value => { if (live) setSnapshot(value); })
      .catch(e => { if (live) setError(e instanceof Error ? e.message : "Could not restore GM."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [ready, owner, repository]);

  const run = snapshot?.run ?? null;
  const catalog = snapshot?.catalog ?? [];
  const catalogIssues = useMemo(() => snapshot ? nbaGmDevCatalogIssues(snapshot.catalog) : [], [snapshot]);
  const spend = useMemo(() => nbaGmDevSpend(run?.picks ?? [], catalog), [run, catalog]);
  const team = run?.pendingTeam ?? null;
  const candidates = useMemo(() => team && run ? nbaGmDevTeamCandidates(team, run, catalog) : [], [team, run, catalog]);
  const players = useMemo(() => new Map(catalog.map(player => [player.id,player])), [catalog]);
  const enabled = owner && repository && !busy && !loading && catalogIssues.length === 0;

  async function action(kind: "new" | "spin" | "pick" | "finish", playerId?: string, slot?: NbaGmSlot) {
    if (!repository || busy || !enabled) return;
    setBusy(true); setError(null);
    try {
      const value = kind === "new" ? await repository.start()
        : kind === "spin" ? await repository.spin(run!.revision)
        : kind === "pick" ? await repository.pick(run!.revision, playerId!, slot!)
        : await repository.finish(run!.revision);
      setSnapshot(value);
    } catch (e) { setError(e instanceof Error ? e.message : "The action could not be saved."); }
    finally { setBusy(false); }
  }

  if (!ready || !owner) return null;
  return <main className="page nba-gm" data-testid="nba-gm-private-prototype">
    <header className="nba-gm__header">
      <div><small>OCTAGON HQ · BASKETBALL</small><h1>NBA GM</h1>
        <p>PRIVATE OWNER PLAYTEST · THREE-SEASON FRANCHISE</p></div>
      <Link to="/nba">BACK TO NBA</Link>
    </header>
    <p className="nba-gm__disclaimer">DEVELOPMENT ONLY — All seven salaries are fictional game fixtures, positions are unverified editorial candidates, and the six skills/overalls are provisional. Nothing here represents real NBA contracts or public scoring.</p>
    {error && <p className="nba-gm__error" role="alert">{error}</p>}
    {loading ? <p className="nba-gm__empty">Restoring private GM progress…</p>
      : catalogIssues.length ? <p className="nba-gm__error">Fixture validation blocked this playtest. {catalogIssues[0]}</p>
      : !run ? <section className="nba-gm__intro">
        <h2>Build a franchise</h2><p>Spin the NBA team wheel, choose seven unique players, and stay under the development cap in all three seasons. Your choices determine 82-game seasons and playoff finishes.</p>
        <button type="button" disabled={!enabled} onClick={() => void action("new")}>START PRIVATE PLAYTEST</button>
      </section>
      : <>
      <section className="nba-gm__cap" aria-label="Three-season fictional salary caps">
        <div className="nba-gm__section-top"><strong>FRANCHISE CAP</strong><small>{run.picks.length} / 7 PLAYERS · {run.phase === "final" ? "COMPLETE" : "DRAFT IN PROGRESS"}</small></div>
        <div className="nba-gm__caps">{spend.map((amount, year) => <div key={year}>
          <span>SEASON {year + 1} <strong>{money(amount)} / {money(run.devSalaryCap)}</strong></span>
          <div className="nba-gm__cap-track"><i style={{ width: Math.min(100, 100 * amount / run.devSalaryCap) + "%" }} /></div>
        </div>)}</div>
      </section>
      <section className="nba-gm__roster" aria-label="NBA GM roster">
        <div className="nba-gm__section-top"><strong>YOUR SEVEN</strong><small>PG · SG · SF · PF · C · SIXTH · FLEX</small></div>
        <div className="nba-gm__roster-grid">
          {NBA_GM_ROSTER_SLOTS.map(slot => {
            const pick = run.picks.find(p => p.slot === slot);
            const player = pick ? players.get(pick.playerId) : null;
            return <div className={"nba-gm__slot" + (player ? " nba-gm__slot--filled" : "")} key={slot}>
              <span>{slotLabel(slot)}</span>
              <strong>{player?.name ?? "OPEN"}</strong>
              <small>{player ? player.teamCode + " · " + player.overall + " OVR · " + money(player.salaries[0]) : "Awaiting draft pick"}</small>
            </div>;
          })}
        </div>
      </section>
      {run.phase === "draft" ? <section className="nba-gm__wheel" aria-label="Server-owned team wheel and player selection">
        <div className="nba-gm__section-top"><strong>TEAM WHEEL</strong><small>SPIN {run.spinIndex} · SERVER-OWNED</small></div>
        {team ? <>
          <div className="nba-gm__team">
            {NBA_TEAM_BY_ID.get(team) && <NbaTeamMark team={NBA_TEAM_BY_ID.get(team)!} />}
            <div><small>YOUR SPIN LANDED ON</small><h2>{teamName(team)}</h2></div>
          </div>
          <p className="nba-gm__help">Choose one affordable player and an open eligible slot. The server revalidates the pick.</p>
          <div className="nba-gm__players">{candidates.length
            ? candidates.map(({player,legalSlots}) => <PlayerCard key={player.id} player={player} legalSlots={legalSlots}
                disabled={!enabled} onSelect={slot => void action("pick",player.id,slot)} />)
            : <p role="alert">No eligible affordable players on this team. This wheel result requires a development fix.</p>}</div>
        </> : run.picks.length === 7 ? <div className="nba-gm__complete">
          <h2>Seven-player roster complete</h2><p>Review your lineup and the three-season cap before locking your franchise.</p>
          <button type="button" disabled={!enabled} onClick={() => void action("finish")}>CONFIRM & SIMULATE THREE SEASONS</button>
        </div> : <div className="nba-gm__spin">
          <p>{7-run.picks.length} pick{run.picks.length===6?"":"s"} remaining. Team and available players are determined by the server.</p>
          <button type="button" disabled={!enabled} onClick={() => void action("spin")}>{busy ? "WORKING…" : "SPIN NBA TEAM"}</button>
        </div>}
      </section> : <section className="nba-gm__results">
        <div className="nba-gm__section-top"><strong>FRANCHISE RESULTS</strong><small>THREE 82-GAME SEASONS · SERVER LOCKED</small></div>
        <div className="nba-gm__season-grid">{run.results?.map(year => <article key={year.season}>
          <small>SEASON {year.season}</small><strong>{year.wins}–{year.losses}</strong><span>{year.finish}</span>
          <div>OFFENSE {year.offense.toFixed(1)} · DEFENSE {year.defense.toFixed(1)}</div>
          <small>Strength {year.teamStrength.toFixed(1)} · Fit {year.rosterBalance.toFixed(1)}</small>
        </article>)}</div>
        <p>Prototype outcomes are calibrated game projections, not real NBA forecasts. Seasons are fixed to this run seed.</p>
        <button type="button" disabled={!enabled} onClick={() => void action("new")}>NEW PRIVATE PLAYTEST</button>
      </section>}
    </>}
  </main>;
}
