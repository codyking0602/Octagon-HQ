import { useEffect, useMemo, useState } from "react";
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
  type BlindResumePair,
  type BlindResumeRoundSet,
} from "./blindResumeEngine";
import {
  clearBlindResumeSession,
  loadBlindResumeSession,
  saveBlindResumeSession,
  type BlindResumeRevealCount,
  type StoredBlindResumeResult,
} from "./blindResumeSession";
import {
  BLIND_RESUME_V3_GAME_VERSION,
  blindResumeV3ChallengeUrl,
  blindResumeV3FirstRevealCount,
  blindResumeV3NextRevealCount,
  blindResumeV3RoundPoints,
  createBlindResumeV3Card,
  storedBlindResumeV3Card,
  type BlindResumeV3Card,
} from "./blindResumeV3";
import { GameResultActions } from "./GameResultActions";
import {
  curatedLineupIdentity,
  recordLineupCompletion,
  rememberLineup,
  replayLabelFor,
  replayLineupIdentity,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "./lineupModel";
import { rankedPlayFighters } from "./playFighterPool";

type BlindResumeVersion = "v2" | "v3";

interface RoundResult {
  roundIndex: number;
  pair: BlindResumePair;
  pickedId: string;
  winnerId: string;
  correct: boolean;
  revealedCount?: BlindResumeRevealCount;
  pointsAwarded?: number;
}

interface BlindResumeRun {
  version: BlindResumeVersion;
  roundSet: BlindResumeRoundSet;
  identity: PlayLineupIdentity;
  v3Card: BlindResumeV3Card | null;
}

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

function roundSetIds(roundSet: BlindResumeRoundSet) {
  return roundSet.pairs.flatMap((pair) => [pair.fighterA.id, pair.fighterB.id]);
}

function asRevealCount(value: number): BlindResumeRevealCount {
  if (value === 2 || value === 4 || value === 6 || value === 8) return value;
  throw new Error(`Unsupported Blind Resume V3 reveal count ${value}.`);
}

function v3OpeningReveal(card: BlindResumeV3Card) {
  return asRevealCount(blindResumeV3FirstRevealCount(card));
}

function casualBlindResumeRun(seed?: string): BlindResumeRun {
  if (seed) {
    const card = createBlindResumeV3Card(seed);
    const ids = roundSetIds(card.roundSet);
    const identity = replayLineupIdentity("blind-resume", seed);
    rememberLineup(identity, ids, ids);
    return { version: "v3", roundSet: card.roundSet, identity, v3Card: card };
  }

  const validIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));
  const selected = selectReplayLineup({
    gameId: "blind-resume",
    lineupSize: BLIND_RESUME_ROUNDS * 2,
    attempts: 12,
    validItemIds: validIds,
    validFighterIds: validIds,
    build: (nextSeed) => {
      const card = createBlindResumeV3Card(nextSeed);
      const ids = roundSetIds(card.roundSet);
      return { value: card, itemIds: ids, fighterIds: ids };
    },
  });
  return {
    version: "v3",
    roundSet: selected.value.roundSet,
    identity: selected.identity,
    v3Card: selected.value,
  };
}

function curatedV3BlindResumeRun(
  seed: string,
  card: BlindResumeV3Card,
  challengeId: string,
): BlindResumeRun {
  const ids = roundSetIds(card.roundSet);
  const identity = curatedLineupIdentity("blind-resume", challengeId, ids);
  rememberLineup(identity, ids, ids);
  return {
    version: "v3",
    roundSet: { ...card.roundSet, seed },
    identity,
    v3Card: { ...card, seed, roundSet: { ...card.roundSet, seed } },
  };
}

function curatedV2BlindResumeRun(
  seed: string,
  roundSet: BlindResumeRoundSet,
  challengeId: string,
): BlindResumeRun {
  const ids = roundSetIds(roundSet);
  const identity = curatedLineupIdentity("blind-resume", challengeId, ids);
  rememberLineup(identity, ids, ids);
  return { version: "v2", roundSet: { ...roundSet, seed }, identity, v3Card: null };
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
    revealedCount: result.revealedCount,
    pointsAwarded: result.pointsAwarded,
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
  const profileV3Card = storedBlindResumeV3Card(profileSetup?.v3Card);
  const profileIsV3 = profileMatch.challenge?.gameVersion === BLIND_RESUME_V3_GAME_VERSION;
  const challengeSeed = searchParams.get("challenge") || "";
  const directChallengeIsV3 = searchParams.get("v") === "3";
  const runSeed = searchParams.get("run") || "";
  const [run, setRun] = useState<BlindResumeRun>(() => {
    if (profileSeed) {
      if (profileIsV3) {
        const card = profileV3Card ?? createBlindResumeV3Card(profileSeed);
        return curatedV3BlindResumeRun(profileSeed, card, profileMatch.challenge?.code ?? `profile:${profileSeed}`);
      }
      const roundSet = profileRoundSet ?? createBlindResumeRounds(profileSeed);
      return curatedV2BlindResumeRun(profileSeed, roundSet, profileMatch.challenge?.code ?? `profile:${profileSeed}`);
    }
    if (challengeSeed) {
      if (directChallengeIsV3) {
        return curatedV3BlindResumeRun(
          challengeSeed,
          createBlindResumeV3Card(challengeSeed),
          `shared:v3:${challengeSeed}`,
        );
      }
      return curatedV2BlindResumeRun(
        challengeSeed,
        createBlindResumeRounds(challengeSeed),
        `shared:${challengeSeed}`,
      );
    }
    return casualBlindResumeRun(runSeed || undefined);
  });
  const roundSet = run.roundSet;
  const sessionId = run.version === "v3" ? `v3:${run.identity.challengeId}` : run.identity.challengeId;
  const returnPath = run.identity.type === "replayable"
    ? `/play/blind-resume?run=${encodeURIComponent(roundSet.seed)}`
    : `/play/blind-resume?${searchParams.toString()}`;
  const restored = useMemo(() => loadBlindResumeSession(sessionId), [sessionId]);
  const restoredResults = useMemo(
    () => (restored?.results ?? []).map((result) => hydrateResult(result, roundSet.pairs)).filter((result): result is RoundResult => Boolean(result)),
    [restored, roundSet.pairs],
  );
  const restoredCurrent = useMemo(
    () => restored?.currentResult ? hydrateResult(restored.currentResult, roundSet.pairs) : null,
    [restored, roundSet.pairs],
  );
  const openingReveal = run.v3Card ? v3OpeningReveal(run.v3Card) : 8;

  const [roundIndex, setRoundIndex] = useState(restored?.roundIndex ?? 0);
  const [results, setResults] = useState<RoundResult[]>(restoredResults);
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(restoredCurrent);
  const [revealedCount, setRevealedCount] = useState<BlindResumeRevealCount>(
    run.version === "v3" ? restored?.revealedCount ?? openingReveal : 8,
  );
  const [challengeStatus, setChallengeStatus] = useState("");
  const complete = results.length === BLIND_RESUME_ROUNDS;
  const correctCount = results.filter((result) => result.correct).length;
  const lossCount = results.length - correctCount;
  const pointsScore = run.version === "v3"
    ? results.reduce((sum, result) => sum + (result.pointsAwarded ?? 0), 0)
    : correctCount;
  const pair = roundSet.pairs[roundIndex];

  useEffect(() => {
    if (run.identity.type !== "replayable") return;
    if (searchParams.get("run") !== roundSet.seed) {
      setSearchParams({ run: roundSet.seed }, { replace: true });
    }
  }, [roundSet.seed, run.identity.type, searchParams, setSearchParams]);

  useEffect(() => {
    saveBlindResumeSession(sessionId, {
      roundIndex,
      results: results.map(storeResult),
      currentResult: currentResult ? storeResult(currentResult) : null,
      revealedCount: run.version === "v3" ? revealedCount : undefined,
    });
  }, [currentResult, results, revealedCount, roundIndex, run.version, sessionId]);

  useEffect(() => {
    if (!complete) return;
    const result = run.version === "v3"
      ? {
          version: BLIND_RESUME_V3_GAME_VERSION,
          score: pointsScore,
          record: { wins: correctCount, losses: lossCount },
          picks: results.map(storeResult),
        }
      : { score: correctCount, picks: results.map(storeResult) };
    recordLineupCompletion(run.identity, result);
    if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
      profileMatch.submitResult(asJson(result));
    }
  }, [complete, correctCount, lossCount, pointsScore, profileMatch, results, run.identity, run.version]);

  function pick(fighterId: string) {
    if (currentResult || complete || !pair) return;
    const winner = blindResumeWinner(pair);
    const correct = fighterId === winner.id;
    setCurrentResult({
      roundIndex,
      pair,
      pickedId: fighterId,
      winnerId: winner.id,
      correct,
      revealedCount: run.version === "v3" ? revealedCount : undefined,
      pointsAwarded: run.version === "v3" ? blindResumeV3RoundPoints(revealedCount, correct) : undefined,
    });
  }

  function nextRound() {
    if (!currentResult) return;
    const nextResults = [...results, currentResult];
    setResults(nextResults);
    setCurrentResult(null);
    if (nextResults.length < BLIND_RESUME_ROUNDS) {
      setRoundIndex((index) => index + 1);
      if (run.v3Card) setRevealedCount(v3OpeningReveal(run.v3Card));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function revealMore() {
    if (!run.v3Card || currentResult) return;
    const next = blindResumeV3NextRevealCount(run.v3Card, revealedCount);
    if (next !== null) setRevealedCount(asRevealCount(next));
  }

  function resetRun(nextRun: BlindResumeRun) {
    clearBlindResumeSession(sessionId);
    setRun(nextRun);
    setRoundIndex(0);
    setResults([]);
    setCurrentResult(null);
    setRevealedCount(nextRun.v3Card ? v3OpeningReveal(nextRun.v3Card) : 8);
    setChallengeStatus("");
    if (nextRun.identity.type === "replayable") {
      setSearchParams({ run: nextRun.roundSet.seed }, { replace: true });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function replay() {
    resetRun(run.identity.type === "replayable" ? casualBlindResumeRun() : run);
  }

  async function challengeSomeone() {
    if (!complete) return;
    setChallengeStatus("");
    const recordCopy = `${correctCount}-${lossCount}`;
    const v3 = run.version === "v3" && run.v3Card;
    const status = await beginChallenge({
      gameId: "blind-resume",
      gameVersion: v3 ? BLIND_RESUME_V3_GAME_VERSION : "blind-resume-v2",
      gameTitle: "Blind Resume",
      summary: v3 ? "Five staged UFC résumé matchups" : "Five hidden UFC resume matchups",
      setup: asJson(v3
        ? { seed: roundSet.seed, roundSet, v3Card: run.v3Card, rounds: challengeRounds(roundSet) }
        : { seed: roundSet.seed, roundSet, rounds: challengeRounds(roundSet) }),
      creatorResult: asJson(v3
        ? {
            version: BLIND_RESUME_V3_GAME_VERSION,
            score: pointsScore,
            record: { wins: correctCount, losses: lossCount },
            picks: results.map(storeResult),
          }
        : { score: correctCount, picks: results.map(storeResult) }),
      shareTitle: "Blind Resume Challenge",
      shareText: v3
        ? `I scored ${pointsScore}/100 with a ${recordCopy} record in Blind Resume. Beat it on the exact same five matchups.`
        : `I challenged you to the same five hidden UFC resume matchups. Beat my ${correctCount}/${BLIND_RESUME_ROUNDS}.`,
      shareUrl: v3 ? blindResumeV3ChallengeUrl(roundSet.seed) : blindResumeChallengeUrl(roundSet.seed),
    });
    setChallengeStatus(status);
  }

  function openIntelligence(result: RoundResult) {
    saveBlindResumeSession(sessionId, {
      roundIndex,
      results: results.map(storeResult),
      currentResult: storeResult(result),
      revealedCount: run.version === "v3" ? revealedCount : undefined,
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
    const missCopy = biggestMiss
      ? `Biggest miss: ${biggestMiss.pair.fighterA.id === biggestMiss.pickedId ? biggestMiss.pair.fighterA.name : biggestMiss.pair.fighterB.name} over ${biggestMiss.pair.fighterA.id === biggestMiss.winnerId ? biggestMiss.pair.fighterA.name : biggestMiss.pair.fighterB.name}.`
      : "Perfect card. You matched the model on every close call.";
    return (
      <div className="page blind-resume-page blind-resume-page--final" data-version={run.version}>
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent these exact five matchups.</strong>
            <small>Every pick is saved for the shared round-by-round results.</small>
          </section>
        ) : null}
        <section className="blind-resume-final">
          <div>
            <p className="eyebrow">FIVE-ROUND RESULTS</p>
            <strong>{run.version === "v3" ? `${pointsScore}/100` : `${correctCount}/${BLIND_RESUME_ROUNDS}`}</strong>
            <h1>{blindResumeTier(correctCount)}</h1>
          </div>
          <p>{run.version === "v3" ? `${correctCount}-${lossCount} record · ${pointsScore} points. ${missCopy}` : missCopy}</p>
        </section>
        <section className="blind-resume-recap" aria-label="Five-round Blind Resume recap">
          {results.map((result, index) => (
            <article className="blind-resume-recap__round" key={result.pair.id}>
              <header>
                <span>R{index + 1}</span>
                <b className={result.correct ? "is-correct" : "is-miss"}>
                  {result.correct ? "CORRECT" : "MISS"}{run.version === "v3" ? ` · +${result.pointsAwarded ?? 0}` : ""}
                </b>
              </header>
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
          replayLabel={replayLabelFor(run.identity.type)}
          status={challengeStatus}
        />
      </div>
    );
  }

  const stats = run.version === "v3"
    ? run.v3Card?.statsByRound[roundIndex] ?? []
    : pair ? blindResumeStats(pair) : [];
  if (currentResult) {
    const winner = currentResult.pair.fighterA.id === currentResult.winnerId ? currentResult.pair.fighterA : currentResult.pair.fighterB;
    const loser = currentResult.pair.fighterA.id === currentResult.winnerId ? currentResult.pair.fighterB : currentResult.pair.fighterA;
    return (
      <div className="page blind-resume-page" data-version={run.version}>
        {profileMatch.creator ? (
          <section className="challenge-game-banner"><span>PROFILE CHALLENGE</span><strong>{profileMatch.creator.displayName} sent this five-round card.</strong><small>Your picks remain hidden until the card is complete.</small></section>
        ) : null}
        <section className={`blind-resume-verdict ${currentResult.correct ? "is-correct" : "is-miss"}`}>
          <p className="eyebrow">{currentResult.correct ? "YOU PICKED THE MODEL WINNER" : "THE MODEL DISAGREES"}</p>
          <h1>{winner.name} ranks higher</h1>
          <p>{winner.name} is #{winner.model.rank} on the {winner.gender === "women" ? "women’s" : "men’s"} UFC board. {loser.name} is #{loser.model.rank}.</p>
          {run.version === "v3" ? <strong>+{currentResult.pointsAwarded ?? 0} POINTS</strong> : null}
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

  const nextReveal = run.v3Card ? blindResumeV3NextRevealCount(run.v3Card, revealedCount) : null;
  return (
    <div className="page blind-resume-page" data-version={run.version}>
      {profileMatch.creator ? (
        <section className="challenge-game-banner"><span>PROFILE CHALLENGE</span><strong>{profileMatch.creator.displayName} sent this five-round card.</strong><small>Finish all five to unlock both pick sheets.</small></section>
      ) : null}
      <section className="blind-resume-scoreboard">
        <div><p className="eyebrow">{run.identity.type === "curated" ? "CURATED CHALLENGE" : "REPLAYABLE GAME"}</p><h1>Which UFC career ranks higher?</h1></div>
        <aside>
          <span>ROUND {roundIndex + 1} OF {BLIND_RESUME_ROUNDS}</span>
          <b>{run.version === "v3" ? `${pointsScore} PTS · ${correctCount}-${lossCount}` : `SCORE ${correctCount}-${lossCount}`}</b>
        </aside>
      </section>
      <section className="blind-resume-card">
        <header><div><span>FIGHTER A</span><strong>?</strong></div><b>RESUME</b><div><span>FIGHTER B</span><strong>?</strong></div></header>
        <div className="blind-resume-stats">
          {stats.map((stat, index) => {
            const revealed = run.version === "v2" || index < revealedCount;
            return (
              <div key={`${stat.label}-${index}`}>
                <strong>{revealed ? stat.valueA : "•••"}</strong>
                <span>{stat.label}</span>
                <strong>{revealed ? stat.valueB : "•••"}</strong>
              </div>
            );
          })}
        </div>
        {run.version === "v3" ? (
          <p className="blind-resume-apex-note">
            {revealedCount} OF 8 STATS SHOWN · LOCK NOW: CORRECT +{blindResumeV3RoundPoints(revealedCount, true)} · MISS +{blindResumeV3RoundPoints(revealedCount, false)}
          </p>
        ) : (
          <p className="blind-resume-apex-note">Apex rating measures the fighter’s best one-night or short-stretch UFC peak.</p>
        )}
        <div className="blind-resume-picks">
          <button type="button" onClick={() => pair && pick(pair.fighterA.id)}>PICK A</button>
          <button type="button" onClick={() => pair && pick(pair.fighterB.id)}>PICK B</button>
        </div>
        {run.version === "v3" && nextReveal !== null ? (
          <button className="primary-action" type="button" onClick={revealMore}>REVEAL 2 MORE STATS</button>
        ) : null}
      </section>
    </div>
  );
}
