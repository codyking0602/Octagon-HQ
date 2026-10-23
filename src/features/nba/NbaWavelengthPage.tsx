import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FootballWavelengthPresentation } from "../back-room/FootballWavelengthPresentation";
import {
  WAVELENGTH_OPINION_DISCLOSURE,
  clampWavelength,
  wavelengthScore,
} from "../play/wavelengthEngine";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  nbaWavelengthCategoryLabel,
  nbaWavelengthClueDescriptor,
} from "./nbaWavelengthCatalog";
import {
  createNbaWavelengthCasualBoard,
  createNbaWavelengthDailyPreview,
  nbaWavelengthDay,
  nextNbaWavelengthClue,
  type NbaWavelengthBoard,
  type NbaWavelengthClue,
  type NbaWavelengthCompletedRound,
  type NbaWavelengthRound,
} from "./nbaWavelengthModel";
import "../../styles/nba-wavelength.css";

const presentationCopy = {
  resultEyebrow: "NBA WAVELENGTH · GAME RESULT",
  progressAriaLabel: "NBA Wavelength four-clue progress",
  guessAriaLabel: "NBA Wavelength guess from 1 to 100",
  categoryLabel: nbaWavelengthCategoryLabel,
  clueDescriptor: nbaWavelengthClueDescriptor,
  disclosure: WAVELENGTH_OPINION_DISCLOSURE
    + " A rating refers only to the named basketball trait, not overall greatness.",
};

function completedRound(round: NbaWavelengthRound, guesses: number[]): NbaWavelengthCompletedRound {
  const finalGuess = guesses[3]!;
  return {
    target: round.target,
    score: wavelengthScore(finalGuess, round.target),
    finalGuess,
    guesses: [...guesses],
    clues: [...round.clues],
  };
}
function averageScore(rounds: readonly NbaWavelengthCompletedRound[]) {
  return Math.round(rounds.reduce((total, item) => total + item.score, 0) / rounds.length);
}
function freshBoard(daily: boolean, day: string) {
  return daily ? createNbaWavelengthDailyPreview(day) : createNbaWavelengthCasualBoard();
}

/**
 * Owner-only, unranked NBA preview. Uses Football/UFC Wavelength scoring and
 * presentation; does not import official Daily publication, RPCs or standings.
 */
export default function NbaWavelengthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const daily = searchParams.get("mode") === "daily";
  const day = nbaWavelengthDay();
  const [board, setBoard] = useState<NbaWavelengthBoard>(() => freshBoard(daily, day));
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState<NbaWavelengthRound>(() => board.rounds[0]);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [guess, setGuess] = useState(50);
  const [completed, setCompleted] = useState<NbaWavelengthCompletedRound[]>([]);
  const [roundComplete, setRoundComplete] = useState(false);

  function scrollToTop() {
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function reset(nextBoard: NbaWavelengthBoard) {
    setBoard(nextBoard);
    setRoundIndex(0);
    setRound(nextBoard.rounds[0]);
    setGuesses([]);
    setGuess(50);
    setCompleted([]);
    setRoundComplete(false);
    scrollToTop();
  }

  function nextGame() {
    if (!roundComplete || roundIndex !== 0) return;
    setRoundIndex(1);
    setRound(board.rounds[1]);
    setGuesses([]);
    setGuess(50);
    setRoundComplete(false);
    scrollToTop();
  }

  function lockGuess() {
    if (roundComplete || guesses.length >= 4) return;
    const locked = clampWavelength(guess);
    const nextGuesses = [...guesses, locked];
    setGuesses(nextGuesses);
    if (nextGuesses.length === 4) {
      const rounds = [...completed, completedRound(round, nextGuesses)];
      setCompleted(rounds);
      setRoundComplete(true);
      if (rounds.length === 2 && !daily) {
        // Casual's browser-local replay history only. NEVER an official Daily attempt.
        recordLineupCompletion(board.identity, {
          rounds,
          averageScore: averageScore(rounds),
          version: board.versions.game,
        });
      }
      scrollToTop();
      return;
    }

    // A second game never repeats the first game's actual clues or people.
    const previousClues = [
      ...completed.flatMap(item => item.clues),
      // Reserve Game 2's opening identity while generating Game 1's adaptive path.
      ...(roundIndex === 0 ? board.rounds[1].clues : []),
    ];
    const excluded = {
      clueIds: previousClues.map(item => item.id),
      subjects: previousClues.map(item => item.subject),
    };
    const next: NbaWavelengthClue = nextNbaWavelengthClue(
      round,
      locked,
      nextGuesses.length,
      board.seed + "|game-" + (roundIndex + 1),
      guesses,
      excluded,
    );
    setRound(current => ({ ...current, clues: [...current.clues, next] }));
    setGuess(locked);
  }

  const score = roundComplete ? completed[roundIndex]?.score : null;
  const finished = roundComplete && roundIndex === 1 && completed.length === 2;
  const pageClass = "page football-debate-page football-wavelength-page wavelength-page"
    + " nba-wavelength-page wavelength-page--nba"
    + (!roundComplete ? " wavelength-page--playing" : "");
  return (
    <main className={pageClass} data-sport="nba" data-testid="nba-wavelength-owner-preview">
      <div className="nba-wavelength-preview-label" role="status">
        <span>{daily ? "OWNER DAILY PREVIEW" : "NBA OWNER PREVIEW · CASUAL"}</span>
        <span>{daily ? "UNRANKED · NOT SAVED" : "NO OFFICIAL DAILY SCORE"}</span>
      </div>
      <div className="nba-wavelength-game-count" aria-label={"Game " + (roundIndex + 1) + " of 2"}>
        <span>NBA WAVELENGTH</span>
        <strong>{"GAME " + (roundIndex + 1) + " OF 2"}</strong>
      </div>
      {roundComplete && score !== null ? (
        <>
          <FootballWavelengthPresentation
            clues={round.clues}
            guesses={guesses}
            guess={guesses[3]!}
            result={{ score, target: round.target }}
            copy={presentationCopy}
          />
          {roundIndex === 0 ? (
            <section className="nba-wavelength-intermission">
              <p className="eyebrow">GAME 1 COMPLETE</p>
              <p>The next hidden number is new. Your two final scores are averaged.</p>
              <button type="button" className="primary-action" onClick={nextGame}>
                START GAME 2 →
              </button>
            </section>
          ) : null}
          {finished ? (
            <section className="nba-wavelength-series-result" aria-label="NBA Wavelength preview average">
              <p className="eyebrow">{daily ? "DAILY PREVIEW · UNRANKED" : "CASUAL RESULT"}</p>
              <strong className="nba-wavelength-series-score">{averageScore(completed)}<small>/100</small></strong>
              <div className="nba-wavelength-scores">
                <span>GAME 1 <b>{completed[0]!.score}</b></span>
                <span>GAME 2 <b>{completed[1]!.score}</b></span>
              </div>
              <p>Both games count equally. Only each game's fourth guess is scored.</p>
              <div className="nba-wavelength-actions">
                <button type="button" className="primary-action" onClick={() => reset(freshBoard(daily, day))}>
                  {daily ? "REPLAY TODAY" : "NEW LINEUP"}
                </button>
                <button type="button" className="find-secondary-action" onClick={() => navigate("/nba")}>
                  ALL NBA GAMES
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <FootballWavelengthPresentation
          clues={round.clues}
          guesses={guesses}
          guess={guess}
          onGuessChange={value => setGuess(clampWavelength(value))}
          onLock={lockGuess}
          copy={presentationCopy}
        />
      )}
    </main>
  );
}
