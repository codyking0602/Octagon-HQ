import { describe, expect, it } from "vitest";
import { nbaHigherLowerPortraitSource, NBA_HIGHER_LOWER_EDITORIAL_PHOTOS, NBA_HIGHER_LOWER_RESTORED_PORTRAITS, nbaHigherLowerIsGenericSilhouette } from "./nbaHigherLowerPortraits";
import { nbaFindLeaderSubjects } from "./nbaFindTheLeaderModel";
import { NBA_HIGHER_LOWER_ELIGIBLE_PHOTO_SUBJECTS, NBA_HIGHER_LOWER_METRIC_KEYS, createNbaHigherLowerBoard } from "./nbaHigherLowerModel";

describe("NBA Higher or Lower portrait coverage and player identity", () => {
  it("maps both reported gray silhouettes to verified real-player photographs", () => {
    const odom = nbaHigherLowerPortraitSource({ name:"Lamar Odom", nbaId:1885 });
    const hardaway = nbaHigherLowerPortraitSource({ name:"Tim Hardaway", nbaId:896 });
    expect(odom).toBe(NBA_HIGHER_LOWER_EDITORIAL_PHOTOS.lamarodom);
    expect(hardaway).toBe(NBA_HIGHER_LOWER_EDITORIAL_PHOTOS.timhardaway);
    expect(odom).not.toContain("headshots/nba/latest/");
    expect(hardaway).not.toContain("headshots/nba/latest/");
    expect(hardaway).toContain("tim-hardaway.jpg");
    expect(nbaHigherLowerPortraitSource({name:"Tim Hardaway Jr.",nbaId:203501})).not.toBe(hardaway);
  });
  it("retains verified former silhouettes and approved playing-era editorial photos with identity credits", () => {
    const originals = Object.values(NBA_HIGHER_LOWER_RESTORED_PORTRAITS);
    expect(originals).toHaveLength(27);
    const urls = new Set<string>();
    for (const original of originals) {
      expect(original.name.length).toBeGreaterThan(5);
      expect(original.url.startsWith("https://")).toBe(true);
      expect(original.source.startsWith("https://")).toBe(true);
      expect(original.author.length).toBeGreaterThan(2);
      expect(original.license.length).toBeGreaterThan(2);
      if (original.license.startsWith("CC ")) expect(original.licenseUrl).toContain("creativecommons.org");
      expect(urls.has(original.url)).toBe(false);
      urls.add(original.url);
    }
    expect(originals.filter(x => x.url.includes("wikimedia.org"))).toHaveLength(20);
    expect(originals.find(x => x.name === "Terry Cummings")?.source).toContain("legendsofbasketball.com");
  });
  it("refuses the five reported post-career and coaching portrait regressions", () => {
    const unsuitable: Record<string, readonly string[]> = {
      michaelfinley: ["Michael_Finley_042216", "headshots/nba/latest"],
      glenrice: ["Glen_Rice_2010", "headshots/nba/latest"],
      jerrystackhouse: ["Coach_Jerry_Stackhouse", "headshots/nba/latest"],
      clydedrexler: ["headshots/nba/latest"],
      timhardaway: ["headshots/nba/latest"],
    };
    for (const [key, rejected] of Object.entries(unsuitable)) {
      const source = NBA_HIGHER_LOWER_EDITORIAL_PHOTOS[key];
      expect(source).toBeTruthy();
      for (const bad of rejected) expect(source).not.toContain(bad);
    }
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
    expect(people.length).toBe(184);
    expect(Object.keys(NBA_HIGHER_LOWER_RESTORED_PORTRAITS)).toHaveLength(27);
    const eligible = new Set(people.map(x => x.name.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g,"")));
    // The shared registry also contains restorations needed only by Find the Leader
    // (Brandon Roy); they must not be incorrectly required in this game's pool.
    const sharedEligible = new Set([...eligible, ...nbaFindLeaderSubjects.map(x =>
      x.name.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g, ""))]);
    for (const key of Object.keys(NBA_HIGHER_LOWER_RESTORED_PORTRAITS)) expect(sharedEligible.has(key)).toBe(true);
    expect(new Set(people.map(x => x.name)).size).toBe(people.length);
    expect(people.some(x => x.name === "Lamar Odom")).toBe(true);
    expect(people.some(x => x.name === "Jason Kidd")).toBe(true);
    expect(people.some(x => x.name === "Patrick Ewing")).toBe(true);
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
