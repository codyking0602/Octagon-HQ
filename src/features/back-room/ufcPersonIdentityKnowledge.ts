import { getUfcFactualSubject } from "./ufcFactualLedger";
import { ufcPersonIdentityResearch1, ufcPersonIdentityResearchSources1 } from "./ufcPersonIdentityResearch1";
import { ufcPersonIdentityResearch2, ufcPersonIdentityResearchSources2 } from "./ufcPersonIdentityResearch2";
import { ufcPersonIdentityResearch3, ufcPersonIdentityResearchSources3 } from "./ufcPersonIdentityResearch3";

export type UfcPersonIdentityKnowledgeClass = "distinctive-identity";
export type UfcPersonIdentityVerification = "verified";

export interface UfcPersonIdentitySource {
  id: string;
  publisher: string;
  title: string;
  url: string;
  reviewedOn: string;
  coverage: string;
}

export interface UfcPersonIdentityFact {
  factId: string;
  conceptId: string;
  researchConceptId: string;
  knowledgeClass: UfcPersonIdentityKnowledgeClass;
  verification: UfcPersonIdentityVerification;
  value: string;
  sourceIds: readonly string[];
}

export interface UfcPersonIdentityKnowledgeRecord {
  subjectId: string;
  facts: readonly UfcPersonIdentityFact[];
}

type ResearchSource = readonly [url: string, publisher: string, title: string];
type ResearchFact = readonly [conceptId: string, value: string, sourceIndex: number];
type ResearchRecord = readonly [subjectId: string, facts: readonly ResearchFact[]];

const REVIEWED_ON = "2026-09-10";

const researchBatches: readonly {
  label: string;
  sources: readonly ResearchSource[];
  records: readonly ResearchRecord[];
}[] = [
  {
    label: "Ufc1.json",
    sources: ufcPersonIdentityResearchSources1,
    records: ufcPersonIdentityResearch1,
  },
  {
    label: "Ufc2.json",
    sources: ufcPersonIdentityResearchSources2,
    records: ufcPersonIdentityResearch2,
  },
  {
    label: "Ufc3.json",
    sources: ufcPersonIdentityResearchSources3,
    records: ufcPersonIdentityResearch3,
  },
];

const sourceByUrl = new Map<string, UfcPersonIdentitySource>();
const sources: UfcPersonIdentitySource[] = [];

for (const batch of researchBatches) {
  for (const [url, publisher, title] of batch.sources) {
    const existing = sourceByUrl.get(url);
    if (existing) {
      if (existing.publisher !== publisher || existing.title !== title) {
        throw new Error(`PR10 UFC source metadata disagrees for ${url}.`);
      }
      continue;
    }
    const item: UfcPersonIdentitySource = {
      id: `identity-pr10-ufc-${String(sources.length + 1).padStart(3, "0")}`,
      publisher,
      title,
      url,
      reviewedOn: REVIEWED_ON,
      coverage: "Who Am I Rebuild PR10 UFC distinctive person-identity research provenance.",
    };
    sourceByUrl.set(url, item);
    sources.push(item);
  }
}

const records: UfcPersonIdentityKnowledgeRecord[] = [];
const subjectIds = new Set<string>();
const factIds = new Set<string>();
const conceptIds = new Set<string>();

for (const batch of researchBatches) {
  for (const [subjectId, researchFacts] of batch.records) {
    if (!getUfcFactualSubject(subjectId)) {
      throw new Error(`PR10 UFC research contains non-canonical subject ${subjectId}.`);
    }
    if (subjectIds.has(subjectId)) {
      throw new Error(`PR10 UFC research repeats subject ${subjectId}.`);
    }

    const facts = researchFacts.map(([researchConceptId, value, sourceIndex]) => {
      const sourceTuple = batch.sources[sourceIndex];
      if (!sourceTuple) {
        throw new Error(`PR10 UFC ${subjectId} concept ${researchConceptId} has invalid source index ${sourceIndex}.`);
      }
      const sourceItem = sourceByUrl.get(sourceTuple[0]);
      if (!sourceItem) {
        throw new Error(`PR10 UFC ${subjectId} concept ${researchConceptId} has no canonical provenance source.`);
      }
      if (!researchConceptId.trim() || !value.trim()) {
        throw new Error(`PR10 UFC ${subjectId} contains an empty retained concept.`);
      }

      // Research concept tokens are preserved verbatim, while the canonical concept id is
      // person-namespaced so the one cross-person token collision remains globally unique.
      const conceptId = `${subjectId}--${researchConceptId}`;
      const factId = `pr10-${subjectId.slice("ufc:".length)}--${researchConceptId}`;
      if (conceptIds.has(conceptId)) throw new Error(`Duplicate PR10 UFC concept id ${conceptId}.`);
      if (factIds.has(factId)) throw new Error(`Duplicate PR10 UFC fact id ${factId}.`);
      conceptIds.add(conceptId);
      factIds.add(factId);

      return {
        factId,
        conceptId,
        researchConceptId,
        knowledgeClass: "distinctive-identity" as const,
        verification: "verified" as const,
        value,
        sourceIds: [sourceItem.id],
      };
    });

    subjectIds.add(subjectId);
    records.push({ subjectId, facts });
  }
}

export const ufcPersonIdentityKnowledgeSources: readonly UfcPersonIdentitySource[] = sources;
export const ufcPersonIdentityKnowledgeRecords: readonly UfcPersonIdentityKnowledgeRecord[] = records;

const sourceById = new Map(ufcPersonIdentityKnowledgeSources.map((item) => [item.id, item]));
const recordBySubjectId = new Map(ufcPersonIdentityKnowledgeRecords.map((record) => [record.subjectId, record]));

export function getUfcPersonIdentityKnowledge(subjectId: string) {
  return recordBySubjectId.get(subjectId) ?? null;
}

export function getUfcPersonIdentityFactSources(fact: UfcPersonIdentityFact) {
  return fact.sourceIds
    .map((sourceId) => sourceById.get(sourceId))
    .filter((item): item is UfcPersonIdentitySource => Boolean(item));
}
