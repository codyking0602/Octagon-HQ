import { describe, expect, it } from "vitest";
import { nbaWhoAmIAuthoredIdentities } from "./nbaWhoAmIAuthoredScripts";
import { buildNbaWhoAmIAuthoredRound, resolveNbaWhoAmIAuthoredSharedRound } from "../play/nbaWhoAmIAuthoredRound";
import { whoAmIRescueChoices } from "./whoAmIEngine";
import { canPreviewNbaWhoAmI } from "../nba/NbaWhoAmIOwnerGate";
import { whoAmIChallengePath, whoAmIChallengeGameVersion, whoAmIChallengeSetup, storedWhoAmIChallengeRound } from "../play/whoAmIChallenge";


const BANDS = ["broad", "broad", "helpful", "helpful", "helpful", "strong", "strong", "strong", "giveaway", "giveaway"];

describe("NBA Who Am I authored A/B scripts", () => {
  it("contains eight real calibration subjects with two ten-clue scripts each", () => {
    expect(nbaWhoAmIAuthoredIdentities).toHaveLength(8);
    const names = new Set<string>();
    const clues = new Set<string>();
    for (const player of nbaWhoAmIAuthoredIdentities) {
      expect(names.has(player.name)).toBe(false);
      names.add(player.name);
      expect(Object.keys(player.scripts).sort()).toEqual(["A", "B"]);
      for (const id of ["A", "B"] as const) {
        const script = player.scripts[id];
        expect(script.id).toBe(id);
        expect(script.clues.map(clue => clue.band)).toEqual(BANDS);
        for (const clue of script.clues) {
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          expect(clue.text.toLowerCase()).not.toContain(player.name.toLowerCase());
          for (const key of clue.sourceIds) expect(Object.prototype.hasOwnProperty.call(player.sources, key)).toBe(true);
          expect(clues.has(clue.id)).toBe(false);
          clues.add(clue.id);
        }
      }
      const round = buildNbaWhoAmIAuthoredRound({ subjectId: player.subjectId, scriptId: "A" });
      expect(round.sport).toBe("nba");
      expect(round.league).toBe("NBA");
      expect(round.clues).toHaveLength(10);
      const rescue = whoAmIRescueChoices(round, () => .5);
      expect(rescue).toHaveLength(5);
      expect(new Set(rescue.map(s => s.id)).size).toBe(5);
      expect(rescue.some(s => s.id === player.subjectId)).toBe(true);
      expect(storedWhoAmIChallengeRound(whoAmIChallengeSetup(round), "nba")).toEqual(round);
      expect(resolveNbaWhoAmIAuthoredSharedRound(player.subjectId, round.clues.map(clue => clue.id))?.clues).toEqual(round.clues);
    }
  });

  it("preserves basketball challenge and strict owner preview routing", () => {
    expect(whoAmIChallengePath("nba")).toBe("/nba/who-am-i");
    expect(whoAmIChallengeGameVersion("nba")).toBe("nba-who-am-i-v1");
    expect(canPreviewNbaWhoAmI({ displayName: "Cody", canControlPicks: true })).toBe(true);
    expect(canPreviewNbaWhoAmI({ displayName: "Guest", canControlPicks: true })).toBe(false);
    expect(canPreviewNbaWhoAmI({ displayName: "Cody", canControlPicks: false })).toBe(false);
  });
});
