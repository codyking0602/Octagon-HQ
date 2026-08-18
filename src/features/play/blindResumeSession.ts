export type BlindResumeRevealCount = 2 | 4 | 6 | 8;

export interface StoredBlindResumeResult {
  roundIndex: number;
  pickedId: string;
  winnerId: string;
  correct: boolean;
  revealedCount?: BlindResumeRevealCount;
  pointsAwarded?: number;
}

export interface BlindResumeSession {
  roundIndex: number;
  results: StoredBlindResumeResult[];
  currentResult: StoredBlindResumeResult | null;
  revealedCount?: BlindResumeRevealCount;
}

const PREFIX = "octagon-hq:blind-resume-session:v2:";
const REVEAL_COUNTS = new Set<BlindResumeRevealCount>([2, 4, 6, 8]);

function key(sessionId: string) {
  return `${PREFIX}${sessionId}`;
}

function revealCount(value: unknown): BlindResumeRevealCount | undefined {
  return REVEAL_COUNTS.has(value as BlindResumeRevealCount)
    ? value as BlindResumeRevealCount
    : undefined;
}

export function loadBlindResumeSession(sessionId: string): BlindResumeSession | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(key(sessionId)) ?? "null") as BlindResumeSession | null;
    if (!parsed || !Number.isInteger(parsed.roundIndex) || !Array.isArray(parsed.results)) return null;
    return {
      roundIndex: Math.max(0, Math.min(4, parsed.roundIndex)),
      results: parsed.results.slice(0, 5),
      currentResult: parsed.currentResult ?? null,
      revealedCount: revealCount(parsed.revealedCount),
    };
  } catch {
    return null;
  }
}

export function saveBlindResumeSession(sessionId: string, session: BlindResumeSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key(sessionId), JSON.stringify(session));
}

export function clearBlindResumeSession(sessionId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key(sessionId));
}
