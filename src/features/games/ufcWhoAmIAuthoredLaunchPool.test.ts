import { describe, expect, it } from "vitest";
import { getUfcFactualSubject } from "../back-room/ufcFactualLedger";
import { ufcWhoAmIAuthoredLaunchPool } from "./ufcWhoAmIAuthoredLaunchPool";

const EXPECTED_BANDS = [
  "broad",
  "broad",
  "helpful",
  "helpful",
  "helpful",
  "strong",
  "strong",
  "strong",
  "giveaway",
  "giveaway",
] as const;

const GENERIC_PATTERNS = [
  /primary UFC division/i,
  /UFC fights\.?$/i,
  /UFC wins\.?$/i,
  /wins by KO or TKO/i,
  /submission wins/i,
  /title fights\.?$/i,
  /career crossed .* decades/i,
];

const BRITTLE_PATTERNS = [
  /my final fight/i,
  /my most recent fight/i,
  /i currently hold/i,
  /i am currently/i,
  /my current streak/i,
  /still the record/i,
];

describe("UFC Who Am I authored launch pool", () => {
  it("launches with twelve canonical fighters and 240 authored clues", () => {
    expect(ufcWhoAmIAuthoredLaunchPool).toHaveLength(12);
    expect(new Set(ufcWhoAmIAuthoredLaunchPool.map((identity) => identity.subjectId)).size).toBe(12);

    let clueCount = 0;
    for (const identity of ufcWhoAmIAuthoredLaunchPool) {
      const canonical = getUfcFactualSubject(identity.subjectId);
      expect(canonical?.name).toBe(identity.name);
      expect(Object.keys(identity.scripts).sort()).toEqual(["A", "B"]);
      clueCount += identity.scripts.A!.clues.length + identity.scripts.B!.clues.length;
    }
    expect(clueCount).toBe(240);
  });

  it("keeps every launch script source-backed, distinct and progression-safe", () => {
    const globalClueIds = new Set<string>();

    for (const identity of ufcWhoAmIAuthoredLaunchPool) {
      for (const scriptId of ["A", "B"] as const) {
        const script = identity.scripts[scriptId]!;
        expect(script.clues).toHaveLength(10);
        expect(script.clues.map((clue) => clue.band)).toEqual(EXPECTED_BANDS);
        expect(new Set(script.clues.map((clue) => clue.text)).toHaveLength(10);

        for (const clue of script.clues) {
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          for (const sourceId of clue.sourceIds) {
            expect(identity.sources[sourceId]).toMatch(/^https:\/\//);
          }
          expect(clue.text.toLowerCase()).not.toContain(identity.name.toLowerCase());
          expect(GENERIC_PATTERNS.some((pattern) => pattern.test(clue.text))).toBe(false);
          expect(BRITTLE_PATTERNS.some((pattern) => pattern.test(clue.text))).toBe(false);
          expect(globalClueIds.has(clue.id)).toBe(false);
          globalClueIds.add(clue.id);
        }
      }

      const exactOverlap = identity.scripts.A!.clues.filter((left) =>
        identity.scripts.B!.clues.some((right) => right.text === left.text)
      );
      expect(exactOverlap).toHaveLength(0);
    }
  });

  it("is large enough to serve two fighters per Daily with the six-appearance cooldown", () => {
    expect(ufcWhoAmIAuthoredLaunchPool.length).toBeGreaterThan(6 + 2);
  });
});
