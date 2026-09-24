import { ufcWhoAmIAuthoredIdentities } from "./ufcWhoAmIAuthoredScripts";
import { ufcWhoAmIAuthoredLaunchExpansion } from "./ufcWhoAmIAuthoredLaunchExpansion";
import { ufcWhoAmIAuthoredBatch1 } from "./ufcWhoAmIAuthoredBatch1";
import { ufcWhoAmIAuthoredBatch2 } from "./ufcWhoAmIAuthoredBatch2";
import { ufcWhoAmIAuthoredBatch3 } from "./ufcWhoAmIAuthoredBatch3";
import { ufcWhoAmIAuthoredBatch4 } from "./ufcWhoAmIAuthoredBatch4";
import { ufcWhoAmIAuthoredBatch5 } from "./ufcWhoAmIAuthoredBatch5";
import { ufcWhoAmIAuthoredBatch6 } from "./ufcWhoAmIAuthoredBatch6";
import { ufcWhoAmIAuthoredBatch7 } from "./ufcWhoAmIAuthoredBatch7";
import { ufcWhoAmIAuthoredBatch8 } from "./ufcWhoAmIAuthoredBatch8";
import { ufcWhoAmIAuthoredRosterExpansion1 } from "./ufcWhoAmIAuthoredRosterExpansion1";
import { ufcWhoAmIAuthoredRosterExpansion2 } from "./ufcWhoAmIAuthoredRosterExpansion2";
import { ufcWhoAmIAuthoredRosterExpansion3 } from "./ufcWhoAmIAuthoredRosterExpansion3";
import { ufcWhoAmIAuthoredRosterExpansion4 } from "./ufcWhoAmIAuthoredRosterExpansion4";
import { ufcWhoAmIAuthoredRosterExpansion5 } from "./ufcWhoAmIAuthoredRosterExpansion5";
import { ufcWhoAmIAuthoredRosterExpansion6 } from "./ufcWhoAmIAuthoredRosterExpansion6";
import { ufcWhoAmIAuthoredRosterExpansion7 } from "./ufcWhoAmIAuthoredRosterExpansion7";
import { ufcWhoAmIAuthoredRosterExpansion8 } from "./ufcWhoAmIAuthoredRosterExpansion8";
import { ufcWhoAmIAuthoredRosterExpansion9 } from "./ufcWhoAmIAuthoredRosterExpansion9";
import { ufcWhoAmIAuthoredRosterExpansion10 } from "./ufcWhoAmIAuthoredRosterExpansion10";
import { ufcWhoAmIAuthoredRosterExpansion11 } from "./ufcWhoAmIAuthoredRosterExpansion11";

export const ufcWhoAmIAuthoredLaunchPool = [
  ...ufcWhoAmIAuthoredIdentities,
  ...ufcWhoAmIAuthoredLaunchExpansion,
  ...ufcWhoAmIAuthoredBatch1,
  ...ufcWhoAmIAuthoredBatch2,
  ...ufcWhoAmIAuthoredBatch3,
  ...ufcWhoAmIAuthoredBatch4,
  ...ufcWhoAmIAuthoredBatch5,
  ...ufcWhoAmIAuthoredBatch6,
  ...ufcWhoAmIAuthoredBatch7,
  ...ufcWhoAmIAuthoredBatch8,
  ...ufcWhoAmIAuthoredRosterExpansion1,
  ...ufcWhoAmIAuthoredRosterExpansion2,
  ...ufcWhoAmIAuthoredRosterExpansion3,
  ...ufcWhoAmIAuthoredRosterExpansion4,
  ...ufcWhoAmIAuthoredRosterExpansion5,
  ...ufcWhoAmIAuthoredRosterExpansion6,
  ...ufcWhoAmIAuthoredRosterExpansion7,
  ...ufcWhoAmIAuthoredRosterExpansion8,
  ...ufcWhoAmIAuthoredRosterExpansion9,
  ...ufcWhoAmIAuthoredRosterExpansion10,
  ...ufcWhoAmIAuthoredRosterExpansion11,
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
