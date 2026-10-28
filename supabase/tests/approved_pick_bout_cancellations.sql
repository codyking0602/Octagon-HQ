begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_group_picks jsonb;
  v_control jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'cancel-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CANCEL OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'cancel-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CANCEL MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'Cancel Owner','CO');
  perform public.register_unclaimed_pin_profile(v_member_id,'Cancel Member','CM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('approved-cancellation-test','UFC Cancellation Test','Red vs. Blue','Test Arena','Dallas, Texas',
    now()+interval '2 days',now()+interval '1 day',2199,'upcoming');

  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at)
  values('approved-cancellation-test','cancel-main',1,'Lightweight','cancel-red','Cancel Red',
    'cancel-blue','Cancel Blue',150,-170,'Test Sportsbook',now());

  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values
    (v_owner_id,'approved-cancellation-test','cancel-main','cancel-red'),
    (v_member_id,'approved-cancellation-test','cancel-main','cancel-blue');

  insert into public.profile_event_underdog_locks(profile_id,event_id,bout_id,fighter_slug)
  values(v_owner_id,'approved-cancellation-test','cancel-main','cancel-red');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.approve_pick_bout_cancellation(
      'approved-cancellation-test','cancel-main',true,'Removed from the official UFC card'
    );
    raise exception 'non-owner cancelled a live bout';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  perform public.approve_pick_bout_cancellation(
    'approved-cancellation-test','cancel-main',true,'Removed from the official UFC card'
  );

  if (select result_status from public.pick_bouts
      where event_id='approved-cancellation-test' and bout_id='cancel-main') <> 'cancelled' then
    raise exception 'owner cancellation did not mark the bout cancelled';
  end if;

  if (select count(*) from public.profile_event_picks
      where event_id='approved-cancellation-test' and bout_id='cancel-main') <> 2 then
    raise exception 'approved cancellation did not preserve original picks';
  end if;

  if exists(select 1 from public.profile_event_underdog_locks
      where event_id='approved-cancellation-test' and bout_id='cancel-main') then
    raise exception 'approved cancellation did not clear the invalid mutable Underdog Lock';
  end if;

  if not exists(select 1 from public.pick_card_change_actions
      where event_id='approved-cancellation-test' and bout_id='cancel-main'
        and action_type='cancel_bout' and reason='Removed from the official UFC card') then
    raise exception 'approved cancellation did not append audit history';
  end if;

  v_group_picks := public.resolved_bout_group_picks('approved-cancellation-test','cancel-main');
  if jsonb_array_length(v_group_picks) <> 0 then
    raise exception 'pre-lock cancellation exposed private group picks';
  end if;

  v_control := public.get_pick_control_event();
  if v_control #>> '{bouts,0,result_status}' <> 'cancelled'
    or v_control #>> '{bouts,0,can_restore}' <> 'true'
    or v_control #>> '{bouts,0,can_cancel}' <> 'false' then
    raise exception 'control projection did not expose the approved cancellation safely: %',v_control;
  end if;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.save_my_event_pick('approved-cancellation-test','cancel-main','cancel-red');
    raise exception 'member changed a preserved pick on a cancelled bout';
  exception when others then
    if sqlerrm not like '%fight is cancelled%' then raise; end if;
  end;

  begin
    perform public.set_my_event_underdog_lock('approved-cancellation-test','cancel-main','cancel-blue');
    raise exception 'member selected an Underdog Lock on a cancelled bout';
  exception when others then
    if sqlerrm not like '%fight is cancelled%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  perform public.approve_pick_bout_cancellation(
    'approved-cancellation-test','cancel-main',false,'Fight restored before Picks lock'
  );

  if (select result_status from public.pick_bouts
      where event_id='approved-cancellation-test' and bout_id='cancel-main') <> 'pending' then
    raise exception 'owner could not restore the pre-lock cancellation';
  end if;

  if not exists(select 1 from public.pick_card_change_actions
      where event_id='approved-cancellation-test' and bout_id='cancel-main' and action_type='restore_bout') then
    raise exception 'restoration did not append audit history';
  end if;

  perform public.approve_pick_bout_cancellation(
    'approved-cancellation-test','cancel-main',true,'Removed again for lock-time privacy proof'
  );
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events set locks_at=now()-interval '1 minute'
  where event_id='approved-cancellation-test';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);

  v_group_picks := public.resolved_bout_group_picks('approved-cancellation-test','cancel-main');
  if jsonb_array_length(v_group_picks) <> 2 then
    raise exception 'cancelled bout picks did not reveal after the canonical lock boundary';
  end if;

  begin
    perform public.approve_pick_bout_cancellation(
      'approved-cancellation-test','cancel-main',false,'Attempt after lock'
    );
    raise exception 'post-lock cancellation changed through the pre-lock owner';
  exception when others then
    if sqlerrm not like '%pre-lock card changes are closed%' then raise; end if;
  end;

  if has_table_privilege('authenticated','public.pick_card_change_actions','SELECT') then
    raise exception 'browser role can read private card-change audit history';
  end if;
end $$;

rollback;
