import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FootballFindLeaderPresentation } from "../back-room/FootballFindLeaderPresentation";
import { useIdentity } from "../identity/IdentityProvider";
import {
  MLB_FIND_LEADER_PRODUCTION_BOARDS,
  formatMlbFindLeaderValue,
  type MlbFindLeaderBoard,
} from "./mlbFindLeaderProduction";
import {
  recordMlbPlayChallengeResult,
  type MlbPlayChallengeResult,
} from "./mlbPlayChallenge";
import {
  MLB_MILLIONAIRE_PRODUCTION_CHALLENGE_KEY,
  MLB_MILLIONAIRE_PRODUCTION_DATE,
  MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03,
} from "./mlbMillionaireProduction";
import { mlbTeamAssetByAbbreviation } from "./mlbTeamAssets";
import { useMlbPlayChallengeOverview } from "./useMlbPlayChallengeOverview";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import MlbWavelengthChallenge from "./MlbWavelengthChallenge";
import MlbBlindResumeOwnerRun from "./MlbBlindResumeOwnerRun";
import MlbBlindResumeProductionChallenge from "./MlbBlindResumeProductionChallenge";
import {
  MLB_BLIND_RESUME_PRODUCTION_CHALLENGE_KEY,
  MLB_BLIND_RESUME_PRODUCTION_DATE,
} from "./mlbBlindResumeProduction";
import MlbWhoAmIProductionChallenge from "./MlbWhoAmIProductionChallenge";
import {
  MLB_WHO_AM_I_PRODUCTION_CHALLENGE_KEY,
  MLB_WHO_AM_I_PRODUCTION_DATE,
} from "./mlbWhoAmIProduction";
import MillionaireCasualPage, { type MillionaireCasualSettledResult } from "../play/MillionaireCasualPage";
import "../../styles/football-find-leader.css";
import "../../styles/mlb-playoffs.css";

interface ResultState {
  score: number;
  perfect: boolean;
  fatalId: string | null;
}

type CompletedGame = {
  score: number;
  perfect: boolean;
  fatalId: string | null;
  fatalName: string | null;
  eliminatedIds: string[];
  safeCount: number;
};

function boardLeader(board: MlbFindLeaderBoard) {
  return board.candidates.reduce((leader, candidate) => (
    (candidate.value ?? Number.NEGATIVE_INFINITY) > (leader.value ?? Number.NEGATIVE_INFINITY)
      ? candidate
      : leader
  ));
}

function storedGameScores(publicResult: Record<string, unknown>) {
  const scores = publicResult.game_scores;
  if (!Array.isArray(scores)) return [];
  return scores.filter((score): score is number => typeof score === "number");
}

function MlbFindLeaderVisual({
  board,
  candidateId,
  candidateName,
  compact = false,
}: {
  board: MlbFindLeaderBoard;
  candidateId: string;
  candidateName: string;
  compact?: boolean;
}) {
  const candidate = board.candidates.find((row) => row.id === candidateId);
  const team = mlbTeamAssetByAbbreviation(candidate?.teamAbbreviation);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [candidateId, team?.logoUrl]);

  return (
    <span
      className={`football-find-card__visual${team && !failed ? " has-logo" : ""}${compact ? " is-compact" : ""}`}
      aria-label={team && !failed ? `${team.name} logo for ${candidateName}` : `${candidateName} MLB mark`}
    >
      {team && !failed ? (
        <img
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          src={team.logoUrl}
          title={team.name}
          onError={() => setFailed(true)}
        />
      ) : (
        <b aria-hidden="true">MLB</b>
      )}
    </span>
  );
}

export default function MlbFeaturedChallengePage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const { hub: liveHub } = useMlbPlayoffs(signedIn);
  const previewMode = identity.profile?.canControlPicks === true
    && (!liveHub || !liveHub.fieldReady || liveHub.featuredChallenge?.is_live !== true);
  const challenge = liveHub?.featuredChallenge ?? null;
  const challengeKey = challenge?.id ?? "";
  const {
    overview,
    loading: overviewLoading,
    reload: reloadOverview,
  } = useMlbPlayChallengeOverview({
    enabled: signedIn
      && !previewMode
      && challenge?.ready === true
      && challenge?.is_live === true
      && (challenge?.game_type === "find_leader" || challenge?.game_type === "millionaire"),
    season: liveHub?.season ?? 2026,
    challengeKey,
  });
  const [practiceMode, setPracticeMode] = useState(false);
  const [boardIndex, setBoardIndex] = useState(0);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const [completedScores, setCompletedScores] = useState<number[]>([]);
  const [completedGames, setCompletedGames] = useState<CompletedGame[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState("");
  const board = MLB_FIND_LEADER_PRODUCTION_BOARDS[boardIndex] ?? MLB_FIND_LEADER_PRODUCTION_BOARDS[0]!;
  const leader = boardLeader(board);
  const eliminatedSet = useMemo(() => new Set(eliminated), [eliminated]);
  const finalScore = completedScores.length === MLB_FIND_LEADER_PRODUCTION_BOARDS.length
    ? Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
    : null;

  function resetBoard(nextBoardIndex = boardIndex) {
    setBoardIndex(nextBoardIndex);
    setEliminated([]);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetChallenge() {
    setCompletedScores([]);
    setCompletedGames([]);
    setRecordError("");
    resetBoard(0);
  }

  async function saveOfficialResult(score: number, games: CompletedGame[]) {
    setRecording(true);
    setRecordError("");
    try {
      const completed: MlbPlayChallengeResult = {
        rawScore: score,
        gameType: "find_leader",
        publicResult: {
          game_scores: games.map((game) => game.score),
          average_score: score,
        },
        resultDetail: {
          games: games.map((game) => ({
            score: game.score,
            perfect: game.perfect,
            safe_count: game.safeCount,
            fatal_id: game.fatalId,
            fatal_name: game.fatalName,
            eliminated_ids: game.eliminatedIds,
          })),
        },
        completedAt: new Date().toISOString(),
      };

      await recordMlbPlayChallengeResult({
        season: liveHub?.season ?? 2026,
        challengeKey,
        rawScore: completed.rawScore,
        gameType: completed.gameType,
        publicResult: completed.publicResult,
        resultDetail: completed.resultDetail,
      });
      await reloadOverview();
    } catch (nextError) {
      setRecordError(nextError instanceof Error ? nextError.message : "Your official MLB Play result could not be recorded.");
    } finally {
      setRecording(false);
    }
  }

  async function saveOfficialMillionaireResult(result: MillionaireCasualSettledResult) {
    setRecording(true);
    setRecordError("");
    try {
      await recordMlbPlayChallengeResult({
        season: liveHub?.season ?? 2026,
        challengeKey,
        rawScore: result.score,
        gameType: "millionaire",
        publicResult: {
          outcome: result.outcome,
          final_money: result.finalMoney,
          completed_questions: result.completedQuestions,
          lifelines_used: result.lifelinesUsed,
          time_remaining_ms: result.timeRemainingMs,
          score: result.score,
        },
        resultDetail: {
          outcome: result.outcome,
          final_money: result.finalMoney,
          completed_questions: result.completedQuestions,
          lifelines_used: result.lifelinesUsed,
          time_remaining_ms: result.timeRemainingMs,
        },
      });
      await reloadOverview();
    } catch (nextError) {
      setRecordError(nextError instanceof Error ? nextError.message : "Your official MLB Millionaire result could not be recorded.");
    } finally {
      setRecording(false);
    }
  }

  function finishBoard(nextResult: ResultState, eliminatedIds: string[]) {
    const fatal = nextResult.fatalId
      ? board.candidates.find((candidate) => candidate.id === nextResult.fatalId) ?? null
      : null;
    const game: CompletedGame = {
      score: nextResult.score,
      perfect: nextResult.perfect,
      fatalId: nextResult.fatalId,
      fatalName: fatal?.name ?? null,
      eliminatedIds,
      safeCount: nextResult.perfect ? 9 : Math.max(0, eliminatedIds.length - 1),
    };
    const nextScores = [...completedScores.slice(0, boardIndex), nextResult.score];
    const nextGames = [...completedGames.slice(0, boardIndex), game];
    setResult(nextResult);
    setCompletedScores(nextScores);
    setCompletedGames(nextGames);

    const isLastBoard = boardIndex === MLB_FIND_LEADER_PRODUCTION_BOARDS.length - 1;
    if (isLastBoard && !practiceMode) {
      const score = Math.round(nextScores.reduce((sum, value) => sum + value, 0) / nextScores.length);
      void saveOfficialResult(score, nextGames);
    }
  }

  function eliminate(id: string) {
    if (result || eliminatedSet.has(id)) return;
    const round = eliminated.length + 1;
    const next = [...eliminated, id];
    setEliminated(next);

    if (id === leader.id) {
      finishBoard({ score: round * 10, perfect: false, fatalId: id }, next);
      return;
    }

    if (next.length === 9) {
      finishBoard({ score: 100, perfect: true, fatalId: null }, next);
    }
  }

  const isLastBoard = boardIndex === MLB_FIND_LEADER_PRODUCTION_BOARDS.length - 1;
  const savedResult = overview?.ownResult ?? null;

  if (previewMode) {
    return <MlbBlindResumeOwnerRun />;
  }

  if (!challenge || !challenge.is_live || !challenge.ready) {
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
          <h1>{challenge?.title ?? "Next challenge coming soon."}</h1>
          <p>{challenge?.is_live && !challenge.ready
            ? "This scheduled challenge is not ready for play yet."
            : "The next postseason challenge will unlock on its scheduled date."}</p>
          <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
            MLB PLAY
          </button>
        </section>
      </div>
    );
  }

  if (challenge.game_type === "wavelength") {
    return (
      <MlbWavelengthChallenge
        key={challenge.id}
        mode="production"
        season={liveHub?.season ?? 2026}
        challengeKey={challenge.id}
        challengeDate={challenge.date}
      />
    );
  }

  if (challenge.game_type === "who_am_i") {
    const isProductionWhoAmI = challenge.id === MLB_WHO_AM_I_PRODUCTION_CHALLENGE_KEY
      && challenge.date === MLB_WHO_AM_I_PRODUCTION_DATE;

    if (!isProductionWhoAmI) {
      return (
        <div className="page mlb-find-leader-page">
          <section className="mlb-find-saved-result">
            <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
            <h1>{challenge.title}</h1>
            <p>This Who Am I date is not activated yet.</p>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
              MLB PLAY
            </button>
          </section>
        </div>
      );
    }

    return (
      <MlbWhoAmIProductionChallenge
        key={challenge.id}
        season={liveHub?.season ?? 2026}
        challengeKey={challenge.id}
      />
    );
  }

  if (challenge.game_type === "blind_resume") {
    const isProductionBlindResume = challenge.id === MLB_BLIND_RESUME_PRODUCTION_CHALLENGE_KEY
      && challenge.date === MLB_BLIND_RESUME_PRODUCTION_DATE;

    if (!isProductionBlindResume) {
      return (
        <div className="page mlb-find-leader-page">
          <section className="mlb-find-saved-result">
            <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
            <h1>{challenge.title}</h1>
            <p>This Blind Resume date is not activated yet.</p>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
              MLB PLAY
            </button>
          </section>
        </div>
      );
    }

    return (
      <MlbBlindResumeProductionChallenge
        key={challenge.id}
        season={liveHub?.season ?? 2026}
        challengeKey={challenge.id}
      />
    );
  }

  if (challenge.game_type === "millionaire") {
    const isProductionMillionaire = challenge.id === MLB_MILLIONAIRE_PRODUCTION_CHALLENGE_KEY
      && challenge.date === MLB_MILLIONAIRE_PRODUCTION_DATE;

    if (!isProductionMillionaire) {
      return (
        <div className="page mlb-find-leader-page">
          <section className="mlb-find-saved-result">
            <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
            <h1>{challenge.title}</h1>
            <p>This Millionaire date is not activated yet.</p>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
              MLB PLAY
            </button>
          </section>
        </div>
      );
    }

    if (overviewLoading && !overview && !practiceMode) {
      return (
        <div className="page mlb-find-leader-page">
          <section className="mlb-find-saved-result">
            <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
            <h1>Loading your challenge…</h1>
          </section>
        </div>
      );
    }

    if (savedResult && !practiceMode) {
      const finalMoney = typeof savedResult.publicResult.final_money === "number"
        ? savedResult.publicResult.final_money
        : 0;
      const completedQuestions = typeof savedResult.publicResult.completed_questions === "number"
        ? savedResult.publicResult.completed_questions
        : 0;
      return (
        <div className="page mlb-find-leader-page">
          <section className="mlb-find-saved-result">
            <p className="eyebrow">OFFICIAL RESULT</p>
            <h1>Who Wants to Be a Millionaire?</h1>
            <strong>{savedResult.rawScore}<small>/100</small></strong>
            <div className="mlb-find-saved-result__games">
              <span><small>QUESTIONS</small><b>{completedQuestions}/8</b></span>
              <span><small>WALKED WITH</small><b>{"$"}{finalMoney.toLocaleString()}</b></span>
            </div>
            <p>Your official score is locked. Replays do not change the postseason standings.</p>
            {recordError ? <p>{recordError}</p> : null}
            <div className="mlb-find-final-actions">
              <button
                className="primary-action"
                type="button"
                onClick={() => {
                  setPracticeMode(true);
                  setRecordError("");
                }}
              >
                PLAY AGAIN
              </button>
              <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
                MLB PLAY
              </button>
            </div>
          </section>
        </div>
      );
    }

    return (
      <MillionaireCasualPage
        scope="mlb"
        accessMode="production"
        runOverride={MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03}
        onSettled={(nextResult) => {
          if (!practiceMode) void saveOfficialMillionaireResult(nextResult);
        }}
      />
    );
  }

  if (challenge.game_type !== "find_leader") {
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
          <h1>{challenge.title}</h1>
          <p>This challenge is scheduled, but its game experience has not been activated yet.</p>
          <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
            MLB PLAY
          </button>
        </section>
      </div>
    );
  }

  if (overviewLoading && !overview && !practiceMode) {
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
          <h1>Loading your challenge…</h1>
        </section>
      </div>
    );
  }

  if (savedResult && !practiceMode && completedScores.length === 0) {
    const scores = storedGameScores(savedResult.publicResult);
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">OFFICIAL RESULT</p>
          <h1>Find the Leader</h1>
          <strong>{savedResult.rawScore}<small>/100</small></strong>
          {scores.length ? (
            <div className="mlb-find-saved-result__games">
              {scores.map((score, index) => (
                <span key={index}>
                  <small>GAME {index + 1}</small>
                  <b>{score}</b>
                </span>
              ))}
            </div>
          ) : null}
          <p>Your official score is locked. Replays do not change the postseason standings.</p>
          <div className="mlb-find-final-actions">
            <button
              className="primary-action"
              type="button"
              onClick={() => {
                setPracticeMode(true);
                resetChallenge();
              }}
            >
              PLAY AGAIN
            </button>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
              MLB PLAY
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page football-find-leader-page mlb-find-leader-page">
      <div className="mlb-find-series-progress" aria-label={`Game ${boardIndex + 1} of ${MLB_FIND_LEADER_PRODUCTION_BOARDS.length}`}>
        <span>FIND THE LEADER</span>
        <strong>GAME {boardIndex + 1} OF {MLB_FIND_LEADER_PRODUCTION_BOARDS.length}</strong>
      </div>

      <FootballFindLeaderPresentation
        question={board.question}
        context={board.context}
        categoryLabel={board.categoryLabel}
        statLabel={board.statLabel}
        shortLabel={board.shortLabel}
        candidates={board.candidates}
        leaderId={leader.id}
        eliminatedIds={eliminated}
        result={result}
        eyebrow="MLB PLAYOFF CHALLENGE"
        intro="Eliminate nine decoys until only the leader remains."
        onNewLineup={null}
        onEliminate={eliminate}
        formatValue={(value) => formatMlbFindLeaderValue(board, value)}
        renderVisual={(candidate, compact) => (
          <MlbFindLeaderVisual
            board={board}
            candidateId={candidate.id}
            candidateName={candidate.name}
            compact={compact}
          />
        )}
      />

      {result && !isLastBoard ? (
        <section className="mlb-find-between-games">
          <div>
            <span>GAME 1 COMPLETE</span>
            <strong>{result.score}<small>/100</small></strong>
            <p>One more board. Your two scores will be averaged.</p>
          </div>
          <button className="primary-action" type="button" onClick={() => resetBoard(boardIndex + 1)}>
            NEXT GAME →
          </button>
        </section>
      ) : null}

      {result && isLastBoard && finalScore !== null ? (
        <section className="mlb-find-final-score">
          <p className="eyebrow">{practiceMode ? "REPLAY SCORE" : "FINAL SCORE"}</p>
          <strong>{finalScore}<small>/100</small></strong>
          <div>
            <span>GAME 1 <b>{completedScores[0]}</b></span>
            <span>GAME 2 <b>{completedScores[1]}</b></span>
          </div>
          <p>
            {practiceMode
              ? "Replay complete. Your locked official result does not change."
              : recording
                ? "Saving your official postseason result…"
                : recordError
                  ? recordError
                  : "Final score is the average of both Find the Leader boards."}
          </p>
          <div className="mlb-find-final-actions">
            <button
              className="primary-action"
              type="button"
              onClick={() => {
                if (recordError) {
                  void saveOfficialResult(finalScore, completedGames);
                  return;
                }
                if (!practiceMode) setPracticeMode(true);
                resetChallenge();
              }}
            >
              {recordError ? "RETRY SAVE" : "PLAY AGAIN"}
            </button>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>MLB PLAY</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
