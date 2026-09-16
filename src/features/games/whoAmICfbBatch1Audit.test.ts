import { describe, expect, it } from "vitest";
import {
  footballWhoAmIApplicableIdentityFacts,
  footballWhoAmIApplicableMetricFacts,
  footballWhoAmIMetricFactIsPlayable,
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
} from "./footballWhoAmIAuthority";
import { CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS } from "./footballWhoAmICuration";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const TRANSFER_ANCHORS: Readonly<Record<string, readonly string[]>> = {
  "cfb-cam-newton": ["Florida", "Blinn", "Auburn"],
  "cfb-joe-burrow": ["Ohio State", "LSU"],
  "cfb-baker-mayfield": ["Texas Tech", "Oklahoma"],
  "cfb-caleb-williams": ["Oklahoma", "USC"],
  "cfb-fernando-mendoza": ["California", "Indiana"],
};

describe("CFB Who Am I batch 1 calibration", () => {
  it("locks launch-order subjects 1-50 to the curated batch", () => {
    const ids = getFootballWhoAmILaunchPool("CFB").subjects.slice(0, 50).map((subject) => subject.id);
    expect(ids).toEqual(CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS);
  });

  it("keeps transfer-heavy college identities tied to their actual college stops", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const [subjectId, schools] of Object.entries(TRANSFER_ANCHORS)) {
      const candidate = candidates.get(subjectId)!;
      const text = candidate.clues.map((clue) => clue.text).join(" | ");
      for (const school of schools) expect(text, `${subjectId} missing ${school}`).toContain(school);
    }
  });

  it("keeps retained factual and identity clues bound to applicable CFB source facts", () => {
    const subjects = new Map(getFootballWhoAmILaunchPool("CFB").subjects.map((subject) => [subject.id, subject]));
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS) {
      const subject = subjects.get(subjectId)!;
      const candidate = candidates.get(subjectId)!;
      const identityFactIds = new Set(footballWhoAmIApplicableIdentityFacts(subject).map(({ fact }) => fact.factId));
      const metricIds = new Set(
        footballWhoAmIApplicableMetricFacts(subject)
          .filter(({ fact }) => footballWhoAmIMetricFactIsPlayable(subject, fact))
          .map(({ fact }) => fact.metricId),
      );
      for (const clue of candidate.clues.filter((entry) => entry.identityKnowledge)) {
        expect(clue.sourceFactId, `${subjectId} identity source`).toBeTruthy();
        expect(identityFactIds.has(clue.sourceFactId!), `${subjectId} foreign identity fact ${clue.sourceFactId}`).toBe(true);
      }
      for (const clue of candidate.clues.filter((entry) => entry.id.startsWith("fact:"))) {
        expect(metricIds.has(clue.id.slice("fact:".length) as never), `${subjectId} foreign metric ${clue.id}`).toBe(true);
      }
    }
  });

  it("keeps college clues free of answer leaks and NFL-stage résumé leakage", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId)!;
      for (const clue of candidate.clues) {
        expect(clue.text.toLowerCase(), `${subjectId} answer leak: ${clue.id}`).not.toContain(candidate.name.toLowerCase());
        if (!/draft|selected|pick/i.test(clue.text)) {
          expect(clue.text, `${subjectId} NFL-stage leak: ${clue.id}`).not.toMatch(/\bNFL\b|Super Bowl|All-Pro|Pro Bowl|NFL MVP|Defensive Player of the Year/i);
        }
      }
    }
  });

  it("keeps known biography, trivia, and surname leaks out of the curated batch", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const forbidden: Readonly<Record<string, RegExp>> = {
      "cfb-andrew-luck": /valedictorian|architectural design|academic all-america hall/i,
      "cfb-billy-cannon": /dentistry|orthodontics|counterfeit/i,
      "cfb-bijan-robinson": /mustard|grandfather|near-drowning/i,
      "cfb-deshaun-watson": /habitat for humanity|warrick dunn.*home/i,
      "cfb-fernando-mendoza": /catholic charities|bachelor.?s degree|final three cal classes/i,
      "cfb-reggie-bush": /Bush Push/i,
      "cfb-tony-dorsett": /steel mill|sportscaster/i,
    };
    for (const [subjectId, pattern] of Object.entries(forbidden)) {
      const text = candidates.get(subjectId)!.clues.map((clue) => clue.text).join(" | ");
      expect(text, `${subjectId} biography/trivia leak`).not.toMatch(pattern);
    }

    const obrien = candidates.get("cfb-davey-obrien")!.clues.map((clue) => clue.text).join(" | ");
    expect(obrien).not.toMatch(/O['’]?Brien/i);
  });

  it("keeps retained identity copy polished after first-person redaction", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const brokenFirstPerson = /\bme\s+(?:focused|collided|attended|led|entered|executed|hit|briefly|passed|produced|repeatedly|scored|announced|rebuilt|chose|went|pursued|scrambled|delivered|handled|could|asked|broke|also)\b|\bI\s+to\s+sit\b|\bme\s+and\s+my\b|\bFuture\s+and\s+I\s+quarterback\b|\bWilliam\s+myself\b/i;
    for (const subjectId of CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId)!;
      for (const clue of candidate.clues) {
        expect(clue.text, `${subjectId} malformed first-person copy: ${clue.id}`).not.toMatch(brokenFirstPerson);
      }
    }
  });

  it("prints compact replay diagnostics for all 50 subjects before enforcing hard gates", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const report = CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS.map((subjectId) => {
      const candidate = candidates.get(subjectId)!;
      const sequences = Array.from({ length: 64 }, (_value, index) => whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1)));
      const first = new Set(sequences[0]!.map((clue) => clue.id));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map((clue) => clue.id)));
      return {
        id: subjectId,
        pool: candidate.clues.length,
        surfaced: surfaced.size,
        boards: new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|"))).size,
        rotated: Math.max(...sequences.map((sequence) => sequence.filter((clue) => !first.has(clue.id)).length)),
        minSports: Math.min(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length)),
        maxDeep: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography").length)),
        maxColor: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length)),
        maxRelationships: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length)),
        minFinalStrong: Math.min(...sequences.map((sequence) => sequence.slice(-2).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length)),
      };
    });
    console.info("CFB WHO AM I BATCH 1 PREFLIGHT", JSON.stringify(report));
  }, 150_000);

  it("keeps every batch-one pool sports-first, replayable, and free of filler", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId);
      expect(candidate, subjectId).toBeDefined();
      expect(candidate!.clues.length, `${subjectId} playable pool`).toBeGreaterThanOrEqual(12);
      expect(candidate!.clues.length, `${subjectId} playable pool`).toBeLessThanOrEqual(16);
      expect(candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"), `${subjectId} deep biography`).toHaveLength(0);
      expect(candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length, `${subjectId} color clues`).toBeLessThanOrEqual(1);
      expect(candidate!.clues.some((clue) => ["player-career-start", "player-career-end", "career-span"].includes(clue.id)), `${subjectId} useless chronology`).toBe(false);
      expect(candidate!.clues.some((clue) => (
        clue.id === "fact:cfb-career-games"
        || clue.id === "fact:cfb-career-starts"
        || clue.id === "fact:cfb-career-passing-completions"
        || clue.id === "fact:cfb-career-passing-attempts"
        || clue.id === "fact:cfb-career-rushing-attempts"
        || clue.id === "fact:cfb-career-interceptions-thrown"
        || clue.conceptId === "identity:career-games"
        || clue.conceptId === "identity:career-starts"
        || clue.conceptId === "identity:career-passing-completions"
        || clue.conceptId === "identity:career-passing-attempts"
        || clue.conceptId === "identity:career-rushing-attempts"
        || clue.conceptId === "identity:career-interceptions-thrown"
      )), `${subjectId} generic volume filler`).toBe(false);

      const sequences = Array.from({ length: 64 }, (_value, index) => whoAmIProgressiveClues(candidate!.clues, seededRandom(index + 1)));
      const first = new Set(sequences[0]!.map((clue) => clue.id));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map((clue) => clue.id)));
      const boards = new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|")));
      const maxRotated = Math.max(...sequences.map((sequence) => sequence.filter((clue) => !first.has(clue.id)).length));

      for (const sequence of sequences) {
        expect(sequence, `${subjectId} clue count`).toHaveLength(WHO_AM_I_CLUE_LIMIT);
        expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length, `${subjectId} sports identity`).toBeGreaterThanOrEqual(9);
        expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"), `${subjectId} deep biography in run`).toHaveLength(0);
        expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length, `${subjectId} color in run`).toBeLessThanOrEqual(1);
        expect(sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length, `${subjectId} relationship slots`).toBeLessThanOrEqual(1);
        expect(sequence.slice(-2).every((clue) => clue.band === "strong" || clue.band === "giveaway"), `${subjectId} strongest finish`).toBe(true);
      }

      expect(surfaced.size, `${subjectId} surfaced replay depth`).toBeGreaterThanOrEqual(12);
      expect(maxRotated, `${subjectId} rotating slots`).toBeGreaterThanOrEqual(2);
      expect(boards.size, `${subjectId} distinct boards`).toBeGreaterThanOrEqual(2);
    }
  }, 150_000);
});
