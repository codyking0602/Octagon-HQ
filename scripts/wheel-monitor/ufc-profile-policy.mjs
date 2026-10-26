// Primary-source UFC fighter profile observations, NOT an authority or grade.
// A UFC.com fighter page establishes only what the UFC profile currently says.
// An old profile, missing URL, ambiguous name or inactive designation cannot
// certify current roster eligibility or an ability score.
import {JSDOM} from "jsdom";
import {nameKey} from "./core.mjs";

export function athleteSlug(name) {
  const slug=String(name??"").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  if(!slug || slug.length>96) throw new Error("Invalid UFC profile name for slug");
  return slug;
}

export function readOfficialAthleteProfile(html, expectedName) {
  if(typeof html!=="string" || html.length<100)
    return {status:"incomplete-page",designation:null,observedName:null};
  const doc=new JSDOM(html).window.document;
  const heading=[...doc.querySelectorAll("h1")].map(x=>x.textContent.trim())
    .filter(Boolean);
  // Never use a profile's results or status unless the heading identifies the
  // exact requested fighter. A site redirect or same-surname collision is not proof.
  const matched=heading.find(x=>nameKey(x)===nameKey(expectedName));
  if(!matched) return {status:"identity-unverified",designation:null,
    observedName:heading[0]??null};
  const text=doc.body?.textContent?.replace(/\s+/g," ").trim()??"";
  const match=text.match(/\bStatus\s+(Not Fighting|Active|Fighting)\b/i);
  if(!match)return {status:"designation-unverified",designation:null,observedName:matched};
  const designation=match[1].toLowerCase().replace(/\s+/g,"-");
  return {status:designation==="active"||designation==="fighting"
    ?"official-active-designation":"official-not-fighting-designation",
    designation,observedName:matched};
}

export function summarizeOfficialProfiles(rows) {
  if(!Array.isArray(rows))throw new Error("Profile review rows required");
  const counts={};
  for(const row of rows)counts[row.status]=(counts[row.status]??0)+1;
  return {total:rows.length,counts,
    officialActive:rows.filter(x=>x.status==="official-active-designation").length,
    officialNotFighting:rows.filter(x=>x.status==="official-not-fighting-designation").length,
    unresolved:rows.filter(x=>!["official-active-designation","official-not-fighting-designation"].includes(x.status)).length,
    independentRosterCertified:false,abilityGradesChanged:0};
}
