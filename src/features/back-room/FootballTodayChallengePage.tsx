import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { shareDailyChallengeResult } from "../play/dailyChallengeShare";
import {
  createTodayChallengeRepository,
  TodayChallengeRepositoryError,
  type TodayChallengeProjection,
} from "../play/todayChallengeRepository";
import {
  FootballFindLeaderPresentation,
  FootballFindLeaderVisual,
} from "./FootballFindLeaderPresentation";
import { FootballSubjectVisual } from "./FootballSubjectVisual";
import {
  FootballHitTheNumberPresentation,
  footballHitNumberTheme,
} from "./FootballHitTheNumberPresentation";
import { formatFootballFact, type FootballFactMetricId } from "./footballFactualStats";
import { FootballWavelengthPresentation } from "./FootballWavelengthPresentation";
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
  const eliminatedIds = strings(state.eliminated_ids);
  const reveal = record(projection.revealSetup);
  const progressive = records(state.revealed_candidates);
  const revealed = projection.officialAttempt ? records(reveal.candidates) : progressive;
  const revealedById = new Map(revealed.map((candidate) => [String(candidate.id ?? ""), candidate]));
  const candidates = records(setup.candidates).map((candidate) => {
    const id = String(candidate.id ?? "");
    const revealedCandidate = revealedById.get(id);
    return {
      id,
      name: String(candidate.name ?? ""),
      subtitle: String(candidate.subtitle ?? ""),
      ...(typeof revealedCandidate?.value === "number" ? { value: revealedCandidate.value } : {}),
    };
  });
  const attempt = projection.officialAttempt;
  const perfect = attempt?.nativeScore === 10;
  const fatalId = attempt && !perfect ? eliminatedIds.at(-1) ?? null : null;
  const league = String(setup.league ?? "FOOTBALL");
  const statLabel = String(setup.stat_label ?? "OFFICIAL STAT");

  return (
    <FootballFindLeaderPresentation
      question={String(setup.question ?? "Find the hidden leader.")}
      context={String(setup.context ?? "Eliminate the decoys. Leave the leader standing.")}
      categoryLabel={`${league} · ${statLabel}`}
      statLabel={statLabel}
      shortLabel={statLabel}
      candidates={candidates}
      leaderId={attempt ? String(reveal.leader_id ?? "") : null}
      eliminatedIds={eliminatedIds}
      result={attempt ? { score: attempt.normalizedScore, perfect, fatalId } : null}
      eyebrow="TODAY’S CHALLENGE"
      intro="Eliminate nine decoys until only the leader remains."
      onEliminate={attempt ? null : (id) => advance({ eliminated_id: id })}
      renderVisual={(candidate, compact) => (
        <FootballFindLeaderVisual
          candidateId={candidate.id}
          candidateName={candidate.name}
          league={league}
          compact={compact}
        />
      )}
    />
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
  const guesses = Array.isArray(state.guesses) ? state.guesses.map(Number) : [];
  const reveal = record(state.reveal);
  const rawClues = projection.officialAttempt ? records(reveal.clues) : records(state.clues);
  const clues = rawClues.map((clue, index) => ({
    id: String(clue.id ?? index),
    category: String(clue.category ?? "football"),
    text: String(clue.text ?? ""),
    ...(typeof clue.rating === "number" ? { rating: clue.rating } : {}),
  }));
  const target = Number(reveal.target ?? projection.officialAttempt?.publicResult.target ?? 0);

  return (
    <div className="football-debate-page football-wavelength-page wavelength-page wavelength-page--playing wavelength-page--football">
      <FootballWavelengthPresentation
        clues={clues}
        guesses={guesses}
        guess={guess}
        onGuessChange={setGuess}
        onLock={() => advance({ guess })}
        result={projection.officialAttempt ? {
          score: projection.officialAttempt.normalizedScore,
          target,
        } : null}
      />
    </div>
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
  const selectedIds = strings(state.selected_ids);
  const candidates = records(setup.candidates).map((candidate) => ({
    id: String(candidate.id ?? ""),
    name: String(candidate.name ?? ""),
    subtitle: String(candidate.subtitle ?? ""),
  }));
  const slots = records(setup.slots).map((slot) => ({
    id: String(slot.id ?? ""),
    label: String(slot.label ?? ""),
  }));
  const activeSlot = record(state.active_slot);
  const activeSlotIndex = Number.isInteger(activeSlot.index) ? Number(activeSlot.index) : null;
  const availableIds = strings(state.available_subject_ids);
  const reveal = record(projection.revealSetup);
  const rawValues = record(reveal.values);
  const values = Object.fromEntries(
    Object.entries(rawValues)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number"),
  );
  const target = Number(setup.target ?? 0);
  const total = selectedIds.reduce((sum, id) => sum + (values[id] ?? 0), 0);
  const distance = Math.abs(target - total);
  const status = distance < 1e-9 ? "perfect" : total > target ? "bust" : "under";
  const metricId = String(setup.metric_id ?? "") as FootballFactMetricId;
  const formatValue = (value: number) => {
    try {
      return formatFootballFact(metricId, value);
    } catch {
      return Number.isInteger(value) ? value.toLocaleString("en-US") : value.toFixed(1);
    }
  };

  return (
    <div className="hit-number-page football-hit-number-page" style={footballHitNumberTheme}>
      <FootballHitTheNumberPresentation
        target={target}
        metricLabel={String(setup.metric_label ?? "OFFICIAL STAT")}
        league={String(setup.league ?? "FOOTBALL")}
        configurationLabel={typeof setup.configuration_label === "string" ? setup.configuration_label : null}
        pickCount={Number(setup.pick_count ?? 4)}
        candidates={candidates}
        selectedIds={selectedIds}
        slots={slots}
        activeSlotIndex={activeSlotIndex}
        availableIds={availableIds.length ? availableIds : candidates.map((candidate) => candidate.id)}
        values={projection.officialAttempt ? values : undefined}
        result={projection.officialAttempt ? {
          status,
          target,
          total,
          distance,
          score: projection.officialAttempt.normalizedScore,
        } : null}
        formatValue={formatValue}
        onToggle={projection.officialAttempt ? null : (id) => advance({ fighter_id: id })}
        onRewind={projection.officialAttempt ? null : (index) => advance({ rewind_to: index })}
        onLock={projection.officialAttempt ? null : () => advance({ lock: true })}
      />
    </div>
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
