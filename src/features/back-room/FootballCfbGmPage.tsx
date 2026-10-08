import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import { useIdentity } from "../identity/IdentityProvider";
import { GmFootballWheel, PlayerHeadshot } from "./FootballGmModePage";
import { wheelFootballTeam, type WheelFootballTeam } from "./wheelFootballModel";
import {
  CFB_GM_VERSION, CFB_GM_BUDGETS, CFB_GM_ROSTER_SLOTS, CFB_GM_SLOT_LABELS,
  cfbGmCandidates, cfbGmContinuity, cfbGmEligibleSchools, cfbGmEnterOffseason,
  cfbGmFinalResult, cfbGmInitial, cfbGmMoney, cfbGmOpenSlots, cfbGmPick,
  cfbGmPlayer, cfbGmPortalOut, cfbGmSeason, cfbGmSpent, cfbGmSpin,
  cfbGmValidateRun, cfbGmEffectiveGrade,
  type CfbGmBudget, type CfbGmPlayer, type CfbGmRosterEntry, type CfbGmRun,
  type CfbGmSeason,
} from "./footballCfbGmEngine";
import { cfbGmDevelop } from "./footballCfbGmDevelopment";

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
  const tier = grade >= 94 ? "ELITE" : grade >= 89 ? "IMPACT" : grade >= 83 ? "STARTER" : "DEPTH";
  return <span className={"football-gm__quality-pill quality-" + tier.toLowerCase()}>{tier}</span>;
}
function Outlook({value}: {value: CfbGmPlayer["outlook"]}) {
  return <span className={"football-gm__outlook-pill outlook-" + (
    value === "RISING" ? "rising" : value === "DECLINE RISK" ? "decline" : "stable"
  )}>{value}</span>;
}
function Cap({roster, year, budget}: {roster: readonly CfbGmRosterEntry[]; year: 1 | 2; budget: number}) {
  const spent = cfbGmSpent(roster, year);
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
function Roster({roster, year, seed, compact = false, onPortalOut, limited = false}: {
  roster: readonly CfbGmRosterEntry[];
  year: 1 | 2;
  seed: string;
  compact?: boolean;
  onPortalOut?: (playerId: string) => void;
  limited?: boolean;
}) {
  const bySlot = new Map(roster.map((r) => [r.slot, r]));
  return <section className={"football-gm__roster surface-card" + (compact ? " is-compact" : "")}>
    <header><span><small>YOUR TEAM</small><strong>7-MAN CORE</strong></span><b>{roster.length}/7</b></header>
    <div className="football-gm__roster-grid">
      {CFB_GM_ROSTER_SLOTS.map((slot) => {
        const row = bySlot.get(slot);
        const player = row ? cfbGmPlayer(row.playerId) : null;
        return <article key={slot} className={player ? "is-filled" : ""} style={player ? teamStyle(player.schoolId) : undefined}>
          <small>{CFB_GM_SLOT_LABELS[slot]}</small>
          {player ? <>
            <div className="football-gm__roster-player">
              <PlayerHeadshot player={{team: player.schoolId, name: player.name}} />
              <span><strong>{player.name}</strong><em>{player.school} · {player.family} · {player.classification ? "2026 " + player.classification : "CLASS UNVERIFIED"}</em>
                <span className="football-gm__roster-scouting"><Quality grade={cfbGmEffectiveGrade(player, year, seed)} /><Outlook value={player.outlook} /></span>
              </span>
            </div>
            <div className="football-gm__roster-contract">
              <b>{cfbGmMoney(year === 1 ? player.nilYear1 : player.nilYear2)}</b>
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
        <p><b>RISING / STABLE / DECLINE RISK</b><span>Modeled outlook for next season.</span></p>
        <p><b>2026 NIL</b><span>Modeled player market prices, not verified NIL contracts; independent of HQ grades.</span></p>
        <p><b>2026 CLASS</b><span>Roster-listed FR/SO/JR/SR or extended-year class; unverified when the source has no reliable match. A class is not a confirmed draft decision.</span></p>
        <p><b>2027 DEVELOPMENT</b><span>Returning players can improve, break out, remain steady, or decline. Current HQ ratings stay unchanged; only modeled 2027 performance moves.</span></p>
        <p><b>2027 REPRICE</b><span>Estimated NIL retention cost in the single offseason.</span></p>
        <p><b>PORTAL OUT</b><span>Up to two voluntary departures, plus modeled forced eligibility/NFL departures.</span></p>
      </div>
    </section>
  </div>;
}
function Board({schoolId, roster, budget, year, seed, excluded, onPick}: {
  schoolId: string; roster: readonly CfbGmRosterEntry[]; budget: number; year: 1 | 2;
  seed: string; excluded: ReadonlySet<string>; onPick: (id: string) => void;
}) {
  const team = wheelFootballTeam(schoolId);
  const candidates = cfbGmCandidates(schoolId, roster, budget, year, true, excluded);
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
            <span className="football-gm__candidate-tags"><Quality grade={cfbGmEffectiveGrade(player, year, seed)} /><Outlook value={player.outlook} /></span>
          </span>
          <span className="football-gm__picker-action"><b>{cfbGmMoney(year === 1 ? player.nilYear1 : player.nilYear2)}</b>
            <em>SELECT →</em></span>
        </button>)}
      </div> : <p className="football-wheel-picker__message football-gm__position-prompt">
        {candidates.length ? "Choose a position to scout available players." : "No affordable legal player from this school. Continue the portal search."}
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
    <small>{season.winOdds.toFixed(1)}% EST. TITLE CHANCE</small>
  </article>;
}
function Final({run, replay}: {run: CfbGmRun; replay: () => void}) {
  const result = cfbGmFinalResult(run);
  const additions = run.finalRoster.filter((r) => !run.roster.some((x) => x.playerId === r.playerId));
  const yearTwoSpent = cfbGmSpent(run.finalRoster, 2);
  const budget = CFB_GM_BUDGETS[run.budget];
  return <div className="football-gm-report gm-result">
    <section className="gm-result__summary surface-card" aria-label="Final college GM score and seasons">
      <header className="gm-result__headline">
        <small>THE GM · COLLEGE · TWO-YEAR FINAL</small>
        <h1>YOUR TWO-YEAR GM RESULT</h1>
      </header>
      <div className="gm-result__scores">
        <div><small>YOUR PROGRAM</small><strong>{result.score.toFixed(1)}</strong><em>GM SCORE</em></div>
      </div>
      <div className="gm-result__season-comparison">
        <div className="gm-result__section-heading">
          <strong>YOUR TWO SEASONS</strong><small>OVR · REGULAR SEASON · CFP FINISH</small>
        </div>
        {result.seasons.map((season) => <article className="gm-result__season" key={season.year}>
          <small className="gm-result__season-number">YEAR {season.year}</small>
          <div className="gm-result__season-side">
            <strong className="gm-result__overall">{season.overall} <span>OVR</span></strong>
            <strong className="gm-result__record">{season.wins}–{season.losses} <small>W–L</small></strong>
            <span className="gm-result__finish">{season.finish}{season.cfpSeed ? " · #" + season.cfpSeed + " SEED" : ""}</span>
          </div>
        </article>)}
      </div>
    </section>

    <section className="gm-result__roster-card surface-card" aria-label="College front office result">
      <div className="gm-result__section-heading">
        <strong>WHAT YOU BUILT</strong><small>YOUR COLLEGE FRONT OFFICE</small>
      </div>
      <section className="gm-result__front-office" aria-label="2027 college core">
        <div className="gm-result__front-office-heading">
          <div><small>PROGRAM ARC · YEAR 2 CORE</small><h2>YOUR 2027 CORE</h2></div>
          <strong>{result.retained}/7 <small>Original core</small></strong>
        </div>
        <div className="gm-result__final-roster" aria-label="Final college roster">
          {CFB_GM_ROSTER_SLOTS.map((slot) => {
            const entry = run.finalRoster.find((r) => r.slot === slot);
            const player = entry ? cfbGmPlayer(entry.playerId) : null;
            if (!player) return null;
            const added = !run.roster.some((r) => r.playerId === player.id);
            return <div className="gm-result__player" key={slot}>
              <b>{CFB_GM_SLOT_LABELS[slot]}</b>
              <span><strong>{player.name}</strong><small>{player.school} · {cfbGmMoney(player.nilYear2)}</small></span>
              <span className="gm-result__player-meta">
                <Quality grade={cfbGmEffectiveGrade(player, 2, run.seed)} />
                {added ? <small className="gm-result__changed">NEW</small> : null}
              </span>
            </div>;
          })}
        </div>
        <div className="gm-result__moves">
          <div className="gm-result__section-heading">
            <strong>OFFSEASON TRANSACTIONS</strong>
            <small>{result.forcedDepartures} projected departures · {result.voluntaryDepartures} portal-outs · {additions.length} additions</small>
          </div>
          {additions.length ? additions.map((entry) => {
            const player = cfbGmPlayer(entry.playerId);
            return <div className="gm-result__move" key={entry.playerId}>
              <b>{CFB_GM_SLOT_LABELS[entry.slot]}</b>
              <span><small>PORTAL IN</small><strong>{player?.name} · {player?.school}</strong></span>
            </div>;
          }) : <p className="gm-result__quiet">All seven core spots filled without a portal addition.</p>}
        </div>
        <details className="gm-result__expander football-gm-report__evolution">
          <summary>VIEW FULL ROSTER EVOLUTION <span>Y1 → Y2</span></summary>
          <div className="football-gm-report__evolution-rows">
            <h3>ROSTER EVOLUTION</h3>
            {CFB_GM_ROSTER_SLOTS.map((slot) => {
              const fromRow = run.roster.find((r) => r.slot === slot);
              const toRow = run.finalRoster.find((r) => r.slot === slot);
              const before = fromRow ? cfbGmPlayer(fromRow.playerId) : null;
              const after = toRow ? cfbGmPlayer(toRow.playerId) : null;
              if (!before || !after) return null;
              const move = before.id === after.id ? "RETAINED"
                : run.roster.some((r) => r.playerId === after.id) ? "REASSIGNED" : "PORTAL";
              return <article className="football-gm-report__evolution-row" key={slot}>
                <b>{CFB_GM_SLOT_LABELS[slot]}</b>
                <div><small>YEAR 1</small><strong>{before.name}</strong>
                  <em>{before.school} · {cfbGmMoney(before.nilYear1)}</em>
                  <span className="football-gm-report__pills"><Quality grade={before.currentGrade} /><Outlook value={before.outlook} /></span>
                </div>
                <span className={"football-gm-report__move" + (move !== "RETAINED" ? " is-change" : "")}>{move}<i>→</i></span>
                <div className="is-final"><small>YEAR 2</small><strong>{after.name}</strong>
                  <em>{after.school} · {cfbGmMoney(after.nilYear2)} · {cfbGmDevelop(after.id, after.currentGrade, after.classification, run.seed).outcome}</em>
                  <span className="football-gm-report__pills"><Quality grade={cfbGmEffectiveGrade(after, 2, run.seed)} /><Outlook value={after.outlook} /></span>
                </div>
              </article>;
            })}
          </div>
        </details>
      </section>
    </section>

    <section className="gm-result__scoring-card surface-card" aria-label="College GM scoring explanation">
      <details className="gm-result__expander gm-result__scoring">
        <summary>HOW YOUR GM SCORE IS CALCULATED <span>55% ROSTER · 45% PLAYOFFS</span></summary>
        <p>The GM score combines the two-year core management score and the two-year CFP résumé.
          NIL spending is a roster constraint, not a source of bonus points.</p>
        <div className="gm-result__math-row"><span>ROSTER MANAGEMENT · 55%</span><b>{result.rosterManagement.toFixed(1)}</b></div>
        <div className="gm-result__math-row"><span>CFP RÉSUMÉ · 45%</span><b>{result.resumeScore.toFixed(1)}</b></div>
        <div className="gm-result__math-row"><span>Final GM score</span><b>{result.score.toFixed(1)}</b></div>
        <div className="gm-result__math-row"><span>YEAR 2 NIL</span><b>{cfbGmMoney(yearTwoSpent)}</b></div>
        <div className="gm-result__math-row"><span>NIL REMAINING</span><b>{cfbGmMoney(budget - yearTwoSpent)}</b></div>
      </details>
    </section>
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
  const eligible = useMemo(() => run.phase === "draft" || run.phase === "offseason"
    ? cfbGmEligibleSchools(roster, budget, year,
      run.phase === "draft" ? run.previousSchool : run.previousPortalSchool, run.schoolIds,
      run.phase === "offseason" ? excluded : new Set<string>())
    : [], [run.phase, run.previousSchool, run.previousPortalSchool, run.schoolIds, roster, budget, year, excluded]);
  const wheelTeams = eligible.map((schoolId) => wheelFootballTeam(schoolId)).filter((t): t is WheelFootballTeam => Boolean(t));
  const pending = run.pendingSchool ? wheelFootballTeam(run.pendingSchool) : null;
  const offseasonReady = run.phase === "offseason" && run.finalRoster.length === 7 && cfbGmSpent(run.finalRoster, 2) <= budget;

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
    if (spinning || run.pendingSchool || !eligible.length) return;
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
    const next = cfbGmPick(roster, id, budget, year, run.phase === "offseason" ? excluded : new Set());
    if (!next) { setMessage("That roster or NIL budget fit is no longer legal."); return; }
    const school = cfbGmPlayer(id)?.schoolId ?? null;
    if (run.phase === "draft") patch({roster: next, pendingSchool: null, previousSchool: school,
      spinIndex: run.spinIndex + 1, phase: next.length === 7 ? "year1" : "draft"});
    if (run.phase === "offseason") patch({finalRoster: next, pendingSchool: null, previousPortalSchool: school,
      portalSpins: run.portalSpins + 1});
    setMessage("");
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
      <Cap roster={run.finalRoster} year={2} budget={budget} />
      <section className="football-gm__offseason-status surface-card">
        <p className="eyebrow">THE OFFSEASON · TRANSFER PORTAL</p>
        <h2>RETAIN. REPRICE. REBUILD.</h2>
        <p>{run.departures.length} modeled NFL/eligibility/portal departure(s). Up to two voluntary portal-outs ({run.voluntaryPortalOuts.length}/2 used). Retained players use their Year 2 NIL figures.</p>
        {run.departures.length ? <div className="football-gm__intro-facts">
          {run.departures.map((d) => <span key={d.playerId}>{cfbGmPlayer(d.playerId)?.name}: {d.reason.toUpperCase()} (PROJECTED)</span>)}
        </div> : null}
      </section>
      <section className="football-gm__offseason-status surface-card">
        <p className="eyebrow">CONTINUITY</p>
        <strong>{cfbGmContinuity(run).retained}/7 ORIGINAL PLAYERS RETAINED</strong>
        <p>Turnover affects your playoff odds, not the displayed team OVR. Forced departures don't penalize the management score.</p>
      </section>
      <Roster roster={run.finalRoster} year={2} seed={run.seed} compact
        limited={run.voluntaryPortalOuts.length >= 2 || Boolean(run.pendingSchool)} onPortalOut={portalOut} />
      {message ? <section className="football-gm__trade-message surface-card" role="status">{message}</section> : null}
      {run.pendingSchool ? <Board schoolId={run.pendingSchool} roster={run.finalRoster} budget={budget}
        year={2} seed={run.seed} excluded={excluded} onPick={pick} /> :
      run.finalRoster.length < 7 ? <>
        <section className="football-gm__wheel surface-card">
          <p className="eyebrow">TRANSFER PORTAL · {cfbGmOpenSlots(run.finalRoster).map((slot) => CFB_GM_SLOT_LABELS[slot]).join(" · ")}</p>
          <h2>FIND YOUR REPLACEMENT</h2>
          <p>Spin an AP Top 25 school for an available replacement. Every addition must fit your Year 2 NIL budget.</p>
        </section>
        <GmFootballWheel teams={wheelTeams} rotation={rotation} spinning={spinning}
          pendingTeam={pending} canSpin={Boolean(wheelTeams.length)} onSpin={spin} />
        {!wheelTeams.length ? <section className="football-gm__offseason-status surface-card is-crisis">
          <h2>YOUR NIL BUDGET NEEDS ROOM</h2>
          <p>{run.voluntaryPortalOuts.length < 2
            ? "No affordable portal replacement fits yet. Consider releasing a retained player with a large NIL commitment."
            : "No legal replacement remains within the budget. This modeled offseason has reached a dead end."}</p>
        </section> : null}
      </> : <section className={"football-gm__offseason-status surface-card" + (offseasonReady ? " is-ready" : " is-crisis")}>
        <p className="eyebrow">{offseasonReady ? "WINDOW SET" : "NIL CAP CRISIS"}</p>
        <h2>{offseasonReady ? "YOU CAN MOVE FORWARD" : "YOU HAVE MOVES TO MAKE"}</h2>
        <p>{offseasonReady
          ? "All seven positions are filled under your Year 2 NIL budget. You can advance, or choose up to two voluntary portal-outs."
          : "Year 2 NIL commitments exceed the available budget. Release up to two players and replace them through the transfer portal."}</p>
        <button className="primary-action" type="button" disabled={!offseasonReady}
          onClick={() => patch({phase: "year2"})}>SIMULATE YEAR 2</button>
      </section>}
    </> : null}

    {run.phase === "year2" ? <section className="football-gm__years23 surface-card">
      <p className="eyebrow">THE WINDOW</p><h1>YEAR 2</h1>
      <div className="football-gm__season-grid"><Season season={cfbGmSeason(run, 2)} /></div>
      <p>There is no second offseason. Every change to the core and each player's modeled development influences playoff probability. The 2026 HQ grades remain untouched.</p>
      <button className="primary-action" type="button" onClick={() => patch({phase: "final"})}>SEE 2-YEAR GM SCORE</button>
    </section> : null}

    {run.phase === "final" ? <Final run={run} replay={replay} /> : null}
  </div>;
}
