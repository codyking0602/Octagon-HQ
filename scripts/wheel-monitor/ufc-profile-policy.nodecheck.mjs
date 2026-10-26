import test from "node:test";
import assert from "node:assert/strict";
import {athleteSlug,readOfficialAthleteProfile,summarizeOfficialProfiles} from "./ufc-profile-policy.mjs";
const page=(name,status)=>`<!doctype html><html><body><h1>${name}</h1><section><strong>Status</strong> ${status}</section><div>${"Athlete profile ".repeat(12)}</div></body></html>`;
test("UFC official profile must match identity and express an explicit status",()=>{
 assert.deepEqual(readOfficialAthleteProfile(page("Farid Basharat","Not Fighting"),"Farid Basharat"),{
  status:"official-not-fighting-designation",designation:"not-fighting",observedName:"Farid Basharat"});
 assert.equal(readOfficialAthleteProfile(page("Jon Jones","Active"),"Jon Jones").status,"official-active-designation");
 assert.equal(readOfficialAthleteProfile(page("Javid Basharat","Active"),"Farid Basharat").status,"identity-unverified");
 assert.equal(readOfficialAthleteProfile(page("Farid Basharat","Unknown"),"Farid Basharat").status,"designation-unverified");
 assert.equal(readOfficialAthleteProfile("<html>error</html>","Farid Basharat").status,"incomplete-page");
});
test("slug is URL-safe and never treats punctuation as alternate fighter",()=>{
 assert.equal(athleteSlug("Dustin Poirier"),"dustin-poirier");
 assert.equal(athleteSlug("José Aldo Jr."),"jose-aldo-jr");
 assert.throws(()=>athleteSlug(""),/Invalid/);
});
test("incomplete and inactive profiles cannot silently become certified active athletes",()=>{
 const summary=summarizeOfficialProfiles([
   {status:"official-active-designation"},
   {status:"official-not-fighting-designation"},
   {status:"identity-unverified"},
   {status:"request-failed"},
 ]);
 assert.equal(summary.total,4);
 assert.equal(summary.officialActive,1);
 assert.equal(summary.officialNotFighting,1);
 assert.equal(summary.unresolved,2);
 assert.equal(summary.independentRosterCertified,false);
 assert.equal(summary.abilityGradesChanged,0);
});
