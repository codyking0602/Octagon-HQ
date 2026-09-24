import type {
  FootballWhoAmIAuthoredIdentity,
  FootballWhoAmIAuthoredLeague,
  FootballWhoAmIAuthoredScriptId,
} from "../games/footballWhoAmIAuthoredScripts";
import type { WhoAmIRound } from "../games/whoAmIEngine";
import {
  buildFootballWhoAmIAuthoredRound,
  footballWhoAmIAuthoredIdentityPool,
  footballWhoAmIAuthoredScriptIds,
  footballWhoAmIAuthoredSelectionForClues,
} from "./footballWhoAmIAuthoredRound";

export const FOOTBALL_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY =
  "octagon-hq:football-who-am-i:authored-script-history:v1";

type LastScriptByIdentity = Record<string, FootballWhoAmIAuthoredScriptId>;

function storageKey(league: FootballWhoAmIAuthoredLeague, subjectId: string) {
  return `${league}:${subjectId}`;
}

function readLastScripts(): LastScriptByIdentity {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(FOOTBALL_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY) ?? "{}",
    ) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, FootballWhoAmIAuthoredScriptId] => (
        entry[1] === "A" || entry[1] === "B" || entry[1] === "C"
      )),
    );
  } catch {
    return {};
  }
}

function pick<T>(rows: readonly T[], random: () => number) {
  return rows[Math.floor(random() * rows.length)] ?? rows[0]!;
}

function nextScriptId(
  identity: FootballWhoAmIAuthoredIdentity,
  random: () => number,
  lastScripts: Readonly<LastScriptByIdentity>,
) {
  const scriptIds = footballWhoAmIAuthoredScriptIds(identity);
  if (!scriptIds.length) {
    throw new Error(
      `Authored ${identity.league} Who Am I has no scripts for ${identity.subjectId}.`,
    );
  }

  const prior = lastScripts[storageKey(identity.league, identity.subjectId)];
  if (!prior || !scriptIds.includes(prior)) {
    return pick(scriptIds, random);
  }
  const index = scriptIds.indexOf(prior);
  return scriptIds[(index + 1) % scriptIds.length]!;
}

export function createFootballWhoAmIAuthoredCasualRound(
  random: () => number = Math.random,
  excludedSubjectIdsByLeague: Partial<Record<FootballWhoAmIAuthoredLeague, ReadonlySet<string>>> = {},
) {
  const league: FootballWhoAmIAuthoredLeague = random() < 0.5 ? "NFL" : "CFB";
  const all = footballWhoAmIAuthoredIdentityPool(league);
  const excluded = excludedSubjectIdsByLeague[league] ?? new Set<string>();
  const fresh = all.filter((identity) => !excluded.has(identity.subjectId));
  const identity = pick(fresh.length ? fresh : all, random);
  const scriptId = nextScriptId(identity, random, readLastScripts());

  return buildFootballWhoAmIAuthoredRound({
    league,
    subjectId: identity.subjectId,
    scriptId,
  });
}

export function rememberFootballWhoAmIAuthoredCasualRound(round: WhoAmIRound) {
  if (
    typeof window === "undefined"
    || round.sport !== "football"
    || (round.league !== "NFL" && round.league !== "CFB")
  ) {
    return;
  }

  const selection = footballWhoAmIAuthoredSelectionForClues(
    round.league,
    round.hiddenSubject.id,
    round.clues.map((clue) => clue.id),
  );
  if (!selection) return;

  try {
    window.localStorage.setItem(
      FOOTBALL_WHO_AM_I_CASUAL_SCRIPT_STORAGE_KEY,
      JSON.stringify({
        ...readLastScripts(),
        [storageKey(round.league, round.hiddenSubject.id)]: selection.scriptId,
      }),
    );
  } catch {
    // Casual script memory is replay-quality state; storage failure must not block gameplay.
  }
}
