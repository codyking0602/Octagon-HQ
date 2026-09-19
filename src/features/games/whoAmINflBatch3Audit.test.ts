import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";
import { NFL_WHO_AM_I_BATCH_3_SUBJECT_IDS } from "./footballWhoAmICuration";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";
import { whoAmISemanticClueKey, whoAmISemanticSetKey } from "./whoAmISemanticQuality";
import { whoAmIQualityCompatibleReplayTargets } from "./whoAmIRevealPlanner";

const ACTIVE_2026_IDS = new Set([
  "nfl-trent-williams",
  "nfl-calais-campbell",
  "nfl-cameron-heyward",
  "nfl-danielle-hunter",
  "nfl-cameron-jordan",
]);

const PARTIAL_CAREER_COVERAGE_IDS = new Set([
  "bruce-smith",
  "nfl-bryant-young",
  "nfl-charles-haley",
  "nfl-chris-doleman",
  "nfl-cortez-kennedy",
  "nfl-ray-lewis",
]);

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

describe("NFL Who Am I batch 3 calibration", () => {
  it("locks launch-order subjects 101-150 to the curated batch", () => {
    const ids = getFootballWhoAmILaunchPool("NFL").subjects.slice(100, 150).map((subject) => subject.id);
    expect(ids).toEqual(NFL_WHO_AM_I_BATCH_3_SUBJECT_IDS);
  });

  it("keeps known source-window repairs and identity bindings out of playable clues", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));

    const bryantYoung = candidates.get("nfl-bryant-young")!;
    const haley = candidates.get("nfl-charles-haley")!;
    const doleman = candidates.get("nfl-chris-doleman")!;
    const kennedy = candidates.get("nfl-cortez-kennedy")!;
    const rayLewis = candidates.get("nfl-ray-lewis")!;
    const hutchinson = candidates.get("nfl-steve-hutchinson")!;
    const camJordan = candidates.get("nfl-cameron-jordan")!;

    expect(bryantYoung.clues.map((clue) => clue.text).join(" | ")).not.toContain("My NFL career began in 1999");
    expect(haley.clues.map((clue) => clue.text).join(" | ")).not.toContain("7 career games");
    expect(doleman.clues.map((clue) => clue.text).join(" | ")).not.toContain("13 career games");
    expect(kennedy.clues.map((clue) => clue.text).join(" | ")).not.toContain("32 career games");
    expect(rayLewis.clues.map((clue) => clue.text).join(" | ")).toContain("all 17 of my NFL seasons");
    expect(rayLewis.clues.map((clue) => clue.text).join(" | ")).not.toContain("My NFL career began in 1999");
    expect(hutchinson.clues.map((clue) => clue.text).join(" | ")).not.toContain("first-team All-Pro honors six times");
    expect(camJordan.clues.map((clue) => clue.text).join(" | ")).not.toContain("I played LB.");
    expect(camJordan.clues.map((clue) => clue.text).join(" | ")).toContain("defensive end and edge rusher");
    expect(camJordan.clues.map((clue) => clue.text).join(" | ")).toContain("16th Saints season in 2026");
  });

  it("keeps active 2026 identities current without frozen career totals", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));

    expect(candidates.get("nfl-trent-williams")!.clues.map((clue) => clue.text).join(" | ")).toContain("49ers' starting left tackle");
    expect(candidates.get("nfl-calais-campbell")!.clues.map((clue) => clue.text).join(" | ")).toContain("returned to Baltimore for the 2026 season");
    expect(candidates.get("nfl-cameron-heyward")!.clues.map((clue) => clue.text).join(" | ")).toContain("Steelers defensive lineman in 2026");
    expect(candidates.get("nfl-danielle-hunter")!.clues.map((clue) => clue.text).join(" | ")).toContain("Houston defensive end in 2026");
  });

  it("prints compact replay diagnostics for the full batch before enforcing hard gates", () => {
    const universe = getFootballWhoAmIUniverse("NFL");
    const candidates = new Map(universe.candidates.map((candidate) => [candidate.id, candidate]));
    const report = NFL_WHO_AM_I_BATCH_3_SUBJECT_IDS.map((subjectId) => {
      const candidate = candidates.get(subjectId)!;
      const sequences = Array.from({ length: 64 }, (_value, index) => (
        whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1))
      ));
      const first = new Set(sequences[0]!.map(whoAmISemanticClueKey));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map(whoAmISemanticClueKey)));
      return {
        id: subjectId,
        pool: candidate.clues.length,
        surfaced: surfaced.size,
        boards: new Set(sequences.map(whoAmISemanticSetKey)).size,
        rotated: Math.max(...sequences.map((sequence) => sequence.filter((clue) => !first.has(whoAmISemanticClueKey(clue))).length)),
        minSports: Math.min(...sequences.map((sequence) => (
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length
        ))),
        maxDeep: Math.max(...sequences.map((sequence) => (
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography").length
        ))),
        maxColor: Math.max(...sequences.map((sequence) => (
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length
        ))),
        maxRelationships: Math.max(...sequences.map((sequence) => (
          sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length
        ))),
        minFinalStrong: Math.min(...sequences.map((sequence) => (
          sequence.slice(-2).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length
        ))),
      };
    });
    console.info("NFL WHO AM I BATCH 3 PREFLIGHT", JSON.stringify(report));
  }, 150_000);

  it("keeps every batch-three pool sports-first, replayable, and free of biography filler", () => {
    const universe = getFootballWhoAmIUniverse("NFL");
    const candidates = new Map(universe.candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of NFL_WHO_AM_I_BATCH_3_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId);
      expect(candidate, subjectId).toBeDefined();
      expect(candidate!.clues.length, `${subjectId} playable pool`).toBeGreaterThanOrEqual(12);
      expect(candidate!.clues.length, `${subjectId} playable pool`).toBeLessThanOrEqual(16);
      expect(
        candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"),
        `${subjectId} deep biography`,
      ).toHaveLength(0);
      expect(
        candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length,
        `${subjectId} color clues`,
      ).toBeLessThanOrEqual(1);
      expect(
        candidate!.clues.some((clue) => clue.id === "player-career-start" || clue.id === "player-career-end"),
        `${subjectId} useless career chronology`,
      ).toBe(false);
      expect(
        candidate!.clues.some((clue) => (
          clue.id === "fact:nfl-career-games"
          || clue.id === "fact:nfl-career-targets"
          || clue.conceptId === "identity:career-games"
        )),
        `${subjectId} generic volume filler`,
      ).toBe(false);

      if (ACTIVE_2026_IDS.has(subjectId) || PARTIAL_CAREER_COVERAGE_IDS.has(subjectId)) {
        expect(
          candidate!.clues.some((clue) => /^fact:nfl-career-/.test(clue.id)),
          `${subjectId} stale or partial career totals`,
        ).toBe(false);
        expect(
          candidate!.clues.some((clue) => clue.id === "career-span"),
          `${subjectId} stale or partial career span`,
        ).toBe(false);
      }

      const sequences = Array.from({ length: 64 }, (_value, index) => (
        whoAmIProgressiveClues(candidate!.clues, seededRandom(index + 1))
      ));
      const first = new Set(sequences[0]!.map(whoAmISemanticClueKey));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map(whoAmISemanticClueKey)));
      const boards = new Set(sequences.map(whoAmISemanticSetKey));
      const maxRotated = Math.max(...sequences.map((sequence) => (
        sequence.filter((clue) => !first.has(whoAmISemanticClueKey(clue))).length
      )));

      for (const sequence of sequences) {
        expect(sequence, `${subjectId} clue count`).toHaveLength(WHO_AM_I_CLUE_LIMIT);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length,
          `${subjectId} sports identity`,
        ).toBeGreaterThanOrEqual(9);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"),
          `${subjectId} deep biography in run`,
        ).toHaveLength(0);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length,
          `${subjectId} color in run`,
        ).toBeLessThanOrEqual(1);
        expect(
          sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length,
          `${subjectId} relationship slots`,
        ).toBeLessThanOrEqual(1);
        expect(
          sequence.slice(-2).every((clue) => clue.band === "strong" || clue.band === "giveaway"),
          `${subjectId} strongest finish`,
        ).toBe(true);
      }

      const semanticTargets = whoAmIQualityCompatibleReplayTargets(candidate!.clues, sequences);
      expect(surfaced.size, `${subjectId} surfaced replay depth`).toBeGreaterThanOrEqual(semanticTargets.surfaced);
      expect(maxRotated, `${subjectId} rotating slots`).toBeGreaterThanOrEqual(semanticTargets.rotated);
      expect(boards.size, `${subjectId} distinct boards`).toBeGreaterThanOrEqual(semanticTargets.boards);
    }
  }, 150_000);
});
