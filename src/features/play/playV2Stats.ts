import type { TodayChallengeHistoryRow } from "./todayChallengeRepository";
import { todayChallengeAdapter } from "./todaysChallengeAdapters";

export interface PlayV2GameSummary {
  gameType: TodayChallengeHistoryRow["gameType"];
  title: string;
  count: number;
  average: number;
  best: number;
  latest: number;
}

export interface PlayV2Performance {
  count: number;
  average: number | null;
  best: number | null;
  lastFiveAverage: number | null;
  previousFiveAverage: number | null;
  recent: TodayChallengeHistoryRow[];
  byGame: PlayV2GameSummary[];
}

export function summarizePlayV2History(history: readonly TodayChallengeHistoryRow[]): PlayV2Performance {
  // Treat every official saved attempt as one game. Never use Championship
  // placement points here: those are a separate metric.
  const valid = history
    .filter((attempt) =>
      Number.isFinite(attempt.normalizedScore)
      && attempt.normalizedScore >= 0
      && attempt.normalizedScore <= 100
      && Number.isFinite(new Date(attempt.completedAt).getTime()))
    .slice()
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt)
      || b.day.localeCompare(a.day) || a.gameType.localeCompare(b.gameType));
  const average = (values: readonly number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const allScores = valid.map((row) => row.normalizedScore);
  const buckets = new Map<TodayChallengeHistoryRow["gameType"], TodayChallengeHistoryRow[]>();
  for (const attempt of valid) {
    const rows = buckets.get(attempt.gameType) ?? [];
    rows.push(attempt);
    buckets.set(attempt.gameType, rows);
  }
  const byGame = [...buckets.entries()].map(([gameType, attempts]) => ({
    gameType,
    title: todayChallengeAdapter(gameType)?.title ?? gameType.replaceAll("_", " "),
    count: attempts.length,
    average: average(attempts.map((attempt) => attempt.normalizedScore)),
    best: Math.max(...attempts.map((attempt) => attempt.normalizedScore)),
    latest: attempts[0].normalizedScore,
  })).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
  return {
    count: valid.length,
    average: valid.length ? average(allScores) : null,
    best: valid.length ? Math.max(...allScores) : null,
    lastFiveAverage: valid.length >= 5 ? average(allScores.slice(0, 5)) : null,
    previousFiveAverage: valid.length >= 10 ? average(allScores.slice(5, 10)) : null,
    recent: valid.slice(0, 10),
    byGame,
  };
}

export function playV2Score(value: number | null | undefined) {
  return value == null || !Number.isFinite(value) ? "—" : value.toFixed(1);
}
