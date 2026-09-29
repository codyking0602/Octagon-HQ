import { useEffect, useMemo, useRef, useState } from "react";
import {
  BAR_TRIVIA_MAX_WAGER,
  createBarTriviaState,
  type BarTriviaAnswerResult,
  type BarTriviaLeague,
  type BarTriviaState,
} from "../games/barTriviaEngine";
import {
  BarTriviaGameView,
  type BarTriviaDisplayQuestion,
  type BarTriviaScene,
} from "./BarTriviaGameView";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function league(value: unknown): BarTriviaLeague {
  return value === "nfl" || value === "cfb" || value === "ufc" ? value : "ufc";
}

function answerResults(value: unknown): BarTriviaAnswerResult[] {
  return Array.isArray(value)
    ? value.filter((row): row is BarTriviaAnswerResult => Boolean(row) && typeof row === "object")
    : [];
}

function stateFromProjection(projection: TodayChallengeProjection): BarTriviaState {
  const value = projection.publicState;
  const doubleRound = value.double_round;
  const fallback = createBarTriviaState();
  return {
    index: Number(value.index ?? fallback.index),
    score: Number(value.score ?? fallback.score),
    rawScore: Number(value.raw_score ?? fallback.rawScore),
    streak: Number(value.streak ?? fallback.streak),
    bestStreak: Number(value.best_streak ?? fallback.bestStreak),
    correctCount: Number(value.correct_count ?? fallback.correctCount),
    wager: value.wager == null ? null : Number(value.wager),
    doubleRound: doubleRound === "round1" || doubleRound === "round2" || doubleRound === "round3"
      ? doubleRound
      : fallback.doubleRound,
    answers: answerResults(value.answers),
    complete: value.complete === true,
  };
}

function displayQuestion(value: unknown): BarTriviaDisplayQuestion | null {
  const row = record(value);
  if (
    typeof row.id !== "string"
    || typeof row.prompt !== "string"
    || !Array.isArray(row.choices)
    || row.choices.length !== 4
  ) return null;
  return row as unknown as BarTriviaDisplayQuestion;
}

function answerResult(value: unknown): BarTriviaAnswerResult | null {
  const row = record(value);
  return typeof row.choice === "string" && typeof row.correct === "boolean"
    ? row as unknown as BarTriviaAnswerResult
    : null;
}

function initialScene(projection: TodayChallengeProjection): BarTriviaScene {
  if (answerResult(projection.publicState.last_result)) return "question";
  if (projection.officialAttempt) return "result";
  const state = stateFromProjection(projection);
  if (state.index === 0) return "intro";
  if (state.index === 9 && state.wager == null) return "wager";
  return "question";
}

export function OfficialBarTriviaDailyView({
  projection,
  busy,
  onAdvance,
  onExit,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Record<string, unknown>) => void;
  onExit: () => void;
}) {
  const [scene, setScene] = useState<BarTriviaScene>(() => initialScene(projection));
  const [wagerDraft, setWagerDraft] = useState(BAR_TRIVIA_MAX_WAGER);
  const [dismissedRevealRevision, setDismissedRevealRevision] = useState<number | null>(null);
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const pendingSawBusyRef = useRef(false);
  const state = useMemo(() => stateFromProjection(projection), [projection]);
  const gameLeague = league(projection.publicSetup.league);
  const serverLastResult = answerResult(projection.publicState.last_result);
  const showLastResult = Boolean(
    serverLastResult
    && dismissedRevealRevision !== projection.progressRevision,
  );
  const lastResult = showLastResult ? serverLastResult : null;
  const question = showLastResult
    ? displayQuestion(projection.publicState.last_question)
    : displayQuestion(projection.publicState.current_question);

  useEffect(() => {
    if (projection.officialAttempt && !serverLastResult) setScene("result");
  }, [projection.officialAttempt, serverLastResult]);

  useEffect(() => {
    if (state.index === 9 && state.wager != null && scene === "wager") {
      setScene("question");
    }
  }, [scene, state.index, state.wager]);

  useEffect(() => {
    if (serverLastResult) {
      setPendingChoice(null);
      pendingSawBusyRef.current = false;
      return;
    }
    if (busy && pendingChoice) {
      pendingSawBusyRef.current = true;
      return;
    }
    if (!busy && pendingChoice && pendingSawBusyRef.current) {
      setPendingChoice(null);
      pendingSawBusyRef.current = false;
    }
  }, [busy, pendingChoice, serverLastResult]);

  function answer(choice: string) {
    if (pendingChoice || lastResult || busy) return;
    pendingSawBusyRef.current = false;
    setPendingChoice(choice);
    onAdvance({ choice });
  }

  function advanceReveal() {
    if (!lastResult) return;
    setDismissedRevealRevision(projection.progressRevision);
    if (state.complete) {
      setScene("result");
    } else if (state.index === 9) {
      setScene("wager");
    } else if (state.index === 3 || state.index === 6) {
      setScene("round-intro");
    } else {
      setScene("question");
    }
  }

  return (
    <BarTriviaGameView
      scope={projection.sport === "football" ? "football" : "ufc"}
      league={gameLeague}
      scene={scene}
      state={state}
      question={question}
      lastResult={lastResult}
      selectedChoice={pendingChoice}
      wagerDraft={wagerDraft}
      onBack={onExit}
      onStart={() => setScene("round-intro")}
      onShowQuestions={() => setScene("question")}
      onAnswer={answer}
      onAdvance={advanceReveal}
      onWagerChange={setWagerDraft}
      onLockWager={() => onAdvance({ wager: wagerDraft })}
      busy={busy || pendingChoice !== null}
      resultActions={(
        <button className="bar-trivia__primary" type="button" onClick={onExit}>
          BACK TO GAMES
        </button>
      )}
    />
  );
}
