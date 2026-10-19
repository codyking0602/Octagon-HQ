import { describe, expect, it } from "vitest";
import { nbaWhoAmIAuthoredBatch4 } from "./nbaWhoAmIAuthoredBatch4";

const NAMES = [
  "Kareem Abdul-Jabbar", "Magic Johnson", "Larry Bird", "Bill Russell",
  "Wilt Chamberlain", "Oscar Robertson", "Jerry West", "Elgin Baylor",
  "Julius Erving", "Moses Malone", "Isiah Thomas", "George Gervin",
  "Rick Barry", "Walt Frazier", "Bob Cousy", "John Havlicek",
  "Elvin Hayes", "Wes Unseld", "Bob Pettit", "Bill Walton",
  "Robert Parish", "Kevin McHale", "James Worthy", "Dennis Johnson",
  "Joe Dumars", "Adrian Dantley", "Alex English", "Bernard King",
  "Bob McAdoo", "Pete Maravich", "Nate Archibald", "Willis Reed",
  "Earl Monroe", "Dave Cowens", "Sam Jones", "Hal Greer",
  "Gail Goodrich", "Connie Hawkins", "Artis Gilmore", "Dan Issel",
  "David Thompson", "Sidney Moncrief", "Maurice Cheeks", "Jack Sikma",
  "Mark Aguirre", "Terry Cummings", "Alvin Robertson", "Ralph Sampson",
] as const;

const BANDS = [
  "broad", "broad", "helpful", "helpful", "helpful",
  "strong", "strong", "strong", "giveaway", "giveaway",
] as const;

const EARLY_IDENTITY = /\b(?:Lakers|Celtics|Knicks|Bulls|76ers|Pistons|Rockets|Bucks|Spurs|Nuggets|Warriors|Heat|Suns|Jazz|Bullets|Royals|Cavaliers|Clippers|Nets|Magic|Hawks|Grizzlies|Toronto|Denver|Chicago|Boston|Milwaukee|Philadelphia|Detroit|Los Angeles|Washington|UCLA|LSU|Arkansas|Kentucky|Indiana|Ohio State|No\. ?\d+|center|point guard|power forward|small forward|shooting guard|first overall|19\d\d|20\d\d)\b/i;
const FIRST_PAIR_GIVEAWAY = /\b(?:first ever|only player|only person|all-time|career leader|record-holder|triple-double season|quadruple-double|skyhook|finger roll|Houdini|Showtime|Bad Boys|Big O|Dr\. J|Pistol Pete|Big Game James|Iceman|Skywalker|A-Train)\b/i;
const ENDING_ANCHOR = /(?:No\. ?\d+|MVP|champion|title|Finals|All-Star|Lakers|Celtics|Knicks|Pistons|Nuggets|Warriors|Bucks|Spurs|Bullets|Jazz|Royals|Rockets|76ers|Suns|Bulls|Toronto|Raptors|Hawks|Clippers|Denver|Boston|Chicago|Philadelphia|Milwaukee|Detroit|New York|Big O|Houdini|Dr\. J|the Chief|the Hawk|the Pearl|the Shooter|Showtime|Bad Boys|skyhook|finger roll|Skywalker|A-Train|Sikma|quadruple-double|triple-double|retired|scor(?:ing|ed)|ABA|NCAA|NBA logo|Sportsmanship|Defensive Player|Houston|points and assists|nicknam|19\d\d|20\d\d|\b\d{3}\b)/i;

describe("NBA Who Am I batch 4 — exclusive classic legends", () => {
  it("contains exactly the assigned 48 identities, 96 scripts and 960 unique clue IDs", () => {
    expect(nbaWhoAmIAuthoredBatch4.map(player => player.name)).toEqual(NAMES);
    expect(new Set(nbaWhoAmIAuthoredBatch4.map(player => player.subjectId)).size).toBe(48);
    expect(nbaWhoAmIAuthoredBatch4).toHaveLength(48);
    expect(nbaWhoAmIAuthoredBatch4.every(player => player.eraBand === "legacy")).toBe(true);
    const ids = nbaWhoAmIAuthoredBatch4.flatMap(player =>
      [...player.scripts.A.clues, ...player.scripts.B.clues].map(clue => clue.id),
    );
    expect(ids).toHaveLength(960);
    expect(new Set(ids).size).toBe(960);
    expect(nbaWhoAmIAuthoredBatch4.flatMap(player => Object.keys(player.scripts))).toHaveLength(96);
  });

  it("preserves the existing verified A/B clue schema and strict reveal bands", () => {
    const allText = new Set<string>();
    for (const player of nbaWhoAmIAuthoredBatch4) {
      expect(player.subjectId).toMatch(/^nba:[a-z0-9-]+$/);
      expect(player.earlyRotation).toBe("normal");
      expect(["guard", "wing", "big"]).toContain(player.rescueGroup);
      expect(Object.keys(player.scripts).sort()).toEqual(["A", "B"]);
      for (const [sourceId, url] of Object.entries(player.sources)) {
        expect(sourceId.length).toBeGreaterThan(0);
        expect(url).toMatch(/^https:\/\/(?:www\.)?(?:nba\.com|hoophall\.com|basketball-reference\.com)\//);
      }
      expect(Object.keys(player.sources).length).toBeGreaterThanOrEqual(2);
      for (const scriptId of ["A", "B"] as const) {
        const script = player.scripts[scriptId];
        expect(script.id).toBe(scriptId);
        expect(script.clues.map(clue => clue.band)).toEqual(BANDS);
        for (const [i, clue] of script.clues.entries()) {
          expect(clue.id).toBe(`nba-${player.subjectId.slice(4)}-${scriptId.toLowerCase()}-${i + 1}`);
          expect(clue.text).toMatch(/^(?:I |My )/);
          expect(clue.text.length).toBeGreaterThan(25);
          expect(clue.text.toLowerCase()).not.toContain(player.name.toLowerCase());
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          for (const ref of clue.sourceIds) {
            expect(player.sources[ref], `${player.name}: missing source ${ref}`).toBeTruthy();
          }
          const normalized = clue.text.trim().toLowerCase().replace(/\s+/g, " ");
          expect(allText.has(normalized), `Duplicated authored wording: ${player.name} ${scriptId}${i + 1}`).toBe(false);
          allText.add(normalized);
        }
      }
    }
  });

  it("keeps the first two clues broad and the first four free of hard identity leaks", () => {
    for (const player of nbaWhoAmIAuthoredBatch4) {
      for (const id of ["A", "B"] as const) {
        const clues = player.scripts[id].clues;
        for (const [index, clue] of clues.slice(0, 4).entries()) {
          expect(EARLY_IDENTITY.test(clue.text), `${player.name} ${id}${index + 1}: premature identity`).toBe(false);
        }
        for (const [index, clue] of clues.slice(0, 2).entries()) {
          expect(FIRST_PAIR_GIVEAWAY.test(clue.text), `${player.name} ${id}${index + 1}: iconic reveal too early`).toBe(false);
        }
        expect(clues.slice(8).every(clue => ENDING_ANCHOR.test(clue.text)),
          `${player.name} ${id}: both ending clues need concrete identity anchors`).toBe(true);
      }
    }
  });

  it("keeps A and B independently written, not duplicated scripts", () => {
    for (const player of nbaWhoAmIAuthoredBatch4) {
      const a = player.scripts.A.clues.map(clue => clue.text.toLowerCase());
      const b = player.scripts.B.clues.map(clue => clue.text.toLowerCase());
      expect(a.filter(clue => b.includes(clue))).toHaveLength(0);
      expect(new Set([...a, ...b]).size).toBe(20);
    }
  });

  it("distinguishes Detroit's Isiah Thomas from the later Isaiah Thomas", () => {
    const isiah = nbaWhoAmIAuthoredBatch4.find(p => p.name === "Isiah Thomas")!;
    expect(isiah.subjectId).toBe("nba:isiah-thomas");
    expect(nbaWhoAmIAuthoredBatch4.some(p => p.name === "Isaiah Thomas")).toBe(false);
    expect(isiah.scripts.A.clues.some(c => /Pistons|Detroit|Bad Boys/i.test(c.text))).toBe(true);
  });

  it("identifies ABA accomplishments as ABA rather than NBA accolades", () => {
    const ABA_IDENTITIES = [
      "Rick Barry", "Julius Erving", "Moses Malone", "George Gervin",
      "Connie Hawkins", "Artis Gilmore", "Dan Issel", "David Thompson",
    ];
    for (const name of ABA_IDENTITIES) {
      const player = nbaWhoAmIAuthoredBatch4.find(p => p.name === name)!;
      for (const id of ["A", "B"] as const) {
        expect(player.scripts[id].clues.some(c => /\bABA\b/.test(c.text)),
          `${name} ${id}: missing ABA distinction`).toBe(true);
      }
    }
  });
});
