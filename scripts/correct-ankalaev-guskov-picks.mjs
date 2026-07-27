import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const base=String(process.env.V2_SUPABASE_URL||'').replace(/\/$/,'');
const key=String(process.env.V2_SERVICE_ROLE_KEY||'');
const reportPath=String(process.env.CORRECTION_REPORT||'/tmp/ankalaev-guskov-pick-correction.json');
const eventId='ufc-fight-night-ankalaev-guskov-2026-07-25';
if(!base||!key)throw new Error('V2 Supabase credentials are required.');
const headers={apikey:key,authorization:`Bearer ${key}`,accept:'application/json'};
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

async function request(url,options={},label='request'){
  const response=await fetch(url,options);
  const text=await response.text();
  let body;
  try{body=text?JSON.parse(text):null}catch{body=text}
  if(!response.ok){
    const detail=typeof body==='string'?body.slice(0,500):JSON.stringify(body).slice(0,500);
    throw new Error(`${label} failed (${response.status}): ${detail}`);
  }
  return body;
}
async function rows(table,params,label=table){
  const url=new URL(`${base}/rest/v1/${table}`);
  for(const [name,value] of Object.entries(params))url.searchParams.set(name,String(value));
  const body=await request(url,{headers:{...headers,Range:'0-999','Range-Unit':'items'}},label);
  if(!Array.isArray(body))throw new Error(`${label} did not return rows.`);
  return body;
}
async function mutate(method,table,params,body,label){
  const url=new URL(`${base}/rest/v1/${table}`);
  for(const [name,value] of Object.entries(params||{}))url.searchParams.set(name,String(value));
  return request(url,{method,headers:{...headers,'content-type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)},label);
}

const expectedResults={
  'ankalaev-guskov':{status:'red_win',winner:'magomed-ankalaev'},
  'erceg-temirov':{status:'blue_win',winner:'ramazan-temirov'},
  'dulatov-turman':{status:'cancelled',winner:null},
  'zaynukov-rzepecki':{status:'red_win',winner:'magomed-zaynukov'},
  'kuniev-fortune':{status:'red_win',winner:'rizvan-kuniev'},
  'izagakhmaev-vagaev':{status:'blue_win',winner:'abubakar-vagaev'},
};
const expectedPicks={
  CODY:{
    'izagakhmaev-vagaev':'abubakar-vagaev',
    'zaynukov-rzepecki':'damian-rzepecki',
    'dulatov-turman':'islam-dulatov',
    'kuniev-fortune':'rizvan-kuniev',
    'erceg-temirov':'steve-erceg',
    'ankalaev-guskov':'magomed-ankalaev',
  },
  SHANE:{
    'izagakhmaev-vagaev':'saygid-izagakhmaev',
    'zaynukov-rzepecki':'magomed-zaynukov',
    'dulatov-turman':'islam-dulatov',
    'kuniev-fortune':'rizvan-kuniev',
    'erceg-temirov':'steve-erceg',
    'ankalaev-guskov':'magomed-ankalaev',
  },
};

async function snapshot(){
  const [events,bouts,profiles,picks,locks,active]=await Promise.all([
    rows('pick_events',{select:'event_id,name,subtitle,status,starts_at,locks_at,completed_at,season',event_id:`eq.${eventId}`},'read completed event'),
    rows('pick_bouts',{select:'event_id,bout_id,position,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,result_status,winner_fighter_slug,result_recorded_at',event_id:`eq.${eventId}`,order:'position.asc'},'read completed bouts'),
    rows('profiles',{select:'id,display_name,normalized_name',normalized_name:'in.(CODY,SHANE)',order:'normalized_name.asc'},'read Cody and Shane'),
    rows('profile_event_picks',{select:'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at',event_id:`eq.${eventId}`,order:'profile_id.asc,bout_id.asc'},'read event picks'),
    rows('profile_event_underdog_locks',{select:'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at',event_id:`eq.${eventId}`,order:'profile_id.asc'},'read event locks'),
    rows('pick_events',{select:'event_id,status',status:'in.(upcoming,locked)'},'read active events'),
  ]);
  if(events.length!==1||events[0].status!=='complete'||!events[0].completed_at)throw new Error('Target event is not complete.');
  if(bouts.length!==6)throw new Error(`Expected six bouts, found ${bouts.length}.`);
  const boutIds=bouts.map(row=>row.bout_id).sort();
  if(JSON.stringify(boutIds)!==JSON.stringify(Object.keys(expectedResults).sort()))throw new Error(`Unexpected bout set: ${JSON.stringify(boutIds)}`);
  for(const bout of bouts){
    const expected=expectedResults[bout.bout_id];
    if(bout.result_status!==expected.status||bout.winner_fighter_slug!==expected.winner||!bout.result_recorded_at)throw new Error(`Official result changed for ${bout.bout_id}.`);
  }
  if(profiles.length!==2||profiles.map(row=>row.normalized_name).sort().join(',')!=='CODY,SHANE')throw new Error('Cody and Shane profiles were not resolved exactly.');
  if(picks.length!==12)throw new Error(`Expected twelve existing picks, found ${picks.length}.`);
  if(active.length!==0)throw new Error(`Expected zero active events, found ${active.length}.`);
  return{event:events[0],bouts,profiles,picks,locks,active};
}
async function protectedHash(){
  return digest(await Promise.all([
    rows('pick_events',{select:'event_id,name,subtitle,status,starts_at,locks_at,completed_at,season',event_id:`neq.${eventId}`,order:'event_id.asc'}),
    rows('pick_bouts',{select:'event_id,bout_id,position,result_status,winner_fighter_slug,result_recorded_at',event_id:`neq.${eventId}`,order:'event_id.asc,bout_id.asc'}),
    rows('profile_event_picks',{select:'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at',event_id:`neq.${eventId}`,order:'event_id.asc,profile_id.asc,bout_id.asc'}),
    rows('profile_event_underdog_locks',{select:'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at',event_id:`neq.${eventId}`,order:'event_id.asc,profile_id.asc'}),
  ]));
}
function immutableTargetHash(state){
  return digest({event:state.event,bouts:state.bouts});
}
function desiredRows(state){
  const profileByName=new Map(state.profiles.map(row=>[row.normalized_name,row]));
  const picks=[];
  for(const [name,byBout] of Object.entries(expectedPicks)){
    const profile=profileByName.get(name);
    if(!profile)throw new Error(`Missing profile ${name}.`);
    for(const [boutId,fighterSlug] of Object.entries(byBout))picks.push({profile_id:profile.id,event_id:eventId,bout_id:boutId,fighter_slug:fighterSlug,member:name});
  }
  const cody=profileByName.get('CODY');
  const codyPick=state.picks.find(row=>row.profile_id===cody.id&&row.bout_id==='zaynukov-rzepecki');
  if(!codyPick)throw new Error('Cody Rzepecki pick row is missing.');
  const lock={profile_id:cody.id,event_id:eventId,bout_id:'zaynukov-rzepecki',fighter_slug:'damian-rzepecki',selected_at:codyPick.picked_at,frozen_american_odds:212,frozen_at:state.event.locks_at,member:'CODY'};
  return{picks,lock};
}
function exactLock(current,desired){
  return current.length===1&&['profile_id','event_id','bout_id','fighter_slug','frozen_american_odds','frozen_at'].every(key=>String(current[0][key])===String(desired[key]));
}
async function applyOnce(label){
  const before=await snapshot();
  const desired=desiredRows(before);
  const currentByKey=new Map(before.picks.map(row=>[`${row.profile_id}|${row.bout_id}`,row]));
  let updatedPicks=0;
  for(const row of desired.picks){
    const current=currentByKey.get(`${row.profile_id}|${row.bout_id}`);
    if(!current)throw new Error(`Missing existing pick row for ${row.member}/${row.bout_id}.`);
    if(current.fighter_slug===row.fighter_slug)continue;
    const changed=await mutate('PATCH','profile_event_picks',{profile_id:`eq.${row.profile_id}`,event_id:`eq.${eventId}`,bout_id:`eq.${row.bout_id}`},{fighter_slug:row.fighter_slug,updated_at:new Date().toISOString()},`${label}: update ${row.member} ${row.bout_id}`);
    if(!Array.isArray(changed)||changed.length!==1)throw new Error(`Pick update did not affect exactly one row for ${row.member}/${row.bout_id}.`);
    updatedPicks+=1;
  }
  const refreshed=await snapshot();
  const refreshedDesired=desiredRows(refreshed);
  let replacedLocks=0;
  if(!exactLock(refreshed.locks,refreshedDesired.lock)){
    await mutate('DELETE','profile_event_underdog_locks',{event_id:`eq.${eventId}`},undefined,`${label}: clear incorrect locks`);
    const {member,...insert}=refreshedDesired.lock;
    const created=await mutate('POST','profile_event_underdog_locks',{},[insert],`${label}: restore Cody lock`);
    if(!Array.isArray(created)||created.length!==1)throw new Error('Cody lock insert did not affect exactly one row.');
    replacedLocks=1;
  }
  return{updatedPicks,replacedLocks};
}
function verifyFinal(state){
  const desired=desiredRows(state);
  const actual=new Map(state.picks.map(row=>[`${row.profile_id}|${row.bout_id}`,row.fighter_slug]));
  for(const row of desired.picks){
    if(actual.get(`${row.profile_id}|${row.bout_id}`)!==row.fighter_slug)throw new Error(`Final pick mismatch for ${row.member}/${row.bout_id}.`);
  }
  if(!exactLock(state.locks,desired.lock))throw new Error('Final Underdog Lock does not match Cody on Damian Rzepecki at +212.');
  const profileName=new Map(state.profiles.map(row=>[row.id,row.normalized_name]));
  const boutById=new Map(state.bouts.map(row=>[row.bout_id,row]));
  const scores={};
  for(const profile of state.profiles){
    let correct=0,incorrect=0,excluded=0,basePoints=0,lockBonus=0;
    for(const bout of state.bouts){
      if(['cancelled','draw','no_contest'].includes(bout.result_status)){excluded+=1;continue;}
      const pick=state.picks.find(row=>row.profile_id===profile.id&&row.bout_id===bout.bout_id);
      if(!pick)throw new Error(`Missing final pick for ${profile.normalized_name}/${bout.bout_id}.`);
      if(pick.fighter_slug===bout.winner_fighter_slug){correct+=1;basePoints+=4;}else incorrect+=1;
    }
    const lock=state.locks.find(row=>row.profile_id===profile.id);
    if(lock){
      const bout=boutById.get(lock.bout_id);
      if(lock.fighter_slug===bout?.winner_fighter_slug)lockBonus=Math.min(7,Math.floor((Number(lock.frozen_american_odds)-100)/50)+1);
    }
    scores[profileName.get(profile.id)]={correct,incorrect,excluded,basePoints,lockBonus,totalPoints:basePoints+lockBonus};
  }
  const expected={correct:3,incorrect:2,excluded:1,basePoints:12,lockBonus:0,totalPoints:12};
  for(const name of ['CODY','SHANE'])if(JSON.stringify(scores[name])!==JSON.stringify(expected))throw new Error(`${name} score mismatch: ${JSON.stringify(scores[name])}`);
  return{scores,finalPicks:state.picks.map(row=>({member:profileName.get(row.profile_id),boutId:row.bout_id,fighterSlug:row.fighter_slug})).sort((a,b)=>a.member.localeCompare(b.member)||a.boutId.localeCompare(b.boutId)),finalLock:{member:'CODY',boutId:'zaynukov-rzepecki',fighterSlug:'damian-rzepecki',frozenAmericanOdds:212}};
}

const initial=await snapshot();
const protectedBefore=await protectedHash();
const immutableBefore=immutableTargetHash(initial);
const first=await applyOnce('first pass');
const afterFirst=await snapshot();
if(await protectedHash()!==protectedBefore)throw new Error('Unrelated V2 data changed during correction.');
if(immutableTargetHash(afterFirst)!==immutableBefore)throw new Error('Official event or result data changed during correction.');
const second=await applyOnce('second pass');
if(second.updatedPicks||second.replacedLocks)throw new Error(`Second pass was not idempotent: ${JSON.stringify(second)}`);
const final=await snapshot();
if(await protectedHash()!==protectedBefore)throw new Error('Unrelated V2 data changed on second pass.');
if(immutableTargetHash(final)!==immutableBefore)throw new Error('Official event or result data changed on second pass.');
const proof=verifyFinal(final);
const report={schemaVersion:1,operation:'correct-ankalaev-guskov-picks-from-user-evidence',generatedAt:new Date().toISOString(),eventId,evidenceInterpretation:{cody:['Abubakar Vagaev','Damian Rzepecki','Islam Dulatov','Rizvan Kuniev','Steve Erceg','Magomed Ankalaev'],codyUnderdogLock:{fighter:'Damian Rzepecki',americanOdds:212},shaneRule:'Opposite fighter in the first two displayed bouts; same fighter in the remaining four.',shane:['Saygid Izagakhmaev','Magomed Zaynukov','Islam Dulatov','Rizvan Kuniev','Steve Erceg','Magomed Ankalaev']},firstPass:first,secondPass:second,safety:{officialResultsChanged:false,eventStatusChanged:false,unrelatedRowsChanged:false,activeEvents:final.active.length,protectedHash:protectedBefore,immutableTargetHash:immutableBefore},...proof};
await writeFile(reportPath,JSON.stringify(report,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({status:'corrected',firstPass:first,secondPass:second,scores:proof.scores,finalLock:proof.finalLock,activeEvents:final.active.length}));
