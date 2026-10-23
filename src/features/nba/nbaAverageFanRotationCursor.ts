const KEY = "octagon-hq:nba-average-fan-rotation:v1";
export type NbaAverageFanCursor = { cursor: number; seed: string };
export function readNbaAverageFanCursor(): NbaAverageFanCursor {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as NbaAverageFanCursor | null;
    if (saved && Number.isSafeInteger(saved.cursor) && saved.cursor >= 0 && typeof saved.seed === "string" && saved.seed.length > 0) return saved;
    const initial = { cursor: 0, seed: Math.random().toString(36).slice(2) };
    window.localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  } catch { return { cursor: 0, seed: "nba-fallback" }; }
}
/** Advance on a completed Casual game only; no answer or score is persisted. */
export function advanceNbaAverageFanCursor(expected: NbaAverageFanCursor) {
  try {
    const current = readNbaAverageFanCursor();
    if (current.seed !== expected.seed || current.cursor !== expected.cursor) return;
    window.localStorage.setItem(KEY, JSON.stringify({ ...current, cursor: current.cursor + 1 }));
  } catch { /* storage unavailable: casual remains playable */ }
}
