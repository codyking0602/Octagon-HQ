begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_other_id uuid := extensions.gen_random_uuid();
  v_before_main jsonb;
  v_before_other jsonb;
  v_group_picks jsonb;
  v_audit public.pick_card_change_actions;
  v_count integer;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'replace-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','REPLACE OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'replace-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','REPLACE MEMBER','historical_unclaimed',true)),
    (v_other_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'replace-other@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','REPLACE OTHER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'Replace Owner','RO');
  perform public.register_unclaimed_pin_profile(v_member_id,'Replace Member','RM');
  perform public.register_unclaimed_pin_profile(v_other_id,'Replace Other','RT');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,completed_at)
  values
    ('replacement-live-test','UFC Replacement Test','Old Red vs. Old Blue','Test Arena','Dallas, Texas',now()+interval '2 days',now()+interval '1 day',2199,'upcoming',null),
    ('replacement-locked-test','UFC Locked Test','Locked Red vs. Locked Blue','Test Arena','Dallas, Texas',now()+interval '2 days',now()+interval '1 day',2199,'locked',null),
    ('replacement-started-test','UFC Started Test','Started Red vs. Started Blue','Test Arena','Dallas, Texas',now()-interval '1 hour',now()-interval '2 hours',2199,'upcoming',null),
    ('replacement-complete-test','UFC Complete Test','Complete Red vs. Complete Blue','Test Arena','Dallas, Texas',now()-interval '1 day',now()-interval '2 days',2199,'complete',now()),
    ('replacement-expired-test','UFC Expired Test','Expired Red vs. Expired Blue','Test Arena','Dallas, Texas',now()+interval '1 day',now()-interval '1 minute',2199,'upcoming',null);

  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at)
  values
    ('replacement-live-test','replace-main',1,'Lightweight','old-red','Old Red','old-blue','Old Blue',145,-165,'Old Sportsbook',now()),
    ('replacement-live-test','untouched-bout',2,'Welterweight','other-red','Other Red','other-blue','Other Blue',210,-250,'Other Sportsbook',now()),
    ('replacement-locked-test','locked-bout',1,'Lightweight','locked-red','Locked Red','locked-blue','Locked Blue',100,-120,'Test Sportsbook',now()),
    ('replacement-started-test','started-bout',1,'Lightweight','started-red','Started Red','started-blue','Started Blue',100,-120,'Test Sportsbook',now()),
    ('replacement-complete-test','complete-bout',1,'Lightweight','complete-red','Complete Red','complete-blue','Complete Blue',100,-120,'Test Sportsbook',now()),
    ('replacement-expired-test','expired-bout',1,'Lightweight','expired-red','Expired Red','expired-blue','Expired Blue',100,-120,'Test Sportsbook',now());

  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values
    (v_owner_id,'replacement-live-test','replace-main','old-red'),
    (v_member_id,'replacement-live-test','replace-main','old-blue'),
    (v_other_id,'replacement-live-test','replace-main','old-red'),
    (v_owner_id,'replacement-live-test','untouched-bout','other-red'),
    (v_member_id,'replacement-live-test','untouched-bout','other-blue');

  insert into public.profile_event_underdog_locks(profile_id,event_id,bout_id,fighter_slug)
  values
    (v_owner_id,'replacement-live-test','replace-main','old-red'),
    (v_member_id,'replacement-live-test','untouched-bout','other-blue');

  select to_jsonb(bout) into v_before_main from public.pick_bouts bout
  where event_id='replacement-live-test' and bout_id='replace-main';
  select to_jsonb(bout) into v_before_other from public.pick_bouts bout
  where event_id='replacement-live-test' and bout_id='untouched-bout';

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.approve_pick_fighter_replacement(
      'replacement-live-test','replace-main','red','old-red','old-blue','new-red','New Red','Owner confirmed withdrawal'
    );
    raise exception 'non-owner replacement was accepted';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);

  begin
    perform public.approve_pick_fighter_replacement(
      'wrong-event','replace-main','red','old-red','old-blue','new-red','New Red','Wrong event attempt'
    );
    raise exception 'wrong event replacement was accepted';
  exception when others then
    if sqlerrm not like '%event not found%' then raise; end if;
  end;
  begin
    perform public.approve_pick_fighter_replacement(
      'replacement-live-test','wrong-bout','red','old-red','old-blue','new-red','New Red','Wrong bout attempt'
    );
    raise exception 'wrong bout replacement was accepted';
  exception when others then
    if sqlerrm not like '%bout not found%' then raise; end if;
  end;
  begin
    perform public.approve_pick_fighter_replacement(
      'replacement-live-test','replace-main','red','stale-red','old-blue','new-red','New Red','Stale state attempt'
    );
    raise exception 'stale expected state replacement was accepted';
  exception when others then
    if sqlerrm not like '%matchup changed; reload Fight Night Control%' then raise; end if;
  end;
  begin
    perform public.approve_pick_fighter_replacement(
      'replacement-live-test','replace-main','red','old-red','old-blue','other-red','Other Red','Duplicate booking attempt'
    );
    raise exception 'duplicate event fighter replacement was accepted';
  exception when others then
    if sqlerrm not like '%replacement fighter is already booked on this event%' then raise; end if;
  end;

  if (select to_jsonb(bout) from public.pick_bouts bout
      where event_id='replacement-live-test' and bout_id='replace-main') <> v_before_main
    or (select count(*) from public.pick_card_change_actions where event_id='replacement-live-test') <> 0
    or (select count(*) from public.profile_event_picks where event_id='replacement-live-test') <> 5
    or (select count(*) from public.profile_event_underdog_locks where event_id='replacement-live-test') <> 2 then
    raise exception 'rejected identity or duplicate checks performed a mutation';
  end if;

  begin
    perform public.approve_pick_fighter_replacement(
      'replacement-locked-test','locked-bout','red','locked-red','locked-blue','new-locked','New Locked','Locked attempt'
    );
    raise exception 'locked event replacement was accepted';
  exception when others then
    if sqlerrm not like '%pre-lock fighter replacements are closed%' then raise; end if;
  end;
  begin
    perform public.approve_pick_fighter_replacement(
      'replacement-started-test','started-bout','red','started-red','started-blue','new-started','New Started','Started attempt'
    );
    raise exception 'started event replacement was accepted';
  exception when others then
    if sqlerrm not like '%pre-lock fighter replacements are closed%' then raise; end if;
  end;
  begin
    perform public.approve_pick_fighter_replacement(
      'replacement-complete-test','complete-bout','red','complete-red','complete-blue','new-complete','New Complete','Complete attempt'
    );
    raise exception 'completed event replacement was accepted';
  exception when others then
    if sqlerrm not like '%pre-lock fighter replacements are closed%' then raise; end if;
  end;
  begin
    perform public.approve_pick_fighter_replacement(
      'replacement-expired-test','expired-bout','red','expired-red','expired-blue','new-expired','New Expired','Expired attempt'
    );
    raise exception 'locks_at-expired event replacement was accepted';
  exception when others then
    if sqlerrm not like '%pre-lock fighter replacements are closed%' then raise; end if;
  end;
  if exists(select 1 from public.pick_card_change_actions where event_id like 'replacement-%-test') then
    raise exception 'a closed-boundary rejection appended audit history';
  end if;

  perform public.approve_pick_fighter_replacement(
    'replacement-live-test','replace-main','red','old-red','old-blue','new-red','New Red','Owner confirmed withdrawal'
  );

  if not exists(select 1 from public.pick_bouts where event_id='replacement-live-test' and bout_id='replace-main'
      and red_fighter_slug='new-red' and red_fighter_name='New Red' and blue_fighter_slug='old-blue') then
    raise exception 'owner replacement did not update the intended event-scoped bout';
  end if;
  if (select to_jsonb(bout) from public.pick_bouts bout
      where event_id='replacement-live-test' and bout_id='untouched-bout') <> v_before_other then
    raise exception 'owner replacement changed the unrelated bout';
  end if;
  if exists(select 1 from public.profile_event_picks
      where event_id='replacement-live-test' and bout_id='replace-main') then
    raise exception 'old pick silently survived replacement';
  end if;
  if (select count(*) from public.profile_event_picks
      where event_id='replacement-live-test' and bout_id='untouched-bout') <> 2 then
    raise exception 'unaffected pick changed';
  end if;
  if exists(select 1 from public.profile_event_underdog_locks
      where event_id='replacement-live-test' and bout_id='replace-main') then
    raise exception 'affected mutable Underdog Lock survived replacement';
  end if;
  if not exists(select 1 from public.profile_event_underdog_locks
      where profile_id=v_member_id and event_id='replacement-live-test' and bout_id='untouched-bout' and fighter_slug='other-blue') then
    raise exception 'unrelated Underdog Lock changed';
  end if;
  if exists(select 1 from public.pick_bouts where event_id='replacement-live-test' and bout_id='replace-main'
      and (red_american_odds is not null or blue_american_odds is not null or odds_source is not null or odds_updated_at is not null)) then
    raise exception 'affected odds or provenance survived replacement';
  end if;
  if not exists(select 1 from public.pick_bouts where event_id='replacement-live-test' and bout_id='untouched-bout'
      and red_american_odds=210 and blue_american_odds=-250 and odds_source='Other Sportsbook') then
    raise exception 'unrelated bout odds changed';
  end if;

  select * into v_audit from public.pick_card_change_actions
  where event_id='replacement-live-test' and bout_id='replace-main' and action_type='replace_fighter'
  order by action_id desc limit 1;
  if v_audit.reason <> 'Owner confirmed withdrawal' or v_audit.approved_by <> v_owner_id
    or v_audit.before_state->>'red_fighter_slug' <> 'old-red'
    or v_audit.before_state->>'blue_fighter_slug' <> 'old-blue'
    or v_audit.after_state->>'red_fighter_slug' <> 'new-red'
    or v_audit.after_state->>'blue_fighter_slug' <> 'old-blue'
    or jsonb_array_length(v_audit.before_state->'invalidated_picks') <> 3
    or jsonb_array_length(v_audit.before_state->'mutable_underdog_locks') <> 1 then
    raise exception 'private audit did not preserve original matchup, picks, locks, reason, approver, and before/after state: %',to_jsonb(v_audit);
  end if;
  if has_table_privilege('authenticated','public.pick_card_change_actions','SELECT') then
    raise exception 'authenticated browser role can read pick_card_change_actions';
  end if;

  v_group_picks := public.resolved_bout_group_picks('replacement-live-test','untouched-bout');
  if jsonb_array_length(v_group_picks) <> 0 then
    raise exception 'pre-lock replacement exposed private group picks';
  end if;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.save_my_event_pick('replacement-live-test','replace-main','old-red');
    raise exception 'outdated fighter submission was accepted';
  exception when others then
    if sqlerrm not like '%fighter is not in this bout%' then raise; end if;
  end;
  perform public.save_my_event_pick('replacement-live-test','replace-main','new-red');
  if not exists(select 1 from public.profile_event_picks where profile_id=v_member_id
      and event_id='replacement-live-test' and bout_id='replace-main' and fighter_slug='new-red') then
    raise exception 'current fighter could not be actively repicked';
  end if;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  perform public.approve_pick_fighter_replacement(
    'replacement-live-test','replace-main','red','new-red','old-blue','old-red','Old Red','Original red fighter restored explicitly'
  );

  select count(*) into v_count from public.pick_card_change_actions
  where event_id='replacement-live-test' and bout_id='replace-main' and action_type='replace_fighter';
  if v_count <> 2 then
    raise exception 'second replacement did not append independent audit evidence';
  end if;
  if exists(select 1 from public.profile_event_picks
      where event_id='replacement-live-test' and bout_id='replace-main')
    or exists(select 1 from public.profile_event_underdog_locks
      where event_id='replacement-live-test' and bout_id='replace-main') then
    raise exception 'second replacement resurrected an invalidated pick or Underdog Lock';
  end if;
  if not exists(select 1 from public.pick_bouts where event_id='replacement-live-test' and bout_id='replace-main'
      and red_fighter_slug='old-red' and blue_fighter_slug='old-blue') then
    raise exception 'explicit restoration did not restore the current-bout fighter';
  end if;
  if exists(
    select fighter_slug from (
      select red_fighter_slug fighter_slug from public.pick_bouts where event_id='replacement-live-test'
      union all
      select blue_fighter_slug from public.pick_bouts where event_id='replacement-live-test'
    ) event_fighters group by fighter_slug having count(*) > 1
  ) then
    raise exception 'final live event contains the same fighter slug in multiple bouts';
  end if;
end $$;

rollback;
