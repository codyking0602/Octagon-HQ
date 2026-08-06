begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_starts_at timestamptz := date_trunc('minute', now() + interval '7 days');
  v_new_bout_id text;
  v_order text[];
  v_positions integer[];
  v_locks timestamptz[];
  v_result jsonb;
begin
  update public.pick_events
  set status = 'complete', completed_at = coalesce(completed_at, now())
  where status in ('upcoming', 'locked');

  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_owner, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'picks-owner-workflow@login.octagon-hq.app', '',
    now(), now(), now(),
    jsonb_build_object(
      'display_name', 'PICKS OWNER WORKFLOW',
      'historical_unclaimed', true
    )
  );
  perform public.register_unclaimed_pin_profile(v_owner, 'Picks Owner', 'PW');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status
  ) values (
    'owner-workflow', 'UFC Owner Workflow', 'Alpha vs Beta',
    'Arena', 'Dallas', v_starts_at, v_starts_at,
    2200, 'upcoming'
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    result_status, included_in_picks,
    card_segment, segment_sequence, locks_at
  ) values
    (
      'owner-workflow', 'owner-a', 1, 'Lightweight',
      'alpha', 'Alpha', 'beta', 'Beta',
      'pending', true, 'main', 3, v_starts_at + interval '60 minutes'
    ),
    (
      'owner-workflow', 'owner-b', 2, 'Welterweight',
      'gamma', 'Gamma', 'delta', 'Delta',
      'pending', true, 'main', 2, v_starts_at + interval '30 minutes'
    ),
    (
      'owner-workflow', 'owner-c', 3, 'Middleweight',
      'epsilon', 'Epsilon', 'phi', 'Phi',
      'pending', true, 'main', 1, v_starts_at
    ),
    (
      'owner-workflow', 'owner-private-removed', 4, 'Heavyweight',
      'gimel', 'Gimel', 'heta', 'Heta',
      'pending', false, 'main', null, v_starts_at
    );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);

  -- Reordering is one atomic card operation: positions and deadline slots move together.
  perform public.approve_pick_card_reorder(
    'owner-workflow',
    array['owner-a', 'owner-b', 'owner-c'],
    array['owner-c', 'owner-a', 'owner-b'],
    'Owner confirmed live fight order change'
  );

  select array_agg(bout_id order by position),
         array_agg(position order by position),
         array_agg(locks_at order by position)
  into v_order, v_positions, v_locks
  from public.pick_bouts
  where event_id = 'owner-workflow'
    and included_in_picks;

  if v_order is distinct from array['owner-c', 'owner-a', 'owner-b'] then
    raise exception 'reorder did not persist the exact active card order: %', v_order;
  end if;
  if v_positions is distinct from array[1,2,3] then
    raise exception 'reorder left active position gaps: %', v_positions;
  end if;
  if v_locks is distinct from array[
    v_starts_at + interval '60 minutes',
    v_starts_at + interval '30 minutes',
    v_starts_at
  ] then
    raise exception 'reorder did not move position-owned lock slots: %', v_locks;
  end if;

  -- A manual fight addition uses the same active card and deadline owner.
  v_result := public.approve_pick_bout_addition(
    'owner-workflow',
    array['owner-c', 'owner-a', 'owner-b'],
    'Iota', 'Kappa', 'Featherweight', 'main', 2,
    'Owner confirmed fight addition to Picks'
  );
  v_new_bout_id := v_result->>'bout_id';
  if coalesce(v_new_bout_id, '') = '' then
    raise exception 'fight addition did not return its canonical bout identity';
  end if;

  select array_agg(bout_id order by position),
         array_agg(position order by position),
         array_agg(locks_at order by position)
  into v_order, v_positions, v_locks
  from public.pick_bouts
  where event_id = 'owner-workflow'
    and included_in_picks;

  if v_order is distinct from array['owner-c', v_new_bout_id, 'owner-a', 'owner-b'] then
    raise exception 'fight addition did not enter the requested active position: %', v_order;
  end if;
  if v_positions is distinct from array[1,2,3,4] then
    raise exception 'fight addition left active position gaps: %', v_positions;
  end if;
  if v_locks is distinct from array[
    v_starts_at + interval '90 minutes',
    v_starts_at + interval '60 minutes',
    v_starts_at + interval '30 minutes',
    v_starts_at
  ] then
    raise exception 'fight addition did not recalculate all position-owned locks: %', v_locks;
  end if;

  -- Removal keeps private evidence but removes the row from the active card and
  -- closes the resulting order/deadline gap in the same transaction.
  perform public.approve_pick_bout_inclusion(
    'owner-workflow',
    'owner-a',
    false,
    true,
    'alpha',
    'beta',
    'Owner confirmed fight removal from Picks'
  );

  select array_agg(bout_id order by position),
         array_agg(position order by position),
         array_agg(locks_at order by position)
  into v_order, v_positions, v_locks
  from public.pick_bouts
  where event_id = 'owner-workflow'
    and included_in_picks;

  if v_order is distinct from array['owner-c', v_new_bout_id, 'owner-b'] then
    raise exception 'removed fight remained on the active card: %', v_order;
  end if;
  if v_positions is distinct from array[1,2,3] then
    raise exception 'removal left active position gaps: %', v_positions;
  end if;
  if v_locks is distinct from array[
    v_starts_at + interval '60 minutes',
    v_starts_at + interval '30 minutes',
    v_starts_at
  ] then
    raise exception 'removal did not recalculate position-owned locks: %', v_locks;
  end if;
  if not exists (
    select 1 from public.pick_bouts
    where event_id = 'owner-workflow'
      and bout_id = 'owner-a'
      and included_in_picks = false
  ) then
    raise exception 'removed fight private audit row was deleted';
  end if;

  if (
    select count(*) from public.pick_card_change_actions
    where event_id = 'owner-workflow'
      and action_type in ('reorder_card', 'add_bout_to_picks', 'remove_bout_from_picks')
  ) <> 3 then
    raise exception 'owner workflow did not retain one audit action per confirmed mutation';
  end if;

  -- Expected-state guards remain fail-closed after membership changed.
  begin
    perform public.approve_pick_bout_addition(
      'owner-workflow',
      array['owner-c', v_new_bout_id, 'owner-a', 'owner-b'],
      'Lambda', 'Mu', 'Bantamweight', 'main', 2,
      'Stale attempted addition'
    );
    raise exception 'stale addition unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%card membership changed%' then raise; end if;
  end;
end;
$$;

rollback;
