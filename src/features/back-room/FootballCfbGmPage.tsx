import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import "../../styles/football-gm-final.css";
import { useIdentity } from "../identity/IdentityProvider";
import { GmFootballWheel, PlayerHeadshot } from "./FootballGmModePage";
import { wheelFootballTeam, type WheelFootballTeam } from "./wheelFootballModel";
import {
  CFB_GM_VERSION, CFB_GM_BUDGETS, CFB_GM_ROSTER_SLOTS, CFB_GM_SLOT_LABELS,
  cfbGmCandidates, cfbGmContinuity, cfbGmEligibleSchools, cfbGmEnterOffseason,
  cfbGmFinalResult, cfbGmInitial, cfbGmMoney, cfbGmOpenSlots, cfbGmPick,
  cfbGmPlayer, cfbGmPortalOut, cfbGmSeason, cfbGmSpent, cfbGmSpin,
  cfbGmValidateRun, cfbGmEffectiveGrade, cfbGmExitSignal,
  cfbGmPrice, cfbGmChemistry, cfbGmNegotiateRetention, cfbGmOffseasonReady,
  cfbGmRoleFit,
  cfbGmPendingRetentions, cfbGmRetentionQuote,
  type CfbGmBudget, type CfbGmPlayer, type CfbGmRosterEntry, type CfbGmRun,
  type CfbGmSeason, type CfbGmRetentionAgreement, type CfbGmRetentionTier,
} from "./footballCfbGmEngine";
import { cfbGmDevelop } from "./footballCfbGmDevelopment";
import { footballGmDevelopmentResult, footballGmTalentTier } from "./footballGmScouting";
import { FootballCfbGmDiagnostics } from "./FootballCfbGmDiagnostics";

function freshSeed() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "")
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function storageKey(profileId: string) {
  return "octagon:" + CFB_GM_VERSION + ":" + profileId;
}
function loadStored(profileId: string | undefined) {
  if (!profileId || typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(storageKey(profileId));
    return value ? cfbGmValidateRun(JSON.parse(value)) : null;
  } catch { return null; }
}
function teamStyle(schoolId: string): CSSProperties | undefined {
  const team = wheelFootballTeam(schoolId);
  if (!team) return undefined;
  return {
    "--gm-team-primary": team.primaryColor,
    "--gm-team-secondary": team.secondaryColor,
  } as CSSProperties;
}
function TeamLogo({schoolId}: {schoolId: string}) {
  const team = wheelFootballTeam(schoolId);
  if (!team) return null;
  return <span className="football-wheel-team-logo" aria-hidden="true">
    {team.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team.shortCode}</b>}
  </span>;
}
function Quality({grade}: {grade: number}) {
  const tier = footballGmTalentTier(grade);
  return <span className={"football-gm__quality-pill quality-" + tier.toLowerCase()}>{tier}</span>;
}
function Outlook({value}: {value: CfbGmPlayer["outlook"]}) {
  const tone = value === "HIGH UPSIDE" ? "upside" : value === "RISING" ? "rising"
    : value === "BOOM/BUST" ? "volatile" : value === "DECLINE RISK" ? "decline" : "stable";
  return <span className={"football-gm__outlook-pill outlook-" + tone}>{value}</span>;
}
function DevelopmentNote({player, seed}: {player: CfbGmPlayer; seed: string}) {
  const delta = cfbGmDevelop(player.id, player.currentGrade, player.classification, seed).delta;
  return <small className="football-gm__development-note">2027: {footballGmDevelopmentResult(delta)}</small>;
}
function ExitSignal({player}: {player: CfbGmPlayer}) {
  const signal = cfbGmExitSignal(player);
  return <span title={signal.detail} className={"football-gm__cfb-exit-risk risk-" + signal.tone}>
    {signal.label}
  </span>;
}
function RoleFit({player, slot}: {player:CfbGmPlayer; slot:typeof CFB_GM_ROSTER_SLOTS[number]}) {
  // Only call out a genuine lineup decision. Eligible positions already appear
  // in the draft subline; repeating "multi-slot" is not scouting information.
  if (cfbGmRoleFit(player, slot).label !== "FLEX FIT") return null;
  return <span className="football-gm__cfb-role-fit"
    title={"Verified " + player.family + " eligible for this FLEX role."}>FLEX FIT</span>;
}
function Cap({roster, year, budget, seed = "", offers = {}}: {roster: readonly CfbGmRosterEntry[];
  year: 1 | 2; budget: number; seed?: string; offers?: Record<string,CfbGmRetentionAgreement>}) {
  const spent = cfbGmSpent(roster, year, seed, offers);
  const remaining = budget - spent;
  const pct = Math.min(100, Math.max(0, spent / budget * 100));
  return (
    <section className={"football-gm__cap surface-card" + (remaining < 0 ? " is-over" : "")}>
      <div>
        <span><small>YEAR {year} NIL BUDGET</small><strong>{cfbGmMoney(spent)} / {cfbGmMoney(budget)}</strong></span>
        <b>{remaining >= 0 ? cfbGmMoney(remaining) + " LEFT" : cfbGmMoney(-remaining) + " OVER"}</b>
      </div>
      <i><em style={{width: pct + "%"}} /></i>
    </section>
  );
}
function Roster({roster, year, seed, compact = false, onPortalOut, limited = false, offers = {}}: {
  roster: readonly CfbGmRosterEntry[];
  year: 1 | 2;
  seed: string;
  compact?: boolean;
  onPortalOut?: (playerId: string) => void;
  limited?: boolean;
  offers?: Record<string,CfbGmRetentionAgreement>;
}) {
  const bySlot = new Map(roster.map((r) => [r.slot, r]));
  return <section className={"football-gm__roster surface-card" + (compact ? " is-compact" : "")}>
    <header><span><small>YOUR TEAM</small><strong>7-MAN CORE</strong></span><b>{roster.length}/7</b></header>
    <div className="football-gm__roster-grid">
      {CFB_GM_ROSTER_SLOTS.map((slot) => {
        const row = bySlot.get(slot);
        const player = row ? cfbGmPlayer(row.playerId) : null;
        return <article key={slot} className={player ? "is-filled" : ""} style={player ? teamStyle(player.schoolId) : undefined}>
          <small>{slot === "SECONDARY" ? "SEC" : CFB_GM_SLOT_LABELS[slot]}</small>
          {player ? <>
            <div className="football-gm__roster-player">
              <PlayerHeadshot player={{team: player.schoolId, name: player.name}} />
              <span><strong>{player.name}</strong><em>{player.school} · {player.family} · {player.classification ? "2026 " + player.classification : "CLASS UNVERIFIED"}</em>
                <span className="football-gm__roster-scouting"><Quality grade={cfbGmEffectiveGrade(player, year, seed)} />
                  {year === 1 ? <><Outlook value={player.outlook} /><ExitSignal player={player} /><RoleFit player={player} slot={slot} /></>
                    : <><DevelopmentNote player={player} seed={seed} /><RoleFit player={player} slot={slot} /></>}</span>
              </span>
            </div>
            <div className="football-gm__roster-contract">
              <b>{cfbGmMoney(cfbGmPrice(player, year, seed, offers))}</b>
              <span>{year === 1 ? "2026 NIL" : row?.acquired === "portal" ? "PORTAL IN" : "2027 RETENTION"}</span>
            </div>
            {onPortalOut ? <button type="button" disabled={limited} onClick={() => onPortalOut(player.id)}>
              {limited ? "2 / 2 USED" : "PORTAL OUT"}
            </button> : null}
          </> : <strong className="football-gm__open">OPEN</strong>}
        </article>;
      })}
    </div>
  </section>;
}
function ScoutKey({close}: {close: () => void}) {
  return <div className="football-gm__scout-sheet-backdrop" role="presentation" onClick={close}>
    <section className="football-gm__scout-sheet" role="dialog" aria-modal="true" aria-label="Player scouting key"
      onClick={(event) => event.stopPropagation()}>
      <header><span><small>PLAYER OUTLOOK</small><strong>SCOUT KEY</strong></span>
        <button type="button" aria-label="Close player scouting key" onClick={close}>×</button></header>
      <div>
        <p><b>ELITE / IMPACT / STARTER / DEPTH</b><span>Current college ability. Exact audited grades are hidden.</span></p>
        <p><b>HIGH UPSIDE / RISING / STEADY / BOOM/BUST / DECLINE RISK</b><span>Same five probability-based outlook categories as NFL; college development odds are independently researched.</span></p>
        <p><b>COLLEGE DEPARTURES</b><span>FINAL YEAR means verified no 2027 eligibility. NFL LEAP / CHANCE, RETURN UNCERTAIN and PORTAL RISK describe modeled departure risk. RETURN UNCERTAIN means another eligible season is not verified, not that the player definitely leaves.</span></p>
        <p><b>2026 NIL</b><span>Modeled player market prices, not verified NIL contracts; independent of HQ grades.</span></p>
        <p><b>2026 CLASS</b><span>Roster-listed FR/SO/JR/SR or extended-year class; unverified when the source has no reliable match. A class is not a confirmed draft decision.</span></p>
        <p><b>2027 DEVELOPMENT</b><span>Returning players can improve, break out, remain steady, or decline. Current HQ ratings stay unchanged; only modeled 2027 performance moves.</span></p>
        <p><b>2027 NIL OFFERS</b><span>Year 2 asking prices respond to player-specific demand and development. Offer a discount, market value or priority premium. One binding choice per returning player; a rejected offer loses that player.</span></p>
        <p><b>TRANSFER WINDOW</b><span>Only modeled 2027-eligible recruits available in this game appear. This fictional recruitment pool is not a real-world portal listing. Up to two voluntary portal-outs.</span></p>
      </div>
    </section>
  </div>;
}
function Board({schoolId, roster, budget, year, seed, excluded, onPick, offers = {}}: {
  schoolId: string; roster: readonly CfbGmRosterEntry[]; budget: number; year: 1 | 2;
  seed: string; excluded: ReadonlySet<string>; onPick: (id: string) => void;
  offers?: Record<string,CfbGmRetentionAgreement>;
}) {
  const team = wheelFootballTeam(schoolId);
  const candidates = cfbGmCandidates(schoolId, roster, budget, year, true, excluded, seed, offers);
  const [scoutKey, setScoutKey] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<CfbGmPlayer["family"] | null>(null);
  useEffect(() => {
    setScoutKey(false);
    setSelectedPosition(null);
  }, [schoolId, roster.length]);
  const positions: CfbGmPlayer["family"][] = ["QB", "RB", "WR", "TE", "Front Seven", "Secondary"];
  const availablePositions = positions.filter((position) => candidates.some((player) => player.family === position));
  const visibleCandidates = candidates.filter((player) => player.family === selectedPosition);
  if (!team) return null;
  return <>
    <section className="football-wheel-picker football-gm__picker surface-card" style={teamStyle(schoolId)}>
      <header><TeamLogo schoolId={schoolId} />
        <div><p className="eyebrow">{year === 1 ? "YOUR SPIN" : "TRANSFER PORTAL"}</p><h2>{team.name}</h2>
          <span>Choose a position, then a player. GM automatically fits the legal roster spots.</span></div>
        <button className="football-gm__scout-key-button" type="button" onClick={() => setScoutKey(true)}
          aria-label="Open player scouting key">?</button>
      </header>
      <div className="football-wheel-picker__slots football-gm__position-tabs" aria-label="Available positions">
        {availablePositions.map((position) => <button type="button" key={position}
          className={selectedPosition === position ? "is-active" : ""}
          aria-pressed={selectedPosition === position} onClick={() => setSelectedPosition(position)}>
          <strong>{position === "Front Seven" ? "FRONT 7" : position === "Secondary" ? "SEC" : position}</strong>
        </button>)}
      </div>
      {selectedPosition ? <div className="football-wheel-picker__candidates football-gm__picker-candidates" aria-label={selectedPosition + " candidates"}>
        {visibleCandidates.map((player) => <button key={player.id} type="button" onClick={() => onPick(player.id)}>
          <PlayerHeadshot player={{team: player.schoolId, name: player.name}} className="football-wheel-picker__headshot" />
          <span className="football-gm__picker-player-copy">
            <strong>{player.name}</strong><small>{player.family} · {player.classification ? "2026 " + player.classification : "CLASS UNVERIFIED"} · {player.eligibleSlots.map((s) => CFB_GM_SLOT_LABELS[s]).join(" / ")}</small>
            <span className="football-gm__candidate-tags"><Quality grade={cfbGmEffectiveGrade(player, year, seed)} />
              {year === 1 ? <><Outlook value={player.outlook} /><ExitSignal player={player} /></>
                : <DevelopmentNote player={player} seed={seed} />}</span>
          </span>
          <span className="football-gm__picker-action"><b>{cfbGmMoney(cfbGmPrice(player, year, seed, offers))}</b>
            <em>SELECT →</em></span>
        </button>)}
      </div> : <p className="football-wheel-picker__message football-gm__position-prompt">
        {candidates.length ? "Choose a position to scout available players." : "No affordable legal recruit from this school. Continue the search."}
      </p>}
    </section>
    {scoutKey ? <ScoutKey close={() => setScoutKey(false)} /> : null}
  </>;
}
function Season({season}: {season: CfbGmSeason}) {
  return <article className="football-gm__season-card">
    <small>YEAR {season.year} · {season.year === 1 ? "2026" : "2027"}</small>
    <strong>{season.overall} OVR</strong>
    <span>REGULAR SEASON {season.wins}–{season.losses} · {season.cfpSeed ? "#" + season.cfpSeed + " CFP SEED" : "OUTSIDE CFP"}</span>
    <b>{season.finish}</b>
    <small>CHEMISTRY {season.chemistry}/100 · {season.winOdds.toFixed(1)}% EST. TITLE CHANCE</small>
  </article>;
}

/** NFL's fixed-center five-category progression, without hidden grade positioning. */
export function cfbGmMovementPercent(delta: number) {
  switch (footballGmDevelopmentResult(delta)) {
    case "MAJOR REGRESSION": return 12;
    case "REGRESSED": return 32;
    case "HELD STEADY": return 50;
    case "IMPROVED": return 68;
    case "BREAKOUT": return 88;
  }
}
function OutcomeBand({player, seed}: {player: CfbGmPlayer; seed: string}) {
  const delta = cfbGmDevelop(player.id, player.currentGrade, player.classification, seed).delta;
  const label = footballGmDevelopmentResult(delta);
  const tone = delta < 0 ? "down" : delta > 0 ? "up" : "steady";
  return <div className="gm-final__player-outcome">
    <div className="gm-final__band" role="img" aria-label={player.name + ": " + label.toLowerCase() + ". Start is fixed in the center and the final dot shows category only; no numeric player grades."}>
      <div className="gm-final__band-track">
        <span className="gm-final__band-start" style={{left: "50%"}} />
        <span className={"gm-final__band-finish is-" + tone} style={{left: cfbGmMovementPercent(delta) + "%"}} />
      </div>
      <div className="gm-final__band-legend"><small>DECLINED</small><small>START</small><small>IMPROVED</small></div>
    </div>
    <span className={"gm-final__outcome-text is-" + tone}>{label}</span>
  </div>;
}
function Final({run, replay}: {run: CfbGmRun; replay: () => void}) {
  const result = cfbGmFinalResult(run);
  const budget = CFB_GM_BUDGETS[run.budget];
  const yearTwoSpent = cfbGmSpent(run.finalRoster, 2, run.seed, run.retentionOffers);
  const rows = CFB_GM_ROSTER_SLOTS.flatMap((slot) => {
    const entry = run.finalRoster.find((r) => r.slot === slot);
    const player = entry && cfbGmPlayer(entry.playerId);
    if (!entry || !player) return [];
    const beforeEntry = run.roster.find((r) => r.slot === slot);
    const before = beforeEntry ? cfbGmPlayer(beforeEntry.playerId) : null;
    const delta = cfbGmDevelop(player.id, player.currentGrade, player.classification, run.seed).delta;
    return [{slot, entry, player, before, delta}];
  });
  const changes = rows.filter((row) => row.before?.id !== row.player.id);
  const leap = [...rows].sort((a,b) => b.delta-a.delta)[0];
  const setback = [...rows].sort((a,b) => a.delta-b.delta)[0];
  const verdict = result.score >= 93 ? "TITLE-CALIBER" : result.score >= 85 ? "STRONG PROGRAM"
    : result.score >= 76 ? "PROMISING BUILD" : "MORE WORK TO DO";
  const averageOvr = (result.seasons[0].overall + result.seasons[1].overall) / 2;
  return <div className="football-gm-final gm-final" aria-label="Two-year college GM final result">
    <section className="gm-final__hero surface-card">
      <div className="gm-final__eyebrow">YOUR COLLEGE GM FINAL <span>2026–2027 · {run.budget}</span></div>
      <div className="gm-final__hero-main">
        <div className="gm-final__score"><strong>{result.score.toFixed(1)}</strong><span>GM SCORE</span></div>
        <div className="gm-final__verdict"><small>BOTTOM LINE</small><b>{verdict}</b>
          <span>Two seasons. One portal offseason. Your decisions.</span></div>
      </div>
      <div className="gm-final__stats">
        <div><b>{averageOvr.toFixed(1)}</b><small>AVG TEAM OVR</small></div>
        <div><b>{result.resumeScore.toFixed(1)}</b><small>CFP RÉSUMÉ</small></div>
        <div><b>{result.retained}/7</b><small>CORE RETAINED</small></div>
        <div><b>{changes.length}</b><small>NEW YEAR 2 STARTERS</small></div>
      </div>
    </section>
    <section className="gm-final__section surface-card" aria-label="Two college seasons">
      <header className="gm-final__heading"><h2>TWO-YEAR RESULTS</h2><small>OVR · RECORD · CFP FINISH</small></header>
      <div className="gm-final__seasons">
        {result.seasons.map((season) => <div className="gm-final__season" key={season.year}>
          <small>{season.year === 1 ? "2026" : "2027"}</small>
          <div><strong>{season.overall}</strong><span>OVR</span></div>
          <b>{season.wins}–{season.losses}</b>
          <em>{season.finish}{season.cfpSeed ? " · #" + season.cfpSeed + " SEED" : ""}</em>
        </div>)}
      </div>
    </section>
    <section className="gm-final__section surface-card" aria-label="College GM run highlights">
      <header className="gm-final__heading"><h2>RUN HIGHLIGHTS</h2></header>
      <div className="gm-final__highlights">
        <article className="is-positive"><span aria-hidden="true">↗</span><div>
          <small>{changes.length ? "KEY PORTAL MOVE" : "CORE KEPT"}</small>
          <strong>{changes[0]?.player.name ?? "Original roster retained"}</strong>
          <p>{changes.length ? "Transfer portal addition" : "No replacements required"}</p>
        </div></article>
        <article className="is-gold"><span aria-hidden="true">★</span><div>
          <small>{leap && leap.delta > 0 ? "BIGGEST LEAP" : "CORE ANCHOR"}</small>
          <strong>{leap?.player.name ?? "Your program"}</strong>
          <p>{leap && leap.delta > 0 ? footballGmDevelopmentResult(leap.delta) : "Kept the core competitive"}</p>
        </div></article>
        <article className="is-negative"><span aria-hidden="true">↘</span><div>
          <small>{setback && setback.delta < 0 ? "BIGGEST SETBACK" : "DEVELOPMENT CHECK"}</small>
          <strong>{setback && setback.delta < 0 ? setback.player.name : "No major setbacks"}</strong>
          <p>{setback && setback.delta < 0 ? footballGmDevelopmentResult(setback.delta) : "No notable regression"}</p>
        </div></article>
      </div>
    </section>
    <section className="gm-final__section gm-final__roster surface-card" aria-label="Final roster development outcomes">
      <header className="gm-final__heading"><h2>YOUR FINAL ROSTER</h2><small>2026 → 2027</small></header>
      <p className="gm-final__hint">START stays centered. The dot shows one of five development outcomes, never hidden player grades.</p>
      <div className="gm-final__roster-list">
        {rows.map((row) => {
          const tier = footballGmTalentTier(cfbGmEffectiveGrade(row.player, 2, run.seed));
          const team = wheelFootballTeam(row.player.schoolId);
          return <article className="gm-final__player" key={row.slot}>
            <div className="gm-final__player-identity">
              <b className="gm-final__position">{CFB_GM_SLOT_LABELS[row.slot]}</b>
              <span className="gm-final__portrait"><PlayerHeadshot player={{team:row.player.schoolId,name:row.player.name}} /></span>
              {team?.logoSrc ? <img className="gm-final__team-logo" alt="" src={team.logoSrc} />
                : <span className="gm-final__team-code">{team?.shortCode ?? "CFB"}</span>}
              <div className="gm-final__player-name"><strong>{row.player.name}</strong>
                <small>{row.player.school} · {cfbGmMoney(cfbGmPrice(row.player,2,run.seed,run.retentionOffers))} · 2027</small></div>
              <span className={"gm-final__acquired" + (row.before?.id === row.player.id ? "" : " is-new")}>
                {row.before?.id === row.player.id ? "RETAINED" : "PORTAL"}
              </span>
              <b className={"gm-final__tier is-" + tier.toLowerCase()}>{tier}</b>
            </div>
            <OutcomeBand player={row.player} seed={run.seed} />
          </article>;
        })}
      </div>
    </section>
    <section className="gm-final__section surface-card" aria-label="College offseason transactions">
      <header className="gm-final__heading"><h2>OFFSEASON MOVES</h2>
        <small>{result.forcedDepartures} FORCED EXITS · {result.voluntaryDepartures} PORTAL-OUTS · {changes.length} CHANGED</small></header>
      {changes.length ? <div className="gm-final__transactions">
        {changes.map((row) => <div className="gm-final__transaction" key={row.slot}>
          <b>{CFB_GM_SLOT_LABELS[row.slot]}</b><span><strong>{row.before?.name ?? "OPEN"}</strong>
          <small>→</small><strong>{row.player.name}</strong></span><em>PORTAL</em>
        </div>)}
      </div> : <p className="gm-final__hint">Your original seven-player core stayed together.</p>}
      <details className="gm-final__disclosure"><summary>VIEW FULL ROSTER EVOLUTION <span>Y1 → Y2</span></summary>
        <div className="gm-final__evolution">
          {rows.map((row) => <div key={row.slot}><b>{CFB_GM_SLOT_LABELS[row.slot]}</b>
            <span><small>YEAR 1</small><strong>{row.before?.name ?? "—"}</strong>
              <small>{row.before ? footballGmTalentTier(row.before.currentGrade) : "—"}</small></span>
            <span aria-hidden="true">→</span><span><small>YEAR 2</small><strong>{row.player.name}</strong>
              <small>{footballGmTalentTier(cfbGmEffectiveGrade(row.player, 2, run.seed))}</small></span>
          </div>)}
        </div>
      </details>
    </section>
    <div className="gm-final__bottom">
      <section className="gm-final__section surface-card" aria-label="College GM score breakdown">
        <header className="gm-final__heading"><h2>GM SCORE BREAKDOWN</h2></header>
        <div className="gm-final__math"><span>Roster (55%)</span><i><b style={{width:result.rosterManagement+"%"}} /></i><strong>{result.rosterManagement.toFixed(1)}</strong></div>
        <div className="gm-final__math is-playoff"><span>CFP (45%)</span><i><b style={{width:result.resumeScore+"%"}} /></i><strong>{result.resumeScore.toFixed(1)}</strong></div>
      </section>
      <section className="gm-final__section surface-card" aria-label="Year 2 NIL finances">
        <header className="gm-final__heading"><h2>FINANCIALS · 2027</h2></header>
        <div className="gm-final__money"><span>NIL committed</span><strong>{cfbGmMoney(yearTwoSpent)}</strong></div>
        <div className="gm-final__money"><span>NIL remaining</span><strong>{cfbGmMoney(budget-yearTwoSpent)}</strong></div>
      </section>
    </div>
    <section className="football-gm-report__actions surface-card">
      <button className="primary-action" type="button" onClick={replay}>NEW GM RUN</button>
    </section>
  </div>;
}

export default function FootballCfbGmPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const id = identity.profile?.id;
  const [run, setRun] = useState<CfbGmRun>(() => loadStored(id) ?? cfbGmInitial(freshSeed()));
  const [ready, setReady] = useState(() => Boolean(id));
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [message, setMessage] = useState("");
  const budget = CFB_GM_BUDGETS[run.budget];
  const year: 1 | 2 = run.phase === "offseason" ? 2 : 1;
  const roster = run.phase === "offseason" || run.phase === "year2" || run.phase === "final"
    ? run.finalRoster : run.roster;
  const excluded = useMemo(() => new Set([
    ...run.roster.map((r) => r.playerId),
    ...run.departures.map((r) => r.playerId),
    ...run.voluntaryPortalOuts,
  ]), [run.roster, run.departures, run.voluntaryPortalOuts]);
  // A binding NIL offer can change 2027 portal affordability without changing the roster.
  const eligible = useMemo(() => run.phase === "draft" || run.phase === "offseason"
    ? cfbGmEligibleSchools(roster, budget, year,
      run.phase === "draft" ? run.previousSchool : run.previousPortalSchool, run.schoolIds,
      run.phase === "offseason" ? excluded : new Set<string>(), run.seed, run.retentionOffers)
    : [], [run.phase, run.previousSchool, run.previousPortalSchool, run.schoolIds, roster, budget, year, excluded, run.seed, run.retentionOffers]);
  const wheelTeams = eligible.map((schoolId) => wheelFootballTeam(schoolId)).filter((t): t is WheelFootballTeam => Boolean(t));
  const pending = run.pendingSchool ? wheelFootballTeam(run.pendingSchool) : null;
  const pendingRetentions = run.phase === "offseason" ? cfbGmPendingRetentions(run) : [];
  const offseasonReady = cfbGmOffseasonReady(run);

  useEffect(() => {
    if (identity.status !== "ready") return;
    setRun(loadStored(id) ?? cfbGmInitial(freshSeed()));
    setReady(true);
  }, [id, identity.status]);

  useEffect(() => {
    if (!id || !ready || identity.status !== "ready") return;
    window.localStorage.setItem(storageKey(id), JSON.stringify(run));
  }, [id, identity.status, ready, run]);

  if (identity.status !== "ready" || !ready) return <div className="page football-gm-page"><section className="surface-card">Loading CFB The GM…</section></div>;
  if (identity.profile?.canControlPicks !== true) return <Navigate to="/football" replace />;

  function patch(next: Partial<CfbGmRun>) { setRun((prev) => ({...prev, ...next})); }
  function chooseBudget(mode: CfbGmBudget) {
    setRun(cfbGmInitial(freshSeed(), mode));
    setMessage("");
  }
  function spin() {
    if (spinning || run.pendingSchool || !eligible.length || (run.phase === "offseason" && pendingRetentions.length)) return;
    const index = run.phase === "draft" ? run.spinIndex : 100 + run.portalSpins;
    const school = cfbGmSpin(run.seed, index, eligible);
    if (!school) return;
    const spot = wheelTeams.findIndex((team) => team.code === school);
    if (spot < 0) return;
    setSpinning(true);
    const step = 360 / wheelTeams.length;
    setRotation((current) => {
      const existing = ((current % 360) + 360) % 360;
      const target = ((-spot * step) % 360 + 360) % 360;
      return current + 1080 + ((target - existing + 360) % 360);
    });
    window.setTimeout(() => { patch({pendingSchool: school}); setSpinning(false); }, 1550);
  }
  function pick(id: string) {
    const next = cfbGmPick(roster, id, budget, year, run.phase === "offseason" ? excluded : new Set(), run.seed, run.retentionOffers);
    if (!next) { setMessage("That roster or NIL budget fit is no longer legal."); return; }
    const school = cfbGmPlayer(id)?.schoolId ?? null;
    if (run.phase === "draft") patch({roster: next, pendingSchool: null, previousSchool: school,
      spinIndex: run.spinIndex + 1, phase: next.length === 7 ? "year1" : "draft"});
    if (run.phase === "offseason") patch({finalRoster: next, pendingSchool: null, previousPortalSchool: school,
      portalSpins: run.portalSpins + 1});
    setMessage("");
  }
  function negotiate(playerId:string, tier:CfbGmRetentionTier) {
    const next = cfbGmNegotiateRetention(run, playerId, tier);
    if (!next) return;
    setRun(next);
    const accepted = next.retentionOffers[playerId]?.accepted;
    setMessage((cfbGmPlayer(playerId)?.name ?? "Player") + (accepted
      ? " accepted the " + tier.toLowerCase() + " 2027 NIL offer."
      : " rejected the offer. You will need to recruit a replacement."));
  }
  function portalOut(playerId: string) {
    const next = cfbGmPortalOut(run, playerId);
    if (!next) return;
    setRun(next); setMessage("");
  }
  function replay() {
    setRun(cfbGmInitial(freshSeed(), run.budget));
    setRotation(0); setMessage("");
    window.scrollTo({top: 0, behavior: "smooth"});
  }
  const firstSeason = cfbGmSeason(run, 1);
  return <div className="page football-gm-page" data-cfb-gm="true">
    <header className="football-gm__header">
      <button type="button" onClick={() => navigate("/football")}>← FOOTBALL HQ</button>
      <span><small>COLLEGE FRONT OFFICE · OWNER PREVIEW</small><strong>THE GM</strong></span>
      <b>2 YEARS</b>
    </header>

    {run.phase === "intro" ? <section className="football-gm__intro surface-card">
      <p className="eyebrow">CFB FRONT OFFICE CHALLENGE · AP TOP 25</p>
      <h1>BUILD IT. SURVIVE THE OFFSEASON. SEE IF IT WINS.</h1>
      <p className="football-gm__intro-lede">Build a 7-player college core with a modeled NIL budget. Same player prices in both modes.</p>
      <div className="football-gm__intro-stages">
        <article><b>1</b><span><strong>DRAFT</strong><small>Spin an AP Top 25 school. Pick a player. Fill all 7 spots.</small></span></article>
        <article><b>2</b><span><strong>OFFSEASON</strong><small>Eligibility/NFL decisions, NIL repricing, retention, and the transfer portal.</small></span></article>
        <article><b>3</b><span><strong>2-YEAR RESULT</strong><small>Team quality, continuity, and College Football Playoff outcomes.</small></span></article>
      </div>
      <div className="football-gm__intro-facts" aria-label="Key game rules"><span>7-MAN CORE</span><span>1 OFFSEASON</span><span>HIDDEN GRADES</span></div>
      <div className="football-gm__cfb-budget-modes" role="group" aria-label="Select NIL budget">
        {(["POWERHOUSE", "BUILDER"] as const).map((mode) => <button key={mode} type="button"
          className={run.budget === mode ? "is-selected" : ""}
          aria-pressed={run.budget === mode} onClick={() => chooseBudget(mode)}>{mode} · {cfbGmMoney(CFB_GM_BUDGETS[mode])}</button>)}
      </div>
      <p>Player NIL figures and offseason decisions are modeled game estimates, not verified private contracts or future departures.</p>
      <button className="primary-action" type="button" onClick={() => patch({phase: "draft"})}>START THE DRAFT</button>
    </section> : null}

    {run.phase === "draft" ? <>
      <Cap roster={run.roster} year={1} budget={budget} />
      <Roster roster={run.roster} year={1} seed={run.seed} />
      <div className="football-gm__draft-context">
        <span>ROUND {run.roster.length + 1} OF 7 · {run.budget}</span>
        <strong>{cfbGmOpenSlots(roster).map((slot) => CFB_GM_SLOT_LABELS[slot]).join(" · ")}</strong>
      </div>
      <GmFootballWheel teams={wheelTeams} rotation={rotation} spinning={spinning}
        pendingTeam={pending} canSpin={Boolean(wheelTeams.length) && !run.pendingSchool} onSpin={spin} />
      {run.pendingSchool ? <Board schoolId={run.pendingSchool} roster={roster} budget={budget} year={1} seed={run.seed}
        excluded={new Set()} onPick={pick} /> : null}
      {!wheelTeams.length ? <section className="surface-card">No affordable legal combinations remain in this pool.</section> : null}
    </> : null}

    {run.phase === "year1" ? <>
      <Cap roster={run.roster} year={1} budget={budget} />
      <Roster roster={run.roster} year={1} seed={run.seed} />
      <section className="football-gm__year-reveal surface-card">
        <p className="eyebrow">YEAR 1 COMPLETE</p>
        <Season season={firstSeason} />
        <p>Now the college offseason: class-informed draft/eligibility decisions, modeled NIL repricing and individual 2027 development change your team.</p>
        <button className="primary-action" type="button" onClick={() => setRun(cfbGmEnterOffseason(run))}>ENTER THE OFFSEASON</button>
      </section>
    </> : null}

    {run.phase === "offseason" ? <>
      <Cap roster={run.finalRoster} year={2} budget={budget} seed={run.seed} offers={run.retentionOffers} />
      <section className="football-gm__offseason-status football-gm__cfb-portal-summary surface-card">
         <p className="eyebrow">THE OFFSEASON · 2027</p>
         <h2>THE TRANSFER WINDOW</h2>
         <div className="football-gm__cfb-portal-headline"><strong>{run.departures.length} DEPARTED</strong>
           <span>{cfbGmContinuity(run).retained}/7 CORE RETAINED · {run.voluntaryPortalOuts.length}/2 PORTAL-OUTS</span></div>
         {run.departures.length ? <div className="football-gm__cfb-departures" aria-label="Players who departed after 2026">
           {run.departures.map((d) => <div key={d.playerId}>
             <strong>{cfbGmPlayer(d.playerId)?.name}</strong>
             <span>{d.reason === "NFL declaration" ? "NFL DECLARATION" :
               d.reason === "Eligibility" ? "ELIGIBILITY EXPIRED" :
               d.reason === "NIL negotiation" ? "NIL OFFER REJECTED" : "TRANSFERRED OUT"}</span>
           </div>)}
         </div> : <p>Your original core returned. You can still make up to two voluntary moves.</p>}
         <details className="football-gm__cfb-portal-help"><summary>HOW RETENTION & NIL WORK</summary>
           <p>Recruiting chemistry and returning-player continuity modestly shape season outcomes, never the displayed talent OVR. Every remaining player needs a 2027 NIL decision; rejected offers create portal vacancies. The transfer pool is fictional and eligibility-screened.</p>
         </details>
       </section>
       <Roster roster={run.finalRoster} year={2} seed={run.seed} compact offers={run.retentionOffers}
        limited={run.voluntaryPortalOuts.length >= 2 || Boolean(run.pendingSchool)}
        onPortalOut={pendingRetentions.length ? undefined : portalOut} />
       <section className="football-gm__cfb-chemistry surface-card" aria-label="Team chemistry">
         <span><small>TEAM CHEMISTRY</small><strong>{cfbGmChemistry(run.finalRoster,2,run.roster).label}</strong></span>
         <b>{cfbGmChemistry(run.finalRoster,2,run.roster).meter}/100</b>
         <small>Familiar teammates and returning starters influence results, not the displayed OVR.</small>
       </section>
       {pendingRetentions.length ? <section className="football-gm__cfb-retention surface-card" aria-label="2027 NIL negotiations">
         <p className="eyebrow">2027 RETENTION</p><h2>KEEP YOUR CORE</h2>
         <p>{pendingRetentions.length} player{pendingRetentions.length===1?"":"s"} need a binding NIL offer. Discount is risky. Market may be declined. Priority secures a return at a premium.</p>
         <div className="football-gm__cfb-retention-list">{pendingRetentions.map((player) => {
           const quote=cfbGmRetentionQuote(run,player);
           return <article key={player.id}>
             <div><strong>{player.name}</strong><small>{player.school} · {player.family}</small>
               <span>2027 ASK {cfbGmMoney(quote.ask)}</span></div>
             <div className="football-gm__cfb-retention-options">
               {(["VALUE","MARKET","PRIORITY"] as const).map((tier)=><button type="button" key={tier}
                 onClick={()=>negotiate(player.id,tier)}><strong>{tier}</strong>
                 <span>{cfbGmMoney(quote[tier])}</span></button>)}
             </div>
           </article>;
         })}</div>
       </section> : null}
      {message ? <section className="football-gm__trade-message surface-card" role="status">{message}</section> : null}
      {pendingRetentions.length===0 ? (run.pendingSchool ? <Board schoolId={run.pendingSchool} roster={run.finalRoster} budget={budget}
        year={2} seed={run.seed} excluded={excluded} offers={run.retentionOffers} onPick={pick} /> :
      run.finalRoster.length < 7 ? <>
        <div className="football-gm__cfb-portal-step">
          <strong>RECRUIT {cfbGmOpenSlots(run.finalRoster).length} REPLACEMENT{cfbGmOpenSlots(run.finalRoster).length === 1 ? "" : "S"}</strong>
          <span>{cfbGmOpenSlots(run.finalRoster).map((slot) => CFB_GM_SLOT_LABELS[slot]).join(" · ")}</span>
        </div>
        <GmFootballWheel teams={wheelTeams} rotation={rotation} spinning={spinning}
          pendingTeam={pending} canSpin={Boolean(wheelTeams.length)} onSpin={spin} />
        {!wheelTeams.length ? <section className="football-gm__offseason-status surface-card is-crisis">
          <h2>YOUR NIL BUDGET NEEDS ROOM</h2>
          <p>{run.voluntaryPortalOuts.length < 2
            ? "No recruit fits this cap and roster. Consider releasing an expensive retained player."
            : "No legal recruit is left at this budget. Your current offseason cannot be completed."}</p>
        </section> : null}
      </> : <section className={"football-gm__offseason-status surface-card" + (offseasonReady ? " is-ready" : " is-crisis")}>
        <p className="eyebrow">{offseasonReady ? "WINDOW SET" : "NIL CAP CRISIS"}</p>
        <h2>{offseasonReady ? "YOU CAN MOVE FORWARD" : "YOU HAVE MOVES TO MAKE"}</h2>
        <p>{offseasonReady
          ? "All seven positions are filled under your Year 2 NIL budget. You can advance, or choose up to two voluntary portal-outs."
          : "Year 2 NIL commitments exceed the available budget. Release up to two players and replace them through the transfer portal."}</p>
        <button className="primary-action" type="button" disabled={!offseasonReady}
          onClick={() => patch({phase: "year2"})}>SIMULATE YEAR 2</button>
      </section>) : null}
    </> : null}

    {run.phase === "year2" ? <section className="football-gm__years23 surface-card">
      <p className="eyebrow">THE WINDOW</p><h1>YEAR 2</h1>
      <div className="football-gm__season-grid"><Season season={cfbGmSeason(run, 2)} /></div>
      <p>There is no second offseason. Every change to the core and each player's modeled development influences playoff probability. The 2026 HQ grades remain untouched.</p>
      <button className="primary-action" type="button" onClick={() => patch({phase: "final"})}>SEE 2-YEAR GM SCORE</button>
    </section> : null}

    {run.phase === "final" ? <Final run={run} replay={replay} /> : null}

    <FootballCfbGmDiagnostics run={run} />
  </div>;
}
