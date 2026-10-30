import {
  NBA_GM_ROSTER_SLOTS, NBA_GM_SKILL_KEYS, nbaGmEligibleForSlot,
  type NbaGmPick, type NbaGmPlayer, type NbaGmSalaryWindow, type NbaGmSlot,
} from "./nbaGmFoundation";

/** Owner-only game: ratings/positions and 1YR/3YR contracts remain private playtest fixtures. */
export type NbaGmDevPlayer = Omit<NbaGmPlayer, "sources"> & {
  gameContract: "1YR" | "3YR";
  pricingKind: "GAME_FIXTURE_NOT_REAL_CONTRACT";
  eligibilityKind: "PROVISIONAL_EDITORIAL";
  officialNbaPlayerId: string | null;
  officialRosterPosition: string;
  positionReview: "unverified";
  reviewFlags: readonly string[];
};
export type NbaGmDevPhase = "draft" | "year1" | "offseason" | "final";
export interface NbaGmDevSeason {
  season: number; wins: number; losses: number;
  offense: number; defense: number; positionalFit: number; finish: string;
}
export interface NbaGmDevRun {
  version: "nba-gm-dev-v2";
  seed: string;
  phase: NbaGmDevPhase;
  picks: NbaGmPick[];
  /** Immutable draft roster used for the Season 1 fit reveal. */
  yearOnePicks: NbaGmPick[];
  pendingTeam: string | null;
  pendingSlot: null;
  spinIndex: number;
  caps: NbaGmSalaryWindow;
  results: NbaGmDevSeason[];
  shopPlayerId: string | null;
  tradeTeam: string | null;
  tradeAttempts: number;
  tradesUsed: number;
  freeAgencyTeam: string | null;
  freeAgencyVisits: number;
  releasedIds: string[];
}
export const NBA_GM_DEV_CAPS: NbaGmSalaryWindow = [192_500_000, 192_500_000, 192_500_000];
export const NBA_GM_DEV_SKILL_LABELS = {
  scoring: "Scoring", shooting: "Shooting", playmaking: "Playmaking",
  perimeterDefense: "Perimeter D", interiorDefense: "Interior D", rebounding: "Rebounding",
} as const;
export const NBA_GM_DEV_SLOT_LABELS: Record<NbaGmSlot, string> = {
  PG:"PG", SG:"SG", SF:"SF", PF:"PF", C:"C", GUARD:"Guard", BIG:"Big",
};
export function nbaGmDevSalary(player: NbaGmDevPlayer, year: 0|1|2) {
  return player.gameContract === "3YR" ? player.salaries[0] : player.salaries[year];
}
export function nbaGmDevSpend(picks: readonly NbaGmPick[], catalog: readonly NbaGmDevPlayer[]): NbaGmSalaryWindow {
  const byId = new Map(catalog.map(p => [p.id, p]));
  return [0, 1, 2].map(year => picks.reduce(
    (total,pick) => {
      const player=byId.get(pick.playerId);
      return total+(player ? nbaGmDevSalary(player,year as 0|1|2):0);
    },0)) as unknown as NbaGmSalaryWindow;
}
export function nbaGmDevEligible(player: NbaGmDevPlayer, slot: NbaGmSlot) {
  return nbaGmEligibleForSlot(player,slot);
}

/** Match all chosen players to legal NBA roles. Reflow is deterministic and
 * keeps the five starters filled first whenever the roster allows it. */
export function nbaGmDevAssignRoster(playerIds: readonly string[], catalog: readonly NbaGmDevPlayer[]): NbaGmPick[] | null {
  if (playerIds.length > 7 || new Set(playerIds).size !== playerIds.length) return null;
  const byId=new Map(catalog.map(p=>[p.id,p]));
  const players=playerIds.map(id=>byId.get(id));
  if (players.some(p=>!p))return null;
  function visit(index:number,used:Set<NbaGmSlot>,picks:NbaGmPick[]):NbaGmPick[]|null {
    if(index===players.length)return picks;
    const player=players[index]!;
    // Prefer a player's exact primary position; bench positions stay flexible.
    const slots=[...NBA_GM_ROSTER_SLOTS].filter(slot=>nbaGmDevEligible(player,slot))
      .sort((a,b)=>(a===player.positions[0]?-1:b===player.positions[0]?1:0)
        || (a==="GUARD"||a==="BIG"?1:0)-(b==="GUARD"||b==="BIG"?1:0));
    for(const slot of slots){
      if(used.has(slot))continue;
      const next=visit(index+1,new Set([...used,slot]),[...picks,{slot,playerId:player.id}]);
      if(next)return next;
    }
    return null;
  }
  return visit(0,new Set(),[]);
}

/** Affordable matching with future-slot reserve. Does not claim certainty about
 * future random spins; the server repeats the identical rule at pick commit. */
export function nbaGmDevCanAdd(
  picks:readonly NbaGmPick[], player:NbaGmDevPlayer, catalog:readonly NbaGmDevPlayer[],
  caps:NbaGmSalaryWindow=NBA_GM_DEV_CAPS, phase:NbaGmDevPhase="draft",
):boolean{
  if(picks.some(p=>p.playerId===player.id)||player.pricingKind!=="GAME_FIXTURE_NOT_REAL_CONTRACT")return false;
  const assigned=nbaGmDevAssignRoster([...picks.map(p=>p.playerId),player.id],catalog);
  if(!assigned)return false;
  const owned=new Set(assigned.map(p=>p.playerId));
  const open=NBA_GM_ROSTER_SLOTS.filter(slot=>!assigned.some(p=>p.slot===slot));
  const spend=nbaGmDevSpend(assigned,catalog);
  return [0,1,2].every(year=>{
    if(phase==="offseason"&&year===0)return true;
    const reserve=phase==="offseason"?0:open.reduce((sum,slot)=>{
      const prices=catalog.filter(p=>!owned.has(p.id)&&nbaGmDevEligible(p,slot))
        .map(p=>nbaGmDevSalary(p,year as 0|1|2));
      return sum+(prices.length?Math.min(...prices):Number.POSITIVE_INFINITY);
    },0);
    return spend[year]!+reserve<=caps[year]!;
  });
}
/** Legacy call signature retained for foundation and migration contract checks. */
export function nbaGmDevCanPick(picks: readonly NbaGmPick[],slot:NbaGmSlot,
 player:NbaGmDevPlayer,catalog:readonly NbaGmDevPlayer[],caps:NbaGmSalaryWindow=NBA_GM_DEV_CAPS){
  return nbaGmDevEligible(player,slot)&&!picks.some(p=>p.slot===slot)&&nbaGmDevCanAdd(picks,player,catalog,caps);
}
export function nbaGmDevCandidates(run:NbaGmDevRun,catalog:readonly NbaGmDevPlayer[]):NbaGmDevPlayer[]{
  const team=run.phase==="draft"?run.pendingTeam:run.freeAgencyTeam;
  if(!team)return [];
  const excluded=new Set(run.releasedIds);
  return catalog.filter(player=>player.teamCode===team&&!excluded.has(player.id)
    && (run.phase!=="offseason"||player.gameContract==="1YR")
    && nbaGmDevCanAdd(run.picks,player,catalog,run.caps,run.phase))
    .sort((a,b)=>b.currentGrade-a.currentGrade||a.name.localeCompare(b.name));
}
export function nbaGmDevCatalogErrors(catalog:readonly NbaGmDevPlayer[]):string[]{
  const errors:string[]=[];
  if(catalog.length!==330)errors.push("Expected 330 privately held NBA GM candidates.");
  const ids=new Set<string>();
  for(const p of catalog){
    if(ids.has(p.id)||!p.id)errors.push("Duplicate/missing identity "+p.id);
    ids.add(p.id);
    if(!p.positions.length||p.currentGrade<0||p.currentGrade>99||
      !["1YR","3YR"].includes(p.gameContract)||
      p.salaries.length!==3||p.salaries.some(s=>!Number.isSafeInteger(s)||s<=0)||
      NBA_GM_SKILL_KEYS.some(key=>!Number.isInteger(p.skills[key])||p.skills[key]<0||p.skills[key]>99)||
      p.eligibilityKind!=="PROVISIONAL_EDITORIAL"||p.positionReview!=="unverified"||
      !p.officialRosterPosition||!Array.isArray(p.reviewFlags)||p.reviewFlags.length===0||
      p.pricingKind!=="GAME_FIXTURE_NOT_REAL_CONTRACT")errors.push("Invalid provisional NBA fixture "+p.id);
  }
  return errors;
}
