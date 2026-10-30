import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  NBA_GM_ROSTER_SLOTS, NBA_GM_SKILL_KEYS, type NbaGmSlot,
} from "./nbaGmFoundation";
import {
  NBA_GM_DEV_SKILL_LABELS, nbaGmDevCandidates, nbaGmDevCatalogErrors,
  nbaGmDevSpend, type NbaGmDevPlayer, type NbaGmDevRun,
} from "./nbaGmDevModel";
import { createNbaGmDevRepository } from "./nbaGmDevRepository";
import { nbaTeamColor, nbaTeamLogoSrc } from "./nbaTeamBranding";
import "../../styles/nba-gm-dev.css";

const money = (value: number) => "$" + (value / 1_000_000).toFixed(1) + "M";
const slotLabel = (slot: NbaGmSlot) => slot === "SIXTH" ? "Sixth Man" : slot;
function TeamMark({ code }: { code: string }) {
  return <span className="nba-gm-dev__team-mark" title={code}
    style={{ borderColor: nbaTeamColor(code) }}>
    <img src={nbaTeamLogoSrc(code)} alt={code + " logo"}
      onError={event => { event.currentTarget.style.display = "none"; }} />
    <span>{code}</span>
  </span>;
}
function PlayerCard({ player, onPick, disabled }: {
  player: NbaGmDevPlayer; onPick?: () => void; disabled?: boolean;
}) {
  return <article className="nba-gm-dev__player" style={{ borderTopColor: nbaTeamColor(player.teamCode) }}>
    <div className="nba-gm-dev__player-head">
      <TeamMark code={player.teamCode} />
      <div className="nba-gm-dev__identity">
        <strong>{player.name}</strong><small>{player.positions.join(" / ")} · {money(player.salaries[0])} / year 1</small>
        <small>Game positions provisional · NBA ID {player.officialNbaPlayerId ? "cross-checked" : "unresolved"}</small>
      </div>
      <span className="nba-gm-dev__overall">{player.currentGrade}<small>OVR</small></span>
    </div>
    <div className="nba-gm-dev__skills">
      {NBA_GM_SKILL_KEYS.map(key => <div key={key}>
        <small>{NBA_GM_DEV_SKILL_LABELS[key]}</small><strong>{player.skills[key]}</strong>
      </div>)}
    </div>
    {onPick && <button type="button" className="nba-gm-dev__primary" disabled={disabled}
      onClick={onPick}>Draft {player.name}</button>}
  </article>;
}

export default function NbaGmDevPage() {
  const repo = useMemo(() => createNbaGmDevRepository(), []);
  const [run, setRun] = useState<NbaGmDevRun | null>(null);
  const [catalog, setCatalog] = useState<NbaGmDevPlayer[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<NbaGmSlot>("PG");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!repo) {
      setError("NBA GM requires a connected development backend.");
      setLoading(false);
      return;
    }
    let mounted = true;
    Promise.all([repo.catalog(), repo.action("load")])
      .then(([players, saved]) => {
        if (!mounted) return;
        const issues = nbaGmDevCatalogErrors(players);
        if (issues.length) throw new Error(issues[0]);
        setCatalog(players);
        setRun(saved);
      })
      .catch(failure => { if (mounted) setError(failure instanceof Error ? failure.message : String(failure)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [repo]);

  async function act(action: "start" | "spin" | "pick" | "confirm", slot?: NbaGmSlot, playerId?: string) {
    if (!repo || busy) return;
    setBusy(true);
    setError("");
    try {
      const state = await repo.action(action, slot, playerId);
      setRun(state);
      if (state?.phase === "draft" && !state.pendingTeam) {
        setSelectedSlot(NBA_GM_ROSTER_SLOTS.find(
          next => !state.picks.some(pick => pick.slot === next),
        ) ?? "PG");
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Action rejected by the server.");
    } finally {
      setBusy(false);
    }
  }

  const byId = useMemo(() => new Map(catalog.map(p => [p.id, p])), [catalog]);
  const spend = run ? nbaGmDevSpend(run.picks, catalog) : null;
  const candidates = run ? nbaGmDevCandidates(run, catalog) : [];
  const filled = new Set(run?.picks.map(pick => pick.slot) ?? []);
  const activeSlot = run?.pendingSlot ?? selectedSlot;

  return <main className="page nba-gm-dev" data-testid="nba-gm-development-page">
    <header className="nba-gm-dev__header">
      <Link to="/nba" className="nba-gm-dev__back">← Basketball HQ</Link>
      <span>OWNER PLAYTEST · NOT PUBLIC</span>
      <h1>NBA <em>GM</em></h1>
      <p>Build your seven-player rotation. Three NBA seasons. Every contract on this screen is a fictional game-price fixture, not a real NBA salary.</p>
    </header>
    {error && <div className="nba-gm-dev__error" role="alert">{error}</div>}
    {loading && <p className="nba-gm-dev__status">Loading your private franchise…</p>}
    {!loading && !run && <section className="nba-gm-dev__panel nba-gm-dev__intro">
      <strong>THE FRANCHISE</strong>
      <h2>Seven picks. One dynasty.</h2>
      <p>Spin for an NBA team, select a player who fits your open roster slot, and stay under the cap in all three seasons. A fresh team is drawn by the server each spin.</p>
      <div className="nba-gm-dev__summary">
        <span>330 players</span><span>30 teams</span><span>82 games × 3</span>
      </div>
      <button className="nba-gm-dev__primary" disabled={busy || catalog.length !== 330}
        onClick={() => void act("start")}>Start Franchise</button>
    </section>}
    {run && <>
      <section className="nba-gm-dev__panel nba-gm-dev__caps">
        <div><small>DRAFT</small><strong>{run.picks.length} / 7</strong></div>
        {[0,1,2].map(index => <div key={index}>
          <small>YEAR {index + 1} CAP</small>
          <strong>{money(spend?.[index] ?? 0)} <span>/ {money(run.caps[index]!)}</span></strong>
          <div className="nba-gm-dev__bar"><i style={{ width: Math.min(100,100*(spend?.[index] ?? 0)/run.caps[index]!) + "%" }} /></div>
        </div>)}
      </section>
      {run.phase === "draft" && <section className="nba-gm-dev__panel">
        <div className="nba-gm-dev__section-title">
          <div><small>STEP {run.picks.length + 1} OF 7</small><h2>{run.pendingTeam ? "Your team is in" : "Choose a position"}</h2></div>
          {run.pendingTeam && <TeamMark code={run.pendingTeam} />}
        </div>
        <div className="nba-gm-dev__slots" role="group" aria-label="Roster slot">
          {NBA_GM_ROSTER_SLOTS.map(slot => <button key={slot} type="button"
            disabled={filled.has(slot) || !!run.pendingTeam || busy}
            aria-pressed={activeSlot === slot}
            className={activeSlot === slot ? "is-selected" : ""}
            onClick={() => setSelectedSlot(slot)}>
            {slotLabel(slot)}{filled.has(slot) ? " ✓" : ""}
          </button>)}
        </div>
        {!run.pendingTeam ? <button className="nba-gm-dev__primary" type="button"
          disabled={busy || filled.has(selectedSlot)}
          onClick={() => void act("spin", selectedSlot)}>
          Spin NBA Team for {slotLabel(selectedSlot)}
        </button> : <>
          <p className="nba-gm-dev__hint">Server-drawn team · {slotLabel(run.pendingSlot!)} · Choose one affordable eligible player.</p>
          <div className="nba-gm-dev__candidate-grid">
            {candidates.map(player => <PlayerCard key={player.id} player={player}
              disabled={busy} onPick={() => void act("pick", run.pendingSlot!, player.id)} />)}
          </div>
          {!candidates.length && <p role="status">No eligible players. Reload to recheck the server session.</p>}
        </>}
      </section>}
      <section className="nba-gm-dev__panel">
        <div className="nba-gm-dev__section-title"><div><small>YOUR ROTATION</small><h2>Roster board</h2></div></div>
        <div className="nba-gm-dev__roster">
          {NBA_GM_ROSTER_SLOTS.map(slot => {
            const drafted = run.picks.find(pick => pick.slot === slot);
            const player = drafted && byId.get(drafted.playerId);
            return <div className="nba-gm-dev__roster-row" key={slot}>
              <strong>{slotLabel(slot)}</strong>
              {player ? <><TeamMark code={player.teamCode} /><span>{player.name}<small>{player.currentGrade} OVR · {money(player.salaries[0])}</small></span></>
                : <span className="nba-gm-dev__empty">Open</span>}
            </div>;
          })}
        </div>
        {run.phase === "review" && <>
          <p className="nba-gm-dev__hint">Review all seven selections and every cap year before locking the franchise. Confirmation runs three server-owned, deterministic 82-game seasons.</p>
          <button className="nba-gm-dev__primary" disabled={busy} onClick={() => void act("confirm")}>
            Confirm Franchise & Simulate
          </button>
        </>}
      </section>
      {run.phase === "final" && <section className="nba-gm-dev__panel nba-gm-dev__results">
        <small>SERVER-RESOLVED · THREE-SEASON FRANCHISE</small>
        <h2>Your NBA GM results</h2>
        <div className="nba-gm-dev__season-grid">
          {run.results.map(s => <article key={s.season}>
            <small>SEASON {s.season}</small><strong>{s.wins}–{s.losses}</strong>
            <span>{s.finish}</span>
            <p>Offense {s.offense.toFixed(1)} · Defense {s.defense.toFixed(1)}</p>
          </article>)}
        </div>
        <p className="nba-gm-dev__hint">Prototype outcome model. Win curves, playoff thresholds and salary rules need balancing before a public release.</p>
      </section>}
      {run.phase === "final" && <button className="nba-gm-dev__restart" type="button" disabled={busy}
        onClick={() => void act("start")}>Start another franchise</button>}
      <footer className="nba-gm-dev__disclaimer">Private NBA GM QA · Provisional player positions and grades · Fictional three-year game salary windows · Not published or eligible for leaderboards.</footer>
    </>}
  </main>;
}
