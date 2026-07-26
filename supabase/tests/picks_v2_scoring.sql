begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_profile_id uuid := extensions.gen_random_uuid();
  lock_row public.profile_event_underdog_locks;
  history jsonb;
  summary record;
  boundary integer[][] := array[
    array[-100,0],array[0,0],array[100,1],array[149,1],array[150,2],array[199,2],
    array[200,3],array[249,3],array[250,4],array[299,4],array[300,5],array[349,5],
    array[350,6],array[399,6],array[400,7],array[900,7]
  ];
  item integer[];
begin
  foreach item slice 1 in array boundary loop
    if public.pick_underdog_bonus(item[1]) <> item[2] then
      raise exception 'bonus boundary % produced %, expected %', item[1], public.pick_underdog_bonus(item[1]), item[2];
    end if;
  end loop;

  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values(v_profile_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'picks-v2-scoring@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','PICKS V2 TESTER','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_profile_id,'Picks V2 Tester','PV');

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('picks-v2-scoring-test','UFC V2 Test','Red vs. Blue','Test Arena','Dallas, Texas',
    now()+interval '2 days',now()+interval '1 day',2198,'upcoming');
  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at)
  values
    ('picks-v2-scoring-test','tier-lock',1,'Lightweight','tier-red','Tier Red','tier-blue','Tier Blue',-180,200,'fixture',now()),
    ('picks-v2-scoring-test','change-lock',2,'Welterweight','change-red','Change Red','change-blue','Change Blue',150,250,'fixture',now()),
    ('picks-v2-scoring-test','draw-bout',3,'Middleweight','draw-red','Draw Red','draw-blue','Draw Blue',-110,100,'fixture',now()),
    ('picks-v2-scoring-test','nc-bout',4,'Flyweight','nc-red','NC Red','nc-blue','NC Blue',-110,100,'fixture',now()),
    ('picks-v2-scoring-test','cancelled-bout',5,'Heavyweight','cancel-red','Cancel Red','cancel-blue','Cancel Blue',-110,100,'fixture',now()),
    ('picks-v2-scoring-test','missing-bout',6,'Bantamweight','missing-red','Missing Red','missing-blue','Missing Blue',-110,100,'fixture',now());
  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug) values
    (v_profile_id,'picks-v2-scoring-test','tier-lock','tier-red'),
    (v_profile_id,'picks-v2-scoring-test','change-lock','change-red'),
    (v_profile_id,'picks-v2-scoring-test','draw-bout','draw-red'),
    (v_profile_id,'picks-v2-scoring-test','nc-bout','nc-red'),
    (v_profile_id,'picks-v2-scoring-test','cancelled-bout','cancel-red');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_profile_id::text,true);
  begin
    perform public.set_my_event_underdog_lock('picks-v2-scoring-test','tier-lock','tier-red');
    raise exception 'negative odds were accepted as an underdog lock';
  exception when others then
    if sqlerrm not like '%positive American odds%' then raise; end if;
  end;

  select * into lock_row from public.set_my_event_underdog_lock('picks-v2-scoring-test','change-lock','change-red');
  if lock_row.fighter_slug <> 'change-red' then raise exception 'first qualifying lock was not saved'; end if;
  update public.profile_event_picks set fighter_slug='change-blue'
    where profile_id=v_profile_id and event_id='picks-v2-scoring-test' and bout_id='change-lock';
  select * into lock_row from public.set_my_event_underdog_lock('picks-v2-scoring-test','change-lock','change-blue');
  if (select count(*) from public.profile_event_underdog_locks where profile_id=v_profile_id and event_id='picks-v2-scoring-test') <> 1 then
    raise exception 'more than one lock exists for a member and event';
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events set locks_at=now()-interval '1 minute' where event_id='picks-v2-scoring-test';
  perform public.transition_pick_event('picks-v2-scoring-test','locked');
  select * into lock_row from public.profile_event_underdog_locks
    where profile_id=v_profile_id and event_id='picks-v2-scoring-test';
  if lock_row.frozen_american_odds <> 250 then raise exception 'lock-time odds were not frozen'; end if;
  update public.pick_bouts set blue_american_odds=400,odds_updated_at=now()
    where event_id='picks-v2-scoring-test' and bout_id='change-lock';
  if (select frozen_american_odds from public.profile_event_underdog_locks where profile_id=v_profile_id and event_id='picks-v2-scoring-test') <> 250 then
    raise exception 'later odds edit changed frozen scoring odds';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  begin
    perform public.clear_my_event_underdog_lock('picks-v2-scoring-test');
    raise exception 'lock changed after the event locked';
  exception when others then
    if sqlerrm not like '%underdog lock is closed%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','tier-lock','blue_win');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','change-lock','blue_win');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','draw-bout','draw');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','nc-bout','no_contest');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','cancelled-bout','cancelled');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','missing-bout','red_win');
  perform public.transition_pick_event('picks-v2-scoring-test','complete');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_profile_id::text,true);
  select * into summary from public.get_my_pick_summary(2198);
  if summary.correct<>1 or summary.incorrect<>1 or summary.base_points<>4 or summary.lock_bonus<>4 or summary.total_points<>8 then
    raise exception 'authoritative summary scoring is incorrect: %', row_to_json(summary);
  end if;
  history := public.get_my_pick_history(2198);
  if history #>> '{summary,missing}' <> '1' or history #>> '{summary,excluded}' <> '3'
    or history #>> '{summary,total_points}' <> '8'
    or history #>> '{events,0,record,total_points}' <> '8'
    or history #>> '{events,0,group_results,0,total_points}' <> '8' then
    raise exception 'recap, missing/excluded, and group totals did not reconcile: %', history;
  end if;

  if has_function_privilege('authenticated','public.record_official_pick_bout_result(text,text,text)','EXECUTE') then
    raise exception 'browser role can mutate official results';
  end if;
end $$;

rollback;
