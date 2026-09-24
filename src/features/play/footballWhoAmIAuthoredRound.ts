import {
  footballWhoAmIAuthoredIdentities,
  type FootballWhoAmIAuthoredIdentity,
  type FootballWhoAmIAuthoredLeague,
  type FootballWhoAmIAuthoredScriptId,
} from "../games/footballWhoAmIAuthoredScripts";
import { FOOTBALL_WHO_AM_I_AUTHORED_TARGET_IDENTITIES } from "../games/footballWhoAmIAuthoredTargetRoster";
import { getFootballWhoAmIDailyUniverse } from "../games/footballWhoAmIDailyAuthority";
import type { WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";

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

const targetByKey = new Map(
  Object.values(FOOTBALL_WHO_AM_I_AUTHORED_TARGET_IDENTITIES)
    .flat()
    .map((identity) => [`${identity.league}:${identity.subjectId}`, identity] as const),
);

function authoredIdentity(
  league: FootballWhoAmIAuthoredLeague,
  subjectId: string,
) {
  const matches = footballWhoAmIAuthoredIdentities.filter(
    (identity) => identity.league === league && identity.subjectId === subjectId,
  );
  if (matches.length !== 1) return null;
  return matches[0]!;
}

export function footballWhoAmIAuthoredSubject(
  identity: FootballWhoAmIAuthoredIdentity,
): WhoAmISubject {
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

  const target = targetByKey.get(`${identity.league}:${identity.subjectId}`);
  if (!target || target.name !== identity.name) {
    throw new Error(
      `Authored ${identity.league} Who Am I subject ${identity.subjectId} is outside the frozen target roster.`,
    );
  }
  return {
    id: identity.subjectId,
    name: identity.name,
    kind: target.kind === "coach" ? "coach" : "player",
  };
}

export function footballWhoAmIAuthoredScriptIds(identity: FootballWhoAmIAuthoredIdentity) {
  return (["A", "B", "C"] as const).filter((id) => Boolean(identity.scripts[id]));
}

export function footballWhoAmIAuthoredIdentityPool(league: FootballWhoAmIAuthoredLeague) {
  return footballWhoAmIAuthoredIdentities.filter((identity) => identity.league === league);
}

export function footballWhoAmIAuthoredLeagueSubjects(league: FootballWhoAmIAuthoredLeague) {
  const universe = getFootballWhoAmIDailyUniverse(league);
  const byId = new Map(
    universe.candidates.map((candidate) => [candidate.id, subjectFromCandidate(candidate)] as const),
  );
  for (const identity of footballWhoAmIAuthoredIdentityPool(league)) {
    const subject = footballWhoAmIAuthoredSubject(identity);
    const prior = byId.get(subject.id);
    if (prior && prior.name !== subject.name) {
      throw new Error(`Who Am I canonical subject id collision for ${subject.id}.`);
    }
    byId.set(subject.id, prior ?? subject);
  }
  return [...byId.values()];
}

export function footballWhoAmIAuthoredSelectionForClues(
  league: FootballWhoAmIAuthoredLeague,
  subjectId: string,
  clueIds: readonly string[],
): { identity: FootballWhoAmIAuthoredIdentity; scriptId: FootballWhoAmIAuthoredScriptId } | null {
  const identity = authoredIdentity(league, subjectId);
  if (!identity) return null;

  const scriptId = footballWhoAmIAuthoredScriptIds(identity).find((id) => {
    const script = identity.scripts[id];
    return script?.clues.length === clueIds.length
      && script.clues.every((clue, index) => clue.id === clueIds[index]);
  });
  return scriptId ? { identity, scriptId } : null;
}

export function buildFootballWhoAmIAuthoredRound(
  selection: {
    league: FootballWhoAmIAuthoredLeague;
    subjectId: string;
    scriptId: FootballWhoAmIAuthoredScriptId;
  },
): WhoAmIRound {
  const identity = authoredIdentity(selection.league, selection.subjectId);
  if (!identity) {
    throw new Error(
      `Authored ${selection.league} Who Am I subject ${selection.subjectId} is unavailable.`,
    );
  }

  const script = identity.scripts[selection.scriptId];
  if (!script || script.clues.length !== 10) {
    throw new Error(
      `Authored ${selection.league} Who Am I script ${selection.scriptId} is unavailable for ${identity.subjectId}.`,
    );
  }

  return {
    sport: "football",
    league: selection.league,
    subjects: footballWhoAmIAuthoredLeagueSubjects(selection.league),
    hiddenSubject: footballWhoAmIAuthoredSubject(identity),
    clues: script.clues.map((clue) => ({
      id: clue.id,
      text: clue.text,
      band: clue.band,
    })),
  };
}

export function resolveFootballWhoAmIAuthoredSharedRound(
  league: FootballWhoAmIAuthoredLeague,
  subjectId: string,
  clueIds: readonly string[],
) {
  const selection = footballWhoAmIAuthoredSelectionForClues(league, subjectId, clueIds);
  if (!selection) return null;
  return buildFootballWhoAmIAuthoredRound({
    league,
    subjectId,
    scriptId: selection.scriptId,
  });
}
