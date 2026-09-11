import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse, getUfcWhoAmIUniverse } from "./whoAmIAuthority";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_RESCUE_OPTION_COUNT,
  whoAmIProgressiveClues,
  whoAmIRescueChoices,
  type WhoAmICandidate,
  type WhoAmIClue,
  type WhoAmIClueBand,
  type WhoAmIRound,
  type WhoAmISubject,
} from "./whoAmIEngine";

const BAND_RANK: Readonly<Record<WhoAmIClueBand, number>> = {
  broad: 0,
  helpful: 1,
  strong: 2,
  giveaway: 3,
};

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

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}


function sequenceKey(sequence: readonly WhoAmIClue[]) {
  return sequence.map((clue) => clue.id).join("|");
}

function asSubject(candidate: WhoAmICandidate): WhoAmISubject {
  const { id, name, kind, eraBand, rescueGroup } = candidate;
  return {
    id,
    name,
    kind,
    ...(eraBand ? { eraBand } : {}),
    ...(rescueGroup ? { rescueGroup } : {}),
  };
}

function assertSequence(candidate: WhoAmICandidate, sequence: readonly WhoAmIClue[]) {
  expect(sequence, `${candidate.id} should always assemble 10 clues`).toHaveLength(WHO_AM_I_CLUE_LIMIT);
  expect(sequence.every((clue) => candidate.clues.includes(clue))).toBe(true);
  expect(new Set(sequence.map((clue) => clue.conceptId ?? clue.id)).size).toBe(sequence.length);
  expect(new Set(sequence.map((clue) => normalize(clue.text))).size).toBe(sequence.length);

  for (let index = 1; index < sequence.length; index += 1) {
    expect(BAND_RANK[sequence[index]!.band]).toBeGreaterThanOrEqual(BAND_RANK[sequence[index - 1]!.band]);
  }

  for (const clue of sequence.filter((entry) => entry.identityKnowledge)) {
    expect(clue.knowledgeSubjectId).toBe(candidate.id);
    expect(clue.sourceFactId?.trim().length).toBeGreaterThan(0);
    expect(normalize(clue.text)).not.toContain(normalize(candidate.name));
  }
}

describe("Who Am I mature whole-game simulation", () => {
  it("stress-tests clue progression, replay quality, and recovery disguises across the full launch populations", () => {
    const universes = [
      ["UFC", getUfcWhoAmIUniverse()],
      ["NFL", getFootballWhoAmIUniverse("NFL")],
      ["CFB", getFootballWhoAmIUniverse("CFB")],
    ] as const;

    const allFindings: Array<Record<string, unknown>> = [];

    for (const [league, universe] of universes) {
      const subjects = universe.candidates.map(asSubject);
      const findings = universe.candidates.map((candidate) => {
        const sequences = Array.from({ length: 16 }, (_value, index) => (
          whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1))
        ));

        for (const sequence of sequences) {
          assertSequence(candidate, sequence);
          const relationshipClues = sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships");
          expect(
            relationshipClues.length,
            `${candidate.id} should not spend multiple round slots on the same relationship/family facet`,
          ).toBeLessThanOrEqual(1);

          const chronologyClues = sequence.filter((clue) => whoAmIClueFacet(clue) === "era");
          expect(
            chronologyClues.length,
            `${candidate.id} should use at most one career chronology clue per round`,
          ).toBeLessThanOrEqual(1);

          const selectionClasses = sequence.map(whoAmIClueSelectionClass);
          expect(
            selectionClasses.filter((selectionClass) => selectionClass === "sports-identity").length,
            `${candidate.id} should keep the round centered on sports identity`,
          ).toBeGreaterThanOrEqual(7);
          expect(
            selectionClasses.filter((selectionClass) => selectionClass === "deep-biography").length,
            `${candidate.id} should use at most one deep-biography clue`,
          ).toBeLessThanOrEqual(1);

          const lastName = normalize(candidate.name).split(" ").at(-1) ?? "";
          for (const clue of sequence) {
            expect(clue.text).not.toMatch(/\bthe this (?:player|fighter|head coach)\b/i);
            expect(clue.text).not.toMatch(/\bthis (?:player|fighter|head coach) this (?:player|fighter|head coach)\b/i);
            if (clue.identityKnowledge) {
              expect(clue.text).not.toMatch(/^This (?:player|fighter|head coach)\b/i);
              expect(
                clue.text.trim().split(/\s+/).length,
                `${candidate.id} selected identity clue is too long for mobile game copy: ${clue.text}`,
              ).toBeLessThanOrEqual(36);
              if (whoAmIClueFacet(clue) === "relationships" && lastName.length >= 4) {
                expect(
                  normalize(clue.text).split(" "),
                  `${candidate.id} relationship clue leaks the hidden surname: ${clue.text}`,
                ).not.toContain(lastName);
              }
            }
          }

          const nonProductionGiveaways = sequence.filter((clue) => (
            clue.band === "giveaway" && whoAmIClueFacet(clue) !== "production"
          ));
          if (nonProductionGiveaways.length) {
            expect(
              whoAmIClueFacet(sequence.at(-1)!),
              `${candidate.id} should finish on its strongest identity anchor instead of a raw stat`,
            ).not.toBe("production");
          }
        }

        const distinctSequences = new Set(sequences.map(sequenceKey)).size;
        const distinctFacetCounts = sequences.map((sequence) => new Set(
          sequence.map((clue) => whoAmIClueFacet(clue)),
        ).size);
        const identityCounts = sequences.map((sequence) => sequence.filter((clue) => clue.identityKnowledge).length);
        const sportsIdentityCounts = sequences.map((sequence) => (
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length
        ));
        const deepBiographyCounts = sequences.map((sequence) => (
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography").length
        ));
        const giveawayCounts = sequences.map((sequence) => sequence.filter((clue) => clue.band === "giveaway").length);
        const lateStrengthCounts = sequences.map((sequence) => (
          sequence.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length
        ));
        const maxFacetConcentrations = sequences.map((sequence) => {
          const counts = new Map<string, number>();
          for (const clue of sequence) {
            const facet = whoAmIClueFacet(clue);
            counts.set(facet, (counts.get(facet) ?? 0) + 1);
          }
          return Math.max(...counts.values());
        });

        const weakestFinishSequence = [...sequences].sort((left, right) => (
          left.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length
          - right.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length
        ))[0]!;

        const round: WhoAmIRound = {
          sport: universe.sport,
          league: universe.league,
          subjects,
          hiddenSubject: asSubject(candidate),
          clues: sequences[0]!,
        };

        const sameGroupDistractors = subjects.filter((subject) => (
          subject.id !== candidate.id
          && subject.kind === candidate.kind
          && subject.eraBand === candidate.eraBand
          && subject.rescueGroup === candidate.rescueGroup
        ));
        const rejected = new Set(sameGroupDistractors.slice(0, 2).map((subject) => subject.id));
        const rescueBoards = Array.from({ length: 6 }, (_value, index) => (
          whoAmIRescueChoices(round, seededRandom(index + 101), rejected)
        ));

        for (const board of rescueBoards) {
          expect(board, `${candidate.id} recovery board should have four choices`).toHaveLength(WHO_AM_I_RESCUE_OPTION_COUNT);
          expect(new Set(board.map((subject) => subject.id)).size).toBe(board.length);
          expect(board.some((subject) => subject.id === candidate.id)).toBe(true);
          expect(board.some((subject) => rejected.has(subject.id))).toBe(false);
        }

        const remainingSameGroupCount = sameGroupDistractors.length - rejected.size;
        const sameGroupBoardCounts = rescueBoards.map((board) => board.filter((subject) => (
          subject.id === candidate.id || subject.rescueGroup === candidate.rescueGroup
        )).length);

        if (candidate.rescueGroup && remainingSameGroupCount >= WHO_AM_I_RESCUE_OPTION_COUNT - 1) {
          expect(Math.min(...sameGroupBoardCounts), `${candidate.id} should use same-group disguises when enough remain`)
            .toBe(WHO_AM_I_RESCUE_OPTION_COUNT);
        }

        return {
          league,
          id: candidate.id,
          name: candidate.name,
          candidateClues: candidate.clues.length,
          distinctSequences,
          minDistinctFacets: Math.min(...distinctFacetCounts),
          minIdentityClues: Math.min(...identityCounts),
          minSportsIdentityClues: Math.min(...sportsIdentityCounts),
          maxDeepBiographyClues: Math.max(...deepBiographyCounts),
          minGiveawayClues: Math.min(...giveawayCounts),
          minLateStrongOrGiveaway: Math.min(...lateStrengthCounts),
          maxFacetConcentration: Math.max(...maxFacetConcentrations),
          sameGroupDistractors: sameGroupDistractors.length,
          minSameGroupBoardChoices: Math.min(...sameGroupBoardCounts),
          weakestFinishSequence: weakestFinishSequence.map((clue) => ({
            id: clue.id,
            band: clue.band,
            facet: whoAmIClueFacet(clue),
            text: clue.text,
          })),
        };
      });

      allFindings.push(...findings);

      const byWeakestDiversity = [...findings].sort((left, right) => (
        left.minDistinctFacets - right.minDistinctFacets
        || right.maxFacetConcentration - left.maxFacetConcentration
        || left.distinctSequences - right.distinctSequences
        || left.id.localeCompare(right.id)
      ));
      const byWeakestReplay = [...findings].sort((left, right) => (
        left.distinctSequences - right.distinctSequences
        || left.candidateClues - right.candidateClues
        || left.id.localeCompare(right.id)
      ));
      const byWeakestFinish = [...findings].sort((left, right) => (
        left.minLateStrongOrGiveaway - right.minLateStrongOrGiveaway
        || left.minGiveawayClues - right.minGiveawayClues
        || left.id.localeCompare(right.id)
      ));

      const underFourFacets = findings.filter((finding) => finding.minDistinctFacets < 4);
      const weakLateFinish = findings.filter((finding) => finding.minLateStrongOrGiveaway < 3);
      const deepReplayGaps = findings.filter((finding) => (
        finding.candidateClues > 12 && finding.distinctSequences === 1
      ));
      const sportsIdentityGaps = findings.filter((finding) => finding.minSportsIdentityClues < 7);
      const biographyHeavyRounds = findings.filter((finding) => finding.maxDeepBiographyClues > 1);

      expect(underFourFacets, `${league} should preserve at least four clue facets in every simulated sequence`).toEqual([]);
      expect(sportsIdentityGaps, `${league} rounds should normally keep at least seven sports-identity clues`).toEqual([]);
      expect(biographyHeavyRounds, `${league} rounds should never be dominated by deep biography`).toEqual([]);
      expect(weakLateFinish, `${league} should finish with at least three strong/giveaway clues in the final four`).toEqual([]);
      expect(deepReplayGaps, `${league} candidates deeper than the 12-clue floor should vary across replay seeds`).toEqual([]);

      console.info(
        `Who Am I Slice 13 simulation ${league}`,
        JSON.stringify({
          population: findings.length,
          zeroReplayVariation: findings.filter((finding) => finding.distinctSequences === 1).length,
          underFourFacets: underFourFacets.length,
          zeroIdentitySelected: findings.filter((finding) => finding.minIdentityClues === 0).length,
          sportsIdentityBelowSeven: findings.filter((finding) => finding.minSportsIdentityClues < 7).length,
          deepBiographyAboveOne: findings.filter((finding) => finding.maxDeepBiographyClues > 1).length,
          noGiveawaySelected: findings.filter((finding) => finding.minGiveawayClues === 0).length,
          weakLateFinish: weakLateFinish.length,
          facetConcentrationAboveThree: findings.filter((finding) => finding.maxFacetConcentration > 3).length,
          weakestDiversity: byWeakestDiversity.slice(0, 12),
          weakestReplay: byWeakestReplay.slice(0, 12),
          weakestFinish: byWeakestFinish.slice(0, 12),
          replayGapClues: byWeakestReplay
            .filter((finding) => finding.distinctSequences === 1)
            .map((finding) => ({
              id: finding.id,
              name: finding.name,
              clues: universe.candidates.find((candidate) => candidate.id === finding.id)?.clues.map((clue) => ({
                id: clue.id,
                band: clue.band,
                facet: whoAmIClueFacet(clue),
                revealPriority: clue.revealPriority ?? null,
                identityKnowledge: Boolean(clue.identityKnowledge),
                conceptId: clue.conceptId ?? null,
                text: clue.text,
              })),
            })),
          lateFinishGapClues: byWeakestFinish
            .filter((finding) => finding.minLateStrongOrGiveaway < 2)
            .slice(0, 12)
            .map((finding) => ({
              id: finding.id,
              name: finding.name,
              selected: whoAmIProgressiveClues(
                universe.candidates.find((candidate) => candidate.id === finding.id)!.clues,
                seededRandom(1),
              ).map((clue) => ({ id: clue.id, band: clue.band, facet: whoAmIClueFacet(clue), text: clue.text })),
            })),
        }),
      );
    }

    expect(allFindings).toHaveLength(500);
    expect(allFindings.filter((finding) => Number(finding.candidateClues) < WHO_AM_I_CLUE_LIMIT)).toEqual([]);
  }, 60_000);
});
