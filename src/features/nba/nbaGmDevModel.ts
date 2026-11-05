import {
  NBA_GM_ROSTER_SLOTS, NBA_GM_SKILL_KEYS, nbaGmEligibleForSlot,
  type NbaGmPick, type NbaGmPlayer, type NbaGmSalaryWindow, type NbaGmSlot,
} from "./nbaGmFoundation";

/** Public signed-in NBA GM game; older V3 fixtures persist, V4 uses signed salary windows. */
export type NbaGmDevPlayer = Omit<NbaGmPlayer, "sources"> & {
  gameContract: "1YR" | "3YR";
  pricingKind: "GAME_FIXTURE_NOT_REAL_CONTRACT" | "SIGNED_REAL_SALARY_WINDOW";
  eligibilityKind: "PROVISIONAL_EDITORIAL";
  officialNbaPlayerId: string | null;
  /** Verified 2025–26 NBA Stats API birthdate, aged as of game launch. */
  ageAtStart?: number | null;
  /** Authoritative server odds; absent for old saved development models. */
  developmentOdds?: {breakoutPct:number;improvePct:number;declinePct:number;steadyPct:number}|null;
  /** Server-authored seed-free forecast; absent for original V2/V3 saves. */
  repriceRisk?: "LOW"|"MEDIUM"|"HIGH"|"LOCKED"|null;
  officialRosterPosition: string;
  positionReview: "unverified";
  reviewFlags: readonly string[];
};
export type NbaGmDevPhase = "draft" | "year1" | "offseason" | "final";
export interface NbaGmDevSeason {
  season: number; wins: number; losses: number;
  offense: number; defense: number; positionalFit: number; finish: string;
  /** NFL-style strength and six-finish odds; only V7 new games have these. */
  teamOverall?: number;
  titleOdds?: number; // 0–100, displayed descriptive estimate
  outcomeOdds?: Partial<Record<
    "Missed Playoffs"|"First Round"|"Conference Semifinals"|"Conference Finals"|"Finals"|"Champion",number
  >>; // probability 0–1
}
export interface NbaGmDevRun {
  version: "nba-gm-dev-v2";
  /** Newly started parity economies are V3; missing denotes original V2 saved run. */
  economyVersion?: 3 | 4;
  /** Opt-in competitive impact/series model. Older owner runs stay on saved logic. */
  simulationModelVersion?: 5 | 6 | 7 | 8 | 9 | 10;
  /** Automatic developed best-five lineups for new franchises only. */
  lineupModelVersion?: 1;
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
  /** Server-owned: spinning a trade partner spends this player's shopping attempt. */
  shoppedPlayerIds?: string[];
  tradeTeam: string | null;
  tradeAttempts: number;
  displacedAssets?: string[];
  displacedReleasedIds?: string[];
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
/** Present the same season-specific best five as the backend; do not reinterpret old results. */
export function nbaGmDevSeasonPicks(
  run: NbaGmDevRun, catalog: readonly NbaGmDevPlayer[], season: 1 | 2 | 3,
): NbaGmPick[] {
  const saved = season === 1 ? run.yearOnePicks : run.picks;
  if (season === 1 || run.lineupModelVersion !== 1 || !run.development) return saved;
  const grades = new Map<string, number>(saved.map(pick => [pick.playerId,
    (season === 2 ? run.development?.[pick.playerId]?.year2Grade : run.development?.[pick.playerId]?.year3Grade)
      ?? catalog.find(player => player.id === pick.playerId)?.currentGrade ?? 0,
  ]));
  return nbaGmDevAssignRoster(saved.map(pick => pick.playerId), catalog, grades) ?? saved;
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

/** Exhaustive legal assignment: fill five starters first, then maximize their
 * rated talent. Position familiarity breaks ties, never star-vs-bench value.
 * Match the authoritative server order in NBA GM migration 202612310902. */
export function nbaGmDevAssignRoster(playerIds: readonly string[], catalog: readonly NbaGmDevPlayer[], gradesById?: ReadonlyMap<string, number>): NbaGmPick[] | null {
  if (playerIds.length > 7 || new Set(playerIds).size !== playerIds.length) return null;
  const byId=new Map(catalog.map(p=>[p.id,p]));
  // Player identity order is canonical; neither draft order nor trade history can
  // determine tie-breaking or resulting starter/bench placement.
  const players=[...playerIds].sort().map(id=>byId.get(id));
  if (players.some(p=>!p))return null;
  // Exhaustive matching like the server: minimize bench assignments globally
  // before off-primary roles, not merely the first successful DFS branch.
  let best:{picks:NbaGmPick[];bench:number;offRole:number;starterPower:number;tie:string}|null=null;
  function visit(index:number,used:Set<NbaGmSlot>,picks:NbaGmPick[],
    bench:number,offRole:number,starterPower:number):void {
    if(best&&bench>best.bench)return;
    if(index===players.length){
      const tie=JSON.stringify(picks);
      if(!best||bench<best.bench||
        (bench===best.bench&&starterPower>best.starterPower)||
        (bench===best.bench&&starterPower===best.starterPower&&offRole<best.offRole)||
        (bench===best.bench&&starterPower===best.starterPower&&offRole===best.offRole&&tie<best.tie)){
        best={picks,bench,offRole,starterPower,tie};
      }
      return;
    }
    const player=players[index]!;
    for(const slot of NBA_GM_ROSTER_SLOTS){
      if(used.has(slot)||!nbaGmDevEligible(player,slot))continue;
      visit(index+1,new Set([...used,slot]),[...picks,{slot,playerId:player.id}],
        bench+(slot==="GUARD"||slot==="BIG"?1:0),
        offRole+(slot===player.positions[0]?0:1),
        starterPower+(slot==="GUARD"||slot==="BIG"?0:(gradesById?.get(player.id)??player.currentGrade)));
    }
  }
  visit(0,new Set(),[],0,0,0);
  return best ? (best as {picks:NbaGmPick[]}).picks.sort(
    (a,b)=>NBA_GM_ROSTER_SLOTS.indexOf(a.slot)-NBA_GM_ROSTER_SLOTS.indexOf(b.slot)
  ) : null;
}

/** NFL GM parity: the draft enforces only Year 1's cap, including distinct
 * inexpensive fillers for unfilled roles. Future repricing is resolved in the
 * offseason, where Years 2 and 3 must fit before advancing. The server owns
 * the same rule at pick commit. */
export function nbaGmDevCanAdd(
  picks:readonly NbaGmPick[], player:NbaGmDevPlayer, catalog:readonly NbaGmDevPlayer[],
  caps:NbaGmSalaryWindow=NBA_GM_DEV_CAPS, phase:NbaGmDevPhase="draft",
):boolean{
  if(picks.some(p=>p.playerId===player.id)||!["GAME_FIXTURE_NOT_REAL_CONTRACT","SIGNED_REAL_SALARY_WINDOW"].includes(player.pricingKind))return false;
  const assigned=nbaGmDevAssignRoster([...picks.map(p=>p.playerId),player.id],catalog);
  if(!assigned)return false;
  const owned=new Set(assigned.map(p=>p.playerId));
  const open=NBA_GM_ROSTER_SLOTS.filter(slot=>!assigned.some(p=>p.slot===slot));
  const spend=nbaGmDevSpend(assigned,catalog);
  // Distinct Year 1 reserve players prevent reusing the same cheap
  // athlete for multiple unfilled positions. Future extensions do not veto
  // a current-season draft pick, just as in NFL GM.
  const reserved=new Set(owned);
  let safeReserve=0;
  if(phase==="draft"){
    for(const slot of open){
      const cheapest=catalog.filter(p=>!reserved.has(p.id)&&nbaGmDevEligible(p,slot))
        .sort((a,b)=>nbaGmDevSalary(a,0)-nbaGmDevSalary(b,0)||a.id.localeCompare(b.id))[0];
      if(!cheapest)return false;
      reserved.add(cheapest.id);
      safeReserve+=nbaGmDevSalary(cheapest,0);
    }
  }
  return [0,1,2].every(year=>(phase==="draft"&&year!==0)||
    (phase==="offseason"&&year===0)||
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
    {label:"Rim protection",status:state(rotation.find(entry=>entry.slot==="C")?.player?.skills.interiorDefense??0,90,77),
      detail:"Your starting center's ability to protect the rim; frontcourt rebounding is scored separately"},
    {label:"Rebounding",status:state(mean(interior,"rebounding"),82,72),
      detail:"Big-man and frontcourt control of the glass"},
  ];
}

export function nbaGmDevCatalogErrors(catalog:readonly NbaGmDevPlayer[]):string[]{
  const errors:string[]=[];
  if(catalog.length!==330)errors.push("Expected 330 NBA GM candidates.");
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
      !["GAME_FIXTURE_NOT_REAL_CONTRACT","SIGNED_REAL_SALARY_WINDOW"].includes(p.pricingKind))errors.push("Invalid provisional NBA fixture "+p.id);
  }
  return errors;
}
