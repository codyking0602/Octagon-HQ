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

/**
 * Relationship-only media context. footballSubjectAssets remains the single public media owner.
 * Source-backed CFB careers use their pinned player-corpus program before canonical-school fallback;
 * source-backed NFL careers use generated franchise context, with reviewed historical relationships outside 1999+.
 */
export function footballCareerTeamMediaId(subject: FootballCareerMediaSubject): FootballTeamMediaId | null {
  if (subject.kind !== "player-career") return null;

  const projectionId = footballRecognitionProjectionSubjectIdFor(subject as FootballCanonicalSubject);
  if (subject.league === "CFB") {
    const programName = cfbCareerProgramBySubjectId.get(subject.id)
      ?? (projectionId ? cfbCareerProgramBySubjectId.get(projectionId) : undefined)
      ?? subject.school;
    return programName ? footballCfbTeamMediaId(programName) : null;
  }

  const teamCode = nflCareerTeamCodeBySubjectId.get(subject.id)
    ?? (projectionId ? nflCareerTeamCodeBySubjectId.get(projectionId) : undefined);
  return teamCode ? footballNflTeamMediaId(teamCode) : null;
}
