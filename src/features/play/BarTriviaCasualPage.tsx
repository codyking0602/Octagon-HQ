import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  BAR_TRIVIA_MAX_WAGER,
  BAR_TRIVIA_RECENT_MEMORY_SIZE,
  buildBarTriviaRun,
  createBarTriviaState,
  pickBarTriviaDoubleRound,
  setBarTriviaWager,
  submitBarTriviaAnswer,
  type BarTriviaAnswerResult,
  type BarTriviaDoubleRound,
  type BarTriviaLeague,
  type BarTriviaQuestion,
  type BarTriviaState,
} from "../games/barTriviaEngine";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import {
  BarTriviaGameView,
  type BarTriviaScene,
  type BarTriviaScope,
} from "./BarTriviaGameView";

export type BarTriviaSettledResult = {
  score: number;
  rawScore: number;
  correctCount: number;
  bestStreak: number;
  wager: number;
  doubleRound: BarTriviaDoubleRound;
};

function storageKey(league: BarTriviaLeague) {
  return `octagon:bar-trivia:${league}:recent:v1`;
}

function recentQuestionIds(league: BarTriviaLeague) {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(league)) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function rememberQuestionIds(league: BarTriviaLeague, ids: readonly string[]) {
  if (typeof window === "undefined") return;
  const next = [...new Set([...ids, ...recentQuestionIds(league)])]
    .slice(0, BAR_TRIVIA_RECENT_MEMORY_SIZE);
  try {
    window.localStorage.setItem(storageKey(league), JSON.stringify(next));
  } catch {
    // Casual play remains available if local storage is unavailable.
  }
}

function buildRun(league: BarTriviaLeague) {
  return buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, league, {
    recentQuestionIds: recentQuestionIds(league),
  });
}

export default function BarTriviaCasualPage({
  scope,
  runOverride,
  doubleRoundOverride,
  onSettled,
  resultActions,
  ownerNote,
}: {
  scope: BarTriviaScope;
  runOverride?: readonly BarTriviaQuestion[];
  doubleRoundOverride?: BarTriviaDoubleRound;
  onSettled?: (result: BarTriviaSettledResult) => void;
  resultActions?: ReactNode;
  ownerNote?: string | null;
}) {
  const navigate = useNavigate();
  const fixedLeague: BarTriviaLeague | null = scope === "ufc" ? "ufc" : scope === "mlb" ? "mlb" : null;
  const [league, setLeague] = useState<BarTriviaLeague | null>(fixedLeague);
  const [scene, setScene] = useState<BarTriviaScene>(scope === "football" ? "league" : "intro");
  const [run, setRun] = useState<readonly BarTriviaQuestion[]>([]);
  const [state, setState] = useState<BarTriviaState>(() => createBarTriviaState());
  const [lastResult, setLastResult] = useState<BarTriviaAnswerResult | null>(null);
  const [wagerDraft, setWagerDraft] = useState(BAR_TRIVIA_MAX_WAGER);
  const [settled, setSettled] = useState(false);

  const backRoute = scope === "ufc" ? "/play" : scope === "mlb" ? "/mlb" : "/football";
  const displayedIndex = lastResult ? Math.max(0, state.index - 1) : state.index;
  const question = run[displayedIndex] ?? null;

  const availableCounts = useMemo(() => ({
    nfl: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "nfl").length,
    cfb: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "cfb").length,
    ufc: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "ufc").length,
    mlb: runOverride?.length ?? 0,
  }), [runOverride]);

  function selectLeague(nextLeague: BarTriviaLeague) {
    setLeague(nextLeague);
    setScene("intro");
  }

  function startGame() {
    if (!league) return;
    if (league === "mlb" && !runOverride) return;
    const nextRun = runOverride ?? buildRun(league);
    if (!runOverride) rememberQuestionIds(league, nextRun.map((item) => item.id));
    setRun(nextRun);
    setState(createBarTriviaState(doubleRoundOverride ?? pickBarTriviaDoubleRound()));
    setLastResult(null);
    setWagerDraft(BAR_TRIVIA_MAX_WAGER);
    setSettled(false);
    setScene("round-intro");
  }

  function answer(choice: string) {
    if (!question || lastResult) return;
    const transition = submitBarTriviaAnswer(run, state, choice);
    setState(transition.state);
    setLastResult(transition.result);
  }

  function advance() {
    if (!lastResult) return;
    setLastResult(null);

    if (state.complete) {
      if (!settled) {
        setSettled(true);
        onSettled?.({
          score: state.score,
          rawScore: state.rawScore,
          correctCount: state.correctCount,
          bestStreak: state.bestStreak,
          wager: state.wager ?? 0,
          doubleRound: state.doubleRound,
        });
      }
      setScene("result");
      return;
    }
    if (state.index === 9) {
      setScene("wager");
      return;
    }
    if (state.index === 3 || state.index === 6) {
      setScene("round-intro");
      return;
    }
    setScene("question");
  }

  function lockWager() {
    setState((current) => setBarTriviaWager(current, wagerDraft));
    setLastResult(null);
    setScene("question");
  }

  function changeLeague() {
    setLeague(null);
    setRun([]);
    setState(createBarTriviaState());
    setLastResult(null);
    setSettled(false);
    setScene("league");
  }

  return (
    <BarTriviaGameView
      scope={scope}
      league={league}
      scene={scene}
      state={state}
      question={question}
      lastResult={lastResult}
      wagerDraft={wagerDraft}
      availableCounts={availableCounts}
      onBack={() => navigate(backRoute)}
      onSelectLeague={selectLeague}
      onStart={startGame}
      onShowQuestions={() => setScene("question")}
      onAnswer={answer}
      onAdvance={advance}
      onWagerChange={setWagerDraft}
      onLockWager={lockWager}
      onPlayAgain={onSettled ? undefined : startGame}
      onChangeLeague={scope === "football" ? changeLeague : undefined}
      resultActions={resultActions}
      ownerNote={ownerNote === undefined ? "Owner-only Casual preview. No Daily result, streak, or leaderboard write." : ownerNote}
    />
  );
}
