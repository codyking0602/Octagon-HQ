import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const base=String(process.env.V2_SUPABASE_URL||'').replace(/\/$/,'');
const key=String(process.env.V2_SERVICE_ROLE_KEY||'');
const report=String(process.env.CORRECTION_REPORT||'/tmp/ankalaev-guskov-pick-correction.json');
const eventId='ufc-fight-night-ankalaev-guskov-2026-07-25';
if(!base||!key)throw new Error('V2 Supabase credentials are required.');
const headers={apikey:key,authorization:`Bearer ${key}`};
const expected={
  CODY:{
    'izagakhmaev-vagaev':'abubakar-vagaev',
    'zaynukov-rzepecki':'damian-rzepecki',
    'dulatov-turman':'islam-dulatov',
    'kuniev-fortune':'rizvan-kuniev',
    'erceg-temirov':'steve-erceg',
    'ankalaev-guskov':'magomed-ankalaev'
  },
  SHANE:{
    'izagakhmaev-vagaev':'saygid-izagakhmaev',
    'zaynukov-rzepecki':'magomed-zaynukov',
    'dulatov-turman':'islam-dulatov',
    'kuniev-fortune':'rizvan-kuniev',
    'erceg-temirov':'steve-erceg',
    'ankalaev-guskov':'magomed-ankalaev'
  }
};
const winnerByBout={
  'izagakhmaev-vagaev':'abubakar-vagaev',
  'zaynukov-rzepecki':'magomed-zaynukov',
  'dulatov-turman':null,
  'kuniev-fortune':'rizvan-kuniev',
  'erceg-temirov':'ramazan-temirov',
  'ankalaev-guskov':'magomed-ankalaev'
};
const statusByBout={
  'izagakhmaev-vagaev':'blue_win',
  'zaynukov-rzepecki':'red_win',
  'dulatov-turman':'cancelled',
  'kuniev-fortune':'red_win',
  'erceg-temirov':'blue_win',
  'ankalaev-guskov':'red_win'
};
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function req(url,opt={},label='request'){
  const r=await fetch(url,opt), text=await r.text(); let body;
  try{body=text?JSON.parse(text):null}catch{body=text}
  if(!r.ok)throw new Error(`${label} failed (${r.status}): ${typeof body==='string'?body.slice(0,500):JSON.stringify(body).slice(0,500)}`);
  return body;
}
async function rows(table,params,label=table){
  const u=new URL(`${base}/rest/v1/${table}`); for(const[k,v]of Object.entries(params))u.searchParams.set(k,String(v));
  const body=await req(u,{headers},label); if(!Array.isArray(body))throw new Error(`${label} did not return rows.`); return body;
}
async function patch(table,params,body,label){
  const u=new URL(`${base}/rest/v1/${table}`); for(const[k,v]of Object.entries(params))u.searchParams.set(k,String(v));
  return req(u,{method:'PATCH',headers:{...headers,'content-type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)},label);
}
async function del(table,params,label){
  const u=new URL(`${base}/rest/v1/${table}`); for(const[k,v]of Object.entries(params))u.searchParams.set(k,String(v));
  return req(u,{method:'DELETE',headers:{...headers,Prefer:'return=representation'}},label);
}
async function post(table,body,label){
  return req(`${base}/rest/v1/${table}`,{method:'POST',headers:{...headers,'content-type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)},label);
}
async function snapshot(){
  const [event,bouts,profiles,picks,locks,otherEvents,otherBouts,otherPicks,otherLocks]=await Promise.all([
    rows('pick_events',{select:'event_id,status,locks_at,completed_at',event_id:`eq.${eventId}`}),
    rows('pick_bouts',{select:'bout_id,red_fighter_slug,blue_fighter_slug,result_status,winner_fighter_slug',event_id:`eq.${eventId}`,order:'position.asc'}),
    rows('profiles',{select:'id,normalized_name',normalized_name:'in.(CODY,SHANE)',order:'normalized_name.asc'}),
    rows('profile_event_picks',{select:'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at',event_id:`eq.${eventId}`,order:'profile_id.asc,bout_id.asc'}),
    rows('profile_event_underdog_locks',{select:'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at',event_id:`eq.${eventId}`,order:'profile_id.asc'}),
    rows('pick_events',{select:'event_id,status,completed_at',event_id:`neq.${eventId}`,order:'event_id.asc'}),
    rows('pick_bouts',{select:'event_id,bout_id,result_status,winner_fighter_slug',event_id:`neq.${eventId}`,order:'event_id.asc,bout_id.asc'}),
    rows('profile_event_picks',{select:'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at',event_id:`neq.${eventId}`,order:'event_id.asc,profile_id.asc,bout_id.asc'}),
    rows('profile_event_underdog_locks',{select:'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at',event_id:`neq.${eventId}`,order:'event_id.asc,profile_id.asc'})
  ]);
  return{event,bouts,profiles,picks,locks,protectedHash:digest([otherEvents,otherBouts,otherPicks,otherLocks])};
}
function verifyBase(s){
  if(s.event.length!==1||s.event[0].status!=='complete'||!s.event[0].completed_at)throw new Error('Target event is not complete.');
  if(s.bouts.length!==6||s.profiles.length!==2||s.picks.length!==12)throw new Error('Unexpected target row counts.');
  const names=s.profiles.map(x=>x.normalized_name).sort(); if(JSON.stringify(names)!==JSON.stringify(['CODY','SHANE']))throw new Error('Cody/Shane profiles not resolved exactly.');
  for(const b of s.bouts){if(statusByBout[b.bout_id]!==b.result_status||winnerByBout[b.bout_id]!==b.winner_fighter_slug)throw new Error(`Official result mismatch for ${b.bout_id}`)}
}
function score(s){
  const nameById=new Map(s.profiles.map(x=>[x.id,x.normalized_name]));
  const lockById=new Map(s.locks.map(x=>[x.profile_id,x]));
  const out={};
  for(const name of ['CODY','SHANE'])out[name]={correct:0,incorrect:0,excluded:0,basePoints:0,lockBonus:0,totalPoints:0};
  for(const pick of s.picks){
    const name=nameById.get(pick.profile_id); const status=statusByBout[pick.bout_id];
    if(status==='cancelled'){out[name].excluded++;continue}
    if(pick.fighter_slug===winnerByBout[pick.bout_id])out[name].correct++;else out[name].incorrect++;
  }
  for(const name of ['CODY','SHANE']){
    out[name].basePoints=out[name].correct*4;
    const profile=s.profiles.find(x=>x.normalized_name===name); const lock=lockById.get(profile.id);
    if(lock&&lock.fighter_slug===winnerByBout[lock.bout_id])out[name].lockBonus=Math.min(7,Math.floor((Number(lock.frozen_american_odds)-100)/50)+1);
    out[name].totalPoints=out[name].basePoints+out[name].lockBonus;
  }
  return out;
}
async function reconcile(label){
  const before=await snapshot(); verifyBase(before);
  const profileByName=new Map(before.profiles.map(x=>[x.normalized_name,x]));
  const mutations=[];
  for(const name of ['CODY','SHANE']){
    const pid=profileByName.get(name).id;
    for(const [boutId,fighterSlug] of Object.entries(expected[name])){
      const current=before.picks.find(x=>x.profile_id===pid&&x.bout_id===boutId);
      if(!current)throw new Error(`Missing ${name} pick for ${boutId}`);
      if(current.fighter_slug!==fighterSlug){await patch('profile_event_picks',{profile_id:`eq.${pid}`,event_id:`eq.${eventId}`,bout_id:`eq.${boutId}`},{fighter_slug:fighterSlug,updated_at:new Date().toISOString()},`${label} ${name} ${boutId}`);mutations.push({type:'pick',name,boutId,fighterSlug});}
    }
  }
  const afterPicks=await snapshot();
  const codyId=profileByName.get('CODY').id;
  const desiredLock={profile_id:codyId,event_id:eventId,bout_id:'zaynukov-rzepecki',fighter_slug:'damian-rzepecki',selected_at:afterPicks.event[0].locks_at,frozen_american_odds:212,frozen_at:afterPicks.event[0].locks_at};
  const currentLocks=afterPicks.locks;
  const lockExact=currentLocks.length===1&&currentLocks[0].profile_id===desiredLock.profile_id&&currentLocks[0].bout_id===desiredLock.bout_id&&currentLocks[0].fighter_slug===desiredLock.fighter_slug&&Number(currentLocks[0].frozen_american_odds)===212&&currentLocks[0].frozen_at;
  if(!lockExact){if(currentLocks.length)await del('profile_event_underdog_locks',{event_id:`eq.${eventId}`},`${label} clear target locks`);await post('profile_event_underdog_locks',desiredLock,`${label} restore Cody lock`);mutations.push({type:'lock',name:'CODY',boutId:'zaynukov-rzepecki',fighterSlug:'damian-rzepecki',odds:212});}
  const after=await snapshot(); verifyBase(after);
  if(before.protectedHash!==after.protectedHash)throw new Error('Unrelated V2 data changed.');
  const names=new Map(after.profiles.map(x=>[x.id,x.normalized_name]));
  for(const p of after.picks){const name=names.get(p.profile_id);if(expected[name]?.[p.bout_id]!==p.fighter_slug)throw new Error(`Final pick mismatch for ${name}/${p.bout_id}`)}
  if(after.locks.length!==1||after.locks[0].profile_id!==codyId||after.locks[0].bout_id!=='zaynukov-rzepecki'||after.locks[0].fighter_slug!=='damian-rzepecki'||Number(after.locks[0].frozen_american_odds)!==212)throw new Error('Final Cody lock mismatch.');
  const scores=score(after);
  for(const name of ['CODY','SHANE'])if(scores[name].correct!==3||scores[name].incorrect!==2||scores[name].excluded!==1||scores[name].totalPoints!==12)throw new Error(`Unexpected ${name} score ${JSON.stringify(scores[name])}`);
  return{mutations,scores,finalPicks:after.picks.map(p=>({name:names.get(p.profile_id),boutId:p.bout_id,fighterSlug:p.fighter_slug})).sort((a,b)=>a.name.localeCompare(b.name)||a.boutId.localeCompare(b.boutId)),finalLocks:after.locks,protectedHash:after.protectedHash};
}
const first=await reconcile('first pass');
const second=await reconcile('second pass');
if(second.mutations.length)throw new Error(`Second pass was not idempotent: ${JSON.stringify(second.mutations)}`);
const output={schemaVersion:1,operation:'correct-ankalaev-guskov-picks-from-screenshot-and-message',eventId,evidence:{cody:'Screenshot shows Vagaev, Rzepecki lock, Dulatov, Kuniev, Erceg, Ankalaev.',shane:'Text says he flipped the first two and kept the remaining four the same.'},first,second};
await writeFile(report,JSON.stringify(output,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({status:'corrected',mutations:first.mutations,scores:first.scores,secondPassMutations:second.mutations.length,protectedHash:first.protectedHash}));
