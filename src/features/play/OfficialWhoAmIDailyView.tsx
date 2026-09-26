import { useEffect, useMemo, useState } from "react";
import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_CLUES_PER_REVEAL,
  whoAmIRecoveryScore,
  whoAmIScore,
  type WhoAmISubject,
} from "../games/whoAmIEngine";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import WhoAmIPresentation from "./WhoAmIPresentation";
import { WHO_AM_I_TWO_ROUND_FORMAT_VERSION } from "./whoAmITwoRoundDailyRuntime";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is string => typeof row === "string") : [];
}

function subject(value: unknown): WhoAmISubject | null {
  const row = record(value);
  const kind = String(row.kind ?? "");
  if (typeof row.id !== "string" || typeof row.name !== "string" || !["fighter", "player", "coach"].includes(kind)) return null;
  return { id: row.id, name: row.name, kind: kind as WhoAmISubject["kind"] };
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

export function OfficialWhoAmIDailyView({
  projection,
  busy,
  onAdvance,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: JsonRecord) => void;
}) {
  const outerSetup = projection.publicSetup;
  const outerState = projection.publicState;
  const twoRound = outerSetup.format_version === WHO_AM_I_TWO_ROUND_FORMAT_VERSION;
  const roundIndex = twoRound ? Number(outerState.round_index ?? 0) : 0;
  const roundSetups = records(outerSetup.rounds);
  const setup = twoRound ? record(roundSetups[roundIndex]) : outerSetup;
  const state = twoRound ? record(outerState.active_round) : outerState;
  const configuredSport = String(outerSetup.sport ?? setup.sport ?? "");
  const sport = configuredSport === "football"
    ? "football"
    : configuredSport === "mlb"
      ? "mlb"
      : "ufc";
  const league = String(setup.league ?? state.league ?? (sport === "football" ? "FOOTBALL" : sport === "mlb" ? "MLB" : "UFC"));
  const phase = String(state.phase ?? "playing");
  const revealedCount = Number(state.revealed_count ?? WHO_AM_I_CLUES_PER_REVEAL);
  const wrongGuesses = Number(state.wrong_guesses ?? 0);
  const rescueMisses = Number(state.recovery_wrong_guesses ?? 0);
  const rejected = new Set(strings(state.rejected_subject_ids));
  const rescueRejected = new Set(strings(state.recovery_rejected_subject_ids));
  const clues = records(state.clues).map((entry, index) => ({
    id: String(entry.id ?? `clue-${index + 1}`),
    text: String(entry.text ?? ""),
  }));
  const subjects = records(setup.subjects).map(subject).filter(Boolean) as WhoAmISubject[];
  const rescueChoices = records(state.recovery_choices).map(subject).filter(Boolean) as WhoAmISubject[];

  const [guessSearch, setGuessSearch] = useState("");
  const [selectedGuess, setSelectedGuess] = useState<WhoAmISubject | null>(null);
  const [guessOpen, setGuessOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [guessNotice, setGuessNotice] = useState<{ name: string; score: number } | null>(null);
  const [pendingGuess, setPendingGuess] = useState<WhoAmISubject | null>(null);

  const attempt = projection.officialAttempt;
  const overallResult = attempt?.publicResult ?? {};
  const roundResult = twoRound ? record(records(overallResult.rounds)[roundIndex]) : overallResult;
  const persistedReveal = record(projection.revealSetup);
  const reveal = twoRound
    ? (attempt
        ? record(records(persistedReveal.rounds)[roundIndex])
        : record(outerState.active_reveal))
    : persistedReveal;
  const identity = subject(reveal.identity);

  const finalGuessRequired = phase === "playing" && revealedCount >= WHO_AM_I_CLUE_LIMIT;
  const currentScore = whoAmIScore(revealedCount, wrongGuesses);
  const nextCount = Math.min(WHO_AM_I_CLUE_LIMIT, revealedCount + WHO_AM_I_CLUES_PER_REVEAL);
  const nextScore = whoAmIScore(nextCount, wrongGuesses);
  const recoveryScore = whoAmIRecoveryScore(rescueMisses);

  const guessMatches = useMemo(() => {
    const query = normalized(guessSearch);
    if (query.length < 2) return [];
    return subjects
      .filter((candidate) => !rejected.has(candidate.id))
      .filter((candidate) => normalized(candidate.name).includes(query))
      .slice(0, 16);
  }, [guessSearch, subjects, state.rejected_subject_ids]);

  useEffect(() => {
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessOpen(false);
    setReviewOpen(false);
    setGuessNotice(null);
    setPendingGuess(null);
  }, [roundIndex]);

  useEffect(() => {
    if (!pendingGuess) return;
    if (phase !== "playing") {
      setPendingGuess(null);
      setGuessNotice(null);
      return;
    }
    if (rejected.has(pendingGuess.id)) {
      setGuessNotice({ name: pendingGuess.name, score: currentScore });
      setPendingGuess(null);
    }
  }, [currentScore, pendingGuess, phase, rejected]);

  function submitNatural() {
    if (!selectedGuess || busy) return;
    setPendingGuess(selectedGuess);
    onAdvance({ type: "guess", subject_id: selectedGuess.id });
    setSelectedGuess(null);
    setGuessSearch("");
    setGuessOpen(false);
  }

  const resultOutcome = String(roundResult.outcome ?? state.outcome ?? "");
  const resultLabel = resultOutcome === "natural"
    ? "NATURAL SOLVE"
    : resultOutcome === "recovered"
      ? "RECOVERED"
      : "MISS";
  const revealClues = records(reveal.clues).map((entry, index) => ({
    id: String(entry.id ?? `clue-${index + 1}`),
    text: String(entry.text ?? ""),
  }));
  const presentationPhase = phase === "result" ? "result" : phase === "recovery" ? "rescue" : "playing";
  const resultState = resultOutcome === "natural" ? "correct" : resultOutcome === "recovered" ? "rescued" : "incorrect";
  const presentationRevealedCount = presentationPhase === "result"
    ? Number(roundResult.revealed_count ?? state.revealed_count ?? revealedCount)
    : revealedCount;
  const presentationWrongGuesses = presentationPhase === "result"
    ? Number(roundResult.wrong_guesses ?? state.wrong_guesses ?? wrongGuesses)
    : wrongGuesses;
  const roundScore = twoRound
    ? Number(roundResult.score ?? state.score ?? 0)
    : Number(attempt?.normalizedScore ?? state.score ?? 0);
  const componentScores = twoRound && attempt
    ? records(overallResult.rounds).map((row) => Number(row.score ?? 0))
    : [];

  return (
    <>
      <WhoAmIPresentation
        sport={sport}
        league={league}
        phase={presentationPhase}
        revealedCount={presentationRevealedCount}
        wrongGuesses={presentationWrongGuesses}
        rescueMisses={rescueMisses}
        score={currentScore}
        nextRevealScore={nextScore}
        recoveryScore={recoveryScore}
        clues={clues}
        allClues={presentationPhase === "result" ? revealClues : clues}
        guessOpen={guessOpen}
        guessSearch={guessSearch}
        selectedGuess={selectedGuess}
        guessMatches={guessMatches}
        guessNotice={guessNotice}
        rescueChoices={rescueChoices}
        rejectedRescueSubjectIds={rescueRejected}
        reviewOpen={reviewOpen}
        resultState={resultState}
        resultLabel={resultLabel}
        resultName={identity?.name ?? "Identity revealed"}
        finalScore={roundScore}
        finalScoreLabel={twoRound ? "ROUND SCORE" : undefined}
        busy={busy}
        daily
        dailyContext={twoRound
          ? `${projection.centralDay} · ROUND ${roundIndex + 1} OF 2 · SAME BOARD FOR EVERYONE`
          : `${projection.centralDay} · SAME BOARD FOR EVERYONE`}
        onOpenGuess={() => {
          setGuessOpen(true);
          setGuessSearch("");
          setSelectedGuess(null);
          setGuessNotice(null);
        }}
        onRevealMore={() => {
          setGuessNotice(null);
          setGuessSearch("");
          setSelectedGuess(null);
          onAdvance({ type: "reveal" });
        }}
        onGuessSearchChange={(value) => {
          setGuessSearch(value);
          setSelectedGuess(null);
        }}
        onSelectGuess={(candidate) => {
          setSelectedGuess(candidate);
          setGuessSearch(candidate.name);
        }}
        onChangeGuess={() => setSelectedGuess(null)}
        onSubmitGuess={submitNatural}
        onCloseGuess={() => {
          setGuessOpen(false);
          setGuessSearch("");
          setSelectedGuess(null);
        }}
        onEnterRecovery={() => onAdvance({ type: "enter_recovery" })}
        onRecoveryGuess={(candidate) => onAdvance({ type: "recovery_guess", subject_id: candidate.id })}
        onToggleReview={() => setReviewOpen((open) => !open)}
      />

      {twoRound && !attempt && outerState.awaiting_next === true ? (
        <div className="official-daily-result-actions">
          <button type="button" disabled={busy} onClick={() => onAdvance({ type: "next_round" })}>
            CONTINUE TO ROUND 2
          </button>
        </div>
      ) : null}

      {twoRound && attempt ? (
        <section className="official-daily-status" aria-label="Who Am I Daily score">
          <strong>DAILY SCORE · {attempt.normalizedScore}/100</strong>
          <p>
            ROUND 1 · {componentScores[0] ?? 0}/100
            {" · "}
            ROUND 2 · {componentScores[1] ?? 0}/100
          </p>
        </section>
      ) : null}
    </>
  );
}
