begin;

select set_config('request.jwt.claim.role','service_role',true);

do $field_lock$
declare
  v_a uuid := extensions.gen_random_uuid();
  v_b uuid := extensions.gen_random_uuid();
  v_joined_midweek uuid := extensions.gen_random_uuid();
  v_joined_after_lock uuid := extensions.gen_random_uuid();
  v_gate jsonb;
  v_state jsonb;
  v_count integer;
begin
  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values
    (v_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','weekly-field-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WEEKLY FIELD A','historical_unclaimed',true)),
    (v_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','weekly-field-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WEEKLY FIELD B','historical_unclaimed',true)),
    (v_joined_midweek,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','weekly-field-mid@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WEEKLY FIELD MID','historical_unclaimed',true)),
    (v_joined_after_lock,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','weekly-field-late@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WEEKLY FIELD LATE','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_a,'Weekly Field A','WA');
  perform public.register_unclaimed_pin_profile(v_b,'Weekly Field B','WB');
  perform public.register_unclaimed_pin_profile(v_joined_midweek,'Weekly Field Mid','WM');
  perform public.register_unclaimed_pin_profile(v_joined_after_lock,'Weekly Field Late','WL');

  update public.profiles
  set created_at = case id
    when v_a then '2026-09-01 12:00:00+00'::timestamptz
    when v_b then '2026-09-02 12:00:00+00'::timestamptz
    when v_joined_midweek then '2026-09-18 01:00:00+00'::timestamptz
    when v_joined_after_lock then '2026-09-22 06:00:00+00'::timestamptz
    else created_at
  end
  where id in (v_a,v_b,v_joined_midweek,v_joined_after_lock);

  -- Seed the launch field exactly as production was frozen: A and B were already in.
  perform private.materialize_football_weekly_auction_week(date '2026-09-15');

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  ) values
    (date '2026-09-15',v_a,'2026-09-15 00:00:00 America/Chicago'::timestamptz,'test_launch'),
    (date '2026-09-15',v_b,'2026-09-15 00:00:00 America/Chicago'::timestamptz,'test_launch')
  on conflict (week_start,profile_id) do nothing;

  update private.football_weekly_auction_weeks
  set field_locked_at='2026-09-15 00:00:00 America/Chicago'::timestamptz
  where week_start=date '2026-09-15';

  -- Sep 22 carries A/B and adds only the profile created before the Tuesday lock.
  perform private.materialize_football_weekly_auction_week(date '2026-09-22');
  perform private.materialize_football_weekly_auction_participants(date '2026-09-22');

  select count(*)::integer
  into v_count
  from private.football_weekly_auction_participants
  where week_start=date '2026-09-22';

  if v_count <> 3
    or not exists (
      select 1 from private.football_weekly_auction_participants
      where week_start=date '2026-09-22' and profile_id=v_a
    )
    or not exists (
      select 1 from private.football_weekly_auction_participants
      where week_start=date '2026-09-22' and profile_id=v_b
    )
    or not exists (
      select 1 from private.football_weekly_auction_participants
      where week_start=date '2026-09-22' and profile_id=v_joined_midweek
    )
    or exists (
      select 1 from private.football_weekly_auction_participants
      where week_start=date '2026-09-22' and profile_id=v_joined_after_lock
    )
  then
    raise exception 'Sep 22 Weekly Auction field did not carry prior players and add only pre-lock joins';
  end if;

  v_gate := public.football_weekly_auction_daily_gate(
    v_joined_midweek,
    '2026-09-22 12:00:00-05'::timestamptz
  );
  if (v_gate->>'available')::boolean is distinct from true
    or (v_gate->>'required')::boolean is distinct from true then
    raise exception 'eligible Weekly Auction participant was not gated before Daily: %', v_gate;
  end if;

  v_gate := public.football_weekly_auction_daily_gate(
    v_joined_after_lock,
    '2026-09-22 12:00:00-05'::timestamptz
  );
  if (v_gate->>'available')::boolean is distinct from false
    or (v_gate->>'required')::boolean is distinct from false
    or (v_gate->>'eligible_week_start')::date is distinct from date '2026-09-29' then
    raise exception 'midweek join was not bypassed to Football Daily until next week: %', v_gate;
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_joined_after_lock::text,true);

  v_state := public.get_my_football_weekly_auction('2026-09-22 12:00:00-05'::timestamptz);
  if (v_state->>'available')::boolean is distinct from false
    or (v_state->>'locked_this_week')::boolean is distinct from true
    or (v_state->>'eligible_week_start')::date is distinct from date '2026-09-29' then
    raise exception 'midweek join saw an active Weekly Auction board: %', v_state;
  end if;

  begin
    perform public.submit_my_football_weekly_auction_bids(
      '{"1":1,"2":1,"3":1}'::jsonb,
      '2026-09-22 12:00:00-05'::timestamptz
    );
    raise exception 'nonparticipant bid was accepted';
  exception
    when others then
      if sqlerrm = 'nonparticipant bid was accepted'
        or position('Weekly Auction field is locked for this week' in sqlerrm) = 0 then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform set_config('request.jwt.claim.sub','',true);

  -- The post-lock profile joins at the following Tuesday boundary.
  perform private.materialize_football_weekly_auction_week(date '2026-09-29');
  perform private.materialize_football_weekly_auction_participants(date '2026-09-29');

  if not exists (
    select 1
    from private.football_weekly_auction_participants
    where week_start=date '2026-09-29'
      and profile_id=v_joined_after_lock
  ) then
    raise exception 'post-lock profile did not enter the next Weekly Auction field';
  end if;
end;
$field_lock$;

rollback;

\echo 'Football Weekly Auction field-lock proof passed.'
