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

const EXPECTED_RESEARCHED_COUNT = PR4_SUBJECT_IDS.size + PR5_SUBJECT_IDS.size + PR6_SUBJECT_IDS.size;

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

describe("football person identity knowledge", () => {
  it("covers the reviewed NFL A-tier research slices with exact canonical ids", () => {
    expect(PR4_SUBJECT_IDS.size).toBe(12);
    expect(PR5_SUBJECT_IDS.size).toBe(20);
    expect(PR6_SUBJECT_IDS.size).toBe(68);
    expect(PR6_DEFERRED_TIER_REVIEW_IDS.size).toBe(5);

    const allReviewed = [...PR4_SUBJECT_IDS, ...PR5_SUBJECT_IDS, ...PR6_SUBJECT_IDS];
    expect(new Set(allReviewed).size).toBe(allReviewed.length);
    expect(footballPersonIdentityKnowledgeRecords).toHaveLength(EXPECTED_RESEARCHED_COUNT);
    expect(new Set(footballPersonIdentityKnowledgeRecords.map((record) => record.subjectId))).toEqual(new Set(allReviewed));

    const launch = getFootballWhoAmILaunchPool("NFL");
    const launchById = new Map(launch.subjects.map((subject) => [subject.id, subject]));
    for (const subjectId of allReviewed) {
      const launchSubject = launchById.get(subjectId);
      expect(launchSubject?.recognizabilityTier).toBe("A");
      const canonical = getFootballSubject(subjectId);
      expect(canonical?.id).toBe(subjectId);
      expect(canonical?.league).toBe("NFL");
    }
  });

  it("keeps the five obvious tier-review identities out of PR6 knowledge", () => {
    const launchById = new Map(getFootballWhoAmILaunchPool("NFL").subjects.map((subject) => [subject.id, subject]));
    for (const subjectId of PR6_DEFERRED_TIER_REVIEW_IDS) {
      expect(launchById.get(subjectId)?.recognizabilityTier).toBe("A");
      expect(getFootballPersonIdentityKnowledge(subjectId)).toBeNull();
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

  it("gives every PR6 identity meaningful distinctive depth without replacing structured resume facts", () => {
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
