import { useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { FootballFindLeaderPresentation } from "../back-room/FootballFindLeaderPresentation";
import { FootballWavelengthPresentation } from "../back-room/FootballWavelengthPresentation";
import { FootballHitTheNumberPresentation } from "../back-room/FootballHitTheNumberPresentation";
import { OfficialAverageFanDailyView } from "../play/OfficialAverageFanDailyView";
import { OfficialSportsFeudDailyView } from "../play/OfficialSportsFeudDailyView";
import { OfficialMillionaireDailyView } from "../play/OfficialMillionaireDailyView";
import { OfficialWhoAmIDailyView } from "../play/OfficialWhoAmIDailyView";
import { OfficialBarTriviaDailyView } from "../play/OfficialBarTriviaDailyView";
import {
  DailyTwoGamePresentationIntermission, DailyTwoGameStatus,
  dailyTwoGamePresentationIntermissionState,
  dailyTwoGameSeriesState,
} from "../play/DailyTwoGameStatus";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import { useTodayChallengeRuntime, type TodayChallengeAdvanceOptions } from "../play/useTodayChallengeRuntime";
import TodayChallengeHub from "../play/TodayChallengeHub";
import { NbaHigherLowerLeaderboardResult } from "./NbaHigherLowerLeaderboardResult";
import { nbaFindLeaderHeadshot, formatNbaFindLeaderValue } from "./nbaFindTheLeaderModel";
import { nbaWavelengthCategoryLabel } from "./nbaWavelengthCatalog";
import { WAVELENGTH_OPINION_DISCLOSURE } from "../play/wavelengthEngine";
import { nbaHitHeadshot, nbaHitSubjectById } from "./nbaHitTheNumberStats";
import { formatNbaHitNumber } from "./nbaHitTheNumberModel";
import { NBA_DAILY_GAME_LABELS, NBA_OFFICIAL_GAMES_RELEASE_READY, nbaRegularSeasonDaily, nbaCentralDay, type NbaDailyGame } from "./nbaDailySchedule";
import "../../styles/football-find-leader.css";
import "../../styles/nba-find-the-leader.css";
import "../../styles/nba-wavelength.css";
import "../../styles/nba-owner-daily.css";
import "../../styles/nba-games-hub.css";
import "../../styles/football-higher-lower.css";
import "../../styles/nba-higher-lower.css";
import "../../styles/today-challenge-hub.css";
import "./NbaOfficialDailyPage.css";

type Json = Record<string, unknown>;
type Advance = (action: Json, options?: TodayChallengeAdvanceOptions) => void;
const theme = { "--football-accent": "#f2a341", "--football-accent-rgb": "242,163,65" } as CSSProperties;
function object(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
}
function objects(value: unknown): Json[] {
  return Array.isArray(value) ? value.filter((x): x is Json => Boolean(x) && typeof x === "object" && !Array.isArray(x)) : [];
}
function ids(value: unknown) {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}
/**
 * The NBA server publishes Find Leader, Hit the Number and Wavelength as two
 * authoritative rounds. UI must read the active child, never the empty wrapper.
 * Full round reveals are withheld until the official attempt is completed.
 */
export function nbaOfficialActiveRound(projection: TodayChallengeProjection) {
  const twoGame = projection.publicSetup.format_version === "daily-two-game-average-v1";
  const rawIndex = Number(projection.publicState.round_index ?? 0);
  const index = twoGame && Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex <= 1 ? rawIndex : 0;
  const setup = twoGame ? objects(projection.publicSetup.rounds)[index] ?? {} : projection.publicSetup;
  const state = twoGame ? object(projection.publicState.active_round) : projection.publicState;
  const reveal = !projection.officialAttempt ? {}
    : twoGame ? objects(object(projection.revealSetup).rounds)[index] ?? {}
    : object(projection.revealSetup);
  const scores = projection.publicState.round_scores;
  const roundScore = Array.isArray(scores) ? Number(scores[index]) : NaN;
  const score = !projection.officialAttempt ? null
    : Number.isFinite(roundScore) ? roundScore : projection.officialAttempt.normalizedScore;
  return { index, setup, state, reveal, score };
}

function NBAHeadshot({ name, compact = false }: { name: string; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = nbaFindLeaderHeadshot({ name, nbaId: null });
  const initials = name.split(/\s+/).map(x => x[0]).slice(0, 2).join("");
  return <span className={"football-find-card__visual nba-find-card__photo" + (compact ? " is-compact" : "")} aria-label={name + " portrait"}>
    {src && !failed ? <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      : <b aria-hidden="true">{initials || "NBA"}</b>}
  </span>;
}

/** The same approved NBA Casual board presentation, driven exclusively by saved official state. */
export function NbaOfficialFindLeader({ projection, advance, busy }: { projection: TodayChallengeProjection; advance: Advance; busy: boolean }) {
  const { setup, state, reveal, score } = nbaOfficialActiveRound(projection);
  const chosen = ids(state.eliminated_ids);
  const revealed = new Map(objects(reveal.candidates).map(row => [String(row.id), row]));
  const candidates = objects(setup.candidates).map(row => ({
    id: String(row.id ?? ""), name: String(row.name ?? ""),
    displayName: String(row.display_name ?? row.name ?? ""),
    subtitle: String(row.subtitle ?? ""),
    ...(typeof row.season === "number" ? { season: row.season } : {}),
    ...(typeof row.season_label === "string" ? { seasonLabel: row.season_label } : {}),
    ...(typeof revealed.get(String(row.id))?.value === "number" ? { value: Number(revealed.get(String(row.id))!.value) } : {}),
  }));
  const attempt = projection.officialAttempt;
  const perfect = score === 100;
  const stat = String(setup.stat_label ?? "NBA STAT");
  return <div className="page football-find-leader-page nba-find-leader-page" data-sport="nba" style={theme}>
    <FootballFindLeaderPresentation
      question={String(setup.question ?? "Find the NBA leader")}
      context={String(setup.context ?? "Leave the stat leader standing.")}
      categoryLabel={"NBA · " + stat} statLabel={stat} shortLabel={stat}
      candidates={candidates} eliminatedIds={chosen}
      leaderId={attempt ? String(reveal.leader_id ?? "") : null}
      result={attempt ? { score: score ?? attempt.normalizedScore, perfect, fatalId: perfect ? null : chosen.at(-1) ?? null } : null}
      eyebrow="TODAY'S NBA CHALLENGE" intro="Eliminate nine decoys. Leave the leader standing."
      onEliminate={attempt || busy ? null : id => advance({ eliminated_id: id })}
      renderVisual={(candidate, compact) => <NBAHeadshot name={candidate.name} compact={compact} />}
      formatValue={formatNbaFindLeaderValue}
    />
  </div>;
}

const wavelengthCopy = {
  resultEyebrow: "NBA WAVELENGTH · OFFICIAL DAILY",
  progressAriaLabel: "NBA Wavelength four-clue progress",
  guessAriaLabel: "NBA Wavelength guess from 1 to 100",
  categoryLabel: nbaWavelengthCategoryLabel,
  clueDescriptor: () => "",
  disclosure: WAVELENGTH_OPINION_DISCLOSURE
    + " Ratings apply to the named dimension alone. Fame and basketball skill are not interchangeable.",
};

export function NbaOfficialWavelength({ projection, advance, busy }: { projection: TodayChallengeProjection; advance: Advance; busy: boolean }) {
  const [guess, setGuess] = useState(50);
  const { state, score } = nbaOfficialActiveRound(projection);
  const reveal = object(state.reveal);
  const clues = objects(projection.officialAttempt ? reveal.clues : state.clues).map((row, index) => ({
    id: String(row.id ?? index),
    category: String(row.category ?? "nba"),
    text: String(row.text ?? ""),
    ...(typeof row.rating === "number" ? { rating: row.rating } : {}),
  }));
  const guesses = Array.isArray(state.guesses) ? state.guesses.map(Number).filter(Number.isFinite) : [];
  const target = Number(reveal.target ?? 0);
  const attempt = projection.officialAttempt;
  return <main className="page football-debate-page football-wavelength-page wavelength-page wavelength-page--playing nba-wavelength-page" data-sport="nba">
    <FootballWavelengthPresentation
      clues={clues} guesses={guesses} guess={guess}
      onGuessChange={setGuess} onLock={attempt || busy ? undefined : () => advance({ guess })}
      busy={busy} copy={wavelengthCopy}
      result={attempt ? { score: score ?? attempt.normalizedScore, target } : null}
    />
  </main>;
}

function NBAPlayerMark({ id, className }: { id: string; className: string }) {
  const subject = nbaHitSubjectById.get(id);
  const src = subject ? nbaHitHeadshot(subject) : null;
  const [failed, setFailed] = useState(false);
  return <span className={className} aria-label={subject?.name ?? "NBA player"}>
    {src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> :
      <b aria-hidden="true">{subject?.name.split(" ").map(x => x[0]).slice(0, 2).join("") ?? "NBA"}</b>}
  </span>;
}

export function NbaOfficialHitTheNumber({ projection, advance, busy }: { projection: TodayChallengeProjection; advance: Advance; busy: boolean }) {
  const { setup, state, reveal, score } = nbaOfficialActiveRound(projection);
  const result = projection.officialAttempt;
  const selected = ids(state.selected_ids);
  const candidates = objects(setup.candidates).map(row => ({
    id: String(row.id ?? ""), name: String(row.name ?? ""), subtitle: String(row.subtitle ?? ""),
  }));
  const slots = objects(setup.slots).map(row => ({ id: String(row.id ?? ""), label: String(row.label ?? "") }));
  const activeSlot = object(state.active_slot);
  const privateValues = object(reveal.values);
  const values = Object.fromEntries(Object.entries(privateValues).filter((pair): pair is [string, number] => typeof pair[1] === "number"));
  const target = Number(setup.target ?? 0);
  // These values come exclusively from the server's authorized post-completion
  // reveal. Never fill missing evidence with a fake zero-point result.
  const completeReveal = result !== null && selected.every(id => Number.isFinite(values[id]));
  const total = Number(selected.reduce((sum, id) => sum + (values[id] ?? 0), 0).toFixed(1));
  const distance = Number(Math.abs(target - total).toFixed(1));
  const status = total > target ? "bust" : total === target ? "perfect" : "under";
  const available = ids(state.available_subject_ids);
  return <div className="hit-number-page nba-hit-number-page" data-sport="nba" style={theme}>
    <FootballHitTheNumberPresentation
      target={target} metricLabel={String(setup.metric_label ?? "NBA STAT")} league="NBA"
      configurationLabel={String(setup.configuration_label ?? "")}
      pickCount={Number(setup.pick_count ?? 4)}
      candidates={candidates} selectedIds={selected} slots={slots}
      activeSlotIndex={typeof activeSlot.index === "number" ? activeSlot.index : null}
      availableIds={available.length ? available : candidates.map(row => row.id)}
      values={result ? values : undefined}
      result={result && completeReveal ? { score: score ?? result.normalizedScore, target, total, distance, status } : null}
      formatValue={formatNbaHitNumber}
      onToggle={result || busy ? null : id => advance({ fighter_id: id })}
      onRewind={result || busy ? null : index => advance({ rewind_to: index })}
      onLock={result || busy || selected.length !== Number(setup.pick_count ?? 4) ? null : () => advance({ lock: true })}
      renderSubjectMark={(id, className) => <NBAPlayerMark id={id} className={className} />}
      busy={busy}
    />
  </div>;
}

export function NbaOfficialHigherLower({ projection, advance, busy }: { projection: TodayChallengeProjection; advance: Advance; busy: boolean }) {
  const state = projection.publicState;
  const question = object(state.current_question);
  const known = object(question.known), hidden = object(question.hidden);
  const last = object(state.last_result);
  const attempt = projection.officialAttempt;
  if (attempt) {
    return <NbaHigherLowerLeaderboardResult detail={{
      unlocked: true, normalizedScore: attempt.normalizedScore,
      answers: attempt.publicResult.answers ?? state.answers,
      revealQuestions: object(projection.revealSetup).questions,
    }} />;
  }
  return <section className="nba-official-higher-lower" aria-label="Official NBA Higher or Lower" data-sport="nba">
    <header><small>OFFICIAL NBA DAILY · HIGHER OR LOWER</small>
      <h1>Higher or Lower</h1><p>QUESTION {Math.min(10, Number(state.index ?? 0) + 1)} OF 10</p>
    </header>
    {last.correct !== undefined ? <p className={"nba-official-higher-lower__feedback" + (last.correct ? " is-correct" : " is-wrong")}>
      {last.correct ? "CORRECT" : "NOT QUITE"} · Previous pick: {String(last.choice ?? "").toUpperCase()}
    </p> : null}
    <div className="nba-official-higher-lower__comparison">
      <article><small>KNOWN STAT</small><strong>{String(known.name ?? "")}</strong>
        <span>{String(question.metricLabel ?? "NBA STAT")}</span>
        <b>{String(known.formattedValue ?? known.value ?? "—")}</b><small>{String(known.context ?? "")}</small>
      </article>
      <article><small>YOUR CALL</small><strong>{String(hidden.name ?? "")}</strong>
        <span>{String(question.metricLabel ?? "NBA STAT")}</span>
        <b>?</b><small>{String(hidden.context ?? "")}</small>
      </article>
    </div>
    <p>Was {String(hidden.name ?? "the other player")} higher or lower?</p>
    <div className="nba-official-higher-lower__actions">
      <button type="button" disabled={busy} onClick={() => advance({ choice: "higher" })}>↑ HIGHER</button>
      <button type="button" disabled={busy} onClick={() => advance({ choice: "lower" })}>↓ LOWER</button>
    </div>
    {busy ? <span role="status">Saving your pick…</span> : null}
  </section>;
}

export function NbaOfficialDailyContent({ projection, advance, busy, onExit }: {
  projection: TodayChallengeProjection; advance: Advance; busy: boolean; onExit: () => void;
}) {
  const twoGame = dailyTwoGameSeriesState(projection);
  const handoff = dailyTwoGamePresentationIntermissionState(projection);
  if (handoff) return <DailyTwoGamePresentationIntermission projection={projection} busy={busy}
    onContinue={() => advance({ type: "next_game" }, { dedupeKey: "nba-wavelength-handoff:" + projection.id })} />;
  if (twoGame?.awaitingNext) return <DailyTwoGameStatus projection={projection} busy={busy} onAdvance={advance} />;
  return <>
    <DailyTwoGameStatus projection={projection} busy={busy} onAdvance={advance} />
    {projection.gameType === "find_leader" ? <NbaOfficialFindLeader projection={projection} advance={advance} busy={busy} /> : null}
    {projection.gameType === "wavelength" ? <NbaOfficialWavelength key={projection.setupKey + ":" + String(projection.publicState.round_index ?? 0)} projection={projection} advance={advance} busy={busy} /> : null}
    {projection.gameType === "hit_the_number" ? <NbaOfficialHitTheNumber projection={projection} advance={advance} busy={busy} /> : null}
    {projection.gameType === "higher_lower" ? <NbaOfficialHigherLower projection={projection} advance={advance} busy={busy} /> : null}
    {projection.gameType === "who_am_i" ? <OfficialWhoAmIDailyView projection={projection} busy={busy} onAdvance={advance} /> : null}
    {projection.gameType === "sports_feud" ? <OfficialSportsFeudDailyView projection={projection} busy={busy} onAdvance={advance} onExit={onExit} /> : null}
    {projection.gameType === "millionaire" ? <OfficialMillionaireDailyView projection={projection} busy={busy} onAdvance={advance} onExit={onExit} /> : null}
    {projection.gameType === "average_fan" ? <OfficialAverageFanDailyView projection={projection} busy={busy} onAdvance={advance} onExit={onExit} /> : null}
    {projection.gameType === "bar_trivia" ? <OfficialBarTriviaDailyView projection={projection} busy={busy} onAdvance={advance} onExit={onExit} /> : null}
  </>;
}

export default function NbaOfficialDailyPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const releaseEnabled = NBA_OFFICIAL_GAMES_RELEASE_READY && nbaRegularSeasonDaily(nbaCentralDay()) != null;
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const runtime = useTodayChallengeRuntime({
    profileId: identity.profile?.id ?? "signed-out",
    enabled: releaseEnabled && signedIn,
    sport: "nba",
  });
  if (!releaseEnabled) return <div className="page nba-official-daily" data-sport="nba">
    <section className="nba-official-daily__message"><h1>NBA Daily is coming soon.</h1>
      <p>The official challenge opens after all nine games and result screens are verified.</p>
      <button type="button" onClick={() => navigate("/nba")}>BACK TO NBA PLAY</button>
    </section>
  </div>;
  if (!signedIn) return <div className="page nba-official-daily" data-sport="nba"><section className="nba-official-daily__message">
    <h1>Sign in for NBA Daily.</h1><p>Your first attempt, progress and official score follow your HQ profile.</p>
    <button type="button" onClick={identity.openDialog}>SIGN IN</button>
  </section></div>;
  if (params.get("view") === "leaderboard") return <div className="page nba-official-daily" data-sport="nba">
    <button type="button" className="nba-official-daily__back" onClick={() => navigate("/nba")}>← NBA PLAY</button>
    <TodayChallengeHub sport="nba" initialPanel="leaderboard" />
  </div>;
  if (!runtime.projection) return <div className="page nba-official-daily" data-sport="nba">
    <section className="nba-official-daily__message" role="status">
      <h1>{runtime.loading ? "Loading NBA Daily…" : "NBA Daily is temporarily unavailable."}</h1>
      {runtime.error instanceof Error ? <p>{runtime.error.message}</p> : null}
      <button type="button" onClick={() => void runtime.refresh()}>RETRY</button>
    </section>
  </div>;
  const projection = runtime.projection;
  return <div className="nba-official-daily official-daily-page" data-sport="nba" data-game={projection.gameType}>
    <nav className="nba-official-daily__top"><button type="button" onClick={() => navigate("/nba")}>← NBA PLAY</button>
      <span>OFFICIAL DAILY · {NBA_DAILY_GAME_LABELS[projection.gameType as NbaDailyGame] ?? "NBA Daily"}</span>
      <button type="button" onClick={() => navigate("/nba/today?view=leaderboard")}>STANDINGS ↗</button>
    </nav>
    {runtime.error ? <div className="nba-official-daily__error" role="status">
      {runtime.error instanceof Error ? runtime.error.message : "Your game needs a refresh."}
      <button type="button" onClick={() => void runtime.recheckSaved()}>REFRESH SAVED GAME</button>
    </div> : null}
    <NbaOfficialDailyContent
      projection={projection} busy={runtime.busy}
      advance={(action, options) => { void runtime.advance(action, options); }}
      onExit={() => navigate("/nba")}
    />
    {projection.officialAttempt ? <section className="nba-official-daily__saved-score" aria-label="Official NBA Daily total score">
      OFFICIAL SAVED SCORE · <strong>{projection.officialAttempt.normalizedScore}/100</strong>
    </section> : null}
    {projection.officialAttempt ? <footer className="nba-official-daily__footer">
      <button type="button" onClick={() => navigate("/nba/today?view=leaderboard")}>VIEW TODAY'S LEADERBOARD ↗</button>
      <button type="button" onClick={() => navigate("/nba")}>ALL NBA GAMES</button>
    </footer> : null}
  </div>;
}
