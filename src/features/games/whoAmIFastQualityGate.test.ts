import { describe, expect, it } from "vitest";
import { getFootballSubject } from "../back-room/footballSubjectRegistry";
import { getFootballWhoAmIUniverse, getUfcWhoAmIUniverse } from "./whoAmIAuthority";
import {
  footballWhoAmIApplicableMetricFacts,
  footballWhoAmIMetricFactIsPlayable,
} from "./footballWhoAmIAuthority";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";
import {
  whoAmIClueEditorialIssues,
  whoAmICluesShareInformation,
  whoAmISemanticIndependentCapacity,
  whoAmISemanticSetKey,
} from "./whoAmISemanticQuality";
import { whoAmIQualityCompatibleReplayTargets } from "./whoAmIRevealPlanner";
import {
  whoAmIRevealArchitectureCanOrder,
  whoAmIRevealArchitectureSatisfied,
} from "./whoAmIRevealArchitecture";

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

const DEFAULT_TARGETS = [
  "Derwin James",
  "Bruce Smith",
  "Barry Switzer",
  "Tyrann Mathieu",
  "Aaron Donald",
];

const requestedTargets = (process.env.WHO_AM_I_AUDIT_SUBJECTS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const targets = requestedTargets.length ? requestedTargets : DEFAULT_TARGETS;
const requestedLeagues = new Set(
  (process.env.WHO_AM_I_AUDIT_LEAGUES ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean),
);

describe("Who Am I fast full-population editorial gate", () => {
  const universes = [
    getUfcWhoAmIUniverse(),
    getFootballWhoAmIUniverse("NFL"),
    getFootballWhoAmIUniverse("CFB"),
  ].filter((universe) => requestedLeagues.size === 0 || requestedLeagues.has(universe.league));

  const allCandidates = universes.flatMap((universe) => (
    universe.candidates.map((candidate) => ({ universe, candidate }))
  ));
  const selected = targets.includes("all")
    ? allCandidates
    : allCandidates.filter(({ candidate }) => (
      targets.includes(candidate.id) || targets.includes(candidate.name)
    ));

  it("matches at least one requested subject", () => {
    expect(selected.length, `No Who Am I subjects matched: ${targets.join(", ")}`).toBeGreaterThan(0);
  });

  it("never makes cfbfastR projected CFB production playable", () => {
    const cfbUniverse = getFootballWhoAmIUniverse("CFB");
    const violations = cfbUniverse.candidates.flatMap((candidate) => {
      const subject = getFootballSubject(candidate.id);
      if (!subject) return [`${candidate.id}:missing-subject`];

      return footballWhoAmIApplicableMetricFacts(subject)
        .filter(({ fact }) => (
          (fact.metricId.startsWith("cfb-career-") || fact.metricId.startsWith("cfb-best-season-"))
          && fact.evidence.sourceIds.includes("cfbfast-r-factual-universe")
          && footballWhoAmIMetricFactIsPlayable(subject, fact)
        ))
        .map(({ fact }) => `${candidate.id}:${fact.metricId}:${fact.value}`);
    });

    expect(violations).toEqual([]);
  });

  it("uses an explicitly season-owned Caleb Williams peak anchor", () => {
    const cfbUniverse = getFootballWhoAmIUniverse("CFB");
    const caleb = cfbUniverse.candidates.find((candidate) => candidate.id === "cfb-caleb-williams");
    expect(caleb).toBeDefined();
    const text = caleb!.clues.map((clue) => clue.text).join(" | ");
    expect(text).toContain("In 2022 I set USC single-season records with 4,537 passing yards and 42 touchdown passes.");
    expect(text).not.toContain("27 passing touchdowns");
    expect(text).not.toContain("617 rushing yards");
    expect(text).not.toContain("single-season high");

    const genericPeakMetricClues = cfbUniverse.candidates.flatMap((candidate) => (
      candidate.clues
        .filter((clue) => clue.id.startsWith("fact:cfb-best-season-"))
        .map((clue) => `${candidate.id}:${clue.id}:${clue.text}`)
    ));
    expect(genericPeakMetricClues).toEqual([]);
  });

  // Keep each subject isolated as its own test case. The assertions and all-subject
  // coverage are unchanged, while Vitest can release per-subject assertion state
  // instead of retaining one monolithic 500-subject test until the job timeout.
  for (const { universe, candidate } of selected) {
    it(`${universe.league} :: ${candidate.id}`, () => {
      const semanticCapacity = whoAmISemanticIndependentCapacity(candidate.clues, 13);
      const sequences = Array.from({ length: 8 }, (_value, index) => (
        whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1))
      ));
      const replayTargets = whoAmIQualityCompatibleReplayTargets(candidate.clues, sequences);

      for (const sequence of sequences) {
        expect(sequence, `${candidate.id} must still produce a complete board`).toHaveLength(WHO_AM_I_CLUE_LIMIT);

        for (const clue of sequence) {
          expect(
            whoAmIClueEditorialIssues(clue, universe.league),
            `${candidate.id} selected invalid clue: ${clue.text}`,
          ).toEqual([]);
        }

        if (semanticCapacity >= WHO_AM_I_CLUE_LIMIT) {
          for (let left = 0; left < sequence.length; left += 1) {
            for (let right = left + 1; right < sequence.length; right += 1) {
              expect(
                whoAmICluesShareInformation(sequence[left]!, sequence[right]!),
                `${candidate.id} repeats information despite having enough independent clue lanes: "${sequence[left]!.text}" / "${sequence[right]!.text}"`,
              ).toBe(false);
            }
          }
        }

        expect(
          sequence.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length,
          `${candidate.id} needs a strong finish`,
        ).toBeGreaterThanOrEqual(3);

        if (whoAmIRevealArchitectureCanOrder(sequence)) {
          expect(
            whoAmIRevealArchitectureSatisfied(sequence),
            `${candidate.id} must use the standardized reveal order when its selected board supports it`,
          ).toBe(true);
        }
      }

      if (replayTargets.boards > 1) {
        expect(
          new Set(sequences.map(whoAmISemanticSetKey)).size,
          `${candidate.id} replay must rotate actual information, not alternate wording or order`,
        ).toBeGreaterThan(1);
      }
    }, 10_000);
  }
});
