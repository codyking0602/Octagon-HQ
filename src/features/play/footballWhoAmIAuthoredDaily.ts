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

function subjectFromCandidate(
  candidate: ReturnType<typeof getFootballWhoAmIDailyUniverse>["candidates"][number],
): WhoAmISubject {
  const { id, name, kind, eraBand, rescueGroup } = candidate;
  return {
    id,
    name,
    kind,
    ...(eraBand ? { eraBand } : {}),
    ...(rescueGroup ? { rescueGroup } : {}),
  };
}

function authoredSubject(identity: FootballWhoAmIAuthoredIdentity): WhoAmISubject {
  const universe = getFootballWhoAmIDailyUniverse(identity.league);
  const existing = universe.candidates.find((candidate) => candidate.id === identity.subjectId);
  if (existing) {
    if (existing.name !== identity.name) {
      throw new Error(
        `Authored ${identity.league} Who Am I subject id ${identity.subjectId} belongs to ${existing.name}, not ${identity.name}.`,
      );
    }
    return subjectFromCandidate(existing);
  }

  // Authored scripts own their explicit stage identity. The legacy generated
  // launch universe may exclude a newly approved player only because the old
  // dynamic clue assembler lacks enough person-identity concepts. That must not
  // make a fully sourced authored script ineligible.
  return {
    id: identity.subjectId,
    name: identity.name,
    kind: "player",
  };
}

function leagueSubjects(league: FootballWhoAmIAuthoredLeague) {
  const universe = getFootballWhoAmIDailyUniverse(league);
  const byId = new Map(
    universe.candidates.map((candidate) => [candidate.id, subjectFromCandidate(candidate)] as const),
  );
  for (const identity of footballWhoAmIAuthoredIdentities.filter((row) => row.league === league)) {
    const subject = authoredSubject(identity);
    const prior = byId.get(subject.id);
    if (prior && prior.name !== subject.name) {
      throw new Error(`Who Am I canonical subject id collision for ${subject.id}.`);
    }
    byId.set(subject.id, prior ?? subject);
  }
  return [...byId.values()];
}

function scriptIds(identity: FootballWhoAmIAuthoredIdentity) {
  return (["A", "B", "C"] as const).filter((id) => Boolean(identity.scripts[id]));
}

function selectionCandidates(league: FootballWhoAmIAuthoredLeague) {
  return footballWhoAmIAuthoredIdentities
    .filter((identity) => identity.league === league)
    .map((identity): WhoAmIAuthoredSelectionCandidate<FootballWhoAmIAuthoredScriptId> => ({
      subjectId: identity.subjectId,
      earlyRotation: identity.earlyRotation,
      scriptIds: scriptIds(identity),
    }));
}

function authoredRound(
  league: FootballWhoAmIAuthoredLeague,
  selection: { subjectId: string; scriptId: FootballWhoAmIAuthoredScriptId },
): FootballWhoAmIAuthoredDailyRound {
  const identities = footballWhoAmIAuthoredIdentities.filter(
    (identity) => identity.league === league && identity.subjectId === selection.subjectId,
  );
  if (identities.length !== 1) {
    throw new Error(
      `Authored ${league} Who Am I subject ${selection.subjectId} must have exactly one stage-owned script binding.`,
    );
  }

  const identity = identities[0]!;
  const script = identity.scripts[selection.scriptId];
  if (!script || script.clues.length !== 10) {
    throw new Error(
      `Authored ${league} Who Am I script ${selection.scriptId} is unavailable for ${identity.subjectId}.`,
    );
  }

  return {
    scriptId: selection.scriptId,
    round: {
      sport: "football",
      league,
      subjects: leagueSubjects(league),
      hiddenSubject: authoredSubject(identity),
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
  const nflSelection = selectWhoAmIAuthoredIdentity(
    selectionCandidates("NFL"),
    leagueHistory(history, "NFL"),
    [FOOTBALL_WHO_AM_I_AUTHORED_DAILY_VERSION, day, "NFL"],
  );
  const cfbSelection = selectWhoAmIAuthoredIdentity(
    selectionCandidates("CFB"),
    leagueHistory(history, "CFB"),
    [FOOTBALL_WHO_AM_I_AUTHORED_DAILY_VERSION, day, "CFB"],
  );
  const nfl = authoredRound("NFL", nflSelection);
  const cfb = authoredRound("CFB", cfbSelection);
  return seededLineupRandom(
    FOOTBALL_WHO_AM_I_AUTHORED_DAILY_VERSION,
    day,
    "round-order",
  )() < 0.5
    ? [nfl, cfb] as const
    : [cfb, nfl] as const;
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
  return footballWhoAmIAuthoredIdentities.map((identity) => ({
    league: identity.league,
    name: identity.name,
    subjectId: identity.subjectId,
    subjectName: authoredSubject(identity).name,
    earlyRotation: identity.earlyRotation,
    scriptIds: scriptIds(identity),
  }));
}
