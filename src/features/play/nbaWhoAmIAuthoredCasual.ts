import {
  nbaWhoAmIAuthoredIdentities,
  type NbaWhoAmIAuthoredScriptId,
} from "../games/nbaWhoAmIAuthoredScripts";
import { WHO_AM_I_MODERN_ERA_SHARE, type WhoAmIRound } from "../games/whoAmIEngine";
import { buildNbaWhoAmIAuthoredRound } from "./nbaWhoAmIAuthoredRound";

export const NBA_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY = "octagon-hq:nba-who-am-i:script-history:v1";
type History = Record<string, NbaWhoAmIAuthoredScriptId>;

function readHistory(): History {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(NBA_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(Object.entries(raw).filter((pair): pair is [string, NbaWhoAmIAuthoredScriptId] =>
      pair[1] === "A" || pair[1] === "B"
    ));
  } catch {
    return {};
  }
}

function pick<T>(items: readonly T[], random: () => number): T {
  const index = Math.min(items.length - 1, Math.floor(random() * items.length));
  return items[Math.max(0, index)]!;
}

/** Same recent-player exclusions, era policy and A/B rotation as the established games. */
export function createNbaWhoAmIAuthoredCasualRound(
  random: () => number = Math.random,
  excludedSubjectIds: ReadonlySet<string> = new Set(),
): WhoAmIRound {
  const fresh = nbaWhoAmIAuthoredIdentities.filter((identity) => !excludedSubjectIds.has(identity.subjectId));
  const eligible = fresh.length ? fresh : nbaWhoAmIAuthoredIdentities;
  if (!eligible.length) throw new Error("NBA Who Am I authored bank is empty.");
  const modern = eligible.filter((identity) => identity.eraBand === "modern");
  const legacy = eligible.filter((identity) => identity.eraBand === "legacy");
  const eraPool = modern.length && legacy.length
    ? (random() < WHO_AM_I_MODERN_ERA_SHARE ? modern : legacy)
    : eligible;
  const identity = pick(eraPool, random);
  const prior = readHistory()[identity.subjectId];
  const scriptId: NbaWhoAmIAuthoredScriptId = prior === "A" ? "B" : prior === "B" ? "A" : random() < .5 ? "A" : "B";
  return buildNbaWhoAmIAuthoredRound({ subjectId: identity.subjectId, scriptId });
}

export function rememberNbaWhoAmIAuthoredCasualRound(round: WhoAmIRound) {
  if (typeof window === "undefined" || round.sport !== "nba" || round.league !== "NBA") return;
  const identity = nbaWhoAmIAuthoredIdentities.find(({ subjectId }) => subjectId === round.hiddenSubject.id);
  if (!identity) return;
  const scriptId = (["A", "B"] as const).find((id) =>
    identity.scripts[id].clues.every((clue, index) => clue.id === round.clues[index]?.id)
  );
  if (!scriptId) return;
  try {
    window.localStorage.setItem(NBA_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY, JSON.stringify({
      ...readHistory(),
      [identity.subjectId]: scriptId,
    }));
  } catch {
    // Persisting casual rotation is optional and must never block a round.
  }
}
