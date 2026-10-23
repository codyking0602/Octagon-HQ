import { buildAverageFanCasualBoard, type AverageFanCasualBoard } from "./averageFanCasualBoard";

/** Only question IDs are retained locally; no answers, scores, fans, or completed runs. */
export const NBA_AVERAGE_FAN_ROTATION_KEY = "octagon-hq:nba-average-fan:four-month-rotation:v1";
export const NBA_AVERAGE_FAN_ROTATION_GAMES = 20;

export type NbaAverageFanRotation = {
  games: number;
  questionIds: string[];
};

const EMPTY_ROTATION: NbaAverageFanRotation = { games: 0, questionIds: [] };

export function parseNbaAverageFanRotation(raw: string | null): NbaAverageFanRotation {
  if (!raw) return { ...EMPTY_ROTATION, questionIds: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("games" in parsed) || !("questionIds" in parsed)) {
      return { ...EMPTY_ROTATION, questionIds: [] };
    }
    const { games, questionIds } = parsed as Record<string, unknown>;
    if (typeof games !== "number" || !Number.isInteger(games) || games < 0
      || games > NBA_AVERAGE_FAN_ROTATION_GAMES || !Array.isArray(questionIds)
      || questionIds.length !== games * 9 || questionIds.some((id) => typeof id !== "string")
      || new Set(questionIds).size !== questionIds.length) {
      return { ...EMPTY_ROTATION, questionIds: [] };
    }
    return { games, questionIds: [...questionIds] };
  } catch {
    return { ...EMPTY_ROTATION, questionIds: [] };
  }
}

export function readNbaAverageFanRotation(): NbaAverageFanRotation {
  try {
    return parseNbaAverageFanRotation(typeof window === "undefined" ? null : window.localStorage.getItem(NBA_AVERAGE_FAN_ROTATION_KEY));
  } catch {
    return { ...EMPTY_ROTATION, questionIds: [] };
  }
}

export function nextNbaAverageFanRotatingBoard(
  seed: string,
  rotation: NbaAverageFanRotation,
  now: Date | string = new Date(),
): { board: AverageFanCasualBoard; next: NbaAverageFanRotation } {
  const current = rotation.games >= NBA_AVERAGE_FAN_ROTATION_GAMES
    ? EMPTY_ROTATION : rotation;
  const board = buildAverageFanCasualBoard("nba", seed, now, new Set(current.questionIds));
  return {
    board,
    next: {
      games: current.games + 1,
      questionIds: [...current.questionIds, ...board.questions.map((question) => question.id), board.finalQuestion.id],
    },
  };
}

/** Reserve at Start, not at page load, fan selection or Daily-style preview. */
export function reserveNbaAverageFanRotatingBoard(seed: string): AverageFanCasualBoard {
  const { board, next } = nextNbaAverageFanRotatingBoard(seed, readNbaAverageFanRotation());
  try {
    window.localStorage.setItem(NBA_AVERAGE_FAN_ROTATION_KEY, JSON.stringify(next));
  } catch {
    // Browsers with disabled storage remain playable; only rotation persistence is unavailable.
  }
  return board;
}
