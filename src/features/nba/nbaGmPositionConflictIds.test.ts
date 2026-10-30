import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type OfficialRow = { name: string; teamCode: string; officialNBAPlayerId: string | null };
const crosswalk = JSON.parse(readFileSync("docs/nba-gm-official-nba-30-team-roster-crosswalk-2026-10-29.json","utf8")) as {
 published:boolean; crosswalk:OfficialRow[]; positionConflicts:OfficialRow[];
};
const markdown=readFileSync("docs/nba-gm-39-official-nba-player-ids-2026-10-29.md","utf8");
const records=markdown.split("\n").map(s=>s.split("|").map(x=>x.trim())).filter(c=>c.length>=5&&/^\d+$/.test(c[2]??""));
describe("NBA GM 39 official-position mismatch canonical identity leads",()=>{
 it("has 39 unique exact NBA player IDs with official matching profile URLs",()=>{
  expect(records).toHaveLength(39);
  expect(new Set(records.map(c=>c[1])).size).toBe(39);
  expect(new Set(records.map(c=>c[2])).size).toBe(39);
  expect(crosswalk.positionConflicts).toHaveLength(39);
  expect(new Set(records.map(c=>c[1]))).toEqual(new Set(crosswalk.positionConflicts.map(x=>x.name)));
  for(const row of records){
    expect(row[3]).toBe("https://www.nba.com/player/"+row[2]);
    const official=crosswalk.crosswalk.find(x=>x.name===row[1]);
    expect(official,row[1]).toBeDefined();
    if(official?.officialNBAPlayerId)expect(official.officialNBAPlayerId).toBe(row[2]);
  }
 });
 it("does not imply trait certification or publish these draft IDs",()=>{
  expect(crosswalk.published).toBe(false);
  expect(markdown).toContain("Exact game eligibility remains unverified");
  expect(markdown).toContain("not six-skill evidence");
 });
});
