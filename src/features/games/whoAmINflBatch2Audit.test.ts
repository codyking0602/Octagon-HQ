import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";
import { NFL_WHO_AM_I_BATCH_2_SUBJECT_IDS } from "./footballWhoAmICuration";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";

const ACTIVE_OR_UNSETTLED_2026_IDS = new Set([
  "nfl-alvin-kamara",
  "nfl-ashton-jeanty",
  "nfl-bijan-robinson",
  "nfl-christian-mccaffrey",
  "nfl-a-j-brown",
  "nfl-davante-adams",
  "nfl-deandre-hopkins",
  "nfl-travis-kelce",
  "zach-ertz",
]);

const PARTIAL_CAREER_COVERAGE_IDS = new Set([
  "nfl-andre-reed",
  "nfl-cris-carter",
  "nfl-kellen-winslow",
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

describe("NFL Who Am I batch 2 calibration", () => {
  it("locks launch-order subjects 51-100 to the curated batch", () => {
    const ids = getFootballWhoAmILaunchPool("NFL").subjects.slice(50, 100).map((subject) => subject.id);
    expect(ids).toEqual(NFL_WHO_AM_I_BATCH_2_SUBJECT_IDS);
  });

  it("keeps Kellen Winslow Sr. isolated from the same-name Winslow II source collision", () => {
    const candidate = getFootballWhoAmIUniverse("NFL").candidates.find((entry) => entry.id === "nfl-kellen-winslow");
    expect(candidate).toBeDefined();
    const text = candidate!.clues.map((clue) => clue.text).join(" | ");
    expect(text).toContain("1979 through 1987");
    expect(text).toContain("Epic in Miami");
    expect(text).toContain("6,741 yards");
    expect(text).not.toContain("2004");
    expect(text).not.toContain("2013");
    expect(text).not.toContain("469 career receptions");
    expect(text).not.toContain("5,236 career receiving yards");
    expect(text).not.toContain("25 career receiving");
  });

  it("keeps every batch-two pool sports-first, replayable, and free of biography filler", () => {
    const universe = getFootballWhoAmIUniverse("NFL");
    const candidates = new Map(universe.candidates.map((candidate) => [candidate.id, candidate]));
    const report: Array<Record<string, unknown>> = [];

    for (const subjectId of NFL_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
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
        `${subjectId} coverage-window chronology`,
      ).toBe(false);
      expect(
        candidate!.clues.some((clue) => clue.id === "fact:nfl-career-games" || clue.id === "fact:nfl-career-targets"),
        `${subjectId} generic volume filler`,
      ).toBe(false);
      if (ACTIVE_OR_UNSETTLED_2026_IDS.has(subjectId) || PARTIAL_CAREER_COVERAGE_IDS.has(subjectId)) {
        expect(
          candidate!.clues.some((clue) => /^fact:nfl-career-/.test(clue.id)),
          `${subjectId} stale or partial career totals`,
        ).toBe(false);
      }

      const sequences = Array.from({ length: 64 }, (_value, index) => (
        whoAmIProgressiveClues(candidate!.clues, seededRandom(index + 1))
      ));
      const first = new Set(sequences[0]!.map((clue) => clue.id));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map((clue) => clue.id)));
      const boards = new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|")));
      const maxRotated = Math.max(...sequences.map((sequence) => (
        sequence.filter((clue) => !first.has(clue.id)).length
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

      expect(surfaced.size, `${subjectId} surfaced replay depth`).toBeGreaterThanOrEqual(12);
      expect(maxRotated, `${subjectId} rotating slots`).toBeGreaterThanOrEqual(2);
      expect(boards.size, `${subjectId} distinct boards`).toBeGreaterThanOrEqual(2);

      report.push({
        id: subjectId,
        pool: candidate!.clues.length,
        surfaced: surfaced.size,
        boards: boards.size,
        rotated: maxRotated,
        minSports: Math.min(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length)),
        maxColor: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length)),
      });
    }

    console.info("NFL WHO AM I BATCH 2 CALIBRATION", JSON.stringify(report));
  }, 150_000);
});
