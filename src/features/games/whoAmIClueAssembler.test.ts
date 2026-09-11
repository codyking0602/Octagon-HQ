import { describe, expect, it } from "vitest";
import {
  footballPersonIdentityFactAppliesToLeague,
  getFootballPersonIdentityKnowledge,
} from "../back-room/footballPersonIdentityKnowledge";
import { getFootballFact, getFootballFactualRecord, type FootballFactMetricId } from "../back-room/footballFactualStatsCore";
import { getUfcPersonIdentityKnowledge } from "../back-room/ufcPersonIdentityKnowledge";
import { resolveFootballPersonSubjects, type FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import {
  FOOTBALL_WHO_AM_I_METRICS,
  footballWhoAmIFactAppliesToSubject,
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
  getUfcWhoAmIUniverse,
} from "./whoAmIAuthority";
import { assembleWhoAmIClues, whoAmIIdentityKnowledgeClue } from "./whoAmIClueAssembler";
import {
  WHO_AM_I_CLUE_LIMIT,
  whoAmIProgressiveClues,
  type WhoAmICandidate,
  type WhoAmIClue,
  type WhoAmIClueBand,
} from "./whoAmIEngine";

const BAND_RANK: Readonly<Record<WhoAmIClueBand, number>> = {
  broad: 0,
  helpful: 1,
  strong: 2,
  giveaway: 3,
};



function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function assertProgressiveSequence(candidate: WhoAmICandidate, sequence: readonly WhoAmIClue[]) {
  expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
  for (let index = 1; index < sequence.length; index += 1) {
    expect(BAND_RANK[sequence[index]!.band]).toBeGreaterThanOrEqual(BAND_RANK[sequence[index - 1]!.band]);
  }

  const conceptKeys = sequence.map((clue) => clue.conceptId ?? clue.id);
  expect(new Set(conceptKeys).size).toBe(sequence.length);
  expect(new Set(sequence.map((clue) => normalize(clue.text))).size).toBe(sequence.length);

  for (const clue of sequence.filter((entry) => entry.identityKnowledge)) {
    expect(clue.knowledgeSubjectId).toBe(candidate.id);
    expect(clue.sourceFactId?.trim().length).toBeGreaterThan(0);
    expect(normalize(clue.text)).not.toContain(normalize(candidate.name));
  }
}

function representativeCandidate(league: "NFL" | "CFB" | "UFC", id: string) {
  const universe = league === "UFC" ? getUfcWhoAmIUniverse() : getFootballWhoAmIUniverse(league);
  const candidate = universe.candidates.find((entry) => entry.id === id);
  if (!candidate) throw new Error(`Missing representative ${league} Who Am I candidate ${id}.`);
  return candidate;
}

function footballSubject(league: "NFL" | "CFB", id: string) {
  const subject = getFootballWhoAmILaunchPool(league).subjects.find((entry) => entry.id === id);
  if (!subject) throw new Error(`Missing ${league} Who Am I subject ${id}.`);
  return subject;
}

function applicableIdentityFacts(subject: FootballSubjectProfile) {
  return resolveFootballPersonSubjects(subject).flatMap((knowledgeSubject) => {
    const knowledge = getFootballPersonIdentityKnowledge(knowledgeSubject.id);
    if (!knowledge) return [];
    return knowledge.facts
      .filter((fact) => knowledgeSubject.id === subject.id || footballPersonIdentityFactAppliesToLeague(fact, subject.league, knowledgeSubject.league))
      .map((fact) => ({ knowledgeSubject, fact }));
  });
}

function identityFactIsAccountedFor(
  candidate: WhoAmICandidate,
  subject: FootballSubjectProfile,
  fact: ReturnType<typeof applicableIdentityFacts>[number]["fact"],
) {
  const expected = whoAmIIdentityKnowledgeClue({
    subjectId: subject.id,
    subjectName: subject.name,
    subjectKind: subject.kind === "coach" ? "coach" : "player",
    factId: fact.factId,
    conceptId: fact.conceptId,
    value: fact.value,
    tags: fact.tags,
  });
  return candidate.clues.some((clue) => (
    (clue.identityKnowledge && clue.sourceFactId === fact.factId)
    || clue.conceptId === expected.conceptId
    || normalize(clue.text) === normalize(expected.text)
  ));
}

function factualMetricIsAccountedFor(candidate: WhoAmICandidate, metricId: FootballFactMetricId) {
  return candidate.clues.some((clue) => (
    clue.id === `fact:${metricId}`
    || (metricId === "cfb-heisman-awards" && clue.id === "heisman")
  ));
}

function auditFootballCandidate(league: "NFL" | "CFB", candidate: WhoAmICandidate) {
  const subject = footballSubject(league, candidate.id);
  const recordFacts = getFootballFactualRecord(candidate.id)?.facts ?? [];
  const applicableLedgerFacts = recordFacts
    .filter((fact) => FOOTBALL_WHO_AM_I_METRICS.has(fact.metricId))
    .filter((fact) => footballWhoAmIFactAppliesToSubject(subject, fact.metricId))
    .filter((fact) => Number(fact.value) !== 0);
  const unsupportedLedgerFacts = recordFacts
    .filter((fact) => (
      !FOOTBALL_WHO_AM_I_METRICS.has(fact.metricId)
      || !footballWhoAmIFactAppliesToSubject(subject, fact.metricId)
      || Number(fact.value) === 0
    ));
  const identityFacts = applicableIdentityFacts(subject);
  const missingLedgerFacts = applicableLedgerFacts.filter((fact) => !factualMetricIsAccountedFor(candidate, fact.metricId));
  const missingIdentityFacts = identityFacts.filter(({ fact }) => !identityFactIsAccountedFor(candidate, subject, fact));
  const sequence = whoAmIProgressiveClues(candidate.clues);
  const productionClues = candidate.clues.filter((clue) => clue.id.startsWith("fact:")).length;
  const recognitionClues = candidate.clues.filter((clue) => (
    clue.id.startsWith("recognition:")
    || clue.facet === "accomplishments"
    || clue.id === "heisman"
    || clue.id === "national-champion"
  )).length;
  const draftCareerPathClues = candidate.clues.filter((clue) => (
    clue.id.startsWith("draft")
    || clue.id === "first-overall"
    || clue.id === "first-round"
    || clue.id === "undrafted"
    || clue.id === "career-path"
    || clue.id.startsWith("affiliation:")
    || clue.facet === "career-path"
  )).length;

  return {
    id: candidate.id,
    name: candidate.name,
    totalApplicableCanonicalFacts: applicableLedgerFacts.length + identityFacts.length,
    generatedCandidateClues: candidate.clues.length,
    identityClues: candidate.clues.filter((clue) => clue.identityKnowledge).length,
    productionClues,
    recognitionClues,
    draftCareerPathClues,
    finalAssembledClues: sequence.length,
    unsupportedLedgerFacts: unsupportedLedgerFacts.length,
    missingLedgerFacts: missingLedgerFacts.map((fact) => fact.metricId),
    missingIdentityFacts: missingIdentityFacts.map(({ knowledgeSubject, fact }) => `${knowledgeSubject.id}:${fact.factId}`),
    classification: sequence.length >= WHO_AM_I_CLUE_LIMIT
      ? "complete"
      : missingLedgerFacts.length || missingIdentityFacts.length
        ? "plumbing omission"
        : "genuine canonical source-depth gap",
  } as const;
}

describe("Who Am I PR11 clue assembler", () => {
  it("deduplicates concepts and effectively repeated clue values while preserving progressive bands", () => {
    const clues: WhoAmIClue[] = [
      { id: "b1", conceptId: "role", text: "I played defensive back.", band: "broad", facet: "role" },
      { id: "b2", conceptId: "era", text: "I was active in the 2010s.", band: "broad", facet: "era" },
      { id: "b3", conceptId: "role", text: "My position was defensive back.", band: "broad", facet: "role" },
      { id: "h1", conceptId: "background", text: "I grew up in a small Texas town before college.", band: "helpful", facet: "background", identityKnowledge: true },
      { id: "h2", conceptId: "style", text: "My game was built around physical press coverage and ball skills.", band: "helpful", facet: "style", identityKnowledge: true },
      { id: "h3", conceptId: "college", text: "I played college football in the Big Ten.", band: "helpful", facet: "background" },
      { id: "h4", conceptId: "background-echo", text: "I grew up in a small Texas town before playing in college.", band: "helpful", facet: "background" },
      { id: "s1", conceptId: "award", text: "I earned major national recognition before turning pro.", band: "strong", facet: "accomplishments" },
      { id: "s2", conceptId: "relationship", text: "A close football relationship became part of my public identity.", band: "strong", facet: "relationships" },
      { id: "s3", conceptId: "path", text: "My career path included a notable position change.", band: "strong", facet: "career-path" },
      { id: "g1", conceptId: "nickname", text: "A nickname tied to my playing style became widely known.", band: "giveaway", facet: "nickname" },
      { id: "g2", conceptId: "team", text: "One late clue identifies the franchise most associated with my career.", band: "giveaway", facet: "career-path" },
    ];

    const assembled = assembleWhoAmIClues(clues, 10);
    expect(assembled).toHaveLength(10);
    expect(assembled.some((clue) => clue.id === "b3")).toBe(false);
    expect(assembled.some((clue) => clue.id === "h4")).toBe(false);
    for (let index = 1; index < assembled.length; index += 1) {
      expect(BAND_RANK[assembled[index]!.band]).toBeGreaterThanOrEqual(BAND_RANK[assembled[index - 1]!.band]);
    }
  });

  it("feeds direct and applicable shared person-identity knowledge into football clue candidates", () => {
    for (const candidate of getUfcWhoAmIUniverse().candidates) {
      const source = getUfcPersonIdentityKnowledge(candidate.id);
      expect(source?.facts).toHaveLength(5);
      expect(candidate.clues.filter((clue) => clue.identityKnowledge)).toHaveLength(5);
      expect(candidate.clues.filter((clue) => clue.identityKnowledge).every((clue) => clue.knowledgeSubjectId === candidate.id)).toBe(true);
    }

    for (const league of ["NFL", "CFB"] as const) {
      const universe = getFootballWhoAmIUniverse(league);
      let covered = 0;
      for (const candidate of universe.candidates) {
        const subject = footballSubject(league, candidate.id);
        const source = getFootballPersonIdentityKnowledge(candidate.id);
        const applicable = applicableIdentityFacts(subject);
        if (!source && !applicable.length) continue;
        covered += 1;

        for (const fact of applicable) {
          expect(
            identityFactIsAccountedFor(candidate, subject, fact.fact),
            `${candidate.id} is dropping applicable identity fact ${fact.knowledgeSubject.id}:${fact.fact.factId}`,
          ).toBe(true);
        }
        if (source) {
          for (const fact of source.facts) {
            expect(
              candidate.clues.some((clue) => clue.identityKnowledge && clue.sourceFactId === fact.factId),
              `${candidate.id} is dropping direct identity fact ${fact.factId}`,
            ).toBe(true);
          }
        }
        expect(candidate.clues.filter((clue) => clue.identityKnowledge).every((clue) => clue.knowledgeSubjectId === candidate.id)).toBe(true);
      }
      expect(covered).toBeGreaterThan(0);
    }
  });

  it.each([
    ["NFL", "nfl-jason-kelce"],
    ["UFC", "ufc:tom-aspinall"],
  ] as const)("builds a curated deterministic %s sequence for a difficult representative identity", (league, id) => {
    const candidate = representativeCandidate(league, id);
    const first = whoAmIProgressiveClues(candidate.clues, () => 0);
    const second = whoAmIProgressiveClues(candidate.clues, () => 0.999999);

    expect(second).toEqual(first);
    assertProgressiveSequence(candidate, first);
    expect(first.filter((clue) => clue.identityKnowledge).length).toBeGreaterThanOrEqual(2);

    console.info(
      `Who Am I PR11 ${league} representative sequence`,
      JSON.stringify({ id: candidate.id, name: candidate.name, clues: first.map(({ text, band, facet, identityKnowledge }) => ({
        text, band, facet, identityKnowledge: Boolean(identityKnowledge),
      })) }),
    );
  });

  it("keeps CFB and NFL Aaron Donald separate while sharing only applicable person knowledge", () => {
    expect(getFootballFact("cfb-aaron-donald", "cfb-best-season-sacks")?.fact.value).toBe(11);
    expect(getFootballFact("cfb-aaron-donald", "cfb-best-season-tackles-for-loss")?.fact.value).toBe(28.5);
    expect(getFootballFact("nfl-aaron-donald", "nfl-career-sacks")?.fact.value).toBe(111);

    const cfbCandidate = representativeCandidate("CFB", "cfb-aaron-donald");
    const nflCandidate = representativeCandidate("NFL", "nfl-aaron-donald");
    const cfbFirst = whoAmIProgressiveClues(cfbCandidate.clues, () => 0);
    const cfbSecond = whoAmIProgressiveClues(cfbCandidate.clues, () => 0.999999);
    const nflFirst = whoAmIProgressiveClues(nflCandidate.clues, () => 0);
    const nflSecond = whoAmIProgressiveClues(nflCandidate.clues, () => 0.999999);

    expect(cfbSecond).toEqual(cfbFirst);
    expect(nflSecond).toEqual(nflFirst);
    assertProgressiveSequence(cfbCandidate, cfbFirst);
    assertProgressiveSequence(nflCandidate, nflFirst);

    expect(cfbCandidate.id).not.toBe(nflCandidate.id);
    expect(cfbCandidate.clues.some((clue) => clue.text.includes("11 sacks"))).toBe(true);
    expect(cfbCandidate.clues.some((clue) => clue.text.includes("28.5 tackles for loss"))).toBe(true);
    expect(cfbCandidate.clues.some((clue) => clue.text.includes("No. 13 overall") && clue.text.includes("2014 NFL Draft"))).toBe(true);
    expect(cfbCandidate.clues.some((clue) => clue.id === "identity:nfl-aaron-donald:pitt-redshirt-plan-ended-in-practice")).toBe(true);
    expect(cfbCandidate.clues.some((clue) => clue.id.startsWith("fact:nfl-"))).toBe(false);
    expect(cfbCandidate.clues.some((clue) => /111 sacks|Defensive Player of the Year|All-Pro|Los Angeles Rams|St\. Louis Rams/.test(clue.text))).toBe(false);

    expect(nflCandidate.clues.some((clue) => clue.text.includes("111") && clue.text.toLowerCase().includes("sacks"))).toBe(true);
    expect(nflCandidate.clues.some((clue) => clue.text.includes("Defensive Player of the Year"))).toBe(true);
    expect(nflCandidate.clues.some((clue) => clue.text.includes("All-Pro"))).toBe(true);
    expect(nflCandidate.clues.some((clue) => clue.id.startsWith("fact:cfb-"))).toBe(false);
    expect(nflCandidate.clues.some((clue) => /best college season included 11 sacks|28\.5 tackles for loss/.test(clue.text))).toBe(false);
    expect(nflCandidate.clues.some((clue) => clue.id === "identity:cfb-aaron-donald:pr8-cfb-aaron-donald--overlooked-recruiting")).toBe(false);

    const cfbRelated = resolveFootballPersonSubjects(footballSubject("CFB", cfbCandidate.id));
    const nflRelated = resolveFootballPersonSubjects(footballSubject("NFL", nflCandidate.id));
    expect(cfbRelated.map((subject) => subject.id)).toContain("nfl-aaron-donald");
    expect(nflRelated.map((subject) => subject.id)).toContain("cfb-aaron-donald");

    for (const related of cfbRelated.filter((subject) => subject.id !== cfbCandidate.id)) {
      const knowledge = getFootballPersonIdentityKnowledge(related.id);
      for (const fact of knowledge?.facts ?? []) {
        if (footballPersonIdentityFactAppliesToLeague(fact, cfbCandidate.league, related.league)) continue;
        expect(cfbCandidate.clues.some((clue) => clue.id === `identity:${related.id}:${fact.factId}`)).toBe(false);
      }
    }
    for (const related of nflRelated.filter((subject) => subject.id !== nflCandidate.id)) {
      const knowledge = getFootballPersonIdentityKnowledge(related.id);
      for (const fact of knowledge?.facts ?? []) {
        if (footballPersonIdentityFactAppliesToLeague(fact, nflCandidate.league, related.league)) continue;
        expect(nflCandidate.clues.some((clue) => clue.id === `identity:${related.id}:${fact.factId}`)).toBe(false);
      }
    }

    console.info("Who Am I follow-up CFB Aaron Donald candidate pool", JSON.stringify(cfbCandidate.clues));
    console.info("Who Am I follow-up CFB Aaron Donald final 10", JSON.stringify(cfbFirst));
    console.info("Who Am I follow-up NFL Aaron Donald candidate pool", JSON.stringify(nflCandidate.clues));
    console.info("Who Am I follow-up NFL Aaron Donald final 10", JSON.stringify(nflFirst));
  });

  it("audits complete canonical UFC, NFL, and CFB populations with deterministic scope-correct coverage", () => {
    const universes = [
      getUfcWhoAmIUniverse(),
      getFootballWhoAmIUniverse("NFL"),
      getFootballWhoAmIUniverse("CFB"),
    ];

    expect(universes[0].candidates).toHaveLength(100);
    expect(universes[1].candidates).toHaveLength(200);
    expect(universes[2].candidates).toHaveLength(200);

    let identityBackedCandidates = 0;
    let identityBackedPlayableCandidates = 0;
    let identityBackedPlayableSelections = 0;

    for (const universe of universes) {
      let playable = 0;
      for (const candidate of universe.candidates) {
        const sequence = whoAmIProgressiveClues(candidate.clues, () => 0.123);
        expect(whoAmIProgressiveClues(candidate.clues, () => 0.987)).toEqual(sequence);

        const conceptKeys = sequence.map((clue) => clue.conceptId ?? clue.id);
        expect(new Set(conceptKeys).size).toBe(sequence.length);
        expect(new Set(sequence.map((clue) => normalize(clue.text))).size).toBe(sequence.length);
        for (let index = 1; index < sequence.length; index += 1) {
          expect(BAND_RANK[sequence[index]!.band]).toBeGreaterThanOrEqual(BAND_RANK[sequence[index - 1]!.band]);
        }

        const identityBacked = candidate.clues.some((clue) => clue.identityKnowledge);
        if (identityBacked) identityBackedCandidates += 1;
        if (sequence.length === WHO_AM_I_CLUE_LIMIT) {
          playable += 1;
          assertProgressiveSequence(candidate, sequence);
          if (identityBacked) {
            identityBackedPlayableCandidates += 1;
            if (sequence.some((clue) => clue.identityKnowledge)) identityBackedPlayableSelections += 1;
          }
        }
      }
      expect(playable).toBeGreaterThan(0);
    }

    expect(identityBackedCandidates).toBeGreaterThanOrEqual(100);
    expect(identityBackedPlayableCandidates).toBeGreaterThan(0);
    expect(identityBackedPlayableSelections).toBe(identityBackedPlayableCandidates);

    for (const league of ["NFL", "CFB"] as const) {
      const universe = getFootballWhoAmIUniverse(league);
      for (const candidate of universe.candidates) {
        const audit = auditFootballCandidate(league, candidate);
        expect(audit.missingLedgerFacts, `${candidate.id} has unexplained missing factual-ledger clues`).toEqual([]);
        expect(audit.missingIdentityFacts, `${candidate.id} has unexplained missing identity clues`).toEqual([]);
        if (league === "CFB") {
          expect(candidate.clues.some((clue) => clue.id.startsWith("fact:nfl-"))).toBe(false);
        } else {
          expect(candidate.clues.some((clue) => clue.id.startsWith("fact:cfb-"))).toBe(false);
        }
      }
    }

    const cfbClueAudit = getFootballWhoAmIUniverse("CFB").candidates
      .map((candidate) => auditFootballCandidate("CFB", candidate))
      .sort((left, right) => (
        left.generatedCandidateClues - right.generatedCandidateClues
        || left.finalAssembledClues - right.finalAssembledClues
        || left.id.localeCompare(right.id)
      ));

    console.info("Who Am I follow-up lowest-depth CFB candidates", JSON.stringify(cfbClueAudit.slice(0, 15)));

    const shortCfbCandidates = cfbClueAudit.filter((candidate) => candidate.finalAssembledClues < WHO_AM_I_CLUE_LIMIT);
    const plumbingOmissions = shortCfbCandidates.filter((candidate) => candidate.classification === "plumbing omission");
    const genuineSourceGaps = shortCfbCandidates.filter((candidate) => candidate.classification === "genuine canonical source-depth gap");

    console.info("Who Am I follow-up CFB <10 plumbing omissions", JSON.stringify(plumbingOmissions));
    console.info("Who Am I follow-up CFB <10 genuine canonical source-depth gaps", JSON.stringify(genuineSourceGaps));

    expect(plumbingOmissions).toEqual([]);
    for (const candidate of genuineSourceGaps) {
      expect(candidate.generatedCandidateClues).toBeLessThan(WHO_AM_I_CLUE_LIMIT);
      expect(candidate.finalAssembledClues).toBe(candidate.generatedCandidateClues);
    }
  });

  it("does not mutate canonical person-identity source knowledge during assembly", () => {
    const ufcCandidate = representativeCandidate("UFC", "ufc:tom-aspinall");
    const nflCandidate = representativeCandidate("NFL", "nfl-jason-kelce");
    const cfbCandidate = representativeCandidate("CFB", "cfb-aaron-donald");

    const ufcBefore = JSON.stringify(getUfcPersonIdentityKnowledge(ufcCandidate.id));
    const nflBefore = JSON.stringify(getFootballPersonIdentityKnowledge(nflCandidate.id));
    const cfbBefore = JSON.stringify(getFootballPersonIdentityKnowledge(cfbCandidate.id));

    whoAmIProgressiveClues(ufcCandidate.clues);
    whoAmIProgressiveClues(nflCandidate.clues);
    whoAmIProgressiveClues(cfbCandidate.clues);

    expect(JSON.stringify(getUfcPersonIdentityKnowledge(ufcCandidate.id))).toBe(ufcBefore);
    expect(JSON.stringify(getFootballPersonIdentityKnowledge(nflCandidate.id))).toBe(nflBefore);
    expect(JSON.stringify(getFootballPersonIdentityKnowledge(cfbCandidate.id))).toBe(cfbBefore);
  });

  it("leaves canonical football launch ownership unchanged", () => {
    for (const league of ["NFL", "CFB"] as const) {
      const pool = getFootballWhoAmILaunchPool(league);
      const universe = getFootballWhoAmIUniverse(league);
      expect(universe.candidates.map((candidate) => candidate.id)).toEqual(pool.subjects.map((subject) => subject.id));
    }
  });
});
