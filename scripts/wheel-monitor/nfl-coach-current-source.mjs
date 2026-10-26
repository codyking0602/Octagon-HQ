// Secondary, current-facing official NFL team pages. A seasonal article is
// NOT a current coaching freshness source. Never publish coach changes here.
import {JSDOM} from "jsdom";
import {NFL_COACH_TEAM_NAMES} from "./nfl-coach-source.mjs";
import {nameKey} from "./core.mjs";

export const NFL_TEAM_SLUGS=Object.freeze({
  ARI:"arizona-cardinals", ATL:"atlanta-falcons", BAL:"baltimore-ravens",
  BUF:"buffalo-bills", CAR:"carolina-panthers", CHI:"chicago-bears",
  CIN:"cincinnati-bengals", CLE:"cleveland-browns", DAL:"dallas-cowboys",
  DEN:"denver-broncos", DET:"detroit-lions", GB:"green-bay-packers",
  HOU:"houston-texans", IND:"indianapolis-colts", JAX:"jacksonville-jaguars",
  KC:"kansas-city-chiefs", LAC:"los-angeles-chargers", LAR:"los-angeles-rams",
  LV:"las-vegas-raiders", MIA:"miami-dolphins", MIN:"minnesota-vikings",
  NE:"new-england-patriots", NO:"new-orleans-saints", NYG:"new-york-giants",
  NYJ:"new-york-jets", PHI:"philadelphia-eagles", PIT:"pittsburgh-steelers",
  SEA:"seattle-seahawks", SF:"san-francisco-49ers", TB:"tampa-bay-buccaneers",
  TEN:"tennessee-titans", WSH:"washington-commanders",
});
export function coachTeamUrl(team) {
  if(!Object.hasOwn(NFL_TEAM_SLUGS,team)) throw new Error("Unknown NFL team "+team);
  return "https://www.nfl.com/teams/"+NFL_TEAM_SLUGS[team]+"/";
}
export function parseNflTeamCoach(html,team) {
  if(typeof html!=="string" || html.length<100) throw new Error("Empty NFL team HTML");
  if(!Object.hasOwn(NFL_COACH_TEAM_NAMES,team)) throw new Error("Unknown coach team");
  const doc=new JSDOM(html).window.document;
  const title=doc.title.replace(/\s+/g," ");
  if(!nameKey(title).includes(nameKey(NFL_COACH_TEAM_NAMES[team])))
    throw new Error("NFL source team identity mismatch: "+team);
  // Insert boundaries between DOM elements. textContent alone can join a
  // Head Coach label directly onto a name, and accidentally misidentify it.
  for(const node of doc.querySelectorAll("script,style,noscript")) node.remove();
  const el=doc.createElement("div");
  el.innerHTML=doc.body.innerHTML.replace(/<[^>]+>/g," ");
  const text=el.textContent.replace(/\s+/g," ").trim();
  const positions=[...text.matchAll(/\bTeam Info\b/gi)].map(m=>m.index);
  if(!positions.length) throw new Error("NFL live team info section missing");
  const info=text.slice(positions.at(-1),positions.at(-1)+1300);
  const match=info.match(/\bHead Coach\s+(.+?)\s+Stadium\b/i);
  if(!match) throw new Error("NFL current head coach missing from live team info");
  const coach=match[1].trim();
  if(!/^[\p{L}][\p{L}.'’\-]+(?:\s+[\p{L}][\p{L}.'’\-]+){1,3}$/u.test(coach))
    throw new Error("Ambiguous NFL live coach name: "+team);
  return coach;
}
export function coachPublicationFreshness(lastModified,observedAt,maxDays=14) {
  const observed=Date.parse(observedAt),published=Date.parse(lastModified??"");
  if(!Number.isFinite(observed) || !Number.isFinite(published) ||
     !Number.isInteger(maxDays) || maxDays<1) return false;
  const age=observed-published;
  return age>=0 && age<=maxDays*86400_000;
}
export function summarizeLiveCoaches(rows,canonicalByTeam,observedAt) {
  if(!Array.isArray(rows) || !canonicalByTeam) throw new Error("Missing coach observations");
  const teamCodes=Object.keys(NFL_TEAM_SLUGS);
  if(teamCodes.length!==32 || Object.keys(NFL_COACH_TEAM_NAMES).length!==32 ||
     new Set(teamCodes).size!==32) throw new Error("NFL team source census is incomplete");
  const byTeam=new Map();
  for(const row of rows){
    if(!Object.hasOwn(NFL_TEAM_SLUGS,row.team)||byTeam.has(row.team))
      throw new Error("Duplicate/unknown NFL coach source team");
    byTeam.set(row.team,row);
  }
  const all=teamCodes.map(team=>{
    const row=byTeam.get(team);
    const expected=canonicalByTeam[team];
    const same=!!row?.coach && !!expected && nameKey(row.coach)===nameKey(expected);
    const fresh=coachPublicationFreshness(row?.lastModified,observedAt);
    return {team,canonical:expected??null,observed:row?.coach??null,
      sourceUrl:row?.sourceUrl??coachTeamUrl(team),
      lastModified:row?.lastModified??null,observedAt,
      sourceStatus:!row?.coach?"missing-current-source":same?"matched":"official-current-coach-mismatch",
      publicationFreshnessVerified:same&&fresh,
      reason:row?.error??(!fresh?"source-publication-date-not-currently-verified":null)};
  });
  const matched=all.filter(row=>row.sourceStatus==="matched").length;
  const publishFresh=all.filter(row=>row.publicationFreshnessVerified).length;
  return {schema:1,status:matched===32 && publishFresh===32
    ?"current-official-coach-sources-certified":"source-review-required",
    observedAt,approved:32,observed:rows.length,matched,
    livePublicationFreshnessVerified:publishFresh,
    noAbilityOrIdentityAuthorityChanges:true,rows:all};
}
