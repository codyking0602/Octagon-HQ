import { describe, expect, it } from "vitest";
import { getUfcFactualSubject } from "../back-room/ufcFactualLedger";
import {
  getUfcWhoAmIAuthoredIdentity,
  ufcWhoAmIAuthoredIdentities,
} from "./ufcWhoAmIAuthoredScripts";

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

describe("UFC Who Am I authored calibration scripts", () => {
  it("starts with four fully authored calibration identities", () => {
    expect(ufcWhoAmIAuthoredIdentities).toHaveLength(4);
  });

  it("binds every authored fighter to one canonical UFC subject", () => {
    const ids = ufcWhoAmIAuthoredIdentities.map((identity) => identity.subjectId);
    expect(new Set(ids).size).toBe(ids.length);

    for (const identity of ufcWhoAmIAuthoredIdentities) {
      const canonical = getUfcFactualSubject(identity.subjectId);
      expect(canonical?.id).toBe(identity.subjectId);
      expect(canonical?.name).toBe(identity.name);
      expect(getUfcWhoAmIAuthoredIdentity(identity.subjectId)).toBe(identity);
    }
  });

  it("locks A and B to ten verified source-backed clues with the approved progression", () => {
    const clueIds = new Set<string>();

    for (const identity of ufcWhoAmIAuthoredIdentities) {
      expect(Object.keys(identity.scripts).sort()).toEqual(["A", "B"]);
      expect(identity.earlyRotation).toBe("normal");

      for (const scriptId of ["A", "B"] as const) {
        const script = identity.scripts[scriptId]!;
        expect(script.id).toBe(scriptId);
        expect(script.clues).toHaveLength(10);
        expect(script.clues.map((clue) => clue.band)).toEqual(EXPECTED_BANDS);
        expect(new Set(script.clues.map((clue) => clue.text)).size).toBe(10);

        for (const clue of script.clues) {
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          for (const sourceId of clue.sourceIds) {
            expect(identity.sources[sourceId]).toMatch(/^https:\/\//);
          }
          expect(clue.text.toLowerCase()).not.toContain(identity.name.toLowerCase());
          expect(clueIds.has(clue.id)).toBe(false);
          clueIds.add(clue.id);
        }
      }

      const overlap = identity.scripts.A!.clues.filter((left) =>
        identity.scripts.B!.clues.some((right) => right.text === left.text)
      );
      expect(overlap).toHaveLength(0);
    }
  });

  it("keeps the calibration bank UFC-career-forward rather than generic-count-forward", () => {
    const bannedGenericPatterns = [
      /primary UFC division/i,
      /UFC fights\.?$/i,
      /UFC wins\.?$/i,
      /wins by KO or TKO/i,
      /submission wins/i,
      /title fights\.?$/i,
      /career crossed .* decades/i,
    ];

    for (const identity of ufcWhoAmIAuthoredIdentities) {
      for (const scriptId of ["A", "B"] as const) {
        for (const clue of identity.scripts[scriptId]!.clues) {
          expect(bannedGenericPatterns.some((pattern) => pattern.test(clue.text))).toBe(false);
        }
      }
    }
  });
});
