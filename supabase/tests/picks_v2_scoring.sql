begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_profile_id uuid := extensions.gen_random_uuid();
  v_tie_profile_id uuid := extensions.gen_random_uuid();
  lock_row public.profile_event_underdog_locks;
  history jsonb;
  current_event jsonb;
  summary record;
  tie_count integer;
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
  values
    (v_profile_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'picks-v2-scoring@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','PICKS V2 TESTER','historical_unclaimed',true)),
    (v_tie_profile_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'picks-v2-tie@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','PICKS V2 TIE','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_profile_id,'Picks V2 Tester','PV');
  perform public.register_unclaimed_pin_profile(v_tie_profile_id,'Picks V2 Tie','PT');

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values
    ('picks-v2-scoring-test','UFC V2 Test','Red vs. Blue','Test Arena','Dallas, Texas',now()+interval '2 days',now()+interval '1 day',2198,'upcoming'),
    ('picks-v2-losing-lock-test','UFC Losing Lock','Favorite vs. Dog','Test Arena','Dallas, Texas',now()+interval '36 hours',now()+interval '18 hours',2198,'upcoming'),
    ('picks-v2-zero-entry-test','UFC Zero Entry','No Picks','Test Arena','Dallas, Texas',now()+interval '1 day',now()+interval '12 hours',2198,'upcoming'),
    ('picks-v2-invalid-lock-test','UFC Invalid Lock','Line Flipped','Test Arena','Dallas, Texas',now()+interval '3 days',now()+interval '2 days',2197,'upcoming'),
    ('picks-v2-missing-lock-test','UFC Missing Lock','Line Removed','Test Arena','Dallas, Texas',now()+interval '4 days',now()+interval '3 days',2197,'upcoming');

  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at)
  values
    ('picks-v2-scoring-test','tier-lock',1,'Lightweight','tier-red','Tier Red','tier-blue','Tier Blue',-180,200,'fixture',now()),
    ('picks-v2-scoring-test','change-lock',2,'Welterweight','change-red','Change Red','change-blue','Change Blue',150,250,'fixture',now()),
    ('picks-v2-scoring-test','draw-bout',3,'Middleweight','draw-red','Draw Red','draw-blue','Draw Blue',-110,100,'fixture',now()),
    ('picks-v2-scoring-test','nc-bout',4,'Flyweight','nc-red','NC Red','nc-blue','NC Blue',-110,100,'fixture',now()),
    ('picks-v2-scoring-test','cancelled-bout',5,'Heavyweight','cancel-red','Cancel Red','cancel-blue','Cancel Blue',-110,100,'fixture',now()),
    ('picks-v2-scoring-test','missing-bout',6,'Bantamweight','missing-red','Missing Red','missing-blue','Missing Blue',-110,100,'fixture',now()),
    ('picks-v2-losing-lock-test','losing-lock',1,'Lightweight','losing-red','Losing Red','losing-blue','Losing Blue',-240,200,'fixture',now()),
    ('picks-v2-zero-entry-test','zero-entry',1,'Featherweight','zero-red','Zero Red','zero-blue','Zero Blue',-120,100,'fixture',now()),
    ('picks-v2-invalid-lock-test','invalid-lock',1,'Lightweight','invalid-red','Invalid Red','invalid-blue','Invalid Blue',-170,150,'fixture',now()),
    ('picks-v2-missing-lock-test','missing-lock',1,'Lightweight','line-red','Line Red','line-blue','Line Blue',-220,200,'fixture',now());

  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug) values
    (v_profile_id,'picks-v2-scoring-test','tier-lock','tier-red'),
    (v_profile_id,'picks-v2-scoring-test','change-lock','change-red'),
    (v_profile_id,'picks-v2-scoring-test','draw-bout','draw-red'),
    (v_profile_id,'picks-v2-scoring-test','nc-bout','nc-red'),
    (v_profile_id,'picks-v2-scoring-test','cancelled-bout','cancel-red'),
    (v_tie_profile_id,'picks-v2-scoring-test','tier-lock','tier-red'),
    (v_tie_profile_id,'picks-v2-scoring-test','change-lock','change-blue'),
    (v_tie_profile_id,'picks-v2-scoring-test','draw-bout','draw-red'),
    (v_tie_profile_id,'picks-v2-scoring-test','nc-bout','nc-red'),
    (v_tie_profile_id,'picks-v2-scoring-test','cancelled-bout','cancel-red'),
    (v_profile_id,'picks-v2-losing-lock-test','losing-lock','losing-blue'),
    (v_profile_id,'picks-v2-invalid-lock-test','invalid-lock','invalid-blue'),
    (v_profile_id,'picks-v2-missing-lock-test','missing-lock','line-blue');

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
  perform public.save_my_event_pick('picks-v2-scoring-test','change-lock','change-blue');
  if exists (
    select 1 from public.profile_event_underdog_locks
    where profile_id=v_profile_id and event_id='picks-v2-scoring-test'
  ) then raise exception 'changing away from a selected fighter did not clear the lock'; end if;
  perform public.set_my_event_underdog_lock('picks-v2-scoring-test','change-lock','change-blue');
  if (select count(*) from public.profile_event_underdog_locks where profile_id=v_profile_id and event_id='picks-v2-scoring-test') <> 1 then
    raise exception 'more than one lock exists for a member and event';
  end if;
  perform public.set_my_event_underdog_lock('picks-v2-losing-lock-test','losing-lock','losing-blue');
  perform public.set_my_event_underdog_lock('picks-v2-invalid-lock-test','invalid-lock','invalid-blue');
  perform public.set_my_event_underdog_lock('picks-v2-missing-lock-test','missing-lock','line-blue');

  perform set_config('request.jwt.claim.sub',v_tie_profile_id::text,true);
  perform public.set_my_event_underdog_lock('picks-v2-scoring-test','change-lock','change-blue');

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_bouts set blue_american_odds=300,odds_updated_at=now()
    where event_id='picks-v2-scoring-test' and bout_id='change-lock';
  update public.pick_bouts set blue_american_odds=-110,odds_updated_at=now()
    where event_id='picks-v2-invalid-lock-test' and bout_id='invalid-lock';
  update public.pick_bouts set blue_american_odds=null,odds_updated_at=now()
    where event_id='picks-v2-missing-lock-test' and bout_id='missing-lock';
  update public.pick_events set locks_at=now()-interval '1 minute'
    where event_id in ('picks-v2-scoring-test','picks-v2-invalid-lock-test','picks-v2-missing-lock-test');

  begin
    update public.pick_bouts set blue_american_odds=400,odds_updated_at=now()
      where event_id='picks-v2-scoring-test' and bout_id='change-lock';
    raise exception 'odds changed after locks_at but before stored status advanced';
  exception when others then
    if sqlerrm not like '%odds are locked for this event%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_profile_id::text,true);
  begin
    perform public.clear_my_event_underdog_lock('picks-v2-scoring-test');
    raise exception 'lock changed after the real lock timestamp';
  exception when others then
    if sqlerrm not like '%underdog lock is closed%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform public.transition_pick_event('picks-v2-scoring-test','locked');
  perform public.transition_pick_event('picks-v2-invalid-lock-test','locked');
  perform public.transition_pick_event('picks-v2-missing-lock-test','locked');

  select * into lock_row from public.profile_event_underdog_locks
    where profile_id=v_profile_id and event_id='picks-v2-scoring-test';
  if lock_row.frozen_american_odds <> 300 then raise exception 'final pre-lock odds were not frozen after a delayed transition'; end if;
  if lock_row.frozen_at <> (select locks_at from public.pick_events where event_id='picks-v2-scoring-test') then
    raise exception 'frozen timestamp is not the actual event lock timestamp';
  end if;
  if exists (
    select 1 from public.profile_event_underdog_locks
    where profile_id=v_profile_id and event_id in ('picks-v2-invalid-lock-test','picks-v2-missing-lock-test')
      and (frozen_american_odds is not null or frozen_at is not null)
  ) then raise exception 'invalid or missing odds received a frozen bonus snapshot'; end if;
  if exists (
    select 1 from public.pick_events
    where event_id in ('picks-v2-invalid-lock-test','picks-v2-missing-lock-test') and status <> 'locked'
  ) then raise exception 'invalid or missing odds blocked event locking'; end if;

  begin
    update public.pick_bouts set blue_american_odds=400,odds_updated_at=now()
      where event_id='picks-v2-scoring-test' and bout_id='change-lock';
    raise exception 'odds changed after stored event status locked';
  exception when others then
    if sqlerrm not like '%odds are locked for this event%' then raise; end if;
  end;

  current_event := public.get_current_pick_event();
  if not ((current_event #> '{bouts,0}') ? 'result_status')
    or not ((current_event #> '{bouts,0}') ? 'result_recorded_at') then
    raise exception 'current event projection dropped lifecycle result fields: %', current_event;
  end if;

  update public.pick_events set locks_at=now()-interval '1 minute'
    where event_id in ('picks-v2-losing-lock-test','picks-v2-zero-entry-test');
  perform public.transition_pick_event('picks-v2-losing-lock-test','locked');
  perform public.transition_pick_event('picks-v2-zero-entry-test','locked');

  perform public.record_official_pick_bout_result('picks-v2-scoring-test','tier-lock','blue_win');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','change-lock','blue_win');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','draw-bout','draw');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','nc-bout','no_contest');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','cancelled-bout','cancelled');
  perform public.record_official_pick_bout_result('picks-v2-scoring-test','missing-bout','red_win');
  perform public.record_official_pick_bout_result('picks-v2-losing-lock-test','losing-lock','red_win');
  perform public.record_official_pick_bout_result('picks-v2-zero-entry-test','zero-entry','red_win');
  perform public.transition_pick_event('picks-v2-scoring-test','complete');
  perform public.transition_pick_event('picks-v2-losing-lock-test','complete');
  perform public.transition_pick_event('picks-v2-zero-entry-test','complete');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_profile_id::text,true);
  select * into summary from public.get_my_pick_summary(2198);
  if summary.correct<>1 or summary.incorrect<>2 or summary.events_entered<>2
    or summary.base_points<>4 or summary.lock_bonus<>5 or summary.total_points<>9 then
    raise exception 'authoritative summary scoring is incorrect: %', row_to_json(summary);
  end if;
  history := public.get_my_pick_history(2198);
  if history #>> '{summary,events_entered}' <> '2'
    or history #>> '{summary,missing}' <> '2'
    or history #>> '{summary,excluded}' <> '3'
    or history #>> '{summary,total_points}' <> '9'
    or history #>> '{events,0,record,total_points}' <> '9'
    or history #>> '{events,1,record,lock_bonus}' <> '0'
    or history #>> '{events,1,record,total_points}' <> '0' then
    raise exception 'recap, losing lock, zero-entry, and group totals did not reconcile: %', history;
  end if;

  select count(*) into tie_count
  from jsonb_array_elements(history #> '{events,0,group_results}') result
  where (result->>'rank')::integer = 1 and (result->>'total_points')::integer = 9;
  if tie_count <> 2 then raise exception 'equal totals and correct picks did not preserve a shared rank: %', history; end if;

  if has_function_privilege('authenticated','public.record_official_pick_bout_result(text,text,text)','EXECUTE') then
    raise exception 'browser role can mutate official results';
  end if;
  if has_table_privilege('authenticated','public.profile_event_underdog_locks','SELECT') then
    raise exception 'browser role can read the private lock table directly';
  end if;
end $$;

rollback;
