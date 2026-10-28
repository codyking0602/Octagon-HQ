import { hitTheNumberBoardQualityScore, hitTheNumberScore } from "../play/hitTheNumberEngine";
import { createReplaySeed, replayLineupIdentity, rememberLineup, seededLineupRandom, shuffleLineup, type PlayLineupIdentity } from "../play/lineupModel";
import { nbaHitSubjects, nbaHitSubjectsFor, nbaHitSubjectById, nbaHitValue, NBA_HIT_STAT_CATALOG, type NbaHitSubject, type NbaHitStat } from "./nbaHitTheNumberStats";

export const NBA_HIT_THE_NUMBER_GAME_ID = "nba-hit-the-number";
export const NBA_HIT_THE_NUMBER_VERSION = "nba-hit-the-number-v1" as const;
export const NBA_HIT_PICK_WEIGHTS = [{ value:4, weight:85 }, { value:5, weight:15 }] as const;
export const NBA_HIT_FORMAT_WEIGHTS = [
  {value:"classic",weight:40},{value:"themed-lineup",weight:25},
  {value:"one-from-each",weight:20},{value:"build-the-team",weight:15},
] as const;
export type NbaHitFormatId = typeof NBA_HIT_FORMAT_WEIGHTS[number]["value"];
export type NbaHitBoardType = "random-pool";
export interface NbaHitSlot { id:string; label:string; role?: "G"|"F"|"C"; frontcourt?:boolean; threshold?:number; }
export interface NbaHitPlan {
  seed:string; version: typeof NBA_HIT_THE_NUMBER_VERSION;
  boardType:NbaHitBoardType; statId:NbaHitStat; metricLabel:string;
  formatId:NbaHitFormatId; configurationLabel:string;
  season:number|null; pickCount:4|5; target:number;
  subjectIds:readonly string[]; slots:readonly NbaHitSlot[];
}
export interface NbaHitRun { plan:NbaHitPlan; identity:PlayLineupIdentity; }
export interface NbaHitResult {
  status:"perfect"|"under"|"bust"; target:number; total:number;
  distance:number; score:number;
  selections: readonly {subjectId:string;value:number}[];
}
export interface NbaHitQuality {
  passes:boolean; legalCount:number; goodUnderCount:number;
  underCount:number; bustCount:number; midCount:number;
  badUnderCount:number; meaningfulBustCount:number;
}
export function nbaHitPoolSize(pickCount:number) {
  if(pickCount!==4 && pickCount!==5) throw new Error("NBA Hit the Number only supports four or five picks.");
  return pickCount===4 ? 12 : 14;
}
function chooseWeighted<T>(options:readonly {value:T;weight:number}[],rand:()=>number):T {
  const sum=options.reduce((a,b)=>a+b.weight,0); let cursor=rand()*sum;
  for(const option of options) {cursor-=option.weight;if(cursor<0)return option.value;}
  return options[options.length-1]!.value;
}
export function nbaHitSlotAccepts(slot:NbaHitSlot,subject:NbaHitSubject,statId:NbaHitStat) {
  return (slot.role==null || slot.role===subject.role) && (!slot.frontcourt || subject.role!=="G") && (slot.threshold==null || nbaHitValue(subject,statId)>=slot.threshold);
}
function slotsFor(formatId:NbaHitFormatId,count:4|5,pool:readonly NbaHitSubject[],statId:NbaHitStat):NbaHitSlot[] {
  if(formatId==="classic" || formatId==="themed-lineup")return [];
  const wildcard: NbaHitSlot = {id:"wildcard",label:"Wild Card"};
  if(formatId==="one-from-each")return [
    {id:"guard",label:"Guard",role:"G"},{id:"forward",label:"Forward",role:"F"},
    {id:"center",label:"Center",role:"C"},wildcard,
    ...(count===5?[{id:"wildcard-two",label:"Wild Card"}]:[]),
  ];
  const values=pool.map(s=>nbaHitValue(s,statId)).sort((a,b)=>a-b);
  const top=values[Math.floor(values.length*.66)]!;
  return [{id:"star",label:"Stat Star",threshold:top},
    {id:"backcourt",label:"Backcourt",role:"G"},
    {id:"frontcourt",label:"Frontcourt",frontcourt:true},
    wildcard,...(count===5?[{id:"wildcard-two",label:"Wild Card"}]:[])];
}
export function nbaHitSelectionSatisfies(plan:NbaHitPlan,ids:readonly string[]) {
  if(ids.length!==plan.pickCount || new Set(ids).size!==ids.length)return false;
  if(ids.some(id=>!plan.subjectIds.includes(id)))return false;
  return plan.slots.every((slot,i)=>{
    const subject=nbaHitSubjectById.get(ids[i]!);
    return subject!=null && nbaHitSlotAccepts(slot,subject,plan.statId);
  });
}
export function nbaHitAvailableSubjectIds(plan:NbaHitPlan,ids:readonly string[]) {
  if(ids.length>=plan.pickCount)return [];
  if(!plan.slots.length)return plan.subjectIds.filter(id=>!ids.includes(id));
  const slot=plan.slots[ids.length]!;
  return plan.subjectIds.filter(id=>{
    if(ids.includes(id)||!nbaHitSlotAccepts(slot,nbaHitSubjectById.get(id)!,plan.statId))return false;
    const unavailable=new Set([...ids,id]);
    const future=plan.slots.slice(ids.length+1);
    const canComplete=(index:number):boolean=>{
      if(index===future.length)return true;
      for(const other of plan.subjectIds) {
        if(unavailable.has(other)||!nbaHitSlotAccepts(future[index]!,nbaHitSubjectById.get(other)!,plan.statId))continue;
        unavailable.add(other);
        if(canComplete(index+1))return true;
        unavailable.delete(other);
      }
      return false;
    };
    return canComplete(0);
  });
}
export function nbaHitResult(plan:NbaHitPlan,ids:readonly string[]):NbaHitResult {
  if(!nbaHitSelectionSatisfies(plan,ids))throw new Error("NBA Hit the Number requires legal four/five distinct selections.");
  const selections=ids.map(subjectId=>({subjectId,value:nbaHitValue(nbaHitSubjectById.get(subjectId)!,plan.statId)}));
  const total=Math.round(selections.reduce((s,x)=>s+x.value*10,0))/10;
  const distance=Math.round(Math.abs(plan.target-total)*10)/10;
  const status=total===plan.target?"perfect":total>plan.target?"bust":"under";
  return {target:plan.target,total,distance,status,
    score:hitTheNumberScore({status,target:plan.target,distance,pickCount:plan.pickCount}),selections};
}
function combinationTotals(pool:readonly NbaHitSubject[],statId:NbaHitStat,count:4|5,
  slots:readonly NbaHitSlot[]) {
  const totals:number[]=[];
  function validAssignment(selected:readonly NbaHitSubject[]):boolean {
    if(!slots.length)return true;
    const taken=new Set<number>();
    const assign=(index:number):boolean=>{
      if(index===slots.length)return true;
      for(let j=0;j<selected.length;j++){
        if(taken.has(j)||!nbaHitSlotAccepts(slots[index]!,selected[j]!,statId))continue;
        taken.add(j);
        if(assign(index+1))return true;
        taken.delete(j);
      }
      return false;
    };
    return assign(0);
  }
  function select(start:number,selection:NbaHitSubject[],sum:number){
    if(selection.length===count){
      if(validAssignment(selection))totals.push(sum);
      return;
    }
    for(let i=start;i<=pool.length-(count-selection.length);i++){
      const subject=pool[i]!;
      selection.push(subject);
      select(i+1,selection,sum+Math.round(nbaHitValue(subject,statId)*10));
      selection.pop();
    }
  }
  select(0,[],0);
  return totals.sort((a,b)=>a-b);
}
function boardQuality(totals:readonly number[],targetTenths:number,count:4|5):NbaHitQuality {
  let underCount=0,bustCount=0,goodUnderCount=0,midCount=0,badUnderCount=0,meaningfulBustCount=0;
  for(const total of totals){
    if(total===targetTenths)continue;
    const status=total<targetTenths?"under":"bust";
    if(status==="under")underCount++;else bustCount++;
    const score=hitTheNumberBoardQualityScore({status,target:targetTenths/10,
      distance:Math.abs(total-targetTenths)/10,pickCount:count});
    if(status==="under"&&score>=90)goodUnderCount++;
    if(status==="under"&&score<=75)badUnderCount++;
    if(score>=50 && score<=85)midCount++;
    if(status==="bust"&&score<=40)meaningfulBustCount++;
  }
  const legalCount=totals.length;
  const ratio=legalCount?underCount/legalCount:0;
  return {passes:legalCount>=35 && goodUnderCount>=4 && badUnderCount>=4
    && midCount>=5 && meaningfulBustCount>=4 && ratio>=.3 && ratio<=.7,
    legalCount,goodUnderCount,underCount,bustCount,midCount,badUnderCount,meaningfulBustCount};
}
export function nbaHitBoardQuality(plan:NbaHitPlan) {
  const pool=plan.subjectIds.map(id=>nbaHitSubjectById.get(id)!);
  return boardQuality(combinationTotals(pool,plan.statId,plan.pickCount,plan.slots),
    Math.round(plan.target*10),plan.pickCount);
}
function themeCandidates(subjects:readonly NbaHitSubject[],statId:NbaHitStat):readonly {label:string;subjects:readonly NbaHitSubject[]}[] {
  const key=statId.split("-")[1] as "points"|"assists"|"rebounds";
  const threshold=key==="points"?17:key==="assists"?4:key==="rebounds"?6:0;
  const subsets=[{label:"NBA Greats",subjects},
    {label:key==="points"?"Scoring Stars":key==="assists"?"Elite Playmakers":"Rebounding Machines",
      subjects:subjects.filter(s=>nbaHitValue(s,statId)>=threshold)},
    {label:"Guards",subjects:subjects.filter(s=>s.role==="G")},
    {label:"Frontcourt",subjects:subjects.filter(s=>s.role==="F"||s.role==="C")},
  ];
  return subsets.filter(s=>s.subjects.length>=14);
}
function stratifiedPool(subjects:readonly NbaHitSubject[],statId:NbaHitStat,size:number,rand:()=>number) {
  const sorted=[...subjects].sort((a,b)=>nbaHitValue(a,statId)-nbaHitValue(b,statId));
  const n=sorted.length,segments=[sorted.slice(0,Math.ceil(n/3)),
    sorted.slice(Math.ceil(n/3),Math.ceil(n*2/3)),sorted.slice(Math.ceil(n*2/3))];
  const targets=size===12?[4,4,4]:[5,4,5];
  const chosen=segments.flatMap((segment,i)=>shuffleLineup(segment,rand).slice(0,targets[i]));
  if(chosen.length<size)chosen.push(...shuffleLineup(sorted.filter(x=>!chosen.includes(x)),rand).slice(0,size-chosen.length));
  return shuffleLineup(chosen,rand);
}
export function createNbaHitTheNumberPlan(seed:string):NbaHitPlan {
  const rand=seededLineupRandom("nba-hit-the-number",NBA_HIT_THE_NUMBER_VERSION,seed);
  // Pick the same format/pick count once; rerolls must never alter the 85/15 mix.
  const count=chooseWeighted(NBA_HIT_PICK_WEIGHTS,rand).valueOf() as 4|5;
  const formatId=chooseWeighted(NBA_HIT_FORMAT_WEIGHTS,rand);
  const metric=chooseWeighted(NBA_HIT_STAT_CATALOG.map(x=>({value:x,weight:1})),rand);
  const year=metric.scope==="career"?null:(rand()<.65?2025:2026);
  const candidates=nbaHitSubjectsFor(metric.id,year??undefined);
  const themes=themeCandidates(candidates,metric.id);
  const names=shuffleLineup(themes,rand);
  for(let attempt=0;attempt<160;attempt++){
    const theme=formatId==="classic"?themes[0]!:(names[attempt%names.length]??themes[0]!);
    if(theme.subjects.length<nbaHitPoolSize(count))continue;
    const pool=stratifiedPool(theme.subjects,metric.id,nbaHitPoolSize(count),rand);
    const slots=slotsFor(formatId,count,pool,metric.id);
    const totals=combinationTotals(pool,metric.id,count,slots);
    if(totals.length<35)continue;
    const q=Math.max(0,Math.min(totals.length-1,Math.floor(totals.length*(.44+rand()*.12))));
    const targetTenths=totals[q]!;
    const quality=boardQuality(totals,targetTenths,count);
    if(!quality.passes)continue;
    return {seed,version:NBA_HIT_THE_NUMBER_VERSION,boardType:"random-pool",
      statId:metric.id,metricLabel:metric.label,formatId,
      configurationLabel:formatId==="classic"?"Classic":formatId==="themed-lineup"?theme.label
        :formatId==="one-from-each"?"One From Each":"Build the Team",
      season:year,pickCount:count,target:targetTenths/10,
      subjectIds:pool.map(s=>s.id),slots};
  }
  throw new Error("NBA Hit the Number could not generate a balanced playable board.");
}
export function createNbaHitTheNumberRun(seed=createReplaySeed(NBA_HIT_THE_NUMBER_GAME_ID)):NbaHitRun {
  const plan=createNbaHitTheNumberPlan(seed);
  const identity=replayLineupIdentity(NBA_HIT_THE_NUMBER_GAME_ID,seed);
  rememberLineup(identity,plan.subjectIds);
  return {plan,identity};
}
export function formatNbaHitNumber(value:number) {return value.toFixed(1);}
export const nbaHitStatCount=NBA_HIT_STAT_CATALOG.length;
export const nbaHitSubjectCount=nbaHitSubjects.length;
