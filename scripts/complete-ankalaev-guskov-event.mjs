import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const base=String(process.env.V2_SUPABASE_URL||'').replace(/\/$/,'');
const key=String(process.env.V2_SERVICE_ROLE_KEY||'');
const reportPath=String(process.env.COMPLETION_REPORT||'/tmp/ankalaev-guskov-completion.json');
const eventId='ufc-fight-night-ankalaev-guskov-2026-07-25';
if(!base||!key)throw new Error('V2 Supabase credentials are required.');
const headers={apikey:key,authorization:`Bearer ${key}`};

const expectedPicks={
  CODY:{
    'ankalaev-guskov':'magomed-ankalaev',
    'dulatov-turman':'islam-dulatov',
    'erceg-temirov':'steve-erceg',
    'izagakhmaev-vagaev':'abubakar-vagaev',
    'kuniev-fortune':'rizvan-kuniev',
    'zaynukov-rzepecki':'magomed-zaynukov'
  },
  SHANE:{
    'ankalaev-guskov':'magomed-ankalaev',
    'dulatov-turman':'islam-dulatov',
    'erceg-temirov':'steve-erceg',
    'izagakhmaev-vagaev':'saygid-izagakhmaev',
    'kuniev-fortune':'rizvan-kuniev',
    'zaynukov-rzepecki':'magomed-zaynukov'
  }
};
const expectedLock={member:'SHANE',boutId:'izagakhmaev-vagaev',fighterSlug:'saygid-izagakhmaev',odds:195};
const officialResults={
  'ankalaev-guskov':{winner:'magomed-ankalaev'},
  'erceg-temirov':{winner:'ramazan-temirov'},
  'dulatov-turman':{status:'cancelled'},
  'zaynukov-rzepecki':{winner:'magomed-zaynukov'},
  'kuniev-fortune':{winner:'rizvan-kuniev'},
  'izagakhmaev-vagaev':{winner:'abubakar-vagaev'}
};
const expectedScores={
  CODY:{correct:4,incorrect:1,excluded:1,basePoints:16,lockBonus:0,totalPoints:16},
  SHANE:{correct:3,incorrect:2,excluded:1,basePoints:12,lockBonus:0,totalPoints:12}
};

const stable=value=>Array.isArray(value)?value.map(stable).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const hash=value=>createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const norm=value=>String(value||'').trim().toUpperCase();

async function request(url,options={},label='request'){
  const response=await fetch(url,options);
  const text=await response.text();
  let body;
  try{body=text?JSON.parse(text):null}catch{body=text}
  if(!response.ok)throw new Error(`${label} failed (${response.status}): ${typeof body==='string'?body.slice(0,500):JSON.stringify(body).slice(0,500)}`);
  return body;
}
async function rows(table,params,label=table){
  const url=new URL(`${base}/rest/v1/${table}`);
  for(const [name,value] of Object.entries(params))url.searchParams.set(name,String(value));
  const body=await request(url,{headers:{...headers,Range:'0-999','Range-Unit':'items'}},label);
  if(!Array.isArray(body))throw new Error(`${label} did not return rows.`);
  return body;
}
async function rpc(name,body,label=name){
  return request(`${base}/rest/v1/rpc/${name}`,{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify(body)},label);
}

async function loadState(){
  const [events,bouts,profiles,picks,locks]=await Promise.all([
    rows('pick_events',{select:'event_id,name,subtitle,status,starts_at,locks_at,season,completed_at',event_id:`eq.${eventId}`},'read target event'),
    rows('pick_bouts',{select:'event_id,bout_id,position,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,result_status,winner_fighter_slug,result_recorded_at',event_id:`eq.${eventId}`,order:'position.asc'},'read target bouts'),
    rows('profiles',{select:'id,display_name,normalized_name',normalized_name:'in.(CODY,SHANE)',order:'normalized_name.asc'},'read Cody and Shane profiles'),
    rows('profile_event_picks',{select:'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at',event_id:`eq.${eventId}`,order:'profile_id.asc,bout_id.asc'},'read target picks'),
    rows('profile_event_underdog_locks',{select:'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at',event_id:`eq.${eventId}`,order:'profile_id.asc'},'read target locks')
  ]);
  if(events.length!==1)throw new Error(`Expected one target event; found ${events.length}.`);
  if(bouts.length!==6)throw new Error(`Expected six target bouts; found ${bouts.length}.`);
  if(profiles.length!==2||new Set(profiles.map(p=>norm(p.normalized_name))).size!==2)throw new Error('Cody and Shane profiles were not resolved exactly.');
  return{event:events[0],bouts,profiles,picks,locks};
}

function verifyEntrants(state){
  const profileById=new Map(state.profiles.map(p=>[p.id,norm(p.normalized_name)]));
  if(state.picks.length!==12)throw new Error(`Expected 12 final picks; found ${state.picks.length}.`);
  const seen=new Set();
  for(const pick of state.picks){
    const member=profileById.get(pick.profile_id);
    if(!member||!expectedPicks[member])throw new Error('Unexpected entrant exists on the target event.');
    const expected=expectedPicks[member][pick.bout_id];
    if(!expected||pick.fighter_slug!==expected)throw new Error(`Unexpected final pick for ${member}/${pick.bout_id}.`);
    seen.add(`${member}|${pick.bout_id}`);
  }
  for(const [member,memberPicks] of Object.entries(expectedPicks))for(const boutId of Object.keys(memberPicks))if(!seen.has(`${member}|${boutId}`))throw new Error(`Missing final pick for ${member}/${boutId}.`);
  if(state.locks.length!==1)throw new Error(`Expected one valid final lock; found ${state.locks.length}.`);
  const lock=state.locks[0],member=profileById.get(lock.profile_id);
  if(member!==expectedLock.member||lock.bout_id!==expectedLock.boutId||lock.fighter_slug!==expectedLock.fighterSlug||Number(lock.frozen_american_odds)!==expectedLock.odds||!lock.frozen_at)throw new Error('Final Underdog Lock does not match the recovered proof.');
}

function expectedStatus(bout,result){
  if(result.status)return result.status;
  if(result.winner===bout.red_fighter_slug)return 'red_win';
  if(result.winner===bout.blue_fighter_slug)return 'blue_win';
  throw new Error(`Official winner is not a fighter in ${bout.bout_id}.`);
}

async function protectedSnapshot(){
  const [events,bouts,picks,locks,targetPicks,targetLocks]=await Promise.all([
    rows('pick_events',{select:'event_id,name,subtitle,status,starts_at,locks_at,season,completed_at',event_id:`neq.${eventId}`,order:'event_id.asc'},'snapshot unrelated events'),
    rows('pick_bouts',{select:'event_id,bout_id,position,result_status,winner_fighter_slug,result_recorded_at',event_id:`neq.${eventId}`,order:'event_id.asc,bout_id.asc'},'snapshot unrelated bouts'),
    rows('profile_event_picks',{select:'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at',event_id:`neq.${eventId}`,order:'event_id.asc,profile_id.asc,bout_id.asc'},'snapshot unrelated picks'),
    rows('profile_event_underdog_locks',{select:'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at',event_id:`neq.${eventId}`,order:'event_id.asc,profile_id.asc'},'snapshot unrelated locks'),
    rows('profile_event_picks',{select:'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at',event_id:`eq.${eventId}`,order:'profile_id.asc,bout_id.asc'},'snapshot target picks'),
    rows('profile_event_underdog_locks',{select:'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at',event_id:`eq.${eventId}`,order:'profile_id.asc'},'snapshot target locks')
  ]);
  return{unrelatedHash:hash({events,bouts,picks,locks}),targetSelectionsHash:hash({targetPicks,targetLocks})};
}

async function applyCompletion(){
  let state=await loadState();
  verifyEntrants(state);
  let mutations=0;
  if(state.event.status==='upcoming'){
    await rpc('transition_pick_event',{p_event_id:eventId,p_target_status:'locked'},'lock target event');
    mutations+=1;
    state=await loadState();
  }
  if(!['locked','complete'].includes(state.event.status))throw new Error(`Unexpected target event status ${state.event.status}.`);
  const boutById=new Map(state.bouts.map(b=>[b.bout_id,b]));
  if(new Set([...Object.keys(officialResults),...state.bouts.map(b=>b.bout_id)]).size!==6)throw new Error('Target bout membership does not match the official result set.');
  if(state.event.status!=='complete'){
    for(const [boutId,result] of Object.entries(officialResults)){
      const bout=boutById.get(boutId);
      if(!bout)throw new Error(`Missing target bout ${boutId}.`);
      const status=expectedStatus(bout,result);
      if(bout.result_status==='pending'){
        await rpc('record_official_pick_bout_result',{p_event_id:eventId,p_bout_id:boutId,p_result_status:status},`record ${boutId}`);
        mutations+=1;
      }else if(bout.result_status!==status){
        throw new Error(`Conflicting existing result for ${boutId}.`);
      }
    }
    await rpc('transition_pick_event',{p_event_id:eventId,p_target_status:'complete'},'complete target event');
    mutations+=1;
  }
  return{mutations,state:await loadState()};
}

function bonus(odds){
  if(!Number.isInteger(Number(odds))||Number(odds)<100)return 0;
  return Math.min(7,Math.floor((Number(odds)-100)/50)+1);
}
function score(state){
  const profileById=new Map(state.profiles.map(p=>[p.id,norm(p.normalized_name)]));
  const boutById=new Map(state.bouts.map(b=>[b.bout_id,b]));
  const lockByProfile=new Map(state.locks.map(l=>[l.profile_id,l]));
  const scores={};
  for(const profile of state.profiles){
    const member=profileById.get(profile.id);
    const memberPicks=state.picks.filter(p=>p.profile_id===profile.id);
    let correct=0,incorrect=0,excluded=0;
    for(const pick of memberPicks){
      const bout=boutById.get(pick.bout_id);
      if(['draw','no_contest','cancelled'].includes(bout.result_status)){excluded+=1;continue;}
      if(!['red_win','blue_win'].includes(bout.result_status))throw new Error(`Unresolved bout remains for ${member}.`);
      if(pick.fighter_slug===bout.winner_fighter_slug)correct+=1;else incorrect+=1;
    }
    const lock=lockByProfile.get(profile.id);
    const lockBout=lock?boutById.get(lock.bout_id):null;
    const lockBonus=lock&&lockBout&&lock.fighter_slug===lockBout.winner_fighter_slug?bonus(Number(lock.frozen_american_odds)):0;
    const result={correct,incorrect,excluded,basePoints:correct*4,lockBonus,totalPoints:correct*4+lockBonus};
    if(JSON.stringify(result)!==JSON.stringify(expectedScores[member]))throw new Error(`Unexpected score for ${member}: ${JSON.stringify(result)}.`);
    scores[member]=result;
  }
  return scores;
}
function verifyCompleted(state){
  if(state.event.status!=='complete'||!state.event.completed_at)throw new Error('Target event is not complete.');
  for(const bout of state.bouts){
    const expected=expectedStatus(bout,officialResults[bout.bout_id]);
    if(bout.result_status!==expected||!bout.result_recorded_at)throw new Error(`Final result verification failed for ${bout.bout_id}.`);
    if(expected==='red_win'&&bout.winner_fighter_slug!==bout.red_fighter_slug)throw new Error(`Red winner mismatch for ${bout.bout_id}.`);
    if(expected==='blue_win'&&bout.winner_fighter_slug!==bout.blue_fighter_slug)throw new Error(`Blue winner mismatch for ${bout.bout_id}.`);
    if(expected==='cancelled'&&bout.winner_fighter_slug!==null)throw new Error(`Cancelled bout has a winner for ${bout.bout_id}.`);
  }
}

const before=await protectedSnapshot();
const first=await applyCompletion();
verifyEntrants(first.state);
verifyCompleted(first.state);
const scores=score(first.state);
const afterFirst=await protectedSnapshot();
if(before.unrelatedHash!==afterFirst.unrelatedHash||before.targetSelectionsHash!==afterFirst.targetSelectionsHash)throw new Error('Completion changed protected data or recovered selections.');
const second=await applyCompletion();
verifyCompleted(second.state);
if(second.mutations!==0)throw new Error('Second completion pass was not idempotent.');
const afterSecond=await protectedSnapshot();
if(before.unrelatedHash!==afterSecond.unrelatedHash||before.targetSelectionsHash!==afterSecond.targetSelectionsHash)throw new Error('Idempotency pass changed protected data.');
const active=await rows('pick_events',{select:'event_id,status',status:'in.(upcoming,locked)'},'verify active event count');
if(active.length!==0)throw new Error(`Expected zero active events after completion; found ${active.length}.`);

const report={schemaVersion:1,operation:'complete-ankalaev-guskov-event',eventId,generatedAt:new Date().toISOString(),firstPassMutations:first.mutations,secondPassMutations:second.mutations,results:first.state.bouts.map(b=>({boutId:b.bout_id,resultStatus:b.result_status,winnerFighterSlug:b.winner_fighter_slug})),scores,activeEventsAfter:active.length,safety:{unrelatedHash:before.unrelatedHash,targetSelectionsHash:before.targetSelectionsHash,recoveredSelectionsChanged:false,unrelatedRowsChanged:false}};
await writeFile(reportPath,JSON.stringify(report,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({status:'completed',firstPassMutations:first.mutations,secondPassMutations:second.mutations,scores,activeEventsAfter:active.length}));
