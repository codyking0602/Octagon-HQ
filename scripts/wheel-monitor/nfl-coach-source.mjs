// One independent official-NFL source for 2026 head-coach identity.
// A dated season feature is not a live transaction/freshness authority; its
// matches do not, alone, satisfy full weekly coach-source certification.
import {JSDOM} from "jsdom";

export const OFFICIAL_NFL_COACHES_URL =
  "https://playfootball.nfl.com/news-events/news-and-features/where-every-nfl-head-coach-played-high-school-football/";
export const NFL_HEAD_COACH_SOURCE_SEASON = 2026;
export const NFL_COACH_TEAM_NAMES = Object.freeze({
  ARI:"Arizona Cardinals", ATL:"Atlanta Falcons", BAL:"Baltimore Ravens",
  BUF:"Buffalo Bills", CAR:"Carolina Panthers", CHI:"Chicago Bears",
  CIN:"Cincinnati Bengals", CLE:"Cleveland Browns", DAL:"Dallas Cowboys",
  DEN:"Denver Broncos", DET:"Detroit Lions", GB:"Green Bay Packers",
  HOU:"Houston Texans", IND:"Indianapolis Colts", JAX:"Jacksonville Jaguars",
  KC:"Kansas City Chiefs", LAC:"Los Angeles Chargers",
  LAR:"Los Angeles Rams", LV:"Las Vegas Raiders", MIA:"Miami Dolphins",
  MIN:"Minnesota Vikings", NE:"New England Patriots", NO:"New Orleans Saints",
  NYG:"New York Giants", NYJ:"New York Jets", PHI:"Philadelphia Eagles",
  PIT:"Pittsburgh Steelers", SEA:"Seattle Seahawks", SF:"San Francisco 49ers",
  TB:"Tampa Bay Buccaneers", TEN:"Tennessee Titans", WSH:"Washington Commanders",
});
const flatten = str => String(str??"").replace(/\s+/g," ").trim();

export function extractOfficialNflCoaches(html, season=2026) {
  if(season!==NFL_HEAD_COACH_SOURCE_SEASON)
    throw new Error("No source-certified official NFL head-coach page for season "+season);
  const doc=new JSDOM(html).window.document;
  const heading=[...doc.querySelectorAll("h1,h2,h3,h4")].some(element=>
    flatten(element.textContent).includes("2026 NFL Head Coaches, By High School"));
  if(!heading) throw new Error("Official NFL coach source heading missing or season stale");
  const namesToCodes=new Map(Object.entries(NFL_COACH_TEAM_NAMES)
    .map(([code,name])=>[name,code]));
  const byTeam=new Map();
  for(const item of doc.querySelectorAll("li")) {
    const line=flatten(item.textContent);
    const match=line.match(/^(.+?)\s+[—–]\s+([^,]+),/);
    if(!match) continue;
    const code=namesToCodes.get(match[1]);
    if(!code) continue;
    const name=flatten(match[2]);
    if(!name || byTeam.has(code))
      throw new Error("Duplicate or invalid official NFL coach identity: "+code);
    byTeam.set(code,name);
  }
  const missing=Object.keys(NFL_COACH_TEAM_NAMES).filter(code=>!byTeam.has(code));
  if(missing.length || byTeam.size!==32)
    throw new Error("Incomplete official NFL head-coach source: "+missing.join(", "));
  return Object.fromEntries([...byTeam].sort(([a],[b])=>a.localeCompare(b)));
}

export function reconcileOfficialNflCoach(row,officialByTeam,normalizer) {
  if(row.family!=="Head Coach" || row.sport!=="nfl")
    throw new Error("Expected canonical NFL Head Coach");
  const name=officialByTeam[row.team];
  if(typeof name!=="string" || !name.trim())
    throw new Error("Official NFL coach source missing canonical team "+row.team);
  const matched=normalizer(name)===normalizer(row.name);
  return {
    sourceStatus:matched?"matched":"coach-source-mismatch",
    sourceUrl:OFFICIAL_NFL_COACHES_URL,
    sourceCoachName:name,
    coachSourceKind:"official-seasonal-2026",
    coachSourceFreshnessCertified:false,
  };
}
