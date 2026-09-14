import { useEffect, useMemo, useState } from "react";
import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_CLUES_PER_REVEAL,
  WHO_AM_I_RESCUE_GUESS_COUNT,
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_RESCUE_SECOND_SCORE,
  WHO_AM_I_WRONG_GUESS_PENALTY,
  whoAmIRecoveryScore,
  whoAmIScore,
  type WhoAmISubject,
} from "../games/whoAmIEngine";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import WhoAmIPresentation from "./WhoAmIPresentation";

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
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const sport = setup.sport === "football" ? "football" : "ufc";
  const football = sport === "football";
  const league = String(setup.league ?? state.league ?? (football ? "FOOTBALL" : "UFC"));
  const phase = String(state.phase ?? "playing");
  const revealedCount = Number(state.revealed_count ?? WHO_AM_I_CLUES_PER_REVEAL);
  const wrongGuesses = Number(state.wrong_guesses ?? 0);
  const rescueMisses = Number(state.recovery_wrong_guesses ?? 0);
  const rejected = new Set(strings(state.rejected_subject_ids));
  const rescueRejected = new Set(strings(state.recovery_rejected_subject_ids));
  const clues = records(state.clues).map((entry, index) => ({\n    id: String(entry.id ?? `clue-${index + 1}`),\n    text: String(entry.text ?? ""),\n  }));
  const subjects = records(setup.subjects).map(subject).filter(Boolean) as WhoAmISubject[];
  const rescueChoices = records(state.recovery_choices).map(subject).filter(Boolean) as WhoAmISubject[];
  const [guessSearch, setGuessSearch] = useState("");
  const [selectedGuess, setSelectedGuess] = useState<WhoAmISubject | null>(null);
  const [guessOpen, setGuessOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);\n  const [guessNotice, setGuessNotice] = useState<{ name: string; score: number } | null>(null);\n  const [pendingGuess, setPendingGuess] = useState<WhoAmISubject | null>(null);
  const attempt = projection.officialAttempt;
  const result = attempt?.publicResult ?? {};
  const reveal = record(projection.revealSetup);
  const identity = subject(reveal.identity);
  const finalGuessRequired = !attempt && phase === "playing" && revealedCount >= WHO_AM_I_CLUE_LIMIT;
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
    if (!pendingGuess) return;
    if (attempt || phase !== "playing") {
      setPendingGuess(null);
      setGuessNotice(null);
      return;
    }
    if (rejected.has(pendingGuess.id)) {
      setGuessNotice({ name: pendingGuess.name, score: currentScore });
      setPendingGuess(null);
    }
  }, [attempt, currentScore, pendingGuess, phase, rejected]);

  function submitNatural() {
    if (!selectedGuess || busy) return;
    setPendingGuess(selectedGuess);
    onAdvance({ type: "guess", subject_id: selectedGuess.id });
    setSelectedGuess(null);
    setGuessSearch("");
    setGuessOpen(false);
  }

  const resultOutcome = String(result.outcome ?? state.outcome ?? "");
  const resultLabel = resultOutcome === "natural" ? "NATURAL SOLVE" : resultOutcome === "recovered" ? "RECOVERED" : "MISS";
  const revealClues = records(reveal.clues).map((entry, index) => ({\n    id: String(entry.id ?? `clue-${index + 1}`),\n    text: String(entry.text ?? ""),\n  }));\n  const presentationPhase = attempt ? "result" : phase === "recovery" ? "rescue" : "playing";\n  const resultState = resultOutcome === "natural" ? "correct" : resultOutcome === "recovered" ? "rescued" : "incorrect";\n  const presentationRevealedCount = attempt ? Number(result.revealed_count ?? revealedCount) : revealedCount;\n  const presentationWrongGuesses = attempt ? Number(result.wrong_guesses ?? wrongGuesses) : wrongGuesses;

  return (
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
      allClues={attempt ? revealClues : clues}
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
      finalScore={attempt?.normalizedScore ?? 0}
      busy={busy}
      daily
      dailyContext={`${projection.centralDay} · SAME BOARD FOR EVERYONE`}
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
  );
}
