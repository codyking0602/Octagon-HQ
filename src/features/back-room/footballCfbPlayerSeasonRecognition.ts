import recognitionJson from "../../../data/generated/football/cfb/player-season-recognition.json";
import type { FootballCanonicalPosition, FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import type { FootballRecognizabilityTier } from "./footballSubjectEligibility";

export interface FootballCfbPlayerSeasonRecognitionRecord {
  id: string;
  name: string;
  kind: "player-season";
  league: "CFB";
  position: FootballCanonicalPosition;
  school: string;
  season: number;
  startSeason: number;
  endSeason: number;
  tier: Exclude<FootballRecognizabilityTier, "D">;
  sourceProvider: "cfbfastR";
  sourceId: string;
  evidence: string;
}

export const footballCfbPlayerSeasonRecognitionRecords =
  recognitionJson.records as readonly FootballCfbPlayerSeasonRecognitionRecord[];

const footballCfbPlayerSeasonRecognitionById = new Map(
  footballCfbPlayerSeasonRecognitionRecords.map((record) => [record.id, record]),
);

export function footballCfbPlayerSeasonRecognitionFor(subject: FootballCanonicalSubject) {
  if (subject.kind !== "player-season" || subject.league !== "CFB") return null;
  const record = footballCfbPlayerSeasonRecognitionById.get(subject.id);
  if (!record) return null;
  return {
    tier: record.tier,
    sourceIdentityKey: { provider: "cfbfastR" as const, id: record.sourceId },
  };
}
