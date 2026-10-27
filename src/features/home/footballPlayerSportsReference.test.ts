import { describe,expect,it } from "vitest";
import { footballPlayerSportsReferenceUrl } from "./footballPlayerSportsReference";
import { readFileSync } from "node:fs";
describe("2026 Football Spotlight player links",()=>{
it("resolves verified college and pro player identities",()=>{
expect(footballPlayerSportsReferenceUrl("LaNorris Sellers","cfb")).toBe("https://www.sports-reference.com/cfb/players/lanorris-sellers-1.html");
expect(footballPlayerSportsReferenceUrl("Jeremiah Smith","cfb")).toBe("https://www.sports-reference.com/cfb/players/jeremiah-smith-2.html");
expect(footballPlayerSportsReferenceUrl("Bijan Robinson","nfl")).toBe("https://www.pro-football-reference.com/players/R/RobiBi01.htm");
expect(footballPlayerSportsReferenceUrl("Drake Maye","nfl")).toBe("https://www.pro-football-reference.com/players/M/MayeDr00.htm");
});
it("does not guess unknown player identities",()=>expect(footballPlayerSportsReferenceUrl("Future Published Player","cfb")).toContain("search.fcgi"));
it("links the photo and name separately",()=>{const c=readFileSync("src/features/home/FootballHq.tsx","utf8");expect(c).toContain("href={profileUrl}");expect(c).toContain("football-player-spotlight__name-link");});
});
