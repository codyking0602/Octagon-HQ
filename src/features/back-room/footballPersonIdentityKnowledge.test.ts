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

const PR4_SUBJECT_IDS = new Set([
  "nfl-patrick-mahomes",
  "barry-sanders",
  "nfl-jerry-rice",
  "bill-belichick",
  "nfl-jason-kelce",
  "nfl-aaron-donald",
  "lawrence-taylor",
  "nfl-ray-lewis",
  "deion-sanders",
  "walter-payton",
  "johnny-unitas",
  "bill-walsh",
]);

const PR5_SUBJECT_IDS = new Set([
  "tom-brady",
  "peyton-manning",
  "brett-favre",
  "joe-montana",
  "nfl-aaron-rodgers",
  "jim-brown",
  "emmitt-smith",
  "ladainian-tomlinson",
  "nfl-randy-moss",
  "nflverse-player-00-0012478",
  "john-mackey",
  "nfl-joe-thomas",
  "nfl-orlando-pace",
  "reggie-white",
  "dick-butkus",
  "nfl-ed-reed",
  "nflverse-player-00-0027949",
  "vince-lombardi",
  "don-shula",
  "tom-landry",
]);

const EXPECTED_RESEARCHED_COUNT = PR4_SUBJECT_IDS.size + PR5_SUBJECT_IDS.size;

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

describe("football person identity knowledge", () => {
  it("keeps the PR4 pilot and adds only canonical NFL A-tier launch identities in PR5", () => {
    expect(PR4_SUBJECT_IDS.size).toBe(12);
    expect(PR5_SUBJECT_IDS.size).toBe(20);
    expect([...PR5_SUBJECT_IDS].filter((id) => PR4_SUBJECT_IDS.has(id))).toEqual([]);
    expect(footballPersonIdentityKnowledgeRecords).toHaveLength(EXPECTED_RESEARCHED_COUNT);

    const recordIds = footballPersonIdentityKnowledgeRecords.map((record) => record.subjectId);
    expect(new Set(recordIds).size).toBe(recordIds.length);
    expect(new Set(recordIds)).toEqual(new Set([...PR4_SUBJECT_IDS, ...PR5_SUBJECT_IDS]));

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
  });

  it("keeps the locked NFL launch pool unchanged", () => {
    const launch = getFootballWhoAmILaunchPool("NFL");
    expect(new Set(launch.subjects.map((subject) => subject.id)).size).toBe(launch.subjects.length);
    expect(launch.players).toHaveLength(180);
    expect(launch.coaches).toHaveLength(20);
    expect(launch.subjects).toHaveLength(200);
  });

  it("requires usable provenance and non-empty verified distinctive facts", () => {
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
        expect(fact.knowledgeClass).toBe("distinctive-identity");
        expect(fact.verification).toBe("verified");
        expect(fact.sourceIds.length).toBeGreaterThan(0);
        expect(fact.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
        expect(getFootballPersonIdentityFactSources(fact)).toHaveLength(fact.sourceIds.length);
      }
    }
  });

  it("keeps fact ids, concepts, and normalized fact wording distinct within each person", () => {
    for (const record of footballPersonIdentityKnowledgeRecords) {
      const factIds = record.facts.map((fact) => fact.factId);
      const conceptIds = record.facts.map((fact) => fact.conceptId);
      const values = record.facts.map((fact) => normalized(fact.value));
      expect(new Set(factIds).size).toBe(factIds.length);
      expect(new Set(conceptIds).size).toBe(conceptIds.length);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("gives every PR5 identity meaningful distinctive depth without replacing structured resume facts", () => {
    for (const subjectId of PR5_SUBJECT_IDS) {
      const record = getFootballPersonIdentityKnowledge(subjectId);
      expect(record).not.toBeNull();
      expect(record!.facts.length).toBeGreaterThanOrEqual(5);
    }

    for (const record of footballPersonIdentityKnowledgeRecords) {
      const subject = getFootballSubject(record.subjectId);
      expect(subject).not.toBeNull();
      const structured = footballWhoAmIIdentityFactBank(subject!);
      expect(structured.facts.length).toBeGreaterThanOrEqual(WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET);
      expect(structured.facts.every((fact) => !("knowledgeClass" in fact))).toBe(true);
    }
  });

  it("adds no NFL B-tier, CFB, or UFC enrichment", () => {
    const nflLaunch = getFootballWhoAmILaunchPool("NFL");
    const nflBTier = nflLaunch.subjects.filter((subject) => subject.recognizabilityTier === "B");
    expect(nflBTier.length).toBeGreaterThan(0);
    expect(nflBTier.every((subject) => getFootballPersonIdentityKnowledge(subject.id) == null)).toBe(true);

    const cfbLaunch = getFootballWhoAmILaunchPool("CFB");
    expect(cfbLaunch.players).toHaveLength(180);
    expect(cfbLaunch.coaches).toHaveLength(20);
    expect(cfbLaunch.subjects).toHaveLength(200);
    expect(cfbLaunch.subjects.every((subject) => getFootballPersonIdentityKnowledge(subject.id) == null)).toBe(true);

    expect(createUfcWhoAmIRound(() => 0).clues).toHaveLength(10);
  });

  it("contains no duplicate runtime roster, web lookup, LLM judgment, or Who Am I ownership", () => {
    const sourcePath = resolve(process.cwd(), "src/features/back-room/footballPersonIdentityKnowledge.ts");
    const sourceText = readFileSync(sourcePath, "utf8");

    expect(sourceText).not.toMatch(/\bfetch\s*\(/);
    expect(sourceText).not.toMatch(/\b(openai|anthropic|chatgpt|llm)\b/i);
    expect(sourceText).not.toMatch(/from\s+["'][^"']*whoAmI/i);
    expect(sourceText).not.toMatch(/getFootballWhoAmILaunchPool/);
  });
});