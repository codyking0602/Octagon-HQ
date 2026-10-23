import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createBarTriviaState,
  setBarTriviaWager,
  submitBarTriviaAnswer,
  type BarTriviaAnswerResult,
  type BarTriviaQuestion,
  type BarTriviaState,
} from "../games/barTriviaEngine";
import { OfficialBarTriviaDailyView } from "../play/OfficialBarTriviaDailyView";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import {
  NBA_BAR_TRIVIA_UNIQUE_APPEARANCES,
  buildNbaBarTriviaDailyBoard,
} from "./nbaBarTriviaDailyRotation";

type PreviewSnapshot = {
  state: BarTriviaState;
  lastResult: BarTriviaAnswerResult | null;
  revision: number;
};

/** Match the official Football/UFC Daily payload: hide answers until the reveal. */
function publicQuestion(question: BarTriviaQuestion) {
  return {
    id: question.id,
    league: question.league,
    round: question.round,
    difficulty: question.difficulty,
    category: question.category,
    prompt: question.prompt,
    choices: [...question.choices],
    contentType: question.contentType,
  };
}

function NbaBarTriviaDailySandbox({ slot }: { slot: number }) {
  const navigate = useNavigate();
  const board = useMemo(() => buildNbaBarTriviaDailyBoard(slot), [slot]);
  const [snapshot, setSnapshot] = useState<PreviewSnapshot>(() => ({
    state: createBarTriviaState(board.doubleRound),
    lastResult: null,
    revision: 0,
  }));

  // A local projection for the EXACT official Daily Bar Trivia presentation.
  // No repository, official Daily advance, localStorage or leaderboard writes.
  const projection = useMemo<TodayChallengeProjection>(() => {
    const { state, lastResult, revision } = snapshot;
    const current = state.complete ? null : board.questions[state.index] ?? null;
    const revealed = lastResult ? board.questions[state.index - 1] ?? null : null;

    return {
      available: true,
      sport: "ufc",
      id: "nba-bar-trivia-owner-sandbox",
      centralDay: "2026-10-22",
      scheduleVersion: "nba-bar-trivia-owner-preview",
      gameType: "bar_trivia",
      setupKey: `nba-bar-trivia-owner-slot-${slot}`,
      contentVersion: "nba-bar-trivia-owner-preview-v1",
      scoringVersion: "play-official-score-v1",
      fallbackReason: null,
      publicSetup: { league: "nba", question_count: board.questions.length },
      progressRevision: revision,
      publicState: {
        complete: state.complete,
        index: state.index,
        score: state.score,
        raw_score: state.rawScore,
        streak: state.streak,
        best_streak: state.bestStreak,
        correct_count: state.correctCount,
        wager: state.wager,
        double_round: state.doubleRound,
        answers: state.answers,
        current_question: current ? publicQuestion(current) : null,
        last_question: revealed ? { ...publicQuestion(revealed), answer: revealed.answer, explanation: revealed.explanation } : null,
        last_result: lastResult,
      },
      revealSetup: null,
      // The result screen is the official Daily receipt; this is NOT an actual saved attempt.
      officialAttempt: state.complete
        ? { nativeScore: state.score, normalizedScore: state.score, completedAt: "preview-only", publicResult: {} }
        : null,
      deploymentSha: "local-owner-preview",
      actionHistory: [],
    };
  }, [board, slot, snapshot]);

  function advance(action: Record<string, unknown>) {
    setSnapshot((current) => {
      if (current.state.complete) return current;
      if (typeof action.choice === "string") {
        if (current.lastResult) return current;
        const { state, result } = submitBarTriviaAnswer(board.questions, current.state, action.choice);
        return { state, lastResult: result, revision: current.revision + 1 };
      }
      if (typeof action.wager === "number" && current.state.index === 9 && current.state.wager == null) {
        return {
          state: setBarTriviaWager(current.state, action.wager),
          lastResult: null,
          revision: current.revision + 1,
        };
      }
      return current;
    });
  }

  return (
    <div data-testid="nba-bar-trivia-owner-preview" aria-label={`NBA Daily Bar Trivia preview appearance ${slot + 1}`}>
      <OfficialBarTriviaDailyView
        projection={projection}
        busy={false}
        onAdvance={advance}
        onExit={() => navigate("/nba")}
      />
    </div>
  );
}

/** Owner-gated NBA Daily-only sandbox. No official Daily results or Casual route. */
export default function NbaBarTriviaOwnerPreviewPage() {
  const [searchParams] = useSearchParams();
  const requested = Number(searchParams.get("slot") ?? "0");
  const slot = Number.isSafeInteger(requested)
    ? Math.max(0, Math.min(NBA_BAR_TRIVIA_UNIQUE_APPEARANCES - 1, requested))
    : 0;
  return <NbaBarTriviaDailySandbox key={slot} slot={slot} />;
}
