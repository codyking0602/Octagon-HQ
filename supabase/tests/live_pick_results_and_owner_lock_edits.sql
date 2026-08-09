begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_reopen_lock timestamptz;
  v_result_lock timestamptz;
  v_cancel_lock timestamptz;
  v_later_lock timestamptz;
  v_new_lock timestamptz;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  )
  values
    (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'live-picks-owner@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','LIVE PICKS OWNER','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'live-picks-member@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','LIVE PICKS MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner,'Live Picks Owner','LO');
  perform public.register_unclaimed_pin_profile(v_member,'Live Picks Member','LM');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  v_reopen_lock := now() + interval '1 hour';
  v_result_lock := now() + interval '75 minutes';
  v_cancel_lock := now() + interval '90 minutes';
  v_later_lock := now() + interval '4 hours';

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status
  ) values (
    'live-owner-control-test','UFC Live Owner Control','Result Red vs. Result Blue',
    'Test Arena','Dallas, Texas',now()+interval '6 hours',now()+interval '5 hours',2199,'upcoming'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,locks_at
  ) values
    ('live-owner-control-test','reopen-bout',1,'Lightweight',
      'reopen-red','Reopen Red','reopen-blue','Reopen Blue',v_reopen_lock),
    ('live-owner-control-test','result-bout',2,'Welterweight',
      'result-red','Result Red','result-blue','Result Blue',v_result_lock),
    ('live-owner-control-test','cancel-result-bout',3,'Middleweight',
      'cancel-red','Cancel Red','cancel-blue','Cancel Blue',v_cancel_lock),
    ('live-owner-control-test','later-bout',4,'Featherweight',
      'later-red','Later Red','later-blue','Later Blue',v_later_lock);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('live-owner-control-test','reopen-bout','reopen-red');
  perform public.save_my_event_pick('live-owner-control-test','result-bout','result-red');
  perform public.save_my_event_pick('live-owner-control-test','cancel-result-bout','cancel-red');
  perform public.save_my_event_pick('live-owner-control-test','later-bout','later-red');

  -- Simulate three fights reaching their authoritative deadlines while a later
  -- fight and the overall event remain upcoming.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_bouts
  set locks_at = now() - interval '1 minute'
  where event_id='live-owner-control-test'
    and bout_id in ('reopen-bout','result-bout','cancel-result-bout');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.save_my_event_pick('live-owner-control-test','reopen-bout','reopen-blue');
    raise exception 'passed fight accepted a member pick edit before owner reopen';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;

  begin
    perform public.adjust_pick_bout_lock_time(
      'live-owner-control-test','reopen-bout',now()+interval '30 minutes'
    );
    raise exception 'non-owner reopened a passed fight';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;
  if current_setting('octagon.pick_deadline_owner_override', true) is distinct from 'off' then
    raise exception 'deadline override leaked after rejected non-owner call';
  end if;

  -- A direct result mutation remains blocked. Only the established official
  -- result RPC may cross the locked-card cancellation guard.
  perform set_config('request.jwt.claim.role','service_role',true);
  begin
    update public.pick_bouts
    set result_status='cancelled',result_recorded_at=now()
    where event_id='live-owner-control-test' and bout_id='reopen-bout';
    raise exception 'direct locked-card cancellation bypassed the official result owner';
  exception when others then
    if sqlerrm not like '%fight card changes are closed for this locked bout%' then raise; end if;
  end;

  -- The designated owner can explicitly reopen only this pending included fight.
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_new_lock := now() + interval '30 minutes';
  perform public.adjust_pick_bout_lock_time(
    'live-owner-control-test','reopen-bout',v_new_lock
  );

  if (select locks_at from public.pick_bouts
      where event_id='live-owner-control-test' and bout_id='reopen-bout')
      is distinct from v_new_lock then
    raise exception 'owner reopen did not move the passed fight deadline';
  end if;
  if current_setting('octagon.pick_deadline_owner_override', true) is distinct from 'off' then
    raise exception 'deadline override leaked after successful owner call';
  end if;
  if (select count(*) from public.pick_card_change_actions
      where event_id='live-owner-control-test'
        and bout_id='reopen-bout'
        and action_type='adjust_bout_lock_time') <> 1 then
    raise exception 'owner reopen did not use the canonical audited fight-change owner exactly once';
  end if;
  if (select count(*) from public.profile_event_picks
      where event_id='live-owner-control-test' and bout_id='reopen-bout') <> 1 then
    raise exception 'owner reopen did not preserve submitted picks';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id='live-owner-control-test' and bout_id='later-bout')
      is distinct from v_later_lock then
    raise exception 'owner reopen changed an unrelated later deadline';
  end if;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('live-owner-control-test','reopen-bout','reopen-blue');
  if not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member
      and event_id='live-owner-control-test'
      and bout_id='reopen-bout'
      and fighter_slug='reopen-blue'
  ) then
    raise exception 'explicit owner reopen did not restore member editability';
  end if;

  -- An individually locked fight can receive its official result without
  -- transitioning the entire event or closing the later fight.
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.record_official_pick_bout_result(
    'live-owner-control-test','result-bout','red_win'
  );
  if (select result_status from public.pick_bouts
      where event_id='live-owner-control-test' and bout_id='result-bout') <> 'red_win'
    or (select winner_fighter_slug from public.pick_bouts
      where event_id='live-owner-control-test' and bout_id='result-bout') <> 'result-red' then
    raise exception 'locked fight official winner was not recorded';
  end if;
  if (select status from public.pick_events where event_id='live-owner-control-test') <> 'upcoming' then
    raise exception 'individual result entry transitioned the whole event';
  end if;

  -- A final cancellation uses the same official-result owner, not the pre-lock
  -- card-cancellation path, even while later fights remain open.
  perform public.record_official_pick_bout_result(
    'live-owner-control-test','cancel-result-bout','cancelled'
  );
  if (select result_status from public.pick_bouts
      where event_id='live-owner-control-test' and bout_id='cancel-result-bout') <> 'cancelled' then
    raise exception 'official live cancellation result was not recorded';
  end if;
  if current_setting('octagon.pick_official_result_write', true) is distinct from 'off' then
    raise exception 'official result override leaked after result entry';
  end if;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('live-owner-control-test','later-bout','later-blue');
  if not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member
      and event_id='live-owner-control-test'
      and bout_id='later-bout'
      and fighter_slug='later-blue'
  ) then
    raise exception 'later fight stopped accepting picks after an earlier result';
  end if;

  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  begin
    perform public.record_official_pick_bout_result(
      'live-owner-control-test','later-bout','blue_win'
    );
    raise exception 'future open fight accepted an early official result';
  exception when others then
    if sqlerrm not like '%fight must be locked before recording its result%' then raise; end if;
  end;

  begin
    perform public.adjust_pick_bout_lock_time(
      'live-owner-control-test','result-bout',now()+interval '45 minutes'
    );
    raise exception 'resulted fight was reopened';
  exception when others then
    if sqlerrm not like '%locked, removed, or resulted fight deadline cannot change%' then raise; end if;
  end;
  if current_setting('octagon.pick_deadline_owner_override', true) is distinct from 'off' then
    raise exception 'deadline override leaked after resulted-fight rejection';
  end if;

  -- Event-wide lifecycle states remain hard stops for deadline editing.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set status='locked'
  where event_id='live-owner-control-test';

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  begin
    perform public.adjust_pick_bout_lock_time(
      'live-owner-control-test','later-bout',now()+interval '45 minutes'
    );
    raise exception 'event-wide locked card accepted a deadline reopen';
  exception when others then
    if sqlerrm not like '%ordinary fight changes require an upcoming event%' then raise; end if;
  end;
end;
$$;

rollback;
