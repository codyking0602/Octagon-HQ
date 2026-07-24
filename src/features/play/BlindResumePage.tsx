import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  BLIND_RESUME_ROUNDS,
  blindResumeChallengeUrl,
  blindResumeStats,
  blindResumeTier,
  blindResumeWinner,
  createBlindResumeRounds,
  createBlindResumeSeed,
  type BlindResumePair,
} from "./blindResumeEngine";
import {
  clearBlindResumeSession,
  loadBlindResumeSession,
  saveBlindResumeSession,
  type StoredBlindResumeResult,
} from "./blindResumeSession";
import { GameResultActions } from "./GameResultActions";

interface RoundResult {
  roundIndex: number;
  pair: BlindResumePair;
  pickedId: string;
  winnerId: string;
  correct: boolean;
}

type BlindResumeRoundSet = ReturnType<typeof createBlindResumeRounds>;

function record(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

function storedRoundSet(value: ChallengeJson | undefined): BlindResumeRoundSet | null {
  const row = record(value);
  return row && Array.isArray(row.pairs) && row.pairs.length === BLIND_RESUME_ROUNDS
    ? row as unknown as BlindResumeRoundSet
    : null;
}

function rankCopy(pair: BlindResumePair, fighterId: string) {
  const fighter = pair.fighterA.id === fighterId ? pair.fighterA : pair.fighterB;
  return `${fighter.gender === "women" ? "Women’s" : "Men’s"} UFC GOAT #${fighter.model.rank}`;
}

function compactRankCopy(pair: BlindResumePair, fighterId: string) {
  const fighter = pair.fighterA.id === fighterId ? pair.fighterA : pair.fighterB;
  return `GOAT #${fighter.model.rank}`;
}

function hydrateResult(stored: StoredBlindResumeResult, pairs: readonly BlindResumePair[]): RoundResult | null {
  const pair = pairs[stored.roundIndex];
  if (!pair) return null;
  return { ...stored, pair };
}

function storeResult(result: RoundResult): StoredBlindResumeResult {
  return {
    roundIndex: result.roundIndex,
    pickedId: result.pickedId,
    winnerId: result.winnerId,
    correct: result.correct,
  };
}

function challengeRounds(roundSet: BlindResumeRoundSet) {
  return roundSet.pairs.map((pair, roundIndex) => ({
    roundIndex,
    fighterA: { id: pair.fighterA.id, name: pair.fighterA.name },
    fighterB: { id: pair.fighterB.id, name: pair.fighterB.name },
    winnerId: blindResumeWinner(pair).id,
  }));
}

export default function BlindResumePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("blind-resume");
  const profileSetup = record(profileMatch.challenge?.setup);
  const profileSeed = typeof profileSetup?.seed === "string" ? profileSetup.seed : "";
  const profileRoundSet = storedRoundSet(profileSetup?.roundSet);
  const generatedSeed = useRef(createBlindResumeSeed());
  const challengeSeed = searchParams.get("challenge") || "";
  const runSeed = searchParams.get("run") || "";
  const initialSeed = profileSeed || challengeSeed || runSeed || generatedSeed.current;
  const sessionId = profileMatch.challenge
    ? `match:${profileMatch.challenge.code}`
    : `${challengeSeed ? "challenge" : "run"}:${initialSeed}`;
  const returnPath = `/play/blind-resume?${searchParams.toString()}`;
  const roundSet = useMemo(() => profileRoundSet ?? createBlindResumeRounds(initialSeed), [initialSeed, profileRoundSet]);
  const restored = useMemo(() => loadBlindResumeSession(sessionId), [sessionId]);
  const restoredResults = useMemo(
    () => (restored?.results ?? []).map((result) => hydrateResult(result, roundSet.pairs)).filter((result): result is RoundResult => Boolean(result)),
    [restored, roundSet.pairs],
  );
  const restoredCurrent = useMemo(
    () => restored?.currentResult ? hydrateResult(restored.currentResult, roundSet.pairs) : null,
    [restored, roundSet.pairs],
  );

  const [roundIndex, setRoundIndex] = useState(restored?.roundIndex ?? 0);
  const [results, setResults] = useState<RoundResult[]>(restoredResults);
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(restoredCurrent);
  const [challengeStatus, setChallengeStatus] = useState("");
  const complete = results.length === BLIND_RESUME_ROUNDS;
  const score = results.filter((result) => result.correct).length;
  const pair = roundSet.pairs[roundIndex];

  useEffect(() => {
    if (!profileMatch.challenge && !challengeSeed && !runSeed) setSearchParams({ run: initialSeed }, { replace: true });
  }, [challengeSeed, initialSeed, profileMatch.challenge, runSeed, setSearchParams]);

  useEffect(() => {
    saveBlindResumeSession(sessionId, {
      roundIndex,
      results: results.map(storeResult),
      currentResult: currentResult ? storeResult(currentResult) : null,
    });
  }, [currentResult, results, roundIndex, sessionId]);

  useEffect(() => {
    if (!complete || !profileMatch.isRecipient || profileMatch.challenge?.responderResult !== null) return;
    profileMatch.submitResult(asJson({
      score,
      picks: results.map(storeResult),
    }));
  }, [complete, profileMatch, results, score]);

  function pick(fighterId: string) {
    if (currentResult || complete || !pair) return;
    const winner = blindResumeWinner(pair);
    setCurrentResult({
      roundIndex,
      pair,
      pickedId: fighterId,
      winnerId: winner.id,
      correct: fighterId === winner.id,
    });
  }

  function nextRound() {
    if (!currentResult) return;
    const nextResults = [...results, currentResult];
    setResults(nextResults);
    setCurrentResult(null);
    if (nextResults.length < BLIND_RESUME_ROUNDS) setRoundIndex((index) => index + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function replay() {
    clearBlindResumeSession(sessionId);
    setRoundIndex(0);
    setResults([]);
    setCurrentResult(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function challengeSomeone() {
    if (!complete) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "blind-resume",
      gameVersion: "blind-resume-v2",
      gameTitle: "Blind Resume",
      summary: "Five hidden UFC resume matchups",
      setup: asJson({ seed: initialSeed, roundSet, rounds: challengeRounds(roundSet) }),
      creatorResult: asJson({ score, picks: results.map(storeResult) }),
      shareTitle: "Blind Resume Challenge",
      shareText: `I challenged you to the same five hidden UFC resume matchups. Beat my ${score}/${BLIND_RESUME_ROUNDS}.`,
      shareUrl: blindResumeChallengeUrl(initialSeed),
    });
    setChallengeStatus(status);
  }

  function openIntelligence(result: RoundResult) {
    saveBlindResumeSession(sessionId, {
      roundIndex,
      results: results.map(storeResult),
      currentResult: storeResult(result),
    });
    const params = new URLSearchParams({
      mode: "compare",
      fighter: result.pair.fighterA.id,
      opponent: result.pair.fighterB.id,
      returnTo: returnPath,
      returnLabel: "Back to Blind Resume",
    });
    navigate(`/intelligence?${params.toString()}`);
  }

  if (complete) {
    const biggestMiss = [...results]
      .filter((result) => !result.correct)
      .sort((left, right) => {
        const leftGap = Math.abs(left.pair.fighterA.model.rank - left.pair.fighterB.model.rank);
        const rightGap = Math.abs(right.pair.fighterA.model.rank - right.pair.fighterB.model.rank);
        return rightGap - leftGap;
      })[0];
    return (
      <div className="page blind-resume-page blind-resume-page--final">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent these exact five matchups.</strong>
            <small>Every pick is saved for the shared round-by-round results.</small>
          </section>
        ) : null}
        <section className="blind-resume-final">
          <div><p className="eyebrow">FIVE-ROUND RESULTS</p><strong>{score}/{BLIND_RESUME_ROUNDS}</strong><h1>{blindResumeTier(score)}</h1></div>
          <p>{biggestMiss ? `Biggest miss: ${biggestMiss.pair.fighterA.id === biggestMiss.pickedId ? biggestMiss.pair.fighterA.name : biggestMiss.pair.fighterB.name} over ${biggestMiss.pair.fighterA.id === biggestMiss.winnerId ? biggestMiss.pair.fighterA.name : biggestMiss.pair.fighterB.name}.` : "Perfect card. You matched the model on every close call."}</p>
        </section>
        <section className="blind-resume-recap" aria-label="Five-round Blind Resume recap">
          {results.map((result, index) => (
            <article className="blind-resume-recap__round" key={result.pair.id}>
              <header><span>R{index + 1}</span><b className={result.correct ? "is-correct" : "is-miss"}>{result.correct ? "CORRECT" : "MISS"}</b></header>
              <div>
                {[result.pair.fighterA, result.pair.fighterB].map((fighter) => (
                  <section className={fighter.id === result.winnerId ? "is-winner" : ""} key={fighter.id}>
                    <FighterPhoto className="blind-resume-recap__photo" name={fighter.name} src={fighter.thumbUrl} />
                    <span><strong>{fighter.name}</strong><small>{compactRankCopy(result.pair, fighter.id)}</small></span>
                    <em>{fighter.id === result.winnerId ? "WINNER" : fighter.id === result.pickedId ? "PICK" : ""}</em>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </section>
        <GameResultActions
          onChallenge={() => void challengeSomeone()}
          onReplay={replay}
          onAllGames={() => navigate("/play")}
          status={challengeStatus}
        />
      </div>
    );
  }

  const stats = pair ? blindResumeStats(pair) : [];
  if (currentResult) {
    const winner = currentResult.pair.fighterA.id === currentResult.winnerId ? currentResult.pair.fighterA : currentResult.pair.fighterB;
    const loser = currentResult.pair.fighterA.id === currentResult.winnerId ? currentResult.pair.fighterB : currentResult.pair.fighterA;
    return (
      <div className="page blind-resume-page">
        {profileMatch.creator ? (
          <section className="challenge-game-banner"><span>PROFILE CHALLENGE</span><strong>{profileMatch.creator.displayName} sent this five-round card.</strong><small>Your picks remain hidden until the card is complete.</small></section>
        ) : null}
        <section className={`blind-resume-verdict ${currentResult.correct ? "is-correct" : "is-miss"}`}>
          <p className="eyebrow">{currentResult.correct ? "YOU PICKED THE MODEL WINNER" : "THE MODEL DISAGREES"}</p>
          <h1>{winner.name} ranks higher</h1>
          <p>{winner.name} is #{winner.model.rank} on the {winner.gender === "women" ? "women’s" : "men’s"} UFC board. {loser.name} is #{loser.model.rank}.</p>
        </section>
        <section className="blind-resume-reveal-grid">
          {[currentResult.pair.fighterA, currentResult.pair.fighterB].map((fighter, index) => (
            <article className={`${fighter.id === currentResult.winnerId ? "is-winner" : ""}${fighter.id === currentResult.pickedId ? " is-picked" : ""}`} key={fighter.id}>
              <FighterPhoto className="blind-resume-reveal-photo" name={fighter.name} src={fighter.profileUrl || fighter.thumbUrl} />
              <span>FIGHTER {index === 0 ? "A" : "B"}</span>
              <strong>{fighter.name}</strong>
              <small>{rankCopy(currentResult.pair, fighter.id)}</small>
              {fighter.id === currentResult.pickedId ? <em>YOUR PICK</em> : null}
            </article>
          ))}
        </section>
        <button className="blind-resume-intelligence" type="button" onClick={() => openIntelligence(currentResult)}>TAKE MATCHUP TO INTELLIGENCE</button>
        <button className="primary-action" type="button" onClick={nextRound}>{roundIndex === BLIND_RESUME_ROUNDS - 1 ? "SEE FINAL SCORE" : "NEXT ROUND"}</button>
      </div>
    );
  }

  return (
    <div className="page blind-resume-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner"><span>PROFILE CHALLENGE</span><strong>{profileMatch.creator.displayName} sent this five-round card.</strong><small>Finish all five to unlock both pick sheets.</small></section>
      ) : null}
      <section className="blind-resume-scoreboard">
        <div><p className="eyebrow">BLIND RESUME</p><h1>Which UFC career ranks higher?</h1></div>
        <aside><span>ROUND {roundIndex + 1} OF {BLIND_RESUME_ROUNDS}</span><b>SCORE {score}-{results.length - score}</b></aside>
      </section>
      <section className="blind-resume-card">
        <header><div><span>FIGHTER A</span><strong>?</strong></div><b>RESUME</b><div><span>FIGHTER B</span><strong>?</strong></div></header>
        <div className="blind-resume-stats">
          {stats.map((stat) => <div key={stat.label}><strong>{stat.valueA}</strong><span>{stat.label}</span><strong>{stat.valueB}</strong></div>)}
        </div>
        <p className="blind-resume-apex-note">Apex rating measures the fighter’s best one-night or short-stretch UFC peak.</p>
        <div className="blind-resume-picks">
          <button type="button" onClick={() => pair && pick(pair.fighterA.id)}>PICK A</button>
          <button type="button" onClick={() => pair && pick(pair.fighterB.id)}>PICK B</button>
        </div>
      </section>
    </div>
  );
}
