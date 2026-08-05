import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  todayChallengeAdapter,
  type DailyGameType,
  type OfficialAttempt,
} from "./todaysChallengeAdapters";
import type {
  TodayChallengeProjection,
  TodayChallengeRepository,
} from "./todayChallengeRepository";
import { useTodayChallengeRuntime } from "./useTodayChallengeRuntime";

type JsonRecord = Record<string, unknown>;

interface FighterPresentation {
  id: string;
  name: string;
  gender: string;
  divisions: string[];
  mainEra: string;
  thumbUrl: string;
  profileUrl: string;
}

function record(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function records(value: unknown) {
  return Array.isArray(value)
    ? value.map(record).filter((row): row is JsonRecord => Boolean(row))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((row): row is string => typeof row === "string")
    : [];
}

function integer(value: unknown, fallback = 0) {
  return Number.isInteger(value) ? Number(value) : fallback;
}

function fighter(value: unknown): FighterPresentation | null {
  const row = record(value);
  if (!row || typeof row.id !== "string" || typeof row.name !== "string") return null;
  return {
    id: row.id,
    name: row.name,
    gender: typeof row.gender === "string" ? row.gender : "",
    divisions: strings(row.divisions),
    mainEra: typeof row.main_era === "string" ? row.main_era : "",
    thumbUrl: typeof row.thumb_url === "string" ? row.thumb_url : "",
    profileUrl: typeof row.profile_url === "string" ? row.profile_url : "",
  };
}

function fighters(value: unknown) {
  return Array.isArray(value)
    ? value.map(fighter).filter((row): row is FighterPresentation => Boolean(row))
    : [];
}

function dateLabel(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Today’s Challenge could not be updated.";
}

function OfficialHeader({
  projection,
  eyebrow,
  title,
  copy,
}: {
  projection: TodayChallengeProjection;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="official-daily-hero">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <aside>
        <span>OFFICIAL DAILY</span>
        <strong>{dateLabel(projection.centralDay).toUpperCase()}</strong>
        <small>Saved across devices</small>
      </aside>
    </section>
  );
}

function RuntimeStatus({ error, onRefresh }: { error: unknown; onRefresh?: () => void }) {
  return error ? (
    <section className="official-daily-status is-error" role="status">
      <strong>Progress needs a refresh</strong>
      <p>{errorMessage(error)}</p>
      {onRefresh ? <button type="button" onClick={onRefresh}>REFRESH OFFICIAL GAME</button> : null}
    </section>
  ) : null;
}

function OfficialResultActions({
  casualRoute,
  onNavigate,
}: {
  casualRoute: string;
  onNavigate: (route: string) => void;
}) {
  return (
    <div className="official-daily-result-actions">
      <button type="button" onClick={() => onNavigate(casualRoute)}>PLAY CASUAL</button>
      <button type="button" onClick={() => onNavigate("/play")}>ALL GAMES</button>
    </div>
  );
}

function ResultScore({ attempt }: { attempt: OfficialAttempt }) {
  return (
    <div className="official-daily-score">
      <span>OFFICIAL SCORE</span>
      <strong>{attempt.normalizedScore}</strong>
      <small>OUT OF 100</small>
    </div>
  );
}

function FindLeaderView({
  projection,
  busy,
  onAdvance,
}: OfficialGameViewProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const candidates = records(setup.candidates).map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    division: String(row.division ?? ""),
    thumbUrl: String(row.thumb_url ?? ""),
  })).filter((row) => row.id && row.name);
  const eliminated = strings(state.eliminated_ids);
  const eliminatedSet = new Set(eliminated);
  const attempt = projection.officialAttempt;
  const complete = Boolean(state.complete) || Boolean(attempt);
  const question = String(setup.question ?? "Find today’s stat leader");
  const statLabel = String(setup.stat_label ?? "OFFICIAL STAT");

  if (complete && attempt) {
    const reveal = projection.revealSetup ?? record(state.reveal) ?? {};
    const revealed = records(reveal.candidates).map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      division: String(row.division ?? ""),
      thumbUrl: String(row.thumb_url ?? ""),
      value: integer(row.value),
    })).sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
    const leaderId = String(reveal.leader_id ?? "");
    return (
      <div className="official-daily-game official-daily-find" data-game="find_leader">
        <OfficialHeader projection={projection} eyebrow="OFFICIAL RESULT" title={attempt.nativeScore === 10 ? "PERFECT 10" : `ROUND ${attempt.nativeScore}`} copy={question} />
        <section className="official-daily-result-grid">
          <ResultScore attempt={attempt} />
          <div className="official-daily-result-copy">
            <strong>{attempt.nativeScore === 10 ? "You left the leader standing." : "The leader ended the run."}</strong>
            <p>Every fighter’s official value is now unlocked.</p>
          </div>
        </section>
        <section className="surface-card official-daily-reveal-list">
          <header><span>FULL STAT REVEAL</span><strong>{statLabel}</strong></header>
          {revealed.map((row, index) => (
            <article className={row.id === leaderId ? "is-leader" : ""} key={row.id}>
              <b>#{index + 1}</b>
              <FighterPhoto name={row.name} src={row.thumbUrl} className="official-daily-thumb" />
              <span><strong>{row.name}</strong><small>{row.division}</small></span>
              <em>{row.value}</em>
            </article>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="official-daily-game official-daily-find" data-game="find_leader">
      <OfficialHeader projection={projection} eyebrow="TODAY’S CHALLENGE" title={question} copy="Eliminate one fighter at a time. Leave the verified group leader standing." />
      <section className="official-daily-progress-strip">
        <span>ROUND <b>{Math.min(10, eliminated.length + 1)}</b></span>
        <span>STANDING <b>{Math.max(1, candidates.length - eliminated.length)}</b></span>
        <span>SAFE <b>{eliminated.length}/9</b></span>
      </section>
      <section className="official-daily-find-grid" aria-label={question}>
        {candidates.map((row, index) => {
          const safe = eliminatedSet.has(row.id);
          return (
            <button
              className={safe ? "is-safe" : ""}
              disabled={safe || busy}
              type="button"
              key={row.id}
              onClick={() => onAdvance({ eliminated_id: row.id })}
            >
              <span>{index + 1}</span>
              <FighterPhoto name={row.name} src={row.thumbUrl} className="official-daily-find-photo" />
              <strong>{row.name}</strong>
              <small>{row.division}</small>
              <em>{safe ? "SAFE" : busy ? "LOCKING…" : "ELIMINATE"}</em>
            </button>
          );
        })}
      </section>
    </div>
  );
}

function WavelengthView({
  projection,
  busy,
  onAdvance,
}: OfficialGameViewProps) {
  const state = projection.publicState;
  const attempt = projection.officialAttempt;
  const guesses = Array.isArray(state.guesses)
    ? state.guesses.map((value) => integer(value)).filter((value) => value >= 1 && value <= 100)
    : [];
  const clues = records(state.clues);
  const [guess, setGuess] = useState(50);
  useEffect(() => setGuess(50), [guesses.length]);

  if (attempt) {
    const reveal = record(state.reveal) ?? projection.revealSetup ?? {};
    const target = integer(reveal.target);
    const distance = integer(attempt.publicResult.distance, Math.abs((guesses.at(-1) ?? 50) - target));
    return (
      <div className="official-daily-game official-daily-wavelength" data-game="wavelength">
        <OfficialHeader projection={projection} eyebrow="OFFICIAL RESULT" title={`${attempt.normalizedScore}/100`} copy={`The target was ${target}. Your final guess finished ${distance} away.`} />
        <section className="official-daily-result-grid">
          <ResultScore attempt={attempt} />
          <div className="official-wavelength-target"><span>TARGET</span><strong>{target}</strong></div>
        </section>
        <section className="surface-card official-wavelength-clues">
          <header><span>YOUR FOUR READS</span><strong>FINAL: {guesses.at(-1)}</strong></header>
          {records(reveal.clues).map((clue, index) => (
            <article key={String(clue.id ?? index)}>
              <b>{index + 1}</b>
              <span><small>{String(clue.category ?? "CLUE")}</small><strong>{String(clue.text ?? "")}</strong></span>
              <em>{guesses[index] ?? "—"}</em>
            </article>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="official-daily-game official-daily-wavelength" data-game="wavelength">
      <OfficialHeader projection={projection} eyebrow="TODAY’S CHALLENGE" title="Wavelength" copy="Read each adaptive UFC clue, then commit one number from 1 to 100." />
      <section className="official-daily-progress-strip">
        <span>GUESS <b>{Math.min(4, guesses.length + 1)}/4</b></span>
        <span>LAST <b>{guesses.at(-1) ?? "—"}</b></span>
        <span>RANGE <b>1–100</b></span>
      </section>
      <section className="surface-card official-wavelength-clues">
        <header><span>CLUES UNLOCKED</span><strong>{clues.length}/4</strong></header>
        {clues.map((clue, index) => (
          <article key={String(clue.id ?? index)}>
            <b>{index + 1}</b>
            <span><small>{String(clue.category ?? "CLUE")}</small><strong>{String(clue.text ?? "")}</strong></span>
            <em>{guesses[index] ?? "OPEN"}</em>
          </article>
        ))}
      </section>
      <section className="official-wavelength-control">
        <label htmlFor="official-wavelength-guess"><span>YOUR GUESS</span><strong>{guess}</strong></label>
        <input
          id="official-wavelength-guess"
          aria-label="Wavelength guess"
          type="range"
          min="1"
          max="100"
          value={guess}
          disabled={busy}
          onChange={(event) => setGuess(Number(event.target.value))}
        />
        <div>
          <button type="button" disabled={busy || guess <= 1} onClick={() => setGuess((value) => Math.max(1, value - 1))}>−</button>
          <input
            aria-label="Exact Wavelength guess"
            type="number"
            min="1"
            max="100"
            value={guess}
            disabled={busy}
            onChange={(event) => setGuess(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
          />
          <button type="button" disabled={busy || guess >= 100} onClick={() => setGuess((value) => Math.min(100, value + 1))}>+</button>
        </div>
        <button className="official-daily-primary" type="button" disabled={busy} onClick={() => onAdvance({ guess })}>
          {busy ? "LOCKING GUESS…" : `LOCK GUESS ${guesses.length + 1}`}
        </button>
      </section>
    </div>
  );
}

function ResumeFighter({ value, label }: { value: unknown; label: string }) {
  const row = fighter(value);
  return row ? (
    <article className="official-resume-reveal-fighter">
      <FighterPhoto name={row.name} src={row.profileUrl || row.thumbUrl} className="official-resume-photo" />
      <span><small>{label}</small><strong>{row.name}</strong><em>{row.divisions.join(" / ")}</em></span>
    </article>
  ) : null;
}

function BlindResumeView({
  projection,
  busy,
  onAdvance,
}: OfficialGameViewProps) {
  const state = projection.publicState;
  const results = records(state.results);
  const currentRound = record(state.current_round);
  const latest = results.at(-1) ?? null;
  const attempt = projection.officialAttempt;

  if (attempt) {
    return (
      <div className="official-daily-game official-daily-resume" data-game="blind_resume">
        <OfficialHeader projection={projection} eyebrow="OFFICIAL RESULT" title={`${attempt.nativeScore}/5 CORRECT`} copy="Every hidden matchup and model winner is now locked into your official history." />
        <section className="official-daily-result-grid"><ResultScore attempt={attempt} /></section>
        <section className="official-resume-results">
          {results.map((result, index) => {
            const correct = result.correct === true;
            return (
              <article className={correct ? "is-correct" : "is-miss"} key={String(result.round_index ?? index)}>
                <header><span>ROUND {index + 1}</span><strong>{correct ? "CORRECT" : "MISS"}</strong></header>
                <div>
                  <ResumeFighter value={result.fighter_a} label="FIGHTER A" />
                  <ResumeFighter value={result.fighter_b} label="FIGHTER B" />
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  const stats = records(currentRound?.stats);
  return (
    <div className="official-daily-game official-daily-resume" data-game="blind_resume">
      <OfficialHeader projection={projection} eyebrow="TODAY’S CHALLENGE" title="Blind Resume" copy="Names stay hidden until you choose which UFC career is stronger." />
      <section className="official-daily-progress-strip">
        <span>ROUND <b>{integer(currentRound?.round_number, results.length + 1)}/5</b></span>
        <span>CORRECT <b>{results.filter((row) => row.correct === true).length}</b></span>
        <span>LOCKED <b>{results.length}</b></span>
      </section>
      {latest ? (
        <section className={`official-resume-latest${latest.correct === true ? " is-correct" : " is-miss"}`} aria-live="polite">
          <header><span>LAST PICK</span><strong>{latest.correct === true ? "CORRECT" : "MODEL DISAGREES"}</strong></header>
          <div><ResumeFighter value={latest.fighter_a} label="FIGHTER A" /><ResumeFighter value={latest.fighter_b} label="FIGHTER B" /></div>
        </section>
      ) : null}
      {currentRound ? (
        <section className="surface-card official-resume-card">
          <header><span>WHO HAS THE STRONGER UFC RESUME?</span><strong>NO NAMES</strong></header>
          <div className="official-resume-table">
            <div className="official-resume-table__labels"><b>FIGHTER A</b><b>FIGHTER B</b></div>
            {stats.map((stat, index) => (
              <div className="official-resume-stat" key={`${String(stat.label)}-${index}`}>
                <strong>{String(stat.value_a ?? "—")}</strong>
                <span>{String(stat.label ?? "STAT")}</span>
                <strong>{String(stat.value_b ?? "—")}</strong>
              </div>
            ))}
          </div>
          <div className="official-resume-actions">
            <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "A" })}>PICK FIGHTER A</button>
            <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "B" })}>PICK FIGHTER B</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function FighterCard({ value, compact = false }: { value: unknown; compact?: boolean }) {
  const row = fighter(value);
  return row ? (
    <article className={`official-fighter-card${compact ? " is-compact" : ""}`}>
      <FighterPhoto name={row.name} src={row.thumbUrl} className="official-fighter-card__photo" />
      <span><strong>{row.name}</strong><small>{row.divisions.join(" / ")}{row.mainEra ? ` · ${row.mainEra}` : ""}</small></span>
    </article>
  ) : null;
}

function BlindRankView({
  projection,
  busy,
  onAdvance,
}: OfficialGameViewProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const pack = record(setup.pack) ?? {};
  const slots = Array.isArray(state.slots) ? state.slots : [];
  const current = fighter(state.current_fighter);
  const attempt = projection.officialAttempt;

  if (attempt) {
    const reveal = record(state.reveal) ?? projection.revealSetup ?? {};
    const canonical = fighters(reveal.canonical_order);
    return (
      <div className="official-daily-game official-daily-rank" data-game="blind_rank_5">
        <OfficialHeader projection={projection} eyebrow="OFFICIAL RESULT" title={`${attempt.nativeScore}/10 COMPARISONS`} copy={String(pack.prompt ?? "Your five locked slots are graded against the official order.")} />
        <section className="official-daily-result-grid"><ResultScore attempt={attempt} /></section>
        <section className="surface-card official-rank-reveal">
          <header><span>OFFICIAL ORDER</span><strong>{String(pack.name ?? "BLIND RANK 5")}</strong></header>
          {canonical.map((row, index) => (
            <article key={row.id}>
              <b>#{index + 1}</b>
              <FighterPhoto name={row.name} src={row.thumbUrl} className="official-daily-thumb" />
              <span><strong>{row.name}</strong><small>{row.divisions.join(" / ")}</small></span>
            </article>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="official-daily-game official-daily-rank" data-game="blind_rank_5">
      <OfficialHeader projection={projection} eyebrow="TODAY’S CHALLENGE" title={String(pack.prompt ?? "Blind Rank 5")} copy={String(pack.intro ?? "Place each fighter before the next one is revealed.")} />
      <section className="official-daily-progress-strip">
        <span>REVEAL <b>{Math.min(5, integer(state.reveal_index) + 1)}/5</b></span>
        <span>LOCKED <b>{slots.filter(Boolean).length}</b></span>
        <span>OPEN <b>{slots.filter((slot) => !slot).length}</b></span>
      </section>
      <section className="official-rank-board" aria-label="Blind Rank locked slots">
        {Array.from({ length: 5 }, (_, index) => {
          const assigned = slots[index];
          return assigned ? (
            <div className="official-rank-slot is-locked" key={index}>
              <b>#{index + 1}</b><FighterCard value={assigned} compact /><em>LOCKED</em>
            </div>
          ) : (
            <button className="official-rank-slot" type="button" disabled={busy || !current} key={index} onClick={() => onAdvance({ slot: index + 1 })}>
              <b>#{index + 1}</b><span>OPEN SLOT</span><em>PLACE HERE</em>
            </button>
          );
        })}
      </section>
      {current ? (
        <section className="official-rank-current">
          <span>NEXT FIGHTER</span>
          <FighterPhoto name={current.name} src={current.profileUrl || current.thumbUrl} className="official-rank-current__photo" />
          <div><h2>{current.name}</h2><p>{current.divisions.join(" / ")} · {current.mainEra}</p><small>Choose an open slot. It cannot be changed.</small></div>
        </section>
      ) : null}
    </div>
  );
}

function DecisionTray({ title, values }: { title: "keep" | "cut"; values: unknown }) {
  const rows = fighters(values);
  return (
    <section className={`official-keep-tray is-${title}`}>
      <header><strong>{title.toUpperCase()}</strong><span>{rows.length}/4</span></header>
      <div>
        {Array.from({ length: 4 }, (_, index) => rows[index] ? (
          <FighterCard value={rows[index]} compact key={rows[index]!.id} />
        ) : (
          <div className="official-keep-empty" key={index}><span>{index + 1}</span></div>
        ))}
      </div>
    </section>
  );
}

function KeepCutView({
  projection,
  busy,
  onAdvance,
}: OfficialGameViewProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const pack = record(setup.pack) ?? {};
  const kept = fighters(state.kept);
  const cut = fighters(state.cut);
  const current = fighter(state.current_fighter);
  const forcedChoice = state.forced_choice === "keep" || state.forced_choice === "cut"
    ? state.forced_choice
    : null;
  const attempt = projection.officialAttempt;

  if (attempt) {
    const reveal = record(state.reveal) ?? projection.revealSetup ?? {};
    const modelTopFour = new Set(strings(reveal.model_top_four_ids));
    const modelTopFourKept = kept.filter((row) => modelTopFour.has(row.id)).length;
    const comparisons = integer(attempt.publicResult.correct_comparisons, attempt.nativeScore);
    return (
      <div className="official-daily-game official-daily-keep" data-game="keep_4_cut_4">
        <OfficialHeader projection={projection} eyebrow="EIGHT CALLS LOCKED" title={`${attempt.normalizedScore}/100`} copy={`${modelTopFourKept} of the board’s actual top four kept · ${comparisons} of 16 comparisons won.`} />
        <section className="official-daily-result-grid"><ResultScore attempt={attempt} /></section>
        <section className="official-keep-board">
          <DecisionTray title="keep" values={kept} />
          <DecisionTray title="cut" values={cut} />
        </section>
      </div>
    );
  }

  const forcedCopy = forcedChoice === "keep"
    ? "CUT IS FULL — THIS FIGHTER MUST BE KEPT"
    : forcedChoice === "cut"
      ? "KEEP IS FULL — THIS FIGHTER MUST BE CUT"
      : "MAKE THE CALL. IT LOCKS IMMEDIATELY.";
  return (
    <div className="official-daily-game official-daily-keep" data-game="keep_4_cut_4">
      <OfficialHeader projection={projection} eyebrow="TODAY’S CHALLENGE" title={String(pack.prompt ?? "Keep 4, Cut 4")} copy={`${String(pack.description ?? "")} Eight fighters arrive one at a time. Future fighters stay hidden.`.trim()} />
      <section className="official-daily-progress-strip">
        <span>FIGHTER <b>{Math.min(8, integer(state.reveal_index) + 1)}/8</b></span>
        <span>KEPT <b>{kept.length}/4</b></span>
        <span>CUT <b>{cut.length}/4</b></span>
      </section>
      <section className="official-keep-board">
        <DecisionTray title="keep" values={kept} />
        <DecisionTray title="cut" values={cut} />
      </section>
      {current ? (
        <section className="official-keep-current">
          <FighterPhoto name={current.name} src={current.profileUrl || current.thumbUrl} className="official-keep-current__photo" />
          <div>
            <span>REVEAL {integer(state.reveal_index) + 1} OF 8</span>
            <h2>{current.name}</h2>
            <p>{current.divisions.join(" / ")} · {current.mainEra}</p>
            <small className={forcedChoice ? "is-forced" : ""}>{forcedCopy}</small>
            <div>
              <button type="button" className="keep" disabled={busy || forcedChoice === "cut" || kept.length >= 4} onClick={() => onAdvance({ choice: "keep" })}>KEEP</button>
              <button type="button" className="cut" disabled={busy || forcedChoice === "keep" || cut.length >= 4} onClick={() => onAdvance({ choice: "cut" })}>CUT</button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

interface OfficialGameViewProps {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Record<string, unknown>) => void;
}

export function OfficialTodayChallengeView({
  projection,
  busy,
  error,
  onAdvance,
  onRefresh,
  onNavigate,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  error?: unknown;
  onAdvance: (action: Record<string, unknown>) => void;
  onRefresh?: () => void;
  onNavigate: (route: string) => void;
}) {
  const adapter = todayChallengeAdapter(projection.gameType)!;
  let game;
  switch (projection.gameType) {
    case "find_leader": game = <FindLeaderView projection={projection} busy={busy} onAdvance={onAdvance} />; break;
    case "wavelength": game = <WavelengthView projection={projection} busy={busy} onAdvance={onAdvance} />; break;
    case "blind_resume": game = <BlindResumeView projection={projection} busy={busy} onAdvance={onAdvance} />; break;
    case "blind_rank_5": game = <BlindRankView projection={projection} busy={busy} onAdvance={onAdvance} />; break;
    case "keep_4_cut_4": game = <KeepCutView projection={projection} busy={busy} onAdvance={onAdvance} />; break;
  }

  return (
    <div className="page official-daily-page" data-testid="official-daily-page">
      <RuntimeStatus error={error} onRefresh={onRefresh} />
      {game}
      {projection.officialAttempt ? <OfficialResultActions casualRoute={adapter.casualRoute} onNavigate={onNavigate} /> : null}
    </div>
  );
}

export default function OfficialTodayChallengePage({
  expectedGameType,
  repository,
}: {
  expectedGameType: DailyGameType;
  repository?: TodayChallengeRepository | null;
}) {
  const identity = useIdentity();
  const navigate = useNavigate();
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const runtime = useTodayChallengeRuntime({
    profileId: identity.profile?.id ?? "signed-out",
    enabled: signedIn,
    repository,
  });
  const adapter = useMemo(
    () => runtime.projection ? todayChallengeAdapter(runtime.projection.gameType) : null,
    [runtime.projection],
  );

  if (!signedIn) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-gate">
          <p className="eyebrow">TODAY’S CHALLENGE</p>
          <h1>Sign in to play the official daily.</h1>
          <p>Your first attempt, unfinished progress, streak, and leaderboard result follow your profile across devices.</p>
          <button type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      </div>
    );
  }

  if (!runtime.configured) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-gate is-error"><h1>Today’s Challenge is not connected.</h1></section>
      </div>
    );
  }

  if (!runtime.projection && runtime.loading) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-loading" aria-live="polite"><span /><strong>Loading today’s official game…</strong></section>
      </div>
    );
  }

  if (!runtime.projection) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-gate is-error">
          <p className="eyebrow">TODAY’S CHALLENGE</p>
          <h1>The official game did not load.</h1>
          <p>{errorMessage(runtime.error)}</p>
          <button type="button" onClick={() => void runtime.refresh()}>TRY AGAIN</button>
        </section>
      </div>
    );
  }

  if (runtime.projection.gameType !== expectedGameType && adapter) {
    return <Navigate replace to={adapter.dailyRoute} />;
  }

  return (
    <OfficialTodayChallengeView
      projection={runtime.projection}
      busy={runtime.busy}
      error={runtime.error}
      onAdvance={(action) => { void runtime.advance(action); }}
      onRefresh={() => { void runtime.refresh(); }}
      onNavigate={(route) => navigate(route)}
    />
  );
}
