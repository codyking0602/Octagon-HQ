import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createUfcWhoAmIRound,
  getFootballWhoAmILaunchPool,
} from "../games/whoAmIAuthority";
import {
  WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET,
  footballWhoAmIIdentityFactBank,
} from "../games/whoAmIIdentityFacts";
import {
  footballPersonIdentityKnowledgeRecords,
  footballPersonIdentityKnowledgeSources,
  getFootballPersonIdentityFactSources,
  getFootballPersonIdentityKnowledge,
} from "./footballPersonIdentityKnowledge";
import { getFootballSubject } from "./footballSubjectRegistry";

const PILOT_COUNT = 12;

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

describe("football person identity knowledge pilot", () => {
  it("uses exactly 12 canonical NFL A-tier launch identities without creating another roster", () => {
    expect(footballPersonIdentityKnowledgeRecords).toHaveLength(PILOT_COUNT);

    const launch = getFootballWhoAmILaunchPool("NFL");
    const launchById = new Map(launch.subjects.map((subject) => [subject.id, subject]));
    const missingFromLaunch = footballPersonIdentityKnowledgeRecords
      .filter((record) => !launchById.has(record.subjectId))
      .map((record) => record.subjectId);
    const nonATier = footballPersonIdentityKnowledgeRecords
      .filter((record) => launchById.get(record.subjectId)?.recognizabilityTier !== "A")
      .map((record) => record.subjectId);

    expect(missingFromLaunch).toEqual([]);
    expect(nonATier).toEqual([]);

    for (const record of footballPersonIdentityKnowledgeRecords) {
      const canonical = getFootballSubject(record.subjectId);
      expect(canonical?.id).toBe(record.subjectId);
      expect(canonical?.league).toBe("NFL");
      expect(Object.keys(record).sort()).toEqual(["facts", "subjectId"]);
    }

    expect(new Set(launch.subjects.map((subject) => subject.id)).size).toBe(launch.subjects.length);
    expect(launch.players).toHaveLength(180);
    expect(launch.coaches).toHaveLength(20);
    expect(launch.subjects).toHaveLength(200);
  });

  it("requires usable provenance and non-empty verified facts", () => {
    expect(footballPersonIdentityKnowledgeSources.length).toBeGreaterThan(0);
    const sourceIds = new Set(footballPersonIdentityKnowledgeSources.map((source) => source.id));
    expect(sourceIds.size).toBe(footballPersonIdentityKnowledgeSources.length);

    for (const source of footballPersonIdentityKnowledgeSources) {
      expect(source.publisher.trim()).not.toBe("");
      expect(source.title.trim()).not.toBe("");
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.coverage.trim()).not.toBe("");
    }

    for (const record of footballPersonIdentityKnowledgeRecords) {
      for (const fact of record.facts) {
        expect(fact.factId.trim()).not.toBe("");
        expect(fact.conceptId.trim()).not.toBe("");
        expect(fact.value.trim()).not.toBe("");
        expect(fact.verification).toBe("verified");
        expect(fact.sourceIds.length).toBeGreaterThan(0);
        expect(fact.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
        expect(getFootballPersonIdentityFactSources(fact)).toHaveLength(fact.sourceIds.length);
      }
    }
  });

  it("keeps fact ids, concepts, and fact wording distinct within each person", () => {
    for (const record of footballPersonIdentityKnowledgeRecords) {
      const factIds = record.facts.map((fact) => fact.factId);
      const conceptIds = record.facts.map((fact) => fact.conceptId);
      const values = record.facts.map((fact) => normalized(fact.value));
      expect(new Set(factIds).size).toBe(factIds.length);
      expect(new Set(conceptIds).size).toBe(conceptIds.length);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("separates distinctive identity depth from the existing structural/resume fact banks", () => {
    for (const record of footballPersonIdentityKnowledgeRecords) {
      expect(record.facts.every((fact) => fact.knowledgeClass === "distinctive-identity")).toBe(true);
      const subject = getFootballSubject(record.subjectId);
      expect(subject).not.toBeNull();
      const structured = footballWhoAmIIdentityFactBank(subject!);
      expect(structured.facts.length).toBeGreaterThanOrEqual(WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET);
      expect(structured.facts.every((fact) => !("knowledgeClass" in fact))).toBe(true);
    }
  });

  it("leaves NFL B-tier, CFB, and UFC behavior outside the pilot unchanged", () => {
    const nflLaunch = getFootballWhoAmILaunchPool("NFL");
    const nflBTier = nflLaunch.subjects.find((subject) => subject.recognizabilityTier === "B");
    expect(nflBTier).toBeDefined();
    expect(getFootballPersonIdentityKnowledge(nflBTier!.id)).toBeNull();

    const cfbLaunch = getFootballWhoAmILaunchPool("CFB");
    expect(cfbLaunch.players).toHaveLength(180);
    expect(cfbLaunch.coaches).toHaveLength(20);
    expect(cfbLaunch.subjects).toHaveLength(200);
    expect(cfbLaunch.subjects.every((subject) => getFootballPersonIdentityKnowledge(subject.id) == null)).toBe(true);

    expect(createUfcWhoAmIRound(() => 0).clues).toHaveLength(10);
  });

  it("contains no runtime web lookup, LLM truth judgment, or Who Am I runtime ownership", () => {
    const sourcePath = resolve(process.cwd(), "src/features/back-room/footballPersonIdentityKnowledge.ts");
    const sourceText = readFileSync(sourcePath, "utf8");

    expect(sourceText).not.toMatch(/\bfetch\s*\(/);
    expect(sourceText).not.toMatch(/\b(openai|anthropic|chatgpt|llm)\b/i);
    expect(sourceText).not.toMatch(/from\s+["'][^"']*whoAmI/i);
    expect(sourceText).not.toMatch(/getFootballWhoAmILaunchPool/);
  });
});
