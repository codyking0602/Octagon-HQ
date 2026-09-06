import careerMediaJson from "../../../data/generated/football/career-media-context.json";
import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import {
  footballCfbTeamMediaId,
  footballNflTeamMediaId,
  type FootballTeamMediaId,
} from "./footballMediaIdentity";
import { footballRecognitionProjectionSubjectIdFor } from "./footballRecognizabilityProjection";

type CareerMediaProjection = {
  nflCareerTeamCodes?: readonly (readonly [subjectId: string, teamCode: string])[];
  cfbCareerPrograms?: readonly (readonly [subjectId: string, programName: string])[];
  cfbProgramMediaOwners?: readonly (readonly [programName: string, sourceProgramId: string])[];
};

type FootballCareerMediaSubject = {
  id: string;
  kind: string;
  league: FootballCanonicalSubject["league"];
  school?: string;
};

const projection = careerMediaJson as unknown as CareerMediaProjection;
const nflCareerTeamCodeBySubjectId = new Map(projection.nflCareerTeamCodes ?? []);
const cfbCareerProgramBySubjectId = new Map(projection.cfbCareerPrograms ?? []);

export const footballCareerCfbProgramMediaOwners = (projection.cfbProgramMediaOwners ?? []).map(
  ([programName, sourceProgramId]) => ({ programName, sourceProgramId }),
);

function projectionIdFor(subject: FootballCareerMediaSubject) {
  return footballRecognitionProjectionSubjectIdFor(subject as FootballCanonicalSubject);
}

/**
 * Canonical representative-program relationship for a CFB player career. Text and
 * imagery must consume this same value so transfer/source projection never drifts.
 */
export function footballCareerCfbDisplayProgram(subject: FootballCareerMediaSubject) {
  if (subject.kind !== "player-career" || subject.league !== "CFB") return null;
  const projectionId = projectionIdFor(subject);
  return cfbCareerProgramBySubjectId.get(subject.id)
    ?? (projectionId ? cfbCareerProgramBySubjectId.get(projectionId) : undefined)
    ?? subject.school
    ?? null;
}

/**
 * Relationship-only media context. footballSubjectAssets remains the single public media owner.
 * Source-backed CFB careers use their pinned player-corpus program before canonical-school fallback;
 * source-backed NFL careers use generated franchise context, with reviewed historical relationships outside 1999+.
 */
export function footballCareerTeamMediaId(subject: FootballCareerMediaSubject): FootballTeamMediaId | null {
  if (subject.kind !== "player-career") return null;

  const projectionId = projectionIdFor(subject);
  if (subject.league === "CFB") {
    const programName = footballCareerCfbDisplayProgram(subject);
    return programName ? footballCfbTeamMediaId(programName) : null;
  }

  const teamCode = nflCareerTeamCodeBySubjectId.get(subject.id)
    ?? (projectionId ? nflCareerTeamCodeBySubjectId.get(projectionId) : undefined);
  return teamCode ? footballNflTeamMediaId(teamCode) : null;
}
