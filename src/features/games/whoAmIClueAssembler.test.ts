import { describe, expect, it } from "vitest";
import { getFootballPersonIdentityKnowledge } from "../back-room/footballPersonIdentityKnowledge";
import { getFootballFact } from "../back-room/footballFactualStatsCore";
import { getUfcPersonIdentityKnowledge } from "../back-room/ufcPersonIdentityKnowledge";
import {
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
  getUfcWhoAmIUniverse,
} from "./whoAmIAuthority";
import { assembleWhoAmIClues } from "./whoAmIClueAssembler";
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
        expect(candidate.clues.filter((clue) => clue.identityKnowledge)).toHaveLength(source.facts.length);
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

  it("builds a complete CFB sequence for Aaron Donald from canonical resume and identity facts", () => {
    expect(getFootballFact("cfb-aaron-donald", "cfb-best-season-sacks")?.fact.value).toBe(11);
    expect(getFootballFact("cfb-aaron-donald", "cfb-best-season-tackles-for-loss")?.fact.value).toBe(28.5);

    const candidate = representativeCandidate("CFB", "cfb-aaron-donald");
    const first = whoAmIProgressiveClues(candidate.clues, () => 0);
    const second = whoAmIProgressiveClues(candidate.clues, () => 0.999999);

    expect(second).toEqual(first);
    assertProgressiveSequence(candidate, first);
    expect(first.filter((clue) => clue.identityKnowledge).length).toBeGreaterThanOrEqual(2);
    expect(candidate.clues.some((clue) => clue.text.includes("11 sacks"))).toBe(true);
    expect(candidate.clues.some((clue) => clue.text.includes("28.5 tackles for loss"))).toBe(true);
    expect(candidate.clues.some((clue) => clue.text.includes("No. 13 overall") && clue.text.includes("2014 NFL Draft"))).toBe(true);
    expect(first.filter((clue) => /sacks|tackles for loss|NFL Draft/.test(clue.text)).length).toBeGreaterThanOrEqual(2);

    console.info(
      "Who Am I PR11 CFB Aaron Donald sequence",
      JSON.stringify({ id: candidate.id, name: candidate.name, clues: first.map(({ text, band, facet, identityKnowledge }) => ({
        text, band, facet, identityKnowledge: Boolean(identityKnowledge),
      })) }),
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

    const cfbClueAudit = getFootballWhoAmIUniverse("CFB").candidates
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        availableClues: candidate.clues.length,
        assembledClues: whoAmIProgressiveClues(candidate.clues).length,
        identityClues: candidate.clues.filter((clue) => clue.identityKnowledge).length,
      }))
      .sort((left, right) => (
        left.availableClues - right.availableClues
        || left.assembledClues - right.assembledClues
        || left.id.localeCompare(right.id)
      ));

    console.info("Who Am I PR11 lowest-depth CFB candidates", JSON.stringify(cfbClueAudit.slice(0, 5)));

    const shortCfbCandidates = cfbClueAudit
      .filter((candidate) => candidate.assembledClues < WHO_AM_I_CLUE_LIMIT);
    if (shortCfbCandidates.length) {
      console.info("Who Am I PR11 short CFB candidates", JSON.stringify(shortCfbCandidates));
    }
    expect(shortCfbCandidates).toEqual([]);
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
