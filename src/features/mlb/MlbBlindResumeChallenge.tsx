import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OfficialBlindResumeV3DailyView } from "../play/OfficialBlindResumeV3DailyView";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import { blindResumeV3RoundPoints } from "../play/todaysChallengeRuntime";
import {
  recordMlbPlayChallengeResult,
  type MlbPlayChallengeResult,
} from "./mlbPlayChallenge";
import { mlbTeamAssetByAbbreviation } from "./mlbTeamAssets";
import { useMlbPlayChallengeOverview } from "./useMlbPlayChallengeOverview";

type JsonRecord = Record<string, unknown>;

export type MlbBlindResumeSubject = {
  id: string;
  name: string;
  teamAbbreviation: string;
  subtitle: string;
};

export type MlbBlindResumeRound = {
  id: string;
  playerA: MlbBlindResumeSubject;
  playerB: MlbBlindResumeSubject;
  winnerId: string;
  stats: readonly {
    label: string;
    valueA: string;
    valueB: string;
  }[];
};

type MlbBlindResumeChallengeProps = {
  rounds: readonly MlbBlindResumeRound[];
  challengeDate: string;
  scheduleVersion: string;
  mode?: "owner_review" | "production";
  challengeKey?: string;
  season?: number;
};

function presentation(subject: MlbBlindResumeSubject) {
  const asset = mlbTeamAssetByAbbreviation(subject.teamAbbreviation);
  return {
    id: subject.id,
    name: subject.name,
    gender: "",
    thumb_url: asset?.logoUrl ?? "",
    profile_url: asset?.logoUrl ?? "",
    subtitle: subject.subtitle,
  };
}

function visibleRound(rounds: readonly MlbBlindResumeRound[], roundIndex: number, revealedCount: number) {
  const round = rounds[roundIndex];
  if (!round) return null;
  return {
    round_index: roundIndex,
    round_number: roundIndex + 1,
    player_a_label: "PLAYER A",
    player_b_label: "PLAYER B",
    revealed_count: revealedCount,
    correct_points: blindResumeV3RoundPoints(revealedCount, true),
    miss_points: blindResumeV3RoundPoints(revealedCount, false),
    stats: round.stats.map((stat, index) => ({
      label: stat.label,
      revealed: index < revealedCount,
      value_a: index < revealedCount ? stat.valueA : null,
      value_b: index < revealedCount ? stat.valueB : null,
    })),
  };
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function storedRoundPoints(result: MlbPlayChallengeResult | null) {
  if (!result) return [];
  const publicPoints = result.publicResult.round_points;
  if (Array.isArray(publicPoints)) {
    return publicPoints.filter((point): point is number => typeof point === "number");
  }
  return records(result.resultDetail.rounds).map((round) => Number(round.points ?? 0));
}

export default function MlbBlindResumeChallenge({
  rounds,
  challengeDate,
  scheduleVersion,
  mode = "owner_review",
  challengeKey = "",
  season = 2026,
}: MlbBlindResumeChallengeProps) {
  const navigate = useNavigate();
  const productionMode = mode === "production";
  const setupKey = `blind-resume-v3:${scheduleVersion}:${challengeDate}`;
  const {
    overview,
    loading: overviewLoading,
    reload: reloadOverview,
  } = useMlbPlayChallengeOverview({
    enabled: productionMode && Boolean(challengeKey),
    season,
    challengeKey,
  });

  const [answers, setAnswers] = useState<JsonRecord[]>([]);
  const [results, setResults] = useState<JsonRecord[]>([]);
  const [revealedCount, setRevealedCount] = useState(2);
  const [attempt, setAttempt] = useState<TodayChallengeProjection["officialAttempt"]>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState("");
  const [pendingResult, setPendingResult] = useState<MlbPlayChallengeResult | null>(null);

  const savedResult = productionMode ? overview?.ownResult ?? null : null;

  const publicState = useMemo<JsonRecord>(() => ({
    complete: Boolean(attempt),
    round_index: attempt ? rounds.length : answers.length,
    results,
    current_round: attempt ? null : visibleRound(rounds, answers.length, revealedCount),
  }), [answers.length, attempt, results, revealedCount, rounds]);

  const projection = useMemo<TodayChallengeProjection>(() => ({
    available: true,
    id: productionMode ? challengeKey : "00000000-0000-4000-8000-000000001009",
    centralDay: challengeDate,
    scheduleVersion,
    gameType: "blind_resume",
    setupKey,
    contentVersion: "blind-resume-v3",
    scoringVersion: "play-official-score-v3",
    fallbackReason: null,
    publicSetup: {
      sport: "mlb",
      round_count: rounds.length,
      reveal_counts: [2, 4, 6, 8],
      correct_points: [20, 19, 18, 17],
      miss_points: [2, 4, 6, 8],
    },
    progressRevision: answers.length + revealedCount,
    publicState,
    revealSetup: attempt ? {
      rounds: rounds.map((round, roundIndex) => ({
        round_index: roundIndex,
        player_a: presentation(round.playerA),
        player_b: presentation(round.playerB),
        winner_id: round.winnerId,
      })),
    } : null,
    officialAttempt: attempt,
    deploymentSha: productionMode ? "mlb-blind-resume-production" : "owner-run",
  }), [
    answers.length,
    attempt,
    challengeDate,
    challengeKey,
    productionMode,
    publicState,
    revealedCount,
    rounds,
    scheduleVersion,
    setupKey,
  ]);

  function resetChallenge(asPractice: boolean) {
    setPracticeMode(asPractice);
    setAnswers([]);
    setResults([]);
    setRevealedCount(2);
    setAttempt(null);
    setRecordError("");
    setPendingResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completedResult(nextAnswers: JsonRecord[], nextResults: JsonRecord[]): MlbPlayChallengeResult {
    const normalizedScore = nextResults.reduce((sum, result) => sum + Number(result.points_awarded ?? 0), 0);
    const correctPicks = nextResults.filter((result) => result.correct === true).length;
    return {
      rawScore: normalizedScore,
      gameType: "blind_resume",
      publicResult: {
        correct_picks: correctPicks,
        points: normalizedScore,
        round_points: nextResults.map((result) => Number(result.points_awarded ?? 0)),
        answers: nextAnswers,
      },
      resultDetail: {
        rounds: nextResults.map((result, index) => {
          const round = rounds[index]!;
          return {
            round: index + 1,
            correct: result.correct === true,
            points: Number(result.points_awarded ?? 0),
            revealed_count: Number(result.revealed_count ?? 0),
            picked_id: String(result.picked_id ?? ""),
            winner_id: String(result.winner_id ?? ""),
            player_a: {
              id: round.playerA.id,
              name: round.playerA.name,
              team_abbreviation: round.playerA.teamAbbreviation,
              subtitle: round.playerA.subtitle,
            },
            player_b: {
              id: round.playerB.id,
              name: round.playerB.name,
              team_abbreviation: round.playerB.teamAbbreviation,
              subtitle: round.playerB.subtitle,
            },
          };
        }),
      },
      completedAt: new Date().toISOString(),
    };
  }

  async function saveProductionResult(result: MlbPlayChallengeResult) {
    if (!productionMode || practiceMode || recording) return;
    setRecording(true);
    setRecordError("");
    try {
      await recordMlbPlayChallengeResult({
        season,
        challengeKey,
        rawScore: result.rawScore,
        gameType: result.gameType,
        publicResult: result.publicResult,
        resultDetail: result.resultDetail,
      });
      await reloadOverview();
    } catch (nextError) {
      setRecordError(nextError instanceof Error
        ? nextError.message
        : "Your official MLB Blind Resume result could not be recorded.");
    } finally {
      setRecording(false);
    }
  }

  function advance(action: JsonRecord) {
    if (attempt) return;
    const roundIndex = answers.length;
    const round = rounds[roundIndex];
    if (!round) return;

    if (action.reveal === true) {
      if (revealedCount < 8) setRevealedCount((value) => Math.min(8, value + 2));
      return;
    }

    const side = String(action.choice ?? "").toUpperCase();
    if (side !== "A" && side !== "B") return;
    const pickedId = side === "A" ? round.playerA.id : round.playerB.id;
    const correct = pickedId === round.winnerId;
    const pointsAwarded = blindResumeV3RoundPoints(revealedCount, correct);
    const nextAnswers = [...answers, { choice: pickedId, revealed_count: revealedCount }];
    const nextResults = [...results, {
      round_index: roundIndex,
      picked_side: side,
      picked_id: pickedId,
      winner_id: round.winnerId,
      correct,
      revealed_count: revealedCount,
      points_awarded: pointsAwarded,
      fighter_a: presentation(round.playerA),
      fighter_b: presentation(round.playerB),
    }];

    setAnswers(nextAnswers);
    setResults(nextResults);
    setRevealedCount(2);

    if (nextAnswers.length === rounds.length) {
      const result = completedResult(nextAnswers, nextResults);
      const correctPicks = Number(result.publicResult.correct_picks ?? 0);
      setPendingResult(result);
      setAttempt({
        nativeScore: correctPicks,
        normalizedScore: result.rawScore,
        completedAt: result.completedAt,
        publicResult: result.publicResult,
      });
      if (productionMode && !practiceMode) void saveProductionResult(result);
    }
  }

  if (productionMode && overviewLoading && !overview && !practiceMode && !attempt) {
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
          <h1>Loading your challenge…</h1>
        </section>
      </div>
    );
  }

  if (savedResult && !practiceMode && !attempt) {
    const points = storedRoundPoints(savedResult);
    const correctPicks = Number(savedResult.publicResult.correct_picks ?? 0);
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">OFFICIAL RESULT</p>
          <h1>Blind Resume</h1>
          <strong>{savedResult.rawScore}<small>/100</small></strong>
          {points.length ? (
            <div className="mlb-find-saved-result__games">
              {points.map((point, index) => (
                <span key={index}>
                  <small>ROUND {index + 1}</small>
                  <b>{point}</b>
                </span>
              ))}
            </div>
          ) : null}
          <p>{correctPicks}-{Math.max(0, rounds.length - correctPicks)} record. Your official score is locked; replays do not change the postseason standings.</p>
          <div className="mlb-find-final-actions">
            <button className="primary-action" type="button" onClick={() => resetChallenge(true)}>
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
    <>
      <OfficialBlindResumeV3DailyView
        projection={projection}
        busy={recording}
        onAdvance={advance}
        onNavigate={(route) => navigate(route === "/play" ? "/mlb" : route)}
      />

      {productionMode && attempt ? (
        <section className="mlb-find-final-score mlb-blind-resume-save-status" aria-label="MLB Blind Resume official result status">
          <p>
            {practiceMode
              ? "Replay complete. Your locked official result does not change."
              : recording
                ? "Saving your official postseason result…"
                : recordError
                  ? recordError
                  : "Your official postseason score is locked."}
          </p>
          <div className="mlb-find-final-actions">
            <button
              className="primary-action"
              type="button"
              onClick={() => {
                if (recordError && pendingResult) {
                  void saveProductionResult(pendingResult);
                  return;
                }
                resetChallenge(true);
              }}
            >
              {recordError ? "RETRY SAVE" : "PLAY AGAIN"}
            </button>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
              MLB PLAY
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
