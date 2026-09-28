import { useMemo, useState } from "react";
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

export default function BarTriviaCasualPage({ scope }: { scope: BarTriviaScope }) {
  const navigate = useNavigate();
  const fixedLeague: BarTriviaLeague | null = scope === "ufc" ? "ufc" : null;
  const [league, setLeague] = useState<BarTriviaLeague | null>(fixedLeague);
  const [scene, setScene] = useState<BarTriviaScene>(scope === "ufc" ? "intro" : "league");
  const [run, setRun] = useState<readonly BarTriviaQuestion[]>([]);
  const [state, setState] = useState<BarTriviaState>(() => createBarTriviaState());
  const [lastResult, setLastResult] = useState<BarTriviaAnswerResult | null>(null);
  const [wagerDraft, setWagerDraft] = useState(BAR_TRIVIA_MAX_WAGER);

  const backRoute = scope === "ufc" ? "/play" : "/football";
  const displayedIndex = lastResult ? Math.max(0, state.index - 1) : state.index;
  const question = run[displayedIndex] ?? null;

  const availableCounts = useMemo(() => ({
    nfl: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "nfl").length,
    cfb: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "cfb").length,
    ufc: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "ufc").length,
  }), []);

  function selectLeague(nextLeague: BarTriviaLeague) {
    setLeague(nextLeague);
    setScene("intro");
  }

  function startGame() {
    if (!league) return;
    const nextRun = buildRun(league);
    rememberQuestionIds(league, nextRun.map((item) => item.id));
    setRun(nextRun);
    setState(createBarTriviaState(pickBarTriviaDoubleRound()));
    setLastResult(null);
    setWagerDraft(BAR_TRIVIA_MAX_WAGER);
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
      onPlayAgain={startGame}
      onChangeLeague={scope === "football" ? changeLeague : undefined}
      ownerNote="Owner-only Casual preview. No Daily result, streak, or leaderboard write."
    />
  );
}
