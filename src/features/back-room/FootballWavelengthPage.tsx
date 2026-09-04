import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor } from "../play/lineupModel";
import {
  WAVELENGTH_OPINION_DISCLOSURE,
  clampWavelength,
  wavelengthDistanceCopy,
  wavelengthScore,
} from "../play/wavelengthEngine";
import {
  FOOTBALL_WAVELENGTH_GAME_ID,
  FOOTBALL_WAVELENGTH_TARGET_POLICY_VERSION,
  createFootballWavelengthRound,
  createFootballWavelengthRun,
  footballWavelengthClues,
  nextFootballWavelengthClue,
  type FootballWavelengthRound,
  type FootballWavelengthRun,
} from "./footballWavelengthModel";
import {
  footballWavelengthCategoryLabel,
  footballWavelengthCluePrompt,
} from "./footballWavelengthPresentation";
import {
  asChallengeJson,
  challengeRecord,
  challengeString,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "./footballChallengeRuntime";

function resolveChallengeRun(
  seed: string | null,
  challengeId: string,
  storedTarget?: number | null,
  storedOpeningClueId?: string | null,
): FootballWavelengthRun | null {
  if (!seed) return null;
  const generatedRound = createFootballWavelengthRound(seed);
  const storedOpening = storedOpeningClueId
    ? footballWavelengthClues.find((clue) => clue.id === storedOpeningClueId)
    : null;
  const initialRound = Number.isInteger(storedTarget) && storedOpening
    ? { target: clampWavelength(storedTarget!), clues: [storedOpening] }
    : generatedRound;
  return {
    seed,
    initialRound,
    identity: footballCuratedIdentity(
      FOOTBALL_WAVELENGTH_GAME_ID,
      challengeId,
      [`target:${initialRound.target}`, `clue:${initialRound.clues[0]!.id}`],
      "football-wavelength",
    ),
  };
}

export default function FootballWavelengthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("wavelength");
  const profileSetup = challengeRecord(profileMatch.challenge?.setup);
  const profileSeed = challengeString(profileSetup?.seed);
  const profileTarget = typeof profileSetup?.target === "number" ? profileSetup.target : null;
  const profileOpeningClueId = challengeString(profileSetup?.openingClueId);
  const querySeed = searchParams.get("seed");
  const sharedChallengeId = profileMatch.challenge?.code ?? `shared:${querySeed ?? "unknown"}`;
  const sharedRun = useMemo(() => (
    resolveChallengeRun(profileSeed, sharedChallengeId, profileTarget, profileOpeningClueId)
      ?? resolveChallengeRun(querySeed, sharedChallengeId)
  ), [profileOpeningClueId, profileSeed, profileTarget, querySeed, sharedChallengeId]);
  const [run, setRun] = useState<FootballWavelengthRun>(() => sharedRun ?? createFootballWavelengthRun());
  const [round, setRound] = useState<FootballWavelengthRound>(run.initialRound);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState(50);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState("");
  const clue = round.clues[clueIndex]!;
  const shared = run.identity.type === "curated";

  useEffect(() => {
    if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;
    reset(sharedRun);
  }, [run.identity.challengeId, sharedRun]);

  function reset(nextRun: FootballWavelengthRun) {
    setRun(nextRun);
    setRound(nextRun.initialRound);
    setClueIndex(0);
    setGuess(50);
    setGuesses([]);
    setComplete(false);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    reset(createFootballWavelengthRun());
  }

  function replay() {
    if (shared) reset(run);
    else startNew();
  }

  function resultPayload(nextGuesses: readonly number[]) {
    const finalGuess = nextGuesses[3]!;
    return {
      score: wavelengthScore(finalGuess, round.target),
      target: round.target,
      guesses: [...nextGuesses],
      clueIds: round.clues.map((item) => item.id),
    };
  }

  function lockGuess() {
    if (complete) return;
    const locked = clampWavelength(guess);
    const nextGuesses = [...guesses, locked];
    setGuesses(nextGuesses);

    if (clueIndex === 3) {
      const payload = resultPayload(nextGuesses);
      recordLineupCompletion(run.identity, payload);
      if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
        profileMatch.submitResult(asChallengeJson(payload));
      }
      setComplete(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const nextClue = nextFootballWavelengthClue(
      round,
      locked,
      clueIndex + 1,
      run.seed,
      guesses,
    );
    setRound((current) => ({ ...current, clues: [...current.clues, nextClue] }));
    setClueIndex((index) => index + 1);
  }

  async function challengeSomeone() {
    if (!complete) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "wavelength",
      gameVersion: "football-wavelength-v2",
      gameTitle: "Football Wavelength",
      summary: `Hidden number ${round.target} · four adaptive clues`,
      setup: asChallengeJson({
        seed: run.seed,
        target: round.target,
        openingClueId: run.initialRound.clues[0]!.id,
        targetPolicy: FOOTBALL_WAVELENGTH_TARGET_POLICY_VERSION,
      }),
      creatorResult: asChallengeJson(resultPayload(guesses)),
      shareTitle: "Football Wavelength Challenge",
      shareText: "I challenged you to the same hidden Football Wavelength number. Four adaptive clues. Only the final guess scores.",
      shareUrl: footballChallengeUrl("/football/wavelength", { seed: run.seed }),
    });
    setChallengeStatus(status);
  }

  if (profileMatch.code && !profileMatch.challenge) {
    return (
      <div className="page football-debate-page football-wavelength-page">
        <section className="football-wavelength-clue" aria-live="polite">
          <div className="football-wavelength-clue__head"><span>PROFILE CHALLENGE</span></div>
          <h1>Loading challenge…</h1>
          <p>Locking the exact round that was sent to you.</p>
        </section>
      </div>
    );
  }

  if (profileMatch.challenge && !profileSeed) {
    return (
      <div className="page football-debate-page football-wavelength-page">
        <section className="football-wavelength-clue" aria-live="polite">
          <div className="football-wavelength-clue__head"><span>PROFILE CHALLENGE</span></div>
          <h1>Challenge unavailable</h1>
          <p>This matchup does not contain a valid stored Football Wavelength round.</p>
        </section>
      </div>
    );
  }

  if (complete) {
    const finalGuess = guesses[3]!;
    const distance = Math.abs(finalGuess - round.target);
    const score = wavelengthScore(finalGuess, round.target);

    return (
      <div className="page football-debate-page football-wavelength-page">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent this exact Football Wavelength target.</strong>
            <small>Both four-guess paths reveal after you finish.</small>
          </section>
        ) : null}
        <section className="football-debate-result-hero">
          <p className="eyebrow">FOOTBALL WAVELENGTH · FINAL SCORE</p>
          <strong>{score}<small>/100</small></strong>
          <span>{wavelengthDistanceCopy(distance)}</span>
        </section>

        <section className="football-wavelength-final-numbers">
          <div><small>HIDDEN NUMBER</small><strong>{round.target}</strong></div>
          <div><small>FINAL GUESS</small><strong>{finalGuess}</strong></div>
          <div><small>YOUR PATH</small><strong>{guesses.join(" → ")}</strong></div>
        </section>

        <section className="football-wavelength-reveal">
          <header>
            <p className="eyebrow">CLUE REVEAL</p>
            <h2>How the scale moved.</h2>
          </header>
          <div>
            {round.clues.map((item, index) => (
              <article key={item.id}>
                <b>{index + 1}</b>
                <span>
                  <small>{footballWavelengthCategoryLabel(item.category)}</small>
                  <strong>{item.text}</strong>
                </span>
                <em>{item.rating}</em>
              </article>
            ))}
          </div>
          <p className="football-wavelength-rules">{WAVELENGTH_OPINION_DISCLOSURE}</p>
        </section>

        <GameResultActions
          onChallenge={() => void challengeSomeone()}
          onReplay={replay}
          onAllGames={() => navigate("/football")}
          replayLabel={replayLabelFor(run.identity.type)}
          status={challengeStatus}
        />
      </div>
    );
  }

  return (
    <div className="page football-debate-page football-wavelength-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Football Wavelength target.</strong>
          <small>Lock all four guesses to reveal the matchup.</small>
        </section>
      ) : null}
      <section className="football-wavelength-topline">
        <span>WAVELENGTH · {shared ? "FRIEND CHALLENGE" : "FIND THE HIDDEN NUMBER"}</span>
        <b>CLUE {clueIndex + 1} OF 4</b>
      </section>
      <p className="football-wavelength-rules">
        Use 4 football clues to find one hidden number from 1–100. Only your final guess scores.
      </p>

      <div className="football-wavelength-progress" aria-label="Football Wavelength clue progress">
        {[0, 1, 2, 3].map((index) => (
          <i className={`${index < clueIndex ? "is-complete" : ""}${index === clueIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>

      <section className="football-wavelength-clue" aria-live="polite">
        <div className="football-wavelength-clue__head">
          <span>{footballWavelengthCategoryLabel(clue.category)}</span>
          <b>CLUE {clueIndex + 1}</b>
        </div>
        <h1>{clue.text}</h1>
        <p>{footballWavelengthCluePrompt(clue.category)}</p>
      </section>

      <section className="football-wavelength-guess-panel">
        <div className="football-wavelength-guess-value">
          <small>{clueIndex === 3 ? "FINAL HIDDEN NUMBER GUESS" : "YOUR HIDDEN NUMBER GUESS"}</small>
          <strong>{guess}</strong>
        </div>
        <input
          aria-label="Football Wavelength guess from 1 to 100"
          type="range"
          min="1"
          max="100"
          step="1"
          value={guess}
          onChange={(event) => setGuess(clampWavelength(Number(event.target.value)))}
        />
        <div className="football-wavelength-scale"><span>1 · LOW</span><span>50 · MIDDLE</span><span>100 · HIGH</span></div>
        <button type="button" onClick={lockGuess}>
          {clueIndex === 3 ? "LOCK FINAL GUESS" : "LOCK GUESS & REVEAL NEXT CLUE"}
        </button>
      </section>

      <div className="football-wavelength-path">
        <small>YOUR PATH</small>
        <strong>{[0, 1, 2, 3].map((index) => guesses[index] ?? "—").join(" → ")}</strong>
      </div>
      <p className="football-wavelength-rules">Each clue reacts to your last guess. Only the fourth guess determines your score. {WAVELENGTH_OPINION_DISCLOSURE}</p>
    </div>
  );
}
