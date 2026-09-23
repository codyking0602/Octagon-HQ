import { ufcWhoAmIAuthoredIdentities } from "./ufcWhoAmIAuthoredScripts";
import { ufcWhoAmIAuthoredLaunchExpansion } from "./ufcWhoAmIAuthoredLaunchExpansion";

export const ufcWhoAmIAuthoredLaunchPool = [
  ...ufcWhoAmIAuthoredIdentities,
  ...ufcWhoAmIAuthoredLaunchExpansion,
] as const;

const bySubjectId = new Map(
  ufcWhoAmIAuthoredLaunchPool.map((identity) => [identity.subjectId, identity] as const),
);

if (bySubjectId.size !== ufcWhoAmIAuthoredLaunchPool.length) {
  throw new Error("UFC Who Am I authored launch pool contains duplicate subject ids.");
}

export function getUfcWhoAmIAuthoredLaunchIdentity(subjectId: string) {
  return bySubjectId.get(subjectId) ?? null;
}
