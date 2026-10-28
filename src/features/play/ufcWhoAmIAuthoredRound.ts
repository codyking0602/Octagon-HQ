import {
  getUfcWhoAmIAuthoredLaunchIdentity,
  ufcWhoAmIAuthoredLaunchPool,
} from "../games/ufcWhoAmIAuthoredLaunchPool";
import type {
  UfcWhoAmIAuthoredIdentity,
  UfcWhoAmIAuthoredScriptId,
} from "../games/ufcWhoAmIAuthoredScripts";
import { getCanonicalUfcWhoAmIUniverse } from "../games/ufcWhoAmIAuthority";
import type { WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";

function subjectFromCandidate(
  candidate: ReturnType<typeof getCanonicalUfcWhoAmIUniverse>["candidates"][number],
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

export function ufcWhoAmIAuthoredSubject(identity: UfcWhoAmIAuthoredIdentity): WhoAmISubject {
  const existing = getCanonicalUfcWhoAmIUniverse().candidates.find(
    (candidate) => candidate.id === identity.subjectId,
  );
  if (!existing) {
    throw new Error(`Authored UFC Who Am I subject ${identity.subjectId} is outside the canonical UFC universe.`);
  }
  if (existing.name !== identity.name) {
    throw new Error(
      `Authored UFC Who Am I subject id ${identity.subjectId} belongs to ${existing.name}, not ${identity.name}.`,
    );
  }
  return subjectFromCandidate(existing);
}

export function ufcWhoAmIAuthoredScriptIds(identity: UfcWhoAmIAuthoredIdentity) {
  return (["A", "B", "C"] as const).filter((id) => Boolean(identity.scripts[id]));
}

export function buildUfcWhoAmIAuthoredRound(
  selection: { subjectId: string; scriptId: UfcWhoAmIAuthoredScriptId },
): WhoAmIRound {
  const identity = getUfcWhoAmIAuthoredLaunchIdentity(selection.subjectId);
  if (!identity) {
    throw new Error(`Authored UFC Who Am I subject ${selection.subjectId} is unavailable.`);
  }

  const script = identity.scripts[selection.scriptId];
  if (!script || script.clues.length !== 10) {
    throw new Error(
      `Authored UFC Who Am I script ${selection.scriptId} is unavailable for ${identity.subjectId}.`,
    );
  }

  return {
    sport: "ufc",
    league: "UFC",
    subjects: getCanonicalUfcWhoAmIUniverse().candidates.map(subjectFromCandidate),
    hiddenSubject: ufcWhoAmIAuthoredSubject(identity),
    clues: script.clues.map((clue) => ({
      id: clue.id,
      text: clue.text,
      band: clue.band,
    })),
  };
}

export function resolveUfcWhoAmIAuthoredSharedRound(
  subjectId: string,
  clueIds: readonly string[],
) {
  const identity = getUfcWhoAmIAuthoredLaunchIdentity(subjectId);
  if (!identity) return null;

  const scriptId = ufcWhoAmIAuthoredScriptIds(identity).find((id) => {
    const script = identity.scripts[id];
    return script?.clues.length === clueIds.length
      && script.clues.every((clue, index) => clue.id === clueIds[index]);
  });
  if (!scriptId) return null;
  return buildUfcWhoAmIAuthoredRound({ subjectId, scriptId });
}

export function ufcWhoAmIAuthoredIdentityPool() {
  return ufcWhoAmIAuthoredLaunchPool;
}
