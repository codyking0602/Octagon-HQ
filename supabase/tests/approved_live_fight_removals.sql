begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_before jsonb;
  v_after jsonb;
  v_current jsonb;
  v_control jsonb;
  v_history jsonb;
  v_group_picks jsonb;
  v_summary record;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'removal-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','REMOVAL OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'removal-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','REMOVAL MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'Removal Owner','RO');
  perform public.register_unclaimed_pin_profile(v_member_id,'Removal Member','RM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('approved-removal-test','UFC Removal Test','Red vs. Blue','Test Arena','Dallas, Texas',
    now()+interval '2 days',now()+interval '1 day',2199,'upcoming');

  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at)
  values
    ('approved-removal-test','remove-main',1,'Lightweight','remove-red','Remove Red',
      'remove-blue','Remove Blue',150,-170,'Test Sportsbook',now()),
    ('approved-removal-test','keep-co-main',2,'Welterweight','keep-red','Keep Red',
      'keep-blue','Keep Blue',-120,110,'Test Sportsbook',now());

  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values
    (v_owner_id,'approved-removal-test','remove-main','remove-red'),
    (v_member_id,'approved-removal-test','remove-main','remove-blue'),
    (v_owner_id,'approved-removal-test','keep-co-main','keep-red'),
    (v_member_id,'approved-removal-test','keep-co-main','keep-blue');

  insert into public.profile_event_underdog_locks(profile_id,event_id,bout_id,fighter_slug)
  values(v_owner_id,'approved-removal-test','remove-main','remove-red');

  select to_jsonb(bout) - 'included_in_picks' into v_before
  from public.pick_bouts bout
  where bout.event_id='approved-removal-test' and bout.bout_id='remove-main';

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.approve_pick_bout_inclusion(
      'approved-removal-test','remove-main',false,true,'remove-red','remove-blue','Removed from Picks only'
    );
    raise exception 'non-owner removed a live bout';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  begin
    perform public.approve_pick_bout_inclusion(
      'approved-removal-test','remove-main',false,false,'remove-red','remove-blue','Stale inclusion state'
    );
    raise exception 'stale inclusion state was accepted';
  exception when others then
    if sqlerrm not like '%Picks inclusion changed; reload Fight Night Control%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion(
      'approved-removal-test','remove-main',false,true,'wrong-red','remove-blue','Stale fighter identity'
    );
    raise exception 'stale fighter identity was accepted';
  exception when others then
    if sqlerrm not like '%matchup changed; reload Fight Night Control%' then raise; end if;
  end;

  perform public.approve_pick_bout_inclusion(
    'approved-removal-test','remove-main',false,true,'remove-red','remove-blue','Fight remains on UFC event but leaves Picks'
  );

  if (select included_in_picks from public.pick_bouts
      where event_id='approved-removal-test' and bout_id='remove-main') then
    raise exception 'approved removal did not exclude the bout';
  end if;

  select to_jsonb(bout) - 'included_in_picks' into v_after
  from public.pick_bouts bout
  where bout.event_id='approved-removal-test' and bout.bout_id='remove-main';
  if v_after is distinct from v_before then
    raise exception 'approved removal changed canonical bout fields other than inclusion';
  end if;

  if (select count(*) from public.profile_event_picks
      where event_id='approved-removal-test' and bout_id='remove-main') <> 2 then
    raise exception 'approved removal did not preserve submitted picks';
  end if;

  if exists(select 1 from public.profile_event_underdog_locks
      where event_id='approved-removal-test' and bout_id='remove-main') then
    raise exception 'approved removal did not clear the affected mutable Underdog Lock';
  end if;

  if not exists(select 1 from public.pick_card_change_actions
      where event_id='approved-removal-test' and bout_id='remove-main'
        and action_type='remove_bout_from_picks'
        and before_state->'preserved_picks' is not null
        and after_state->'cleared_mutable_underdog_locks' is not null) then
    raise exception 'approved removal did not append complete private audit evidence';
  end if;

  v_group_picks := public.resolved_bout_group_picks('approved-removal-test','remove-main');
  if jsonb_array_length(v_group_picks) <> 0 then
    raise exception 'pre-lock removal exposed private group picks';
  end if;

  v_current := public.get_current_pick_event();
  if v_current #>> '{bouts,0,included_in_picks}' <> 'false'
    or v_current #>> '{bouts,0,repick_required}' <> 'false' then
    raise exception 'player projection did not preserve the removed bout safely: %',v_current;
  end if;

  v_control := public.get_pick_control_event();
  if v_control #>> '{bouts,0,included_in_picks}' <> 'false'
    or v_control #>> '{bouts,0,can_restore_to_picks}' <> 'true'
    or v_control #>> '{bouts,0,can_cancel}' <> 'false'
    or v_control #>> '{bouts,0,can_replace}' <> 'false'
    or v_control #>> '{bouts,0,has_removal_history}' <> 'true' then
    raise exception 'control projection did not expose removal state safely: %',v_control;
  end if;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.save_my_event_pick('approved-removal-test','remove-main','remove-red');
    raise exception 'member changed a preserved pick on a removed bout';
  exception when others then
    if sqlerrm not like '%fight is removed from Picks%' then raise; end if;
  end;

  begin
    perform public.set_my_event_underdog_lock('approved-removal-test','remove-main','remove-blue');
    raise exception 'member selected an Underdog Lock on a removed bout';
  exception when others then
    if sqlerrm not like '%fight is removed from Picks%' then raise; end if;
  end;

  select * into v_summary from public.get_my_pick_summary(2199);
  if v_summary.pending <> 1 then
    raise exception 'removed bout still counted in pending Picks summary: %',v_summary.pending;
  end if;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  begin
    perform public.approve_pick_bout_cancellation(
      'approved-removal-test','remove-main',true,'Should require restoration first'
    );
    raise exception 'removed bout was cancelled without restoration';
  exception when others then
    if sqlerrm not like '%removed bout must be restored to Picks%' then raise; end if;
  end;

  update public.pick_bouts
  set red_american_odds=400,blue_american_odds=-500,odds_source='Changed Sportsbook',odds_updated_at=now()+interval '1 hour'
  where event_id='approved-removal-test' and bout_id='remove-main';
  if (select red_american_odds from public.pick_bouts
      where event_id='approved-removal-test' and bout_id='remove-main') <> 150 then
    raise exception 'removed bout accepted an automatic odds mutation';
  end if;

  perform public.approve_pick_bout_inclusion(
    'approved-removal-test','remove-main',true,false,'remove-red','remove-blue','Restore to the pickable card'
  );

  if not (select included_in_picks from public.pick_bouts
      where event_id='approved-removal-test' and bout_id='remove-main') then
    raise exception 'owner could not restore the removed bout';
  end if;
  if (select count(*) from public.profile_event_picks
      where event_id='approved-removal-test' and bout_id='remove-main') <> 2 then
    raise exception 'restoration did not reactivate preserved picks';
  end if;
  if exists(select 1 from public.profile_event_underdog_locks
      where event_id='approved-removal-test' and bout_id='remove-main') then
    raise exception 'restoration silently restored a cleared Underdog Lock';
  end if;

  perform public.approve_pick_bout_inclusion(
    'approved-removal-test','remove-main',false,true,'remove-red','remove-blue','Remove again for audit and completion proof'
  );
  if (select count(*) from public.pick_card_change_actions
      where event_id='approved-removal-test' and bout_id='remove-main'
        and action_type in('remove_bout_from_picks','restore_bout_to_picks')) <> 3 then
    raise exception 'remove restore remove did not append independent immutable audits';
  end if;

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('final-removal-test','Final Removal Test','Only Bout','Test Arena','Dallas, Texas',
    now()+interval '2 days',now()+interval '1 day',2199,'upcoming');
  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name)
  values('final-removal-test','only-bout',1,'Flyweight','only-red','Only Red','only-blue','Only Blue');
  begin
    perform public.approve_pick_bout_inclusion(
      'final-removal-test','only-bout',false,true,'only-red','only-blue','Cannot remove final included bout'
    );
    raise exception 'final included bout was removed';
  exception when others then
    if sqlerrm not like '%final included bout cannot be removed%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set locks_at=now()-interval '1 minute',starts_at=now()+interval '1 hour'
  where event_id='approved-removal-test';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);

  v_group_picks := public.resolved_bout_group_picks('approved-removal-test','remove-main');
  if jsonb_array_length(v_group_picks) <> 2 then
    raise exception 'removed bout picks did not reveal after the canonical lock boundary';
  end if;

  begin
    perform public.approve_pick_bout_inclusion(
      'approved-removal-test','remove-main',true,false,'remove-red','remove-blue','Attempt after lock'
    );
    raise exception 'post-lock inclusion changed through the pre-lock owner';
  exception when others then
    if sqlerrm not like '%pre-lock Picks inclusion changes are closed%' then raise; end if;
  end;

  perform public.transition_pick_event('approved-removal-test','locked');
  perform public.record_official_pick_bout_result('approved-removal-test','keep-co-main','red_win');
  begin
    perform public.record_official_pick_bout_result('approved-removal-test','remove-main','red_win');
    raise exception 'removed bout accepted an official Picks result';
  exception when others then
    if sqlerrm not like '%removed bout must be restored to Picks%' then raise; end if;
  end;

  perform public.transition_pick_event('approved-removal-test','complete');
  if (select status from public.pick_events where event_id='approved-removal-test') <> 'complete' then
    raise exception 'removed pending bout blocked event completion';
  end if;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  v_history := public.get_my_pick_history(2199);
  if v_history #>> '{events,0,bouts,0,included_in_picks}' <> 'false'
    or v_history #>> '{events,0,bouts,0,verdict}' <> 'excluded' then
    raise exception 'completed recap did not retain the removed bout as an exclusion: %',v_history;
  end if;
  if (v_history #>> '{summary,correct}')::integer <> 0
    or (v_history #>> '{summary,incorrect}')::integer <> 1 then
    raise exception 'season scoring included the removed bout: %',v_history #> '{summary}';
  end if;

  if has_table_privilege('authenticated','public.pick_card_change_actions','SELECT') then
    raise exception 'browser role can read private removal audit history';
  end if;
end $$;

rollback;
