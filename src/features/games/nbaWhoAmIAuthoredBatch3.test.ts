import { describe, expect, it } from "vitest";
import { nbaWhoAmIAuthoredBatch3 } from "./nbaWhoAmIAuthoredBatch3";
import { nbaWhoAmIAuthoredIdentities } from "./nbaWhoAmIAuthoredScripts";

const ROSTER = [
  "Allen Iverson", "Vince Carter", "Tracy McGrady", "Steve Nash",
  "Jason Kidd", "Steve Francis", "Grant Hill", "Penny Hardaway",
  "Chris Webber", "Chris Mullin", "Reggie Miller", "Shawn Kemp",
  "Gary Payton", "Patrick Ewing", "David Robinson", "Hakeem Olajuwon",
  "Charles Barkley", "Karl Malone", "John Stockton", "Scottie Pippen",
  "Dennis Rodman", "Clyde Drexler", "Dominique Wilkins", "Dikembe Mutombo",
  "Alonzo Mourning", "Larry Johnson", "Glen Rice", "Tim Hardaway",
  "Michael Finley", "Antoine Walker", "Richard Hamilton", "Chauncey Billups",
  "Ben Wallace", "Rasheed Wallace", "Baron Davis", "Peja Stojaković",
  "Jermaine O’Neal", "Shawn Marion", "Yao Ming", "Tony Allen",
  "Hedo Türkoğlu", "Andrei Kirilenko", "Elton Brand", "Carlos Boozer",
  "Lamar Odom", "Metta World Peace", "Jerry Stackhouse", "Mike Bibby",
] as const;

const BANDS = [
  "broad", "broad", "helpful", "helpful", "helpful",
  "strong", "strong", "strong", "giveaway", "giveaway",
] as const;

// Match ASCII and curly apostrophes without treating differently spelled names as new subjects.
const fold = (value: string) => value.normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const EARLY_TEAM_LOCATION_SCHOOL = /\b(?:Chicago|Bulls|Lakers|Boston|Celtics|Rockets|Houston|Denver|Nuggets|Toronto|Raptors|Warriors|Golden State|Heat|Miami|Magic|Orlando|Utah|Jazz|Seattle|SuperSonics|Dallas|Mavericks|Phoenix|Suns|Indiana|Pacers|New York|Knicks|Philadelphia|76ers|San Antonio|Spurs|Detroit|Pistons|Sacramento|Kings|Charlotte|Hornets|Grizzlies|Memphis|Minnesota|Timberwolves|Portland|Trail Blazers|Cleveland|Cavaliers|Atlanta|Hawks|Washington|Wizards|Vancouver|Clippers|New Jersey|Nets|Brooklyn|Duke|Georgetown|UCLA|UNLV|Gonzaga|Auburn|Kentucky|Michigan|Arizona|Connecticut|Wisconsin|Oklahoma State|Santa Clara|St\. John's|Virginia Union|Central Arkansas|Naval Academy|Memphis State|Louisiana Tech)\b/i;
const EARLY_HARD_ANCHOR = /\b(?:point guard|shooting guard|power forward|small forward|center|No\.\s*\d+|first overall|second overall|third overall|fourth overall|fifth overall|sixth overall|seventh overall|eleventh overall|fourteenth overall|seventeenth overall|twenty-first overall|twenty-fourth overall|The Answer|Vinsanity|Air Canada|T-Mac|Stevie Franchise|Grandmama|The Glove|Mailman|The Worm|The Admiral|Dream Shake|Big Ben|AK-47|the Matrix|Grindfather|Miller Time|Run TMC|Boom Dizzle|The Human Highlight Film|Round Mound of Rebound)\b/i;
const EARLY_DATED_MILESTONE = /\\b(?:19|20)\\d{2}\\b/;
const EARLY_ONE_OFF_RECORD = /\b(?:only player|only person|first player ever|unanimous MVP|all-time (?:leader|record)|record holder|the first in history)\b/i;
const STRONG_FINAL_ANCHOR = /\b(?:Bulls|Lakers|Rockets|Nets|76ers|Magic|Raptors|Toronto|Golden State|Knicks|Warriors|SuperSonics|Jazz|Spurs|Heat|Kings|Pacers|Mavericks|Suns|Pistons|Hornets|Grizzlies|Clippers|Trail Blazers|Celtics|Hawks|Georgetown|Duke|Kentucky|Auburn|Arizona|Michigan|Houston|Dallas|Miami|Orlando|Detroit|Chicago|Philadelphia|San Antonio|Sacramento|Memphis|Phoenix|Utah|Denver|No\.\s*\d+|nickname|called|known as|nicknamed|The Answer|T-Mac|AK-47|Grandmama|Dream Shake|Mailman|Grindfather|Big Ben|Miller Time|The Admiral|the Glove|the Worm|Reign Man)\b/i;

describe("NBA Who Am I historical/modern-era batch 3", () => {
  it("owns exactly its exclusive 48-player roster, with no calibration or alias duplicate", () => {
    expect(nbaWhoAmIAuthoredBatch3).toHaveLength(48);
    expect(nbaWhoAmIAuthoredBatch3.map(p => p.name)).toEqual([...ROSTER]);
    const ids = nbaWhoAmIAuthoredBatch3.map(p => p.subjectId);
    expect(new Set(ids).size).toBe(48);
    expect(new Set(nbaWhoAmIAuthoredBatch3.map(p => fold(p.name))).size).toBe(48);
    expect(ids.every(id => /^nba:[a-z0-9-]+$/.test(id))).toBe(true);
    expect(ids.some(id => id === "nba:jermaine-o-neal")).toBe(true);
    expect(ids.some(id => id === "nba:metta-world-peace")).toBe(true);
    expect(ids.some(id => id === "nba:tim-hardaway")).toBe(true);
    expect(ids).not.toContain("nba:tim-hardaway-jr");
    expect(ids).not.toContain("nba:ron-artest");
    for (const calibration of nbaWhoAmIAuthoredIdentities) expect(ids).not.toContain(calibration.subjectId);
  });

  it("authors 96 independent ten-clue scripts with 960 unique verified clue IDs", () => {
    const ids = new Set<string>();
    const textAcrossBank = new Set<string>();
    for (const player of nbaWhoAmIAuthoredBatch3) {
      expect(player.eraBand).toBe("legacy");
      expect(player.earlyRotation).toBe("normal");
      expect(["guard", "wing", "big"]).toContain(player.rescueGroup);
      expect(Object.keys(player.scripts).sort()).toEqual(["A", "B"]);
      expect(player.sources.career).toMatch(/^https:\/\/www\.basketball-reference\.com\/players\/[a-z]\/[a-z0-9]+\.html$/);
      for (const id of ["A", "B"] as const) {
        const script = player.scripts[id];
        expect(script.id).toBe(id);
        expect(script.clues.map(c => c.band)).toEqual([...BANDS]);
        expect(script.clues).toHaveLength(10);
        expect(new Set(script.clues.map(c => fold(c.text))).size).toBe(10);
        for (const clue of script.clues) {
          expect(clue.id).toMatch(new RegExp(`^nba-[a-z0-9-]+-${id.toLowerCase()}-(?:[1-9]|10)$`));
          expect(ids.has(clue.id)).toBe(false);
          ids.add(clue.id);
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          for (const sourceId of clue.sourceIds) {
            expect(Object.prototype.hasOwnProperty.call(player.sources, sourceId)).toBe(true);
            expect(player.sources[sourceId]).toMatch(/^https:\/\//);
          }
          expect(clue.text).toMatch(/^(?:I|My)\b/);
          expect(fold(clue.text)).not.toContain(fold(player.name));
          expect(textAcrossBank.has(fold(clue.text))).toBe(false);
          textAcrossBank.add(fold(clue.text));
        }
      }
    }
    expect(ids.size).toBe(960);
    expect(textAcrossBank.size).toBe(960);
  });

  it("holds franchise, school, nationality, position, jersey and signature anchors until later rounds", () => {
    for (const player of nbaWhoAmIAuthoredBatch3) {
      for (const id of ["A", "B"] as const) {
        const script = player.scripts[id];
        for (const clue of script.clues.slice(0, 4)) {
          expect(EARLY_TEAM_LOCATION_SCHOOL.test(clue.text), `${player.name} ${id}: ${clue.text}`).toBe(false);
          expect(EARLY_DATED_MILESTONE.test(clue.text), `${player.name} ${id}: early dated anchor: ${clue.text}`).toBe(false);
          expect(EARLY_HARD_ANCHOR.test(clue.text), `${player.name} ${id}: ${clue.text}`).toBe(false);
          expect(/\b(?:Chinese|Nigerian|Serbian|Russian|Turkish|Canadian|French|Lithuanian)\b/i.test(clue.text), `${player.name} ${id}: ${clue.text}`).toBe(false);
        }
        for (const clue of script.clues.slice(0, 2)) {
          expect(EARLY_ONE_OFF_RECORD.test(clue.text)).toBe(false);
        }
        expect(script.clues.slice(8).some(c => STRONG_FINAL_ANCHOR.test(c.text)),
          `${player.name} ${id} needs a recognizably personal late anchor`).toBe(true);
      }
    }
  });

  it("keeps A and B different on both early clues and giveaway anchors", () => {
    for (const p of nbaWhoAmIAuthoredBatch3) {
      const a = p.scripts.A.clues.map(c => fold(c.text));
      const b = p.scripts.B.clues.map(c => fold(c.text));
      expect(a.filter(text => b.includes(text))).toEqual([]);
      expect(a.slice(0, 5)).not.toEqual(b.slice(0, 5));
      expect(a.slice(8)).not.toEqual(b.slice(8));
    }
  });
});
