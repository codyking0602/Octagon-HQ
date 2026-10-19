import { describe, expect, it } from "vitest";
import { nbaWhoAmIAuthoredIdentities } from "./nbaWhoAmIAuthoredScripts";
import { buildNbaWhoAmIAuthoredRound, resolveNbaWhoAmIAuthoredSharedRound } from "../play/nbaWhoAmIAuthoredRound";
import { whoAmIRescueChoices } from "./whoAmIEngine";
import { canPreviewNbaWhoAmI } from "../nba/NbaWhoAmIOwnerGate";
import { whoAmIChallengePath, whoAmIChallengeGameVersion, whoAmIChallengeSetup, storedWhoAmIChallengeRound } from "../play/whoAmIChallenge";


const BANDS = ["broad", "broad", "helpful", "helpful", "helpful", "strong", "strong", "strong", "giveaway", "giveaway"];

describe("NBA Who Am I authored A/B scripts", () => {
  it("contains eight real calibration subjects with two ten-clue scripts each", () => {
    expect(nbaWhoAmIAuthoredIdentities).toHaveLength(200);
    const names = new Set<string>();
    const clues = new Set<string>();
    for (const player of nbaWhoAmIAuthoredIdentities.slice(0, 8)) {
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
  it("preserves Football/UFC progressive identity reveal rules for both NBA scripts", () => {
    const EARLY_FRANCHISE_OR_LOCATION = /\b(?:Denver|Nuggets|Cleveland|Cavaliers|Miami|Heat|Lakers|Golden State|Warriors|Bulls|Chicago|Milwaukee|Bucks|San Antonio|Spurs|Orlando|Magic|Washington|Toronto|Raptors|Utah|Jazz|Phoenix|Suns|Davidson|Wake Forest|LSU|North Carolina|Akron|Serbia|Serbian|Greece|Greek)\b/i;
    const EARLY_SIGNATURE = /\b(?:Air Jordan|The Admiral|Black Mamba|Greek Freak|The Joker|His Airness|Big Fundamental|Shaq|Diesel|No\. ?\d+|Kareem Abdul-Jabbar|David Robinson|Dwyane Wade|Chris Bosh|Scottie Pippen|Kevin Durant|Phil Jackson|Kobe Bryant|Shaquille O'Neal)\b/i;
    const EARLY_POSITION = /\b(?:center|point guard|shooting guard|power forward|small forward|frontcourt|big man)\b/i;
    const EARLY_MILESTONES = /\b(?:\d{4}|\d{2} points|\d{2} wins|first overall|forty-first|fifteenth overall|selected \d+|NBA Draft)\b/i;
    for (const player of nbaWhoAmIAuthoredIdentities.slice(0, 8)) {
      for (const scriptId of ["A", "B"] as const) {
        const script = player.scripts[scriptId];
        expect(script.clues.slice(0, 4).every(clue =>
          !EARLY_FRANCHISE_OR_LOCATION.test(clue.text) &&
          !EARLY_SIGNATURE.test(clue.text) &&
          !EARLY_POSITION.test(clue.text) &&
          !EARLY_MILESTONES.test(clue.text)
        ), `${player.name} script ${scriptId} leaks a hard identity anchor within the first four clues`).toBe(true);
        expect(script.clues.slice(0, 2).every(clue =>
          !/\b(?:only|first ever|first player|first unanimous|record-holder|all-time|career leader|three-time MVP)\b/i.test(clue.text)
        ), `${player.name} script ${scriptId} leads with an ultra-specific record`).toBe(true);
        expect(script.clues.slice(8).some(clue =>
          /\b(?:Denver|Nuggets|Cleveland|Miami|Lakers|Golden State|Warriors|Bulls|Chicago|Milwaukee|Bucks|San Antonio|Spurs|Greek|Serbian|Shaq|Air Jordan|Black Mamba|Big Fundamental|Joker|No\. ?\d+)\b/i.test(clue.text)
        ), `${player.name} script ${scriptId} must finish with a recognizable identity anchor`).toBe(true);
        const early = script.clues.slice(0, 4).map(clue => clue.text.toLowerCase());
        expect(new Set(early).size).toBe(4);
      }
      const a = player.scripts.A.clues.map(clue => clue.text);
      const b: string[] = player.scripts.B.clues.map(clue => clue.text);
      expect(a.filter(text => b.includes(text))).toHaveLength(0);
    }
  });

});
