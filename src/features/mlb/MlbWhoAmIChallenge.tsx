import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { WhoAmIRound } from "../games/whoAmIEngine";
import { OfficialWhoAmIDailyView } from "../play/OfficialWhoAmIDailyView";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import {
  OFFICIAL_DAILY_RUNTIME_VERSION,
  OFFICIAL_DAILY_SCORING_VERSION,
  type OfficialDailyRuntimeContext,
} from "../play/todaysChallengeRuntime";
import {
  advanceTwoRoundWhoAmIDailyRuntime,
  buildTwoRoundWhoAmIDailyPublication,
} from "../play/whoAmITwoRoundDailyRuntime";
import {
  recordMlbPlayChallengeResult,
  type MlbPlayChallengeResult,
} from "./mlbPlayChallenge";
import { useMlbPlayChallengeOverview } from "./useMlbPlayChallengeOverview";

type JsonRecord = Record<string, unknown>;

type MlbWhoAmIChallengeProps = {
  rounds: readonly [WhoAmIRound, WhoAmIRound];
  scriptIds: readonly [string, string];
  challengeDate: string;
  scheduleVersion: string;
  mode?: "owner_review" | "production";
  challengeKey?: string;
  season?: number;
};

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function storedRoundScores(result: MlbPlayChallengeResult | null) {
  if (!result) return [];
  const scores = result.publicResult.round_scores;
  if (Array.isArray(scores)) {
    return scores.filter((score): score is number => typeof score === "number");
  }
  return records(result.publicResult.rounds).map((round) => Number(round.score ?? 0));
}

export default function MlbWhoAmIChallenge({
  rounds,
  scriptIds,
  challengeDate,
  scheduleVersion,
  mode = "owner_review",
  challengeKey = "",
  season = 2026,
}: MlbWhoAmIChallengeProps) {
  const navigate = useNavigate();
  const productionMode = mode === "production";
  const publication = useMemo(() => buildTwoRoundWhoAmIDailyPublication(
    [
      { round: rounds[0], scriptId: scriptIds[0] },
      { round: rounds[1], scriptId: scriptIds[1] },
    ],
    challengeDate,
    scheduleVersion,
    OFFICIAL_DAILY_RUNTIME_VERSION,
    OFFICIAL_DAILY_SCORING_VERSION,
  ), [challengeDate, rounds, scheduleVersion, scriptIds]);

  const {
    overview,
    loading: overviewLoading,
    reload: reloadOverview,
  } = useMlbPlayChallengeOverview({
    enabled: productionMode && Boolean(challengeKey),
    season,
    challengeKey,
  });

  const [publicState, setPublicState] = useState<JsonRecord>(() => record(publication.publicSetup.initial_state));
  const [submissionState, setSubmissionState] = useState<JsonRecord>({ rounds: [], final_submission: null });
  const [attempt, setAttempt] = useState<TodayChallengeProjection["officialAttempt"]>(null);
  const [revision, setRevision] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState("");
  const [pendingResult, setPendingResult] = useState<MlbPlayChallengeResult | null>(null);

  const savedResult = productionMode ? overview?.ownResult ?? null : null;

  const projection = useMemo<TodayChallengeProjection>(() => ({
    available: true,
    id: productionMode ? challengeKey : "00000000-0000-4000-8000-000000000406",
    centralDay: challengeDate,
    scheduleVersion,
    gameType: "who_am_i",
    setupKey: publication.setupKey,
    contentVersion: publication.contentVersion,
    scoringVersion: publication.scoringVersion,
    fallbackReason: null,
    publicSetup: publication.publicSetup,
    progressRevision: revision,
    publicState,
    revealSetup: attempt ? publication.revealSetup : null,
    officialAttempt: attempt,
    deploymentSha: productionMode ? "mlb-who-am-i-production" : "owner-run",
  }), [
    attempt,
    challengeDate,
    challengeKey,
    productionMode,
    publication,
    publicState,
    revision,
    scheduleVersion,
  ]);

  function resetChallenge(asPractice: boolean) {
    setPracticeMode(asPractice);
    setPublicState(record(publication.publicSetup.initial_state));
    setSubmissionState({ rounds: [], final_submission: null });
    setAttempt(null);
    setRevision(0);
    setRecordError("");
    setPendingResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completedResult(nextState: JsonRecord): MlbPlayChallengeResult {
    const completedRounds = records(nextState.completed_rounds);
    const score = Number(nextState.score ?? 0);
    const revealRounds = records(publication.revealSetup.rounds);
    const roundScores = completedRounds.map((round) => Number(round.score ?? 0));

    return {
      rawScore: score,
      gameType: "who_am_i",
      publicResult: {
        round_scores: roundScores,
        average_score: score,
        rounds: completedRounds,
      },
      resultDetail: {
        rounds: completedRounds.map((round, index) => {
          const reveal = revealRounds[index] ?? {};
          const identity = record(reveal.identity);
          return {
            round: index + 1,
            score: Number(round.score ?? 0),
            outcome: String(round.outcome ?? ""),
            revealed_count: Number(round.revealed_count ?? 0),
            wrong_guesses: Number(round.wrong_guesses ?? 0),
            recovery_wrong_guesses: Number(round.recovery_wrong_guesses ?? 0),
            identity: {
              id: String(identity.id ?? ""),
              name: String(identity.name ?? ""),
              kind: String(identity.kind ?? "player"),
            },
            clues: records(reveal.clues).map((clue) => ({
              id: String(clue.id ?? ""),
              text: String(clue.text ?? ""),
            })),
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
        : "Your official MLB Who Am I result could not be recorded.");
    } finally {
      setRecording(false);
    }
  }

  function advance(action: JsonRecord) {
    if (attempt) return;
    const context: OfficialDailyRuntimeContext = {
      gameType: "who_am_i",
      setupKey: publication.setupKey,
      publicSetup: publication.publicSetup,
      revealSetup: publication.revealSetup,
      privateSetupEvidence: publication.privateSetupEvidence,
      privateGradingEvidence: publication.privateGradingEvidence,
      submissionState,
      publicState,
    };
    const next = advanceTwoRoundWhoAmIDailyRuntime(context, action);
    setSubmissionState(next.submissionState);
    setPublicState(next.publicState);
    setRevision((value) => value + 1);

    if (next.complete) {
      const result = completedResult(next.publicState);
      setPendingResult(result);
      setAttempt({
        nativeScore: result.rawScore,
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
    const scores = storedRoundScores(savedResult);
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">OFFICIAL RESULT</p>
          <h1>Who Am I?</h1>
          <strong>{savedResult.rawScore}<small>/100</small></strong>
          {scores.length ? (
            <div className="mlb-find-saved-result__games">
              {scores.map((score, index) => (
                <span key={index}>
                  <small>ROUND {index + 1}</small>
                  <b>{score}</b>
                </span>
              ))}
            </div>
          ) : null}
          <p>Your official score is locked. Replays do not change the postseason standings.</p>
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
      <OfficialWhoAmIDailyView
        projection={projection}
        busy={recording}
        onAdvance={advance}
      />

      {productionMode && attempt ? (
        <section className="mlb-find-final-score mlb-who-am-i-save-status" aria-label="MLB Who Am I official result status">
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
