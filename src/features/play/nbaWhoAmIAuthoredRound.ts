import {
  getNbaWhoAmIAuthoredIdentity,
  nbaWhoAmIAuthoredIdentities,
  type NbaWhoAmIAuthoredScriptId,
} from "../games/nbaWhoAmIAuthoredScripts";
import type { WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";

const subjects: readonly WhoAmISubject[] = nbaWhoAmIAuthoredIdentities.map((identity) => ({
  id: identity.subjectId,
  name: identity.name,
  kind: "player",
  eraBand: identity.eraBand,
  rescueGroup: identity.eraBand,
}));

export function buildNbaWhoAmIAuthoredRound(selection: {
  subjectId: string;
  scriptId: NbaWhoAmIAuthoredScriptId;
}): WhoAmIRound {
  const identity = getNbaWhoAmIAuthoredIdentity(selection.subjectId);
  if (!identity) throw new Error("Unknown NBA Who Am I identity: " + selection.subjectId);
  const script = identity.scripts[selection.scriptId];
  if (!script || script.clues.length !== 10) {
    throw new Error("Incomplete NBA Who Am I authored script: " + selection.subjectId);
  }
  return {
    sport: "nba",
    league: "NBA",
    subjects,
    hiddenSubject: subjects.find((subject) => subject.id === identity.subjectId)!,
    clues: script.clues.map(({ id, text, band }) => ({ id, text, band })),
  };
}

export function nbaWhoAmIAuthoredSelectionForClues(subjectId: string, clueIds: readonly string[]) {
  const identity = getNbaWhoAmIAuthoredIdentity(subjectId);
  if (!identity) return null;
  const scriptId = (["A", "B"] as const).find((id) =>
    identity.scripts[id].clues.length === clueIds.length
    && identity.scripts[id].clues.every((clue, index) => clue.id === clueIds[index]),
  );
  return scriptId ? { subjectId, scriptId } : null;
}

export function resolveNbaWhoAmIAuthoredSharedRound(subjectId: string, clueIds: readonly string[]) {
  const selection = nbaWhoAmIAuthoredSelectionForClues(subjectId, clueIds);
  return selection ? buildNbaWhoAmIAuthoredRound(selection) : null;
}
