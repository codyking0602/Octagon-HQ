import type { TodayChallengeProjection } from "./todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function numberArray(value: unknown) {
  return Array.isArray(value)
    ? value.map(Number).filter((item) => Number.isFinite(item))
    : [];
}

export function dailyTwoGameLeaderboardPublicState(
  publicState: Record<string, unknown>,
  publicResult: Record<string, unknown>,
) {
  if (publicState.format_version !== "daily-two-game-average-v1") return publicState;
  const activeRound = record(publicState.active_round);
  if (!activeRound) return publicState;

  const finalSeries = record(publicResult.daily_series);
  const roundScores = numberArray(finalSeries?.round_scores ?? publicState.round_scores);
  const rawIndex = Number(publicState.round_index ?? Math.max(0, roundScores.length - 1));
  const gameIndex = Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex <= 1 ? rawIndex : 0;
  const average = Number(finalSeries?.average_score ?? publicState.score);
  const series: JsonRecord = {
    ...(finalSeries ?? {}),
    format_version: "daily-two-game-average-v1",
    game_index: gameIndex,
    game_number: gameIndex + 1,
    game_count: 2,
    awaiting_next: false,
    complete: true,
    round_scores: roundScores,
    average_score: Number.isFinite(average) ? average : null,
  };

  return {
    ...activeRound,
    daily_series: series,
  };
}

export interface DailyTwoGameSeriesState {
  gameIndex: number;
  gameNumber: number;
  gameCount: number;
  awaitingNext: boolean;
  complete: boolean;
  roundScores: number[];
  averageScore: number | null;
}

export function dailyTwoGameSeriesState(
  projection: TodayChallengeProjection,
): DailyTwoGameSeriesState | null {
  const live = record(projection.publicState.daily_series)
    ?? (projection.publicState.format_version === "daily-two-game-average-v1"
      ? projection.publicState
      : null);
  const final = record(projection.officialAttempt?.publicResult.daily_series);
  const source = final ?? live;
  if (!source || source.format_version !== "daily-two-game-average-v1") return null;

  const roundScores = numberArray(source.round_scores);
  const rawIndex = Number(source.game_index ?? Math.max(0, roundScores.length - 1));
  const gameIndex = Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex <= 1 ? rawIndex : 0;
  const rawAverage = source.average_score;
  const averageScore = Number.isFinite(Number(rawAverage)) ? Number(rawAverage) : null;

  return {
    gameIndex,
    gameNumber: Number(source.game_number ?? gameIndex + 1),
    gameCount: Number(source.game_count ?? 2),
    awaitingNext: source.awaiting_next === true,
    complete: source.complete === true || Boolean(projection.officialAttempt),
    roundScores,
    averageScore,
  };
}

export function dailyTwoGameActiveScore(projection: TodayChallengeProjection) {
  const series = dailyTwoGameSeriesState(projection);
  if (!series) return projection.officialAttempt?.normalizedScore ?? null;
  const score = series.roundScores[series.gameIndex];
  return Number.isFinite(score) ? score : projection.officialAttempt?.normalizedScore ?? null;
}

export function DailyTwoGameStatus({
  projection,
  busy = false,
  onAdvance,
}: {
  projection: TodayChallengeProjection;
  busy?: boolean;
  onAdvance?: (action: Record<string, unknown>) => void;
}) {
  const series = dailyTwoGameSeriesState(projection);
  if (!series) return null;

  if (series.awaitingNext) {
    const first = series.roundScores[0];
    return (
      <section className="daily-two-game-intermission" aria-live="polite">
        <p className="eyebrow">GAME 1 OF 2 COMPLETE</p>
        <strong>{Number.isFinite(first) ? Math.round(first) : "—"}<small>/100</small></strong>
        <p>Your first score is locked. Game 2 decides the Daily average.</p>
        {onAdvance ? (
          <button type="button" disabled={busy} onClick={() => onAdvance({ type: "next_game" })}>
            {busy ? "LOADING…" : "PLAY GAME 2"}
          </button>
        ) : null}
      </section>
    );
  }

  if (series.complete) {
    const [first, second] = series.roundScores;
    return (
      <section className="daily-two-game-final" aria-label="Two-game Daily score">
        <span>DAILY AVERAGE</span>
        <strong>{Math.round(series.averageScore ?? projection.officialAttempt?.normalizedScore ?? 0)}<small>/100</small></strong>
        <p>GAME 1 {Number.isFinite(first) ? Math.round(first) : "—"} · GAME 2 {Number.isFinite(second) ? Math.round(second) : "—"}</p>
      </section>
    );
  }

  const first = series.roundScores[0];
  return (
    <div className="daily-two-game-progress" aria-label={`Game ${series.gameNumber} of ${series.gameCount}`}>
      <strong>GAME {series.gameNumber} OF {series.gameCount}</strong>
      {series.gameNumber === 2 && Number.isFinite(first) ? <span>GAME 1 · {Math.round(first)}/100</span> : null}
    </div>
  );
}
