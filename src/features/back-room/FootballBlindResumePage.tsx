import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor } from "../play/lineupModel";
import {
  FOOTBALL_BLIND_RESUME_GAME_ID,
  FOOTBALL_BLIND_RESUME_REVEAL_COUNTS,
  createFootballBlindResumeRun,
  footballBlindResumeAnswerLabel,
  footballBlindResumeDifficultyLabel,
  footballBlindResumeNextRevealCount,
  footballBlindResumeRoundPoints,
  footballBlindResumeTier,
  resolvedFootballBlindResumeMatchups,
  type FootballBlindResumeAnswer,
  type FootballBlindResumeRevealCount,
  type FootballBlindResumeRun,
} from "./footballBlindResumeModel";
import { FootballSubjectVisual } from "./FootballSubjectVisual";
import {
  asChallengeJson,
  challengeRecord,
  challengeStrings,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "./footballChallengeRuntime";

interface RoundPick {
  pickedAnswer: FootballBlindResumeAnswer;
  pickedId: string | null;
  correct: boolean;
  revealedCount: FootballBlindResumeRevealCount;
  points: number;
}

const OPENING_REVEAL: FootballBlindResumeRevealCount = FOOTBALL_BLIND_RESUME_REVEAL_COUNTS[0];

function resolveChallengeRun(matchupIds: readonly string[], challengeId: string): FootballBlindResumeRun | null {
  if (matchupIds.length !== 5 || new Set(matchupIds).size !== 5) return null;
  const byId = new Map(resolvedFootballBlindResumeMatchups().map((round) => [round.id, round]));
  const rounds = matchupIds.flatMap((id) => byId.get(id) ? [byId.get(id)!] : []);
  if (rounds.length !== 5) return null;
  return {
    rounds,
    identity: footballCuratedIdentity(
      FOOTBALL_BLIND_RESUME_GAME_ID,
      challengeId,
      matchupIds,
      "football-blind-resume",
      rounds.flatMap((round) => [round.leftId, round.rightId]),
    ),
  };
}

export default function FootballBlindResumePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("blind-resume");
  const profileSetup = challengeRecord(profileMatch.challenge?.setup);
  const profileMatchupIds = challengeStrings(profileSetup?.matchupIds);
  const queryMatchupIds = (searchParams.get("matchups") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const sharedChallengeId = profileMatch.challenge?.code ?? `shared:${queryMatchupIds.join("|")}`;
  const sharedRun = useMemo(() => (
    resolveChallengeRun(profileMatchupIds, sharedChallengeId)
      ?? resolveChallengeRun(queryMatchupIds, sharedChallengeId)
  ), [profileMatchupIds.join("|"), queryMatchupIds.join("|"), sharedChallengeId]);
  const [run, setRun] = useState<FootballBlindResumeRun>(() => sharedRun ?? createFootballBlindResumeRun());
  const [roundIndex, setRoundIndex] = useState(0);
  const [picks, setPicks] = useState<RoundPick[]>([]);
  const [pickedAnswer, setPickedAnswer] = useState<FootballBlindResumeAnswer | null>(null);
  const [revealedCount, setRevealedCount] = useState<FootballBlindResumeRevealCount>(OPENING_REVEAL);
  const [challengeStatus, setChallengeStatus] = useState("");
  const round = run.rounds[roundIndex];
  const complete = roundIndex >= run.rounds.length;
  const correct = picks.filter((pick) => pick.correct).length;
  const score = picks.reduce((sum, pick) => sum + pick.points, 0);
  const losses = picks.length - correct;
  const shared = run.identity.type === "curated";

  useEffect(() => {
    if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;
    reset(sharedRun);
  }, [run.identity.challengeId, sharedRun]);

  function reset(nextRun: FootballBlindResumeRun) {
    setRun(nextRun);
    setRoundIndex(0);
    setPicks([]);
    setPickedAnswer(null);
    setRevealedCount(OPENING_REVEAL);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    reset(createFootballBlindResumeRun());
  }

  function replay() {
    if (shared) reset(run);
    else startNew();
  }

  function choose(answer: FootballBlindResumeAnswer) {
    if (!round || pickedAnswer) return;
    const pickedId = answer === "left" ? round.leftId : answer === "right" ? round.rightId : null;
    const isCorrect = answer === round.correctAnswer;
    setPickedAnswer(answer);
    setPicks((current) => [...current, {
      pickedAnswer: answer,
      pickedId,
      correct: isCorrect,
      revealedCount,
      points: footballBlindResumeRoundPoints(revealedCount, isCorrect),
    }]);
  }

  function revealMore() {
    if (pickedAnswer) return;
    const next = footballBlindResumeNextRevealCount(revealedCount);
    if (next !== null) setRevealedCount(next);
  }

  function resultPayload(nextPicks = picks) {
    const wins = nextPicks.filter((pick) => pick.correct).length;
    const nextScore = nextPicks.reduce((sum, pick) => sum + pick.points, 0);
    return {
      score: nextScore,
      record: { wins, losses: nextPicks.length - wins },
      matchupIds: run.rounds.map((item) => item.id),
      picks: nextPicks.map((pick) => ({
        pickedAnswer: pick.pickedAnswer,
        pickedId: pick.pickedId,
        correct: pick.correct,
        revealedCount: pick.revealedCount,
        points: pick.points,
      })),
    };
  }

  function advance() {
    if (!round || !pickedAnswer) return;
    const nextIndex = roundIndex + 1;
    if (nextIndex === run.rounds.length) {
      const payload = resultPayload();
      recordLineupCompletion(run.identity, payload);
      if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
        profileMatch.submitResult(asChallengeJson(payload));
      }
    }
    setRoundIndex(nextIndex);
    setPickedAnswer(null);
    setRevealedCount(OPENING_REVEAL);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function challengeSomeone() {
    if (!complete) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "blind-resume",
      gameVersion: "football-blind-resume-v4",
      gameTitle: "Football Blind Resume",
      summary: "Five rounds · same hidden resumes",
      setup: asChallengeJson({
        matchupIds: run.rounds.map((item) => item.id),
        rounds: run.rounds.map((item) => ({
          fighterA: { id: item.leftId, name: item.leftName },
          fighterB: { id: item.rightId, name: item.rightName },
          correctAnswer: item.correctAnswer,
          winnerId: item.winnerId,
          leftTier: item.leftTier,
          rightTier: item.rightTier,
          comparisonOwner: item.comparisonOwner,
          difficulty: item.difficulty,
        })),
      }),
      creatorResult: asChallengeJson(resultPayload()),
      shareTitle: "Football Blind Resume Challenge",
      shareText: "I challenged you to the same five hidden football resume matchups. Lock each call before the names reveal.",
      shareUrl: footballChallengeUrl("/football/blind-resume", {
        matchups: run.rounds.map((item) => item.id).join(","),
      }),
    });
    setChallengeStatus(status);
  }

  if (complete) {
    return (
      <div className="page football-debate-page football-blind-resume-page" data-game-family="blind-resume" data-sport="football">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent these exact five football resumes.</strong>
            <small>Both five-round results reveal after you finish.</small>
          </section>
        ) : null}
        <section className="football-debate-result-hero football-blind-resume-final">
          <p className="eyebrow">FOOTBALL BLIND RESUME · FINAL SCORE</p>
          <strong>{score}<small>/100</small></strong>
          <span>{footballBlindResumeTier(correct)} · {correct}-{losses} record</span>
          <small>Early conviction pays. Later reveals trade upside for miss protection.</small>
        </section>

        <section className="football-blind-resume-recap">
          <header>
            <p className="eyebrow">THE FIVE CALLS</p>
            <h2>How quickly did you read each hidden resume?</h2>
          </header>
          <div>
            {run.rounds.map((item, index) => {
              const pick = picks[index];
              const pickedName = pick?.pickedAnswer === "tie"
                ? "SAME TIER"
                : pick?.pickedId === item.leftId
                  ? item.leftName
                  : item.rightName;
              return (
                <article key={item.id}>
                  <b>{index + 1}</b>
                  <span>
                    <small>{footballBlindResumeDifficultyLabel(item.difficulty)} · {pick?.revealedCount ?? 0}/8 EVIDENCE</small>
                    <strong>{item.leftName} vs. {item.rightName}</strong>
                  </span>
                  <em className={pick?.correct ? "is-correct" : "is-wrong"}>
                    {pick?.correct ? "RIGHT" : "MISS"} · +{pick?.points ?? 0} · PICK {pickedName} · VERDICT {footballBlindResumeAnswerLabel(item.correctAnswer)}
                  </em>
                </article>
              );
            })}
          </div>
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

  if (!round) return null;

  const latestPick = picks[picks.length - 1];
  const pickedCorrect = pickedAnswer === round.correctAnswer;
  const nextReveal = footballBlindResumeNextRevealCount(revealedCount);
  const difficultyLabel = footballBlindResumeDifficultyLabel(round.difficulty);
  const verdictLabel = footballBlindResumeAnswerLabel(round.correctAnswer);
  const winnerName = round.correctAnswer === "left" ? round.leftName : round.correctAnswer === "right" ? round.rightName : "SAME TIER";
  const winnerSubtitle = round.correctAnswer === "left" ? round.leftSubtitle : round.correctAnswer === "right" ? round.rightSubtitle : `${round.leftTier.toUpperCase()} · ${round.rightTier.toUpperCase()}`;

  return (
    <div className="page football-debate-page football-blind-resume-page" data-game-family="blind-resume" data-sport="football">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent these exact five football resumes.</strong>
          <small>Make all five locked calls to reveal the matchup.</small>
        </section>
      ) : null}
      <section className="football-blind-resume-topline">
        <div>
          <p className="eyebrow">FOOTBALL BLIND RESUME</p>
          <h1>{round.prompt}</h1>
          <span className={`football-blind-resume-difficulty is-${round.difficulty}`}>{difficultyLabel}</span>
        </div>
        <aside><span>ROUND {roundIndex + 1} OF 5</span><b>{score} PTS · {correct}-{losses}</b></aside>
      </section>

      <div className="football-blind-resume-progress" aria-label="Football Blind Resume progress">
        {[0, 1, 2, 3, 4].map((index) => (
          <i className={`${index < roundIndex ? "is-complete" : ""}${index === roundIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>

      <section className="football-blind-resume-card">
        <header>
          <div><span>RESUME A</span><strong>{pickedAnswer ? round.leftName : "?"}</strong></div>
          <b>VS</b>
          <div><span>RESUME B</span><strong>{pickedAnswer ? round.rightName : "?"}</strong></div>
        </header>

        <div className="football-blind-resume-stats" aria-label="Football Blind Resume evidence ladder">
          {round.stats.map((stat, index) => {
            const revealed = index < revealedCount;
            return (
              <article className={revealed ? "is-revealed" : "is-locked"} key={`${stat.label}-${index}`}>
                <strong>{revealed ? stat.valueA : "•••"}</strong>
                <span>{stat.label}</span>
                <strong>{revealed ? stat.valueB : "•••"}</strong>
              </article>
            );
          })}
        </div>

        {!pickedAnswer ? (
          <>
            <div className="football-blind-resume-stakes">
              <span>{revealedCount} OF 8 EVIDENCE SHOWN</span>
              <strong>LOCK NOW: CORRECT +{footballBlindResumeRoundPoints(revealedCount, true)}</strong>
              <small>MISS +{footballBlindResumeRoundPoints(revealedCount, false)} · later reveals trade upside for protection</small>
            </div>
            <div className="football-blind-resume-picks">
              <button type="button" onClick={() => choose("left")}>PICK A</button>
              <button type="button" onClick={() => choose("tie")}>SAME TIER</button>
              <button type="button" onClick={() => choose("right")}>PICK B</button>
            </div>
            {nextReveal !== null ? (
              <button className="football-blind-resume-more" type="button" onClick={revealMore}>
                REVEAL 2 MORE EVIDENCE
              </button>
            ) : null}
          </>
        ) : (
          <>
            <section className="football-blind-resume-identities" aria-label="Football Blind Resume identities">
              <article className={round.correctAnswer === "left" || round.correctAnswer === "tie" ? "is-winner" : ""}>
                <FootballSubjectVisual
                  item={{ id: round.leftId, name: round.leftName, league: getLeague(round.packId) }}
                  packId={round.packId}
                />
                <span><small>RESUME A · {round.leftTier.toUpperCase()}</small><strong>{round.leftName}</strong></span>
              </article>
              <article className={round.correctAnswer === "right" || round.correctAnswer === "tie" ? "is-winner" : ""}>
                <FootballSubjectVisual
                  item={{ id: round.rightId, name: round.rightName, league: getLeague(round.packId) }}
                  packId={round.packId}
                />
                <span><small>RESUME B · {round.rightTier.toUpperCase()}</small><strong>{round.rightName}</strong></span>
              </article>
            </section>
            <section className={`football-blind-resume-reveal ${pickedCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
              <p className="eyebrow">{pickedCorrect ? "RIGHT CALL" : "MISSED IT"}</p>
              <h2>{winnerName}</h2>
              <p>{winnerSubtitle}. Canonical Football comparison verdict: {verdictLabel}.</p>
              <strong>+{latestPick?.points ?? 0} POINTS · LOCKED AT {latestPick?.revealedCount ?? 0}/8</strong>
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
