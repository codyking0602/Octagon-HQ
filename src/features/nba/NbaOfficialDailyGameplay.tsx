import { useEffect, useState } from "react";
import { FootballFindLeaderPresentation } from "../back-room/FootballFindLeaderPresentation";
import { FootballHitTheNumberPresentation } from "../back-room/FootballHitTheNumberPresentation";
import { FootballWavelengthPresentation } from "../back-room/FootballWavelengthPresentation";
import { NbaHigherLowerLeaderboardResult } from "./NbaHigherLowerLeaderboardResult";
import { nbaFindLeaderHeadshot, formatNbaFindLeaderValue } from "./nbaFindTheLeaderModel";
import { formatNbaHitNumber } from "./nbaHitTheNumberModel";
import { nbaHitHeadshot, nbaHitSubjectById } from "./nbaHitTheNumberStats";
import { nbaWavelengthCategoryLabel } from "./nbaWavelengthCatalog";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import "../../styles/football-find-leader.css";
import "../../styles/football-hit-the-number.css";
import "../../styles/nba-wavelength.css";
import "../../styles/nba-higher-lower.css";
import "./NbaOfficialDailyGameplay.css";

type R = Record<string, unknown>;
function obj(value: unknown): R {
  return value && typeof value === "object" && !Array.isArray(value) ? value as R : {};
}
function arr(value: unknown): R[] {
  return Array.isArray(value) ? value.filter(v => Boolean(v) && typeof v === "object" && !Array.isArray(v)) as R[] : [];
}
function ids(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
function number(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
export function nbaOfficialActiveRound(projection: TodayChallengeProjection) {
  const twoGame = projection.publicSetup.format_version === "daily-two-game-average-v1";
  const index = twoGame ? Math.min(1, Math.max(0, number(projection.publicState.round_index))) : 0;
  return {
    index,
    setup: twoGame ? arr(projection.publicSetup.rounds)[index] ?? {} : projection.publicSetup,
    state: twoGame ? obj(projection.publicState.active_round) : projection.publicState,
    // The answer-safe Edge projection withholds the full reveal until completion.
    reveal: projection.officialAttempt
      ? (twoGame ? arr(obj(projection.revealSetup).rounds)[index] ?? {} : obj(projection.revealSetup))
      : {},
    score: projection.officialAttempt
      ? number((projection.publicState.round_scores as number[] | undefined)?.[index], projection.officialAttempt.normalizedScore)
      : null,
  };
}
function NbaPlayerImage({ name, nbaId, source }: { name: string; nbaId?: number | null; source?: string | null }) {
  const [failed, setFailed] = useState(false);
  const url = source ?? nbaFindLeaderHeadshot({ name, nbaId: nbaId ?? null });
  useEffect(() => setFailed(false), [url]);
  return <span className="nba-official-daily__portrait">
    {url && !failed ? <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer"
      onError={() => setFailed(true)} /> : <b aria-hidden="true">NBA</b>}
  </span>;
}

function FindLeader({ projection, busy, onAdvance }: GameProps) {
  const { setup, state, reveal, score } = nbaOfficialActiveRound(projection);
  const resultCandidates = arr(reveal.candidates);
  const values = new Map(resultCandidates.map(c => [String(c.id), number(c.value)]));
  const candidates = arr(setup.candidates).map(c => ({
    id: String(c.id ?? ""),
    name: String(c.name ?? ""),
    displayName: String(c.display_name ?? c.name ?? ""),
    subtitle: String(c.subtitle ?? ""),
    season: typeof c.season === "number" ? c.season : undefined,
    seasonLabel: typeof c.season_label === "string" ? c.season_label : undefined,
    ...(projection.officialAttempt && values.has(String(c.id)) ? { value: values.get(String(c.id)) } : {}),
  })).filter(c => c.id && c.name);
  const eliminated = ids(state.eliminated_ids);
  const leaderId = projection.officialAttempt ? String(reveal.leader_id ?? "") : null;
  return <div className="nba-official-daily__game" data-game="find_leader">
    <FootballFindLeaderPresentation
      question={String(setup.question ?? "Find the NBA stat leader")}
      context={String(setup.context ?? "")}
      categoryLabel="NBA STAT CHALLENGE" statLabel={String(setup.stat_label ?? "NBA STAT")}
      shortLabel={String(setup.stat_label ?? "STAT")}
      eyebrow="NBA OFFICIAL DAILY" candidates={candidates}
      leaderId={leaderId} eliminatedIds={eliminated} busy={busy}
      result={score === null ? null : {
        score, perfect: score === 100, fatalId: score === 100 ? null : eliminated.at(-1) ?? null,
      }}
      renderVisual={candidate => <NbaPlayerImage name={candidate.name} />}
      onEliminate={!projection.officialAttempt && !busy ? id => onAdvance({ eliminated_id: id }) : null}
    />
  </div>;
}

function HitNumber({ projection, busy, onAdvance, onBack }: GameProps) {
  const { setup, state, reveal, score } = nbaOfficialActiveRound(projection);
  const selected = ids(state.selected_ids);
  const slots = arr(setup.slots).map(s => ({ id: String(s.id ?? ""), label: String(s.label ?? "") }));
  const revealed = obj(reveal.values);
  const values = projection.officialAttempt
    ? Object.fromEntries(Object.entries(revealed).filter((entry): entry is [string, number] => typeof entry[1] === "number"))
    : undefined;
  const target = number(setup.target);
  const total = selected.reduce((sum, id) => sum + number(values?.[id]), 0);
  const result = score !== null && values ? {
    score,
    status: total > target ? "bust" as const : total === target ? "perfect" as const : "under" as const,
    target, total, distance: Math.abs(target - total),
  } : null;
  const candidates = arr(setup.candidates).map(c => ({
    id: String(c.id ?? ""), name: String(c.name ?? ""), subtitle: String(c.subtitle ?? ""),
  })).filter(c => c.id && c.name);
  return <div className="nba-official-daily__game" data-game="hit_the_number">
    <FootballHitTheNumberPresentation
      league="NBA" target={target} metricLabel={String(setup.metric_label ?? "NBA TOTAL")}
      configurationLabel={String(setup.configuration_label ?? "NBA Daily")}
      pickCount={number(setup.pick_count, 4)} candidates={candidates}
      selectedIds={selected} slots={slots} activeSlotIndex={
        typeof obj(state.active_slot).index === "number" ? number(obj(state.active_slot).index) : null
      }
      availableIds={ids(state.available_subject_ids)}
      values={values} result={result} formatValue={formatNbaHitNumber} busy={busy}
      onBack={onBack}
      onToggle={!projection.officialAttempt && !busy ? id => onAdvance({ fighter_id: id }) : null}
      onRewind={!projection.officialAttempt && !busy ? index => onAdvance({ rewind_to: index }) : null}
      onLock={!projection.officialAttempt && !busy ? () => onAdvance({ lock: true }) : null}
      renderSubjectMark={(id, className) => {
        const subject = nbaHitSubjectById.get(id);
        return <span className={className}>
          <NbaPlayerImage name={subject?.name ?? id} source={subject ? nbaHitHeadshot(subject) : null} />
        </span>;
      }}
    />
  </div>;
}

function Wavelength({ projection, busy, onAdvance }: GameProps) {
  const { state, score } = nbaOfficialActiveRound(projection);
  const [guess, setGuess] = useState(50);
  const guesses = Array.isArray(state.guesses)
    ? state.guesses.filter((n): n is number => typeof n === "number" && Number.isFinite(n)) : [];
  const clues = arr(state.clues).map(c => ({
    id: String(c.id ?? ""), category: String(c.category ?? ""),
    text: String(c.text ?? ""), ...(typeof c.rating === "number" ? { rating: c.rating } : {}),
  }));
  const reveal = obj(state.reveal);
  const finalResult = projection.officialAttempt && score !== null && typeof reveal.target === "number"
    ? { score, target: reveal.target } : null;
  return <div className="nba-official-daily__game nba-wavelength" data-game="wavelength">
    <FootballWavelengthPresentation
      clues={clues} guesses={guesses} guess={guess}
      onGuessChange={setGuess} busy={busy}
      onLock={!projection.officialAttempt ? () => onAdvance({ guess }) : undefined}
      result={finalResult}
      copy={{
        resultEyebrow: "NBA WAVELENGTH · OFFICIAL RESULT",
        guessAriaLabel: "NBA Wavelength guess from 1 to 100",
        progressAriaLabel: "NBA Wavelength four-clue progress",
        categoryLabel: nbaWavelengthCategoryLabel,
        clueDescriptor: () => "",
        disclosure: "Ratings judge the specific dimension in each clue, not overall basketball greatness.",
      }}
    />
  </div>;
}

function HigherLower({ projection, busy, onAdvance }: GameProps) {
  const state = projection.publicState;
  const question = obj(state.current_question);
  const known = obj(question.known), hidden = obj(question.hidden);
  const last = obj(state.last_result);
  const lastHidden = obj(last.hidden);
  if (projection.officialAttempt) {
    return <NbaHigherLowerLeaderboardResult detail={{
      unlocked: true, normalizedScore: projection.officialAttempt.normalizedScore,
      answers: state.answers, revealQuestions: obj(projection.revealSetup).questions,
    }} />;
  }
  return <section className="nba-official-daily__higher-lower" data-game="higher_lower">
    <p className="eyebrow">NBA OFFICIAL DAILY · HIGHER OR LOWER</p>
    <h1>Which number is higher?</h1>
    <span className="nba-official-daily__progress">QUESTION {number(state.index) + 1} OF 10</span>
    {Object.keys(last).length ? <div className="nba-official-daily__previous" role="status">
      PREVIOUS PICK: {last.correct === true ? "CORRECT" : "INCORRECT"}
      {typeof lastHidden.value === "number" ? " · " + String(lastHidden.name ?? "") + ": " + String(lastHidden.formattedValue ?? lastHidden.value) : ""}
    </div> : null}
    {question.id ? <>
      <h2>{String(question.metricLabel ?? "NBA statistic")}</h2>
      <p>{String(question.note ?? "")}</p>
      <div className="nba-official-daily__comparison">
        <article><NbaPlayerImage name={String(known.name ?? "")} nbaId={typeof known.nbaId === "number" ? known.nbaId : null} />
          <strong>{String(known.name ?? "")}</strong><small>{String(known.context ?? "")}</small>
          <b>{String(known.formattedValue ?? known.value ?? "—")}</b>
        </article>
        <article><NbaPlayerImage name={String(hidden.name ?? "")} nbaId={typeof hidden.nbaId === "number" ? hidden.nbaId : null} />
          <strong>{String(hidden.name ?? "")}</strong><small>{String(hidden.context ?? "")}</small>
          <b>?</b>
        </article>
      </div>
      <div className="nba-official-daily__choices">
        <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "higher" })}>HIGHER ↑</button>
        <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "lower" })}>LOWER ↓</button>
      </div>
    </> : <p>Loading the next comparison…</p>}
  </section>;
}

type GameProps = {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: R) => void;
  onBack: () => void;
};

export function NbaOfficialDailyGameplay(props: GameProps) {
  switch (props.projection.gameType) {
    case "find_leader": return <FindLeader {...props} />;
    case "hit_the_number": return <HitNumber {...props} />;
    case "wavelength": return <Wavelength {...props} />;
    case "higher_lower": return <HigherLower {...props} />;
    default: return <section className="nba-official-daily__unsupported" role="alert">
      This NBA official game is not available in this build.
    </section>;
  }
}
