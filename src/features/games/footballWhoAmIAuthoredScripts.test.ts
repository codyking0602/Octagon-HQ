import { describe, expect, it } from "vitest";
import {
  footballWhoAmIAuthoredIdentities,
  getFootballWhoAmIAuthoredIdentity,
} from "./footballWhoAmIAuthoredScripts";

const REVIEWED_IDENTITIES = new Set([
  "NFL:Patrick Mahomes",
  "NFL:Josh Allen",
  "NFL:Lamar Jackson",
  "NFL:Joe Burrow",
  "CFB:Tim Tebow",
  "CFB:Cam Newton",
  "NFL:Derrick Henry",
  "NFL:Justin Jefferson",
  "NFL:Myles Garrett",
  "CFB:Trevor Lawrence",
  "CFB:Jalen Hurts",
  "NFL:Andy Reid",
  "CFB:Nick Saban",
]);

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

describe("Football Who Am I authored scripts", () => {
  it("tracks the authored migration with 66 completed identities", () => {
    expect(footballWhoAmIAuthoredIdentities).toHaveLength(66);
  });

  it("keeps league/name and canonical stage ownership unique", () => {
    const keys = footballWhoAmIAuthoredIdentities.map((identity) => `${identity.league}:${identity.name}`);
    const subjectKeys = footballWhoAmIAuthoredIdentities.map((identity) => `${identity.league}:${identity.subjectId}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(subjectKeys).size).toBe(subjectKeys.length);
    for (const identity of footballWhoAmIAuthoredIdentities) {
      expect(identity.subjectId).toMatch(/^[a-z0-9-]+$/);
      expect(getFootballWhoAmIAuthoredIdentity(identity.league, identity.name)).toBe(identity);
    }
  });

  it("locks two verified ten-clue scripts per identity", () => {
    const clueIds = new Set<string>();

    for (const identity of footballWhoAmIAuthoredIdentities) {
      expect(Object.keys(identity.scripts).sort()).toEqual(["A", "B"]);
      expect(identity.stageFocus).toBe(identity.league === "NFL" ? "NFL-career-forward" : "CFB-career-forward");

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
            const sourceUrl = identity.sources[sourceId];
            expect(sourceUrl).toMatch(/^https:\/\//);
          }
          expect(clue.text.toLowerCase()).not.toContain(identity.name.toLowerCase());
          expect(clueIds.has(clue.id)).toBe(false);
          clueIds.add(clue.id);
        }
      }

      const exactOverlap = identity.scripts.A!.clues.filter((left) =>
        identity.scripts.B!.clues.some((right) => right.text === left.text)
      );
      expect(exactOverlap).toHaveLength(0);
    }
  });

  it("deprioritizes only identities whose clue ladders were exposed during owner review", () => {
    for (const identity of footballWhoAmIAuthoredIdentities) {
      const key = `${identity.league}:${identity.name}`;
      expect(identity.earlyRotation).toBe(REVIEWED_IDENTITIES.has(key) ? "deprioritized" : "normal");
    }
    expect([...REVIEWED_IDENTITIES]).toHaveLength(13);
  });
});
