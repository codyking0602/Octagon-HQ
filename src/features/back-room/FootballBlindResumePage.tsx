import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  createFootballBlindResumeRun,
  footballBlindResumeTier,
  type FootballBlindResumeRun,
} from "./footballBlindResumeModel";
import { FootballSubjectVisual } from "./FootballSubjectVisual";

type PickSide = "left" | "right";
type RevealCount = 2 | 4 | 5;

interface RoundPick {
  pickedId: string;
  correct: boolean;
  revealedCount: RevealCount;
  points: number;
}

const OPENING_REVEAL: RevealCount = 2;

function nextRevealCount(value: RevealCount): RevealCount | null {
  if (value === 2) return 4;
  if (value === 4) return 5;
  return null;
}

function roundPoints(revealedCount: RevealCount, correct: boolean) {
  if (!correct) return 0;
  if (revealedCount === 2) return 20;
  if (revealedCount === 4) return 15;
  return 10;
}

export default function FootballBlindResumePage() {
  const navigate = useNavigate();
  const [run, setRun] = useState<FootballBlindResumeRun>(() => createFootballBlindResumeRun());
  const [roundIndex, setRoundIndex] = useState(0);
  const [picks, setPicks] = useState<RoundPick[]>([]);
  const [pickedSide, setPickedSide] = useState<PickSide | null>(null);
  const [revealedCount, setRevealedCount] = useState<RevealCount>(OPENING_REVEAL);
  const round = run.rounds[roundIndex];
  const complete = roundIndex >= run.rounds.length;
  const correct = picks.filter((pick) => pick.correct).length;
  const score = picks.reduce((sum, pick) => sum + pick.points, 0);

  function reset(nextRun: FootballBlindResumeRun) {
    setRun(nextRun);
    setRoundIndex(0);
    setPicks([]);
    setPickedSide(null);
    setRevealedCount(OPENING_REVEAL);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    reset(createFootballBlindResumeRun());
  }

  function choose(side: PickSide) {
    if (!round || pickedSide) return;
    const pickedId = side === "left" ? round.leftId : round.rightId;
    const isCorrect = pickedId === round.winnerId;
    setPickedSide(side);
    setPicks((current) => [...current, {
      pickedId,
      correct: isCorrect,
      revealedCount,
      points: roundPoints(revealedCount, isCorrect),
    }]);
  }

  function revealMore() {
    if (pickedSide) return;
    const next = nextRevealCount(revealedCount);
    if (next) setRevealedCount(next);
  }

  function advance() {
    if (!round || !pickedSide) return;
    const nextIndex = roundIndex + 1;
    if (nextIndex === run.rounds.length) {
      recordLineupCompletion(run.identity, {
        correct,
        score,
        matchupIds: run.rounds.map((item) => item.id),
        picks: picks.map((pick) => ({
          pickedId: pick.pickedId,
          revealedCount: pick.revealedCount,
          points: pick.points,
        })),
      });
    }
    setRoundIndex(nextIndex);
    setPickedSide(null);
    setRevealedCount(OPENING_REVEAL);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (complete) {
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
                    {pick?.correct ? "RIGHT" : "MISS"} · +{pick?.points ?? 0} · {winnerName}
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

  const latestPick = picks[picks.length - 1];
  const pickedId = pickedSide === "left" ? round.leftId : pickedSide === "right" ? round.rightId : null;
  const pickedCorrect = pickedId === round.winnerId;
  const winnerSide: PickSide = round.winnerId === round.leftId ? "left" : "right";
  const winnerName = winnerSide === "left" ? round.leftName : round.rightName;
  const winnerSubtitle = winnerSide === "left" ? round.leftSubtitle : round.rightSubtitle;
  const nextReveal = nextRevealCount(revealedCount);

  return (
    <div className="page football-debate-page football-blind-resume-page">
      <section className="football-blind-resume-topline">
        <div>
          <p className="eyebrow">FOOTBALL BLIND RESUME</p>
          <h1>{round.prompt}</h1>
        </div>
        <aside><span>ROUND {roundIndex + 1} OF 5</span><b>{score} PTS · {correct}-{roundIndex - correct}</b></aside>
      </section>

      <div className="football-blind-resume-progress" aria-label="Football Blind Resume progress">
        {[0, 1, 2, 3, 4].map((index) => (
          <i className={`${index < roundIndex ? "is-complete" : ""}${index === roundIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>

      <section className="football-blind-resume-card">
        <header>
          <div><span>RESUME A</span><strong>{pickedSide ? round.leftName : "?"}</strong></div>
          <b>RESUME</b>
          <div><span>RESUME B</span><strong>{pickedSide ? round.rightName : "?"}</strong></div>
        </header>

        <div className="football-blind-resume-stats">
          {round.stats.map((stat, index) => {
            const revealed = index < revealedCount;
            return (
              <article key={stat.label}>
                <strong>{revealed ? stat.valueA : "•••"}</strong>
                <span>{stat.label}</span>
                <strong>{revealed ? stat.valueB : "•••"}</strong>
              </article>
            );
          })}
        </div>

        {!pickedSide ? (
          <>
            <p className="football-blind-resume-lock-note">
              {revealedCount} OF 5 STATS SHOWN · LOCK NOW: CORRECT +{roundPoints(revealedCount, true)} · MISS +0
            </p>
            <div className="football-blind-resume-picks">
              <button type="button" onClick={() => choose("left")}>PICK A</button>
              <button type="button" onClick={() => choose("right")}>PICK B</button>
            </div>
            {nextReveal ? (
              <button className="football-blind-resume-more" type="button" onClick={revealMore}>
                {nextReveal === 4 ? "REVEAL 2 MORE STATS" : "REVEAL FINAL STAT"}
              </button>
            ) : null}
          </>
        ) : (
          <>
            <section className="football-blind-resume-identities" aria-label="Football Blind Resume identities">
              <article className={winnerSide === "left" ? "is-winner" : ""}>
                <FootballSubjectVisual
                  item={{ id: round.leftId, name: round.leftName, league: getLeague(round.packId) }}
                  packId={round.packId}
                />
                <span><small>RESUME A</small><strong>{round.leftName}</strong></span>
              </article>
              <article className={winnerSide === "right" ? "is-winner" : ""}>
                <FootballSubjectVisual
                  item={{ id: round.rightId, name: round.rightName, league: getLeague(round.packId) }}
                  packId={round.packId}
                />
                <span><small>RESUME B</small><strong>{round.rightName}</strong></span>
              </article>
            </section>
            <section className={`football-blind-resume-reveal ${pickedCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
              <p className="eyebrow">{pickedCorrect ? "RIGHT CALL" : "MISSED IT"}</p>
              <h2>{winnerName}</h2>
              <p>{winnerSubtitle}. The Back Room has this résumé higher.</p>
              <strong>+{latestPick?.points ?? 0} POINTS</strong>
              <button type="button" onClick={advance}>{roundIndex === 4 ? "SEE FINAL SCORE" : "NEXT ROUND"}</button>
            </section>
          </>
        )}
      </section>
    </div>
  );
}

function getLeague(packId: FootballBlindResumeRun["rounds"][number]["packId"]): "NFL" | "CFB" {
  return packId.startsWith("nfl-") ? "NFL" : "CFB";
}
