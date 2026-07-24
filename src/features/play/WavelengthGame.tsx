import { useMemo, useState } from "react";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { GameResultActions } from "./GameResultActions";
import {
  clampWavelength,
  wavelengthDistanceCopy,
  wavelengthScore,
  type WavelengthClue,
  type WavelengthRound,
} from "./wavelengthEngine";
import {
  createChallengeWavelengthRound,
  createWavelengthSeed,
  nextChallengeWavelengthClue,
  wavelengthChallengeUrl,
} from "./wavelengthChallenge";

const LAST_TARGET_KEY = "octagon-hq:wavelength-last-target:v2";

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

function record(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function storedClue(value: ChallengeJson | undefined): WavelengthClue | null {
  const row = record(value);
  return row
    && typeof row.id === "string"
    && typeof row.category === "string"
    && typeof row.text === "string"
    && typeof row.rating === "number"
    ? { id: row.id, category: row.category, text: row.text, rating: row.rating }
    : null;
}

function storedRound(value: ChallengeJson | undefined): WavelengthRound | null {
  const row = record(value);
  const clues = Array.isArray(row?.clues) ? row.clues.flatMap((item) => {
    const clue = storedClue(item);
    return clue ? [clue] : [];
  }) : [];
  return row && typeof row.target === "number" && clues.length
    ? { target: row.target, clues }
    : null;
}

function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

export default function WavelengthGame({
  challengeSeed,
  onExit,
}: {
  challengeSeed?: string;
  onExit: () => void;
}) {
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("wavelength");
  const profileSetup = record(profileMatch.challenge?.setup);
  const profileSeed = typeof profileSetup?.seed === "string" ? profileSetup.seed : undefined;
  const profileRound = storedRound(profileSetup?.round);
  const initialSeed = useMemo(() => profileSeed ?? challengeSeed ?? freshSeed(), [challengeSeed, profileSeed]);
  const initialRound = useMemo(() => {
    const nextRound = profileRound ?? createChallengeWavelengthRound(initialSeed);
    rememberTarget(nextRound.target);
    return nextRound;
  }, [initialSeed, profileRound]);
  const [round, setRound] = useState<WavelengthRound>(initialRound);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState(50);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState("");
  const clue = round.clues[clueIndex];

  function replay() {
    setRound(profileRound ?? createChallengeWavelengthRound(initialSeed));
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
      const score = wavelengthScore(locked, round.target);
      profileMatch.submitResult(asJson({
        score,
        guesses: nextGuesses,
        finalGuess: locked,
        distance: Math.abs(locked - round.target),
      }));
      setComplete(true);
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
    const score = wavelengthScore(finalGuess, round.target);
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "wavelength",
      gameVersion: "wavelength-v2",
      gameTitle: "Wavelength",
      summary: `Find hidden rating ${round.target} through four adaptive clues`,
      setup: asJson({ seed: initialSeed, round: initialRound, target: round.target }),
      creatorResult: asJson({
        score,
        guesses,
        finalGuess,
        distance: Math.abs(finalGuess - round.target),
      }),
      shareTitle: "Wavelength Challenge",
      shareText: "I challenged you to find the same hidden UFC rating in four adaptive clues. Can you beat my final score?",
      shareUrl: wavelengthChallengeUrl(initialSeed),
    });
    setChallengeStatus(status);
  }

  if (complete) {
    const finalGuess = guesses[3];
    const distance = Math.abs(finalGuess - round.target);
    const score = wavelengthScore(finalGuess, round.target);
    return (
      <div className="wavelength-page page">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent this hidden target.</strong>
            <small>Your full four-guess path is saved for the shared results.</small>
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
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this hidden target.</strong>
          <small>Your adaptive clues react only to your own guesses.</small>
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
