import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { shareGameChallenge } from "./challengeShare";

interface RoundResult {
  pair: BlindResumePair;
  pickedId: string;
  winnerId: string;
  correct: boolean;
}

function rankCopy(pair: BlindResumePair, fighterId: string) {
  const fighter = pair.fighterA.id === fighterId ? pair.fighterA : pair.fighterB;
  return `${fighter.gender === "women" ? "Women’s" : "Men’s"} UFC GOAT #${fighter.model.rank}`;
}

export default function BlindResumePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSeed = useMemo(() => searchParams.get("challenge") || createBlindResumeSeed(), [searchParams]);
  const roundSet = useMemo(() => createBlindResumeRounds(initialSeed), [initialSeed]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null);
  const [challengeStatus, setChallengeStatus] = useState("");
  const complete = results.length === BLIND_RESUME_ROUNDS;
  const score = results.filter((result) => result.correct).length;
  const pair = roundSet.pairs[roundIndex];

  function pick(fighterId: string) {
    if (currentResult || complete) return;
    const winner = blindResumeWinner(pair);
    setCurrentResult({ pair, pickedId: fighterId, winnerId: winner.id, correct: fighterId === winner.id });
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
    setRoundIndex(0);
    setResults([]);
    setCurrentResult(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function challengeSomeone() {
    setChallengeStatus("");
    const status = await shareGameChallenge({
      title: "Blind Resume Challenge",
      text: `I challenged you to the same five hidden UFC resume matchups. Beat my ${score}/${BLIND_RESUME_ROUNDS}.`,
      url: blindResumeChallengeUrl(initialSeed),
    });
    setChallengeStatus(status);
  }

  function openIntelligence(result: RoundResult) {
    navigate(`/intelligence?mode=compare&fighter=${result.pair.fighterA.id}&opponent=${result.pair.fighterB.id}`);
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
      <div className="page blind-resume-page">
        <section className="blind-resume-final">
          <p className="eyebrow">FIVE-ROUND RESULTS</p>
          <strong>{score}/{BLIND_RESUME_ROUNDS}</strong>
          <h1>{blindResumeTier(score)}</h1>
          <p>{biggestMiss ? `Biggest miss: you took ${biggestMiss.pair.fighterA.id === biggestMiss.pickedId ? biggestMiss.pair.fighterA.name : biggestMiss.pair.fighterB.name} over ${biggestMiss.pair.fighterA.id === biggestMiss.winnerId ? biggestMiss.pair.fighterA.name : biggestMiss.pair.fighterB.name}.` : "Perfect card. You matched the model on every close call."}</p>
        </section>
        <section className="blind-resume-recap">
          {results.map((result, index) => (
            <article className="blind-resume-recap__round" key={result.pair.id}>
              <header><span>ROUND {index + 1}</span><b className={result.correct ? "is-correct" : "is-miss"}>{result.correct ? "CORRECT" : "MISS"}</b></header>
              <div>
                {[result.pair.fighterA, result.pair.fighterB].map((fighter) => (
                  <section className={fighter.id === result.winnerId ? "is-winner" : ""} key={fighter.id}>
                    <FighterPhoto className="blind-resume-recap__photo" name={fighter.name} src={fighter.thumbUrl} />
                    <span><strong>{fighter.name}</strong><small>{rankCopy(result.pair, fighter.id)}</small></span>
                    <em>{fighter.id === result.winnerId ? "MODEL WINNER" : fighter.id === result.pickedId ? "YOUR PICK" : ""}</em>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </section>
        <div className="game-result-actions">
          <button className="primary-action" type="button" onClick={challengeSomeone}>CHALLENGE SOMEONE</button>
          <button className="find-secondary-action" type="button" onClick={replay}>REPLAY</button>
          <button className="find-secondary-action" type="button" onClick={() => navigate("/play")}>ALL GAMES</button>
        </div>
        <p className="game-action-status" role="status">{challengeStatus}</p>
      </div>
    );
  }

  const stats = blindResumeStats(pair);
  if (currentResult) {
    const winner = currentResult.pair.fighterA.id === currentResult.winnerId ? currentResult.pair.fighterA : currentResult.pair.fighterB;
    const loser = currentResult.pair.fighterA.id === currentResult.winnerId ? currentResult.pair.fighterB : currentResult.pair.fighterA;
    return (
      <div className="page blind-resume-page">
        <section className={`blind-resume-verdict ${currentResult.correct ? "is-correct" : "is-miss"}`}>
          <p className="eyebrow">{currentResult.correct ? "YOU PICKED THE MODEL WINNER" : "THE MODEL DISAGREES"}</p>
          <h1>{winner.name} ranks higher</h1>
          <p>{winner.name} is #{winner.model.rank} on the {winner.gender === "women" ? "women’s" : "men’s"} UFC board. {loser.name} is #{loser.model.rank}.</p>
        </section>
        <section className="blind-resume-reveal-grid">
          {[currentResult.pair.fighterA, currentResult.pair.fighterB].map((fighter, index) => (
            <article className={`${fighter.id === currentResult.winnerId ? "is-winner" : ""}${fighter.id === currentResult.pickedId ? " is-picked" : ""}`} key={fighter.id}>
              <FighterPhoto className="blind-resume-reveal-photo" name={fighter.name} src={fighter.thumbUrl} />
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
          <button type="button" onClick={() => pick(pair.fighterA.id)}>PICK A</button>
          <button type="button" onClick={() => pick(pair.fighterB.id)}>PICK B</button>
        </div>
      </section>
    </div>
  );
}
