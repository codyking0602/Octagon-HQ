import { useMemo, useState } from "react";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "./GameResultActions";
import {
  clampWavelength,
  wavelengthDistanceCopy,
  wavelengthScore,
  type WavelengthRound,
} from "./wavelengthEngine";
import {
  createChallengeWavelengthRound,
  createWavelengthSeed,
  nextChallengeWavelengthClue,
  wavelengthChallengeUrl,
} from "./wavelengthChallenge";

const LAST_TARGET_KEY = "octagon-hq:wavelength-last-target:v2";

export interface WavelengthChallengeResult {
  score: number;
  finalGuess: number;
  target: number;
  guesses: number[];
}

function previousTarget() {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(LAST_TARGET_KEY)) || 0;
}

function rememberTarget(target: number) {
  if (typeof window !== "undefined") window.localStorage.setItem(LAST_TARGET_KEY, String(target));
}

function freshSeed() {
  const previous = previousTarget();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const seed = createWavelengthSeed();
    if (createChallengeWavelengthRound(seed).target !== previous) return seed;
  }
  return createWavelengthSeed();
}

export default function WavelengthGame({
  challengeSeed,
  challengeFrom = "",
  onChallengeComplete,
  onExit,
}: {
  challengeSeed?: string;
  challengeFrom?: string;
  onChallengeComplete?: (result: WavelengthChallengeResult) => void;
  onExit: () => void;
}) {
  const { beginChallenge } = usePlayChallenges();
  const initialSeed = useMemo(() => challengeSeed ?? freshSeed(), [challengeSeed]);
  const initialRound = useMemo(() => {
    const round = createChallengeWavelengthRound(initialSeed);
    rememberTarget(round.target);
    return round;
  }, [initialSeed]);
  const [round, setRound] = useState<WavelengthRound>(initialRound);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState(50);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState("");
  const clue = round.clues[clueIndex];

  function replay() {
    setRound(createChallengeWavelengthRound(initialSeed));
    setClueIndex(0);
    setGuess(50);
    setGuesses([]);
    setComplete(false);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function lockGuess() {
    if (complete) return;
    const locked = clampWavelength(guess);
    const nextGuesses = [...guesses, locked];
    setGuesses(nextGuesses);
    if (clueIndex === 3) {
      const result = {
        score: wavelengthScore(locked, round.target),
        finalGuess: locked,
        target: round.target,
        guesses: nextGuesses,
      };
      setComplete(true);
      onChallengeComplete?.(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const nextClue = nextChallengeWavelengthClue(round, locked, clueIndex + 1, initialSeed, guesses);
    setRound((current) => ({ ...current, clues: [...current.clues, nextClue] }));
    setClueIndex((current) => current + 1);
  }

  async function challengeSomeone() {
    if (!complete) return;
    const finalGuess = guesses[3];
    if (typeof finalGuess !== "number") return;
    const score = wavelengthScore(finalGuess, round.target);
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "wavelength",
      gameVersion: "wavelength-v2-20260724",
      gameTitle: "Wavelength",
      summary: "Find the same hidden UFC rating in four adaptive clues.",
      setup: { seed: initialSeed },
      creatorResult: { score, finalGuess, target: round.target, guesses },
      shareTitle: "Wavelength Challenge",
      shareText: "I challenged you to find the same hidden UFC rating in four adaptive clues. Can you beat my final score?",
      shareUrl: wavelengthChallengeUrl(initialSeed),
    });
    setChallengeStatus(status);
  }

  if (complete) {
    const finalGuess = guesses[3] ?? 50;
    const distance = Math.abs(finalGuess - round.target);
    const score = wavelengthScore(finalGuess, round.target);
    return (
      <div className="wavelength-page page">
        {challengeFrom ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{challengeFrom} sent this exact hidden number.</strong>
            <small>Your score is saved. Both results are now available in Challenge Center.</small>
          </section>
        ) : null}
        <section className="wavelength-result-hero">
          <p className="eyebrow">FINAL SCORE</p>
          <strong>{score}</strong>
          <span>{wavelengthDistanceCopy(distance)}</span>
        </section>

        <section className="wavelength-result-metrics">
          <div><span>HIDDEN NUMBER</span><strong>{round.target}</strong></div>
          <div><span>FINAL GUESS</span><strong>{finalGuess}</strong></div>
        </section>

        <div className="wavelength-path" aria-label="Your Wavelength path">
          <span>YOUR PATH</span>
          {guesses.map((value, index) => (
            <span className="wavelength-path__step" key={`${index}-${value}`}>
              {index > 0 && <em>→</em>}<b>{value}</b>
            </span>
          ))}
        </div>

        <section className="surface-card wavelength-reveal">
          <header className="section-heading">
            <div><p className="eyebrow">CLUE REVEAL</p><h2>How the scale moved</h2></div>
          </header>
          {round.clues.map((item, index) => (
            <article className="wavelength-reveal__row" key={item.id}>
              <b>{index + 1}</b>
              <span><small>{item.category}</small><strong>{item.text}</strong></span>
              <em>{item.rating}</em>
            </article>
          ))}
          <GameResultActions
            onChallenge={() => void challengeSomeone()}
            onReplay={replay}
            onAllGames={onExit}
            status={challengeStatus}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="wavelength-page page">
      {challengeFrom ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{challengeFrom} sent this exact hidden number.</strong>
          <small>Finish all four clues to unlock both results in Challenge Center.</small>
        </section>
      ) : null}
      <section className="wavelength-topline">
        <span>FIND THE HIDDEN NUMBER</span>
        <b>CLUE {clueIndex + 1} OF 4</b>
      </section>
      <div className="wavelength-progress" aria-label="Wavelength clue progress">
        {[0, 1, 2, 3].map((index) => (
          <i className={`${index < clueIndex ? "is-complete" : ""}${index === clueIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>

      <section className="wavelength-clue" aria-live="polite">
        <div><span>{clue.category}</span><b>CLUE {clueIndex + 1}</b></div>
        <h1>{clue.text}</h1>
        <p>Where does it land on Octagon HQ’s 1–100 UFC scale?</p>
      </section>

      <section className="wavelength-guess-panel">
        <div><span>{clueIndex === 3 ? "FINAL ANSWER" : "YOUR GUESS"}</span><strong>{guess}</strong></div>
        <input
          aria-label="Your Wavelength guess from 1 to 100"
          max="100"
          min="1"
          onChange={(event) => setGuess(clampWavelength(Number(event.target.value)))}
          step="1"
          type="range"
          value={guess}
        />
        <div className="wavelength-scale"><span>1 · BAD</span><span>50 · AVERAGE</span><span>100 · ELITE</span></div>
        <button className="primary-action" type="button" onClick={lockGuess}>
          {clueIndex === 3 ? "LOCK FINAL GUESS" : "LOCK GUESS & REVEAL NEXT CLUE"}
        </button>
      </section>

      <div className="wavelength-path">
        <span>YOUR PATH</span>
        {[0, 1, 2, 3].map((index) => (
          <span className="wavelength-path__step" key={index}>
            {index > 0 && <em>→</em>}<b>{guesses[index] ?? "—"}</b>
          </span>
        ))}
      </div>
      <p className="wavelength-rules">Each clue reacts to your last guess. Only your fourth guess determines your score.</p>
    </div>
  );
}
