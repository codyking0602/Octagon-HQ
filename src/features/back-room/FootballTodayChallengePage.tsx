import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { shareDailyChallengeResult } from "../play/dailyChallengeShare";
import {
  createTodayChallengeRepository,
  TodayChallengeRepositoryError,
  type TodayChallengeProjection,
} from "../play/todayChallengeRepository";
import { FootballSubjectVisual } from "./FootballSubjectVisual";
import {
  footballBlindResumeFactText,
  footballBlindResumeRevealAsset,
} from "./footballBlindResumePresentation";
import type { FootballRankFiveItem, FootballRankFivePackId } from "./footballRankFiveModel";
import "../../styles/today-challenge-hub.css";
import "../../styles/football-today-challenge.css";

const GAME_LABELS = {
  find_leader: "FIND THE LEADER",
  blind_resume: "BLIND RESUME",
  wavelength: "WAVELENGTH",
  blind_rank_5: "BLIND RANK 5",
  keep_4_cut_4: "KEEP 4 / CUT 4",
  hit_the_number: "HIT THE NUMBER",
} as const;

type JsonRecord = Record<string, unknown>;
type PublicItem = Pick<FootballRankFiveItem, "id" | "name" | "subtitle" | "league">;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row)) : [];
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is string => typeof row === "string") : [];
}

function item(value: unknown): PublicItem | null {
  const row = record(value);
  return typeof row.id === "string" && typeof row.name === "string"
    ? {
        id: row.id,
        name: row.name,
        subtitle: typeof row.subtitle === "string" ? row.subtitle : "",
        league: row.league === "CFB" ? "CFB" : "NFL",
      }
    : null;
}

function packId(setup: JsonRecord): FootballRankFivePackId | null {
  const value = record(setup.pack).id;
  return typeof value === "string" ? value as FootballRankFivePackId : null;
}

function Subject({ value, setup }: { value: unknown; setup: JsonRecord }) {
  const subject = item(value);
  const id = packId(setup);
  if (!subject) return null;
  return (
    <div className="football-today-subject">
      {id ? <FootballSubjectVisual item={subject} packId={id} /> : null}
      <div><small>{subject.league}</small><strong>{subject.name}</strong><span>{subject.subtitle}</span></div>
    </div>
  );
}

function ScoreCard({ projection }: { projection: TodayChallengeProjection }) {
  const attempt = projection.officialAttempt;
  if (!attempt) return null;
  const result = attempt.publicResult;
  return (
    <section className="football-today-score">
      <p className="eyebrow">FINAL SCORE</p>
      <strong>{attempt.normalizedScore}<small>/100</small></strong>
      {typeof result.blind_rank_score === "number" && typeof result.keep_cut_score === "number" ? (
        <span>BLIND RANK {result.blind_rank_score} · KEEP/CUT {result.keep_cut_score}</span>
      ) : null}
    </section>
  );
}

function FindLeader({ projection, advance }: GameProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const eliminated = new Set(strings(state.eliminated_ids));
  const candidates = records(setup.candidates);
  const reveal = record(projection.revealSetup);
  const revealedCandidates = records(reveal.candidates);
  return (
    <>
      <section className="football-today-copy">
        <small>{String(setup.league ?? "FOOTBALL")}</small>
        <h2>{String(setup.question ?? "Find the hidden leader.")}</h2>
        <p>{String(setup.context ?? "Eliminate the decoys. Leave the leader standing.")}</p>
      </section>
      {!projection.officialAttempt ? (
        <div className="football-today-name-grid">
          {candidates.map((candidate) => (
            <button type="button" key={String(candidate.id)} disabled={eliminated.has(String(candidate.id))} onClick={() => advance({ eliminated_id: candidate.id })}>
              <strong>{String(candidate.name)}</strong><span>{String(candidate.subtitle ?? "")}</span>
              <em>{eliminated.has(String(candidate.id)) ? "OUT" : "ELIMINATE"}</em>
            </button>
          ))}
        </div>
      ) : (
        <div className="football-today-reveal-list">
          {revealedCandidates.map((candidate) => (
            <div key={String(candidate.id)} className={candidate.id === reveal.leader_id ? "is-leader" : ""}>
              <span><strong>{String(candidate.name)}</strong><small>{String(candidate.subtitle ?? "")}</small></span>
              <b>{String(candidate.value ?? "")}</b>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function pointCopy(value: unknown) {
  const points = Number(value ?? 0);
  return points > 0 ? `+${points}` : String(points);
}

function BlindResumeRevealLogo({ subject }: { subject: JsonRecord }) {
  const asset = footballBlindResumeRevealAsset(subject.id);
  const name = String(subject.name ?? "Football player");
  return (
    <span className="football-blind-resume-logo" aria-label={`${name} team logo`}>
      {asset ? <img alt="" loading="lazy" referrerPolicy="no-referrer" src={asset.src} title={asset.label} /> : <b aria-hidden="true">FB</b>}
    </span>
  );
}

function BlindResume({ projection, advance }: GameProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const round = record(state.current_round);
  const stats = records(round.stats);
  const results = records(state.results);
  const ladder = records(setup.scoring_ladder);
  const previousCount = useRef(results.length);
  const [pendingResult, setPendingResult] = useState<number | null>(null);

  useEffect(() => {
    if (results.length > previousCount.current) setPendingResult(results.length - 1);
    previousCount.current = results.length;
  }, [results.length]);

  if (pendingResult !== null) {
    const result = results[pendingResult];
    const left = record(result?.left);
    const right = record(result?.right);
    const winnerId = String(result?.winner_id ?? "");
    const pickedId = String(result?.picked_id ?? "");
    const correct = result?.correct === true;
    const finalRound = Boolean(projection.officialAttempt) && results.length === 3;
    return (
      <div className="football-blind-resume-result" data-result={correct ? "correct" : "miss"}>
        <section className={`football-blind-resume-verdict ${correct ? "is-correct" : "is-miss"}`}>
          <p className="eyebrow">{correct ? "YOU PICKED THE BETTER RÉSUMÉ" : "THE MODEL DISAGREES"}</p>
          <h2>{String((winnerId === left.id ? left : right).name ?? "Winner")} ranks higher</h2>
          <strong>{pointCopy(result?.points_awarded)} POINTS</strong>
        </section>
        <section className="football-blind-resume-reveal-grid">
          {[left, right].map((subject, index) => (
            <article className={`${subject.id === winnerId ? "is-winner" : ""}${subject.id === pickedId ? " is-picked" : ""}`} key={`${String(subject.id)}-${index}`}>
              <BlindResumeRevealLogo subject={subject} />
              <span>PLAYER {index === 0 ? "A" : "B"}</span>
              <strong>{String(subject.name ?? "")}</strong>
              <small>{String(subject.subtitle ?? "")}</small>
              {subject.id === pickedId ? <em>YOUR PICK</em> : null}
            </article>
          ))}
        </section>
        <button className="football-today-primary football-blind-resume-next" type="button" onClick={() => setPendingResult(null)}>
          {finalRound ? "SEE FINAL SCORE" : "NEXT ROUND"}
        </button>
      </div>
    );
  }

  const attempt = projection.officialAttempt;
  const correctCount = results.filter((row) => row.correct === true).length;
  const rawPoints = Number(state.raw_points ?? attempt?.publicResult.raw_points ?? 0);

  if (attempt) {
    return (
      <div className="football-blind-resume-final">
        <section className="football-today-score">
          <p className="eyebrow">THREE-ROUND RESULTS</p>
          <strong>{attempt.normalizedScore}<small>/100</small></strong>
          <span>{correctCount}-{3 - correctCount} RECORD · {rawPoints} RAW PTS</span>
        </section>
        <section className="football-blind-resume-recap" aria-label="Three-round Football Blind Resume recap">
          {results.map((result, index) => {
            const left = record(result.left);
            const right = record(result.right);
            const winnerId = String(result.winner_id ?? "");
            const pickedId = String(result.picked_id ?? "");
            return (
              <article key={`${index}-${String(left.id)}-${String(right.id)}`}>
                <header><span>R{index + 1}</span><b className={result.correct === true ? "is-correct" : "is-miss"}>{result.correct === true ? "CORRECT" : "MISS"} · {pointCopy(result.points_awarded)}</b></header>
                <div>
                  {[left, right].map((subject) => (
                    <section className={subject.id === winnerId ? "is-winner" : ""} key={String(subject.id)}>
                      <span><strong>{String(subject.name ?? "")}</strong><small>{String(subject.subtitle ?? "")}</small></span>
                      <em>{subject.id === winnerId ? "WINNER" : subject.id === pickedId ? "PICK" : ""}</em>
                    </section>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  const currentStage = Math.max(0, Math.min(2, Number(round.reveal_stage ?? 1) - 1));
  const revealed = Number(round.revealed_count ?? stats.length);
  const maxRevealed = Number(round.max_revealed_count ?? stats.length);
  const revealCounts = Array.isArray(round.reveal_counts) ? round.reveal_counts.map(Number).filter(Number.isFinite) : [];
  const nextRevealCount = revealCounts[currentStage + 1];
  const moreFacts = typeof nextRevealCount === "number" ? Math.max(1, nextRevealCount - revealed) : 0;
  const nextStage = ladder[currentStage + 1];
  const contextLabel = String(round.context_label ?? round.league ?? "FOOTBALL");

  return (
    <div className="football-blind-resume-game" data-game="blind_resume" data-version="v4">
      <section className="football-blind-resume-scoreboard">
        <div><p className="eyebrow">DAILY CHALLENGE</p><h2>Which football career ranks higher?</h2></div>
        <aside><span>ROUND {Number(state.round_index ?? 0) + 1} OF 3</span><b>DAILY SCORE {rawPoints} RAW PTS · {correctCount}-{results.length - correctCount}</b></aside>
      </section>
      <section className="football-today-resume football-blind-resume-card">
        <header className="football-blind-resume-card-head">
          <div><span>PLAYER A</span><strong>?</strong></div>
          <b>RESUME</b>
          <div><span>PLAYER B</span><strong>?</strong></div>
        </header>
        <p className="football-blind-resume-context">{contextLabel}</p>
        <div className="football-today-resume-stats football-blind-resume-stats">
          {stats.map((stat, index) => (
            <div key={`${String(stat.label)}-${index}`}>
              <strong>{footballBlindResumeFactText(stat.value_a)}</strong>
              <span>{String(stat.label)}</span>
              <strong>{footballBlindResumeFactText(stat.value_b)}</strong>
            </div>
          ))}
        </div>
        <section className="football-blind-resume-scoring" aria-label="Blind Resume scoring">
          <strong className="football-blind-resume-fact-count">{revealed} OF {maxRevealed} FACTS SHOWN</strong>
          <div>
            {ladder.map((row, index) => {
              const expired = index < currentStage;
              const active = index === currentStage;
              const label = expired ? "USED" : active ? "GUESS NOW" : index === 2 ? "FINAL REVEAL" : "NEXT";
              return (
                <article className={`${expired ? "is-expired" : ""}${active ? " is-current" : ""}`} key={String(row.stage ?? index)}>
                  <span>{label}</span>
                  <strong>{pointCopy(row.correct)} / {pointCopy(row.wrong)}</strong>
                </article>
              );
            })}
          </div>
        </section>
        <div className="football-blind-resume-picks">
          <button type="button" onClick={() => advance({ choice: "A" })}>PICK A</button>
          <button type="button" onClick={() => advance({ choice: "B" })}>PICK B</button>
        </div>
        {nextStage ? (
          <button className="football-blind-resume-reveal" type="button" onClick={() => advance({ reveal: true })}>
            SHOW {moreFacts} MORE {moreFacts === 1 ? "FACT" : "FACTS"}
          </button>
        ) : null}
      </section>
    </div>
  );
}

function Wavelength({ projection, advance }: GameProps) {
  const [guess, setGuess] = useState(50);
  const state = projection.publicState;
  const clues = records(state.clues);
  const active = clues.at(-1) ?? {};
  const guesses = Array.isArray(state.guesses) ? state.guesses.map(Number) : [];
  const reveal = record(state.reveal);
  return (
    <section className="football-today-wavelength">
      <small>CLUE {Math.min(guesses.length + 1, 4)} OF 4</small>
      <h2>{String(active.text ?? "Read the clue. Find the number.")}</h2>
      <span>{String(active.category ?? "FOOTBALL")}</span>
      {!projection.officialAttempt ? (
        <>
          <strong className="football-today-guess-number">{guess}</strong>
          <input aria-label="Wavelength guess" type="range" min="1" max="100" value={guess} onChange={(event) => setGuess(Number(event.target.value))} />
          <button className="football-today-primary" type="button" onClick={() => advance({ guess })}>LOCK GUESS {guesses.length + 1}</button>
        </>
      ) : (
        <p className="football-today-target">TARGET <b>{String(reveal.target ?? projection.officialAttempt.publicResult.target ?? "")}</b></p>
      )}
    </section>
  );
}

function BlindRank({ projection, advance }: GameProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const current = item(state.current_subject);
  const slots = Array.isArray(state.slots) ? state.slots : [null, null, null, null, null];
  const pack = record(setup.pack);
  return (
    <section className="football-today-rank">
      <header><small>{String(pack.league ?? "FOOTBALL")} · DAILY DOUBLE PART 1</small><h2>{String(pack.prompt ?? "Blind Rank 5")}</h2></header>
      <div className="football-today-rank-slots">
        {slots.map((value, index) => {
          const placed = item(value);
          return (
            <button type="button" key={index} disabled={Boolean(placed) || !current} onClick={() => advance({ slot: index + 1 })}>
              <b>#{index + 1}</b><span>{placed?.name ?? "PLACE HERE"}</span>
            </button>
          );
        })}
      </div>
      {current ? <Subject value={current} setup={setup} /> : null}
    </section>
  );
}

function KeepCut({ projection, advance }: GameProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const current = item(state.current_subject);
  const kept = records(state.kept).map(item).filter(Boolean) as PublicItem[];
  const cut = records(state.cut).map(item).filter(Boolean) as PublicItem[];
  const forced = typeof state.forced_choice === "string" ? state.forced_choice : null;
  const pack = record(setup.pack);
  return (
    <section className="football-today-keep-cut">
      <header><small>{String(pack.league ?? "FOOTBALL")} · DAILY DOUBLE PART 2</small><h2>{String(pack.prompt ?? "Keep four. Cut four.")}</h2></header>
      <div className="football-today-trays">
        <div><b>KEEP {kept.length}/4</b>{kept.map((row) => <span key={row.id}>{row.name}</span>)}</div>
        <div><b>CUT {cut.length}/4</b>{cut.map((row) => <span key={row.id}>{row.name}</span>)}</div>
      </div>
      {current ? <Subject value={current} setup={setup} /> : null}
      {current ? (
        <div className="football-today-split-actions">
          <button type="button" disabled={forced === "cut"} onClick={() => advance({ choice: "keep" })}>KEEP</button>
          <button type="button" disabled={forced === "keep"} onClick={() => advance({ choice: "cut" })}>CUT</button>
        </div>
      ) : null}
    </section>
  );
}

function HitTheNumber({ projection, advance }: GameProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const candidates = records(setup.candidates);
  const selected = new Set(strings(state.selected_ids));
  const pickCount = Number(setup.pick_count ?? 4);
  const reveal = record(projection.revealSetup);
  const values = record(reveal.values);
  return (
    <section className="football-today-hit">
      <header><small>{String(setup.league ?? "FOOTBALL")} · {String(setup.domain_label ?? "DAILY BOARD")}</small><h2>{String(setup.target ?? "")} {String(setup.metric_label ?? "")}</h2><p>Pick {pickCount}. Get as close as possible without going over.</p></header>
      <div className="football-today-name-grid">
        {candidates.map((candidate) => {
          const id = String(candidate.id);
          const isSelected = selected.has(id);
          return (
            <button type="button" className={isSelected ? "is-selected" : ""} disabled={Boolean(projection.officialAttempt)} key={id} onClick={() => advance({ fighter_id: id })}>
              <strong>{String(candidate.name)}</strong><span>{String(candidate.subtitle ?? "")}</span>
              <em>{projection.officialAttempt ? String(values[id] ?? "") : isSelected ? "SELECTED" : "PICK"}</em>
            </button>
          );
        })}
      </div>
      {!projection.officialAttempt ? <button className="football-today-primary" type="button" disabled={selected.size !== pickCount} onClick={() => advance({ lock: true })}>LOCK {selected.size}/{pickCount}</button> : null}
    </section>
  );
}

type GameProps = {
  projection: TodayChallengeProjection;
  advance: (action: JsonRecord) => void;
};

export default function FootballTodayChallengePage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const repository = useMemo(() => createTodayChallengeRepository(undefined, "football"), []);
  const [projection, setProjection] = useState<TodayChallengeProjection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    let active = true;
    if (!signedIn) {
      setProjection(null);
      setBusy(false);
      setError(null);
      return () => { active = false; };
    }
    if (!repository) {
      setError("Football Today’s Challenge is unavailable on this build.");
      return () => { active = false; };
    }
    setBusy(true);
    setError(null);
    repository.loadToday()
      .then((next) => { if (active) setProjection(next); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load today’s football board."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [repository, signedIn]);

  async function advance(action: JsonRecord) {
    if (!repository || !projection || busy || projection.officialAttempt) return;
    setBusy(true);
    setError(null);
    try {
      const next = await repository.advance(projection, action);
      setProjection(next);
    } catch (reason) {
      if (reason instanceof TodayChallengeRepositoryError && reason.stale) {
        setProjection(await repository.loadToday());
      } else {
        setError(reason instanceof Error ? reason.message : "That football daily action could not be locked.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function shareResult() {
    if (!projection?.officialAttempt) return;
    const outcome = await shareDailyChallengeResult({ sport: "football", score: projection.officialAttempt.normalizedScore, centralDay: projection.centralDay });
    setShareStatus(outcome === "shared" ? "RESULT SHARED" : outcome === "copied" ? "RESULT LINK COPIED" : outcome === "cancelled" ? "" : "SHARE UNAVAILABLE");
  }

  if (!signedIn) {
    return (
      <div className="page football-today-page">
        <section className="football-today-shell today-hub-gate">
          <div><p className="eyebrow">TODAY’S CHALLENGE · FOOTBALL</p><h1>One official board. One first attempt.</h1><p>Sign in to save Football Daily progress across devices and join the Football-only standings.</p></div>
          <button type="button" onClick={identity.openDialog}>SIGN IN TO PLAY</button>
        </section>
      </div>
    );
  }

  if (!projection) {
    return <div className="page football-today-page"><section className="football-today-shell"><p className="eyebrow">FOOTBALL HQ</p><h1>{busy ? "Building today’s board…" : "Today’s Challenge"}</h1>{error ? <p>{error}</p> : null}</section></div>;
  }

  const blindResume = projection.gameType === "blind_resume";

  return (
    <div className="page football-today-page">
      <section className="football-today-shell">
        {blindResume ? (
          <header className="football-today-header football-today-header--blind-resume">
            <button className="football-today-back" type="button" aria-label="Back to Football Play Hub" onClick={() => navigate("/football")}>←</button>
            <div><p className="eyebrow">PLAY HUB</p><h1>Blind Resume</h1></div>
          </header>
        ) : (
          <header className="football-today-header">
            <div><p className="eyebrow">TODAY’S CHALLENGE · FOOTBALL</p><h1>{GAME_LABELS[projection.gameType]}</h1><span>{projection.centralDay} · SAME BOARD FOR EVERYONE</span></div>
            <button type="button" onClick={() => navigate("/football")}>FOOTBALL HQ</button>
          </header>
        )}
        {error ? <div className="football-today-error">{error}</div> : null}
        {busy ? <div className="football-today-busy">LOCKING…</div> : null}
        {!blindResume ? <ScoreCard projection={projection} /> : null}
        {projection.officialAttempt ? (
          <div className="football-today-result-actions">
            <button className="football-today-primary" type="button" onClick={() => void shareResult()}>SHARE RESULT</button>
            <button type="button" onClick={() => navigate("/football")}>FOOTBALL HQ</button>
            {shareStatus ? <span role="status">{shareStatus}</span> : null}
          </div>
        ) : null}
        {projection.gameType === "find_leader" ? <FindLeader projection={projection} advance={advance} /> : null}
        {blindResume ? <BlindResume projection={projection} advance={advance} /> : null}
        {projection.gameType === "wavelength" ? <Wavelength projection={projection} advance={advance} /> : null}
        {projection.gameType === "blind_rank_5" ? <BlindRank projection={projection} advance={advance} /> : null}
        {projection.gameType === "keep_4_cut_4" ? <KeepCut projection={projection} advance={advance} /> : null}
        {projection.gameType === "hit_the_number" ? <HitTheNumber projection={projection} advance={advance} /> : null}
      </section>
    </div>
  );
}
