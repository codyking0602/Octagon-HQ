import { useMemo, useState } from "react";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { GameResultActions } from "./GameResultActions";
import {
  curatedLineupIdentity,
  recordLineupCompletion,
  rememberLineup,
  replayLabelFor,
  selectReplayLineup,
  type PlayLineupHistory,
  type PlayLineupIdentity,
} from "./lineupModel";
import {
  clampWavelength,
  wavelengthDistanceCopy,
  wavelengthScore,
  wavelengthClues,
  wavelengthSequenceKey,
  type WavelengthClue,
  type WavelengthRecentHistory,
  type WavelengthRound,
} from "./wavelengthEngine";
import {
  createChallengeWavelengthRound,
  nextChallengeWavelengthClue,
  wavelengthChallengeUrl,
} from "./wavelengthChallenge";

interface WavelengthRun {
  seed: string;
  initialRound: WavelengthRound;
  identity: PlayLineupIdentity;
  recent?: WavelengthRecentHistory;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && !Array.isArray(value) && typeof value === "object"
    ? value as Record<string, unknown>
    : null;
}

function storedClue(value: ChallengeJson | undefined): WavelengthClue | null {
  const row = record(value);
  if (!row
    || typeof row.id !== "string"
    || typeof row.category !== "string"
    || typeof row.text !== "string"
    || typeof row.rating !== "number"
  ) return null;
  const canonical = wavelengthClues.find((clue) => clue.category === row.category);
  return canonical ? { id: row.id, category: canonical.category, text: row.text, rating: row.rating } : null;
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

function targetId(round: WavelengthRound) {
  return `target:${round.target}`;
}

function wavelengthLineupItems(round: WavelengthRound) {
  const opening = round.clues[0];
  if (!opening) throw new Error("Wavelength round is missing its opening clue.");
  return [targetId(round), `clue:${opening.id}`, `category:${opening.category}`];
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function recentWavelengthHistory(history: PlayLineupHistory): WavelengthRecentHistory {
  const targets: number[] = [];
  const clueIds: string[] = [];
  const clueSequenceKeys: string[] = [];

  for (const entry of history.entries) {
    for (const itemId of entry.itemIds) {
      if (itemId.startsWith("target:")) {
        const target = Number(itemId.slice("target:".length));
        if (Number.isInteger(target)) targets.push(target);
      } else if (itemId.startsWith("clue:")) {
        clueIds.push(itemId.slice("clue:".length));
      }
    }

    const result = record(entry.result);
    const wavelengthHistory = record(result?.wavelengthHistory);
    if (!wavelengthHistory) continue;
    if (typeof wavelengthHistory.target === "number" && Number.isInteger(wavelengthHistory.target)) {
      targets.push(wavelengthHistory.target);
    }
    if (Array.isArray(wavelengthHistory.clueIds)) {
      clueIds.push(...wavelengthHistory.clueIds.filter((id): id is string => typeof id === "string"));
    }
    if (typeof wavelengthHistory.sequenceKey === "string") {
      clueSequenceKeys.push(wavelengthHistory.sequenceKey);
    }
  }

  const canonicalClueIds = unique(clueIds).filter((id) => wavelengthClues.some((clue) => clue.id === id));
  return {
    targets: unique(targets),
    clueIds: canonicalClueIds,
    categories: unique(canonicalClueIds.flatMap((id) => {
      const clue = wavelengthClues.find((candidate) => candidate.id === id);
      return clue ? [clue.category] : [];
    })),
    clueSequenceKeys: unique(clueSequenceKeys),
  };
}

function casualWavelengthRun(): WavelengthRun {
  const selected = selectReplayLineup({
    gameId: "wavelength",
    lineupSize: 3,
    attempts: 10,
    build: (seed, _attempt, history) => {
      const initialRound = createChallengeWavelengthRound(seed);
      return {
        value: { seed, initialRound, recent: recentWavelengthHistory(history) },
        itemIds: wavelengthLineupItems(initialRound),
      };
    },
  });
  return { ...selected.value, identity: selected.identity };
}

function curatedWavelengthRun(seed: string, initialRound: WavelengthRound, challengeId: string): WavelengthRun {
  const identity = curatedLineupIdentity("wavelength", challengeId, [targetId(initialRound)]);
  rememberLineup(identity, [targetId(initialRound)]);
  return { seed, initialRound, identity };
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
  const profileRound = storedRound(profileSetup?.round as ChallengeJson | undefined);
  const curatedSeed = profileSeed ?? challengeSeed;
  const curatedRound = useMemo(
    () => curatedSeed ? profileRound ?? createChallengeWavelengthRound(curatedSeed) : null,
    [curatedSeed, profileRound],
  );
  const [run, setRun] = useState<WavelengthRun>(() => {
    if (curatedSeed && curatedRound) {
      return curatedWavelengthRun(
        curatedSeed,
        curatedRound,
        profileMatch.challenge?.code ?? `shared:${curatedSeed}`,
      );
    }
    return casualWavelengthRun();
  });
  const [round, setRound] = useState<WavelengthRound>(run.initialRound);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState(50);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState("");
  const clue = round.clues[clueIndex];

  function resetRound(nextRun: WavelengthRun) {
    setRun(nextRun);
    setRound(nextRun.initialRound);
    setClueIndex(0);
    setGuess(50);
    setGuesses([]);
    setComplete(false);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function replay() {
    resetRound(run.identity.type === "replayable" ? casualWavelengthRun() : run);
  }

  function lockGuess() {
    if (complete) return;
    const locked = clampWavelength(guess);
    const nextGuesses = [...guesses, locked];
    setGuesses(nextGuesses);
    if (clueIndex === 3) {
      const score = wavelengthScore(locked, round.target);
      const result = {
        score,
        guesses: nextGuesses,
        finalGuess: locked,
        distance: Math.abs(locked - round.target),
      };
      recordLineupCompletion(run.identity, {
        ...result,
        wavelengthHistory: {
          target: round.target,
          clueIds: round.clues.map((item) => item.id),
          sequenceKey: wavelengthSequenceKey(round),
        },
      });
      if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
        profileMatch.submitResult(asJson(result));
      }
      setComplete(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const nextClue = nextChallengeWavelengthClue(
      round,
      locked,
      clueIndex + 1,
      run.seed,
      guesses,
      run.recent,
    );
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
      gameVersion: "wavelength-v3",
      gameTitle: "Wavelength",
      summary: `Find hidden rating ${round.target} through four adaptive clues`,
      setup: asJson({ seed: run.seed, round: run.initialRound, target: round.target }),
      creatorResult: asJson({
        score,
        guesses,
        finalGuess,
        distance: Math.abs(finalGuess - round.target),
      }),
      shareTitle: "Wavelength Challenge",
      shareText: "I challenged you to find the same hidden UFC rating in four adaptive clues. Can you beat my final score?",
      shareUrl: wavelengthChallengeUrl(run.seed),
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
            replayLabel={replayLabelFor(run.identity.type)}
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
        <span>{run.identity.type === "curated" ? "CURATED CHALLENGE" : "REPLAYABLE GAME"}</span>
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
