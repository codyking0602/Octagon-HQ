export interface StoredBlindResumeResult {
  roundIndex: number;
  pickedId: string;
  winnerId: string;
  correct: boolean;
}

export interface BlindResumeSession {
  roundIndex: number;
  results: StoredBlindResumeResult[];
  currentResult: StoredBlindResumeResult | null;
}

const PREFIX = "octagon-hq:blind-resume-session:v2:";

function key(sessionId: string) {
  return `${PREFIX}${sessionId}`;
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
