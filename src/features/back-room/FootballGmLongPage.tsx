import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import { footballGmSpinTeam, footballGmMoney } from "./footballGmEngine";
import { footballGmSimulateLeagueSeason } from "./footballGmLeagueSimulation";
import { GmFootballWheel } from "./FootballGmModePage";
import { LongCapMeter, LongRosterGrid, LongCandidateBoard } from "./FootballGmLongDraftPresentation";
import { wheelFootballTeam, type WheelFootballTeam } from "./wheelFootballModel";
import {
  NFL_GM_LONG_SLOTS, NFL_GM_LONG_SLOT_LABELS,
  nflGmLongOverall, nflGmLongSpend,
  type NflGmLongPick,
} from "./footballGmLongFoundation";
import {
  NFL_GM_LONG_BY_ID,
  nflGmLongEligibleTeams, nflGmLongOpenSlots, nflGmLongAutoAddPick,
} from "./footballGmLongCatalog";
import {
  NFL_GM_LONG_COACHES, NFL_GM_LONG_COACH_BUCKETS,
  nflGmLongCoachesInBucket, nflGmLongSpinCoach, nflGmLongCoachEffects,
  type NflGmLongCoachBucket,
} from "./footballGmLongCoaches";
import {
  nflGmLongInitialSave, nflGmLongLoadSave, nflGmLongWriteSave,
  nflGmLongClearSave, type NflGmLongSave,
} from "./footballGmLongPersistence";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import "../../styles/football-gm-long.css";

const CATEGORY: Record<NflGmLongCoachBucket, { title: string; copy: string; color: string }> = {
  offensive: { title: "OFFENSIVE ARCHITECT", copy: "Win with play design, passing or rushing matchups.", color: "#d5a452" },
  defensive: { title: "DEFENSIVE ARCHITECT", copy: "Exploit your pass rush and secondary.", color: "#4c93d3" },
  developer: { title: "PLAYER DEVELOPER", copy: "Give genuine young talent additional growth opportunities.", color: "#30b69a" },
  culture: { title: "CULTURE & LEADERSHIP", copy: "Build trust, resilience and a steady program.", color: "#a98cdf" },
};
function playerRow(pick: NflGmLongPick) {
  const player = NFL_GM_LONG_BY_ID.get(pick.playerId);
  return player ? { slot: pick.slot, grade: player.currentGrade, age: player.age } : null;
}
function randomDraw() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const data = new Uint32Array(1);
    crypto.getRandomValues(data);
    return data[0]! / 4294967296;
  }
  return Math.random();
}
function newSave(profileId: string) {
  const runId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID() : `gm-long-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return nflGmLongInitialSave(profileId, runId);
}
function longProjection(run: NflGmLongSave, coachName: string) {
  const coach = NFL_GM_LONG_COACHES.find(c => c.name === coachName);
  if (!coach) return null;
  const roster = run.picks.map(playerRow).filter((row): row is NonNullable<typeof row> => row !== null);
  const grade = nflGmLongOverall(run.picks, NFL_GM_LONG_BY_ID);
  if (!grade) return null;
  const effects = nflGmLongCoachEffects(coach, roster);
  // Contextual game-winning opportunity shifts, never a player OVR boost.
  const matchup = (effects.passingMatchupPct + effects.rushingMatchupPct
    + effects.pressurePct + effects.coveragePct) / 400
    + effects.chemistryResiliencePct / 650 + effects.developmentOpportunityPct / 850;
  const winChancePenalty = -Math.min(.025, Math.max(0, matchup));
  const sims = Array.from({ length: 16 }, (_, i) =>
    footballGmSimulateLeagueSeason({
      seed: `${run.runId}:long-outlook-${i}`, year: 1,
      franchises: [{ key: "owner", grade, winChancePenalty }],
    }).franchises.owner!.wins);
  const avgWins = sims.reduce((s, n) => s + n, 0) / sims.length;
  return { grade, effects, avgWins, range: [Math.min(...sims), Math.max(...sims)] };
}

function TeamMark({ code, size = 46 }: { code: string; size?: number }) {
  const team = wheelFootballTeam(code);
  return team?.logoSrc
    ? <img className="gm-long__team-mark" style={{ width: size, height: size }} src={team.logoSrc} alt={team.name} loading="lazy" />
    : <span className="gm-long__team-fallback">{code}</span>;
}

export default function FootballGmLongPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const owner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);
  const profileId = identity.profile?.id ?? null;
  const [run, setRun] = useState<NflGmLongSave | null>(null);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  const [spinningTeam, setSpinningTeam] = useState(false);
  const [spinningCoach, setSpinningCoach] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [coachRotation, setCoachRotation] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!owner || !profileId) return;
    const saved = nflGmLongLoadSave(window.localStorage, profileId, NFL_GM_LONG_BY_ID);
    setRun(saved ?? newSave(profileId));
    setInitializedFor(profileId);
  }, [owner, profileId]);
  useEffect(() => {
    if (run && owner && profileId && initializedFor === profileId && run.profileId === profileId) {
      try { nflGmLongWriteSave(window.localStorage, run, NFL_GM_LONG_BY_ID); }
      catch { setError("This Long GM run couldn't be saved. Check your browser storage."); }
    }
  }, [run, owner, profileId, initializedFor]);

  const eligibleTeams = useMemo(() => run?.phase === "draft"
    ? nflGmLongEligibleTeams(run.picks, run.previousTeam) : [],
  [run]);
  const wheelTeams = useMemo(() => eligibleTeams
    .map(wheelFootballTeam).filter((team): team is WheelFootballTeam => team != null), [eligibleTeams]);
  const pending = run?.pendingTeam ? wheelFootballTeam(run.pendingTeam) : null;
  const open = run ? nflGmLongOpenSlots(run.picks) : [...NFL_GM_LONG_SLOTS];
  const hired = run?.selectedCoach ? NFL_GM_LONG_COACHES.find(c => c.name === run.selectedCoach) ?? null : null;
  const outlook = useMemo(() => run?.phase === "outlook" && run.selectedCoach
    ? longProjection(run, run.selectedCoach) : null, [run]);

  function spinTeam() {
    if (!run || spinningTeam || run.phase !== "draft" || run.pendingTeam) return;
    const teamCode = footballGmSpinTeam(run.runId, run.teamWheelSpinCount, eligibleTeams);
    const index = wheelTeams.findIndex(team => team.code === teamCode);
    if (!teamCode || index < 0) return;
    const slice = 360 / wheelTeams.length;
    setWheelRotation(cur => {
      const current = ((cur % 360) + 360) % 360;
      const target = ((-index * slice) % 360 + 360) % 360;
      return cur + 1080 + ((target - current + 360) % 360);
    });
    setSpinningTeam(true);
    window.setTimeout(() => {
      setRun(prev => prev && prev.phase === "draft" && !prev.pendingTeam
        ? { ...prev, pendingTeam: teamCode } : prev);
      setSpinningTeam(false);
    }, 1550);
  }
  function selectPlayer(playerId: string) {
    if (!run || !run.pendingTeam || spinningTeam) return;
    let picks: NflGmLongPick[];
    try {
      picks = nflGmLongAutoAddPick(run.picks, playerId);
    } catch {
      setError("That selection doesn't fit the roster and cap. Choose another eligible player.");
      return;
    }
    setError("");
    setRun({ ...run, picks, pendingTeam: null, previousTeam: run.pendingTeam,
      teamWheelSpinCount: run.teamWheelSpinCount + 1,
      phase: picks.length === NFL_GM_LONG_SLOTS.length ? "coach-bucket" : "draft" });
  }
  function pickBucket(bucket: NflGmLongCoachBucket) {
    if (!run || run.phase !== "coach-bucket" || run.picks.length !== 9) return;
    setRun({ ...run, phase: "coach-wheel", selectedCoachBucket: bucket });
  }
  function spinCoach() {
    if (!run || run.phase !== "coach-wheel" || !run.selectedCoachBucket || run.selectedCoach || spinningCoach) return;
    const draw = randomDraw();
    const coach = nflGmLongSpinCoach(run.selectedCoachBucket, draw);
    const options = nflGmLongCoachesInBucket(run.selectedCoachBucket);
    const index = options.findIndex(c => c.name === coach.name);
    const slice = 360 / options.length;
    setCoachRotation(cur => cur + 1440 + (((-index * slice - (cur % 360)) % 360 + 360) % 360));
    // Store the hired coach and exact draw immediately: refreshing cannot reroll.
    setRun({ ...run, selectedCoach: coach.name, coachWheelDraw: draw });
    setSpinningCoach(true);
    window.setTimeout(() => setSpinningCoach(false), 1550);
  }
  function finishCoach() {
    if (run?.phase !== "coach-wheel" || !run.selectedCoach || spinningCoach) return;
    setRun({ ...run, phase: "outlook" });
  }
  function restart() {
    if (!profileId || !window.confirm("Start a new NFL GM Long roster? Your current Long save will be replaced.")) return;
    nflGmLongClearSave(window.localStorage, profileId);
    setRun(newSave(profileId));
    setError("");
    setWheelRotation(0); setCoachRotation(0);
  }

  if (!identity.ready) return <main className="page football-gm-page gm-long"><section className="surface-card">Loading NFL GM Long…</section></main>;
  if (!owner) return <main className="page football-gm-page gm-long"><section className="surface-card gm-long__gate">
    <p className="eyebrow">NFL GM LONG · PRIVATE PLAYTEST</p>
    <h1>OWNER-ONLY BUILD</h1>
    <p>This early Long GM mode is reserved for the Octagon HQ owner. Short GM remains available to everyone.</p>
    {!identity.profile ? <button onClick={identity.openDialog} type="button">SIGN IN</button> : null}
    <Link to="/football/gm-mode">OPEN SHORT GM →</Link>
  </section></main>;
  if (!run || initializedFor !== profileId) return <main className="page football-gm-page gm-long"><section className="surface-card">Restoring your Long GM franchise…</section></main>;

  const coachOptions = run.selectedCoachBucket ? nflGmLongCoachesInBucket(run.selectedCoachBucket) : [];
  const futureSpent = nflGmLongSpend(run.picks, NFL_GM_LONG_BY_ID, 2);
  return <main className="page football-gm-page gm-long">
    <header className="football-gm__header">
      <button type="button" onClick={() => navigate("/football/gm-mode")}>← THE GM</button>
      <span><small>NFL FRONT OFFICE · OWNER PLAYTEST</small><strong>THE GM · LONG</strong></span>
      <b>$205M</b>
    </header>
    <LongCapMeter picks={run.picks} />
    <LongRosterGrid picks={run.picks} />
    {error && <p role="alert" className="gm-long__error">{error}</p>}
    {run.phase === "draft" && <>
      <div className="football-gm__draft-context" aria-label="Draft round and open roster spots">
        <span>ROUND {run.picks.length + 1} OF 9</span>
        <strong>{open.map(slot => NFL_GM_LONG_SLOT_LABELS[slot]).join(" · ")}</strong>
      </div>
      <GmFootballWheel teams={wheelTeams} rotation={wheelRotation} spinning={spinningTeam}
        pendingTeam={spinningTeam ? null : pending} canSpin={!run.pendingTeam && eligibleTeams.length > 0}
        onSpin={spinTeam} />
      {run.pendingTeam && !spinningTeam
        ? <LongCandidateBoard teamCode={run.pendingTeam} picks={run.picks} onPick={selectPlayer} />
        : null}
      {!eligibleTeams.length && !run.pendingTeam
        ? <p role="alert">No eligible NFL teams remain under the current cap. Start a new run to rebuild.</p>
        : null}
    </>}
    {run.phase === "coach-bucket" && <section className="surface-card gm-long__coach-stage">
      <p className="eyebrow">STAGE 2 · HIRE A HEAD COACH</p><h2>CHOOSE YOUR COACHING PHILOSOPHY</h2>
      <p>Your roster is built. Pick the kind of coach you want, then take one random spin from that bucket. You cannot choose the name.</p>
      <div className="gm-long__buckets">{NFL_GM_LONG_COACH_BUCKETS.map(bucket => <button
        key={bucket} type="button" className="gm-long__bucket" onClick={() => pickBucket(bucket)}
        style={{ "--bucket-color": CATEGORY[bucket].color } as CSSProperties}>
        <strong>{CATEGORY[bucket].title}</strong><span>{CATEGORY[bucket].copy}</span>
        <small>{nflGmLongCoachesInBucket(bucket).length} REAL NFL COACHES · CHOOSE →</small>
      </button>)}</div>
    </section>}
    {run.phase === "coach-wheel" && run.selectedCoachBucket && <section className="surface-card gm-long__coach-stage">
      <p className="eyebrow">STAGE 3 · ONE SPIN, ONE COACH</p><h2>{CATEGORY[run.selectedCoachBucket].title}</h2>
      <p>Every name in the category has an equal chance. Your selected coach will stay with this saved franchise.</p>
      <div className="gm-long__coach-wheel-area">
        <div className="gm-long__coach-disc" style={{ transform: `rotate(${coachRotation}deg)`,
          background: `conic-gradient(${coachOptions.map((_, i) => `${i % 2 ? "#24384a" : "#36516b"} ${i * 100 / coachOptions.length}% ${(i + 1) * 100 / coachOptions.length}%`).join(",")})` }}>
          {coachOptions.map((coach, i) => <span key={coach.name} style={{ "--i": i, "--n": coachOptions.length } as CSSProperties}>{coach.name.split(" ").slice(-1)[0]}</span>)}
        </div>
        <div className="gm-long__coach-list">{coachOptions.map(coach => <div key={coach.name}>
          <TeamMark code={coach.team} size={28}/><span>{coach.name}</span></div>)}</div>
      </div>
      {hired && !spinningCoach ? <div className="gm-long__hired"><small>YOUR HEAD COACH</small>
        <h3>{hired.name}</h3><p><b>STRENGTH:</b> {hired.strengths}</p><p><b>LIMITATION:</b> {hired.limitation}</p>
        <button onClick={finishCoach} type="button">VIEW MY FRANCHISE →</button></div> :
        <button className="gm-long__primary" disabled={spinningCoach || !!run.selectedCoach}
          onClick={spinCoach} type="button">{spinningCoach ? "WHEEL SPINNING…" : "SPIN FOR YOUR HEAD COACH"}</button>}
    </section>}
    {run.phase === "outlook" && hired && outlook && <section className="surface-card gm-long__outlook">
      <p className="eyebrow">PHASE 1 COMPLETE · FRANCHISE SNAPSHOT</p><h2>YOUR NINE-PLAYER FRANCHISE</h2>
      <div className="gm-long__outlook-stats"><div><small>TEAM CORE GRADE</small><strong>{outlook.grade.toFixed(1)}</strong></div>
        <div><small>SEASON 1 FORECAST</small><strong>{outlook.avgWins.toFixed(1)} W</strong></div>
        <div><small>YEAR 2 CAP EST.</small><strong>{footballGmMoney(futureSpent)}</strong></div></div>
      <p className="gm-long__outlook-note">Forecast averages 16 simulated league seasons against the existing GM opponent pool; not an actual season result. Coaching affects win probabilities, not player grades. No injuries.</p>
      <div className="gm-long__hired"><small>HEAD COACH · {CATEGORY[hired.bucket].title}</small><h3>{hired.name}</h3>
        <p><b>{hired.strengths}</b></p><p>Limitation: {hired.limitation}</p>
        <div className="gm-long__effects">{Object.entries(outlook.effects).filter(([, value]) => value > 0).map(([key, value]) =>
          <span key={key}>{key.replace(/Pct$/, "").replace(/([A-Z])/g, " $1").toUpperCase()} · {value.toFixed(1)} pp</span>)}</div>
      </div>
      <p>Next phase: midseason standings, provisional development, and the optional trade deadline. Your existing draft and coach are saved.</p>
    </section>}
    <footer className="gm-long__footer"><button type="button" onClick={restart}>NEW LONG GM RUN</button>
      <Link to="/football/gm-mode">PLAY SHORT GM →</Link>
      <small>Private owner preview · Short GM, Weekly, multiplayer and existing saves remain unchanged</small></footer>
  </main>;
}
