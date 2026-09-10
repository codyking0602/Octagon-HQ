import { getUfcFactualSubject } from "./ufcFactualLedger";
import { ufcPersonIdentityResearch1, ufcPersonIdentityResearchSources1 } from "./ufcPersonIdentityResearch1";
import { ufcPersonIdentityResearch2, ufcPersonIdentityResearchSources2 } from "./ufcPersonIdentityResearch2";
import { ufcPersonIdentityResearch3, ufcPersonIdentityResearchSources3 } from "./ufcPersonIdentityResearch3";
import { ufcPersonIdentityResearch4, ufcPersonIdentityResearchSources4 } from "./ufcPersonIdentityResearch4";
import { ufcPersonIdentityResearch5, ufcPersonIdentityResearchSources5 } from "./ufcPersonIdentityResearch5";
import { ufcPersonIdentityResearch6, ufcPersonIdentityResearchSources6 } from "./ufcPersonIdentityResearch6";
import { ufcPersonIdentityResearch7, ufcPersonIdentityResearchSources7 } from "./ufcPersonIdentityResearch7";
import { ufcPersonIdentityResearch8, ufcPersonIdentityResearchSources8 } from "./ufcPersonIdentityResearch8";
import { ufcPersonIdentityResearch9, ufcPersonIdentityResearchSources9 } from "./ufcPersonIdentityResearch9";
import { ufcPersonIdentityResearch10, ufcPersonIdentityResearchSources10 } from "./ufcPersonIdentityResearch10";

export type UfcPersonIdentityKnowledgeClass = "distinctive-identity";
export type UfcPersonIdentityVerification = "verified";

export interface UfcPersonIdentityKnowledgeSource {
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
interface ResearchBatch {
  sources: readonly ResearchSource[];
  records: readonly ResearchRecord[];
}

const REVIEWED_ON = "2026-09-10";
const COVERAGE = "Who Am I Rebuild PR10 UFC distinctive-identity research provenance.";

const researchBatches: readonly ResearchBatch[] = [
  { sources: ufcPersonIdentityResearchSources1, records: ufcPersonIdentityResearch1 },
  { sources: ufcPersonIdentityResearchSources2, records: ufcPersonIdentityResearch2 },
  { sources: ufcPersonIdentityResearchSources3, records: ufcPersonIdentityResearch3 },
  { sources: ufcPersonIdentityResearchSources4, records: ufcPersonIdentityResearch4 },
  { sources: ufcPersonIdentityResearchSources5, records: ufcPersonIdentityResearch5 },
  { sources: ufcPersonIdentityResearchSources6, records: ufcPersonIdentityResearch6 },
  { sources: ufcPersonIdentityResearchSources7, records: ufcPersonIdentityResearch7 },
  { sources: ufcPersonIdentityResearchSources8, records: ufcPersonIdentityResearch8 },
  { sources: ufcPersonIdentityResearchSources9, records: ufcPersonIdentityResearch9 },
  { sources: ufcPersonIdentityResearchSources10, records: ufcPersonIdentityResearch10 },
];

function normalizedFactValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

const sourceIdByUrl = new Map<string, string>();
const sources: UfcPersonIdentityKnowledgeSource[] = [];

for (const batch of researchBatches) {
  for (const [url, publisher, title] of batch.sources) {
    if (sourceIdByUrl.has(url)) continue;
    const id = `identity-pr10-ufc-${String(sources.length + 1).padStart(3, "0")}`;
    sourceIdByUrl.set(url, id);
    sources.push({ id, publisher, title, url, reviewedOn: REVIEWED_ON, coverage: COVERAGE });
  }
}

export const ufcPersonIdentityKnowledgeSources: readonly UfcPersonIdentityKnowledgeSource[] = sources;

const records: UfcPersonIdentityKnowledgeRecord[] = [];
for (const batch of researchBatches) {
  for (const [subjectId, researchFacts] of batch.records) {
    const facts = researchFacts.map(([conceptId, value, sourceIndex]): UfcPersonIdentityFact => {
      const sourceTuple = batch.sources[sourceIndex];
      if (!sourceTuple) {
        throw new Error(`UFC person identity knowledge ${subjectId} concept ${conceptId} has invalid source index ${sourceIndex}.`);
      }
      const sourceId = sourceIdByUrl.get(sourceTuple[0]);
      if (!sourceId) {
        throw new Error(`UFC person identity knowledge ${subjectId} concept ${conceptId} has unresolved provenance.`);
      }
      return {
        factId: `pr10-${subjectId.slice(4)}-${conceptId}`,
        conceptId,
        knowledgeClass: "distinctive-identity",
        verification: "verified",
        value,
        sourceIds: [sourceId],
      };
    });
    records.push({ subjectId, facts });
  }
}

export const ufcPersonIdentityKnowledgeRecords: readonly UfcPersonIdentityKnowledgeRecord[] = records;

const sourceById = new Map(ufcPersonIdentityKnowledgeSources.map((row) => [row.id, row]));
const recordBySubjectId = new Map<string, UfcPersonIdentityKnowledgeRecord>();
const globalFactIds = new Set<string>();

for (const record of ufcPersonIdentityKnowledgeRecords) {
  if (!getUfcFactualSubject(record.subjectId)) {
    throw new Error(`UFC person identity knowledge targets non-canonical subject ${record.subjectId}.`);
  }
  if (recordBySubjectId.has(record.subjectId)) {
    throw new Error(`UFC person identity knowledge duplicates subject ${record.subjectId}.`);
  }

  const conceptIds = new Set<string>();
  const normalizedValues = new Set<string>();
  for (const identityFact of record.facts) {
    if (!identityFact.value.trim()) {
      throw new Error(`UFC person identity knowledge ${record.subjectId} fact ${identityFact.factId} is empty.`);
    }
    if (globalFactIds.has(identityFact.factId)) {
      throw new Error(`UFC person identity knowledge duplicates fact id ${identityFact.factId}.`);
    }
    if (conceptIds.has(identityFact.conceptId)) {
      throw new Error(`UFC person identity knowledge ${record.subjectId} duplicates concept ${identityFact.conceptId}.`);
    }
    const normalizedValue = normalizedFactValue(identityFact.value);
    if (normalizedValues.has(normalizedValue)) {
      throw new Error(`UFC person identity knowledge ${record.subjectId} duplicates retained wording.`);
    }
    if (!identityFact.sourceIds.length) {
      throw new Error(`UFC person identity knowledge ${record.subjectId} fact ${identityFact.factId} has no provenance.`);
    }
    for (const sourceId of identityFact.sourceIds) {
      if (!sourceById.has(sourceId)) {
        throw new Error(`UFC person identity knowledge ${record.subjectId} fact ${identityFact.factId} has unknown source ${sourceId}.`);
      }
    }

    globalFactIds.add(identityFact.factId);
    conceptIds.add(identityFact.conceptId);
    normalizedValues.add(normalizedValue);
  }

  recordBySubjectId.set(record.subjectId, record);
}

export function getUfcPersonIdentityKnowledge(subjectId: string) {
  const canonicalSubjectId = getUfcFactualSubject(subjectId)?.id ?? subjectId;
  return recordBySubjectId.get(canonicalSubjectId) ?? null;
}

export function getUfcPersonIdentityKnowledgeSource(sourceId: string) {
  return sourceById.get(sourceId) ?? null;
}

export function getUfcPersonIdentityFactSources(identityFact: UfcPersonIdentityFact) {
  return identityFact.sourceIds.map((sourceId) => sourceById.get(sourceId)!).filter(Boolean);
}
