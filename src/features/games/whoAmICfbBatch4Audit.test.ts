// Focused preflight trigger.
import { describe, expect, it } from "vitest";
import {
  footballWhoAmIApplicableIdentityFacts,
  footballWhoAmIApplicableMetricFacts,
  footballWhoAmIMetricFactIsPlayable,
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
} from "./footballWhoAmIAuthority";
import { getFootballFact, type FootballFactMetricId } from "../back-room/footballFactualStatsCore";
import { CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS } from "./footballWhoAmICuration";
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
  "fact:cfb-coach-career-losses",
  "fact:cfb-coach-career-ties",
]);

const GENERIC_VOLUME_CONCEPTS = new Set([
  "identity:career-games",
  "identity:career-starts",
  "identity:career-games-starts",
  "identity:career-passing-completions",
  "identity:career-passing-attempts",
  "identity:career-rushing-attempts",
  "identity:career-targets",
  "identity:career-interceptions-thrown",
]);

const BROKEN_FIRST_PERSON = /\\bme\\s+(?:focused|collided|attended|led|entered|executed|hit|briefly|passed|produced|repeatedly|scored|announced|rebuilt|chose|went|pursued|scrambled|delivered|handled|could|asked|broke|also|gave|weighed|pledged|lost|wanted|committed|struck|learned|watched|lived|told|decided|caught|built|excelled|arrived|returned|rushed|played|won|became|had|was|is|underwent|pointed|created|helped|impressed|reportedly|shifted|redshirted|forced|participated|faced|stayed|starred|followed|mentored|appeared|did|blocked|listed|pushed|exploited|coached|instituted|drove)\\b|\\bsaid\\s+me\\b|\\b(?:three|four)\\s+me\\s+brothers\\b|\\bI\\s+scholarship\\s+opportunities\\b|\\bI\\s+to\\s+sit\\b|\\bI\\s+a\\b|\\bI\\s+died\\b|\\bI\\s+has\\b|\\bme\\s+and\\s+my\\b|\\bFuture\\s+and\\s+I\\s+quarterback\\b|\\bWilliam\\s+myself\\b|\\bI\\s+saw\\s+me\\b|\\bAfter\\s+(?:got|left)\\b|\\bWhile\\s+was\\b|\\bWhen\\s+finally\\s+got\\b|\\bthe\\s+skinny\\s+me\\b|\\bQuarterback\\s+and\\s+I\\s+[A-Z]/i;

const OFF_FIELD_FILLER = /\b(?:academic|degree|engineering|poultry|poetry|paleontolog|community[- ]service|volunteer|fundraising|charity|business venture|real estate|horseman|horse|catfishing|restaurant|tattoo|service station|coal mine|naval service|navy service|military service)\b|\bmajor(?:ed)?\s+(?:in|at)\b/i;

const TRANSFER_SCHOOL_ANCHORS = new Map<string, readonly RegExp[]>([
  ["cfb-travis-hunter", [/\bJackson State\b/i, /\bColorado\b/i]],
  ["cfb-caleb-downs", [/\bAlabama\b/i, /\bOhio State\b/i]],
]);

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

describe("CFB Who Am I batch 4 calibration", () => {
  it("locks launch-order subjects 151-200 to the curated batch", () => {
    const ids = getFootballWhoAmILaunchPool("CFB").subjects.slice(150, 200).map((subject) => subject.id);
    console.info("CFB WHO AM I BATCH 4 LAUNCH IDS", JSON.stringify(ids));
    expect(ids).toEqual(CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS);
  });

  it("keeps each college identity anchored to its source-owned school", () => {
    const subjects = new Map(getFootballWhoAmILaunchPool("CFB").subjects.map((subject) => [subject.id, subject]));
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
      const subject = subjects.get(subjectId)!;
      const candidate = candidates.get(subjectId)!;
      if (!subject.school) continue;
      expect(
        candidate.clues.some((clue) => clue.text.includes(subject.school!)),
        subjectId + " missing school anchor " + subject.school,
      ).toBe(true);
    }
  });

  it("preserves important transfer-school identity without cross-school attribution", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const [subjectId, patterns] of TRANSFER_SCHOOL_ANCHORS) {
      const text = candidates.get(subjectId)!.clues.map((clue) => clue.text).join(" ");
      for (const pattern of patterns) {
        expect(text, subjectId + " missing transfer-school anchor " + pattern).toMatch(pattern);
      }
    }
  });

  it("keeps retained factual and identity clues bound to applicable CFB source facts", () => {
    const subjects = new Map(getFootballWhoAmILaunchPool("CFB").subjects.map((subject) => [subject.id, subject]));
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
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

  it("does not present a bounded 2014+ source window as a full college career", () => {
    const subjects = new Map(getFootballWhoAmILaunchPool("CFB").subjects.map((subject) => [subject.id, subject]));
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
      const subject = subjects.get(subjectId)!;
      for (const clue of candidates.get(subjectId)!.clues.filter((entry) => /^fact:cfb-career-/.test(entry.id))) {
        const metricId = clue.id.slice("fact:".length) as FootballFactMetricId;
        const fact = getFootballFact(subjectId, metricId);
        const bounded2014Source = fact?.sources.some((source) => /2014-2025/.test(source.coverage)) ?? false;
        if (bounded2014Source) {
          expect(
            subject.startSeason ?? 2014,
            subjectId + " exposes partial " + metricId + " as a career total",
          ).toBeGreaterThanOrEqual(2014);
        }
      }
    }
  });

  it("keeps college clues free of answer-name leaks and NFL-stage resume leakage", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId)!;
      const surname = answerSurname(candidate.name);
      const surnamePattern = surname.length >= 5 ? new RegExp("\\b" + escapeRegExp(surname) + "\\b", "i") : null;

      for (const clue of candidate.clues) {
        expect(clue.text.toLowerCase(), subjectId + " full-name leak: " + clue.id).not.toContain(candidate.name.toLowerCase());
        if (surnamePattern) {
          expect(clue.text, subjectId + " surname leak: " + clue.id).not.toMatch(surnamePattern);
        }
        if (!/draft|selected|pick/i.test(clue.text)) {
          expect(clue.text, subjectId + " NFL-stage leak: " + clue.id).not.toMatch(
            /\bNFL\b|Super Bowl|All-Pro|Pro Bowl|NFL MVP|NFL Defensive Player of the Year|Professional Football Hall of Fame/i,
          );
        }
      }
    }
  });

  it("keeps academic, business, charity, and unrelated personal filler out of the curated batch", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
      for (const clue of candidates.get(subjectId)!.clues.filter((entry) => entry.identityKnowledge)) {
        expect(clue.text, subjectId + " off-field filler: " + clue.id).not.toMatch(OFF_FIELD_FILLER);
      }
    }
  });

  it("keeps malformed first-person research transformations out of the curated batch", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
      for (const clue of candidates.get(subjectId)!.clues) {
        expect(clue.text, subjectId + " malformed first-person copy: " + clue.id).not.toMatch(BROKEN_FIRST_PERSON);
      }
    }
  });

  it("prints compact replay diagnostics for all 50 subjects before enforcing hard gates", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const report = CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS.map((subjectId) => {
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
        clues: candidate.clues.map((clue) => ({
          id: clue.id,
          conceptId: clue.conceptId,
          text: clue.text,
          band: clue.band,
          facet: whoAmIClueFacet(clue),
          selectionClass: whoAmIClueSelectionClass(clue),
          sourceFactId: clue.sourceFactId,
        })),
      };
    });
    console.info("CFB WHO AM I BATCH 4 PREFLIGHT", JSON.stringify(report));
  }, 150_000);

  it("keeps every batch-four pool sports-first, replayable, and free of filler", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
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
        candidate!.clues.some((clue) => ["player-career-start", "player-career-end", "career-span", "coach-affiliation-count"].includes(clue.id)),
        subjectId + " useless chronology/count filler",
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
