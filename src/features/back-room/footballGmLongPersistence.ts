import { nflGmLongValidYearOne, type NflGmLongYearOne } from "./footballGmLongYearOne";
import {
  NFL_GM_LONG_VERSION,
  nflGmLongValidRoster,
  type NflGmLongPick,
  type NflGmLongPlayerFit,
} from "./footballGmLongFoundation";
import { nflGmLongNormalizeLegacyDeadline, nflGmLongValidMidseason, type NflGmLongMidseason } from "./footballGmLongMidseason";
import {
  NFL_GM_LONG_COACH_BUCKETS, NFL_GM_LONG_COACHES,
  type NflGmLongCoachBucket,
} from "./footballGmLongCoaches";

export type NflGmLongPhase = "draft" | "coach-bucket" | "coach-wheel" | "outlook" | "midseason" | "year1";

export interface NflGmLongSave {
  version: typeof NFL_GM_LONG_VERSION;
  profileId: string;
  runId: string;
  phase: NflGmLongPhase;
  picks: NflGmLongPick[];
  teamWheelSpinCount: number;
  previousTeam: string | null;
  pendingTeam: string | null;
  selectedCoachBucket: NflGmLongCoachBucket | null;
  selectedCoach: string | null;
  coachWheelDraw: number | null;
  /** Optional on previously deployed Phase 1 saves; never lose the old run. */
  midseason: NflGmLongMidseason | null;
  /** Absent on historical saves. Year 1 results remain run-owned and immutable. */
  yearOne: NflGmLongYearOne | null;
}

export function nflGmLongStorageKey(profileId: string): string {
  if (!/^[a-z0-9-]{8,128}$/i.test(profileId)) throw new Error("Invalid Long GM owner identity.");
  return `octagon:nfl-gm-long:v1:${profileId}`;
}

export function nflGmLongInitialSave(profileId: string, runId: string): NflGmLongSave {
  if (!runId || runId.length < 8) throw new Error("Long GM requires a real run identifier.");
  return {
    version: NFL_GM_LONG_VERSION,
    profileId,
    runId,
    phase: "draft",
    picks: [],
    teamWheelSpinCount: 0,
    previousTeam: null,
    pendingTeam: null,
    selectedCoachBucket: null,
    selectedCoach: null,
    coachWheelDraw: null,
    midseason: null,
    yearOne: null,
  };
}

/**
 * All owner playtest state lives under a different key/version from Short GM.
 * Validation prevents legacy Short or another owner's session being imported.
 * UI owner gate must independently enforce authorization.
 */
export function nflGmLongParseSave(
  value: unknown,
  profileId: string,
  players: ReadonlyMap<string, NflGmLongPlayerFit>,
): NflGmLongSave | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Partial<NflGmLongSave>;
  if (raw.version !== NFL_GM_LONG_VERSION || raw.profileId !== profileId
    || typeof raw.runId !== "string" || raw.runId.length < 8
    || !["draft", "coach-bucket", "coach-wheel", "outlook", "midseason", "year1"].includes(String(raw.phase))
    || !Array.isArray(raw.picks) || !raw.picks.every(pick =>
      pick && typeof pick.playerId === "string" && typeof pick.slot === "string")
    || !nflGmLongValidRoster(raw.picks, players)
    || !Number.isSafeInteger(raw.teamWheelSpinCount) || raw.teamWheelSpinCount! < 0
    || (raw.previousTeam != null && typeof raw.previousTeam !== "string")
    || (raw.pendingTeam != null && typeof raw.pendingTeam !== "string")
  ) return null;
  const bucket = raw.selectedCoachBucket;
  const coach = raw.selectedCoach;
  if (bucket != null && !NFL_GM_LONG_COACH_BUCKETS.includes(bucket)) return null;
  if (coach != null && !NFL_GM_LONG_COACHES.some(row => row.name === coach && row.bucket === bucket)) return null;
  const draw = raw.coachWheelDraw;
  if (draw != null && (!Number.isFinite(draw) || draw < 0 || draw >= 1)) return null;
  if (raw.phase !== "draft" && raw.picks.length !== 9) return null;
  if ((raw.phase === "coach-wheel" || raw.phase === "outlook") && !bucket) return null;
  if ((raw.phase === "outlook" || raw.phase === "midseason" || raw.phase === "year1") && (!coach || draw == null)) return null;
  const mid = raw.midseason == null ? null : nflGmLongNormalizeLegacyDeadline(raw.midseason);
  if (mid !== null && !nflGmLongValidMidseason(mid, raw.picks)) return null;
  if ((raw.phase === "midseason" || raw.phase === "year1") && mid === null) return null;
  if (mid !== null && raw.phase !== "midseason" && raw.phase !== "year1") return null;
  const yearOne = raw.yearOne ?? null;
  if (raw.phase === "year1" && (mid?.stage !== "complete" || !nflGmLongValidYearOne(yearOne, raw.picks, mid))) return null;
  if (raw.phase !== "year1" && yearOne !== null) return null;
  return {
    version: NFL_GM_LONG_VERSION,
    profileId,
    runId: raw.runId,
    phase: raw.phase!,
    picks: raw.picks,
    teamWheelSpinCount: raw.teamWheelSpinCount!,
    previousTeam: raw.previousTeam ?? null,
    pendingTeam: raw.pendingTeam ?? null,
    selectedCoachBucket: bucket ?? null,
    selectedCoach: coach ?? null,
    coachWheelDraw: draw ?? null,
    midseason: mid,
    yearOne,
  };
}

export function nflGmLongLoadSave(
  storage: Pick<Storage, "getItem">,
  profileId: string,
  players: ReadonlyMap<string, NflGmLongPlayerFit>,
): NflGmLongSave | null {
  try {
    const data = storage.getItem(nflGmLongStorageKey(profileId));
    return data ? nflGmLongParseSave(JSON.parse(data), profileId, players) : null;
  } catch { return null; }
}
export function nflGmLongWriteSave(
  storage: Pick<Storage, "setItem">,
  state: NflGmLongSave,
  players: ReadonlyMap<string, NflGmLongPlayerFit>,
): void {
  if (!nflGmLongParseSave(state, state.profileId, players)) throw new Error("Refusing invalid Long GM save.");
  storage.setItem(nflGmLongStorageKey(state.profileId), JSON.stringify(state));
}
export function nflGmLongClearSave(storage: Pick<Storage, "removeItem">, profileId: string): void {
  storage.removeItem(nflGmLongStorageKey(profileId));
}
