import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  createFootballBlindResumeRun,
  footballBlindResumeScore,
  footballBlindResumeTier,
  type FootballBlindResumeRun,
} from "./footballBlindResumeModel";

type PickSide = "left" | "right";

interface RoundPick {
  pickedId: string;
  correct: boolean;
}

export default function FootballBlindResumePage() {
  const navigate = useNavigate();
  const [run, setRun] = useState<FootballBlindResumeRun>(() => createFootballBlindResumeRun());
  const [roundIndex, setRoundIndex] = useState(0);
  const [picks, setPicks] = useState<RoundPick[]>([]);
  const [pickedSide, setPickedSide] = useState<PickSide | null>(null);
  const round = run.rounds[roundIndex];
  const complete = roundIndex >= run.rounds.length;
  const correct = picks.filter((pick) => pick.correct).length;

  function reset(nextRun: FootballBlindResumeRun) {
    setRun(nextRun);
    setRoundIndex(0);
    setPicks([]);
    setPickedSide(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    reset(createFootballBlindResumeRun());
  }

  function choose(side: PickSide) {
    if (!round || pickedSide) return;
    const pickedId = side === "left" ? round.leftId : round.rightId;
    const result = { pickedId, correct: pickedId === round.winnerId };
    setPickedSide(side);
    setPicks((current) => [...current, result]);
  }

  function advance() {
    if (!round || !pickedSide) return;
    const nextIndex = roundIndex + 1;
    if (nextIndex === run.rounds.length) {
      const finalCorrect = picks.filter((pick) => pick.correct).length;
      recordLineupCompletion(run.identity, {
        correct: finalCorrect,
        score: footballBlindResumeScore(finalCorrect),
        matchupIds: run.rounds.map((item) => item.id),
        picks: picks.map((pick) => pick.pickedId),
      });
    }
    setRoundIndex(nextIndex);
    setPickedSide(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (complete) {
    const score = footballBlindResumeScore(correct);
    return (
      <div className="page football-debate-page football-blind-resume-page">
        <section className="football-debate-result-hero">
          <p className="eyebrow">FOOTBALL BLIND RESUME · FINAL SCORE</p>
          <strong>{score}<small>/100</small></strong>
          <span>{footballBlindResumeTier(correct)} · {correct}/5 calls right</span>
        </section>

        <section className="football-blind-resume-recap">
          <header>
            <p className="eyebrow">THE FIVE CALLS</p>
            <h2>What was behind the résumés.</h2>
          </header>
          <div>
            {run.rounds.map((item, index) => {
              const pick = picks[index];
              const winnerName = item.winnerId === item.leftId ? item.leftName : item.rightName;
              return (
                <article key={item.id}>
                  <b>{index + 1}</b>
                  <span>
                    <small>{item.prompt}</small>
                    <strong>{item.leftName} vs. {item.rightName}</strong>
                  </span>
                  <em className={pick?.correct ? "is-correct" : "is-wrong"}>
                    {pick?.correct ? "RIGHT" : "MISS"} · {winnerName}
                  </em>
                </article>
              );
            })}
          </div>
        </section>

        <div className="football-debate-actions">
          <button className="is-primary" type="button" onClick={startNew}>NEW FIVE</button>
          <button type="button" onClick={() => navigate("/back-room/football")}>ALL FOOTBALL GAMES</button>
        </div>
      </div>
    );
  }

  if (!round) return null;

  const pickedId = pickedSide === "left" ? round.leftId : pickedSide === "right" ? round.rightId : null;
  const pickedCorrect = pickedId === round.winnerId;
  const winnerSide: PickSide = round.winnerId === round.leftId ? "left" : "right";

  return (
    <div className="page football-debate-page football-blind-resume-page">
      <section className="football-debate-intro football-blind-resume-intro">
        <div>
          <p className="eyebrow">THE BACK ROOM · FOOTBALL BLIND RESUME</p>
          <h1>{round.prompt}</h1>
          <p>No names until you commit. Read the résumé, make the call, then see who was hiding behind A and B.</p>
        </div>
        <div className="football-debate-category">
          <small>ROUND</small>
          <strong>{roundIndex + 1} OF 5</strong>
          <span>{correct} RIGHT SO FAR</span>
        </div>
      </section>

      <div className="football-blind-resume-progress" aria-label="Football Blind Resume progress">
        {[0, 1, 2, 3, 4].map((index) => (
          <i className={`${index < roundIndex ? "is-complete" : ""}${index === roundIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>

      <section className="football-blind-resume-card">
        <header>
          <div><span>RESUME A</span>{pickedSide ? <strong>{round.leftName}</strong> : <strong>IDENTITY HIDDEN</strong>}</div>
          <b>VS</b>
          <div><span>RESUME B</span>{pickedSide ? <strong>{round.rightName}</strong> : <strong>IDENTITY HIDDEN</strong>}</div>
        </header>

        <div className="football-blind-resume-stats">
          {round.stats.map((stat) => (
            <article key={stat.label}>
              <strong>{stat.valueA}</strong>
              <span>{stat.label}</span>
              <strong>{stat.valueB}</strong>
            </article>
          ))}
        </div>

        {!pickedSide ? (
          <div className="football-blind-resume-picks">
            <button type="button" onClick={() => choose("left")}>PICK RESUME A</button>
            <button type="button" onClick={() => choose("right")}>PICK RESUME B</button>
          </div>
        ) : (
          <section className={`football-blind-resume-reveal ${pickedCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
            <p className="eyebrow">{pickedCorrect ? "RIGHT CALL" : "MISSED IT"}</p>
            <h2>{winnerSide === "left" ? round.leftName : round.rightName}</h2>
            <p>
              Back Room rating {winnerSide === "left" ? round.leftRating : round.rightRating} beats {winnerSide === "left" ? round.rightRating : round.leftRating}.
              {" "}{winnerSide === "left" ? round.leftSubtitle : round.rightSubtitle}.
            </p>
            <button type="button" onClick={advance}>{roundIndex === 4 ? "SEE FINAL SCORE" : "NEXT RESUME"}</button>
          </section>
        )}
      </section>
    </div>
  );
}
