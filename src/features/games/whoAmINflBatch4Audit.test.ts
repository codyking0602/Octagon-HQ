import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";
import { NFL_WHO_AM_I_BATCH_4_SUBJECT_IDS } from "./footballWhoAmICuration";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";

const ACTIVE_2026_IDS = new Set(["andy-reid"]);

const PARTIAL_CAREER_COVERAGE_IDS = new Set([
  "derrick-brooks",
  "nfl-derrick-thomas",
  "nfl-charles-woodson",
  "nfl-aeneas-williams",
  "brian-dawkins",
  "nfl-darren-sharper",
  "nfl-darrell-green",
  "nfl-eric-allen",
]);

const COACH_IDS = new Set(NFL_WHO_AM_I_BATCH_4_SUBJECT_IDS.slice(30));

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

describe("NFL Who Am I batch 4 calibration", () => {
  it("locks launch-order subjects 151-200 to the curated batch", () => {
    const ids = getFootballWhoAmILaunchPool("NFL").subjects.slice(150, 200).map((subject) => subject.id);
    expect(ids).toEqual(NFL_WHO_AM_I_BATCH_4_SUBJECT_IDS);
  });

  it("repairs known partial source windows instead of presenting partial totals as careers", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of PARTIAL_CAREER_COVERAGE_IDS) {
      const candidate = candidates.get(subjectId)!;
      expect(
        candidate.clues.some((clue) => /^fact:nfl-career-/.test(clue.id)),
        `${subjectId} partial career fact`,
      ).toBe(false);
    }

    expect(candidates.get("nfl-derrick-thomas")!.clues.map((clue) => clue.text).join(" | ")).toContain("126.5 sacks");
    expect(candidates.get("nfl-derrick-thomas")!.clues.map((clue) => clue.text).join(" | ")).not.toContain("16 career games");
    expect(candidates.get("nfl-darrell-green")!.clues.map((clue) => clue.text).join(" | ")).toContain("54 career interceptions");
    expect(candidates.get("nfl-darrell-green")!.clues.map((clue) => clue.text).join(" | ")).not.toContain("56 career games");
    expect(candidates.get("nfl-eric-allen")!.clues.map((clue) => clue.text).join(" | ")).toContain("54 career interceptions");
    expect(candidates.get("nfl-eric-allen")!.clues.map((clue) => clue.text).join(" | ")).not.toContain("48 career games");
    expect(candidates.get("nfl-aeneas-williams")!.clues.map((clue) => clue.text).join(" | ")).toContain("10 seasons with the Cardinals");
  });

  it("repairs incomplete coach windows and keeps current 2026 coach identity current", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of COACH_IDS) {
      const candidate = candidates.get(subjectId)!;
      expect(
        candidate.clues.some((clue) => /^fact:nfl-coach-/.test(clue.id)),
        `${subjectId} partial coach metric`,
      ).toBe(false);
    }

    const andyReid = candidates.get("andy-reid")!;
    expect(andyReid.clues.map((clue) => clue.text).join(" | ")).toContain("2026 season as Kansas City's head coach");
    expect(andyReid.clues.map((clue) => clue.text).join(" | ")).not.toContain("most recently reached 2025");

    const peteCarroll = candidates.get("pete-carroll")!;
    expect(peteCarroll.clues.map((clue) => clue.text).join(" | ")).toContain("Las Vegas Raiders' head coach in 2025");

    expect(candidates.get("bill-belichick")!.clues.map((clue) => clue.text).join(" | ")).toContain("Cleveland and New England");
    expect(candidates.get("bill-parcells")!.clues.map((clue) => clue.text).join(" | ")).toContain("Giants, Patriots, Jets and Cowboys");
    expect(candidates.get("nfl-jimmy-johnson-coach")!.clues.map((clue) => clue.text).join(" | ")).toContain("Dallas head coach in 1989");
    expect(candidates.get("joe-gibbs")!.clues.map((clue) => clue.text).join(" | ")).toContain("2004 through 2007");
    expect(candidates.get("bill-cowher")!.clues.map((clue) => clue.text).join(" | ")).toContain("1992 through 2006");
    expect(candidates.get("dick-vermeil")!.clues.map((clue) => clue.text).join(" | ")).toContain("Philadelphia, the St. Louis Rams and Kansas City");
  });

  it("keeps curated clue wording from leaking the subject name", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of NFL_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId)!;
      for (const clue of candidate.clues) {
        expect(clue.text.toLowerCase(), `${subjectId} answer leak: ${clue.id}`).not.toContain(candidate.name.toLowerCase());
      }
    }

    expect(candidates.get("nfl-darrelle-revis")!.clues.map((clue) => clue.text).join(" | ")).not.toMatch(/Revis Island/i);
    expect(candidates.get("joe-gibbs")!.clues.map((clue) => clue.text).join(" | ")).not.toMatch(/Joe Gibbs Racing/i);
    expect(candidates.get("nfl-don-coryell")!.clues.map((clue) => clue.text).join(" | ")).not.toMatch(/Air Coryell/i);
  });

  it("prints compact replay diagnostics for all 50 subjects before enforcing hard gates", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));
    const report = NFL_WHO_AM_I_BATCH_4_SUBJECT_IDS.map((subjectId) => {
      const candidate = candidates.get(subjectId)!;
      const sequences = Array.from({ length: 64 }, (_value, index) => (
        whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1))
      ));
      const first = new Set(sequences[0]!.map((clue) => clue.id));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map((clue) => clue.id)));
      return {
        id: subjectId,
        pool: candidate.clues.length,
        surfaced: surfaced.size,
        boards: new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|"))).size,
        rotated: Math.max(...sequences.map((sequence) => sequence.filter((clue) => !first.has(clue.id)).length)),
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
    console.info("NFL WHO AM I BATCH 4 PREFLIGHT", JSON.stringify(report));
  }, 150_000);

  it("keeps every batch-four pool sports-first, replayable, and free of biography filler", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of NFL_WHO_AM_I_BATCH_4_SUBJECT_IDS) {
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
        candidate!.clues.some((clue) => (
          clue.id === "player-career-start"
          || clue.id === "player-career-end"
          || clue.id === "coach-start"
          || clue.id === "coach-end"
          || clue.id === "career-span"
          || clue.id === "coach-affiliation-count"
        )),
        `${subjectId} useless chronology`,
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
    }
  }, 150_000);
});
