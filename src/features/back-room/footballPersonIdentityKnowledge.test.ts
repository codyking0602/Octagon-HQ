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
import { getFootballSubject, queryFootballSubjects } from "./footballSubjectRegistry";

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

const PR6_SUBJECT_IDS = new Set([
  "nfl-bobby-layne",
  "drew-brees",
  "nfl-fran-tarkenton",
  "kurt-warner",
  "nfl-sammy-baugh",
  "nfl-bart-starr",
  "cam-newton",
  "dan-marino",
  "nfl-josh-allen",
  "nfl-roger-staubach",
  "nflverse-player-00-0021306",
  "earl-campbell",
  "gale-sayers",
  "marshall-faulk",
  "nflverse-player-00-0025389",
  "nfl-alan-faneca",
  "nfl-jonathan-ogden",
  "nfl-trent-williams",
  "nfl-alan-page",
  "joe-greene",
  "nfl-brian-urlacher",
  "nflverse-player-00-0018227",
  "ronnie-lott",
  "andy-reid",
  "chuck-noll",
  "nfl-george-halas",
  "nfl-jimmy-johnson-coach",
  "pete-carroll",
  "nfl-jim-kelly",
  "joe-namath",
  "john-elway",
  "nflverse-player-00-0034796",
  "nfl-otto-graham",
  "nfl-sid-luckman",
  "steve-young",
  "nfl-terry-bradshaw",
  "troy-aikman",
  "nfl-doak-walker",
  "nfl-frank-gifford",
  "nfl-harold-red-grange",
  "marcus-allen",
  "nfl-paul-hornung",
  "nflverse-player-00-0024217",
  "tony-dorsett",
  "nfl-raymond-berry",
  "nfl-chuck-bednarik",
  "nfl-marshal-yanda",
  "nfl-tyron-smith",
  "nfl-emlen-tunnell",
  "joe-gibbs",
  "paul-brown",
  "nfl-bronko-nagurski",
  "eric-dickerson",
  "nfl-jim-thorpe",
  "nfl-oj-simpson",
  "nfl-don-hutson",
  "nflverse-player-00-0022921",
  "nfl-anthony-munoz",
  "nfl-kevin-mawae",
  "nfl-steve-hutchinson",
  "bruce-smith",
  "nfl-deacon-jones",
  "nfl-sam-huff",
  "nfl-dick-night-train-lane",
  "nfl-troy-polamalu",
  "bill-parcells",
  "nfl-earl-curly-lambeau",
  "nfl-john-madden",
]);

const PR6_DEFERRED_TIER_REVIEW_IDS = new Set([
  "nflverse-player-00-0031409",
  "nflverse-player-00-0027876",
  "nflverse-player-00-0024218",
  "nick-saban",
  "urban-meyer",
]);

const EXPECTED_A_RESEARCHED_COUNT = PR4_SUBJECT_IDS.size + PR5_SUBJECT_IDS.size + PR6_SUBJECT_IDS.size;

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

describe("football person identity knowledge", () => {
  it("keeps the reviewed NFL A-tier research slices intact with exact canonical ids", () => {
    expect(PR4_SUBJECT_IDS.size).toBe(12);
    expect(PR5_SUBJECT_IDS.size).toBe(20);
    expect(PR6_SUBJECT_IDS.size).toBe(68);
    expect(PR6_DEFERRED_TIER_REVIEW_IDS.size).toBe(5);
    expect(EXPECTED_A_RESEARCHED_COUNT).toBe(100);

    const allReviewed = [...PR4_SUBJECT_IDS, ...PR5_SUBJECT_IDS, ...PR6_SUBJECT_IDS];
    expect(new Set(allReviewed).size).toBe(allReviewed.length);

    const launch = getFootballWhoAmILaunchPool("NFL");
    const launchById = new Map(launch.subjects.map((subject) => [subject.id, subject]));
    for (const subjectId of allReviewed) {
      const launchSubject = launchById.get(subjectId);
      expect(launchSubject?.recognizabilityTier).toBe("A");
      const canonical = getFootballSubject(subjectId);
      expect(canonical?.id).toBe(subjectId);
      expect(canonical?.league).toBe("NFL");
      expect(getFootballPersonIdentityKnowledge(subjectId)).not.toBeNull();
    }
  });

  it("preserves the league-context cleanup while allowing intentional NFL B-tier enrichment", () => {
    const nflRecognizedById = new Map(queryFootballSubjects({
      league: "NFL",
      recognizabilityTiers: ["A", "B"],
      includeProjectedSourceSubjects: true,
      includeProjectedCanonicalRecognition: true,
    }).map((subject) => [subject.id, subject]));
    const nflLaunch = getFootballWhoAmILaunchPool("NFL");
    const nflLaunchById = new Map(nflLaunch.subjects.map((subject) => [subject.id, subject]));

    for (const [subjectId, name] of [
      ["nflverse-player-00-0031409", "Johnny Manziel"],
      ["nflverse-player-00-0027876", "Tim Tebow"],
      ["nflverse-player-00-0024218", "Vince Young"],
    ] as const) {
      const subject = nflRecognizedById.get(subjectId);
      expect(subject?.name).toBe(name);
      expect(subject?.league).toBe("NFL");
      expect(subject?.recognizabilityTier).toBe("B");

      const launchSubject = nflLaunchById.get(subjectId);
      if (launchSubject) {
        expect(launchSubject.recognizabilityTier).toBe("B");
        expect(getFootballPersonIdentityKnowledge(subjectId)?.facts).toHaveLength(5);
      } else {
        expect(getFootballPersonIdentityKnowledge(subjectId)).toBeNull();
      }
    }

    for (const subjectId of ["nick-saban", "urban-meyer"] as const) {
      expect(getFootballPersonIdentityKnowledge(subjectId)).toBeNull();
    }
    expect(nflLaunch.coaches.some((subject) => subject.name === "Nick Saban" || subject.name === "Urban Meyer")).toBe(false);

    const cfbLaunch = getFootballWhoAmILaunchPool("CFB");
    for (const name of ["Johnny Manziel", "Tim Tebow", "Vince Young", "Nick Saban", "Urban Meyer"] as const) {
      expect(cfbLaunch.subjects.find((subject) => subject.name === name)?.recognizabilityTier).toBe("A");
    }
  });

  it("keeps the locked NFL launch pool unchanged", () => {
    const launch = getFootballWhoAmILaunchPool("NFL");
    expect(new Set(launch.subjects.map((subject) => subject.id)).size).toBe(launch.subjects.length);
    expect(launch.players).toHaveLength(180);
    expect(launch.coaches).toHaveLength(20);
    expect(launch.subjects).toHaveLength(200);
  });

  it("covers the current canonical NFL B launch population with exactly five distinctive concepts each", () => {
    const nflLaunch = getFootballWhoAmILaunchPool("NFL");
    const nflBTier = nflLaunch.subjects.filter((subject) => subject.recognizabilityTier === "B");
    expect(nflBTier).toHaveLength(99);

    const nflBTierIds = new Set(nflBTier.map((subject) => subject.id));
    expect(nflBTierIds.size).toBe(nflBTier.length);

    for (const launchSubject of nflBTier) {
      const canonical = getFootballSubject(launchSubject.id);
      expect(canonical?.id).toBe(launchSubject.id);
      expect(canonical?.league).toBe("NFL");
      expect(canonical?.recognizabilityTier).toBe("B");

      const record = getFootballPersonIdentityKnowledge(launchSubject.id);
      expect(record?.subjectId).toBe(launchSubject.id);
      expect(record?.facts).toHaveLength(5);

      const factIds = record!.facts.map((identityFact) => identityFact.factId);
      const conceptIds = record!.facts.map((identityFact) => identityFact.conceptId);
      expect(factIds.every((id) => id.trim().length > 0)).toBe(true);
      expect(conceptIds.every((id) => id.trim().length > 0)).toBe(true);
      expect(new Set(factIds).size).toBe(5);
      expect(new Set(conceptIds).size).toBe(5);

      for (const identityFact of record!.facts) {
        expect(identityFact.knowledgeClass).toBe("distinctive-identity");
        expect(identityFact.verification).toBe("verified");
        expect(identityFact.sourceIds.length).toBeGreaterThan(0);
        expect(getFootballPersonIdentityFactSources(identityFact)).toHaveLength(identityFact.sourceIds.length);
        expect(normalized(identityFact.value).split(" ").length).toBeGreaterThanOrEqual(8);
      }
    }

    const bKnowledgeIds = new Set(
      footballPersonIdentityKnowledgeRecords
        .filter((record) => getFootballSubject(record.subjectId)?.recognizabilityTier === "B")
        .map((record) => record.subjectId),
    );
    expect(bKnowledgeIds).toEqual(nflBTierIds);
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
      expect(Object.keys(record).sort()).toEqual(["facts", "subjectId"]);
      for (const identityFact of record.facts) {
        expect(identityFact.factId.trim()).not.toBe("");
        expect(identityFact.conceptId.trim()).not.toBe("");
        expect(identityFact.value.trim()).not.toBe("");
        expect(identityFact.knowledgeClass).toBe("distinctive-identity");
        expect(identityFact.verification).toBe("verified");
        expect(identityFact.sourceIds.length).toBeGreaterThan(0);
        expect(identityFact.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
        expect(getFootballPersonIdentityFactSources(identityFact)).toHaveLength(identityFact.sourceIds.length);
      }
    }
  });

  it("keeps fact ids, concepts, and normalized fact wording distinct within each person", () => {
    for (const record of footballPersonIdentityKnowledgeRecords) {
      const factIds = record.facts.map((identityFact) => identityFact.factId);
      const conceptIds = record.facts.map((identityFact) => identityFact.conceptId);
      const values = record.facts.map((identityFact) => normalized(identityFact.value));
      expect(new Set(factIds).size).toBe(factIds.length);
      expect(new Set(conceptIds).size).toBe(conceptIds.length);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("keeps person knowledge separate from structured resume facts", () => {
    for (const subjectId of PR6_SUBJECT_IDS) {
      const record = getFootballPersonIdentityKnowledge(subjectId);
      expect(record).not.toBeNull();
      expect(record!.facts.length).toBeGreaterThanOrEqual(5);
    }

    for (const record of footballPersonIdentityKnowledgeRecords) {
      const subject = getFootballSubject(record.subjectId);
      expect(subject).not.toBeNull();
      const structured = footballWhoAmIIdentityFactBank(subject!);
      expect(structured.facts.length).toBeGreaterThanOrEqual(WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET);
      expect(structured.facts.every((identityFact) => !("knowledgeClass" in identityFact))).toBe(true);
    }
  });

  it("keeps CFB and UFC behavior untouched", () => {
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
