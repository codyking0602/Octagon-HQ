import {
  nbaWhoAmIAuthoredIdentities,
  type NbaWhoAmIAuthoredScriptId,
} from "../games/nbaWhoAmIAuthoredScripts";
import type { WhoAmIRound } from "../games/whoAmIEngine";
import {
  buildNbaWhoAmIAuthoredRound,
  nbaWhoAmIAuthoredSelectionForClues,
} from "./nbaWhoAmIAuthoredRound";

export const NBA_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY =
  "octagon-hq:nba-who-am-i:authored-script-history:v1";

function readLastScripts(): Record<string, NbaWhoAmIAuthoredScriptId> {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(NBA_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(Object.entries(stored).filter(
      (pair): pair is [string, NbaWhoAmIAuthoredScriptId] => pair[1] === "A" || pair[1] === "B",
    ));
  } catch {
    return {};
  }
}

function pick<T>(choices: readonly T[], random: () => number) {
  return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))]!;
}

export function createNbaWhoAmIAuthoredCasualRound(
  random: () => number = Math.random,
  excludedSubjectIds: ReadonlySet<string> = new Set(),
): WhoAmIRound {
  const fresh = nbaWhoAmIAuthoredIdentities.filter((entry) => !excludedSubjectIds.has(entry.subjectId));
  const eligible = fresh.length ? fresh : nbaWhoAmIAuthoredIdentities;
  const modern = eligible.filter((entry) => entry.eraBand === "modern");
  const legacy = eligible.filter((entry) => entry.eraBand === "legacy");
  const eraPool = modern.length && legacy.length
    ? (random() < 0.75 ? modern : legacy)
    : eligible;
  const identity = pick(eraPool, random);
  const prior = readLastScripts()[identity.subjectId];
  const scriptId = prior ? (prior === "A" ? "B" : "A") : pick(["A", "B"] as const, random);
  return buildNbaWhoAmIAuthoredRound({ subjectId: identity.subjectId, scriptId });
}

export function rememberNbaWhoAmIAuthoredCasualRound(round: WhoAmIRound) {
  if (typeof window === "undefined" || round.sport !== "nba" || round.league !== "NBA") return;
  const selection = nbaWhoAmIAuthoredSelectionForClues(
    round.hiddenSubject.id, round.clues.map((clue) => clue.id),
  );
  if (!selection) return;
  try {
    window.localStorage.setItem(NBA_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY, JSON.stringify({
      ...readLastScripts(),
      [selection.subjectId]: selection.scriptId,
    }));
  } catch {
    // Storage failure must never block a round.
  }
}
