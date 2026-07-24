export interface FindLeaderHistoryRow {
  day: string;
  officialScore: number;
  bestScore: number;
  attempts: number;
  completedAt: string;
}

export interface FindLeaderStreaks {
  current: number;
  best: number;
  perfect: number;
  total: number;
}

const STORAGE_KEY = "octagon-hq:find-leader-history:v2";

function dayOffset(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function loadFindLeaderHistory(): FindLeaderHistoryRow[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is FindLeaderHistoryRow => Boolean(
        row &&
        typeof row === "object" &&
        /^\d{4}-\d{2}-\d{2}$/.test(String((row as FindLeaderHistoryRow).day)) &&
        Number.isFinite(Number((row as FindLeaderHistoryRow).officialScore)),
      ))
      .map((row) => ({
        day: row.day,
        officialScore: Number(row.officialScore),
        bestScore: Number(row.bestScore),
        attempts: Math.max(1, Number(row.attempts) || 1),
        completedAt: String(row.completedAt || `${row.day}T12:00:00Z`),
      }))
      .sort((left, right) => right.day.localeCompare(left.day));
  } catch {
    return [];
  }
}

function save(rows: FindLeaderHistoryRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, 180)));
}

export function recordFindLeaderAttempt(day: string, score: number) {
  const rows = loadFindLeaderHistory();
  const existing = rows.find((row) => row.day === day);
  if (existing) {
    existing.bestScore = Math.max(existing.bestScore, score);
    existing.attempts += 1;
  } else {
    rows.push({
      day,
      officialScore: score,
      bestScore: score,
      attempts: 1,
      completedAt: new Date().toISOString(),
    });
  }
  rows.sort((left, right) => right.day.localeCompare(left.day));
  save(rows);
  return rows;
}

export function findLeaderStreaks(rows: readonly FindLeaderHistoryRow[], today: string): FindLeaderStreaks {
  const days = [...new Set(rows.map((row) => row.day))].sort();
  if (!days.length) return { current: 0, best: 0, perfect: 0, total: 0 };

  let best = 1;
  let run = 1;
  for (let index = 1; index < days.length; index += 1) {
    run = dayOffset(days[index - 1], 1) === days[index] ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const last = days.at(-1);
  let current = 0;
  if (last === today || last === dayOffset(today, -1)) {
    current = 1;
    for (let index = days.length - 1; index > 0; index -= 1) {
      if (dayOffset(days[index - 1], 1) !== days[index]) break;
      current += 1;
    }
  }

  return {
    current,
    best,
    perfect: rows.filter((row) => row.officialScore >= 10).length,
    total: rows.length,
  };
}

export function recentCalendarDays(today: string, count = 28) {
  return Array.from({ length: count }, (_, index) => dayOffset(today, index - count + 1));
}
