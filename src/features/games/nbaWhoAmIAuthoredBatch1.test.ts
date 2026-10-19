import { describe, expect, it } from "vitest";
import { nbaWhoAmIAuthoredBatch1 } from "./nbaWhoAmIAuthoredBatch1";
import { nbaWhoAmIAuthoredIdentities } from "./nbaWhoAmIAuthoredScripts";

const EXPECTED_NAMES = [
  "Luka Dončić", "Shai Gilgeous-Alexander", "Jayson Tatum", "Jaylen Brown",
  "Joel Embiid", "Anthony Edwards", "Victor Wembanyama", "Tyrese Haliburton",
  "Devin Booker", "Donovan Mitchell", "Jalen Brunson", "Karl-Anthony Towns",
  "Anthony Davis", "Damian Lillard", "Jimmy Butler", "Kyrie Irving",
  "Kevin Durant", "James Harden", "Kawhi Leonard", "Paul George",
  "Russell Westbrook", "Chris Paul", "Draymond Green", "Klay Thompson",
  "Bam Adebayo", "Pascal Siakam", "Trae Young", "Ja Morant",
  "Zion Williamson", "LaMelo Ball", "De’Aaron Fox", "Domantas Sabonis",
  "DeMar DeRozan", "Zach LaVine", "Brandon Ingram", "Rudy Gobert",
  "Jrue Holiday", "Khris Middleton", "Bradley Beal", "Mikal Bridges",
  "Jaren Jackson Jr.", "Chet Holmgren", "Paolo Banchero", "Franz Wagner",
  "Evan Mobley", "Cade Cunningham", "Jalen Williams", "Alperen Şengün",
] as const;

const BANDS = [
  "broad", "broad", "helpful", "helpful", "helpful",
  "strong", "strong", "strong", "giveaway", "giveaway",
] as const;

// Early-stage identity coordinates must be earned, not volunteered.
const EARLY_REVEAL = /\b(?:Lakers|Clippers|Warriors|Celtics|Bucks|Heat|Hawks|Knicks|Thunder|Rockets|Raptors|Magic|Grizzlies|Kings|Suns|Spurs|Jazz|Nuggets|76ers|Sixers|Pacers|Cavaliers|Mavericks|Timberwolves|Pelicans|Pistons|Hornets|Bulls|Nets|Blazers|Dallas|Chicago|Miami|Orlando|Philadelphia|San Antonio|New York|Oklahoma City|Toronto|Memphis|Houston|Milwaukee|Phoenix|Minnesota|Denver|Sacramento|Utah|Brooklyn|Portland|Cleveland|Boston|Indiana|Atlanta|Charlotte|Detroit|Duke|Kentucky|Gonzaga|UCLA|USC|Michigan State|Santa Clara|Weber State|Oklahoma State|Villanova|France|French|Germany|German|Turkey|Turkish|Canada|Canadian|Cameroon|Slovenia|Slovenian|Lithuania|Lithuanian|Serbia|Serbian|Spain|Spanish|first overall|second overall|third overall|point guard|shooting guard|small forward|power forward|center|NBA Draft|No\.\s*\d+|number\s*\d+|Rookie of the Year|Defensive Player of the Year|Most Improved Player)\b/i;
const TOO_UNIQUE_TOO_EARLY = /\b(?:only player|only rookie|first ever|first unanimous|all-time|career record|league record|NBA record|first in history|the first player|three-time MVP|four-time MVP)\b/i;
const IDENTITY_ENDING = /\b(?:No\.\s*\d+|drafted|selected|played at|Mavericks|Thunder|Celtics|Sixers|76ers|Spurs|Pacers|Suns|Cavaliers|Knicks|Timberwolves|Pelicans|Lakers|Clippers|Warriors|Rockets|Heat|Bucks|Hawks|Grizzlies|Kings|Bulls|Magic|Hornets|Pistons|Raptors|Jazz|Trail Blazers|Portland|Indiana|Houston|Dallas|Cleveland|Minnesota|Chicago|Orlando|Boston|Philadelphia|Golden State|Toronto|Memphis|New York|Oklahoma City|Sacramento|Miami|Charlotte|Detroit|Phoenix|Gonzaga|Duke|Kentucky|USC|Villanova|UCLA|Santa Clara|nickname|known as|nicknamed|called|widely known|also called|the Brow|Splash Brother|Point God|Luka Magic|Dame Time|The Klaw|The Process|the Stifle Tower|the Beard|Spida|PG-13|Brodie|Wemby|SGA|KAT|CP3|AD|JJJ|J-Dub)\b/i;

describe("NBA Who Am I — isolated modern batch 1", () => {
  it("owns exactly the assigned 48 unique identities and none of the existing eight", () => {
    expect(nbaWhoAmIAuthoredBatch1).toHaveLength(48);
    expect(nbaWhoAmIAuthoredBatch1.map(p => p.name)).toEqual([...EXPECTED_NAMES]);
    const names = nbaWhoAmIAuthoredBatch1.map(p => p.name);
    const ids = nbaWhoAmIAuthoredBatch1.map(p => p.subjectId);
    expect(new Set(names).size).toBe(48);
    expect(new Set(ids).size).toBe(48);
    for (const player of nbaWhoAmIAuthoredBatch1) {
      expect(player.subjectId).toMatch(/^nba:[a-z0-9-]+$/);
      expect(player.eraBand).toBe("modern");
      expect(player.earlyRotation).toBe("normal");
      expect(["guard", "wing", "big"]).toContain(player.rescueGroup);
      expect(nbaWhoAmIAuthoredIdentities.some(existing => existing.subjectId === player.subjectId || existing.name === player.name)).toBe(false);
    }
  });

  it("ships 960 unique source-bound first-person clues in the exact reveal ladder", () => {
    const allClueIds = new Set<string>();
    const allTexts: string[] = [];
    for (const player of nbaWhoAmIAuthoredBatch1) {
      expect(Object.keys(player.scripts).sort()).toEqual(["A", "B"]);
      expect(Object.keys(player.sources).length).toBeGreaterThanOrEqual(2);
      for (const url of Object.values(player.sources)) {
        expect(url).toMatch(/^https:\/\/www\.nba\.com\/player\/\d+(?:\/bio)?$/);
      }

      for (const scriptId of ["A", "B"] as const) {
        const script = player.scripts[scriptId];
        expect(script.id).toBe(scriptId);
        expect(script.clues).toHaveLength(10);
        expect(script.clues.map(clue => clue.band)).toEqual(BANDS);
        expect(new Set(script.clues.map(clue => clue.text)).size).toBe(10);
        for (const clue of script.clues) {
          expect(clue.id).toMatch(new RegExp(`-${scriptId.toLowerCase()}-\\d+$`));
          expect(allClueIds.has(clue.id)).toBe(false);
          allClueIds.add(clue.id);
          allTexts.push(clue.text);
          expect(clue.text).toMatch(/^(?:I|My)\b/);
          expect(clue.text).not.toMatch(/\b(?:his|her)\b/i);
          expect(clue.text.toLocaleLowerCase()).not.toContain(player.name.toLocaleLowerCase());
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          for (const sourceId of clue.sourceIds) {
            expect(Object.prototype.hasOwnProperty.call(player.sources, sourceId)).toBe(true);
            expect(player.sources[sourceId]).toMatch(/^https:\/\//);
          }
        }
      }
    }
    expect(allClueIds.size).toBe(960);
    expect(allTexts.length).toBe(960);
  });

  it("protects the first four clues from premature identity coordinates", () => {
    for (const player of nbaWhoAmIAuthoredBatch1) {
      for (const scriptId of ["A", "B"] as const) {
        const early = player.scripts[scriptId].clues.slice(0, 4);
        for (const clue of early) {
          expect(clue.text, `${player.name} ${scriptId} ${clue.id}: early team/school/nationality/position/draft giveaway`).not.toMatch(EARLY_REVEAL);
          expect(clue.text, `${player.name} ${scriptId} ${clue.id}: early singular record giveaway`).not.toMatch(TOO_UNIQUE_TOO_EARLY);
          expect(clue.text).not.toMatch(/\b(?:19|20)\d{2}\b/);
        }
        expect(new Set(early.map(clue => clue.text)).size).toBe(4);
      }
    }
  });

  it("makes scripts genuinely distinct and closes each with identity-bearing anchors", () => {
    for (const player of nbaWhoAmIAuthoredBatch1) {
      const a = player.scripts.A.clues.map(clue => clue.text);
      const b = player.scripts.B.clues.map(clue => clue.text);
      expect(a.filter(text => b.includes(text)), player.name).toEqual([]);
      expect(a.slice(0, 5)).not.toEqual(b.slice(0, 5));
      expect(a.slice(8)).not.toEqual(b.slice(8));
      expect(player.scripts.A.clues.slice(8).some(clue => IDENTITY_ENDING.test(clue.text)), `${player.name} A needs a specific ending`).toBe(true);
      expect(player.scripts.B.clues.slice(8).some(clue => IDENTITY_ENDING.test(clue.text)), `${player.name} B needs a specific ending`).toBe(true);
    }
  });
});
