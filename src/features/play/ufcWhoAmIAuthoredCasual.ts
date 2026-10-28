import type { UfcWhoAmIAuthoredScriptId } from "../games/ufcWhoAmIAuthoredScripts";
import {
  buildUfcWhoAmIAuthoredRound,
  ufcWhoAmIAuthoredIdentityPool,
  ufcWhoAmIAuthoredScriptIds,
} from "./ufcWhoAmIAuthoredRound";

function pick<T>(rows: readonly T[], random: () => number) {
  return rows[Math.floor(random() * rows.length)] ?? rows[0]!;
}

export function createUfcWhoAmIAuthoredCasualRound(
  random: () => number = Math.random,
  excludedSubjectIds: ReadonlySet<string> = new Set(),
) {
  const all = ufcWhoAmIAuthoredIdentityPool();
  const fresh = all.filter((identity) => !excludedSubjectIds.has(identity.subjectId));
  const identity = pick(fresh.length ? fresh : all, random);
  const scriptIds = ufcWhoAmIAuthoredScriptIds(identity);
  if (!scriptIds.length) {
    throw new Error(`Authored UFC Who Am I has no scripts for ${identity.subjectId}.`);
  }
  const scriptId = pick(scriptIds, random) as UfcWhoAmIAuthoredScriptId;
  return buildUfcWhoAmIAuthoredRound({
    subjectId: identity.subjectId,
    scriptId,
  });
}
