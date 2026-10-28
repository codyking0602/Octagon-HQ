import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FootballWavelengthPresentation } from "../back-room/FootballWavelengthPresentation";
import {
  clampWavelength,
  wavelengthScore,
} from "../play/wavelengthEngine";
import {
  MLB_PLAY_NEXT_CHALLENGE_KEY,
  loadMlbPlayPreviewResult,
  recordMlbPlayChallengeResult,
  saveMlbPlayPreviewResult,
  type MlbPlayChallengeResult,
} from "./mlbPlayChallenge";
import {
  MLB_WAVELENGTH_OWNER_ROUNDS,
  createMlbWavelengthRound,
  mlbWavelengthCategoryLabel,
  mlbWavelengthClueDescriptor,
  nextMlbWavelengthClue,
} from "./mlbWavelength";
import {
  createMlbProductionWavelengthRound,
  mlbProductionWavelengthCategoryLabel,
  mlbProductionWavelengthClueDescriptor,
  mlbProductionWavelengthGamesForDate,
  nextMlbProductionWavelengthClue,
} from "./mlbWavelengthProduction";
import { useMlbPlayChallengeOverview } from "./useMlbPlayChallengeOverview";

type DisplayClue = {
  id: string;
  category: string;
  text: string;
  rating: number;
};

type CompletedRound = {
  score: number;
  target: number;
  finalGuess: number;
  guesses: number[];
  clues: DisplayClue[];
};

type MlbWavelengthChallengeProps = {
  mode?: "owner_review" | "production";
  challengeKey?: string;
  challengeDate?: string | null;
  season?: number;
};

function storedRoundScores(result: MlbPlayChallengeResult | null) {
  if (!result) return [];
  const scores = result.publicResult.round_scores;
  return Array.isArray(scores)
    ? scores.filter((score): score is number => typeof score === "number")
    : [];
}

export default function MlbWavelengthChallenge({
  mode = "owner_review",
  challengeKey = MLB_PLAY_NEXT_CHALLENGE_KEY,
  challengeDate = null,
  season = 2026,
}: MlbWavelengthChallengeProps) {
  const navigate = useNavigate();
  const productionMode = mode === "production";
  const productionGames = productionMode
    ? mlbProductionWavelengthGamesForDate(challengeDate ?? "")
    : [];
  const gameCount = productionMode ? productionGames.length : MLB_WAVELENGTH_OWNER_ROUNDS.length;
  const validProduction = !productionMode || gameCount === 2;

  function createRoundForIndex(index: number) {
    if (productionMode) {
      const definition = productionGames[index];
      if (!definition) return { target: 50, clues: [] as DisplayClue[] };
      const round = createMlbProductionWavelengthRound(definition);
      return { target: round.target, clues: [...round.clues] as DisplayClue[] };
    }

    const definition = MLB_WAVELENGTH_OWNER_ROUNDS[index] ?? MLB_WAVELENGTH_OWNER_ROUNDS[0]!;
    const round = createMlbWavelengthRound(definition);
    return { target: round.target, clues: [...round.clues] as DisplayClue[] };
  }

  const {
    overview,
    loading: overviewLoading,
    reload: reloadOverview,
  } = useMlbPlayChallengeOverview({
    enabled: productionMode && Boolean(challengeKey),
    season,
    challengeKey,
  });

  const [previewSavedResult, setPreviewSavedResult] = useState<MlbPlayChallengeResult | null>(() => (
    productionMode ? null : loadMlbPlayPreviewResult(challengeKey)
  ));
  const [practiceMode, setPracticeMode] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => createRoundForIndex(0));
  const [guess, setGuess] = useState(50);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [roundComplete, setRoundComplete] = useState(false);
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState("");

  const currentScore = roundComplete && guesses.length === 4
    ? wavelengthScore(guesses[3]!, round.target)
    : null;
  const isLastRound = roundIndex === gameCount - 1;
  const finalScore = completedRounds.length === gameCount && gameCount > 0
    ? Math.round(completedRounds.reduce((sum, item) => sum + item.score, 0) / completedRounds.length)
    : null;
  const savedResult = productionMode ? overview?.ownResult ?? null : previewSavedResult;
  const presentationCopy = productionMode ? {
    resultEyebrow: "MLB WAVELENGTH · FINAL SCORE",
    progressAriaLabel: "MLB Wavelength clue progress",
    guessAriaLabel: "MLB Wavelength guess from 1 to 100",
    categoryLabel: mlbProductionWavelengthCategoryLabel,
    clueDescriptor: mlbProductionWavelengthClueDescriptor,
  } : {
    resultEyebrow: "MLB WAVELENGTH · FINAL SCORE",
    progressAriaLabel: "MLB Wavelength clue progress",
    guessAriaLabel: "MLB Wavelength guess from 1 to 100",
    categoryLabel: mlbWavelengthCategoryLabel,
    clueDescriptor: mlbWavelengthClueDescriptor,
  };

  function resetRound(nextRoundIndex: number) {
    setRoundIndex(nextRoundIndex);
    setRound(createRoundForIndex(nextRoundIndex));
    setGuess(50);
    setGuesses([]);
    setRoundComplete(false);
    setRecordError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetChallenge(asPractice: boolean) {
    setPracticeMode(asPractice);
    setCompletedRounds([]);
    setRecordError("");
    resetRound(0);
  }

  async function saveChallenge(rounds: CompletedRound[]) {
    if (!rounds.length || recording) return;
    const score = Math.round(rounds.reduce((sum, item) => sum + item.score, 0) / rounds.length);
    const completed: MlbPlayChallengeResult = {
      rawScore: score,
      gameType: "wavelength",
      publicResult: {
        round_scores: rounds.map((item) => item.score),
        average_score: score,
      },
      resultDetail: {
        rounds: rounds.map((item, index) => ({
          round: index + 1,
          score: item.score,
          target: item.target,
          final_guess: item.finalGuess,
          guesses: item.guesses,
          clues: item.clues.map((clue) => ({
            id: clue.id,
            category: clue.category,
            text: clue.text,
            rating: clue.rating,
          })),
        })),
      },
      completedAt: new Date().toISOString(),
    };

    setRecording(true);
    setRecordError("");
    try {
      if (productionMode) {
        await recordMlbPlayChallengeResult({
          season,
          challengeKey,
          rawScore: completed.rawScore,
          gameType: completed.gameType,
          publicResult: completed.publicResult,
          resultDetail: completed.resultDetail,
        });
        await reloadOverview();
      } else {
        setPreviewSavedResult(saveMlbPlayPreviewResult(challengeKey, completed));
      }
    } catch (nextError) {
      setRecordError(nextError instanceof Error
        ? nextError.message
        : "Your official MLB Play result could not be recorded.");
    } finally {
      setRecording(false);
    }
  }

  function lockGuess() {
    if (roundComplete || !validProduction) return;

    const locked = clampWavelength(guess);
    const nextGuesses = [...guesses, locked];
    setGuesses(nextGuesses);

    if (nextGuesses.length === 4) {
      const completed: CompletedRound = {
        score: wavelengthScore(locked, round.target),
        target: round.target,
        finalGuess: locked,
        guesses: nextGuesses,
        clues: [...round.clues],
      };
      const nextRounds = [...completedRounds.slice(0, roundIndex), completed];
      setCompletedRounds(nextRounds);
      setRoundComplete(true);
      if (isLastRound && !practiceMode) void saveChallenge(nextRounds);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let nextClue: DisplayClue;
    if (productionMode) {
      const definition = productionGames[roundIndex]!;
      const unavailable = completedRounds.flatMap((item) => item.clues.map((clue) => clue.id));
      nextClue = nextMlbProductionWavelengthClue(
        definition,
        locked,
        nextGuesses.length,
        round.clues.map((clue) => clue.id),
        unavailable,
      );
    } else {
      const definition = MLB_WAVELENGTH_OWNER_ROUNDS[roundIndex] ?? MLB_WAVELENGTH_OWNER_ROUNDS[0]!;
      nextClue = nextMlbWavelengthClue(definition, locked, nextGuesses.length);
    }
    setRound((current) => ({ ...current, clues: [...current.clues, nextClue] }));
  }

  if (!validProduction) {
    return (
      <div className="page football-debate-page football-wavelength-page wavelength-page--mlb mlb-wavelength-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
          <h1>Challenge coming soon.</h1>
          <p>This scheduled challenge is not ready for play yet.</p>
          <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
            MLB PLAY
          </button>
        </section>
      </div>
    );
  }

  if (productionMode && overviewLoading && !overview && completedRounds.length === 0 && !practiceMode) {
    return (
      <div className="page football-debate-page football-wavelength-page wavelength-page--mlb mlb-wavelength-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
          <h1>Loading your challenge…</h1>
        </section>
      </div>
    );
  }

  if (savedResult && !practiceMode && completedRounds.length === 0) {
    const scores = storedRoundScores(savedResult);
    return (
      <div className="page football-debate-page football-wavelength-page mlb-wavelength-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">OFFICIAL RESULT</p>
          <h1>Wavelength</h1>
          <strong>{savedResult.rawScore}<small>/100</small></strong>
          {scores.length ? (
            <div className="mlb-find-saved-result__games">
              {scores.map((score, index) => (
                <span key={index}>
                  <small>GAME {index + 1}</small>
                  <b>{score}</b>
                </span>
              ))}
            </div>
          ) : null}
          <p>Your official score is locked. Replays do not change the postseason standings.</p>
          <div className="mlb-find-final-actions">
            <button className="primary-action" type="button" onClick={() => resetChallenge(true)}>
              PLAY AGAIN
            </button>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
              MLB PLAY
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (roundComplete && currentScore !== null) {
    return (
      <div className="page football-debate-page football-wavelength-page wavelength-page--mlb mlb-wavelength-page">
        <div className="mlb-find-series-progress" aria-label={`Game ${roundIndex + 1} of ${gameCount}`}>
          <span>WAVELENGTH</span>
          <strong>GAME {roundIndex + 1} OF {gameCount}</strong>
        </div>

        <FootballWavelengthPresentation
          clues={round.clues}
          guesses={guesses}
          guess={guesses[3] ?? guess}
          result={{ score: currentScore, target: round.target }}
          copy={presentationCopy}
        />

        {!isLastRound ? (
          <section className="mlb-find-between-games">
            <div>
              <span>GAME 1 COMPLETE</span>
              <strong>{currentScore}<small>/100</small></strong>
              <p>One more game. Your two scores will be averaged.</p>
            </div>
            <button className="primary-action" type="button" onClick={() => resetRound(roundIndex + 1)}>
              NEXT GAME →
            </button>
          </section>
        ) : finalScore !== null ? (
          <section className="mlb-find-final-score mlb-wavelength-final-score">
            <p className="eyebrow">{practiceMode ? "REPLAY SCORE" : "FINAL SCORE"}</p>
            <strong>{finalScore}<small>/100</small></strong>
            <div>
              <span>GAME 1 <b>{completedRounds[0]?.score ?? "—"}</b></span>
              <span>GAME 2 <b>{completedRounds[1]?.score ?? "—"}</b></span>
            </div>
            <p>
              {practiceMode
                ? "Replay complete. Your locked official result does not change."
                : recording
                  ? "Saving your official postseason result…"
                  : recordError
                    ? recordError
                    : "Final score is the average of both Wavelength games."}
            </p>
            <div className="mlb-find-final-actions">
              <button
                className="primary-action"
                type="button"
                onClick={() => {
                  if (recordError) {
                    void saveChallenge(completedRounds);
                    return;
                  }
                  resetChallenge(true);
                }}
              >
                {recordError ? "RETRY SAVE" : "PLAY AGAIN"}
              </button>
              <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
                MLB PLAY
              </button>
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="page football-debate-page football-wavelength-page wavelength-page wavelength-page--playing wavelength-page--mlb mlb-wavelength-page">
      <div className="mlb-find-series-progress" aria-label={`Game ${roundIndex + 1} of ${gameCount}`}>
        <span>WAVELENGTH</span>
        <strong>GAME {roundIndex + 1} OF {gameCount}</strong>
      </div>

      <FootballWavelengthPresentation
        clues={round.clues}
        guesses={guesses}
        guess={guess}
        onGuessChange={(value) => setGuess(clampWavelength(value))}
        onLock={lockGuess}
        copy={presentationCopy}
      />
    </div>
  );
}
