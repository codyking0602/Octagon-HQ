-- V9 historical mapping and regression: preserve V8 saved outcomes,
-- NFL-derived championship odds, three-year cap and 90/3/7 final weights.
do $test$
declare
  v_state jsonb; v_v8 jsonb; v_v9 jsonb; v_r8 jsonb; v_r9 jsonb;
  v_score8 jsonb; v_score9 jsonb;
begin
  if (select count(*) from private.nba_gm_v5_historical_teams)<>150 then
    raise exception 'Historical NBA sample incomplete';
  end if;
  if private.nba_gm_v9_overall(0)<>81
     or private.nba_gm_v9_overall(1.07)<>83
     or private.nba_gm_v9_overall(3.29)<>87
     or private.nba_gm_v9_overall(7.91)<>94
     or private.nba_gm_v9_overall(11.34)<>98
     or private.nba_gm_v9_overall(12.72)<>99
     or private.nba_gm_v9_overall(-13)<>70
     or private.nba_gm_v9_overall(14)<>99 then
    raise exception 'Historical strength anchors changed';
  end if;
  if (select bool_and(private.nba_gm_v9_overall(net_rating) between 70 and 99)
      from private.nba_gm_v5_historical_teams) is not true then
    raise exception 'Historical team overall escaped 70-99';
  end if;
  if private.nba_gm_v7_overall(private.nba_gm_v7_strength(0))<>88 then
    raise exception 'Legacy V8 NFL-style overall changed';
  end if;
  v_state:=jsonb_build_object(
    'version','nba-gm-dev-v2','economyVersion',4,'simulationModelVersion',8,
    'developmentModelVersion',2,'seed','nba-gm-v9-historical-benchmark',
    'phase','year1','picks',jsonb_build_array(
      jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
      jsonb_build_object('slot','SG','playerId','nba-gm-draft-cadecunningham'),
      jsonb_build_object('slot','SF','playerId','nba-gm-draft-ausarthompson'),
      jsonb_build_object('slot','PF','playerId','nba-gm-draft-lebronjames'),
      jsonb_build_object('slot','C','playerId','nba-gm-draft-brooklopez'),
      jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ajaymitchell'),
      jsonb_build_object('slot','BIG','playerId','nba-gm-draft-yvesmissi')
    ),'releasedIds','[]'::jsonb,'tradesUsed',0);
  if private.nba_gm_v2_assign(v_state->'picks') is null then
    raise exception 'NBA benchmark roster not position-legal';
  end if;
  v_v8:=private.nba_gm_v2_season(v_state,1);
  v_state:=jsonb_set(v_state,'{simulationModelVersion}','9'::jsonb);
  v_v9:=private.nba_gm_v2_season(v_state,1);
  if v_v9 is distinct from private.nba_gm_v9_season(v_state,1)
     or (v_v8-'teamOverall') is distinct from (v_v9-'teamOverall')
     or (v_v9->>'teamOverall')::integer >= (v_v8->>'teamOverall')::integer then
    raise exception 'V9 changed wins/odds/playoffs or failed OVR rebasing: V8 %, V9 %',
      v_v8,v_v9;
  end if;
  v_r9:=jsonb_build_array(v_v9,
    private.nba_gm_v2_season(v_state,2),
    private.nba_gm_v2_season(v_state,3));
  v_score9:=private.nba_gm_v3_final_score(jsonb_set(v_state,'{results}',v_r9));
  if v_score9->'weights'<>'[0.9,0.03,0.07]'::jsonb
    or (v_score9->>'roster')::numeric<>round(
      ((v_r9->0->>'teamOverall')::numeric+
       (v_r9->1->>'teamOverall')::numeric+
       (v_r9->2->>'teamOverall')::numeric)/3,1) then
    raise exception 'V9 GM score calculation drifted: %',v_score9;
  end if;
  v_state:=jsonb_set(v_state,'{simulationModelVersion}','8'::jsonb);
  v_r8:=jsonb_build_array(v_v8,
    private.nba_gm_v2_season(v_state,2),
    private.nba_gm_v2_season(v_state,3));
  v_score8:=private.nba_gm_v3_final_score(jsonb_set(v_state,'{results}',v_r8));
  if (v_score9->>'score')::numeric >= (v_score8->>'score')::numeric then
    raise exception 'V9 failed to correct inflated GM grade: V8 %, V9 %',
      v_score8,v_score9;
  end if;
  if private.notification_category_for_kind('nba_gm_launch_available')<>'games'
    or private.notification_priority_for_kind('nba_gm_launch_available')<>'in_app' then
    raise exception 'NBA GM notification unexpectedly push eligible';
  end if;
  if exists(select 1 from private.notification_events
      where source_key='new-game:nba-gm-v9-launch')
     and private.publish_nba_gm_launch_notification_once()<>0 then
    raise exception 'NBA GM notification is not idempotent';
  end if;
  raise notice 'V9 median NBA OVR 83, P95 OVR 94, final V8 % vs V9 %',
    v_score8->>'score',v_score9->>'score';
end;
$test$;
