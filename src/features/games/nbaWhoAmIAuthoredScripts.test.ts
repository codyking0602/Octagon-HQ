import { describe, expect, it } from "vitest";
import { nbaWhoAmIAuthoredIdentities } from "./nbaWhoAmIAuthoredScripts";
import { buildNbaWhoAmIAuthoredRound, nbaWhoAmIAuthoredSelectionForClues } from "../play/nbaWhoAmIAuthoredRound";
import { createNbaWhoAmIAuthoredCasualRound } from "../play/nbaWhoAmIAuthoredCasual";
import { whoAmIRescueChoices } from "./whoAmIEngine";
import { canAccessNbaWhoAmIPreview } from "../nba/NbaWhoAmIPreviewGate";

const BANDS = ["broad", "broad", "helpful", "helpful", "helpful", "strong", "strong", "strong", "giveaway", "giveaway"];

describe("NBA Who Am I authored parity (owner-only calibration)", () => {
  it("locks two independent, source-backed ten-clue scripts per subject", () => {
    expect(nbaWhoAmIAuthoredIdentities).toHaveLength(6);
    const subjectIds = new Set<string>();
    const clueIds = new Set<string>();
    for (const identity of nbaWhoAmIAuthoredIdentities) {
      expect(subjectIds.has(identity.subjectId)).toBe(false);
      subjectIds.add(identity.subjectId);
      expect(identity.subjectId).toMatch(/^nba:[a-z0-9-]+$/);
      expect(Object.keys(identity.scripts).sort()).toEqual(["A", "B"]);
      const texts = new Set<string>();
      for (const scriptId of ["A", "B"] as const) {
        const script = identity.scripts[scriptId];
        expect(script.id).toBe(scriptId);
        expect(script.clues).toHaveLength(10);
        expect(script.clues.map((clue) => clue.band)).toEqual(BANDS);
        for (const clue of script.clues) {
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          for (const sourceId of clue.sourceIds) expect(identity.sources[sourceId]).toMatch(/^https:\/\/www\.nba\.com\//);
          expect(clue.text.toLowerCase()).not.toContain(identity.name.toLowerCase());
          expect(texts.has(clue.text)).toBe(false);
          expect(clueIds.has(clue.id)).toBe(false);
          texts.add(clue.text);
          clueIds.add(clue.id);
        }
        const round = buildNbaWhoAmIAuthoredRound({ subjectId: identity.subjectId, scriptId });
        expect(round.league).toBe("NBA");
        expect(round.sport).toBe("nba");
        expect(round.clues.map((clue) => clue.text)).toEqual(script.clues.map((clue) => clue.text));
        expect(nbaWhoAmIAuthoredSelectionForClues(identity.subjectId, round.clues.map((clue) => clue.id))?.scriptId).toBe(scriptId);
        expect(whoAmIRescueChoices(round, () => 0.5)).toHaveLength(5);
      }
    }
  });

  it("respects exclusions and chooses from the identical shared-game format", () => {
    const excluded = new Set(nbaWhoAmIAuthoredIdentities.slice(0, 5).map((identity) => identity.subjectId));
    const round = createNbaWhoAmIAuthoredCasualRound(() => 0.5, excluded);
    expect(round.hiddenSubject.id).toBe(nbaWhoAmIAuthoredIdentities[5]!.subjectId);
    expect(round.clues).toHaveLength(10);
    expect(round.subjects).toHaveLength(6);
  });

  it("is restricted to Cody's owner profile, not public NBA users", () => {
    expect(canAccessNbaWhoAmIPreview({ canControlPicks: true, displayName: "Cody" })).toBe(true);
    expect(canAccessNbaWhoAmIPreview({ canControlPicks: false, displayName: "Cody" })).toBe(false);
    expect(canAccessNbaWhoAmIPreview({ canControlPicks: true, displayName: "Other" })).toBe(false);
    expect(canAccessNbaWhoAmIPreview(null)).toBe(false);
  });
});
