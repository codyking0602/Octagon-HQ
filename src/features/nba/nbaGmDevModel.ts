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
  /** Verified 2025–26 NBA Stats API birthdate, aged as of game launch. */
  ageAtStart?: number | null;
  /** Authoritative server odds; absent for old saved development models. */
  developmentOdds?: {breakoutPct:number;improvePct:number;declinePct:number;steadyPct:number}|null;
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
  /** Newly started parity economies are V3; missing denotes original V2 saved run. */
  economyVersion?: 3;
  /** New franchises only; missing keeps V2 and original V3 development unchanged. */
  developmentModelVersion?: 2;
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
  /** Additive fields; legacy V2 run snapshots remain valid. */
  development?: Record<string, {year2Grade:number;year3Grade:number;
    year2Salary:number;year3Salary:number;startingGrade:number}>;
  scoreBreakdown?: {score:number;roster:number;regularSeason:number;playoffs:number;
    weights:[number,number,number]};
}
export const NBA_GM_DEV_CAPS: NbaGmSalaryWindow = [155_000_000, 155_000_000, 155_000_000];
export const NBA_GM_DEV_SKILL_LABELS = {
  scoring: "Scoring", shooting: "Shooting", playmaking: "Playmaking",
  perimeterDefense: "Perimeter D", interiorDefense: "Interior D", rebounding: "Rebounding",
} as const;
export const NBA_GM_DEV_SLOT_LABELS: Record<NbaGmSlot, string> = {
  PG:"PG", SG:"SG", SF:"SF", PF:"PF", C:"C", GUARD:"Guard", BIG:"Big",
};
/** The displayed current-year salary must match the phase the player just completed. */
export function nbaGmDevDisplaySalaryYear(phase: NbaGmDevPhase): 0|1|2 {
  switch (phase) {
    case "draft":
    case "year1":
      return 0;
    case "offseason":
      return 1;
    case "final":
      return 2;
  }
}
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
  // Exhaustive matching like the server: minimize bench assignments globally
  // before off-primary roles, not merely the first successful DFS branch.
  let best:{picks:NbaGmPick[];bench:number;offRole:number;tie:string}|null=null;
  function visit(index:number,used:Set<NbaGmSlot>,picks:NbaGmPick[],
    bench:number,offRole:number):void {
    if(best&&(bench>best.bench||(bench===best.bench&&offRole>best.offRole)))return;
    if(index===players.length){
      const tie=JSON.stringify(picks);
      if(!best||bench<best.bench||(bench===best.bench&&offRole<best.offRole)||
        (bench===best.bench&&offRole===best.offRole&&tie<best.tie)){
        best={picks,bench,offRole,tie};
      }
      return;
    }
    const player=players[index]!;
    for(const slot of NBA_GM_ROSTER_SLOTS){
      if(used.has(slot)||!nbaGmDevEligible(player,slot))continue;
      visit(index+1,new Set([...used,slot]),[...picks,{slot,playerId:player.id}],
        bench+(slot==="GUARD"||slot==="BIG"?1:0),
        offRole+(slot===player.positions[0]?0:1));
    }
  }
  visit(0,new Set(),[],0,0);
  return best ? (best as {picks:NbaGmPick[]}).picks : null;
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
  // Distinct reserved players protect against double-counting one versatile
  // cheap player as the solution to multiple open positions. Reserving each
  // filler's maximum contracted-year cost guarantees a concrete completion.
  const reserved=new Set(owned);
  let safeReserve=0;
  if(phase==="draft"){
    for(const slot of open){
      const maxCost=(p:NbaGmDevPlayer)=>Math.max(...[0,1,2].map(
        year=>nbaGmDevSalary(p,year as 0|1|2)));
      const cheapest=catalog.filter(p=>!reserved.has(p.id)&&nbaGmDevEligible(p,slot))
        .sort((a,b)=>maxCost(a)-maxCost(b)||a.id.localeCompare(b.id))[0];
      if(!cheapest)return false;
      reserved.add(cheapest.id);
      safeReserve+=Math.max(...[0,1,2].map(year=>nbaGmDevSalary(cheapest,year as 0|1|2)));
    }
  }
  return [0,1,2].every(year=>(phase==="offseason"&&year===0)||
    spend[year]!+safeReserve<=caps[year]!);
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
/** Narrative scouting only, revealed AFTER Season 1. Never used as an
 * arbitrary extra chemistry multiplier in the uncalibrated win model. */
export type NbaGmFitSignal={label:string;status:"STRONG"|"FAIR"|"NEEDS WORK";detail:string};
export function nbaGmDevFitSignals(
  picks:readonly NbaGmPick[],catalog:readonly NbaGmDevPlayer[],
):NbaGmFitSignal[]{
  if(picks.length!==7)return [];
  const byId=new Map(catalog.map(player=>[player.id,player]));
  const rotation=picks.map(pick=>({slot:pick.slot,player:byId.get(pick.playerId)}));
  if(rotation.some(entry=>!entry.player))return [];
  const starters=rotation.filter(entry=>entry.slot!=="GUARD"&&entry.slot!=="BIG")
    .map(entry=>entry.player!);
  const backcourt=rotation.filter(entry=>["PG","SG","SF","GUARD"].includes(entry.slot))
    .map(entry=>entry.player!);
  const interior=rotation.filter(entry=>["PF","C","BIG"].includes(entry.slot))
    .map(entry=>entry.player!);
  if(starters.length!==5||backcourt.length<3||interior.length<2)return [];
  const mean=(players:NbaGmDevPlayer[],key:keyof NbaGmDevPlayer["skills"])=>
    players.reduce((sum,p)=>sum+p.skills[key],0)/players.length;
  const ranked=(key:keyof NbaGmDevPlayer["skills"])=>
    [...starters].map(p=>p.skills[key]).sort((a,b)=>b-a);
  const scoring=ranked("scoring"),creation=ranked("playmaking");
  const shooters=starters.filter(p=>p.skills.shooting>=80).length;
  const state=(score:number,strong:number,fair:number):NbaGmFitSignal["status"]=>
    score>=strong?"STRONG":score>=fair?"FAIR":"NEEDS WORK";
  return [
    {label:"Shot creation",status:state(scoring[0]!*.6+scoring[1]!*.4,87,77),
      detail:"Your best and second scoring options"},
    {label:"Floor spacing",status:shooters>=3?"STRONG":shooters===2?"FAIR":"NEEDS WORK",
      detail:"Starter-quality outside shooting across five positions"},
    {label:"Secondary playmaking",status:state(creation[1]!,82,72),
      detail:"A second reliable ball handler beyond the primary creator"},
    {label:"Perimeter defense",status:state(mean(backcourt,"perimeterDefense"),82,73),
      detail:"Guard and wing resistance"},
    {label:"Interior presence",status:state(mean(interior,"interiorDefense"),83,73),
      detail:"Rim and frontcourt protection"},
    {label:"Rebounding",status:state(mean(interior,"rebounding"),82,72),
      detail:"Big-man and frontcourt control of the glass"},
  ];
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
