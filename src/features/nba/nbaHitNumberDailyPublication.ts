import { createNbaHitTheNumberPlan, nbaHitAvailableSubjectIds, type NbaHitPlan } from "./nbaHitTheNumberModel";
import { nbaHitSubjectById, nbaHitValue } from "./nbaHitTheNumberStats";
import { buildTwoGameDailyPublication } from "../play/dailyTwoGameRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "../play/officialScoreContract";
import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";

export const NBA_HIT_NUMBER_SERVER_VERSION = "nba-hit-number-official-v1";

export function buildNbaHitNumberDailyPublication(day: string, scheduleVersion: string, ordinal: number): OfficialDailySetupPublication {
  const seed = `${NBA_HIT_NUMBER_SERVER_VERSION}|${scheduleVersion}|${day}|${ordinal}`;
  const planA = createNbaHitTheNumberPlan(seed+"|1");
  let planB = createNbaHitTheNumberPlan(seed+"|2");
  if (planA.statId === planB.statId && planA.target === planB.target) {
    for (let i=0;i<16;i++) {
      planB=createNbaHitTheNumberPlan(seed+"|2|"+i);
      if (planB.statId !== planA.statId || planB.target !== planA.target) break;
    }
    if(planB.statId===planA.statId && planB.target===planA.target) throw new Error("NBA Hit the Number rounds must differ.");
  }
  const single=(plan:NbaHitPlan, index:number):OfficialDailySetupPublication=>{
    const candidates=plan.subjectIds.map(id=>{const s=nbaHitSubjectById.get(id);if(!s)throw new Error("Missing NBA Hit subject.");return{id:s.id,name:s.name,subtitle:s.subtitle};});
    const values=Object.fromEntries(plan.subjectIds.map(id=>[id,nbaHitValue(nbaHitSubjectById.get(id)!,plan.statId)]));
    return{
      setupKey:`${NBA_HIT_NUMBER_SERVER_VERSION}:${scheduleVersion}:${day}:${index+1}`,
      contentVersion:NBA_HIT_NUMBER_SERVER_VERSION,scoringVersion:OFFICIAL_SCORE_CONTRACT_VERSION,
      publicSetup:{
        runtime_version:NBA_HIT_NUMBER_SERVER_VERSION,league:"NBA",
        metric_id:plan.statId,metric_label:plan.metricLabel,configuration_label:plan.configurationLabel,
        format_id:plan.formatId,target:plan.target,pick_count:plan.pickCount,slots:plan.slots,candidates,
        initial_state:{complete:false,selected_ids:[],available_subject_ids:nbaHitAvailableSubjectIds(plan,[]),
          active_slot:plan.slots[0]?{...plan.slots[0],index:0}:null},
      },
      revealSetup:{target:plan.target,values},
      privateSetupEvidence:{fighter_ids:[...plan.subjectIds],pick_count:plan.pickCount,plan},
      privateGradingEvidence:{fighter_ids:[...plan.subjectIds],target:plan.target,pick_count:plan.pickCount,values},
    };
  };
  return buildTwoGameDailyPublication({sport:"nba",gameType:"hit_the_number",day,scheduleVersion,children:[single(planA,0),single(planB,1)]});
}
