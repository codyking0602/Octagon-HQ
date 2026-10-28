import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FamilyFeudPack } from "../games/familyFeudEngine";
import OfficialSportsFeudDailyView from "../play/OfficialSportsFeudDailyView";
import {
  advanceFamilyFeudDailyRuntime,
  buildFamilyFeudDailySetup,
} from "../play/familyFeudDailyRuntime";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import {
  recordMlbPlayChallengeResult,
  type MlbPlayChallengeResult,
} from "./mlbPlayChallenge";
import { useMlbPlayChallengeOverview } from "./useMlbPlayChallengeOverview";

type JsonRecord = Record<string, unknown>;

export type MlbSportsFeudChallengeConfig = {
  pack: FamilyFeudPack;
  challengeDate: string;
  scheduleVersion: string;
  challengeKey: string;
};

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function foundBoardPoints(board: JsonRecord) {
  return records(board.slots).reduce((sum, slot) => (
    sum + (slot.found === true ? Number(slot.points ?? 0) : 0)
  ), 0);
}

function resultDetailFromPublicState(publicState: JsonRecord) {
  const mainBoards = records(publicState.main_boards);
  const fastMoney = record(publicState.fast_money);
  return {
    main_boards: mainBoards.map((board, index) => ({
      round: index + 1,
      prompt: String(board.prompt ?? ""),
      points: foundBoardPoints(board),
      strikes: Number(board.strikes ?? 0),
      found_answers: records(board.answer_reveal)
        .filter((answer) => answer.found === true)
        .map((answer) => String(record(answer.entity).display_name ?? ""))
        .filter(Boolean),
      board_answers: records(board.answer_reveal).map((answer) => ({
        name: String(record(answer.entity).display_name ?? ""),
        points: Number(answer.points ?? 0),
        found: answer.found === true,
      })),
    })),
    fast_money: {
      points: Number(fastMoney.points ?? 0),
      time_remaining_ms: Number(fastMoney.time_remaining_ms ?? 0),
      results: records(fastMoney.results).map((row) => ({
        prompt: String(row.prompt ?? ""),
        submitted_answer: String(row.submitted_answer ?? "NO ANSWER"),
        points: Number(row.points ?? 0),
        counted: row.counted === true,
      })),
    },
  };
}

function storedBreakdown(result: MlbPlayChallengeResult | null) {
  if (!result) return { main: 0, fast: 0 };
  return {
    main: Number(result.publicResult.main_points ?? 0),
    fast: Number(result.publicResult.fast_money_points ?? 0),
  };
}

export default function MlbSportsFeudChallenge({
  config,
  mode = "production",
  season = 2026,
}: {
  config: MlbSportsFeudChallengeConfig;
  mode?: "owner_review" | "production";
  season?: number;
}) {
  const navigate = useNavigate();
  const productionMode = mode === "production";
  const publication = useMemo(
    () => buildFamilyFeudDailySetup(config.pack, config.challengeDate, config.scheduleVersion),
    [config],
  );
  const initialPublicState = () => record(structuredClone(publication.publicSetup.initial_state));

  const {
    overview,
    loading: overviewLoading,
    reload: reloadOverview,
  } = useMlbPlayChallengeOverview({
    enabled: productionMode && Boolean(config.challengeKey),
    season,
    challengeKey: config.challengeKey,
  });

  const [publicState, setPublicState] = useState<JsonRecord>(initialPublicState);
  const [submissionState, setSubmissionState] = useState<JsonRecord>({});
  const [attempt, setAttempt] = useState<TodayChallengeProjection["officialAttempt"]>(null);
  const [revision, setRevision] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState("");
  const [pendingResult, setPendingResult] = useState<MlbPlayChallengeResult | null>(null);

  const savedResult = productionMode ? overview?.ownResult ?? null : null;

  const projection = useMemo<TodayChallengeProjection>(() => ({
    available: true,
    id: config.challengeKey,
    centralDay: config.challengeDate,
    scheduleVersion: config.scheduleVersion,
    gameType: "sports_feud",
    setupKey: publication.setupKey,
    contentVersion: publication.contentVersion,
    scoringVersion: publication.scoringVersion,
    fallbackReason: null,
    publicSetup: publication.publicSetup,
    progressRevision: revision,
    publicState,
    revealSetup: attempt ? publication.revealSetup : null,
    officialAttempt: attempt,
    deploymentSha: productionMode ? "mlb-sports-feud-production" : "mlb-sports-feud-owner-run",
  }), [
    attempt,
    config.challengeDate,
    config.challengeKey,
    config.scheduleVersion,
    productionMode,
    publicState,
    publication,
    revision,
  ]);

  function resetChallenge(asPractice: boolean) {
    setPracticeMode(asPractice);
    setPublicState(initialPublicState());
    setSubmissionState({});
    setAttempt(null);
    setRevision((value) => value + 1);
    setRecordError("");
    setPendingResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProductionResult(result: MlbPlayChallengeResult) {
    if (!productionMode || practiceMode || recording) return;
    setRecording(true);
    setRecordError("");
    try {
      await recordMlbPlayChallengeResult({
        season,
        challengeKey: config.challengeKey,
        rawScore: result.rawScore,
        gameType: result.gameType,
        publicResult: result.publicResult,
        resultDetail: result.resultDetail,
      });
      await reloadOverview();
    } catch (nextError) {
      setRecordError(nextError instanceof Error
        ? nextError.message
        : "Your official MLB Sports Feud result could not be recorded.");
    } finally {
      setRecording(false);
    }
  }

  function advance(action: Record<string, unknown>) {
    if (attempt) return;
    const next = advanceFamilyFeudDailyRuntime({
      setupKey: publication.setupKey,
      publicSetup: publication.publicSetup,
      privateSetupEvidence: publication.privateSetupEvidence,
      submissionState,
    }, action);

    setSubmissionState(next.submissionState);
    setPublicState(next.publicState);
    setRevision((value) => value + 1);

    if (next.complete && next.finalSubmission) {
      const final = next.finalSubmission;
      const score = Number(final.normalized_score ?? 0);
      const completed: MlbPlayChallengeResult = {
        rawScore: score,
        gameType: "sports_feud",
        publicResult: {
          main_points: Number(final.main_points ?? 0),
          fast_money_points: Number(final.fast_money_points ?? 0),
          fast_money_time_remaining_ms: Number(final.fast_money_time_remaining_ms ?? 0),
          score,
        },
        resultDetail: resultDetailFromPublicState(next.publicState),
        completedAt: new Date().toISOString(),
      };
      setPendingResult(completed);
      setAttempt({
        nativeScore: Number(final.native_score ?? score),
        normalizedScore: score,
        completedAt: completed.completedAt,
        publicResult: completed.publicResult,
      });
      if (productionMode && !practiceMode) void saveProductionResult(completed);
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
    const breakdown = storedBreakdown(savedResult);
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">OFFICIAL RESULT</p>
          <h1>Sports Feud</h1>
          <strong>{savedResult.rawScore}<small>/100</small></strong>
          <div className="mlb-find-saved-result__games">
            <span><small>MAIN BOARDS</small><b>{breakdown.main}/60</b></span>
            <span><small>FAST MONEY</small><b>{breakdown.fast}/40</b></span>
          </div>
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

  const resultStatus = !productionMode
    ? undefined
    : practiceMode
      ? "Replay complete. Your locked official result does not change."
      : recording
        ? "Saving your official postseason score…"
        : recordError
          ? recordError
          : attempt
            ? "Your official postseason score is locked."
            : undefined;

  return (
    <OfficialSportsFeudDailyView
      projection={projection}
      busy={recording}
      onAdvance={advance}
      onExit={() => navigate("/mlb")}
      resultStatus={resultStatus}
      onRetryResult={recordError && pendingResult
        ? () => void saveProductionResult(pendingResult)
        : undefined}
    />
  );
}
