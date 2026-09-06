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

export type FootballCareerMediaSubject = {
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
 * Canonical CFB player-career display program. The generated relationship owner applies the existing
 * transfer rule: most seasons with a program, then latest season and program name as deterministic ties.
 * Copy and logo callers consume this same relationship so they cannot drift apart.
 */
export function footballCareerCfbDisplayProgram(subject: FootballCareerMediaSubject): string | null {
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

  if (subject.league === "CFB") {
    const programName = footballCareerCfbDisplayProgram(subject);
    return programName ? footballCfbTeamMediaId(programName) : null;
  }

  const projectionId = projectionIdFor(subject);
  const teamCode = nflCareerTeamCodeBySubjectId.get(subject.id)
    ?? (projectionId ? nflCareerTeamCodeBySubjectId.get(projectionId) : undefined);
  return teamCode ? footballNflTeamMediaId(teamCode) : null;
}
