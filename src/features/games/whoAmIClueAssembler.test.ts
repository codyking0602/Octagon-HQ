import { describe, expect, it } from "vitest";
import { getFootballPersonIdentityKnowledge } from "../back-room/footballPersonIdentityKnowledge";
import { getFootballFact, getFootballFactualRecord, type FootballFactMetricId } from "../back-room/footballFactualStatsCore";
import { getUfcPersonIdentityKnowledge } from "../back-room/ufcPersonIdentityKnowledge";
import {
  footballWhoAmIApplicableIdentityFacts,
  footballWhoAmIApplicableMetricFacts,
  footballWhoAmIMetricFactIsPlayable,
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
  getUfcWhoAmIUniverse,
} from "./whoAmIAuthority";
import { assembleWhoAmIClues, whoAmIClueFacet, whoAmIIdentityKnowledgeClue } from "./whoAmIClueAssembler";
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

const CFB_WHO_AM_I_RESUME_METRICS: ReadonlySet<FootballFactMetricId> = new Set([
  "cfb-career-games",
  "cfb-career-passing-yards",
  "cfb-career-passing-touchdowns",
  "cfb-career-rushing-yards",
  "cfb-career-rushing-touchdowns",
  "cfb-career-receptions",
  "cfb-career-receiving-yards",
  "cfb-career-receiving-touchdowns",
  "cfb-career-total-touchdowns",
  "cfb-career-defensive-interceptions",
  "cfb-career-sacks",
  "cfb-career-pass-breakups",
  "cfb-career-forced-fumbles",
  "cfb-career-fumble-recoveries",
  "cfb-best-season-passing-yards",
  "cfb-best-season-passing-touchdowns",
  "cfb-best-season-interceptions",
  "cfb-best-season-passer-rating",
  "cfb-best-season-rushing-yards",
  "cfb-best-season-rushing-touchdowns",
  "cfb-best-season-receptions",
  "cfb-best-season-receiving-yards",
  "cfb-best-season-receiving-touchdowns",
  "cfb-best-season-sacks",
  "cfb-best-season-tackles-for-loss",
  "cfb-best-season-defensive-interceptions",
  "cfb-heisman-awards",
]);

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

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

function sequenceKey(sequence: readonly WhoAmIClue[]) {
  return sequence.map((clue) => clue.id).join("|");
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

describe("Who Am I Slice 13 quality regressions", () => {
  it("classifies draft, production, and accomplishments by meaning instead of substring collisions", () => {
    expect(whoAmIClueFacet({
      id: "fact:cfb-nfl-draft-overall-pick",
      text: "I was selected No. 37 overall in the NFL Draft.",
      band: "strong",
    })).toBe("career-path");
    expect(whoAmIClueFacet({
      id: "fact:nfl-first-team-all-pros",
      text: "I was a first-team All-Pro 8 times.",
      band: "strong",
    })).toBe("accomplishments");
    expect(whoAmIClueFacet({
      id: "fact:cfb-coach-national-titles",
      text: "I won 3 national championships as a head coach.",
      band: "strong",
    })).toBe("accomplishments");
    expect(whoAmIClueFacet({
      id: "fact:cfb-career-games",
      text: "I played in 48 college games.",
      band: "helpful",
    })).toBe("production");
  });

  it("classifies trade, alter-ego, faith, and freelance identity concepts into their real facets", () => {
    const cases = [
      ["trade-to-rams", "career-path"],
      ["weapon-x-alter-ego", "nickname"],
      ["quiet-faith-versus-field-fury", "off-field"],
      ["free-lance-safety-role", "style"],
    ] as const;

    for (const [conceptId, expectedFacet] of cases) {
      const clue = whoAmIIdentityKnowledgeClue({
        subjectId: "nfl-example",
        subjectName: "Example Player",
        subjectKind: "player",
        factId: conceptId,
        conceptId,
        value: "Example Player has a verified identity fact for this concept.",
      });
      expect(clue.facet, conceptId).toBe(expectedFacet);
    }
  });

  it("treats award-bearing identity facts as strong late-round clues", () => {
    const clue = whoAmIIdentityKnowledgeClue({
      subjectId: "cfb-dez-bryant",
      subjectName: "Dez Bryant",
      subjectKind: "player",
      factId: "receiver-and-punt-return-star",
      conceptId: "receiver-and-punt-return-star",
      value: "In 2008 Dez Bryant was recognized not only as an All-America receiver but also as the Big 12 Special Teams Player of the Year.",
    });

    expect(clue.band).toBe("strong");
  });

  it("does not turn another person's shared first name into the hidden identity placeholder", () => {
    const clue = whoAmIIdentityKnowledgeClue({
      subjectId: "cfb-kyle-pitts",
      subjectName: "Kyle Pitts",
      subjectKind: "player",
      factId: "trask-connection",
      conceptId: "trask-second-team-connection",
      value: "Kyle Pitts and quarterback Kyle Trask said their chemistry began with Florida's second-team offense.",
    });

    expect(clue.text).not.toContain("Kyle Pitts");
    expect(clue.text).toContain("Kyle Trask");
    expect(clue.text).not.toContain("this player Trask");
  });

  it("keeps namesake organizations grammatical after hiding the subject name", () => {
    const clue = whoAmIIdentityKnowledgeClue({
      subjectId: "nfl-darrell-green",
      subjectName: "Darrell Green",
      subjectKind: "player",
      factId: "foundation",
      conceptId: "youth-life-foundation",
      value: "He founded the Darrell Green Youth Life Foundation around education and literacy.",
    });

    expect(clue.text).not.toContain("Darrell Green");
    expect(clue.text).not.toContain("the this player");
    expect(clue.text).toContain("this player's namesake Youth Life Foundation");
  });
});

describe("Who Am I football scope-aware clue aggregation", () => {
  it("classifies specific clue meaning before generic college or team words", () => {
    expect(whoAmIClueFacet({
      id: "fact:cfb-career-passing-yards",
      text: "I finished my college career with 4,000 passing yards.",
      band: "helpful",
    })).toBe("production");
    expect(whoAmIClueFacet({
      id: "fact:nfl-first-team-all-pros",
      text: "I was a first-team All-Pro 5 times.",
      band: "strong",
    })).toBe("accomplishments");
    expect(whoAmIClueFacet({
      id: "draft-pick",
      text: "I was selected No. 1 overall in the NFL Draft.",
      band: "strong",
    })).toBe("career-path");
    expect(whoAmIClueFacet({
      id: "school",
      text: "I played college football at USC.",
      band: "broad",
    })).toBe("background");
    expect(whoAmIClueFacet({
      id: "conference",
      text: "I competed in the SEC.",
      band: "helpful",
    })).toBe("background");
  });

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

  it("feeds completed canonical person-identity knowledge into the actual UFC and football clue candidates", () => {
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
        const source = getFootballPersonIdentityKnowledge(candidate.id);
        if (!source) continue;
        covered += 1;
        const identityClues = candidate.clues.filter((clue) => clue.identityKnowledge);
        expect(identityClues.length).toBeGreaterThanOrEqual(source.facts.length);
        expect(source.facts.every((fact) => identityClues.some((clue) => clue.sourceFactId === fact.factId))).toBe(true);
        expect(identityClues.every((clue) => clue.knowledgeSubjectId === candidate.id)).toBe(true);
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

  it("keeps CFB and NFL Aaron Donald separate while sharing only applicable person-level knowledge", () => {
    expect(getFootballFact("cfb-aaron-donald", "cfb-best-season-sacks")?.fact.value).toBe(11);
    expect(getFootballFact("cfb-aaron-donald", "cfb-best-season-tackles-for-loss")?.fact.value).toBe(28.5);

    const cfbPool = getFootballWhoAmILaunchPool("CFB");
    const nflPool = getFootballWhoAmILaunchPool("NFL");
    const cfbSubject = cfbPool.subjects.find((subject) => subject.id === "cfb-aaron-donald");
    const nflSubject = nflPool.subjects.find((subject) => subject.id === "nfl-aaron-donald");
    expect(cfbSubject).toBeTruthy();
    expect(nflSubject).toBeTruthy();

    const cfbCandidate = representativeCandidate("CFB", "cfb-aaron-donald");
    const nflCandidate = representativeCandidate("NFL", "nfl-aaron-donald");
    const cfbSequence = whoAmIProgressiveClues(cfbCandidate.clues, () => 0);
    const nflSequence = whoAmIProgressiveClues(nflCandidate.clues, () => 0.999999);

    assertProgressiveSequence(cfbCandidate, cfbSequence);
    assertProgressiveSequence(nflCandidate, nflSequence);

    expect(cfbCandidate.clues.some((clue) => clue.text.includes("11 sacks"))).toBe(true);
    expect(cfbCandidate.clues.some((clue) => clue.text.includes("28.5 tackles for loss"))).toBe(true);
    expect(cfbCandidate.clues.some((clue) => clue.text.includes("No. 13 overall") && clue.text.includes("2014 NFL Draft"))).toBe(true);

    expect(cfbCandidate.clues.filter((clue) => clue.id.startsWith("fact:")).every((clue) => clue.id.startsWith("fact:cfb-"))).toBe(true);
    expect(nflCandidate.clues.filter((clue) => clue.id.startsWith("fact:")).every((clue) => clue.id.startsWith("fact:nfl-"))).toBe(true);
    expect(cfbCandidate.clues.some((clue) => /Defensive Player of the Year|first-team All-Pro|Super Bowl title/i.test(clue.text))).toBe(false);
    expect(nflCandidate.clues.some((clue) => /best college season|college career with/i.test(clue.text))).toBe(false);

    const cfbApplicableIdentity = footballWhoAmIApplicableIdentityFacts(cfbSubject!);
    const sharedFromNfl = cfbApplicableIdentity.filter((entry) => (
      entry.sourceSubjectId === "nfl-aaron-donald"
      && (entry.applicability === "person-shared" || entry.applicability === "transition")
    ));
    expect(sharedFromNfl.length).toBeGreaterThan(0);
    expect(sharedFromNfl.every((entry) => (
      cfbCandidate.clues.some((clue) => clue.sourceFactId === entry.fact.factId)
      || cfbCandidate.clues.some((clue) => clue.conceptId === `identity:${entry.fact.conceptId}`)
      || cfbCandidate.clues.some((clue) => normalize(clue.text) === normalize(entry.fact.value))
    ))).toBe(true);

    console.info(
      "Who Am I football Aaron Donald candidate pools",
      JSON.stringify({
        CFB: {
          applicableMetrics: footballWhoAmIApplicableMetricFacts(cfbSubject!).map(({ sourceSubjectId, fact }) => ({
            sourceSubjectId,
            metricId: fact.metricId,
            value: fact.value,
          })),
          applicableIdentity: cfbApplicableIdentity.map(({ sourceSubjectId, applicability, fact }) => ({
            sourceSubjectId,
            applicability,
            factId: fact.factId,
            conceptId: fact.conceptId,
          })),
          candidates: cfbCandidate.clues.map(({ id, text, band, facet, identityKnowledge, sourceFactId }) => ({
            id, text, band, facet, identityKnowledge: Boolean(identityKnowledge), sourceFactId,
          })),
          final10: cfbSequence.map(({ id, text, band, facet }) => ({ id, text, band, facet })),
        },
        NFL: {
          applicableMetrics: footballWhoAmIApplicableMetricFacts(nflSubject!).map(({ sourceSubjectId, fact }) => ({
            sourceSubjectId,
            metricId: fact.metricId,
            value: fact.value,
          })),
          applicableIdentity: footballWhoAmIApplicableIdentityFacts(nflSubject!).map(({ sourceSubjectId, applicability, fact }) => ({
            sourceSubjectId,
            applicability,
            factId: fact.factId,
            conceptId: fact.conceptId,
          })),
          candidates: nflCandidate.clues.map(({ id, text, band, facet, identityKnowledge, sourceFactId }) => ({
            id, text, band, facet, identityKnowledge: Boolean(identityKnowledge), sourceFactId,
          })),
          final10: nflSequence.map(({ id, text, band, facet }) => ({ id, text, band, facet })),
        },
      }),
    );
  });

  it("audits complete canonical UFC, NFL, and CFB populations with deterministic diverse sequences", () => {
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

    const cfbUniverse = getFootballWhoAmIUniverse("CFB");
    const cfbLaunchSubjectById = new Map(getFootballWhoAmILaunchPool("CFB").subjects.map((subject) => [subject.id, subject]));
    for (const candidate of cfbUniverse.candidates) {
      const subject = cfbLaunchSubjectById.get(candidate.id);
      if (!subject) throw new Error(`Missing CFB launch subject for ${candidate.id}.`);
      const canonicalResumeFacts = (getFootballFactualRecord(candidate.id)?.facts ?? [])
        .filter((fact) => CFB_WHO_AM_I_RESUME_METRICS.has(fact.metricId))
        .filter((fact) => Number(fact.value) !== 0)
        .filter((fact) => footballWhoAmIMetricFactIsPlayable(subject, fact));
      for (const fact of canonicalResumeFacts) {
        expect(
          candidate.clues.some((clue) => (
            clue.id === `fact:${fact.metricId}`
            || (fact.metricId === "cfb-heisman-awards" && clue.id === "heisman")
          )),
          `${candidate.id} is dropping canonical Who Am I resume metric ${fact.metricId}`,
        ).toBe(true);
      }
    }

    const footballAudits = (["NFL", "CFB"] as const).flatMap((league) => {
      const pool = getFootballWhoAmILaunchPool(league);
      const universe = getFootballWhoAmIUniverse(league);
      const subjectById = new Map(pool.subjects.map((subject) => [subject.id, subject]));

      return universe.candidates.map((candidate) => {
        const subject = subjectById.get(candidate.id);
        if (!subject) throw new Error(`Missing launch subject for ${candidate.id}.`);

        const applicableMetrics = footballWhoAmIApplicableMetricFacts(subject);
        const playableMetrics = applicableMetrics.filter(({ fact }) => footballWhoAmIMetricFactIsPlayable(subject, fact));
        const applicableIdentity = footballWhoAmIApplicableIdentityFacts(subject);
        const missingMetrics = playableMetrics.filter(({ fact }) => !candidate.clues.some((clue) => (
          clue.id === `fact:${fact.metricId}`
          || (fact.metricId === "cfb-heisman-awards" && clue.id === "heisman")
        )));
        const missingIdentity = applicableIdentity.filter(({ fact }) => !candidate.clues.some((clue) => (
          clue.sourceFactId === fact.factId
          || clue.conceptId === `identity:${fact.conceptId}`
        )));

        expect(
          missingMetrics,
          `${candidate.id} has unexplained missing applicable factual-ledger facts.`,
        ).toEqual([]);
        expect(
          missingIdentity,
          `${candidate.id} has unexplained missing applicable person-identity facts.`,
        ).toEqual([]);

        const recognitionClues = candidate.clues.filter((clue) => (
          clue.id.startsWith("recognition:")
          || clue.id === "heisman"
          || clue.id === "national-champion"
          || /mvp|heisman|super-bowl|all-pro|player-of-year|national-titles/.test(clue.id)
        )).length;
        const productionClues = candidate.clues.filter((clue) => (
          clue.id.startsWith("fact:")
          && !/mvp|heisman|super-bowl|all-pro|player-of-year|national-titles/.test(clue.id)
        )).length;
        const draftCareerPathClues = candidate.clues.filter((clue) => (
          clue.id.startsWith("draft-")
          || clue.id.startsWith("affiliation:")
          || clue.id === "career-path"
        )).length;
        const assembledClues = whoAmIProgressiveClues(candidate.clues).length;
        const classification = assembledClues < WHO_AM_I_CLUE_LIMIT
          ? (missingMetrics.length || missingIdentity.length ? "plumbing omission" : "genuine canonical source-depth gap")
          : "complete";

        return {
          league,
          id: candidate.id,
          name: candidate.name,
          totalApplicableCanonicalFacts: playableMetrics.length + applicableIdentity.length,
          metricIds: playableMetrics.map(({ fact }) => fact.metricId),
          generatedCandidateClues: candidate.clues.length,
          identityClues: candidate.clues.filter((clue) => clue.identityKnowledge).length,
          productionClues,
          recognitionClues,
          draftCareerPathClues,
          assembledClues,
          classification,
        };
      });
    });

    const cfbClueAudit = footballAudits
      .filter((candidate) => candidate.league === "CFB")
      .sort((left, right) => (
        left.generatedCandidateClues - right.generatedCandidateClues
        || left.assembledClues - right.assembledClues
        || left.id.localeCompare(right.id)
      ));

    const exactlyEight = cfbClueAudit.filter((candidate) => candidate.generatedCandidateClues === 8);

    const plumbingOmissions = footballAudits.filter((candidate) => candidate.classification === "plumbing omission");
    expect(plumbingOmissions).toEqual([]);

    const shortFootballCandidates = footballAudits
      .filter((candidate) => candidate.assembledClues < WHO_AM_I_CLUE_LIMIT)
      .sort((left, right) => (
        left.assembledClues - right.assembledClues
        || left.generatedCandidateClues - right.generatedCandidateClues
        || left.id.localeCompare(right.id)
      ));

    for (const candidate of shortFootballCandidates) {
      expect(
        candidate.generatedCandidateClues,
        `${candidate.id} has enough candidate clues but the assembler still returned fewer than 10.`,
      ).toBeLessThan(WHO_AM_I_CLUE_LIMIT);
      expect(candidate.classification).toBe("genuine canonical source-depth gap");
    }

    const underTwelveFootballCandidates = footballAudits
      .filter((candidate) => candidate.generatedCandidateClues < 12)
      .sort((left, right) => (
        left.generatedCandidateClues - right.generatedCandidateClues
        || left.id.localeCompare(right.id)
      ));

    console.info(
      "Who Am I football aggregation audit summary",
      JSON.stringify({
        populations: { UFC: 100, NFL: 200, CFB: 200 },
        cfbExactlyEightCandidatePools: exactlyEight.length,
        shortFootballCandidates: shortFootballCandidates.length,
        underTwelveFootballCandidates: underTwelveFootballCandidates.length,
        lowestDepthCfb: cfbClueAudit.slice(0, 15),
        remainingUnderTen: shortFootballCandidates,
        remainingUnderTwelve: underTwelveFootballCandidates,
      }),
    );
  });

  it.each([
    ["UFC", "Jon Jones"],
    ["NFL", "Tom Brady"],
    ["CFB", "Tim Tebow"],
  ] as const)("varies approved %s clue combinations across deterministic replay seeds for %s", (league, name) => {
    const universe = league === "UFC" ? getUfcWhoAmIUniverse() : getFootballWhoAmIUniverse(league);
    const candidate = universe.candidates.find((entry) => entry.name === name);
    if (!candidate) throw new Error(`Missing representative ${league} Who Am I candidate ${name}.`);

    const first = whoAmIProgressiveClues(candidate.clues, seededRandom(20260910));
    const repeated = whoAmIProgressiveClues(candidate.clues, seededRandom(20260910));
    expect(repeated).toEqual(first);
    assertProgressiveSequence(candidate, first);

    const sequences = Array.from({ length: 16 }, (_value, index) => (
      whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1))
    ));
    for (const sequence of sequences) {
      assertProgressiveSequence(candidate, sequence);
      expect(sequence.every((clue) => candidate.clues.includes(clue))).toBe(true);
    }

    const distinctSequences = new Set(sequences.map(sequenceKey));
    expect(distinctSequences.size).toBeGreaterThan(1);

    console.info(
      `Who Am I replay variation ${league} ${name}`,
      JSON.stringify({
        candidateClues: candidate.clues.length,
        distinctSequences: distinctSequences.size,
        seeds: [1, 2, 3, 4],
        samples: sequences.slice(0, 4).map((sequence) => sequence.map(({ id, band, facet }) => ({ id, band, facet }))),
      }),
    );
  });

  it("keeps seeded variation inside the existing quality and facet-diversity rules", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "Broad role", band: "broad", facet: "role", revealPriority: 10 },
      { id: "b-era", text: "Broad era", band: "broad", facet: "era", revealPriority: 10 },
      { id: "b-background", text: "Broad background", band: "broad", facet: "background", revealPriority: 10 },
      { id: "h-production-best", text: "Best production clue", band: "helpful", facet: "production", revealPriority: 10 },
      { id: "h-production-weaker", text: "Weaker production clue", band: "helpful", facet: "production", revealPriority: 50 },
      { id: "h-style", text: "Helpful style", band: "helpful", facet: "style", revealPriority: 20 },
      { id: "h-background", text: "Helpful background", band: "helpful", facet: "background", revealPriority: 20 },
      { id: "h-off-field", text: "Helpful off field", band: "helpful", facet: "off-field", revealPriority: 20 },
      { id: "h-career", text: "Helpful career path", band: "helpful", facet: "career-path", revealPriority: 20 },
      { id: "s-accomplishment", text: "Strong accomplishment", band: "strong", facet: "accomplishments", revealPriority: 10 },
      { id: "s-relationship", text: "Strong relationship", band: "strong", facet: "relationships", revealPriority: 10 },
      { id: "s-style", text: "Strong style", band: "strong", facet: "style", revealPriority: 10 },
      { id: "s-identity", text: "Strong identity", band: "strong", facet: "identity", revealPriority: 10 },
      { id: "g-nickname", text: "Giveaway nickname", band: "giveaway", facet: "nickname", revealPriority: 10 },
      { id: "g-relationship", text: "Giveaway relationship", band: "giveaway", facet: "relationships", revealPriority: 10 },
      { id: "g-career", text: "Giveaway career", band: "giveaway", facet: "career-path", revealPriority: 10 },
    ];

    for (let seed = 1; seed <= 24; seed += 1) {
      const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, seededRandom(seed));
      expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
      expect(sequence.some((clue) => clue.id === "h-production-best")).toBe(true);
      expect(sequence.some((clue) => clue.id === "h-production-weaker")).toBe(false);

      const counts = new Map<string, number>();
      for (const clue of sequence) {
        const facet = clue.facet ?? "unknown";
        counts.set(facet, (counts.get(facet) ?? 0) + 1);
      }
      expect(Math.max(...counts.values())).toBeLessThanOrEqual(2);

      for (let index = 1; index < sequence.length; index += 1) {
        expect(BAND_RANK[sequence[index]!.band]).toBeGreaterThanOrEqual(BAND_RANK[sequence[index - 1]!.band]);
      }
      expect(new Set(sequence.map((clue) => clue.conceptId ?? clue.id)).size).toBe(sequence.length);
    }
  });

  it("keeps lower-band facet clues from crowding late-game strength", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "Broad role", band: "broad", facet: "role", revealPriority: 10 },
      { id: "b-era", text: "Broad era", band: "broad", facet: "era", revealPriority: 10 },
      { id: "b-background", text: "Broad background", band: "broad", facet: "background", revealPriority: 20 },
      { id: "h-production", text: "Helpful career games", band: "helpful", facet: "production", revealPriority: 20 },
      { id: "h-style", text: "Helpful style", band: "helpful", facet: "style", revealPriority: 20 },
      { id: "h-background", text: "Helpful background", band: "helpful", facet: "background", revealPriority: 20 },
      { id: "h-career", text: "Helpful career path", band: "helpful", facet: "career-path", revealPriority: 20 },
      { id: "h-off-field", text: "Helpful off field", band: "helpful", facet: "off-field", revealPriority: 20 },
      { id: "s-production-one", text: "Strong production one", band: "strong", facet: "production", revealPriority: 10 },
      { id: "s-production-two", text: "Strong production two", band: "strong", facet: "production", revealPriority: 10 },
      { id: "s-relationship", text: "Strong relationship", band: "strong", facet: "relationships", revealPriority: 10 },
    ];

    for (let seed = 1; seed <= 16; seed += 1) {
      const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, seededRandom(seed));
      const late = sequence.filter((clue) => clue.band === "strong" || clue.band === "giveaway");
      expect(late).toHaveLength(3);
      expect(sequence.filter((clue) => clue.facet === "production")).toHaveLength(2);
    }
  });

  it("uses seeded variation between equivalent-quality clues without admitting a clearly weaker option", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "Broad role", band: "broad", facet: "role", revealPriority: 10 },
      { id: "b-era", text: "Broad era", band: "broad", facet: "era", revealPriority: 10 },
      { id: "h-style", text: "Helpful style", band: "helpful", facet: "style", revealPriority: 20 },
      { id: "h-background", text: "Helpful background", band: "helpful", facet: "background", revealPriority: 20 },
      { id: "h-production-identity", text: "Equivalent identity-backed production clue", band: "helpful", facet: "production", revealPriority: 20, identityKnowledge: true },
      { id: "h-production-canonical", text: "Equivalent canonical production clue", band: "helpful", facet: "production", revealPriority: 20 },
      { id: "h-production-weaker", text: "Clearly weaker production clue", band: "helpful", facet: "production", revealPriority: 50 },
      { id: "s-career", text: "Strong career path", band: "strong", facet: "career-path", revealPriority: 10 },
      { id: "s-accomplishment", text: "Strong accomplishment", band: "strong", facet: "accomplishments", revealPriority: 10 },
      { id: "s-identity", text: "Strong identity", band: "strong", facet: "identity", revealPriority: 10 },
      { id: "g-career", text: "Giveaway career path", band: "giveaway", facet: "career-path", revealPriority: 10 },
      { id: "g-nickname", text: "Giveaway nickname", band: "giveaway", facet: "nickname", revealPriority: 10 },
    ];

    const chosenProductionIds = new Set<string>();
    for (let seed = 1; seed <= 32; seed += 1) {
      const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, seededRandom(seed));
      expect(sequence.some((clue) => clue.id === "h-production-weaker")).toBe(false);
      const production = sequence.find((clue) => clue.id.startsWith("h-production-"));
      expect(production).toBeTruthy();
      chosenProductionIds.add(production!.id);
    }

    expect(chosenProductionIds).toContain("h-production-identity");
    expect(chosenProductionIds).toContain("h-production-canonical");
  });

  it("keeps the shallowest completed football clue pools playable across replay seeds", () => {
    for (const league of ["NFL", "CFB"] as const) {
      const universe = getFootballWhoAmIUniverse(league);
      const minimumDepth = Math.min(...universe.candidates.map((candidate) => candidate.clues.length));
      expect(minimumDepth).toBeGreaterThanOrEqual(12);

      const shallowest = universe.candidates.filter((candidate) => candidate.clues.length === minimumDepth);
      expect(shallowest.length).toBeGreaterThan(0);

      for (const candidate of shallowest) {
        for (const seed of [3, 11, 29]) {
          assertProgressiveSequence(candidate, whoAmIProgressiveClues(candidate.clues, seededRandom(seed)));
        }
      }
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
