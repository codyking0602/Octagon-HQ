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
  saveMlbPlayPreviewResult,
  type MlbPlayChallengeResult,
} from "./mlbPlayChallenge";
import {
  MLB_WAVELENGTH_OWNER_ROUNDS,
  createMlbWavelengthRound,
  mlbWavelengthCategoryLabel,
  mlbWavelengthClueDescriptor,
  nextMlbWavelengthClue,
  type MlbWavelengthClue,
} from "./mlbWavelength";

type CompletedRound = {
  score: number;
  target: number;
  finalGuess: number;
  guesses: number[];
  clues: MlbWavelengthClue[];
};

const presentationCopy = {
  resultEyebrow: "MLB WAVELENGTH · FINAL SCORE",
  progressAriaLabel: "MLB Wavelength clue progress",
  guessAriaLabel: "MLB Wavelength guess from 1 to 100",
  categoryLabel: mlbWavelengthCategoryLabel,
  clueDescriptor: mlbWavelengthClueDescriptor,
};

function storedRoundScores(result: MlbPlayChallengeResult | null) {
  if (!result) return [];
  const scores = result.publicResult.round_scores;
  return Array.isArray(scores)
    ? scores.filter((score): score is number => typeof score === "number")
    : [];
}

export default function MlbWavelengthChallenge() {
  const navigate = useNavigate();
  const [savedResult, setSavedResult] = useState<MlbPlayChallengeResult | null>(() => (
    loadMlbPlayPreviewResult(MLB_PLAY_NEXT_CHALLENGE_KEY)
  ));
  const [practiceMode, setPracticeMode] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => createMlbWavelengthRound(MLB_WAVELENGTH_OWNER_ROUNDS[0]!));
  const [guess, setGuess] = useState(50);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [roundComplete, setRoundComplete] = useState(false);
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);

  const definition = MLB_WAVELENGTH_OWNER_ROUNDS[roundIndex] ?? MLB_WAVELENGTH_OWNER_ROUNDS[0]!;
  const currentScore = roundComplete && guesses.length === 4
    ? wavelengthScore(guesses[3]!, round.target)
    : null;
  const isLastRound = roundIndex === MLB_WAVELENGTH_OWNER_ROUNDS.length - 1;
  const finalScore = completedRounds.length === MLB_WAVELENGTH_OWNER_ROUNDS.length
    ? Math.round(completedRounds.reduce((sum, item) => sum + item.score, 0) / completedRounds.length)
    : null;

  function resetRound(nextRoundIndex: number) {
    setRoundIndex(nextRoundIndex);
    setRound(createMlbWavelengthRound(MLB_WAVELENGTH_OWNER_ROUNDS[nextRoundIndex]!));
    setGuess(50);
    setGuesses([]);
    setRoundComplete(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetChallenge(asPractice: boolean) {
    setPracticeMode(asPractice);
    setCompletedRounds([]);
    resetRound(0);
  }

  function saveChallenge(rounds: CompletedRound[]) {
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
    setSavedResult(saveMlbPlayPreviewResult(MLB_PLAY_NEXT_CHALLENGE_KEY, completed));
  }

  function lockGuess() {
    if (roundComplete) return;

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
      if (isLastRound && !practiceMode) saveChallenge(nextRounds);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const nextClue = nextMlbWavelengthClue(definition, locked, nextGuesses.length);
    setRound((current) => ({ ...current, clues: [...current.clues, nextClue] }));
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
        <div className="mlb-find-series-progress" aria-label={`Game ${roundIndex + 1} of ${MLB_WAVELENGTH_OWNER_ROUNDS.length}`}>
          <span>WAVELENGTH</span>
          <strong>GAME {roundIndex + 1} OF {MLB_WAVELENGTH_OWNER_ROUNDS.length}</strong>
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
            <p>Final score is the average of both Wavelength games.</p>
            <div className="mlb-find-final-actions">
              <button className="primary-action" type="button" onClick={() => resetChallenge(true)}>
                PLAY AGAIN
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
      <div className="mlb-find-series-progress" aria-label={`Game ${roundIndex + 1} of ${MLB_WAVELENGTH_OWNER_ROUNDS.length}`}>
        <span>WAVELENGTH</span>
        <strong>GAME {roundIndex + 1} OF {MLB_WAVELENGTH_OWNER_ROUNDS.length}</strong>
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
