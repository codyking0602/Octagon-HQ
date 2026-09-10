import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { createUfcWhoAmIRound, getFootballWhoAmILaunchPool, getUfcWhoAmIUniverse } from "../games/whoAmIAuthority";
import { footballPersonIdentityKnowledgeRecords, getFootballPersonIdentityKnowledge } from "./footballPersonIdentityKnowledge";
import { ufcFactualExpansion, ufcFactualLedgerSubjects } from "./ufcFactualLedger";
import {
  getUfcPersonIdentityFactSources,
  getUfcPersonIdentityKnowledge,
  ufcPersonIdentityKnowledgeRecords,
  ufcPersonIdentityKnowledgeSources,
} from "./ufcPersonIdentityKnowledge";
import { ufcPersonIdentityResearch1 } from "./ufcPersonIdentityResearch1";
import { ufcPersonIdentityResearch2 } from "./ufcPersonIdentityResearch2";
import { ufcPersonIdentityResearch3 } from "./ufcPersonIdentityResearch3";

const EXPECTED_RESEARCHED_IDENTITIES = 100;
const EXPECTED_CONCEPTS_PER_FIGHTER = 5;
const EXPECTED_CONCEPTS = 500;
const EXPECTED_UNIQUE_PROVENANCE_URLS = 279;

const researchRecords = [
  ...ufcPersonIdentityResearch1,
  ...ufcPersonIdentityResearch2,
  ...ufcPersonIdentityResearch3,
];

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

describe("UFC person identity knowledge", () => {
  it("matches the exact current canonical UFC Who Am I launch population", () => {
    const launchIds = new Set(getUfcWhoAmIUniverse().candidates.map((candidate) => candidate.id));
    const ledgerIds = new Set(ufcFactualLedgerSubjects.map((subject) => subject.id));
    const researchIds = new Set(researchRecords.map(([subjectId]) => subjectId));
    const retainedIds = new Set(ufcPersonIdentityKnowledgeRecords.map((record) => record.subjectId));

    expect(launchIds.size).toBe(EXPECTED_RESEARCHED_IDENTITIES);
    expect(ledgerIds).toEqual(launchIds);
    expect(researchRecords).toHaveLength(EXPECTED_RESEARCHED_IDENTITIES);
    expect(researchIds.size).toBe(EXPECTED_RESEARCHED_IDENTITIES);
    expect(researchIds).toEqual(launchIds);
    expect(retainedIds).toEqual(launchIds);
  });

  it("retains exactly five verified, source-backed distinctive concepts per fighter", () => {
    const factIds: string[] = [];
    const conceptIds: string[] = [];
    const values: string[] = [];

    expect(ufcPersonIdentityKnowledgeRecords).toHaveLength(EXPECTED_RESEARCHED_IDENTITIES);
    for (const record of ufcPersonIdentityKnowledgeRecords) {
      expect(getUfcPersonIdentityKnowledge(record.subjectId)).toBe(record);
      expect(record.facts).toHaveLength(EXPECTED_CONCEPTS_PER_FIGHTER);
      for (const fact of record.facts) {
        expect(fact.knowledgeClass).toBe("distinctive-identity");
        expect(fact.verification).toBe("verified");
        expect(fact.researchConceptId.trim()).not.toBe("");
        expect(fact.value.trim()).not.toBe("");
        expect(fact.sourceIds).toHaveLength(1);
        expect(getUfcPersonIdentityFactSources(fact)).toHaveLength(1);
        factIds.push(fact.factId);
        conceptIds.push(fact.conceptId);
        values.push(normalized(fact.value));
      }
    }

    expect(factIds).toHaveLength(EXPECTED_CONCEPTS);
    expect(new Set(factIds).size).toBe(EXPECTED_CONCEPTS);
    expect(new Set(conceptIds).size).toBe(EXPECTED_CONCEPTS);
    expect(new Set(values).size).toBe(EXPECTED_CONCEPTS);
  });

  it("keeps provenance valid and deduplicated by direct URL", () => {
    expect(ufcPersonIdentityKnowledgeSources).toHaveLength(EXPECTED_UNIQUE_PROVENANCE_URLS);
    expect(new Set(ufcPersonIdentityKnowledgeSources.map((source) => source.id)).size)
      .toBe(EXPECTED_UNIQUE_PROVENANCE_URLS);
    expect(new Set(ufcPersonIdentityKnowledgeSources.map((source) => source.url)).size)
      .toBe(EXPECTED_UNIQUE_PROVENANCE_URLS);

    for (const source of ufcPersonIdentityKnowledgeSources) {
      const url = new URL(source.url);
      expect(["http:", "https:"]).toContain(url.protocol);
      expect(source.publisher.trim()).not.toBe("");
      expect(source.title.trim()).not.toBe("");
    }
  });

  it("preserves the supplied research concept tokens while namespacing canonical concept ids", () => {
    const rawConcepts = researchRecords.flatMap(([subjectId, facts]) => (
      facts.map(([researchConceptId]) => [subjectId, researchConceptId] as const)
    ));
    expect(rawConcepts).toHaveLength(EXPECTED_CONCEPTS);
    expect(rawConcepts.filter(([, conceptId]) => conceptId === "physical-education-degree")).toHaveLength(2);

    for (const [subjectId, researchConceptId] of rawConcepts) {
      const fact = getUfcPersonIdentityKnowledge(subjectId)?.facts
        .find((candidate) => candidate.researchConceptId === researchConceptId);
      expect(fact?.conceptId).toBe(`${subjectId}--${researchConceptId}`);
    }
  });

  it("does not change UFC launch membership, recognition, rankings, or round behavior", () => {
    expect(canonicalRankingInputs.counts.fighters).toBe(81);
    expect(ufcFactualExpansion.targetTotalSubjects).toBe(100);
    expect(ufcFactualExpansion.expansionSubjectCount).toBe(19);
    expect(ufcFactualExpansion.recognizabilityTier).toBe("A");
    expect(ufcFactualExpansion.subjects.every((subject) => subject.recognizabilityTier === "A")).toBe(true);
    expect(createUfcWhoAmIRound(() => 0).clues).toHaveLength(10);
  });

  it("leaves completed NFL and CFB person identity knowledge intact", () => {
    expect(footballPersonIdentityKnowledgeRecords.length).toBeGreaterThan(0);
    expect(getFootballPersonIdentityKnowledge("nfl-tom-brady")?.facts).toHaveLength(5);
    expect(getFootballPersonIdentityKnowledge("cfb-tim-brown")?.facts).toHaveLength(5);
    expect(getFootballWhoAmILaunchPool("NFL").subjects).toHaveLength(200);
    expect(getFootballWhoAmILaunchPool("CFB").subjects).toHaveLength(200);
  });

  it("keeps PR10 data out of gameplay, ranking, and recognizability owners", () => {
    const sourcePaths = [
      resolve(process.cwd(), "src/features/back-room/ufcPersonIdentityKnowledge.ts"),
      resolve(process.cwd(), "src/features/back-room/ufcPersonIdentityResearch1.ts"),
      resolve(process.cwd(), "src/features/back-room/ufcPersonIdentityResearch2.ts"),
      resolve(process.cwd(), "src/features/back-room/ufcPersonIdentityResearch3.ts"),
    ];
    const sourceText = sourcePaths.map((path) => readFileSync(path, "utf8")).join("\n");

    expect(sourceText).not.toMatch(/canonicalRankingInputs|v2RankingRoster|recognizabilityTier\s*[:=]|createWhoAmIRound|whoAmIScore/);
  });
});
