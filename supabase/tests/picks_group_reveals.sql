begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_cody uuid := extensions.gen_random_uuid();
  v_shane uuid := extensions.gen_random_uuid();
  v_tony uuid := extensions.gen_random_uuid();
  current_event jsonb;
  anonymous_event jsonb;
  history jsonb;
  completed_event jsonb;
  first_bout jsonb;
  second_bout jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_cody,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'group-reveal-cody@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CODY REVEAL','historical_unclaimed',true)),
    (v_shane,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'group-reveal-shane@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','SHANE REVEAL','historical_unclaimed',true)),
    (v_tony,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'group-reveal-tony@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','TONY REVEAL','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_cody,'Cody Reveal','CR');
  perform public.register_unclaimed_pin_profile(v_shane,'Shane Reveal','SR');
  perform public.register_unclaimed_pin_profile(v_tony,'Tony Reveal','TR');

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values ('group-pick-reveal-test','UFC Group Reveal','Red vs. Blue','Test Arena','Dallas, Texas',
    '1900-01-02 00:00:00+00','1900-01-01 00:00:00+00',2199,'locked');

  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name)
  values
    ('group-pick-reveal-test','first-bout',1,'Lightweight','first-red','First Red','first-blue','First Blue'),
    ('group-pick-reveal-test','second-bout',2,'Welterweight','second-red','Second Red','second-blue','Second Blue');

  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values
    (v_cody,'group-pick-reveal-test','first-bout','first-red'),
    (v_cody,'group-pick-reveal-test','second-bout','second-red'),
    (v_shane,'group-pick-reveal-test','first-bout','first-blue'),
    (v_shane,'group-pick-reveal-test','second-bout','second-blue'),
    (v_tony,'group-pick-reveal-test','second-bout','second-blue');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_cody::text,true);
  current_event := public.get_current_pick_event();
  if jsonb_array_length(current_event #> '{bouts,0,group_picks}') <> 3
    or jsonb_array_length(current_event #> '{bouts,1,group_picks}') <> 3 then
    raise exception 'event-wide master lock did not reveal every bout: %', current_event;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform public.record_official_pick_bout_result('group-pick-reveal-test','first-bout','red_win');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_cody::text,true);
  current_event := public.get_current_pick_event();
  first_bout := current_event #> '{bouts,0}';
  second_bout := current_event #> '{bouts,1}';

  if jsonb_array_length(first_bout->'group_picks') <> 3 then
    raise exception 'resolved bout did not reveal all event entrants: %', first_bout;
  end if;
  if jsonb_array_length(second_bout->'group_picks') <> 3 then
    raise exception 'event-wide master lock did not preserve sibling reveal: %', second_bout;
  end if;
  if not exists (
    select 1 from jsonb_array_elements(first_bout->'group_picks') item
    where item->>'display_name'='CODY REVEAL'
      and item->>'picked_fighter_slug'='first-red'
      and (item->>'is_current_user')::boolean
  ) then raise exception 'current member reveal row is incorrect: %', first_bout; end if;
  if not exists (
    select 1 from jsonb_array_elements(first_bout->'group_picks') item
    where item->>'display_name'='SHANE REVEAL' and item->>'picked_fighter_slug'='first-blue'
  ) then raise exception 'opposing member reveal row is incorrect: %', first_bout; end if;
  if not exists (
    select 1 from jsonb_array_elements(first_bout->'group_picks') item
    where item->>'display_name'='TONY REVEAL' and item->'picked_fighter_slug'='null'::jsonb
  ) then raise exception 'event entrant missing the resolved fight was not shown as no pick: %', first_bout; end if;

  perform set_config('request.jwt.claim.role','anon',true);
  perform set_config('request.jwt.claim.sub','',true);
  anonymous_event := public.get_current_pick_event();
  if jsonb_array_length(anonymous_event #> '{bouts,0,group_picks}') <> 0 then
    raise exception 'anonymous viewer received revealed member picks: %', anonymous_event;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform public.record_official_pick_bout_result('group-pick-reveal-test','second-bout','blue_win');
  perform public.transition_pick_event('group-pick-reveal-test','complete');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_cody::text,true);
  history := public.get_my_pick_history(2199);
  select item into completed_event
  from jsonb_array_elements(history->'events') item
  where item->>'event_id'='group-pick-reveal-test';

  if completed_event is null
    or jsonb_array_length(completed_event #> '{bouts,0,group_picks}') <> 3
    or jsonb_array_length(completed_event #> '{bouts,1,group_picks}') <> 3 then
    raise exception 'completed recap did not preserve group pick reveals: %', history;
  end if;

  if has_function_privilege('authenticated','public.resolved_bout_group_picks(text,text)','EXECUTE') then
    raise exception 'browser role can call the private reveal helper directly';
  end if;
  if has_table_privilege('authenticated','public.profile_event_picks','SELECT') then
    raise exception 'browser role can read hidden pick rows directly';
  end if;
end $$;

rollback;
