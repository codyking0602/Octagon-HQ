import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";

type Row = Record<string, unknown>;

function record(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
}
function rows(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is Row => Boolean(row) && typeof row === "object" && !Array.isArray(row)) : [];
}
function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is string => typeof row === "string") : [];
}
function labelFor(projection: TodayChallengeProjection) {
  if (projection.gameType === "find_leader") return "Find the Leader";
  if (projection.gameType === "wavelength") return "Wavelength";
  if (projection.gameType === "blind_resume") return "Blind Resume";
  if (projection.gameType === "blind_rank_5") return "Blind Rank 5";
  if (projection.gameType === "keep_4_cut_4") return "Keep 4, Cut 4";
  return "Hit the Number";
}
function subjectName(value: unknown) {
  const row = record(value);
  return String(row.name ?? row.text ?? row.id ?? "Football subject");
}
function subjectSubtitle(value: unknown) {
  const row = record(value);
  return String(row.subtitle ?? row.category ?? "");
}

function FindLeader({ projection, busy, advance }: GameProps) {
  const eliminated = new Set(strings(projection.publicState.eliminated_ids));
  const candidates = rows(projection.publicSetup.candidates);
  return <>
    <h2>{String(projection.publicSetup.question ?? "Find the leader")}</h2>
    <p>{String(projection.publicSetup.context ?? "Eliminate players until only the leader remains.")}</p>
    <div className="official-daily-board-grid">
      {candidates.map((candidate) => {
        const id = String(candidate.id ?? "");
        return <button key={id} type="button" disabled={busy || eliminated.has(id)} onClick={() => advance({ eliminated_id: id })}>
          <strong>{subjectName(candidate)}</strong><span>{subjectSubtitle(candidate)}</span>{eliminated.has(id) ? <em>OUT</em> : null}
        </button>;
      })}
    </div>
  </>;
}

function Wavelength({ projection, busy, advance }: GameProps) {
  const [guess, setGuess] = useState(50);
  const clues = rows(projection.publicState.clues);
  return <>
    <h2>Where is the hidden number?</h2>
    <div className="official-daily-clue-stack">{clues.map((clue) => <div key={String(clue.id)}><small>{String(clue.category ?? "CLUE")}</small><strong>{String(clue.text ?? "")}</strong></div>)}</div>
    {!projection.officialAttempt ? <div className="official-daily-guess-controls">
      <input aria-label="Football Wavelength guess" type="range" min="1" max="100" value={guess} onChange={(event) => setGuess(Number(event.target.value))} disabled={busy} />
      <strong>{guess}</strong><button type="button" disabled={busy} onClick={() => advance({ guess })}>LOCK GUESS</button>
    </div> : null}
  </>;
}

function BlindResume({ projection, busy, advance }: GameProps) {
  const current = record(projection.publicState.current_round);
  const stats = rows(current.stats);
  return <>
    <h2>{String(current.prompt ?? "Which résumé is stronger?")}</h2>
    <p>{String(current.league ?? "NFL / CFB")} · {Number(current.revealed_count ?? 2)} of 8 clues revealed</p>
    <div className="official-daily-resume-table">
      {stats.map((stat, index) => <div key={`${String(stat.label)}-${index}`}><strong>{String(stat.label ?? "Stat")}</strong><span>{String(stat.value_a ?? "—")}</span><span>{String(stat.value_b ?? "—")}</span></div>)}
    </div>
    {!projection.officialAttempt && current.prompt ? <div className="official-daily-action-row">
      <button type="button" disabled={busy} onClick={() => advance({ choice: "A" })}>PICK A</button>
      {Number(current.revealed_count ?? 2) < 8 ? <button type="button" disabled={busy} onClick={() => advance({ reveal: true })}>REVEAL 2 MORE</button> : null}
      <button type="button" disabled={busy} onClick={() => advance({ choice: "B" })}>PICK B</button>
    </div> : null}
  </>;
}

function BlindRank({ projection, busy, advance }: GameProps) {
  const current = projection.publicState.current_subject;
  const slots = Array.isArray(projection.publicState.slots) ? projection.publicState.slots : [null, null, null, null, null];
  return <>
    <h2>Blind Rank 5</h2>
    {current ? <div className="official-daily-current-card"><strong>{subjectName(current)}</strong><span>{subjectSubtitle(current)}</span></div> : null}
    <div className="official-daily-rank-slots">{slots.map((slot, index) => <button key={index} type="button" disabled={busy || Boolean(slot) || !current} onClick={() => advance({ slot: index + 1 })}><b>#{index + 1}</b>{slot ? <span>{subjectName(slot)}</span> : <span>LOCK HERE</span>}</button>)}</div>
  </>;
}

function KeepCut({ projection, busy, advance }: GameProps) {
  const current = projection.publicState.current_subject;
  const forced = typeof projection.publicState.forced_choice === "string" ? projection.publicState.forced_choice : null;
  return <>
    <h2>Keep 4, Cut 4</h2>
    {current ? <div className="official-daily-current-card"><strong>{subjectName(current)}</strong><span>{subjectSubtitle(current)}</span></div> : null}
    {current ? <div className="official-daily-action-row">
      <button type="button" disabled={busy || forced === "cut"} onClick={() => advance({ choice: "keep" })}>KEEP</button>
      <button type="button" disabled={busy || forced === "keep"} onClick={() => advance({ choice: "cut" })}>CUT</button>
    </div> : null}
    <p>{rows(projection.publicState.kept).length} kept · {rows(projection.publicState.cut).length} cut</p>
  </>;
}

function HitNumber({ projection, busy, advance }: GameProps) {
  const selected = new Set(strings(projection.publicState.selected_ids));
  const candidates = rows(projection.publicSetup.candidates);
  const pickCount = Number(projection.publicSetup.pick_count ?? 4);
  return <>
    <h2>Hit {String(projection.publicSetup.target ?? "the number")}</h2>
    <p>{String(projection.publicSetup.metric_label ?? "Football stat")} · Pick exactly {pickCount} · {String(projection.publicSetup.league ?? "NFL / CFB")}</p>
    <div className="official-daily-board-grid">{candidates.map((candidate) => {
      const id = String(candidate.id ?? "");
      const active = selected.has(id);
      return <button key={id} type="button" className={active ? "is-selected" : ""} disabled={busy || (!active && selected.size >= pickCount)} onClick={() => advance({ fighter_id: id })}><strong>{subjectName(candidate)}</strong><span>{subjectSubtitle(candidate)}</span></button>;
    })}</div>
    <button type="button" disabled={busy || selected.size !== pickCount} onClick={() => advance({ lock: true })}>LOCK {selected.size}/{pickCount}</button>
  </>;
}

type GameProps = { projection: TodayChallengeProjection; busy: boolean; advance: (action: Row) => void };
function FootballGame(props: GameProps) {
  if (props.projection.gameType === "find_leader") return <FindLeader {...props} />;
  if (props.projection.gameType === "wavelength") return <Wavelength {...props} />;
  if (props.projection.gameType === "blind_resume") return <BlindResume {...props} />;
  if (props.projection.gameType === "blind_rank_5") return <BlindRank {...props} />;
  if (props.projection.gameType === "keep_4_cut_4") return <KeepCut {...props} />;
  return <HitNumber {...props} />;
}

export default function FootballTodayChallengePage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const runtime = useTodayChallengeRuntime({ profileId: identity.profile?.id ?? "signed-out", enabled: signedIn, sport: "football" });

  if (!signedIn) return <div className="page official-daily-page"><section className="official-daily-gate"><p className="eyebrow">FOOTBALL · TODAY’S CHALLENGE</p><h1>One official board. One first attempt.</h1><p>The same NFL/CFB challenge is served to everyone and the answers stay private until you finish.</p><button type="button" onClick={identity.openDialog}>SIGN IN TO PLAY</button></section></div>;
  if (runtime.loading && !runtime.projection) return <div className="page official-daily-page"><section className="official-daily-loading"><span /><strong>Loading Football Today’s Challenge…</strong></section></div>;
  if (!runtime.projection) return <div className="page official-daily-page"><section className="official-daily-gate is-error"><p className="eyebrow">FOOTBALL · TODAY’S CHALLENGE</p><h1>The official board did not load.</h1><button type="button" onClick={() => void runtime.refresh()}>TRY AGAIN</button></section></div>;

  const projection = runtime.projection;
  return <div className="page official-daily-page">
    <button type="button" className="back-link" onClick={() => navigate("/back-room/football")}>← FOOTBALL GAMES</button>
    <header className="official-daily-header"><div><p className="eyebrow">FOOTBALL · TODAY’S CHALLENGE</p><h1>{labelFor(projection)}</h1><p>{projection.centralDay} · same official board for everyone</p></div>{projection.officialAttempt ? <strong>{projection.officialAttempt.normalizedScore}/100</strong> : <span>OFFICIAL</span>}</header>
    {runtime.error ? <section className="official-daily-status is-error"><strong>Progress needs a refresh</strong><button type="button" onClick={() => void runtime.refresh()}>REFRESH</button></section> : null}
    <section className="official-daily-game-shell"><FootballGame projection={projection} busy={runtime.busy} advance={(action) => { void runtime.advance(action); }} /></section>
    {projection.officialAttempt ? <section className="official-daily-result-actions"><strong>FINAL SCORE {projection.officialAttempt.normalizedScore}/100</strong><button type="button" onClick={() => navigate("/back-room/football")}>BACK TO FOOTBALL GAMES</button></section> : null}
  </div>;
}
