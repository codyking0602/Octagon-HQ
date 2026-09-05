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
};

const projection = careerMediaJson as unknown as CareerMediaProjection;
const nflCareerTeamCodeBySubjectId = new Map(projection.nflCareerTeamCodes ?? []);

/**
 * Relationship-only media context. footballSubjectAssets remains the single public media owner.
 * CFB careers use their canonical school; source-backed NFL careers use the deterministic generated franchise context.
 */
export function footballCareerTeamMediaId(subject: FootballCanonicalSubject): FootballTeamMediaId | null {
  if (subject.kind !== "player-career") return null;
  if (subject.league === "CFB") {
    return subject.school ? footballCfbTeamMediaId(subject.school) : null;
  }

  const projectionId = footballRecognitionProjectionSubjectIdFor(subject);
  const teamCode = nflCareerTeamCodeBySubjectId.get(subject.id)
    ?? (projectionId ? nflCareerTeamCodeBySubjectId.get(projectionId) : undefined);
  return teamCode ? footballNflTeamMediaId(teamCode) : null;
}
