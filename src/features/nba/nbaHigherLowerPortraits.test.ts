import { describe, expect, it } from "vitest";
import { nbaHigherLowerPortraitSource, NBA_HIGHER_LOWER_EDITORIAL_PHOTOS, NBA_HIGHER_LOWER_UNVERIFIED_PHOTO_KEYS, nbaHigherLowerIsGenericSilhouette } from "./nbaHigherLowerPortraits";
import { nbaFindLeaderSubjects } from "./nbaFindTheLeaderModel";
import { NBA_HIGHER_LOWER_ELIGIBLE_PHOTO_SUBJECTS, NBA_HIGHER_LOWER_METRIC_KEYS, createNbaHigherLowerBoard } from "./nbaHigherLowerModel";

describe("NBA Higher or Lower portrait coverage and player identity", () => {
  it("maps both reported gray silhouettes to verified real-player photographs", () => {
    const odom = nbaHigherLowerPortraitSource({ name:"Lamar Odom", nbaId:1885 });
    const hardaway = nbaHigherLowerPortraitSource({ name:"Tim Hardaway", nbaId:896 });
    expect(odom).toBe(NBA_HIGHER_LOWER_EDITORIAL_PHOTOS.lamarodom);
    expect(hardaway).toBe(NBA_HIGHER_LOWER_EDITORIAL_PHOTOS.timhardaway);
    expect(odom).not.toContain("headshots/nba/latest/");
    expect(hardaway).toContain("cdn.nba.com/teams/uploads/");
    expect(nbaHigherLowerPortraitSource({name:"Tim Hardaway Jr.",nbaId:203501})).not.toBe(hardaway);
  });
  it("all sampled subjects resolve a correctly named, player-ID-bound photo URL or an explicit missing-photo fallback", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const board = createNbaHigherLowerBoard("portrait-coverage-" + i);
      for (const subject of board.questions.flatMap(q=>[q.known,q.hidden])) {
        const key = subject.name + "/" + subject.nbaId;
        if (seen.has(key)) continue;
        seen.add(key);
        const expected = nbaFindLeaderSubjects.find(s=>s.name === subject.name && s.nbaId != null)?.nbaId ?? null;
        expect(subject.nbaId === expected || expected == null).toBe(true);
        const url = nbaHigherLowerPortraitSource(subject);
        expect(url == null || url.startsWith("https://")).toBe(true);
        if (url?.includes("headshots/nba/latest")) expect(url).toContain("/"+subject.nbaId+".png");
      }
    }
    expect(seen.size).toBeGreaterThan(90);
    expect(NBA_HIGHER_LOWER_METRIC_KEYS).toContain("season-threes");
  });
  it("exposes the entire eligible player pool for full image-content auditing", () => {
    const people = NBA_HIGHER_LOWER_ELIGIBLE_PHOTO_SUBJECTS;
    expect(people.length).toBeGreaterThan(100);
    expect(NBA_HIGHER_LOWER_UNVERIFIED_PHOTO_KEYS.size).toBe(24);
    expect(people.every(x => !NBA_HIGHER_LOWER_UNVERIFIED_PHOTO_KEYS.has(
      x.name.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g,"")
    ))).toBe(true);
    expect(new Set(people.map(x => x.name)).size).toBe(people.length);
    expect(people.some(x => x.name === "Lamar Odom")).toBe(true);
    expect(people.some(x => x.name === "Jason Kidd")).toBe(false);
    expect(people.some(x => x.name === "Patrick Ewing")).toBe(false);
    expect(people.some(x => x.name === "Tim Hardaway")).toBe(true);
  });
  it("detects a successfully loaded flat gray silhouette instead of treating it as a photograph", () => {
    const native = document.createElement.bind(document);
    const original = document.createElement;
    const fake = {width:28,height:20,getContext:()=>({
      drawImage:()=>{},getImageData:()=>({data:new Uint8ClampedArray(Array.from({length:28*20},()=>[150,150,150,255]).flat())})
    })};
    document.createElement = ((tag: string) => tag === "canvas" ? fake as unknown as HTMLCanvasElement : native(tag)) as typeof document.createElement;
    try { expect(nbaHigherLowerIsGenericSilhouette(document.createElement("img"))).toBe(true); }
    finally { document.createElement = original; }
  });
});
