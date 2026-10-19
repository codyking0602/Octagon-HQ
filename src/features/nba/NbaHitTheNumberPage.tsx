import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, rememberLineup, curatedLineupIdentity } from "../play/lineupModel";
import { FootballHitTheNumberPresentation } from "../back-room/FootballHitTheNumberPresentation";
import { asChallengeJson, challengeRecord, challengeString, footballChallengeUrl } from "../back-room/footballChallengeRuntime";
import {
  createNbaHitTheNumberPlan, createNbaHitTheNumberRun, formatNbaHitNumber,
  nbaHitAvailableSubjectIds, nbaHitResult, nbaHitSelectionSatisfies,
  NBA_HIT_THE_NUMBER_GAME_ID, NBA_HIT_THE_NUMBER_VERSION,
  type NbaHitPlan, type NbaHitResult, type NbaHitRun,
} from "./nbaHitTheNumberModel";
import { nbaHitHeadshot, nbaHitSubjectById, nbaHitValue } from "./nbaHitTheNumberStats";

const nbaTheme = {
  "--football-accent": "#f2a341",
  "--football-accent-rgb": "242,163,65",
  "--ufc-red-strong": "#f2a341",
} as CSSProperties;

function challengeRun(seed:string|null,challengeId:string):NbaHitRun|null {
  if(!seed)return null;
  try {
    const plan=createNbaHitTheNumberPlan(seed);
    const identity=curatedLineupIdentity(NBA_HIT_THE_NUMBER_GAME_ID,challengeId,plan.subjectIds,"nba-challenge");
    rememberLineup(identity,plan.subjectIds);
    return {plan,identity};
  } catch { return null; }
}
function resultPayload(result:NbaHitResult) {
  return {score:result.score,status:result.status,target:result.target,total:result.total,distance:result.distance,
    selections:result.selections.map(s=>({fighterId:s.subjectId,
      name:nbaHitSubjectById.get(s.subjectId)?.name??s.subjectId,value:s.value}))};
}
function NbaPlayerMark({subjectId,className}:{subjectId:string;className:string}) {
  const [failedId,setFailedId]=useState<string|null>(null);
  const subject=nbaHitSubjectById.get(subjectId);
  if(!subject)return null;
  const src=nbaHitHeadshot(subject);
  if(!src || failedId===subjectId) return <span className={className} aria-hidden="true" style={{display:"grid",placeItems:"center",
    background:"rgba(242,163,65,.15)",fontSize:".65rem",fontWeight:900}}>NBA</span>;
  return <img alt="" className={className} src={src} loading="lazy" referrerPolicy="no-referrer"
    onError={()=>setFailedId(subjectId)}
    style={{objectFit:"contain",objectPosition:"center top",background:"rgba(255,255,255,.08)"}} />;
}
export default function NbaHitTheNumberPage() {
  const navigate=useNavigate();
  const [params]=useSearchParams();
  const {beginChallenge}=usePlayChallenges();
  const profile=useProfileChallengeMatch("hit-the-number");
  const setup=challengeRecord(profile.challenge?.setup);
  const seedFromProfile=challengeString(setup?.seed);
  const seedFromUrl=params.get("seed");
  const challengeId=profile.challenge?.code??`nba-shared:${seedFromUrl??""}`;
  const sharedRun=useMemo(()=>challengeRun(seedFromProfile??seedFromUrl,challengeId),
    [seedFromProfile,seedFromUrl,challengeId]);
  const [run,setRun]=useState<NbaHitRun>(()=>sharedRun??createNbaHitTheNumberRun());
  const [selected,setSelected]=useState<string[]>([]);
  const [result,setResult]=useState<NbaHitResult|null>(null);
  const [shareStatus,setShareStatus]=useState("");
  const plan=run.plan;
  const isShared=run.identity.type==="curated";
  const progressive=plan.slots.length>0;
  const valid=nbaHitSelectionSatisfies(plan,selected);
  const available=nbaHitAvailableSubjectIds(plan,selected);
  useEffect(()=>{
    if(!sharedRun||sharedRun.identity.challengeId===run.identity.challengeId)return;
    setRun(sharedRun);setSelected([]);setResult(null);setShareStatus("");
  },[sharedRun,run.identity.challengeId]);
  const candidates=plan.subjectIds.map(id=>{
    const item=nbaHitSubjectById.get(id)!;
    return {id,name:item.name,subtitle:item.subtitle};
  });
  function toggle(id:string) {
    if(result)return;
    setSelected(current=>{
      if(current.includes(id)){
        if(progressive)return current.at(-1)===id?current.slice(0,-1):current;
        return current.filter(x=>x!==id);
      }
      if(!nbaHitAvailableSubjectIds(plan,current).includes(id))return current;
      return [...current,id];
    });
  }
  function newBoard(){
    setRun(createNbaHitTheNumberRun());setSelected([]);setResult(null);setShareStatus("");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function finish(){
    if(result||!valid)return;
    const graded=nbaHitResult(plan,selected);
    recordLineupCompletion(run.identity,{...resultPayload(graded),statId:plan.statId,
      version:NBA_HIT_THE_NUMBER_VERSION,formatId:plan.formatId,selectedIds:[...selected]});
    if(profile.isRecipient&&profile.challenge?.responderResult===null) {
      profile.submitResult(asChallengeJson(resultPayload(graded)));
    }
    setResult(graded);window.scrollTo({top:0,behavior:"smooth"});
  }
  async function challengeSomeone(){
    if(!result)return;
    setShareStatus("");
    const status=await beginChallenge({
      gameId:"hit-the-number",gameVersion:NBA_HIT_THE_NUMBER_VERSION,
      gameTitle:"NBA Hit the Number",
      summary:`${plan.metricLabel} · ${formatNbaHitNumber(plan.target)} target`,
      setup:asChallengeJson({seed:plan.seed,statId:plan.statId,pickCount:plan.pickCount,
        formatId:plan.formatId,target:plan.target,subjectIds:plan.subjectIds}),
      creatorResult:asChallengeJson(resultPayload(result)),
      shareTitle:"NBA Hit the Number Challenge",
      shareText:`Pick ${plan.pickCount} NBA players and get close to ${formatNbaHitNumber(plan.target)} ${plan.metricLabel} without busting.`,
      shareUrl:footballChallengeUrl("/nba/hit-the-number",{seed:plan.seed}),
    });
    setShareStatus(status);
  }
  const resultActions=result?<GameResultActions
    onChallenge={()=>void challengeSomeone()}
    onReplay={isShared?()=>{setSelected([]);setResult(null)}:newBoard}
    onAllGames={()=>navigate("/nba")}
    replayLabel={isShared?"REPLAY CHALLENGE":"NEW BOARD"}
    status={shareStatus}
  />:null;
  return <div className="page hit-number-page football-hit-number-page nba-hit-number-page"
    data-sport="nba" data-game="hit-the-number" data-format-id={plan.formatId}
    data-challenge-id={run.identity.challengeId} style={nbaTheme}>
    {profile.creator?<section className="challenge-game-banner">
      <span>PROFILE CHALLENGE</span>
      <strong>{profile.creator.displayName} sent this exact NBA Hit the Number board.</strong>
      <small>Both scores reveal after you finish.</small>
    </section>:null}
    <FootballHitTheNumberPresentation
      target={plan.target} metricLabel={plan.metricLabel} league="NBA"
      configurationLabel={plan.configurationLabel}
      pickCount={plan.pickCount} candidates={candidates} selectedIds={selected}
      slots={plan.slots} activeSlotIndex={progressive&&!result&&selected.length<plan.pickCount?selected.length:null}
      availableIds={progressive&&!result?available:plan.subjectIds}
      values={result?Object.fromEntries(plan.subjectIds.map(id=>[id,nbaHitValue(nbaHitSubjectById.get(id)!,plan.statId)])):undefined}
      result={result} formatValue={formatNbaHitNumber}
      onBack={()=>navigate("/nba")} onNewBoard={!result&&!isShared?newBoard:null}
      onToggle={toggle} onRewind={index=>{if(!result&&progressive)setSelected(selected.slice(0,index));}}
      onLock={valid?finish:null} resultActions={resultActions}
      renderSubjectMark={(id,className)=><NbaPlayerMark subjectId={id} className={className}/>}
    />
  </div>;
}
