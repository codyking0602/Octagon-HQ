begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid:=extensions.gen_random_uuid();
  v_member uuid:=extensions.gen_random_uuid();
  v_other uuid:=extensions.gen_random_uuid();
  v_reveal jsonb;
  v_first_lock timestamptz;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','fight-lock-owner@test.invalid','',now(),now(),now(),jsonb_build_object('display_name','FIGHT LOCK OWNER','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','fight-lock-member@test.invalid','',now(),now(),now(),jsonb_build_object('display_name','FIGHT LOCK MEMBER','historical_unclaimed',true)),
    (v_other,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','fight-lock-other@test.invalid','',now(),now(),now(),jsonb_build_object('display_name','FIGHT LOCK OTHER','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner,'Fight Lock Owner','FLO');
  perform public.register_unclaimed_pin_profile(v_member,'Fight Lock Member','FLM');
  perform public.register_unclaimed_pin_profile(v_other,'Fight Lock Other','FLT');
  insert into public.pick_control_owners(profile_id) values(v_owner);
  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('per-fight-lock-test','UFC Lock Test','Red vs Blue','Arena','Test',now()+interval '3 days',now()+interval '2 days',2199,'upcoming');
  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,locks_at)
  values
    ('per-fight-lock-test','first-stable',1,'Lightweight','first-red','First Red','first-blue','First Blue',now()+interval '1 hour'),
    ('per-fight-lock-test','later-stable',2,'Welterweight','later-red','Later Red','later-blue','Later Blue',now()+interval '1 day'),
    ('per-fight-lock-test','legacy-stable',3,'Middleweight','legacy-red','Legacy Red','legacy-blue','Legacy Blue',null);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('per-fight-lock-test','first-stable','first-red');
  perform public.save_my_event_pick('per-fight-lock-test','first-stable','first-blue');
  perform public.save_my_event_pick('per-fight-lock-test','later-stable','later-red');

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_bouts set locks_at=now()-interval '1 second'
    where event_id='per-fight-lock-test' and bout_id='first-stable';
  select locks_at into v_first_lock from public.pick_bouts where event_id='per-fight-lock-test' and bout_id='first-stable';
  if private.pick_bout_is_locked(
      (select e from public.pick_events e where event_id='per-fight-lock-test'),
      (select b from public.pick_bouts b where event_id='per-fight-lock-test' and bout_id='legacy-stable')) then
    raise exception 'legacy bout ignored the future event fallback'; end if;
  update public.pick_bouts set position=4 where event_id='per-fight-lock-test' and bout_id='first-stable';
  if (select locks_at from public.pick_bouts where event_id='per-fight-lock-test' and bout_id='first-stable')<>v_first_lock then
    raise exception 'reorder moved lock ownership away from stable bout identity'; end if;
  begin
    update public.pick_bouts set red_fighter_slug='replacement-red'
      where event_id='per-fight-lock-test' and bout_id='first-stable';
    raise exception 'replacement bypassed locked-bout guard';
  exception when others then if sqlerrm not like '%fight card changes are closed%' then raise; end if; end;
  begin
    update public.pick_bouts set result_status='cancelled'
      where event_id='per-fight-lock-test' and bout_id='first-stable';
    raise exception 'cancellation bypassed locked-bout guard';
  exception when others then if sqlerrm not like '%fight card changes are closed%' then raise; end if; end;
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('per-fight-lock-test','first-stable','first-blue'); -- locked no-op
  begin
    perform public.save_my_event_pick('per-fight-lock-test','first-stable','first-red');
    raise exception 'locked pick was overwritten';
  exception when others then if sqlerrm not like '%pick is locked%' then raise; end if; end;
  perform public.save_my_event_pick('per-fight-lock-test','later-stable','later-blue');
  if (select fighter_slug from public.profile_event_picks where profile_id=v_member and bout_id='first-stable')<>'first-blue'
    or (select fighter_slug from public.profile_event_picks where profile_id=v_member and bout_id='later-stable')<>'later-blue' then
    raise exception 'locked/open sibling enforcement failed'; end if;

  perform set_config('request.jwt.claim.sub',v_other::text,true);
  v_reveal:=public.resolved_bout_group_picks('per-fight-lock-test','later-stable');
  if jsonb_array_length(v_reveal)<>0 then raise exception 'later open picks were exposed'; end if;
  v_reveal:=public.resolved_bout_group_picks('per-fight-lock-test','first-stable');
  if not exists(select 1 from jsonb_array_elements(v_reveal) x where x->>'display_name'='FIGHT LOCK MEMBER' and x->>'picked_fighter_slug'='first-blue') then
    raise exception 'locked bout was not revealed'; end if;

  begin perform public.adjust_pick_bout_lock_time('per-fight-lock-test','later-stable',now()+interval '12 hours');
    raise exception 'non-owner adjusted lock';
  exception when others then if sqlerrm not like '%pick control owner required%' then raise; end if; end;
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.adjust_pick_bout_lock_time('per-fight-lock-test','later-stable',now()+interval '12 hours');
  begin perform public.adjust_pick_bout_lock_time('per-fight-lock-test','first-stable',now()+interval '12 hours');
    raise exception 'locked bout reopened';
  exception when others then if sqlerrm not like '%locked bout cannot be reopened%' then raise; end if; end;
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_bouts set result_status='draw',result_recorded_at=now()
    where event_id='per-fight-lock-test' and bout_id='legacy-stable';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  begin perform public.adjust_pick_bout_lock_time('per-fight-lock-test','legacy-stable',now()+interval '12 hours');
    raise exception 'resulted bout reopened';
  exception when others then if sqlerrm not like '%resulted bout cannot be reopened%' then raise; end if; end;
  perform set_config('request.jwt.claim.role','anon',true); perform set_config('request.jwt.claim.sub','',true);
  if has_function_privilege('anon','public.adjust_pick_bout_lock_time(text,text,timestamptz)','EXECUTE') then
    raise exception 'anonymous lock adjustment privilege exists'; end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events set status='locked' where event_id='per-fight-lock-test';
  if not private.pick_bout_is_locked(
    (select e from public.pick_events e where event_id='per-fight-lock-test'),
    (select b from public.pick_bouts b where event_id='per-fight-lock-test' and bout_id='later-stable')) then
    raise exception 'event master lock did not lock later bout'; end if;
  update public.pick_events set status='complete',completed_at=now() where event_id='per-fight-lock-test';
  if not private.pick_bout_is_locked(
    (select e from public.pick_events e where event_id='per-fight-lock-test'),
    (select b from public.pick_bouts b where event_id='per-fight-lock-test' and bout_id='legacy-stable')) then
    raise exception 'complete event did not lock legacy bout'; end if;
  if v_first_lock is null then raise exception 'stable bout lock identity was lost'; end if;
end $$;

rollback;
