begin;

select set_config('request.jwt.claim.role', 'service_role', true);

create or replace function pg_temp.finish_active_pick_event()
returns void
language plpgsql
as $$
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now()),
      updated_at = now()
  where status in ('upcoming', 'locked');
end;
$$;

create or replace function pg_temp.create_pick_event(
  p_event_id text,
  p_locks_at timestamptz,
  p_starts_at timestamptz
)
returns void
language plpgsql
as $$
begin
  perform pg_temp.finish_active_pick_event();
  insert into public.pick_events(
    event_id,
    name,
    subtitle,
    venue,
    location,
    prelims_starts_at,
    starts_at,
    locks_at,
    season,
    status
  ) values (
    p_event_id,
    'UFC Canonical Change Test',
    'Red vs. Blue',
    'Test Arena',
    'Dallas, Texas',
    p_starts_at - interval '2 hours',
    p_starts_at,
    p_locks_at,
    2199,
    'upcoming'
  );
end;
$$;

create or replace function pg_temp.create_pick_bout(
  p_event_id text,
  p_bout_id text,
  p_position integer,
  p_locks_at timestamptz
)
returns void
language plpgsql
as $$
begin
  insert into public.pick_bouts(
    event_id,
    bout_id,
    position,
    weight_class,
    red_fighter_slug,
    red_fighter_name,
    blue_fighter_slug,
    blue_fighter_name,
    result_status,
    included_in_picks,
    card_segment,
    segment_sequence,
    locks_at
  ) values (
    p_event_id,
    p_bout_id,
    p_position,
    'Lightweight',
    p_bout_id || '-red',
    initcap(replace(p_bout_id, '-', ' ')) || ' Red',
    p_bout_id || '-blue',
    initcap(replace(p_bout_id, '-', ' ')) || ' Blue',
    'pending',
    true,
    'main',
    p_position,
    p_locks_at
  );
end;
$$;

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_other uuid := extensions.gen_random_uuid();
  v_event text;
  v_old_lock timestamptz;
  v_new_lock timestamptz;
  v_receipt jsonb;
  v_repeat jsonb;
  v_run uuid;
  v_finding uuid;
  v_action bigint;
  v_before_count integer;
  v_after_count integer;
  v_notification_count integer;
  v_definition text;
begin
  perform pg_temp.finish_active_pick_event();

  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (
      v_owner,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'canonical-owner@login.octagon-hq.app',
      '',
      now(), now(), now(),
      jsonb_build_object(
        'display_name', 'CANONICAL OWNER',
        'historical_unclaimed', true
      )
    ),
    (
      v_member,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'canonical-member@login.octagon-hq.app',
      '',
      now(), now(), now(),
      jsonb_build_object(
        'display_name', 'CANONICAL MEMBER',
        'historical_unclaimed', true
      )
    ),
    (
      v_other,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'canonical-other@login.octagon-hq.app',
      '',
      now(), now(), now(),
      jsonb_build_object(
        'display_name', 'CANONICAL OTHER',
        'historical_unclaimed', true
      )
    );

  perform public.register_unclaimed_pin_profile(
    v_owner, 'Canonical Owner', 'CO'
  );
  perform public.register_unclaimed_pin_profile(
    v_member, 'Canonical Member', 'CM'
  );
  perform public.register_unclaimed_pin_profile(
    v_other, 'Canonical Other', 'CX'
  );
  insert into public.pick_control_owners(profile_id) values (v_owner);

  -- 1-2. Every public mutation requires the owner. No browser role receives
  -- direct table write access.
  v_event := 'canonical-owner-test';
  perform pg_temp.create_pick_event(
    v_event, now() + interval '6 hours', now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'owner-a', 1, now() + interval '3 hours'
  );
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);
  begin
    perform public.approve_pick_bout_addition(
      v_event,
      'owner-b',
      'Welterweight',
      'owner-b-red',
      'Owner B Red',
      'owner-b-blue',
      'Owner B Blue',
      'main',
      2,
      now() + interval '4 hours',
      array['owner-a'],
      'Owner-only add proof'
    );
    raise exception 'non-owner added a fight';
  exception when others then
    if sqlerrm not like '%UNAUTHORIZED:%pick control owner required%' then
      raise;
    end if;
  end;
  if has_table_privilege(
    'authenticated', 'public.pick_bouts', 'INSERT,UPDATE,DELETE'
  ) then
    raise exception 'authenticated role can bypass canonical fight mutations';
  end if;

  -- 3-7. Add is deterministic: append only, preserve all existing picks, allow
  -- a partially locked card, and reject past or fully locked additions.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_event := 'canonical-add-open';
  perform pg_temp.create_pick_event(
    v_event, now() + interval '6 hours', now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'add-a', 1, now() + interval '2 hours'
  );
  insert into public.profile_event_picks(
    profile_id, event_id, bout_id, fighter_slug
  ) values (
    v_member, v_event, 'add-a', 'add-a-red'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_receipt := public.approve_pick_bout_addition(
    v_event,
    'add-b',
    'Welterweight',
    'add-b-red',
    'Add B Red',
    'add-b-blue',
    'Add B Blue',
    'main',
    2,
    now() + interval '3 hours',
    array['add-a'],
    'UFC added a fight'
  );
  if v_receipt->>'action' <> 'add_bout'
    or v_receipt->>'picks_preserved' <> '1'
    or v_receipt->>'picks_invalidated' <> '0'
    or v_receipt->>'required_action' <> 'pick_new_bout'
    or v_receipt->>'notification_count' <> '1'
    or not exists (
      select 1 from public.pick_bouts
      where event_id = v_event
        and bout_id = 'add-b'
        and position = 2
        and locks_at > now()
    )
    or not exists (
      select 1 from public.profile_event_picks
      where profile_id = v_member
        and event_id = v_event
        and bout_id = 'add-a'
    ) then
    raise exception 'open-card add receipt or preservation is incorrect: %',
      v_receipt;
  end if;

  select count(*) into v_before_count
  from public.pick_bouts where event_id = v_event;
  begin
    perform public.approve_pick_bout_addition(
      v_event,
      'add-past',
      'Middleweight',
      'add-past-red',
      'Add Past Red',
      'add-past-blue',
      'Add Past Blue',
      'main',
      3,
      now() - interval '1 minute',
      array['add-a','add-b'],
      'Reject a past deadline'
    );
    raise exception 'past-deadline fight was added';
  exception when others then
    if sqlerrm not like '%PROHIBITED:%deadline must be safely in the future%' then
      raise;
    end if;
  end;
  select count(*) into v_after_count
  from public.pick_bouts where event_id = v_event;
  if v_after_count <> v_before_count then
    raise exception 'failed add left partial fight state';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  update public.pick_bouts
  set locks_at = now() - interval '1 minute'
  where event_id = v_event and bout_id = 'add-a';
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_receipt := public.approve_pick_bout_addition(
    v_event,
    'add-partial',
    'Featherweight',
    'add-partial-red',
    'Add Partial Red',
    'add-partial-blue',
    'Add Partial Blue',
    'main',
    3,
    now() + interval '4 hours',
    array['add-a','add-b'],
    'Add while one fight is locked'
  );
  if v_receipt->>'action' <> 'add_bout' then
    raise exception 'partially locked card did not accept a safe add';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  update public.pick_bouts
  set locks_at = now() - interval '1 minute'
  where event_id = v_event;
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  begin
    perform public.approve_pick_bout_addition(
      v_event,
      'add-fully-locked',
      'Heavyweight',
      'fully-red',
      'Fully Red',
      'fully-blue',
      'Fully Blue',
      'main',
      4,
      now() + interval '5 hours',
      array['add-a','add-b','add-partial'],
      'Reject fully locked add'
    );
    raise exception 'fully locked card accepted a fight';
  exception when others then
    if sqlerrm not like '%PROHIBITED:%fully locked card%' then raise; end if;
  end;

  -- 8-11. Removal excludes instead of deleting, preserves picks and audit, and
  -- fails closed for locked or resulted fights.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_event := 'canonical-remove';
  perform pg_temp.create_pick_event(
    v_event, now() + interval '8 hours', now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'remove-empty', 1, now() + interval '3 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'remove-picked', 2, now() + interval '4 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'remove-locked', 3, now() - interval '1 minute'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'remove-resulted', 4, now() + interval '5 hours'
  );
  update public.pick_bouts
  set result_status = 'red_win',
      winner_fighter_slug = 'remove-resulted-red',
      result_recorded_at = now()
  where event_id = v_event and bout_id = 'remove-resulted';
  insert into public.profile_event_picks(
    profile_id, event_id, bout_id, fighter_slug
  ) values (
    v_member, v_event, 'remove-picked', 'remove-picked-red'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_receipt := public.approve_pick_bout_inclusion(
    v_event,
    'remove-empty',
    false,
    true,
    'remove-empty-red',
    'remove-empty-blue',
    'Remove unpicked fight'
  );
  if v_receipt->>'picks_preserved' <> '0'
    or not exists (
      select 1 from public.pick_bouts
      where event_id = v_event
        and bout_id = 'remove-empty'
        and not included_in_picks
    ) then
    raise exception 'unpicked open fight removal is incorrect';
  end if;

  v_receipt := public.approve_pick_bout_inclusion(
    v_event,
    'remove-picked',
    false,
    true,
    'remove-picked-red',
    'remove-picked-blue',
    'Remove picked fight'
  );
  if v_receipt->>'picks_preserved' <> '1'
    or v_receipt->>'repicks_required' <> 'false'
    or not exists (
      select 1 from public.profile_event_picks
      where profile_id = v_member
        and event_id = v_event
        and bout_id = 'remove-picked'
    )
    or not exists (
      select 1 from public.pick_card_change_actions
      where action_id = (v_receipt->>'audit_id')::bigint
        and action_type = 'remove_bout_from_picks'
        and before_state->>'red_fighter_slug' = 'remove-picked-red'
        and after_state->>'included_in_picks' = 'false'
    ) then
    raise exception 'picked fight removal did not preserve evidence: %', v_receipt;
  end if;

  begin
    perform public.approve_pick_bout_inclusion(
      v_event,
      'remove-locked',
      false,
      true,
      'remove-locked-red',
      'remove-locked-blue',
      'Reject locked removal'
    );
    raise exception 'locked fight was removed';
  exception when others then
    if sqlerrm not like '%PROHIBITED:%locked fight%' then raise; end if;
  end;
  begin
    perform public.approve_pick_bout_inclusion(
      v_event,
      'remove-resulted',
      false,
      true,
      'remove-resulted-red',
      'remove-resulted-blue',
      'Reject resulted removal'
    );
    raise exception 'resulted fight was removed';
  exception when others then
    if sqlerrm not like '%PROHIBITED:%resulted fight%' then raise; end if;
  end;

  -- 12-14 and 24-25. Replacement retains bout identity, invalidates every
  -- selection on the changed matchup, creates deterministic repick evidence,
  -- and cannot touch locked/resulted fights.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_event := 'canonical-replace';
  perform pg_temp.create_pick_event(
    v_event, now() + interval '8 hours', now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'replace-empty', 1, now() + interval '3 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'replace-picked', 2, now() + interval '4 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'replace-locked', 3, now() - interval '1 minute'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'replace-resulted', 4, now() + interval '5 hours'
  );
  update public.pick_bouts
  set result_status = 'blue_win',
      winner_fighter_slug = 'replace-resulted-blue',
      result_recorded_at = now()
  where event_id = v_event and bout_id = 'replace-resulted';
  insert into public.profile_event_picks(
    profile_id, event_id, bout_id, fighter_slug
  ) values
    (v_member, v_event, 'replace-picked', 'replace-picked-red'),
    (v_other, v_event, 'replace-picked', 'replace-picked-blue');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.approve_pick_fighter_replacement(
    v_event,
    'replace-empty',
    'blue',
    'replace-empty-red',
    'replace-empty-blue',
    'replace-empty-new',
    'Replace Empty New',
    'Replace before picks'
  );
  if not exists (
    select 1 from public.pick_bouts
    where event_id = v_event
      and bout_id = 'replace-empty'
      and blue_fighter_slug = 'replace-empty-new'
  ) then
    raise exception 'empty replacement did not retain the bout identity';
  end if;

  perform public.approve_pick_fighter_replacement(
    v_event,
    'replace-picked',
    'red',
    'replace-picked-red',
    'replace-picked-blue',
    'replace-picked-new',
    'Replace Picked New',
    'Replace with existing picks'
  );
  select action_id, receipt into v_action, v_receipt
  from public.pick_card_change_actions
  where event_id = v_event
    and bout_id = 'replace-picked'
    and action_type = 'replace_fighter'
  order by action_id desc
  limit 1;
  if v_receipt->>'picks_invalidated' <> '2'
    or v_receipt->>'repicks_required' <> 'true'
    or jsonb_array_length(v_receipt->'player_action_profile_ids') <> 2
    or exists (
      select 1 from public.profile_event_picks
      where event_id = v_event and bout_id = 'replace-picked'
    )
    or v_receipt->>'notification_count' <> '2' then
    raise exception 'replacement repick contract is not deterministic: %',
      v_receipt;
  end if;

  begin
    perform public.approve_pick_fighter_replacement(
      v_event,
      'replace-locked',
      'red',
      'replace-locked-red',
      'replace-locked-blue',
      'replace-locked-new',
      'Replace Locked New',
      'Reject locked replacement'
    );
    raise exception 'locked replacement succeeded';
  exception when others then
    if sqlerrm not like '%PROHIBITED:%open pending included%' then raise; end if;
  end;
  begin
    perform public.approve_pick_fighter_replacement(
      v_event,
      'replace-resulted',
      'red',
      'replace-resulted-red',
      'replace-resulted-blue',
      'replace-resulted-new',
      'Replace Resulted New',
      'Reject resulted replacement'
    );
    raise exception 'resulted replacement succeeded';
  exception when others then
    if sqlerrm not like '%PROHIBITED:%open pending included%' then raise; end if;
  end;

  -- 15-18. Reorder is presentation-only. Picks and deadlines remain attached
  -- to stable bout IDs; locked slots cannot move while open slots can.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_event := 'canonical-reorder-open';
  perform pg_temp.create_pick_event(
    v_event, now() + interval '8 hours', now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'order-a', 1, now() + interval '2 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'order-b', 2, now() + interval '3 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'order-c', 3, now() + interval '4 hours'
  );
  insert into public.profile_event_picks(
    profile_id, event_id, bout_id, fighter_slug
  ) values (
    v_member, v_event, 'order-a', 'order-a-red'
  );
  v_old_lock := (
    select locks_at from public.pick_bouts
    where event_id = v_event and bout_id = 'order-a'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_receipt := public.approve_pick_card_reorder(
    v_event,
    array['order-a','order-b','order-c'],
    array['order-c','order-a','order-b'],
    'Reorder an open card'
  );
  if v_receipt->>'card_order_changed' <> 'true'
    or (
      select array_agg(bout_id order by position)
      from public.pick_bouts where event_id = v_event
    ) <> array['order-c','order-a','order-b']
    or (
      select locks_at from public.pick_bouts
      where event_id = v_event and bout_id = 'order-a'
    ) is distinct from v_old_lock
    or not exists (
      select 1 from public.profile_event_picks
      where profile_id = v_member
        and event_id = v_event
        and bout_id = 'order-a'
        and fighter_slug = 'order-a-red'
    ) then
    raise exception 'open reorder moved stable Picks ownership';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_event := 'canonical-reorder-partial';
  perform pg_temp.create_pick_event(
    v_event, now() + interval '8 hours', now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'partial-locked', 1, now() - interval '1 minute'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'partial-a', 2, now() + interval '3 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'partial-b', 3, now() + interval '4 hours'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_receipt := public.approve_pick_card_reorder(
    v_event,
    array['partial-locked','partial-a','partial-b'],
    array['partial-locked','partial-b','partial-a'],
    'Reorder open slots only'
  );
  if (
    select array_agg(bout_id order by position)
    from public.pick_bouts where event_id = v_event
  ) <> array['partial-locked','partial-b','partial-a'] then
    raise exception 'partial-card open-slot reorder failed';
  end if;

  select count(*) into v_before_count
  from public.pick_card_change_actions
  where event_id = v_event;
  begin
    perform public.approve_pick_card_reorder(
      v_event,
      array['partial-locked','partial-b','partial-a'],
      array['partial-b','partial-locked','partial-a'],
      'Reject moving a locked slot'
    );
    raise exception 'locked slot moved during reorder';
  exception when others then
    if sqlerrm not like '%PROHIBITED:%exact card slots%' then raise; end if;
  end;
  select count(*) into v_after_count
  from public.pick_card_change_actions
  where event_id = v_event;
  if v_before_count <> v_after_count then
    raise exception 'failed reorder left a partial audit mutation';
  end if;

  -- 19-21. A future open fight may move earlier or later. Past proposals fail
  -- closed, while the owner may explicitly reopen a passed pending fight.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_event := 'canonical-bout-deadline';
  perform pg_temp.create_pick_event(
    v_event, now() + interval '8 hours', now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'deadline-open', 1, now() + interval '5 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'deadline-locked', 2, now() - interval '1 minute'
  );
  insert into public.profile_event_picks(
    profile_id, event_id, bout_id, fighter_slug
  ) values (
    v_member, v_event, 'deadline-open', 'deadline-open-red'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.adjust_pick_bout_lock_time(
    v_event, 'deadline-open', now() + interval '4 hours'
  );
  if (
    select locks_at from public.pick_bouts
    where event_id = v_event and bout_id = 'deadline-open'
  ) > now() + interval '4 hours 1 minute' then
    raise exception 'safe earlier bout deadline was not applied';
  end if;

  begin
    perform public.adjust_pick_bout_lock_time(
      v_event, 'deadline-open', now() - interval '1 minute'
    );
    raise exception 'past bout deadline was accepted';
  exception when others then
    if sqlerrm not like '%PROHIBITED:%safely in the future%' then raise; end if;
  end;

  perform public.adjust_pick_bout_lock_time(
    v_event, 'deadline-open', now() + interval '6 hours'
  );
  perform public.adjust_pick_bout_lock_time(
    v_event, 'deadline-locked', now() + interval '6 hours'
  );
  if not exists (
    select 1 from public.pick_bouts
    where event_id = v_event
      and bout_id = 'deadline-locked'
      and locks_at > now() + interval '5 hours 59 minutes'
  ) then
    raise exception 'passed pending bout was not explicitly reopened';
  end if;
  if not exists (
    select 1
    from public.pick_card_change_actions
    where event_id = v_event
      and bout_id = 'deadline-open'
      and action_type = 'adjust_bout_lock_time'
      and receipt->>'deadlines_changed' = 'true'
      and receipt->>'picks_preserved' = '1'
  ) then
    raise exception 'bout deadline audit/receipt was not stored';
  end if;

  -- 22-23. The event deadline moves open synchronized fights, but never reopens
  -- an inherited or explicit fight that is already locked.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_event := 'canonical-event-deadline-open';
  v_old_lock := now() + interval '6 hours';
  v_new_lock := now() + interval '5 hours';
  perform pg_temp.create_pick_event(
    v_event, v_old_lock, now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'master-a', 1, v_old_lock
  );
  perform pg_temp.create_pick_bout(
    v_event, 'master-explicit', 2, now() + interval '7 hours'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.adjust_pick_event_lock_time(
    v_event, v_new_lock, v_old_lock, 'Move open master deadline'
  );
  if (
    select locks_at from public.pick_bouts
    where event_id = v_event and bout_id = 'master-a'
  ) is distinct from v_new_lock
    or (
      select locks_at from public.pick_bouts
      where event_id = v_event and bout_id = 'master-explicit'
    ) is not distinct from v_new_lock then
    raise exception 'master deadline overwrote an explicit fight deadline';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_event := 'canonical-event-deadline-partial';
  v_old_lock := now() - interval '1 hour';
  v_new_lock := now() + interval '2 hours';
  perform pg_temp.create_pick_event(
    v_event, v_old_lock, now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'master-inherited-locked', 1, null
  );
  perform pg_temp.create_pick_bout(
    v_event, 'master-open-explicit', 2, now() + interval '4 hours'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.adjust_pick_event_lock_time(
    v_event, v_new_lock, v_old_lock, 'Protect locked inherited fight'
  );
  if (
    select locks_at from public.pick_bouts
    where event_id = v_event
      and bout_id = 'master-inherited-locked'
  ) is distinct from v_old_lock
    or not (
      select private.pick_bout_is_locked(event, bout)
      from public.pick_events event
      join public.pick_bouts bout on bout.event_id = event.event_id
      where event.event_id = v_event
        and bout.bout_id = 'master-inherited-locked'
    ) then
    raise exception 'later master deadline reopened an inherited locked fight';
  end if;

  -- 26-30. One monitored approval stores before/after audit evidence, resolves
  -- the finding transactionally, returns a complete receipt, queues one notice,
  -- and replays idempotently without a second mutation or notification.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_event := 'canonical-monitoring-receipt';
  perform pg_temp.create_pick_event(
    v_event, now() + interval '8 hours', now() + interval '1 day'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'monitor-a', 1, now() + interval '3 hours'
  );
  perform pg_temp.create_pick_bout(
    v_event, 'monitor-b', 2, now() + interval '4 hours'
  );
  insert into public.profile_event_picks(
    profile_id, event_id, bout_id, fighter_slug
  ) values (
    v_member, v_event, 'monitor-a', 'monitor-a-red'
  );

  insert into public.pick_monitoring_runs(
    trigger_kind,
    status,
    source_event_identity,
    event_id,
    observed_locks_at,
    started_at,
    completed_at,
    provider_event_count,
    complete_snapshot_count,
    missing_snapshot_count,
    diagnostics
  ) values (
    'manual',
    'completed',
    'ufc:canonical-monitoring-receipt',
    v_event,
    (select locks_at from public.pick_events where event_id = v_event),
    now() - interval '1 minute',
    now(),
    1,
    1,
    0,
    '[]'::jsonb
  ) returning run_id into v_run;

  insert into public.pick_monitoring_findings(
    run_id,
    event_id,
    finding_key,
    finding_type,
    severity,
    review_status,
    matchup_identity,
    bout_id,
    summary,
    before_value,
    after_value,
    source_details,
    detected_at
  ) values (
    v_run,
    v_event,
    'canonical-remove-monitor-a',
    'card_change',
    'warning',
    'new',
    'monitor-a-red|monitor-a-blue',
    'monitor-a',
    'Remove Monitor A from Picks.',
    jsonb_build_object('included_in_picks', true),
    jsonb_build_object('included_in_picks', false),
    jsonb_build_object(
      'finding_identity', 'bout:monitor-a:included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout',
        'event_id', v_event,
        'bout_id', 'monitor-a',
        'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'monitor-a-red',
        'expected_blue_fighter_slug', 'monitor-a-blue'
      )
    ),
    now()
  ) returning finding_id into v_finding;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_receipt := public.approve_pick_monitoring_finding(
    v_finding, 'Approve monitored removal'
  );
  select count(*) into v_notification_count
  from private.notification_events event
  where event.recipient_profile_id = v_member
    and event.source_key like 'pick-fight-removed:%';

  v_repeat := public.approve_pick_monitoring_finding(
    v_finding, 'Approve monitored removal'
  );
  if v_repeat is distinct from v_receipt
    or v_receipt->>'finding_id' <> v_finding::text
    or v_receipt->>'finding_resolved' <> 'true'
    or v_receipt->>'mutation_occurred' <> 'true'
    or v_receipt->>'picks_preserved' <> '1'
    or v_receipt->>'picks_invalidated' <> '0'
    or v_receipt->>'repicks_required' <> 'false'
    or v_receipt->>'deadlines_changed' <> 'false'
    or v_receipt->>'card_order_changed' <> 'false'
    or v_receipt->>'notification_recorded' <> 'true'
    or v_receipt->>'audit_id' is null
    or v_receipt->'before_value' is null
    or v_receipt->'after_value' is null
    or not exists (
      select 1 from public.pick_monitoring_findings
      where finding_id = v_finding
        and review_status = 'reviewed'
        and approval_receipt = v_receipt
    )
    or (
      select count(*) from private.notification_events event
      where event.recipient_profile_id = v_member
        and event.source_key like 'pick-fight-removed:%'
    ) <> v_notification_count then
    raise exception 'monitoring receipt/idempotency contract failed: %', v_receipt;
  end if;

  -- A stale expected state rejects before mutation and leaves the finding open.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  insert into public.pick_monitoring_runs(
    trigger_kind,
    status,
    source_event_identity,
    event_id,
    observed_locks_at,
    started_at,
    completed_at,
    provider_event_count,
    complete_snapshot_count,
    missing_snapshot_count,
    diagnostics
  ) values (
    'manual',
    'completed',
    'ufc:canonical-monitoring-stale',
    v_event,
    (select locks_at from public.pick_events where event_id = v_event),
    now() + interval '1 minute',
    now() + interval '1 minute',
    1,
    1,
    0,
    '[]'::jsonb
  ) returning run_id into v_run;

  insert into public.pick_monitoring_findings(
    run_id,event_id,finding_key,finding_type,severity,review_status,
    bout_id,summary,before_value,after_value,source_details,detected_at
  ) values (
    v_run,
    v_event,
    'canonical-stale-monitor-b',
    'card_change',
    'warning',
    'new',
    'monitor-b',
    'Remove stale Monitor B.',
    jsonb_build_object('included_in_picks', true),
    jsonb_build_object('included_in_picks', false),
    jsonb_build_object(
      'finding_identity', 'bout:monitor-b:included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout',
        'event_id', v_event,
        'bout_id', 'monitor-b',
        'expected_included_in_picks', false,
        'expected_red_fighter_slug', 'monitor-b-red',
        'expected_blue_fighter_slug', 'monitor-b-blue'
      )
    ),
    now() + interval '1 minute'
  ) returning finding_id into v_finding;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  begin
    perform public.approve_pick_monitoring_finding(
      v_finding, 'Reject stale monitoring state'
    );
    raise exception 'stale monitoring finding mutated the card';
  exception when others then
    if sqlerrm not like '%STALE_STATE:%fight state changed%' then raise; end if;
  end;
  if not exists (
    select 1 from public.pick_monitoring_findings
    where finding_id = v_finding
      and review_status = 'new'
      and approval_receipt is null
  ) or not exists (
    select 1 from public.pick_bouts
    where event_id = v_event
      and bout_id = 'monitor-b'
      and included_in_picks
  ) then
    raise exception 'failed monitoring mutation left partial state';
  end if;

  -- 31-33. Automatic odds remains a separate owner, and the dispatcher/public
  -- adapters converge on exactly one private mutation engine.
  select pg_get_functiondef(
    'public.approve_pick_monitoring_finding(uuid,text)'::regprocedure
  ) into v_definition;
  if position('private.apply_pick_fight_change' in v_definition) = 0
    or position('apply_pick_monitoring_odds' in v_definition) > 0
    or position('update public.pick_bouts' in lower(v_definition)) > 0
    or position('update public.pick_events' in lower(v_definition)) > 0 then
    raise exception 'monitoring dispatcher bypasses the canonical fight-change owner';
  end if;

  select pg_get_functiondef(
    'public.approve_pick_bout_inclusion(text,text,boolean,boolean,text,text,text)'::regprocedure
  ) into v_definition;
  if position('private.apply_pick_fight_change' in v_definition) = 0 then
    raise exception 'bout inclusion has a competing mutation path';
  end if;
  select pg_get_functiondef(
    'public.approve_pick_fighter_replacement(text,text,text,text,text,text,text,text)'::regprocedure
  ) into v_definition;
  if position('private.apply_pick_fight_change' in v_definition) = 0 then
    raise exception 'fighter replacement has a competing mutation path';
  end if;
  select pg_get_functiondef(
    'public.approve_pick_card_reorder(text,text[],text[],text)'::regprocedure
  ) into v_definition;
  if position('private.apply_pick_fight_change' in v_definition) = 0 then
    raise exception 'card reorder has a competing mutation path';
  end if;
  select pg_get_functiondef(
    'public.adjust_pick_bout_lock_time(text,text,timestamptz)'::regprocedure
  ) into v_definition;
  if position('private.apply_pick_fight_change' in v_definition) = 0 then
    raise exception 'bout deadline has a competing mutation path';
  end if;
  select pg_get_functiondef(
    'public.adjust_pick_event_lock_time(text,timestamptz,timestamptz,text)'::regprocedure
  ) into v_definition;
  if position('private.apply_pick_fight_change' in v_definition) = 0 then
    raise exception 'event deadline has a competing mutation path';
  end if;

  if (
    select count(*)
    from pg_proc procedure
    join pg_namespace namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'private'
      and procedure.proname = 'apply_pick_fight_change'
  ) <> 1 then
    raise exception 'canonical fight-change engine is duplicated';
  end if;
end;
$$;

rollback;
