import { describe,it,expect } from "vitest";
import { ufcEditorialIssues,compactUfcPreview,compactUfcEdge } from "./ufcSpotlightEditorial";
describe("UFC fight preview concise editorial contract",()=>{
 const good="A pressure wrestler meets an accurate southpaw counterstriker with the longer reach and more comfortable distance game. The wrestler needs clinch contact and repeated takedown attempts to stop the striker from establishing rhythm. The key is whether the striker can consistently disengage before the wrestling exchanges build.";
 it("accepts meaningful three-sentence editorial and concise edges",()=>{
   expect(ufcEditorialIssues(good,["Pressure wrestling","Five-round experience","Clinching threat"])).toEqual([]);
 });
 it("rejects bloated and thin future automation packages",()=>{
   expect(ufcEditorialIssues("Too short.",["Good","Short"])).not.toEqual([]);
   expect(ufcEditorialIssues(good.split(" ").slice(0,40).join(" "),["Pressure wrestling","Five-round experience","Clinching threat"])).not.toEqual([]);
   expect(ufcEditorialIssues((good+" Extra analysis that keeps talking without adding anything. ").repeat(4),["A very long matchup edge containing at least eleven words which must be blocked","Another","Third"])).not.toEqual([]);
 });
 it("shortens a legacy published preview without fabricating new claims",()=>{
   const old=good+" A lengthy fourth sentence adding new claims that should stay in source.";
   const compact=compactUfcPreview(old);
   expect(compact).not.toContain("lengthy fourth");
   expect(compact).toContain("pressure wrestler");
   expect(compact.split(/\s+/).length).toBeLessThanOrEqual(65);
   expect(compactUfcEdge("Four-inch height advantage and southpaw striking angles")).toBe("Four-inch height advantage and southpaw striking angles");
   expect(compactUfcEdge("Higher UFC significant-strike volume (about 4.84 landed per minute)")).toBe("Higher UFC significant-strike volume (4.84/min)");
 });
});
