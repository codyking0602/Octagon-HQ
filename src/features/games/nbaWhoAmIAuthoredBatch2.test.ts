import { describe, expect, it } from "vitest";
import { nbaWhoAmIAuthoredBatch2 } from "./nbaWhoAmIAuthoredBatch2";
import { nbaWhoAmIAuthoredIdentities } from "./nbaWhoAmIAuthoredScripts";

const ROSTER = [
  "Carmelo Anthony", "Blake Griffin", "Dwight Howard", "Derrick Rose", "Rajon Rondo", "Tony Parker",
  "Manu Ginóbili", "Pau Gasol", "Marc Gasol", "Kevin Love", "LaMarcus Aldridge", "John Wall",
  "Gilbert Arenas", "Andre Iguodala", "David Lee", "Joakim Noah", "Brook Lopez", "Al Horford",
  "Isaiah Thomas", "Kyle Lowry", "Mike Conley", "Goran Dragić", "Kemba Walker", "Victor Oladipo",
  "Gordon Hayward", "Paul Millsap", "Serge Ibaka", "Zach Randolph", "Amar’e Stoudemire",
  "Chris Bosh", "Dwyane Wade", "Dirk Nowitzki", "Paul Pierce", "Kevin Garnett", "Ray Allen",
  "Joe Johnson", "Andre Drummond", "DeAndre Jordan", "Andrew Bogut", "Tyson Chandler",
  "Luol Deng", "Rudy Gay", "Michael Redd", "Brandon Roy", "Andrew Bynum", "O.J. Mayo",
  "Monta Ellis", "Jason Terry",
] as const;
const BANDS = ["broad", "broad", "helpful", "helpful", "helpful", "strong", "strong", "strong", "giveaway", "giveaway"];
const earlyFranchise = /\b(?:Atlanta|Hawks|Boston|Celtics|Brooklyn|Nets|Charlotte|Hornets|Chicago|Bulls|Cleveland|Cavaliers|Dallas|Mavericks|Denver|Nuggets|Detroit|Pistons|Golden State|Warriors|Houston|Rockets|Indiana|Pacers|Los Angeles|Lakers|Clippers|Memphis|Grizzlies|Miami|Heat|Milwaukee|Bucks|Minnesota|Timberwolves|New Orleans|Pelicans|New York|Knicks|Oklahoma City|Thunder|Orlando|Magic|Philadelphia|76ers|Phoenix|Suns|Portland|Trail Blazers|Sacramento|Kings|San Antonio|Spurs|Toronto|Raptors|Utah|Jazz|Washington|Wizards)\b/i;
const earlyIdentity = /\b(?:No\.\s*\d+|jersey number|[12][09]\d{2}|first overall|second overall|third overall|fourth overall|fifth overall|selected \d+|drafted \d+|Olympic gold|NCAA championship|NCAA title|Stanford|Florida|Duke|Kentucky|Syracuse|UConn|Connecticut|Marquette|UCLA|Ohio State|Butler|Arizona|USC|Texas A&M|Louisiana Tech|Indiana University|Kansas|Memphis Tigers|Michigan State|The Jet|The Truth|Agent Zero|Lob City|Grit and Grind|Splash Mountain|D-Wade|Melo|The Dragon|The Big Ticket)\b/i;
const unacceptable = /\? No;|(?:I|my) (?:currently|recently)|\b(?:his|her|hers)\b/i;

describe("NBA Who Am I — isolated Batch 2 authored identities", () => {
  it("has exactly the assigned 48 names and excludes the eight live calibration subjects", () => {
    expect(nbaWhoAmIAuthoredBatch2).toHaveLength(48);
    expect(nbaWhoAmIAuthoredBatch2.map(p => p.name).sort()).toEqual([...ROSTER].sort());
    const baseline = new Set<string>(nbaWhoAmIAuthoredIdentities.slice(0, 8).map(p => p.subjectId));
    const ids = nbaWhoAmIAuthoredBatch2.map(p => p.subjectId);
    expect(new Set(ids).size).toBe(48);
    expect(ids.every(id => id.startsWith("nba:") && !baseline.has(id))).toBe(true);
    expect(nbaWhoAmIAuthoredBatch2.find(p => p.name === "Isaiah Thomas")?.subjectId).toBe("nba:isaiah-thomas");
    expect(ids).not.toContain("nba:isiah-thomas");
    expect(nbaWhoAmIAuthoredBatch2.every(p => p.earlyRotation === "normal")).toBe(true);
  });

  it("has precisely 96 substantively independent scripts and 960 individually addressed verified clues", () => {
    const clueIds = new Set<string>();
    const clueText = new Set<string>();
    let scriptCount = 0;
    let clueCount = 0;
    for (const player of nbaWhoAmIAuthoredBatch2) {
      expect(Object.keys(player.scripts).sort()).toEqual(["A", "B"]);
      expect(player.subjectId).toMatch(/^nba:[a-z0-9-]+$/);
      expect(["modern", "legacy"]).toContain(player.eraBand);
      expect(["guard", "wing", "big"]).toContain(player.rescueGroup);
      for (const scriptId of ["A", "B"] as const) {
        scriptCount += 1;
        const script = player.scripts[scriptId];
        expect(script.id).toBe(scriptId);
        expect(script.clues).toHaveLength(10);
        expect(script.clues.map(clue => clue.band)).toEqual(BANDS);
        for (const [index, clue] of script.clues.entries()) {
          clueCount += 1;
          expect(clue.id).toBe(`${player.subjectId.replace("nba:", "nba-")}-${scriptId.toLowerCase()}-${index + 1}`);
          expect(clue.text.length).toBeGreaterThan(35);
          expect(clue.text.toLowerCase()).not.toContain(player.name.toLowerCase());
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          for (const sourceId of clue.sourceIds) {
            expect(player.sources[sourceId]).toMatch(/^https:\/\//);
            expect(new URL(player.sources[sourceId]).hostname).toMatch(/^(?:www\.)?(?:basketball-reference\.com|nba\.com)$/);
          }
          expect(clueIds.has(clue.id), `duplicate clue ID: ${clue.id}`).toBe(false);
          expect(clueText.has(clue.text), `duplicate clue text: ${clue.text}`).toBe(false);
          clueIds.add(clue.id);
          clueText.add(clue.text);
        }
      }
      expect(player.scripts.A.clues.some(a => player.scripts.B.clues.some(b => a.text === b.text))).toBe(false);
    }
    expect(scriptCount).toBe(96);
    expect(clueCount).toBe(960);
    expect(clueIds.size).toBe(960);
    expect(clueText.size).toBe(960);
  });

  it("delays identity giveaways until strong and giveaway bands", () => {
    for (const player of nbaWhoAmIAuthoredBatch2) {
      for (const scriptId of ["A", "B"] as const) {
        const clues = player.scripts[scriptId].clues;
        for (const clue of clues.slice(0, 4)) {
          expect(earlyFranchise.test(clue.text), `${player.name}/${scriptId}: premature team: ${clue.text}`).toBe(false);
          expect(earlyIdentity.test(clue.text), `${player.name}/${scriptId}: premature signature: ${clue.text}`).toBe(false);
        }
        for (const clue of clues.slice(0, 2)) {
          expect(/\b(?:only|first ever|first player|all-time|career leader|record-holder|three-time MVP)\b/i.test(clue.text)).toBe(false);
        }
        expect(clues.slice(8).some(clue => earlyFranchise.test(clue.text) || earlyIdentity.test(clue.text)),
          `${player.name}/${scriptId} is missing a final identity anchor`).toBe(true);
        for (const clue of clues) {
          expect(unacceptable.test(clue.text), `${player.name}/${scriptId}: unedited clue: ${clue.text}`).toBe(false);
        }
      }
    }
  });

  it("uses NBA/player-specific basketball history links, not placeholder or search URLs", () => {
    for (const player of nbaWhoAmIAuthoredBatch2) {
      expect(player.sources.profile).toMatch(/^https:\/\/www\.basketball-reference\.com\/players\/[a-z]\/[a-z0-9]+\.html$/);
      for (const url of Object.values(player.sources)) {
        expect(url).not.toMatch(/google|example\.|search\?|placeholder|\/players\/traditional$/i);
      }
    }
  });
});
