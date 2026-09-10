import { describe, expect, it } from "vitest";
import { footballPersonIdentityKnowledgeRecords } from "./footballPersonIdentityKnowledge";
import { ufcFactualLedgerSubjects } from "./ufcFactualLedger";
import {
  getUfcPersonIdentityFactSources,
  getUfcPersonIdentityKnowledge,
  ufcPersonIdentityKnowledgeRecords,
  ufcPersonIdentityKnowledgeSources,
} from "./ufcPersonIdentityKnowledge";
import { getUfcWhoAmIUniverse } from "../games/whoAmIAuthority";

const EXPECTED_UFC_PR10_SUBJECT_IDS = [
  "ufc:alex-pantoja",
  "ufc:alex-pereira",
  "ufc:alexa-grasso",
  "ufc:alexander-volkanovski",
  "ufc:aljamain-sterling",
  "ufc:amanda-nunes",
  "ufc:anderson-silva",
  "ufc:anthony-pettis",
  "ufc:benson-henderson",
  "ufc:bj-penn",
  "ufc:brandon-moreno",
  "ufc:brian-ortega",
  "ufc:brock-lesnar",
  "ufc:cain-velasquez",
  "ufc:carla-esparza",
  "ufc:chael-sonnen",
  "ufc:charles-oliveira",
  "ufc:chris-weidman",
  "ufc:chuck-liddell",
  "ufc:ciryl-gane",
  "ufc:colby-covington",
  "ufc:conor-mcgregor",
  "ufc:cris-cyborg",
  "ufc:dan-henderson",
  "ufc:dan-hooker",
  "ufc:daniel-cormier",
  "ufc:deiveson-figueiredo",
  "ufc:demetrious-johnson",
  "ufc:derrick-lewis",
  "ufc:diego-lopes",
  "ufc:dominick-cruz",
  "ufc:dominick-reyes",
  "ufc:donald-cerrone",
  "ufc:dricus-du-plessis",
  "ufc:dustin-poirier",
  "ufc:fabricio-werdum",
  "ufc:forrest-griffin",
  "ufc:francis-ngannou",
  "ufc:frank-shamrock",
  "ufc:frankie-edgar",
  "ufc:georges-st-pierre",
  "ufc:gilbert-burns",
  "ufc:glover-teixeira",
  "ufc:henry-cejudo",
  "ufc:holly-holm",
  "ufc:ilia-topuria",
  "ufc:islam-makhachev",
  "ufc:israel-adesanya",
  "ufc:jessica-andrade",
  "ufc:joanna-jedrzejczyk",
  "ufc:jon-jones",
  "ufc:jorge-masvidal",
  "ufc:jose-aldo",
  "ufc:julianna-pena",
  "ufc:junior-dos-santos",
  "ufc:justin-gaethje",
  "ufc:kamaru-usman",
  "ufc:kayla-harrison",
  "ufc:kevin-holland",
  "ufc:khabib-nurmagomedov",
  "ufc:khamzat-chimaev",
  "ufc:leon-edwards",
  "ufc:lyoto-machida",
  "ufc:mackenzie-dern",
  "ufc:marlon-vera",
  "ufc:matt-hughes",
  "ufc:max-holloway",
  "ufc:merab-dvalishvili",
  "ufc:michael-bisping",
  "ufc:michael-chandler",
  "ufc:miesha-tate",
  "ufc:nate-diaz",
  "ufc:nick-diaz",
  "ufc:paddy-pimblett",
  "ufc:paulo-costa",
  "ufc:petr-yan",
  "ufc:quinton-jackson",
  "ufc:rafael-dos-anjos",
  "ufc:randy-couture",
  "ufc:rashad-evans",
  "ufc:robbie-lawler",
  "ufc:robert-whittaker",
  "ufc:ronda-rousey",
  "ufc:rose-namajunas",
  "ufc:royce-gracie",
  "ufc:sean-omalley",
  "ufc:sean-strickland",
  "ufc:shogun-rua",
  "ufc:stephen-thompson",
  "ufc:stipe-miocic",
  "ufc:tai-tuivasa",
  "ufc:tito-ortiz",
  "ufc:tj-dillashaw",
  "ufc:tom-aspinall",
  "ufc:tony-ferguson",
  "ufc:tyron-woodley",
  "ufc:valentina-shevchenko",
  "ufc:vitor-belfort",
  "ufc:yair-rodriguez",
  "ufc:zhang-weili",
] as const;

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

describe("Who Am I PR10 UFC person identity knowledge", () => {
  it("locks the exact current 100-subject UFC launch population without changing recognizability", () => {
    const ledgerIds = ufcFactualLedgerSubjects.map((subject) => subject.id).sort();
    const universeIds = getUfcWhoAmIUniverse().candidates.map((candidate) => candidate.id).sort();

    expect(ledgerIds).toEqual([...EXPECTED_UFC_PR10_SUBJECT_IDS]);
    expect(universeIds).toEqual([...EXPECTED_UFC_PR10_SUBJECT_IDS]);
    expect(ufcFactualLedgerSubjects.filter((subject) => subject.scope === "ranked-core")).toHaveLength(81);

    const expansion = ufcFactualLedgerSubjects.filter((subject) => subject.scope === "recognizable-expansion");
    expect(expansion).toHaveLength(19);
    expect(expansion.every((subject) => subject.recognizabilityTier === "A")).toBe(true);
  });

  it("covers every canonical UFC launch identity exactly once with exactly five retained concepts", () => {
    const recordIds = ufcPersonIdentityKnowledgeRecords.map((record) => record.subjectId).sort();
    expect(ufcPersonIdentityKnowledgeRecords).toHaveLength(100);
    expect(new Set(recordIds).size).toBe(100);
    expect(recordIds).toEqual([...EXPECTED_UFC_PR10_SUBJECT_IDS]);

    const facts = ufcPersonIdentityKnowledgeRecords.flatMap((record) => record.facts);
    expect(facts).toHaveLength(500);
    expect(ufcPersonIdentityKnowledgeRecords.every((record) => record.facts.length === 5)).toBe(true);
  });

  it("preserves unique person-scoped concepts, global fact ids, and normalized retained wording", () => {
    const globalFactIds = new Set<string>();
    const qualifiedConceptIds = new Set<string>();
    const normalizedValues = new Set<string>();

    for (const record of ufcPersonIdentityKnowledgeRecords) {
      expect(new Set(record.facts.map((fact) => fact.conceptId)).size).toBe(5);
      for (const fact of record.facts) {
        expect(fact.value.trim().length).toBeGreaterThan(0);
        expect(fact.knowledgeClass).toBe("distinctive-identity");
        expect(fact.verification).toBe("verified");
        globalFactIds.add(fact.factId);
        qualifiedConceptIds.add(`${record.subjectId}:${fact.conceptId}`);
        normalizedValues.add(normalize(fact.value));
      }
    }

    expect(globalFactIds.size).toBe(500);
    expect(qualifiedConceptIds.size).toBe(500);
    expect(normalizedValues.size).toBe(500);
  });

  it("retains one canonical provenance registry with 279 unique valid URLs", () => {
    expect(ufcPersonIdentityKnowledgeSources).toHaveLength(279);
    expect(new Set(ufcPersonIdentityKnowledgeSources.map((source) => source.id)).size).toBe(279);
    expect(new Set(ufcPersonIdentityKnowledgeSources.map((source) => source.url)).size).toBe(279);

    const referencedSourceIds = new Set<string>();
    for (const source of ufcPersonIdentityKnowledgeSources) {
      expect(source.publisher.trim().length).toBeGreaterThan(0);
      expect(source.title.trim().length).toBeGreaterThan(0);
      expect(new URL(source.url).protocol).toBe("https:");
    }

    for (const record of ufcPersonIdentityKnowledgeRecords) {
      for (const fact of record.facts) {
        const resolved = getUfcPersonIdentityFactSources(fact);
        expect(resolved).toHaveLength(fact.sourceIds.length);
        expect(resolved.length).toBeGreaterThan(0);
        fact.sourceIds.forEach((sourceId) => referencedSourceIds.add(sourceId));
      }
    }
    expect(referencedSourceIds.size).toBe(279);
  });

  it("keeps PR10 additive to the canonical UFC knowledge path and leaves prior football knowledge present", () => {
    expect(getUfcPersonIdentityKnowledge("ufc:jon-jones")?.facts).toHaveLength(5);
    expect(getUfcPersonIdentityKnowledge("ufc:diego-lopes")?.facts).toHaveLength(5);
    expect(getUfcPersonIdentityKnowledge("ufc:not-a-real-launch-id")).toBeNull();

    expect(footballPersonIdentityKnowledgeRecords.length).toBeGreaterThan(0);
    expect(getUfcWhoAmIUniverse().candidates).toHaveLength(100);
  });
});
