import {
  getNbaWhoAmIAuthoredIdentity,
  nbaWhoAmIAuthoredIdentities,
  type NbaWhoAmIAuthoredIdentity,
  type NbaWhoAmIAuthoredScriptId,
} from "../games/nbaWhoAmIAuthoredScripts";
import type { WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";

function subjectFor(identity: NbaWhoAmIAuthoredIdentity): WhoAmISubject {
  return {
    id: identity.subjectId,
    name: identity.name,
    kind: "player",
    eraBand: identity.eraBand,
    rescueGroup: identity.rescueGroup,
  };
}

export function buildNbaWhoAmIAuthoredRound(selection: {
  subjectId: string;
  scriptId: NbaWhoAmIAuthoredScriptId;
}): WhoAmIRound {
  const identity = getNbaWhoAmIAuthoredIdentity(selection.subjectId);
  if (!identity) throw new Error(`NBA Who Am I player ${selection.subjectId} is unavailable.`);
  const script = identity.scripts[selection.scriptId];
  if (!script || script.clues.length !== 10) throw new Error("NBA Who Am I script is incomplete.");
  return {
    sport: "nba",
    league: "NBA",
    subjects: nbaWhoAmIAuthoredIdentities.map(subjectFor),
    hiddenSubject: subjectFor(identity),
    clues: script.clues.map(({ id, text, band }) => ({ id, text, band })),
  };
}

export function resolveNbaWhoAmIAuthoredSharedRound(subjectId: string, clueIds: readonly string[]) {
  const identity = getNbaWhoAmIAuthoredIdentity(subjectId);
  if (!identity || clueIds.length !== 10) return null;
  const scriptId = (["A", "B"] as const).find((id) =>
    identity.scripts[id].clues.every((clue, index) => clue.id === clueIds[index])
  );
  return scriptId ? buildNbaWhoAmIAuthoredRound({ subjectId, scriptId }) : null;
}
