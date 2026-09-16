import { describe, expect, it } from "vitest";
import {
  footballWhoAmIApplicableIdentityFacts,
  footballWhoAmIApplicableMetricFacts,
  footballWhoAmIMetricFactIsPlayable,
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
} from "./footballWhoAmIAuthority";
import { CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS } from "./footballWhoAmICuration";
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

const GENERIC_VOLUME_IDS = new Set([
  "fact:cfb-career-games",
  "fact:cfb-career-starts",
  "fact:cfb-career-targets",
  "fact:cfb-career-passing-completions",
  "fact:cfb-career-passing-attempts",
  "fact:cfb-career-rushing-attempts",
  "fact:cfb-career-interceptions-thrown",
]);

const GENERIC_VOLUME_CONCEPTS = new Set([
  "identity:career-games",
  "identity:career-starts",
  "identity:career-games-starts",
  "identity:career-passing-completions",
  "identity:career-passing-attempts",
  "identity:career-rushing-attempts",
  "identity:career-interceptions-thrown",
]);

const BROKEN_FIRST_PERSON = /\bme\s+(?:gave|weighed|wanted|produced|lost|attended|committed|broke|lived|reportedly|struck|chose|learned|created|helped|impressed|underwent|caught|and|excelled|scored|watched|pledged|told|pointed|focused|collided|entered|executed|hit|briefly|passed|repeatedly|announced|rebuilt|went|pursued|scrambled|delivered|handled|could|asked|also)\b|\bI\s+(?:a|to\s+sit|died|has)\b|\bmy son's\b|\bFuture\s+and\s+I\s+quarterback\b|\bWilliam\s+myself\b|\bI\s+saw\s+me\b|\bAfter\s+(?:got|left)\b|\bWhile\s+was\b|\bWhen\s+finally\s+got\b/i;

function answerSurname(name: string) {
  return name
    .replace(/\b(?:Jr\.?|Sr\.?|II|III|IV)\b/gi, "")
    .trim()
    .split(/\s+/)
    .at(-1)!
    .replace(/[^A-Za-z'-]/g, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^()|[\]\\]/g, "\\$&");
}

describe("CFB Who Am I batch 2 calibration", () => {
  it("locks launch-order subjects 51-100 to the curated batch", () => {
    const ids = getFootballWhoAmILaunchPool("CFB").subjects.slice(50, 100).map((subject) => subject.id);
    expect(ids).toEqual(CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS);
  });

  it("keeps each college identity anchored to its source-owned school", () => {
    const subjects = new Map(getFootballWhoAmILaunchPool("CFB").subjects.map((subject) => [subject.id, subject]));
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      const subject = subjects.get(subjectId)!;
      const candidate = candidates.get(subjectId)!;
      if (!subject.school) continue;
      expect(
        candidate.clues.some((clue) => clue.text.includes(subject.school!)),
        subjectId + " missing school anchor " + subject.school,
      ).toBe(true);
    }
  });

  it("keeps retained factual and identity clues bound to applicable CFB source facts", () => {
    const subjects = new Map(getFootballWhoAmILaunchPool("CFB").subjects.map((subject) => [subject.id, subject]));
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      const subject = subjects.get(subjectId)!;
      const candidate = candidates.get(subjectId)!;
      const identityFactIds = new Set(footballWhoAmIApplicableIdentityFacts(subject).map(({ fact }) => fact.factId));
      const metricIds = new Set(
        footballWhoAmIApplicableMetricFacts(subject)
          .filter(({ fact }) => footballWhoAmIMetricFactIsPlayable(subject, fact))
          .map(({ fact }) => fact.metricId),
      );

      for (const clue of candidate.clues.filter((entry) => entry.identityKnowledge)) {
        expect(clue.sourceFactId, subjectId + " identity source").toBeTruthy();
        expect(identityFactIds.has(clue.sourceFactId!), subjectId + " foreign identity fact " + clue.sourceFactId).toBe(true);
      }
      for (const clue of candidate.clues.filter((entry) => entry.id.startsWith("fact:"))) {
        expect(metricIds.has(clue.id.slice("fact:".length) as never), subjectId + " foreign metric " + clue.id).toBe(true);
      }
    }
  });

  it("keeps college clues free of answer-name leaks and NFL-stage résumé leakage", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId)!;
      const surname = answerSurname(candidate.name);
      const surnamePattern = surname.length >= 4 ? new RegExp("\\\\b" + escapeRegExp(surname) + "\\\\b", "i") : null;

      for (const clue of candidate.clues) {
        expect(clue.text.toLowerCase(), subjectId + " full-name leak: " + clue.id).not.toContain(candidate.name.toLowerCase());
        if (surnamePattern) {
          expect(clue.text, subjectId + " surname leak: " + clue.id).not.toMatch(surnamePattern);
        }
        if (!/draft|selected|pick/i.test(clue.text)) {
          expect(clue.text, subjectId + " NFL-stage leak: " + clue.id).not.toMatch(
            /\bNFL\b|Super Bowl|All-Pro|Pro Bowl|NFL MVP|Defensive Player of the Year|Professional Football Hall of Fame/i,
          );
        }
      }
    }
  });

  it("keeps malformed first-person research transformations out of the curated batch", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      for (const clue of candidates.get(subjectId)!.clues) {
        expect(clue.text, subjectId + " malformed first-person copy: " + clue.id).not.toMatch(BROKEN_FIRST_PERSON);
      }
    }
  });

  it("prints compact replay diagnostics for all 50 subjects before enforcing hard gates", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const report = CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS.map((subjectId) => {
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
    console.info("CFB WHO AM I BATCH 2 PREFLIGHT", JSON.stringify(report));
  }, 150_000);

  it("keeps every batch-two pool sports-first, replayable, and free of filler", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId);
      expect(candidate, subjectId).toBeDefined();
      expect(candidate!.clues.length, subjectId + " playable pool").toBeGreaterThanOrEqual(12);
      expect(candidate!.clues.length, subjectId + " playable pool").toBeLessThanOrEqual(16);
      expect(
        candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"),
        subjectId + " deep biography",
      ).toHaveLength(0);
      expect(
        candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length,
        subjectId + " color clues",
      ).toBeLessThanOrEqual(1);
      expect(
        candidate!.clues.filter((clue) => whoAmIClueFacet(clue) === "relationships").length,
        subjectId + " relationship clues",
      ).toBeLessThanOrEqual(1);
      expect(
        candidate!.clues.some((clue) => ["player-career-start", "player-career-end", "career-span"].includes(clue.id)),
        subjectId + " useless chronology",
      ).toBe(false);
      expect(
        candidate!.clues.some((clue) => GENERIC_VOLUME_IDS.has(clue.id) || GENERIC_VOLUME_CONCEPTS.has(clue.conceptId ?? "")),
        subjectId + " generic career-volume filler",
      ).toBe(false);

      const sequences = Array.from(
        { length: 64 },
        (_value, index) => whoAmIProgressiveClues(candidate!.clues, seededRandom(index + 1)),
      );
      const first = new Set(sequences[0]!.map((clue) => clue.id));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map((clue) => clue.id)));
      const boards = new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|")));
      const maxRotated = Math.max(...sequences.map((sequence) => sequence.filter((clue) => !first.has(clue.id)).length));

      for (const sequence of sequences) {
        expect(sequence, subjectId + " clue count").toHaveLength(WHO_AM_I_CLUE_LIMIT);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length,
          subjectId + " sports identity",
        ).toBeGreaterThanOrEqual(9);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"),
          subjectId + " deep biography in run",
        ).toHaveLength(0);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length,
          subjectId + " color in run",
        ).toBeLessThanOrEqual(1);
        expect(
          sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length,
          subjectId + " relationship slots",
        ).toBeLessThanOrEqual(1);
        expect(
          sequence.slice(-2).every((clue) => clue.band === "strong" || clue.band === "giveaway"),
          subjectId + " strongest finish",
        ).toBe(true);
      }

      expect(surfaced.size, subjectId + " surfaced replay depth").toBeGreaterThanOrEqual(12);
      expect(maxRotated, subjectId + " rotating slots").toBeGreaterThanOrEqual(2);
      expect(boards.size, subjectId + " distinct boards").toBeGreaterThanOrEqual(2);
    }
  }, 150_000);
});
