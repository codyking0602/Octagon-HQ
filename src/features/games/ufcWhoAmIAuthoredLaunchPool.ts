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
import { ufcWhoAmIAuthoredExpansion2026A } from "./ufcWhoAmIAuthoredExpansion2026A";
import { ufcWhoAmIAuthoredExpansion2026B } from "./ufcWhoAmIAuthoredExpansion2026B";
import { ufcWhoAmIAuthoredExpansion2026C } from "./ufcWhoAmIAuthoredExpansion2026C";
import { ufcWhoAmIAuthoredExpansion133Batch1 } from "./ufcWhoAmIAuthoredExpansion133Batch1";
import { ufcWhoAmIAuthoredExpansion133Batch2 } from "./ufcWhoAmIAuthoredExpansion133Batch2";
import { ufcWhoAmIAuthoredExpansion133Batch3 } from "./ufcWhoAmIAuthoredExpansion133Batch3";

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
  ...ufcWhoAmIAuthoredExpansion133Batch1,
  ...ufcWhoAmIAuthoredExpansion133Batch2,
  ...ufcWhoAmIAuthoredExpansion133Batch3,
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
