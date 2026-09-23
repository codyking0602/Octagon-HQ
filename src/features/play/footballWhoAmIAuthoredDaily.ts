import {
  footballWhoAmIAuthoredIdentities,
  type FootballWhoAmIAuthoredIdentity,
  type FootballWhoAmIAuthoredLeague,
  type FootballWhoAmIAuthoredScriptId,
} from "../games/footballWhoAmIAuthoredScripts";
import { getFootballWhoAmIDailyUniverse } from "../games/footballWhoAmIDailyAuthority";
import type { WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";
import { seededLineupRandom } from "./lineupModel";
import {
  appendWhoAmIAuthoredHistory,
  selectWhoAmIAuthoredIdentity,
  type WhoAmIAuthoredPublicationHistoryEntry,
  type WhoAmIAuthoredSelectionCandidate,
} from "./whoAmIAuthoredDailySelection";

export const FOOTBALL_WHO_AM_I_AUTHORED_DAILY_VERSION = "football-who-am-i-authored-v1";

export interface FootballWhoAmIAuthoredDailyRound {
  round: WhoAmIRound;
  scriptId: FootballWhoAmIAuthoredScriptId;
}

function subjectFromCandidate(candidate: ReturnType<typeof getFootballWhoAmIDailyUniverse>["candidates"][number]): WhoAmISubject {
  const { id, name, kind, eraBand, rescueGroup } = candidate;
  return {
    id,
    name,
    kind,
    ...(eraBand ? { eraBand } : {}),
    ...(rescueGroup ? { rescueGroup } : {}),
  };
}

function canonicalBinding(identity: FootballWhoAmIAuthoredIdentity) {
  const universe = getFootballWhoAmIDailyUniverse(identity.league);
  const matches = universe.candidates.filter((candidate) => candidate.name === identity.name);
  if (matches.length !== 1) {
    throw new Error(
      `Authored ${identity.league} Who Am I identity ${identity.name} must resolve to exactly one canonical subject; found ${matches.length}.`,
    );
  }
  return { universe, candidate: matches[0]! };
}

function scriptIds(identity: FootballWhoAmIAuthoredIdentity) {
  return (["A", "B", "C"] as const).filter((id) => Boolean(identity.scripts[id]));
}

function selectionCandidates(league: FootballWhoAmIAuthoredLeague) {
  return footballWhoAmIAuthoredIdentities
    .filter((identity) => identity.league === league)
    .map((identity): WhoAmIAuthoredSelectionCandidate<FootballWhoAmIAuthoredScriptId> => {
      const { candidate } = canonicalBinding(identity);
      return {
        subjectId: candidate.id,
        earlyRotation: identity.earlyRotation,
        scriptIds: scriptIds(identity),
      };
    });
}

function authoredRound(
  league: FootballWhoAmIAuthoredLeague,
  selection: { subjectId: string; scriptId: FootballWhoAmIAuthoredScriptId },
): FootballWhoAmIAuthoredDailyRound {
  const universe = getFootballWhoAmIDailyUniverse(league);
  const candidate = universe.candidates.find((row) => row.id === selection.subjectId);
  if (!candidate) throw new Error(`Authored ${league} Who Am I subject ${selection.subjectId} is unavailable.`);

  const identities = footballWhoAmIAuthoredIdentities.filter((identity) => identity.league === league && identity.name === candidate.name);
  if (identities.length !== 1) {
    throw new Error(`Authored ${league} Who Am I subject ${candidate.id} has an ambiguous authored binding.`);
  }
  const identity = identities[0]!;
  const script = identity.scripts[selection.scriptId];
  if (!script || script.clues.length !== 10) {
    throw new Error(`Authored ${league} Who Am I script ${selection.scriptId} is unavailable for ${candidate.id}.`);
  }

  return {
    scriptId: selection.scriptId,
    round: {
      sport: "football",
      league,
      subjects: universe.candidates.map(subjectFromCandidate),
      hiddenSubject: subjectFromCandidate(candidate),
      clues: script.clues.map((clue) => ({
        id: clue.id,
        text: clue.text,
        band: clue.band,
      })),
    },
  };
}

function leagueHistory(
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
  league: FootballWhoAmIAuthoredLeague,
) {
  return history.filter((entry) => entry.league === league);
}

export function createFootballWhoAmIAuthoredDailyRounds(
  day: string,
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
): readonly [FootballWhoAmIAuthoredDailyRound, FootballWhoAmIAuthoredDailyRound] {
  const nflHistory = leagueHistory(history, "NFL");
  const cfbHistory = leagueHistory(history, "CFB");
  const nflSelection = selectWhoAmIAuthoredIdentity(
    selectionCandidates("NFL"),
    nflHistory,
    [FOOTBALL_WHO_AM_I_AUTHORED_DAILY_VERSION, day, "NFL"],
  );
  const cfbSelection = selectWhoAmIAuthoredIdentity(
    selectionCandidates("CFB"),
    cfbHistory,
    [FOOTBALL_WHO_AM_I_AUTHORED_DAILY_VERSION, day, "CFB"],
  );
  const nfl = authoredRound("NFL", nflSelection);
  const cfb = authoredRound("CFB", cfbSelection);
  const order = seededLineupRandom(FOOTBALL_WHO_AM_I_AUTHORED_DAILY_VERSION, day, "round-order")() < 0.5
    ? [nfl, cfb] as const
    : [cfb, nfl] as const;
  return order;
}

export function extendFootballWhoAmIHistoryForDaily(
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
  day: string,
  rounds: readonly FootballWhoAmIAuthoredDailyRound[],
) {
  let next = [...history];
  rounds.forEach((entry, roundIndex) => {
    next = appendWhoAmIAuthoredHistory(next, {
      day,
      roundIndex,
      subjectId: entry.round.hiddenSubject.id,
      league: entry.round.league as FootballWhoAmIAuthoredLeague,
      scriptId: entry.scriptId,
    });
  });
  return next;
}

export function footballWhoAmIAuthoredBindingAudit() {
  return footballWhoAmIAuthoredIdentities.map((identity) => {
    const { candidate } = canonicalBinding(identity);
    return {
      league: identity.league,
      name: identity.name,
      subjectId: candidate.id,
      earlyRotation: identity.earlyRotation,
      scriptIds: scriptIds(identity),
    };
  });
}
